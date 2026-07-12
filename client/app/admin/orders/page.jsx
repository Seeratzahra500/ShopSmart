'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { fadeUp, stagger } from '@/lib/motion';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const staggerContainer = stagger(0.08);

const TAB_ALL = 'all';

function StatusDropdown({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-main)] cursor-pointer hover:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 disabled:opacity-50 transition-colors capitalize"
      >
        {value}
        <svg className="w-3 h-3 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1 w-36 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-overlay)] py-1 z-20"
          >
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { onChange(s); setOpen(false); }}
                className={[
                  'block w-full text-left px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  s === value
                    ? 'text-[var(--brand-ink)] bg-[var(--brand-soft)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-main)]',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_ALL);

  const load = () => {
    api.get('/admin/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      toast.success('Status updated.');
    } catch { toast.error('Update failed.'); }
    finally { setUpdating(null); }
  };

  const filtered = activeTab === TAB_ALL
    ? orders
    : orders.filter((o) => o.status === activeTab);

  const tabs = [TAB_ALL, ...STATUSES];

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-main)]">Orders</h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-0.5">
          {orders.length} total order{orders.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Status filter tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="flex flex-wrap gap-2"
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors capitalize
              ${activeTab === tab
                ? 'text-white'
                : 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)]'}`}
            style={activeTab === tab ? { backgroundColor: 'var(--color-brand)' } : {}}
          >
            {tab === TAB_ALL ? 'All' : tab}
            {tab !== TAB_ALL && (
              <span className={`ml-1.5 text-xs font-tabular ${activeTab === tab ? 'opacity-70' : 'text-[var(--text-muted)]'}`}>
                ({orders.filter((o) => o.status === tab).length})
              </span>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 skeleton rounded-[var(--radius-lg)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No orders"
          description={activeTab === TAB_ALL ? 'No orders yet.' : `No ${activeTab} orders.`}
        />
      ) : (
        <div className="rounded-[var(--radius-lg)] overflow-x-auto border border-[var(--border)] bg-[var(--bg-card)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-sunken)] border-b border-[var(--border)]">
              <tr>
                {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Update'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 eyebrow">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-[var(--border)]"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {filtered.map((order) => (
                <motion.tr
                  key={order._id}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  className="hover:bg-[var(--bg-sunken)] transition-colors"
                >
                  {/* Order ID */}
                  <td className="px-5 py-4 font-mono text-xs text-[var(--text-muted)]">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  {/* Customer */}
                  <td className="px-5 py-4">
                    <p className="font-medium text-[var(--text-main)] text-sm">
                      {order.customer?.name || order.guestEmail || 'Guest'}
                    </p>
                    {order.customer?.email && (
                      <p className="text-xs text-[var(--text-muted)]">{order.customer.email}</p>
                    )}
                  </td>
                  {/* Date */}
                  <td className="px-5 py-4 text-xs text-[var(--text-muted)]">
                    {new Date(order.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  {/* Items */}
                  <td className="px-5 py-4 text-[var(--text-secondary)] text-sm">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </td>
                  {/* Total */}
                  <td className="px-5 py-4 font-semibold text-[var(--text-main)] font-tabular">
                    {formatPrice(order.totalAmount)}
                  </td>
                  {/* Status badge */}
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  {/* Status dropdown */}
                  <td className="px-5 py-4">
                    <StatusDropdown
                      value={order.status}
                      onChange={(status) => handleStatus(order._id, status)}
                      disabled={updating === order._id}
                    />
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      )}
    </div>
  );
}
