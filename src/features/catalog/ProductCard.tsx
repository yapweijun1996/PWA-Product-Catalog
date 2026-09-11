import { useState } from 'react';
import { formatMoney } from '../../domain';
import { Icon } from '../../icons';
import type { Product } from '../../types';
import type { Labels } from '../../i18n/translations';

interface ProductCardProps {
  product: Product;
  labels: Labels;
  onView: (product: Product) => void;
  onAdd: (product: Product) => Promise<void>;
}

export function ProductCard({ product, labels, onView, onAdd }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    await onAdd(product);
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <article className="product-card">
      <div className="product-card-top">
        <span className="product-category">{product.category}</span>
        <span className="product-sku">{product.sku}</span>
      </div>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="product-specs">
        {Object.entries(product.specifications).slice(0, 2).map(([key, value]) => (
          <span key={key}>
            <b>{key}</b>
            {value}
          </span>
        ))}
      </div>
      <div className="product-card-bottom">
        <strong className="product-price">
          {formatMoney(product.priceMinor, product.currency)}
          {product.unit ? <span className="product-unit"> / {product.unit}</span> : null}
        </strong>
        <div className="card-actions">
          <button
            className="button button-small button-secondary"
            onClick={() => onView(product)}
          >
            {labels.view}
          </button>
          <button
            className={`button button-small ${isAdding ? 'button-added' : ''}`}
            onClick={handleAdd}
          >
            {isAdding ? <Icon name="check" /> : <Icon name="add" />}
            {labels.add}
          </button>
        </div>
      </div>
    </article>
  );
}
