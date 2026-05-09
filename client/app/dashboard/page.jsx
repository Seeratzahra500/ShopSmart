'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';

function StatCard({ label, value, sub, color, icon, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-xl border border-gray-100 p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <span className="text-lg">{icon}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardOverview() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/store/analytics')
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your store at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders"    value={data?.totalOrders ?? 0}                        icon="📦" color="#4f46e5" delay={0} />
        <StatCard label="Total Revenue"   value={formatPrice(data?.totalRevenue ?? 0)}           icon="💰" color="#22c55e" delay={0.05} />
        <StatCard label="Low Stock Items" value={data?.lowStock?.length ?? 0} sub="< 10 units"  icon="⚠️" color="#f59e0b" delay={0.1} />
        <StatCard label="Top Product"     value={data?.topProducts?.[0]?._id ?? '—'}             icon="🏆" color="#ec4899" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Top Products</h2>
            <Link href="/dashboard/products" className="text-xs hover:underline" style={{ color: 'var(--color-brand)' }}>
              View all
            </Link>
          </div>
          {data?.topProducts?.length ? (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-brand)' }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-gray-700 truncate max-w-[180px]">{p._id}</span>
                  </div>
                  <span className="text-gray-500 flex-shrink-0">{p.totalSold} sold</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No sales yet.</p>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Low Stock Alerts</h2>
            <Link href="/dashboard/products" className="text-xs hover:underline" style={{ color: 'var(--color-brand)' }}>
              Manage
            </Link>
          </div>
          {data?.lowStock?.length ? (
            <div className="space-y-3">
              {data.lowStock.map((p) => (
                <div key={p._id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate max-w-[200px]">{p.title}</span>
                  <span className={`font-semibold flex-shrink-0 ${p.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">All products are well stocked.</p>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/products', label: 'Add Product',    icon: '➕' },
          { href: '/dashboard/orders',   label: 'View Orders',    icon: '📋' },
          { href: '/dashboard/settings', label: 'Store Settings', icon: '⚙️' },
        ].map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow text-sm font-medium text-gray-700"
          >
            <span className="text-xl">{icon}</span>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
