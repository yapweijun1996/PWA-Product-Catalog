import { describe, expect, it } from 'vitest';
import { buildProducts, parseCatalogText, suggestMapping } from '../src/importer';

describe('catalog importer', () => {
  it('parses CSV, suggests columns, and builds normalized products', () => {
    const parsed = parseCatalogText('SKU,Product Name,Price,Category\nA-1,Valve,12.50,Valves\n', 'catalog.csv');
    const mapping = suggestMapping(parsed.headers);
    const result = buildProducts(parsed.rows, mapping, 'USD');
    expect(parsed.parserErrors).toEqual([]);
    expect(mapping).toMatchObject({ sku: 'SKU', name: 'Product Name', price: 'Price', category: 'Category' });
    expect(result.issues).toEqual([]);
    expect(result.products[0]).toMatchObject({ sku: 'A-1', name: 'Valve', priceMinor: 1250, category: 'Valves', currency: 'USD' });
  });

  it('reports missing values and duplicate SKUs without silently overwriting', () => {
    const parsed = parseCatalogText('sku,name,price\nA-1,Valve,10\nA-1,Second valve,11\n,Missing SKU,12\n', 'catalog.csv');
    const result = buildProducts(parsed.rows, suggestMapping(parsed.headers), 'USD');
    expect(result.products).toHaveLength(1);
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ row: 3, field: 'sku', message: 'Duplicate SKU.' }),
      expect.objectContaining({ row: 4, field: 'sku', message: 'SKU is required.' }),
    ]));
  });

  it('accepts JSON product arrays', () => {
    const parsed = parseCatalogText(JSON.stringify([{ sku: 'A-1', name: 'Valve', price: 10 }]), 'catalog.json');
    const result = buildProducts(parsed.rows, suggestMapping(parsed.headers), 'USD');
    expect(result.issues).toEqual([]);
    expect(result.products[0].priceMinor).toBe(1000);
  });
});
