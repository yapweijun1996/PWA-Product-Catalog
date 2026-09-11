import { describe, expect, it } from 'vitest';
import { calculateTotals, calculateLineNet, createEmptyQuote, createQuoteLine, getQuoteValidationErrors, recalculateDraft, validatePercentage, validateQuantity } from '../src/domain';
import type { Product, QuoteDraft, QuoteLine } from '../src/types';

const product: Product = {
  id: 'p-1', catalogVersionId: 'c-1', sku: 'SKU-1', name: 'Test product', description: '', category: 'Test', unit: 'each',
  priceMinor: 1000, currency: 'USD', specifications: {}, sourceRow: 2, importedAt: '', updatedAt: '',
};

const line: QuoteLine = {
  id: 'line-1', quoteId: 'quote-1', productId: 'p-1', skuSnapshot: 'SKU-1', nameSnapshot: 'Test product', unitSnapshot: 'each',
  unitPriceMinorSnapshot: 1000, taxRateSnapshot: 10, discountSnapshot: 10, quantity: 2, lineTotalMinor: 0,
};

describe('quote pricing', () => {
  it('calculates line discount, quote discount, tax, and total deterministically', () => {
    expect(calculateLineNet(line)).toBe(1800);
    expect(calculateTotals([line], 5)).toEqual({ subtotalMinor: 1800, discountMinor: 90, taxMinor: 171, totalMinor: 1881 });
  });

  it('creates a quote line from a product snapshot', () => {
    const result = createQuoteLine(product, 'quote-1', 3);
    expect(result).toMatchObject({ productId: 'p-1', skuSnapshot: 'SKU-1', unitPriceMinorSnapshot: 1000, quantity: 3, lineTotalMinor: 3000 });
  });

  it('recalculates line totals without changing snapshots', () => {
    const draft: QuoteDraft = {
      id: 'quote-1', quoteNumber: 'Q-1', customer: '', currency: 'USD', status: 'draft', issueDate: '2026-01-01', validUntil: '', notes: '',
      quoteDiscount: 0, totals: calculateTotals([line]), createdAt: '', updatedAt: '', lines: [{ ...line, lineTotalMinor: 999 }],
    };
    const result = recalculateDraft(draft);
    expect(result.lines[0].lineTotalMinor).toBe(1800);
    expect(result.lines[0].unitPriceMinorSnapshot).toBe(1000);
  });

  it('rejects invalid quantity precision and percentage bounds', () => {
    expect(validateQuantity(0)).toBeTruthy();
    expect(validateQuantity(1.234)).toContain('decimal');
    expect(validateQuantity(100001)).toContain('exceed');
    expect(validateQuantity(2.5)).toBeNull();
    expect(validatePercentage(101)).toBeTruthy();
    expect(validatePercentage(10)).toBeNull();
    expect(getQuoteValidationErrors({ ...createEmptyQuote('USD', 0), lines: [{ ...line, discountSnapshot: 101 }] })).toEqual(expect.arrayContaining([expect.stringContaining('Percentage must be between 0 and 100.')]));
  });
});
