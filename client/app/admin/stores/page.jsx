'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-2 w-20 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-28 bg-gray-100 rounded" />
            <div className="h-2 w-36 bg-gray-100 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-100 rounded-full" />
            <div className="h-8 w-24 bg-gray-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminStoresPage() {
  const [stores, setStores]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/stores')
      .then(({ data }) => setStores(data))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (id, name) => {
    setBusy(id);
    try {
      const { data } = await api.patch(`/admin/stores/${id}/status`);
      setStores((prev) => prev.map((s) => s._id === id ? { ...s, isActive: data.isActive } : s));
      toast.success(`"${name}" ${data.isActive ? 'activated' : 'deactivated'}.`);
    } catch { toast.error('Update failed.'); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Stores</h1>
        {!loading && (
          <span className="px-3 py-0.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600">
            {stores.length}
          </span>
        )}
      </motion.div>

      {/* Grid */}
      {loading ? (
        <SkeletonCards />
      ) : stores.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h11m-5 0a2 2 0 100 4 2 2 0 000-4zm-6 0a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <p className="text-sm">No stores yet. Sellers will appear here once they register.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {stores.map((store) => (
            <motion.div
              key={store._id}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
              className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 flex flex-col gap-4"
            >
              {/* Header: name + status */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
                      style={{ backgroundColor: store.primaryColor || 'var(--color-brand)' }}
                    >
                      {store.name[0].toUpperCase()}
                    </div>
                    <p className="font-bold text-lg tracking-tight text-gray-900 truncate">{store.name}</p>
                  </div>
                  <p className="font-mono text-xs text-gray-400 pl-9">/{store.slug}</p>
                </div>
                <span
                  className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                    ${store.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}
                >
                  {store.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Owner info */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Owner</p>
                <p className="text-sm font-medium text-gray-700">{store.owner?.name || '—'}</p>
                {store.owner?.email && (
                  <p className="text-xs text-gray-500">{store.owner.email}</p>
                )}
              </div>

              {/* Tagline if present */}
              {store.tagline && (
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{store.tagline}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-2">
                <Link
                  href={`/store/${store.slug}`}
                  target="_blank"
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Visit Store
                </Link>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleStatus(store._id, store.name)}
                  disabled={busy === store._id}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors disabled:opacity-50
                    ${store.isActive
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                >
                  {store.isActive ? 'Deactivate' : 'Activate'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
