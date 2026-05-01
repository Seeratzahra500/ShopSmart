'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import PageWrapper from '@/components/PageWrapper';
import api from '@/lib/api';

export default function HomePage() {
  const { store } = useStore();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    api.get('/products?limit=8')
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  const heroHeadline = store?.heroHeadline || 'Your store, your brand.';
  const heroCta      = store?.heroCta      || 'Browse Products';
  const heroImage    = store?.heroImage;
  const storeName    = store?.name;
  const tagline      = store?.tagline;

  return (
    <PageWrapper>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: heroImage ? `url(${heroImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: heroImage ? undefined : 'white',
        }}
      >
        {heroImage && <div className="absolute inset-0 bg-black/40" />}
        <div className={`relative max-w-7xl mx-auto px-4 py-24 md:py-32 text-center ${heroImage ? 'text-white' : 'text-gray-900'}`}>
          {storeName && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-sm font-semibold uppercase tracking-widest mb-4 opacity-80"
              style={{ color: heroImage ? '#fff' : 'var(--color-brand)' }}
            >
              {storeName}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-heading, clamp(2.5rem, 6vw, 4rem))' }}
          >
            {heroHeadline}
          </motion.h1>
          {tagline && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`text-xl mb-10 max-w-2xl mx-auto ${heroImage ? 'text-white/80' : 'text-gray-600'}`}
            >
              {tagline}
            </motion.p>
          )}
          {!tagline && !heroImage && (
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              ShopSmart gives small businesses a beautiful, personalized storefront — no code required.
            </p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/products"
              className="px-8 py-4 text-white font-semibold text-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brand)', borderRadius: 'var(--border-radius-btn, 8px)' }}
            >
              {heroCta}
            </Link>
            <Link
              href="/auth/register"
              className={`px-8 py-4 font-semibold text-lg border-2 transition-colors ${heroImage ? 'border-white text-white hover:bg-white/10' : 'hover:bg-gray-50'}`}
              style={heroImage
                ? { borderRadius: 'var(--border-radius-btn, 8px)' }
                : { borderColor: 'var(--color-brand)', color: 'var(--color-brand)', borderRadius: 'var(--border-radius-btn, 8px)' }}
            >
              Open Your Store
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
              Featured Products
            </h2>
            <Link href="/products" className="text-sm font-medium hover:underline" style={{ color: 'var(--color-brand)' }}>
              View all →
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p>No products yet — check back soon.</p>
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${Math.min(store?.gridColumns || 3, 4)}, minmax(0, 1fr))` }}
            >
              {products.map(p => <ProductCard key={p._id} product={p} currency={store?.currency} locale={store?.locale} />)}
            </div>
          )}
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Custom Branding', desc: 'Your logo, colors, and fonts — applied instantly across your entire store.' },
              { title: 'Easy Management', desc: 'Add products, track orders, and manage customers from a clean dashboard.' },
              { title: 'Secure Checkout', desc: 'Built-in checkout with stock tracking and order management out of the box.' },
            ].map(f => (
              <div key={f.title}
                className="p-6 rounded-xl border transition-shadow hover:shadow-md"
                style={{ borderRadius: 'var(--border-radius-card, 8px)', boxShadow: 'var(--card-shadow, none)', border: 'var(--card-border, 1px solid #e5e7eb)' }}>
                <h3 className="text-base font-semibold text-gray-800 mb-1.5">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
