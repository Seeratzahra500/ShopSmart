'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import ProductGrid from '@/components/ProductGrid';
import { useStore } from '@/context/StoreContext';
import api from '@/lib/api';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Food & Beverages', 'Home & Living', 'Beauty', 'Books', 'Sports', 'Toys'];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: 'easeOut' },
});

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

  /* Loading skeleton */
  if (storeLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse space-y-6">
        <div className="h-[70vh] bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-3 gap-6 mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  /* Not found */
  if (!storeLoading && !store) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">404</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Store not found</h1>
        <p className="text-gray-600 leading-relaxed mb-6">
          The store you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <button
          onClick={() => router.push('/stores')}
          className="bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm"
        >
          Browse Stores
        </button>
      </div>
    );
  }

  return (
    <PageWrapper>
      {/* Hero */}
      {store && (
        <section
          className="relative min-h-[70vh] flex items-center overflow-hidden"
          style={{
            backgroundImage: store.heroImage ? `url(${store.heroImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: store.heroImage ? undefined : '#0a0a0a',
          }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center w-full">
            <motion.p
              {...fadeUp(0)}
              className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-4"
            >
              {store.tagline || 'Welcome'}
            </motion.p>

            <motion.h1
              {...fadeUp(0.1)}
              className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight mb-6"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {store.heroHeadline || store.name}
            </motion.h1>

            {store.tagline && (
              <motion.p
                {...fadeUp(0.2)}
                className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                {store.tagline}
              </motion.p>
            )}

            <motion.a
              href="#products"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
              whileHover={{ y: -2 }}
              className="inline-block px-8 py-3 bg-white font-semibold rounded-full hover:opacity-90 transition-opacity text-sm"
              style={{ color: 'var(--color-brand)' }}
            >
              {store.heroCta || 'Shop Now'}
            </motion.a>
          </div>
        </section>
      )}

      {/* Products section */}
      <section id="products" className="max-w-7xl mx-auto px-6 py-20">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Catalogue
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Our Collection</h2>
        </motion.div>

        {/* Search bar */}
        <div className="flex gap-2 mb-6 max-w-lg">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && pushParam('search', searchInput.trim())}
            placeholder="Search products…"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none transition"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => pushParam('search', searchInput.trim())}
            className="px-5 py-3 text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            Search
          </motion.button>
          {search && (
            <button
              onClick={() => { setSearchInput(''); pushParam('search', ''); }}
              className="px-4 py-3 text-gray-500 text-sm border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
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
              <motion.button
                key={cat}
                whileTap={{ scale: 0.96 }}
                onClick={() => pushParam('category', cat === 'All' ? '' : cat)}
                className="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
                style={
                  active
                    ? { backgroundColor: 'var(--color-brand)', color: '#fff', borderColor: 'var(--color-brand)' }
                    : { backgroundColor: '#fff', color: '#374151', borderColor: '#e5e7eb' }
                }
              >
                {cat}
              </motion.button>
            );
          })}
        </div>

        {total > 0 && !loading && (
          <p className="text-sm text-gray-500 mb-6">
            {total} product{total !== 1 ? 's' : ''}
            {search && ` for "${search}"`}
            {category && ` in ${category}`}
          </p>
        )}

        <ProductGrid
          products={products}
          loading={loading}
          columns={store?.gridColumns || 3}
          currency={store?.currency}
          locale={store?.locale}
          slug={slug}
        />

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', p);
                  router.push(`/store/${slug}?${params.toString()}`);
                }}
                className="w-10 h-10 rounded-xl text-sm font-semibold border transition-colors"
                style={
                  p === page
                    ? { backgroundColor: 'var(--color-brand)', color: '#fff', borderColor: 'var(--color-brand)' }
                    : { backgroundColor: '#fff', color: '#374151', borderColor: '#e5e7eb' }
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
