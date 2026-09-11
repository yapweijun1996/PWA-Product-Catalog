import { useMemo, useState } from 'react';
import { buildProducts, IMPORT_FIELDS, parseCatalogText, suggestMapping } from '../../importer';
import { replaceCatalog } from '../../store';
import type { ImportField, ImportMapping, ParsedRows } from '../../types';
import type { Labels } from '../../i18n/translations';
import type { Notice } from '../../components/common/Toast';

export function localizeImportIssue(message: string, labels: Labels): string {
  const translations: Record<string, string> = {
    'The file is empty.': labels.fileEmpty,
    'JSON must contain an array of product objects.': labels.jsonInvalid,
    'The JSON file could not be parsed.': labels.jsonParseFailed,
    'SKU is required.': labels.skuRequired,
    'Product name is required.': labels.productNameRequired,
    'Price must be a non-negative number.': labels.priceInvalid,
    'Duplicate SKU.': labels.duplicateSku,
  };
  if (message.startsWith('Row ')) {
    return `${labels.parserError} ${message.slice(message.indexOf(':') + 1).trim()}`;
  }
  return translations[message] ?? message;
}

interface ImportPanelProps {
  currency: string;
  labels: Labels;
  onImported: () => Promise<void>;
  onNotice: (notice: Notice) => void;
}

export function ImportPanel({ currency, labels, onImported, onNotice }: ImportPanelProps) {
  const [filename, setFilename] = useState('');
  const [parsed, setParsed] = useState<ParsedRows | null>(null);
  const [mapping, setMapping] = useState<ImportMapping | null>(null);

  const result = parsed && mapping ? buildProducts(parsed.rows, mapping, currency) : null;
  const parserIssues =
    parsed?.parserErrors.map((message) => ({ row: 0, field: 'file', message })) ?? [];
  const issues = [...parserIssues, ...(result?.issues ?? [])];

  // Helper to extract a sample non-empty value for each header
  const headerSamples = useMemo(() => {
    if (!parsed || !parsed.rows.length) return {};
    const samples: Record<string, string> = {};
    for (const header of parsed.headers) {
      for (const row of parsed.rows) {
        const val = row[header];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          samples[header] = String(val).slice(0, 30);
          break;
        }
      }
    }
    return samples;
  }, [parsed]);

  return (
    <div className="card import-panel">
      <h3>{labels.importTitle}</h3>
      <p className="muted">{labels.importHelp}</p>
      <label className="file-button button button-secondary">
        {labels.chooseFile}
        <input
          name="catalog-file"
          type="file"
          accept=".csv,.json,text/csv,application/json"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setFilename(file.name);
            const next = parseCatalogText(await file.text(), file.name);
            setParsed(next);
            setMapping(suggestMapping(next.headers));
          }}
        />
      </label>

      {parsed && mapping && (
        <>
          <div className="mapping-header">
            <h4>{labels.mapping}</h4>
            <span className={issues.length ? 'badge badge-error' : 'badge badge-success'}>
              {issues.length ? labels.importErrors : labels.importReady}
            </span>
          </div>
          <p className="muted">{labels.mappingHelp}</p>

          <div className="mapping-grid">
            {IMPORT_FIELDS.map((field: ImportField) => {
              const selectedHeader = mapping[field];
              const sample = selectedHeader ? headerSamples[selectedHeader] : null;
              return (
                <label key={field} className="mapping-field-label">
                  <span>
                    {labels[field]}
                    {field === 'sku' || field === 'name' || field === 'price'
                      ? ` (${labels.required})`
                      : ''}
                  </span>
                  <select
                    name={`mapping-${field}`}
                    value={mapping[field]}
                    onChange={(event) => setMapping({ ...mapping, [field]: event.target.value })}
                  >
                    <option value="">—</option>
                    {parsed.headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                  {sample ? (
                    <small className="mapping-sample" title={sample}>
                      {labels.samplePreview}: &quot;{sample}&quot;
                    </small>
                  ) : null}
                </label>
              );
            })}
          </div>

          {issues.length > 0 && (
            <ul className="issue-list">
              {issues.slice(0, 8).map((issue, index) => (
                <li key={`${issue.field}-${issue.row}-${index}`}>
                  {issue.row ? `${labels.row} ${issue.row} · ` : ''}
                  <b>{labels[issue.field as keyof Labels] ?? issue.field}</b>:{' '}
                  {localizeImportIssue(issue.message, labels)}
                </li>
              ))}
              {issues.length > 8 && (
                <li>
                  + {issues.length - 8} {labels.more}
                </li>
              )}
            </ul>
          )}

          <div className="preview-box">
            <b>{labels.preview}</b>
            <span>
              {filename} · {parsed.rows.length} {labels.rows} · {result?.products.length ?? 0}{' '}
              {labels.validProducts}
            </span>
          </div>

          <button
            className="button"
            disabled={issues.length > 0 || !result?.products.length}
            onClick={async () => {
              if (!result || issues.length) return;
              await replaceCatalog(result.products, filename);
              await onImported();
              onNotice({
                tone: 'success',
                message: `${labels.imported} ${result.products.length} ${labels.products}.`,
              });
              setParsed(null);
              setMapping(null);
            }}
          >
            {labels.commit}
          </button>
        </>
      )}
    </div>
  );
}
