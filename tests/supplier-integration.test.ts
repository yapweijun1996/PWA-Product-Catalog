import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildProducts, parseCatalogText, suggestMapping } from '../src/importer';
import {
  createEmptyQuote,
  createQuoteLine,
  recalculateDraft,
} from '../src/domain';
import type { QuoteDraft } from '../src/types';

describe('Representative synthetic B2B supplier-shaped integration', () => {
  const csvContent = readFileSync('tests/fixtures/realistic-supplier-catalog.csv', 'utf8');
  const jsonContent = readFileSync('tests/fixtures/realistic-supplier-catalog.json', 'utf8');

  it('parses and auto-maps the 15-item industrial supplier CSV catalog', () => {
    const parsed = parseCatalogText(csvContent, 'realistic-supplier-catalog.csv');
    expect(parsed.parserErrors).toHaveLength(0);
    expect(parsed.rows).toHaveLength(15);
    expect(parsed.headers).toContain('SKU');
    expect(parsed.headers).toContain('Product Name');
    expect(parsed.headers).toContain('Price');
    expect(parsed.headers).toContain('Category');
    expect(parsed.headers).toContain('Material Grade');

    const mapping = suggestMapping(parsed.headers);
    expect(mapping.sku).toBe('SKU');
    expect(mapping.name).toBe('Product Name');
    expect(mapping.price).toBe('Price');
    expect(mapping.category).toBe('Category');
    expect(mapping.unit).toBe('Unit');
    expect(mapping.description).toBe('Description');

    const { products, issues } = buildProducts(parsed.rows, mapping, 'USD');
    expect(issues).toHaveLength(0);
    expect(products).toHaveLength(15);

    // Verify rich specifications extraction
    const pump = products.find((p) => p.sku === 'PUMP-IND-200');
    expect(pump).toBeDefined();
    expect(pump?.priceMinor).toBe(145000);
    expect(pump?.specifications['Material Grade']).toBe('316L Stainless');
    expect(pump?.specifications['Operating Rating']).toBe('120 m3/h @ 8 bar');
    expect(pump?.specifications['Certification']).toBe('ISO 9001 / CE');
    expect(pump?.specifications['Lead Time']).toBe('3-5 business days');
  });

  it('parses and maps the JSON supplier catalog', () => {
    const parsed = parseCatalogText(jsonContent, 'realistic-supplier-catalog.json');
    expect(parsed.parserErrors).toHaveLength(0);
    expect(parsed.rows).toHaveLength(3);

    const mapping = suggestMapping(parsed.headers);
    const { products, issues } = buildProducts(parsed.rows, mapping, 'USD');
    expect(issues).toHaveLength(0);
    expect(products).toHaveLength(3);
    expect(products[0].sku).toBe('PUMP-IND-200');
    expect(products[1].sku).toBe('VALV-BAL-050');
  });

  it('builds a formal B2B quotation with commercial terms, tiered discounts and exact financial totals', () => {
    const parsed = parseCatalogText(csvContent, 'realistic-supplier-catalog.csv');
    const mapping = suggestMapping(parsed.headers);
    const { products } = buildProducts(parsed.rows, mapping, 'USD');

    const pump = products.find((p) => p.sku === 'PUMP-IND-200')!;
    const valve = products.find((p) => p.sku === 'VALV-BAL-050')!;
    const motor = products.find((p) => p.sku === 'MOTR-IE3-400')!;
    const gasket = products.find((p) => p.sku === 'SEAL-GSK-080')!;

    const emptyQuote = createEmptyQuote('USD', 9); // 9% GST tax
    const line1 = { ...createQuoteLine(pump, emptyQuote.id, 2), taxRateSnapshot: 9, discountSnapshot: 5 }; // 5% line discount on pumps
    const line2 = { ...createQuoteLine(valve, emptyQuote.id, 4), taxRateSnapshot: 9, discountSnapshot: 0 };
    const line3 = { ...createQuoteLine(motor, emptyQuote.id, 1), taxRateSnapshot: 9, discountSnapshot: 10 }; // 10% on motor
    const line4 = { ...createQuoteLine(gasket, emptyQuote.id, 20), taxRateSnapshot: 9, discountSnapshot: 0 };

    const draft: QuoteDraft = recalculateDraft({
      ...emptyQuote,
      customer: 'Apex Precision Engineering Pte Ltd',
      validUntil: '2026-10-31',
      quoteDiscount: 2.5, // 2.5% additional commercial discount
      notes: '1. Payment terms: 30 days net from invoice date.\n2. Delivery: EXW Singapore Warehouse (1-2 weeks).\n3. Standard manufacturer warranty: 12 months.\n4. Price includes 9% Singapore GST.',
      lines: [line1, line2, line3, line4],
    });

    expect(draft.lines).toHaveLength(4);
    // Calculations:
    // Line 1: 1450.00 * 2 = 2900.00 - 5% = 2755.00 (275500 minor)
    expect(draft.lines[0].lineTotalMinor).toBe(275500);
    // Line 2: 320.00 * 4 = 1280.00 (128000 minor)
    expect(draft.lines[1].lineTotalMinor).toBe(128000);
    // Line 3: 410.00 * 1 = 410.00 - 10% = 369.00 (36900 minor)
    expect(draft.lines[2].lineTotalMinor).toBe(36900);
    // Line 4: 18.20 * 20 = 364.00 (36400 minor)
    expect(draft.lines[3].lineTotalMinor).toBe(36400);

    // Subtotal = 2755.00 + 1280.00 + 369.00 + 364.00 = 4768.00 (476800 minor)
    expect(draft.totals.subtotalMinor).toBe(476800);
    // Quote discount 2.5%: 4768.00 * 0.025 = 119.20 (11920 minor)
    expect(draft.totals.discountMinor).toBe(11920);
    // Taxable net: 4768.00 - 119.20 = 4648.80. 9% tax = 418.39 (41839 minor)
    expect(draft.totals.taxMinor).toBe(41839);
    // Total = 4648.80 + 418.39 = 5067.19 (506719 minor)
    expect(draft.totals.totalMinor).toBe(506719);
  });
});
