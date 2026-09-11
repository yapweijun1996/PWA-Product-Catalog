import { Icon } from '../../icons';
import { formatMoney, validatePercentage, validateQuantity } from '../../domain';
import { QuantityStepper } from './QuantityStepper';
import type { Quote, QuoteDraft } from '../../types';
import type { Labels } from '../../i18n/translations';

interface QuoteScreenProps {
  draft: QuoteDraft | null;
  quotes: Quote[];
  labels: Labels;
  onChange: (change: (value: QuoteDraft) => QuoteDraft) => Promise<void>;
  onExport: () => Promise<void>;
  onShare: () => Promise<void>;
  onOpen: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function QuoteScreen({
  draft,
  quotes,
  labels,
  onChange,
  onExport,
  onShare,
  onOpen,
  onDuplicate,
  onDelete,
}: QuoteScreenProps) {
  return (
    <section className="screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">{labels.salesDocument}</p>
          <h2>{labels.quotes}</h2>
          <p className="muted">{draft?.quoteNumber ?? labels.quoteEmpty}</p>
        </div>
        {draft?.lines.length ? (
          <div className="card-actions">
            <button className="button button-secondary" onClick={() => void onShare()}>
              {labels.share}
            </button>
            <button className="button" onClick={() => void onExport()}>
              {labels.exportPdf}
            </button>
          </div>
        ) : null}
      </div>

      {draft?.lines.length ? (
        <div className="quote-layout">
          <div className="quote-editor card">
            <div className="form-grid">
              <label>
                <span>{labels.customer}</span>
                <input
                  name="customer"
                  value={draft.customer}
                  onChange={(event) =>
                    void onChange((value) => ({ ...value, customer: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>{labels.validUntil}</span>
                <input
                  name="valid-until"
                  type="date"
                  value={draft.validUntil}
                  onChange={(event) =>
                    void onChange((value) => ({ ...value, validUntil: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>{labels.discount}</span>
                <input
                  name="quote-discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={draft.quoteDiscount}
                  onChange={(event) =>
                    void onChange((value) => ({
                      ...value,
                      quoteDiscount: Number(event.target.value),
                    }))
                  }
                />
              </label>
            </div>

            <div className="quote-lines">
              {draft.lines.map((line) => (
                <div className="quote-line" key={line.id}>
                  <div className="quote-line-info">
                    <b>{line.nameSnapshot}</b>
                    <small>
                      {line.skuSnapshot} · {formatMoney(line.unitPriceMinorSnapshot, draft.currency)}{' '}
                      / {line.unitSnapshot}
                    </small>
                  </div>

                  <div className="quote-line-controls">
                    <div className="line-field">
                      <span className="field-mini-label">{labels.quantity}</span>
                      <QuantityStepper
                        name={`quantity-${line.id}`}
                        value={line.quantity}
                        min={0.01}
                        step={1}
                        isInvalid={Boolean(validateQuantity(line.quantity))}
                        ariaLabel={`${labels.quantityFor} ${line.nameSnapshot}`}
                        decreaseLabel={`${labels.decreaseQuantity}: ${line.nameSnapshot}`}
                        increaseLabel={`${labels.increaseQuantity}: ${line.nameSnapshot}`}
                        onChange={(qty) =>
                          void onChange((value) => ({
                            ...value,
                            lines: value.lines.map((candidate) =>
                              candidate.id === line.id ? { ...candidate, quantity: qty } : candidate
                            ),
                          }))
                        }
                      />
                    </div>

                    <div className="line-field">
                      <span className="field-mini-label">{labels.lineDiscount}</span>
                      <label className="quantity">
                        <span className="sr-only">
                          {labels.discount} {line.nameSnapshot}
                        </span>
                        <input
                          name={`line-discount-${line.id}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={line.discountSnapshot}
                          onChange={(event) =>
                            void onChange((value) => ({
                              ...value,
                              lines: value.lines.map((candidate) =>
                                candidate.id === line.id
                                  ? { ...candidate, discountSnapshot: Number(event.target.value) }
                                  : candidate
                              ),
                            }))
                          }
                          aria-invalid={Boolean(validatePercentage(line.discountSnapshot))}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="quote-line-total">
                    <span className="field-mini-label">{labels.lineTotal}</span>
                    <strong>{formatMoney(line.lineTotalMinor, draft.currency)}</strong>
                  </div>

                  <button
                    className="icon-button"
                    onClick={() =>
                      void onChange((value) => ({
                        ...value,
                        lines: value.lines.filter((candidate) => candidate.id !== line.id),
                      }))
                    }
                    aria-label={`${labels.remove} ${line.nameSnapshot}`}
                  >
                    <Icon name="close" />
                  </button>
                </div>
              ))}
            </div>

            <label>
              <span>{labels.notes}</span>
              <textarea
                name="quote-notes"
                rows={4}
                value={draft.notes}
                onChange={(event) =>
                  void onChange((value) => ({ ...value, notes: event.target.value }))
                }
              />
            </label>
            <p className="saved-note">
              <span className="saved-dot" aria-hidden="true" />
              {labels.save}
            </p>
          </div>

          <aside className="totals-card card">
            <p className="eyebrow">{labels.quote}</p>
            <div>
              <span>{labels.subtotal}</span>
              <strong>{formatMoney(draft.totals.subtotalMinor, draft.currency)}</strong>
            </div>
            <div>
              <span>{labels.discount}</span>
              <strong className="discount-value">
                − {formatMoney(draft.totals.discountMinor, draft.currency)}
              </strong>
            </div>
            <div>
              <span>{labels.tax}</span>
              <strong>{formatMoney(draft.totals.taxMinor, draft.currency)}</strong>
            </div>
            <div className="grand-total">
              <span>{labels.total}</span>
              <strong>{formatMoney(draft.totals.totalMinor, draft.currency)}</strong>
            </div>
          </aside>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="quote" />
          </div>
          <h3>{labels.quoteEmpty}</h3>
          <p>{labels.quoteEmptyHelp}</p>
          <button className="button" onClick={() => (window.location.hash = 'catalog')}>
            {labels.catalog}
          </button>
        </div>
      )}

      {quotes.length > 0 && (
        <div className="history card">
          <h3>{labels.history}</h3>
          {quotes.map((quote) => (
            <div className="history-row" key={quote.id}>
              <span>
                <b>{quote.quoteNumber}</b>
                <small>
                  {quote.customer || labels.draft} ·{' '}
                  {quote.status === 'draft'
                    ? labels.draft
                    : quote.status === 'exported'
                    ? labels.statusExported
                    : labels.statusShared}
                </small>
              </span>
              <strong>{formatMoney(quote.totals.totalMinor, quote.currency)}</strong>
              <div className="card-actions">
                <button
                  className="button button-small button-secondary"
                  onClick={() => void onOpen(quote.id)}
                >
                  {labels.open}
                </button>
                <button
                  className="button button-small button-secondary"
                  onClick={() => void onDuplicate(quote.id)}
                >
                  {labels.duplicate}
                </button>
                <button
                  className="button button-small button-danger"
                  onClick={() => void onDelete(quote.id)}
                >
                  {labels.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
