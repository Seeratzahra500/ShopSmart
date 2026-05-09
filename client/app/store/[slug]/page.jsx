'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import ProductGrid from '@/components/ProductGrid';
import { useStore } from '@/context/StoreContext';
import api from '@/lib/api';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Food & Beverages', 'Home & Living', 'Beauty', 'Books', 'Sports', 'Toys'];

function StoreContent() {
  const { slug }         = useParams();
  const router           = useRouter();
  const searchParams     = useSearchParams();
  const { store, loading: storeLoading } = useStore();

  const [products, setProducts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);

  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';
  const page     = Number(searchParams.get('page') || 1);
  const [searchInput, setSearchInput] = useState(search);

  const fetchProducts = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search)   params.set('search', search);
      if (category) params.set('category', category);
      const { data } = await api.get(`/stores/${slug}/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [slug, search, category, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const pushParam = (key, value) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    router.push(`/store/${slug}?${p.toString()}`);
  };

  if (storeLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse space-y-6">
        <div className="h-48 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <PageWrapper>
      {/* Hero */}
      {store && (
        <section
          className="relative overflow-hidden"
          style={{
            backgroundImage: store.heroImage ? `url(${store.heroImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: store.heroImage ? undefined : 'var(--color-brand)',
          }}
        >
          {store.heroImage && <div className="absolute inset-0 bg-black/40" />}
          <div className="relative max-w-7xl mx-auto px-4 py-16 text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {store.heroHeadline || store.name}
            </motion.h1>
            {store.tagline && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl opacity-90 mb-8 max-w-2xl mx-auto"
              >
                {store.tagline}
              </motion.p>
            )}
            <motion.a
              href="#products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-8 py-3 bg-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              style={{ color: 'var(--color-brand)', borderRadius: 'var(--border-radius-btn, 8px)' }}
            >
              {store.heroCta || 'Shop Now'}
            </motion.a>
          </div>
        </section>
      )}

      {/* Products */}
      <section id="products" className="max-w-7xl mx-auto px-4 py-10">
        {/* Search */}
        <div className="flex gap-2 mb-6 max-w-lg">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && pushParam('search', searchInput.trim())}
            placeholder="Search products…"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
          <button
            onClick={() => pushParam('search', searchInput.trim())}
            className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            Search
          </button>
          {search && (
            <button
              onClick={() => { setSearchInput(''); pushParam('search', ''); }}
              className="px-3 py-2 text-gray-500 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          )}
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

        {total > 0 && !loading && (
          <p className="text-sm text-gray-500 mb-4">{total} product{total !== 1 ? 's' : ''}</p>
        )}

        <ProductGrid
          products={products}
          loading={loading}
          columns={store?.gridColumns || 3}
          currency={store?.currency}
          locale={store?.locale}
          slug={slug}
        />

        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', p);
                  router.push(`/store/${slug}?${params.toString()}`);
                }}
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
      </section>
    </PageWrapper>
  );
}

export default function StorePage() {
  return <Suspense><StoreContent /></Suspense>;
}
