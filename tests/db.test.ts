import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createBackup, restoreBackup } from '../src/backup';
import { clearAllData, db, deleteQuote, duplicateQuote, getActiveCatalog, listQuotes, loadDraft, replaceCatalog, saveDraft } from '../src/db';
import { createEmptyQuote, createQuoteLine, recalculateDraft } from '../src/domain';
import type { Product } from '../src/types';

const product = (id: string, priceMinor: number): Product => ({
  id, catalogVersionId: 'pending', sku: id.toUpperCase(), name: `Product ${id}`, description: '', category: 'Test', unit: 'each',
  priceMinor, currency: 'USD', specifications: {}, sourceRow: 2, importedAt: '', updatedAt: '',
});

beforeEach(async () => {
  await clearAllData();
});

describe('IndexedDB persistence', () => {
  it('replaces a catalog atomically and keeps the prior catalog after a failed commit', async () => {
    await replaceCatalog([product('p-1', 1000)], 'first.csv');
    await expect(replaceCatalog([product('p-1', 2000), product('p-1', 3000)], 'broken.csv')).rejects.toThrow();
    const active = await getActiveCatalog();
    expect(active).toHaveLength(1);
    expect(active[0].priceMinor).toBe(1000);
  });

  it('restores a valid backup and rejects malformed data before replacement', async () => {
    await replaceCatalog([product('p-1', 1000)], 'first.csv');
    const backup = await createBackup();
    await clearAllData();
    await restoreBackup({ text: async () => JSON.stringify(backup) } as File);
    expect((await getActiveCatalog())[0].priceMinor).toBe(1000);

    await expect(restoreBackup({ text: async () => '{"format":"wrong"}' } as File)).rejects.toThrow('Unsupported backup format');
    expect((await getActiveCatalog())[0].priceMinor).toBe(1000);
  });

  it('duplicates and deletes quote history without losing line snapshots', async () => {
    await replaceCatalog([product('p-1', 1000)], 'first.csv');
    const savedProduct = (await getActiveCatalog())[0];
    const quote = createEmptyQuote('USD', 0);
    await saveDraft(recalculateDraft({ ...quote, lines: [createQuoteLine(savedProduct, quote.id)] }));
    const copy = await duplicateQuote(quote.id);
    expect(copy.status).toBe('draft');
    expect(copy.lines[0].unitPriceMinorSnapshot).toBe(1000);
    expect((await listQuotes())).toHaveLength(2);
    await deleteQuote(copy.id);
    expect((await listQuotes())).toHaveLength(1);
  });

  it('keeps quote snapshots after catalog changes', async () => {
    await replaceCatalog([product('p-1', 1000)], 'first.csv');
    const savedProduct = (await getActiveCatalog())[0];
    const quote = createEmptyQuote('USD', 0);
    const draft = recalculateDraft({ ...quote, lines: [createQuoteLine(savedProduct, quote.id)] });
    await saveDraft(draft);
    await db.products.update(savedProduct.id, { priceMinor: 9000 });
    const loaded = await loadDraft();
    expect(loaded?.lines[0].unitPriceMinorSnapshot).toBe(1000);
  });
});
