'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

export default function StoresPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stores, setStores]           = useState([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user)                     { router.replace('/auth/login?next=/stores'); return; }
    if (user.role === 'admin')     { router.replace('/admin/dashboard'); return; }
    if (user.role === 'shopowner') { router.replace('/dashboard'); return; }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !user || user.role !== 'customer') return;
    setLoading(true);
    const params = new URLSearchParams({ limit: 12 });
    if (search) params.set('search', search);
    api.get(`/stores?${params}`)
      .then(({ data }) => { setStores(data.stores); setTotal(data.total); })
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, [search, authLoading, user]);

  if (authLoading || !user || user.role !== 'customer') return null;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-8">

        {/* ── Editorial header ── */}
        <motion.div
          className="grid grid-cols-12 gap-8 pt-16 pb-12 border-b border-gray-100"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="col-span-12 md:col-span-2 flex items-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mt-1">Explore</p>
          </motion.div>

          <div className="col-span-12 md:col-span-10">
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900"
            >
              Discover Stores
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-3 text-gray-500 text-lg"
            >
              Shop from curated independent businesses
            </motion.p>
            {!loading && (
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="mt-1 text-sm text-gray-400"
              >
                {total} store{total !== 1 ? 's' : ''} available
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* ── Search bar ── */}
        <div className="grid grid-cols-12 gap-8 py-8">
          <div className="col-span-12 md:col-span-2" />
          <div className="col-span-12 md:col-span-10">
            <form
              onSubmit={handleSearch}
              className="relative flex items-center w-full max-w-xl border-b border-gray-300 focus-within:border-gray-900 transition-colors"
            >
              <span className="text-gray-400 flex-shrink-0 mr-3">
                <IconSearch />
              </span>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search stores…"
                className="flex-1 py-3 text-sm text-gray-800 bg-transparent focus:outline-none placeholder-gray-400"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setSearchInput(''); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors mr-3 text-lg leading-none flex-shrink-0"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
              <button
                type="submit"
                className="text-xs font-semibold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* ── Store grid ── */}
        <div className="grid grid-cols-12 gap-8 pb-20">
          <div className="col-span-12 md:col-span-2" />
          <div className="col-span-12 md:col-span-10">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white border border-gray-100 overflow-hidden">
                    <div className="h-48 bg-gray-100" />
                    <div className="p-5 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stores.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">No results</p>
                <p className="text-2xl font-bold text-gray-900">No stores found</p>
                {search && (
                  <p className="text-sm mt-2 text-gray-400">
                    Try a different search term
                  </p>
                )}
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={stagger}
                initial="hidden"
                animate="show"
              >
                {stores.map((store) => (
                  <motion.div
                    key={store._id}
                    variants={fadeUp}
                    transition={{ duration: 0.4 }}
                    whileHover={{ y: -4 }}
                  >
                    <Link
                      href={`/store/${store.slug}`}
                      className="block group overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors"
                    >
                      {/* Color banner */}
                      <div
                        className="relative h-48 flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: store.primaryColor || '#5C4E4E' }}
                      >
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                        {store.logoUrl ? (
                          <Image
                            src={store.logoUrl}
                            alt={store.name}
                            width={80}
                            height={80}
                            className="object-contain relative z-10"
                          />
                        ) : (
                          <span className="text-5xl font-black text-white/30 select-none relative z-10">
                            {store.name[0].toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="p-5 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-[var(--color-brand)] transition-colors truncate">
                              {store.name}
                            </h3>
                            {store.tagline && (
                              <p className="text-xs text-gray-400 mt-1 truncate">{store.tagline}</p>
                            )}
                          </div>
                          <span className="text-gray-300 group-hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
