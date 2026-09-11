import Dexie, { type Table } from 'dexie';
import type {
  CatalogVersion,
  CompanySettings,
  Product,
  Quote,
  QuoteDraft,
  QuoteLine,
} from './types';

export const DEFAULT_SETTINGS: CompanySettings = {
  id: 'default',
  companyName: 'Your Company',
  address: '',
  contact: '',
  defaultCurrency: 'USD',
  defaultTaxRate: 0,
  language: 'en',
  logoDataUrl: '',
};

class ProductCatalogDatabase extends Dexie {
  products!: Table<Product, string>;
  catalogVersions!: Table<CatalogVersion, string>;
  quotes!: Table<Quote, string>;
  quoteLines!: Table<QuoteLine, string>;
  settings!: Table<CompanySettings, string>;

  constructor() {
    super('pwa-product-catalog');
    this.version(1).stores({
      products: 'id, catalogVersionId, sku, name, category, priceMinor',
      catalogVersions: 'id, status, importedAt',
      quotes: 'id, quoteNumber, status, updatedAt',
      quoteLines: 'id, quoteId, productId',
      settings: 'id',
    });
  }
}

export const db = new ProductCatalogDatabase();

export async function getSettings(): Promise<CompanySettings> {
  const saved = await db.settings.get('default');
  return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: CompanySettings): Promise<void> {
  await db.settings.put(settings);
}

export async function getActiveCatalog(): Promise<Product[]> {
  const version = await db.catalogVersions.where('status').equals('active').first();
  if (!version) return [];
  return db.products.where('catalogVersionId').equals(version.id).toArray();
}

export async function getActiveCatalogVersion(): Promise<CatalogVersion | undefined> {
  return db.catalogVersions.where('status').equals('active').first();
}

export async function replaceCatalog(
  products: Product[],
  sourceName: string,
): Promise<CatalogVersion> {
  const importedAt = new Date().toISOString();
  const version: CatalogVersion = {
    id: crypto.randomUUID(),
    sourceName,
    importedAt,
    productCount: products.length,
    status: 'active',
    schemaVersion: 1,
  };
  const versionedProducts = products.map((product) => ({
    ...product,
    catalogVersionId: version.id,
    importedAt,
    updatedAt: importedAt,
  }));

  await db.transaction('rw', db.catalogVersions, db.products, async () => {
    const previous = await db.catalogVersions.where('status').equals('active').first();
    if (previous) await db.catalogVersions.update(previous.id, { status: 'archived' });
    await db.catalogVersions.add(version);
    await db.products.bulkAdd(versionedProducts);
  });

  return version;
}

export async function loadDraft(): Promise<QuoteDraft | null> {
  const drafts = await db.quotes.where('status').equals('draft').toArray();
  const quote = drafts.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];
  if (!quote) return null;
  const lines = await db.quoteLines.where('quoteId').equals(quote.id).toArray();
  return { ...quote, lines };
}

export async function saveDraft(draft: QuoteDraft): Promise<void> {
  await db.transaction('rw', db.quotes, db.quoteLines, async () => {
    const { lines: _lines, ...quote } = draft;
    await db.quotes.put(quote);
    await db.quoteLines.where('quoteId').equals(draft.id).delete();
    if (draft.lines.length) await db.quoteLines.bulkAdd(draft.lines);
  });
}

export async function listQuotes(): Promise<Quote[]> {
  return db.quotes.orderBy('updatedAt').reverse().toArray();
}

export async function loadQuote(quoteId: string): Promise<QuoteDraft | null> {
  const quote = await db.quotes.get(quoteId);
  if (!quote) return null;
  const lines = await db.quoteLines.where('quoteId').equals(quoteId).toArray();
  return { ...quote, lines };
}

export async function duplicateQuote(quoteId: string): Promise<QuoteDraft> {
  const source = await loadQuote(quoteId);
  if (!source) throw new Error('Quote not found.');
  const now = new Date().toISOString();
  const copy: QuoteDraft = {
    ...source,
    id: crypto.randomUUID(),
    quoteNumber: `Q-${Date.now()}`,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    lines: source.lines.map((line) => ({ ...line, id: crypto.randomUUID(), quoteId: '' })),
  };
  copy.lines = copy.lines.map((line) => ({ ...line, quoteId: copy.id }));
  await saveDraft(copy);
  return copy;
}

export async function deleteQuote(quoteId: string): Promise<void> {
  await db.transaction('rw', db.quotes, db.quoteLines, async () => {
    await db.quotes.delete(quoteId);
    await db.quoteLines.where('quoteId').equals(quoteId).delete();
  });
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.products, db.catalogVersions, db.quotes, db.quoteLines, db.settings, async () => {
    await Promise.all([
      db.products.clear(),
      db.catalogVersions.clear(),
      db.quotes.clear(),
      db.quoteLines.clear(),
      db.settings.clear(),
    ]);
  });
}
