import { useState } from 'react';
import { formatMoney } from '../../domain';
import { Icon } from '../../icons';
import type { Product } from '../../types';
import type { Labels } from '../../i18n/translations';

export function getCategoryTheme(category: string): { bg: string; color: string; border: string } {
  const themes = [
    { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' }, // sky
    { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' }, // emerald
    { bg: '#fef3c7', color: '#b45309', border: '#fde68a' }, // amber
    { bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' }, // purple
    { bg: '#fce7f3', color: '#be185d', border: '#fbcfe8' }, // pink
    { bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe' }, // indigo
    { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' }, // slate
  ];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash << 5) - hash + category.charCodeAt(i);
    hash |= 0;
  }
  return themes[Math.abs(hash) % themes.length];
}

export function getCategoryMonogram(category: string, name: string): string {
  const cleanCategory = category.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
  if (cleanCategory.length >= 2) {
    return cleanCategory.slice(0, 2).toUpperCase();
  }
  const cleanName = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
  return (cleanName.slice(0, 2) || 'PR').toUpperCase();
}

interface ProductCardProps {
  product: Product;
  labels: Labels;
  onView: (product: Product) => void;
  onAdd: (product: Product) => Promise<void>;
}

export function ProductCard({ product, labels, onView, onAdd }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const theme = getCategoryTheme(product.category);
  const monogram = getCategoryMonogram(product.category, product.name);

  const handleAdd = async () => {
    setIsAdding(true);
    await onAdd(product);
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <article className="product-card">
      <div className="product-card-header">
        <div
          className="product-avatar"
          style={{
            backgroundColor: theme.bg,
            color: theme.color,
            borderColor: theme.border,
          }}
          aria-hidden="true"
        >
          <span>{monogram}</span>
        </div>
        <div className="product-card-top">
          <span className="product-category" style={{ color: theme.color }}>
            {product.category}
          </span>
          <span className="product-sku">{product.sku}</span>
        </div>
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
