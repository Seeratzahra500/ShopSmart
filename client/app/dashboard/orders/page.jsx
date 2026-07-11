'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { fadeUp, stagger } from '@/lib/motion';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function SkeletonRow() {
  return (
    <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] flex gap-4 items-center">
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 rounded w-24" />
        <div className="skeleton h-4 rounded w-40" />
      </div>
      <div className="skeleton h-4 rounded w-16" />
      <div className="skeleton h-6 rounded-full w-20" />
    </div>
  );
}

export default function DashboardOrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter]     = useState('');

  const load = (status) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 50 });
    if (status) params.set('status', status);
    api.get(`/orders/store?${params}`)
      .then(({ data }) => { setOrders(data.orders); setTotal(data.total); })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.patch(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
      toast.success('Status updated.');
    } catch { toast.error('Update failed.'); }
    finally { setUpdating(null); }
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={stagger()}
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-main)]">My Store Orders</h1>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full text-white font-tabular"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            {total} order{total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 flex-wrap">
          {['', ...STATUSES].map((s) => (
            <motion.button
              key={s || 'all'}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors capitalize ${
                filter === s
                  ? 'text-white border-transparent'
                  : 'border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)]'
              }`}
              style={filter === s ? { backgroundColor: 'var(--color-brand)', borderColor: 'var(--color-brand)' } : {}}
            >
              {s || 'All'}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          variants={fadeUp}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]"
        >
          <EmptyState
            title="No orders yet"
            description={filter ? `No ${filter} orders found.` : 'Orders will appear here once customers start purchasing.'}
          />
        </motion.div>
      ) : (
        <motion.div className="space-y-3" variants={stagger()} initial="hidden" animate="show">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                variants={fadeUp}
                layout
                whileHover={{ y: -2 }}
                className="p-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-lift)]"
              >
                <div className="flex flex-wrap gap-4 items-start justify-between">
                  {/* Left: order info */}
                  <div className="space-y-1 min-w-0">
                    <p className="font-mono text-xs text-[var(--text-muted)] font-semibold tracking-wider">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="font-semibold text-[var(--text-main)] text-sm">
                      {order.customer?.name || order.guestEmail || 'Guest'}
                    </p>
                    {order.customer?.email && (
                      <p className="text-xs text-[var(--text-muted)]">{order.customer.email}</p>
                    )}
                  </div>

                  {/* Right: meta */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-[var(--text-muted)]">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      <p className="font-tabular font-bold text-[var(--text-main)] text-sm">{formatPrice(order.totalAmount)}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-PK', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Status select styled as a pill */}
                    <div className="relative">
                      <StatusBadge status={order.status} />
                      <select
                        value={order.status}
                        onChange={(e) => handleStatus(order._id, e.target.value)}
                        disabled={updating === order._id}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        aria-label="Update order status"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                      {updating === order._id && (
                        <span className="absolute inset-0 flex items-center justify-center bg-[var(--bg-card)]/70 rounded-[var(--radius-sm)]">
                          <svg className="w-3 h-3 animate-spin text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
