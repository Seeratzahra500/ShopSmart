'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const fadeUp  = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

/* ── Featured (first) store card ── */
function FeaturedCard({ store }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="col-span-1 lg:col-span-2 rounded-3xl overflow-hidden relative group"
      style={{ minHeight: 420 }}
    >
      <Link href={`/store/${store.slug}`} className="block h-full">
        {/* Background */}
        <div className="absolute inset-0">
          {store.heroImage && (
            <Image src={store.heroImage} alt={store.name} fill className="object-cover opacity-80" />
          )}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: store.heroImage ? undefined : store.primaryColor || '#5C4E4E' }}
          />
        </div>
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Glowing ring on hover */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: `inset 0 0 0 1.5px ${store.primaryColor || '#5C4E4E'}` }}
        />

        {/* Logo / initial */}
        <div className="absolute top-6 right-6">
          {store.logoUrl ? (
            <Image src={store.logoUrl} alt={store.name} width={56} height={56}
              className="object-contain rounded-xl opacity-80" />
          ) : (
            <span className="text-7xl font-black select-none"
              style={{ color: 'rgba(255,255,255,0.08)' }}>
              {store.name[0].toUpperCase()}
            </span>
          )}
        </div>

        {/* Featured badge */}
        <div className="absolute top-6 left-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            Featured
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-7">
          <p className="text-white/50 text-xs uppercase tracking-[0.2em] mb-2">
            {store.tagline ? 'Store' : 'Independent Store'}
          </p>
          <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
            {store.name}
          </h2>
          {store.tagline && (
            <p className="text-white/60 mt-2 text-sm leading-relaxed max-w-sm">
              {store.tagline}
            </p>
          )}
          <div className="mt-5 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-white/15 backdrop-blur-sm px-5 py-2.5 rounded-full group-hover:bg-white/25 transition-colors">
              Visit Store
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Regular store card ── */
function StoreCard({ store, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6 }}
      className="rounded-3xl overflow-hidden relative group"
      style={{
        boxShadow: hovered
          ? `0 24px 60px ${store.primaryColor ? store.primaryColor + '55' : 'rgba(92,78,78,0.35)'}`
          : '0 2px 16px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.35s ease',
      }}
    >
      <Link href={`/store/${store.slug}`} className="block">
        {/* Banner */}
        <div
          className="relative h-80 flex items-end overflow-hidden"
          style={{ backgroundColor: store.heroImage ? undefined : store.primaryColor || '#5C4E4E' }}
        >
          {store.heroImage && (
            <Image src={store.heroImage} alt={store.name} fill className="absolute inset-0 object-cover" />
          )}
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Big faint letter */}
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[7rem] font-black select-none pointer-events-none"
            style={{ color: 'rgba(255,255,255,0.07)' }}>
            {store.name[0].toUpperCase()}
          </span>

          {store.logoUrl && (
            <div className="absolute top-4 right-4">
              <Image src={store.logoUrl} alt={store.name} width={56} height={56}
                className="object-contain rounded-2xl opacity-90 shadow-lg" />
            </div>
          )}

          {/* Slide-up visit button on hover */}
          <motion.div
            className="absolute inset-x-0 bottom-0 flex justify-center pb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 12 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-5 py-2 rounded-full border border-white/20">
              Visit Store →
            </span>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="bg-white px-5 py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{store.name}</p>
            {store.tagline
              ? <p className="text-xs text-gray-400 mt-0.5 truncate">{store.tagline}</p>
              : <p className="text-xs text-gray-300 mt-0.5">Independent Store</p>
            }
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
            style={{ backgroundColor: store.primaryColor || 'var(--color-brand)' }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

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

  const [featured, ...rest] = stores;

  return (
    <PageWrapper>

      {/* ── Dark premium header ── */}
      <div className="bg-gray-950 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, var(--color-brand), transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-8"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-14">
          <motion.div
            initial="hidden" animate="show" variants={stagger}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-8"
          >
            <div>
              <motion.p
                variants={fadeUp} transition={{ duration: 0.4 }}
                className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-3"
              >
                Marketplace
              </motion.p>
              <motion.h1
                variants={fadeUp} transition={{ duration: 0.5 }}
                className="text-5xl md:text-6xl font-bold tracking-tight text-white"
              >
                Discover Stores
              </motion.h1>
              <motion.p
                variants={fadeUp} transition={{ duration: 0.45 }}
                className="mt-3 text-white/40 text-base"
              >
                {loading ? '…' : `${total} independent store${total !== 1 ? 's' : ''} to explore`}
              </motion.p>
            </div>

            {/* Search */}
            <motion.form
              variants={fadeUp} transition={{ duration: 0.4 }}
              onSubmit={handleSearch}
              className="relative flex items-center w-full md:w-96 bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-white/25 focus-within:bg-white/8 transition-all"
            >
              <span className="pl-4 text-white/30 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search stores…"
                className="flex-1 px-3 py-3.5 text-sm bg-transparent focus:outline-none text-white placeholder-white/25"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }}
                  className="text-white/30 hover:text-white/60 px-2 text-xl leading-none flex-shrink-0 transition-colors">
                  ×
                </button>
              )}
              <button type="submit"
                className="m-1.5 px-5 py-2.5 rounded-xl text-white text-xs font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
                style={{ backgroundColor: 'var(--color-brand)' }}>
                Search
              </button>
            </motion.form>
          </motion.div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`animate-pulse rounded-3xl overflow-hidden ${i === 0 ? 'lg:col-span-2' : ''}`}>
                  <div className={`bg-gray-200 ${i === 0 ? 'h-80' : 'h-52'}`} />
                  <div className="p-5 bg-white space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l1-5h16l1 5M3 9h18M3 9v11a1 1 0 001 1h4a1 1 0 001-1v-4h4v4a1 1 0 001 1h4a1 1 0 001-1V9" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-800">No stores found</p>
              {search && <p className="text-sm text-gray-400 mt-1">Try a different search term</p>}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={stagger} initial="hidden" animate="show"
            >
              {/* Featured first store */}
              {featured && <FeaturedCard store={featured} />}

              {/* Rest of stores */}
              {rest.map((store, i) => (
                <StoreCard key={store._id} store={store} index={i} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

    </PageWrapper>
  );
}
