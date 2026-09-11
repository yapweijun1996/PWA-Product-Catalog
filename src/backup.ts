import { db, DEFAULT_SETTINGS, getSettings } from './db';
import type { CompanySettings } from './types';

interface BackupPayload {
  format: 'pwa-product-catalog-backup';
  schemaVersion: 1;
  exportedAt: string;
  products: unknown[];
  catalogVersions: unknown[];
  quotes: unknown[];
  quoteLines: unknown[];
  settings: CompanySettings;
}

export async function createBackup(): Promise<BackupPayload> {
  return {
    format: 'pwa-product-catalog-backup',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    products: await db.products.toArray(),
    catalogVersions: await db.catalogVersions.toArray(),
    quotes: await db.quotes.toArray(),
    quoteLines: await db.quoteLines.toArray(),
    settings: await getSettings(),
  };
}

export async function downloadBackup(): Promise<void> {
  const payload = await createBackup();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `product-catalog-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function restoreBackup(file: File): Promise<void> {
  const candidate: unknown = JSON.parse(await file.text());
  if (!candidate || typeof candidate !== 'object') throw new Error('Backup must be an object.');
  const backup = candidate as Partial<BackupPayload>;
  if (backup.format !== 'pwa-product-catalog-backup' || backup.schemaVersion !== 1) {
    throw new Error('Unsupported backup format.');
  }
  if (!Array.isArray(backup.products) || !Array.isArray(backup.catalogVersions) || !Array.isArray(backup.quotes) || !Array.isArray(backup.quoteLines)) {
    throw new Error('Backup is missing required collections.');
  }
  const settings = backup.settings && typeof backup.settings === 'object'
    ? { ...DEFAULT_SETTINGS, ...backup.settings }
    : DEFAULT_SETTINGS;

  await db.transaction('rw', db.products, db.catalogVersions, db.quotes, db.quoteLines, db.settings, async () => {
    await db.products.clear();
    await db.catalogVersions.clear();
    await db.quotes.clear();
    await db.quoteLines.clear();
    await db.settings.clear();
    await db.products.bulkAdd(backup.products as never[]);
    await db.catalogVersions.bulkAdd(backup.catalogVersions as never[]);
    await db.quotes.bulkAdd(backup.quotes as never[]);
    await db.quoteLines.bulkAdd(backup.quoteLines as never[]);
    await db.settings.put(settings);
  });
}
