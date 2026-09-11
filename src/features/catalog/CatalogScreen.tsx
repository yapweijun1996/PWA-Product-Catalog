import { useMemo, useState } from 'react';
import { Icon } from '../../icons';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { FloatingQuoteBar } from './FloatingQuoteBar';
import type { CatalogVersion, Product, QuoteDraft } from '../../types';
import type { Labels } from '../../i18n/translations';

interface CatalogScreenProps {
  products: Product[];
  version: CatalogVersion | null;
  labels: Labels;
  draft: QuoteDraft | null;
  onAdd: (product: Product) => Promise<void>;
  onLoadDemo: () => Promise<void>;
  onViewQuote: () => void;
}

export function CatalogScreen({
  products,
  version,
  labels,
  draft,
  onAdd,
  onLoadDemo,
  onViewQuote,
}: CatalogScreenProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Product | null>(null);

  const categories = useMemo(() => {
    const set = new Set(products.map((product) => product.category));
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return products.filter((product) => {
      const matchCategory = category === 'All' || product.category === category;
      if (!matchCategory) return false;
      if (!q) return true;
      const haystack = `${product.name} ${product.sku} ${product.category} ${product.description} ${Object.entries(
        product.specifications
      )
        .flat()
        .join(' ')}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [products, query, category]);

  return (
    <section className="screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">{labels.productWorkspace}</p>
          <h2>{labels.catalog}</h2>
          <p className="muted">
            {products.length} {labels.products} ·{' '}
            {version
              ? `${version.sourceName} · ${new Date(version.importedAt).toLocaleString()}`
              : labels.local}
          </p>
        </div>
        <button className="button button-secondary" onClick={() => void onLoadDemo()}>
          {labels.loadDemo}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="add" />
          </div>
          <h3>{labels.emptyTitle}</h3>
          <p>{labels.emptyHelp}</p>
          <button className="button" onClick={() => (window.location.hash = 'settings')}>
            {labels.importTitle}
          </button>
        </div>
      ) : (
        <>
          <div className="catalog-toolbar">
            <div className="search-field-wrapper">
              <label className="search-field">
                <Icon name="search" />
                <input
                  name="catalog-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={labels.search}
                  aria-label={labels.search}
                />
                {query && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => setQuery('')}
                    aria-label={labels.clearSearch}
                  >
                    <Icon name="close" />
                  </button>
                )}
              </label>
            </div>

            <div className="chip-row" aria-label={labels.categories}>
              {categories.map((item) => {
                const count = categoryCounts[item];
                return (
                  <button
                    key={item}
                    className={category === item ? 'chip is-selected' : 'chip'}
                    onClick={() => setCategory(item)}
                  >
                    <span>{item === 'All' ? labels.allCategories : item}</span>
                    {count !== undefined && <span className="chip-count">({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state compact">
              <h3>{labels.noResults}</h3>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  labels={labels}
                  onView={setSelected}
                  onAdd={onAdd}
                />
              ))}
            </div>
          )}

          <ProductDetailModal
            product={selected}
            labels={labels}
            onClose={() => setSelected(null)}
            onAdd={onAdd}
          />

          <FloatingQuoteBar draft={draft} labels={labels} onViewQuote={onViewQuote} />
        </>
      )}
    </section>
  );
}
