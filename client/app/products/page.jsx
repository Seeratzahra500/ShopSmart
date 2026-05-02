'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import PageWrapper from '@/components/PageWrapper';
import ProductGrid from '@/components/ProductGrid';
import api from '@/lib/api';
import { useStore } from '@/context/StoreContext';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Food & Beverages', 'Home & Living', 'Beauty', 'Books', 'Sports', 'Toys'];

function ProductsContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { store }    = useStore();

  const [products, setProducts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);

  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';
  const page     = Number(searchParams.get('page') || 1);

  const [searchInput, setSearchInput] = useState(search);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search)   params.set('search', search);
      if (category) params.set('category', category);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const pushParam = (key, value) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    router.push(`/products?${p.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    pushParam('search', searchInput.trim());
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          {total > 0 && !loading && (
            <p className="text-sm text-gray-500 mt-1">{total} product{total !== 1 ? 's' : ''} found</p>
          )}
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products…"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
            <button
              type="submit"
              className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); pushParam('search', ''); }}
                className="px-3 py-2 text-gray-500 hover:text-gray-800 text-sm border border-gray-300 rounded-lg"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => {
            const active = cat === 'All' ? !category : category === cat;
            return (
              <button
                key={cat}
                onClick={() => pushParam('category', cat === 'All' ? '' : cat)}
                className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
                style={active
                  ? { backgroundColor: 'var(--color-brand)', color: '#fff', borderColor: 'var(--color-brand)' }
                  : { backgroundColor: '#fff', color: '#374151', borderColor: '#d1d5db' }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <ProductGrid products={products} loading={loading} columns={store?.gridColumns || 3} currency={store?.currency} locale={store?.locale} />

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => { const params = new URLSearchParams(searchParams.toString()); params.set('page', p); router.push(`/products?${params.toString()}`); }}
                className="w-9 h-9 rounded-lg text-sm font-medium border transition-colors"
                style={p === page
                  ? { backgroundColor: 'var(--color-brand)', color: '#fff', borderColor: 'var(--color-brand)' }
                  : { backgroundColor: '#fff', color: '#374151', borderColor: '#d1d5db' }
                }
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default function ProductsPage() {
  return <Suspense><ProductsContent /></Suspense>;
}
