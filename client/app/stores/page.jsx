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

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const IconStoreFront = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9 text-gray-400">
    <path d="M3 9l1-5h16l1 5" />
    <path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
    <path d="M5 9v11a1 1 0 0 0 1 1h4V15h4v6h4a1 1 0 0 0 1-1V9" />
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
    if (!user)                          { router.replace('/auth/login?next=/stores'); return; }
    if (user.role === 'admin')          { router.replace('/admin/dashboard'); return; }
    if (user.role === 'shopowner')      { router.replace('/dashboard'); return; }
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
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* ── Hero section ── */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.45 }}
          className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl py-12 px-8 mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Discover Amazing Stores
          </h1>
          <p className="mt-3 text-gray-500 text-base">
            Shop from hundreds of curated small businesses
          </p>
          {!loading && (
            <p className="mt-2 text-sm text-gray-400">
              {total} store{total !== 1 ? 's' : ''} available
            </p>
          )}
        </motion.div>

        {/* ── Search bar ── */}
        <form onSubmit={handleSearch} className="relative flex items-center w-full mb-8 rounded-2xl shadow-sm border border-gray-200 bg-white overflow-hidden">
          {/* Magnifying glass icon */}
          <span className="absolute left-4 text-gray-400 pointer-events-none flex items-center">
            <IconSearch />
          </span>

          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search stores…"
            className="flex-1 pl-12 pr-4 py-3.5 text-sm text-gray-800 bg-transparent focus:outline-none placeholder-gray-400"
          />

          {/* Clear button (×) when search is active */}
          {searchInput && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); }}
              className="flex items-center justify-center w-7 h-7 mr-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-lg leading-none flex-shrink-0"
              aria-label="Clear search"
            >
              ×
            </button>
          )}

          {/* Search pill button */}
          <button
            type="submit"
            className="m-1.5 px-5 py-2 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            Search
          </button>
        </form>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <IconStoreFront />
            </div>
            <p className="text-xl font-bold text-gray-700">No stores found</p>
            {search && <p className="text-sm mt-2 text-gray-400">Try a different search term</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {stores.map((store) => (
              <motion.div
                key={store._id}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.10)' }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl overflow-hidden"
              >
                <Link
                  href={`/store/${store.slug}`}
                  className="block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm transition-shadow"
                >
                  {/* Color banner with gradient overlay */}
                  <div
                    className="relative h-40 flex items-center justify-center"
                    style={{ backgroundColor: store.primaryColor || '#4f46e5' }}
                  >
                    {/* Gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />

                    {store.logoUrl ? (
                      <Image
                        src={store.logoUrl}
                        alt={store.name}
                        width={80}
                        height={80}
                        className="object-contain rounded-lg relative z-10"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-white relative z-10">
                        {store.name[0].toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900">{store.name}</h3>
                    {store.tagline && (
                      <p className="text-sm text-gray-500 mt-1 truncate">{store.tagline}</p>
                    )}
                    {/* Visit Store link */}
                    <p
                      className="mt-2 text-xs font-semibold"
                      style={{ color: 'var(--color-brand)' }}
                    >
                      Visit Store →
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
