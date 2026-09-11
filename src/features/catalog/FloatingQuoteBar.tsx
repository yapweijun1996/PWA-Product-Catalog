import { Icon } from '../../icons';
import { formatMoney } from '../../domain';
import type { QuoteDraft } from '../../types';
import type { Labels } from '../../i18n/translations';

interface FloatingQuoteBarProps {
  draft: QuoteDraft | null;
  labels: Labels;
  onViewQuote: () => void;
}

export function FloatingQuoteBar({ draft, labels, onViewQuote }: FloatingQuoteBarProps) {
  if (!draft || draft.lines.length === 0) return null;

  const totalQuantity = draft.lines.reduce((acc, line) => acc + line.quantity, 0);

  return (
    <div className="floating-quote-bar" role="region" aria-label={labels.quote}>
      <div className="floating-quote-content">
        <div className="floating-quote-info">
          <span className="floating-quote-count">
            <strong>{totalQuantity}</strong> {labels.itemsInQuote}
          </span>
          <span className="floating-quote-total">
            {formatMoney(draft.totals.totalMinor, draft.currency)}
          </span>
        </div>
        <button className="button button-accent floating-quote-btn" onClick={onViewQuote}>
          <span>{labels.viewQuote}</span>
          <Icon name="arrowRight" />
        </button>
      </div>
    </div>
  );
}
