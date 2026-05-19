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
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 relative">
        <p className="text-8xl font-black text-gray-100 select-none leading-none">404</p>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h1>
          <p className="text-gray-600 leading-relaxed mb-6 max-w-sm">
            The store you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/stores')}
            className="bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm"
          >
            Browse Stores
          </button>
        </div>
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

      {/* Trust / Features strip */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="hidden sm:flex items-center justify-center gap-10 flex-wrap px-6">
          {/* Free Delivery */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Free Delivery on orders over PKR 1,000</span>
          </div>
          {/* Secure Checkout */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure Checkout</span>
          </div>
          {/* Easy Returns */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Easy Returns</span>
          </div>
          {/* 24/7 Support */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>24/7 Support</span>
          </div>
        </div>
        {/* Mobile: wrap nicely */}
        <div className="flex sm:hidden items-center justify-center gap-6 flex-wrap px-6">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Free Delivery</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Easy Returns</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>

      {/* Products section */}
      <section id="products" className="max-w-7xl mx-auto px-8 py-20">
        {/* Section heading — editorial layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-12 gap-8 mb-12"
        >
          <div className="col-span-12 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mt-1">Catalogue</p>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900">
              {store?.name ? `${store.name}'s Collection` : 'Shop All Products'}
            </h2>
            {!loading && (
              <p className="text-sm text-gray-400 mt-2">
                {total} product{total !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </motion.div>

        {/* Search bar */}
        <div className="relative max-w-lg mb-6">
          {/* Search icon */}
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
          </span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && pushParam('search', searchInput.trim())}
            placeholder="Search products…"
            className="w-full pl-12 pr-10 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none transition"
          />
          {/* Clear × button */}
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); pushParam('search', ''); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category pills — horizontally scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const active = cat === 'All' ? !category : category === cat;
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.96 }}
                onClick={() => pushParam('category', cat === 'All' ? '' : cat)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm transition-colors whitespace-nowrap ${
                  active
                    ? 'text-white font-semibold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium'
                }`}
                style={active ? { backgroundColor: 'var(--color-brand)' } : undefined}
              >
                {cat}
              </motion.button>
            );
          })}
        </div>

        {/* Product count with hr */}
        {total > 0 && !loading && (
          <>
            <p className="text-sm text-gray-400 font-medium mb-4">
              Showing {total} product{total !== 1 ? 's' : ''}
              {search && ` for "${search}"`}
              {category && ` in ${category}`}
            </p>
            <hr className="border-gray-100 mb-6" />
          </>
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
          <div className="flex items-center justify-center gap-2 mt-12">
            {/* Previous */}
            <button
              onClick={() => {
                if (page <= 1) return;
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', page - 1);
                router.push(`/store/${slug}?${params.toString()}`);
              }}
              disabled={page <= 1}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30 px-2"
            >
              Previous
            </button>

            {/* Page numbers */}
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', p);
                  router.push(`/store/${slug}?${params.toString()}`);
                }}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${
                  p === page
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={p === page ? { backgroundColor: 'var(--color-brand)' } : undefined}
              >
                {p}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => {
                if (page >= pages) return;
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', page + 1);
                router.push(`/store/${slug}?${params.toString()}`);
              }}
              disabled={page >= pages}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30 px-2"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* About this store — Estate editorial layout */}
      {store && (store.tagline || store.name) && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="py-24 border-t border-gray-100"
        >
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">About</p>
              </div>
              <div className="col-span-12 md:col-span-10">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                  {store.name}
                </h2>
                {store.tagline && (
                  <p className="text-gray-500 leading-relaxed text-lg mt-6 max-w-2xl">
                    {store.tagline}
                  </p>
                )}
                <div
                  className="mt-10 h-px w-24"
                  style={{ backgroundColor: store.primaryColor || 'var(--color-brand)' }}
                />
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </PageWrapper>
  );
}

export default function StorePage() {
  return <Suspense><StoreContent /></Suspense>;
}
