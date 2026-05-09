'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Stores</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-1">{total} store{total !== 1 ? 's' : ''}</p>
          )}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-md">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search stores…"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); }}
              className="px-3 py-2 text-gray-500 hover:text-gray-800 text-sm border border-gray-300 rounded-lg"
            >
              Clear
            </button>
          )}
        </form>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🏪</div>
            <p className="text-lg font-medium text-gray-500">No stores found</p>
            {search && <p className="text-sm mt-2">Try a different search term</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {stores.map((store) => (
              <motion.div key={store._id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <Link
                  href={`/store/${store.slug}`}
                  className="block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="h-32 flex items-center justify-center"
                    style={{ backgroundColor: store.primaryColor || '#4f46e5' }}
                  >
                    {store.logoUrl ? (
                      <Image
                        src={store.logoUrl}
                        alt={store.name}
                        width={80}
                        height={80}
                        className="object-contain rounded-lg"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-white">
                        {store.name[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{store.name}</h3>
                    {store.tagline && (
                      <p className="text-sm text-gray-500 mt-1 truncate">{store.tagline}</p>
                    )}
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
