export type Language = 'en' | 'zh-Hans' | 'ms' | 'vi' | 'ja';
export type QuoteStatus = 'draft' | 'exported' | 'shared';

export interface Product {
  id: string;
  catalogVersionId: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  priceMinor: number;
  currency: string;
  specifications: Record<string, string>;
  sourceRow: number;
  importedAt: string;
  updatedAt: string;
}

export interface CatalogVersion {
  id: string;
  sourceName: string;
  importedAt: string;
  productCount: number;
  status: 'active' | 'archived';
  schemaVersion: number;
}

export interface QuoteLine {
  id: string;
  quoteId: string;
  productId: string;
  skuSnapshot: string;
  nameSnapshot: string;
  unitSnapshot: string;
  unitPriceMinorSnapshot: number;
  taxRateSnapshot: number;
  discountSnapshot: number;
  quantity: number;
  lineTotalMinor: number;
}

export interface QuoteTotals {
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customer: string;
  currency: string;
  status: QuoteStatus;
  issueDate: string;
  validUntil: string;
  notes: string;
  quoteDiscount: number;
  totals: QuoteTotals;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteDraft extends Quote {
  lines: QuoteLine[];
}

export interface CompanySettings {
  id: 'default';
  companyName: string;
  address: string;
  contact: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  language: Language;
  logoDataUrl: string;
}

export type ImportField = 'sku' | 'name' | 'price' | 'category' | 'unit' | 'description';
export type ImportMapping = Record<ImportField, string>;

export interface ParsedRows {
  headers: string[];
  rows: Record<string, unknown>[];
  parserErrors: string[];
}

export interface ImportIssue {
  row: number;
  field: string;
  message: string;
}
