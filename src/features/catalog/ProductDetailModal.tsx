import { useEffect } from 'react';
import { Icon } from '../../icons';
import { formatMoney } from '../../domain';
import type { Product } from '../../types';
import type { Labels } from '../../i18n/translations';

interface ProductDetailModalProps {
  product: Product | null;
  labels: Labels;
  onClose: () => void;
  onAdd: (product: Product) => Promise<void>;
}

export function ProductDetailModal({ product, labels, onClose, onAdd }: ProductDetailModalProps) {
  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="detail-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="detail-panel" role="dialog" aria-modal="true" aria-labelledby="product-detail-title">
        <button className="icon-button detail-close" onClick={onClose} aria-label={labels.close}>
          <Icon name="close" />
        </button>
        <span className="product-category">{product.category}</span>
        <h3 id="product-detail-title">{product.name}</h3>
        <p>{product.description}</p>
        <p className="detail-price-row">
          <b>{labels.sku}:</b> {product.sku} · <b>{labels.price}:</b>{' '}
          {formatMoney(product.priceMinor, product.currency)} / {product.unit}
        </p>
        <div className="detail-specs">
          {Object.entries(product.specifications).map(([key, value]) => (
            <div key={key}>
              <b>{key}</b>
              <span>{value}</span>
            </div>
          ))}
        </div>
        <button
          className="button button-full"
          onClick={() => {
            void onAdd(product);
          }}
        >
          {labels.add}
        </button>
      </section>
    </div>
  );
}
