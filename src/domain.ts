import type { Product, QuoteDraft, QuoteLine, QuoteTotals } from './types';

export const MAX_QUANTITY = 100000;
export const QUANTITY_PRECISION = 2;

export function roundMinor(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function parsePriceMinor(value: string | number): number | null {
  const normalized = String(value).replace(/[$€£,\s]/g, '');
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

export function validateQuantity(value: number): string | null {
  if (!Number.isFinite(value) || value <= 0) return 'Quantity must be greater than zero.';
  if (value > MAX_QUANTITY) return `Quantity must not exceed ${MAX_QUANTITY}.`;
  const scale = 10 ** QUANTITY_PRECISION;
  if (Math.round(value * scale) !== value * scale) {
    return `Quantity supports up to ${QUANTITY_PRECISION} decimal places.`;
  }
  return null;
}

export function validatePercentage(value: number): string | null {
  if (!Number.isFinite(value) || value < 0 || value > 100) return 'Percentage must be between 0 and 100.';
  return null;
}

export function createQuoteLine(product: Product, quoteId: string, quantity = 1): QuoteLine {
  const line: QuoteLine = {
    id: crypto.randomUUID(),
    quoteId,
    productId: product.id,
    skuSnapshot: product.sku,
    nameSnapshot: product.name,
    unitSnapshot: product.unit,
    unitPriceMinorSnapshot: product.priceMinor,
    taxRateSnapshot: 0,
    discountSnapshot: 0,
    quantity,
    lineTotalMinor: 0,
  };
  return { ...line, lineTotalMinor: calculateLineNet(line) };
}

export function calculateLineNet(line: QuoteLine): number {
  if (validateQuantity(line.quantity) || validatePercentage(line.discountSnapshot)) return 0;
  const gross = line.unitPriceMinorSnapshot * line.quantity;
  const discount = Math.min(100, Math.max(0, line.discountSnapshot));
  return Math.round(gross * (1 - discount / 100));
}

export function calculateTotals(lines: QuoteLine[], quoteDiscount = 0): QuoteTotals {
  const subtotalMinor = lines.reduce((sum, line) => sum + calculateLineNet(line), 0);
  const discountRate = Math.min(100, Math.max(0, quoteDiscount));
  const discountMinor = Math.round(subtotalMinor * (discountRate / 100));
  const taxableLines = lines.reduce((sum, line) => {
    const net = calculateLineNet(line);
    return sum + Math.round(net * (1 - discountRate / 100) * (line.taxRateSnapshot / 100));
  }, 0);
  const taxMinor = taxableLines;
  return {
    subtotalMinor,
    discountMinor,
    taxMinor,
    totalMinor: subtotalMinor - discountMinor + taxMinor,
  };
}

export function getQuoteValidationErrors(draft: QuoteDraft): string[] {
  const errors = draft.lines.flatMap((line) => {
    const quantityError = validateQuantity(line.quantity);
    const discountError = validatePercentage(line.discountSnapshot);
    return [quantityError, discountError].filter(Boolean).map((error) => `${line.nameSnapshot}: ${error}`);
  });
  const quoteDiscountError = validatePercentage(draft.quoteDiscount);
  if (quoteDiscountError) errors.push(`Quote discount: ${quoteDiscountError}`);
  return errors;
}

export function recalculateDraft(draft: QuoteDraft): QuoteDraft {
  const lines = draft.lines.map((line) => ({
    ...line,
    lineTotalMinor: calculateLineNet(line),
  }));
  return {
    ...draft,
    lines,
    totals: calculateTotals(lines, draft.quoteDiscount),
    updatedAt: new Date().toISOString(),
  };
}

export function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(minor / 100);
}

export function createEmptyQuote(currency: string, taxRate: number): QuoteDraft {
  const now = new Date();
  const iso = now.toISOString();
  const date = iso.slice(0, 10).replaceAll('-', '');
  const time = iso.slice(11, 16).replace(':', '');
  return {
    id: crypto.randomUUID(),
    quoteNumber: `Q-${date}-${time}`,
    customer: '',
    currency,
    status: 'draft',
    issueDate: iso.slice(0, 10),
    validUntil: '',
    notes: '',
    quoteDiscount: 0,
    totals: calculateTotals([], 0),
    createdAt: iso,
    updatedAt: iso,
    lines: [],
  };
}

export function getDefaultTaxRate(taxRate: number): number {
  return Number.isFinite(taxRate) && taxRate >= 0 && taxRate <= 100 ? taxRate : 0;
}
