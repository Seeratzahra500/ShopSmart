'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { fadeUp, stagger } from '@/lib/motion';

const staggerContainer = stagger(0.08);

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 skeleton rounded" />
              <div className="h-2 w-20 skeleton rounded" />
            </div>
            <div className="h-6 w-16 skeleton rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-28 skeleton rounded" />
            <div className="h-2 w-36 skeleton rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 skeleton rounded-full" />
            <div className="h-8 w-24 skeleton rounded-full" />
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
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-main)]">Stores</h1>
        {!loading && (
          <span className="px-3 py-0.5 rounded-full text-sm font-semibold bg-[var(--bg-sunken)] text-[var(--text-secondary)] font-tabular">
            {stores.length}
          </span>
        )}
      </motion.div>

      {/* Grid */}
      {loading ? (
        <SkeletonCards />
      ) : stores.length === 0 ? (
        <EmptyState
          title="No stores yet"
          description="Sellers will appear here once they register."
        />
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
              whileHover={{ y: -4 }}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] hover:shadow-[var(--shadow-lift)] transition-shadow p-6 flex flex-col gap-4"
            >
              {/* Header: name + status */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div
                      className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
                      style={{ backgroundColor: store.primaryColor || 'var(--color-brand)' }}
                    >
                      {store.name[0].toUpperCase()}
                    </div>
                    <p className="font-display font-semibold text-lg tracking-tight text-[var(--text-main)] truncate">{store.name}</p>
                  </div>
                  <p className="font-mono text-xs text-[var(--text-muted)] pl-9">/{store.slug}</p>
                </div>
                <Badge tone={store.isActive ? 'success' : 'danger'} className="flex-shrink-0">
                  {store.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Owner info */}
              <div>
                <p className="eyebrow mb-1">Owner</p>
                <p className="text-sm font-medium text-[var(--text-main)]">{store.owner?.name || '—'}</p>
                {store.owner?.email && (
                  <p className="text-xs text-[var(--text-muted)]">{store.owner.email}</p>
                )}
              </div>

              {/* Tagline if present */}
              {store.tagline && (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">{store.tagline}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-2">
                <Link
                  href={`/store/${store.slug}`}
                  target="_blank"
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-[var(--border-strong)] text-[var(--text-main)] hover:bg-[var(--bg-sunken)] transition-colors"
                >
                  Visit Store
                </Link>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleStatus(store._id, store.name)}
                  disabled={busy === store._id}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors disabled:opacity-50
                    ${store.isActive
                      ? 'bg-[var(--danger)]/8 text-[var(--danger)] hover:bg-[var(--danger)]/15'
                      : 'bg-[var(--success)]/8 text-[var(--success)] hover:bg-[var(--success)]/15'}`}
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
