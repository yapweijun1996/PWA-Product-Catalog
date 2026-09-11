import Papa from 'papaparse';
import type { ImportField, ImportIssue, ImportMapping, ParsedRows, Product } from './types';
import { parsePriceMinor } from './domain';

export const IMPORT_FIELDS: ImportField[] = ['sku', 'name', 'price', 'category', 'unit', 'description'];

const aliases: Record<ImportField, string[]> = {
  sku: ['sku', 'itemcode', 'productcode', 'code', 'partnumber', '型号', '编码'],
  name: ['name', 'productname', 'title', 'description', '产品名称', '名称'],
  price: ['price', 'unitprice', 'sellingprice', 'amount', '售价', '价格', '单价'],
  category: ['category', 'group', 'type', '分类', '类别'],
  unit: ['unit', 'uom', '单位'],
  description: ['details', 'longdescription', 'specification', '规格', '说明'],
};

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[\s_\-()/.]/g, '');
}

function newId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function suggestMapping(headers: string[]): ImportMapping {
  const mapping = Object.fromEntries(IMPORT_FIELDS.map((field) => [field, ''])) as ImportMapping;
  for (const field of IMPORT_FIELDS) {
    const match = headers.find((header) => {
      const normalized = normalizeHeader(header);
      return aliases[field].some((alias) => normalized === normalizeHeader(alias));
    });
    if (match) mapping[field] = match;
  }
  return mapping;
}

export function parseCatalogText(text: string, filename: string): ParsedRows {
  const trimmed = text.trim();
  if (!trimmed) return { headers: [], rows: [], parserErrors: ['The file is empty.'] };

  if (filename.toLowerCase().endsWith('.json') || trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      const rows = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === 'object' && Array.isArray((parsed as { products?: unknown }).products)
          ? (parsed as { products: unknown[] }).products
          : [];
      if (!rows.length || rows.some((row) => !row || typeof row !== 'object' || Array.isArray(row))) {
        return { headers: [], rows: [], parserErrors: ['JSON must contain an array of product objects.'] };
      }
      const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row as Record<string, unknown>))));
      return { headers, rows: rows as Record<string, unknown>[], parserErrors: [] };
    } catch {
      return { headers: [], rows: [], parserErrors: ['The JSON file could not be parsed.'] };
    }
  }

  const result = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: 'greedy' });
  return {
    headers: result.meta.fields ?? [],
    rows: result.data,
    parserErrors: result.errors.map((error) => `Row ${error.row ?? '?'}: ${error.message}`),
  };
}

function valueFor(row: Record<string, unknown>, field: string): string {
  return field ? String(row[field] ?? '').trim() : '';
}

export function buildProducts(
  rows: Record<string, unknown>[],
  mapping: ImportMapping,
  currency: string,
  catalogVersionId = 'pending',
): { products: Product[]; issues: ImportIssue[] } {
  const issues: ImportIssue[] = [];
  const products: Product[] = [];
  const seenSkus = new Set<string>();

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const sku = valueFor(row, mapping.sku);
    const name = valueFor(row, mapping.name);
    const priceText = valueFor(row, mapping.price);
    const priceMinor = parsePriceMinor(priceText);

    const duplicateSku = sku ? seenSkus.has(sku.toLowerCase()) : false;
    if (!sku) issues.push({ row: rowNumber, field: 'sku', message: 'SKU is required.' });
    if (!name) issues.push({ row: rowNumber, field: 'name', message: 'Product name is required.' });
    if (priceMinor === null) issues.push({ row: rowNumber, field: 'price', message: 'Price must be a non-negative number.' });
    if (duplicateSku) issues.push({ row: rowNumber, field: 'sku', message: 'Duplicate SKU.' });
    if (sku) seenSkus.add(sku.toLowerCase());
    if (!sku || !name || priceMinor === null || duplicateSku) return;

    const mappedHeaders = new Set(Object.values(mapping).filter(Boolean));
    const specifications = Object.fromEntries(
      Object.entries(row)
        .filter(([header, value]) => !mappedHeaders.has(header) && String(value ?? '').trim())
        .map(([header, value]) => [header, String(value).trim()]),
    );

    products.push({
      id: newId(),
      catalogVersionId,
      sku,
      name,
      description: valueFor(row, mapping.description),
      category: valueFor(row, mapping.category) || 'Uncategorized',
      unit: valueFor(row, mapping.unit) || 'each',
      priceMinor,
      currency,
      specifications,
      sourceRow: rowNumber,
      importedAt: '',
      updatedAt: '',
    });
  });

  return { products, issues };
}
