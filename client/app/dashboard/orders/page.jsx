'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} order{total !== 1 ? 's' : ''}</p>
        </div>

        {/* Filter by status */}
        <div className="flex gap-2 flex-wrap">
          {['', ...STATUSES].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                filter === s
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>{filter ? `No ${filter} orders.` : 'No orders yet.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order ID', 'Customer', 'Items', 'Total', 'Date', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {order.customer?.name || order.guestEmail || 'Guest'}
                    {order.customer?.email && (
                      <p className="text-xs text-gray-400">{order.customer.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatus(order._id, e.target.value)}
                      disabled={updating === order._id}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50
                        ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-white text-gray-700">
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
