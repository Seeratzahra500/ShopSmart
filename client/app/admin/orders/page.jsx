'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const TAB_ALL = 'all';

export default function AdminOrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_ALL);

  const load = () => {
    setLoading(true);
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Orders</h1>
        <p className="text-sm text-gray-600 leading-relaxed mt-0.5">
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
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            style={activeTab === tab ? { backgroundColor: 'var(--color-brand)' } : {}}
          >
            {tab === TAB_ALL ? 'All' : tab}
            {tab !== TAB_ALL && (
              <span className={`ml-1.5 text-xs ${activeTab === tab ? 'opacity-70' : 'text-gray-400'}`}>
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
            <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">
            {activeTab === TAB_ALL ? 'No orders yet.' : `No ${activeTab} orders.`}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Update'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-gray-100"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {filtered.map((order) => (
                <motion.tr
                  key={order._id}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  className="hover:bg-gray-50 transition-colors even:bg-gray-50/50"
                >
                  {/* Order ID */}
                  <td className="px-5 py-4 font-mono text-xs text-gray-500">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  {/* Customer */}
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800 text-sm">
                      {order.customer?.name || order.guestEmail || 'Guest'}
                    </p>
                    {order.customer?.email && (
                      <p className="text-xs text-gray-400">{order.customer.email}</p>
                    )}
                  </td>
                  {/* Date */}
                  <td className="px-5 py-4 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  {/* Items */}
                  <td className="px-5 py-4 text-gray-600 text-sm">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </td>
                  {/* Total */}
                  <td className="px-5 py-4 font-semibold text-gray-800">
                    {formatPrice(order.totalAmount)}
                  </td>
                  {/* Status badge */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                        ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  {/* Status dropdown */}
                  <td className="px-5 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatus(order._id, e.target.value)}
                      disabled={updating === order._id}
                      className="text-xs font-semibold px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50 transition-colors"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
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
