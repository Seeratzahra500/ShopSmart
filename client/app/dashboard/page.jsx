'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

function StatCard({ label, value, sub, icon, delay }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
      className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm flex items-start justify-between"
    >
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, white)' }}
      >
        {icon}
      </div>
    </motion.div>
  );
}

export default function DashboardOverview() {
  const { user } = useAuth();
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
        <div className="h-32 bg-gray-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-100 rounded-2xl" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      {/* Welcome banner */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl py-8 px-8 text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-accent) 100%)' }}
      >
        <div className="relative z-10">
          <p className="text-sm font-medium opacity-80 mb-1">Seller Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="mt-2 opacity-75 text-sm leading-relaxed">
            Here's what's happening in your store today.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
              Account Active
            </span>
            <span className="inline-flex items-center bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full capitalize">
              {user?.role || 'Shopowner'}
            </span>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -right-4 bottom-4 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
      </motion.div>

      {/* Stat cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <StatCard label="Total Orders"    value={data?.totalOrders ?? 0}                        icon="📦" delay={0} />
        <StatCard label="Total Revenue"   value={formatPrice(data?.totalRevenue ?? 0)}           icon="💰" delay={0.05} />
        <StatCard label="Low Stock Items" value={data?.lowStock?.length ?? 0} sub="< 10 units"  icon="⚠️" delay={0.1} />
        <StatCard label="Top Product"     value={data?.topProducts?.[0]?._id ?? '—'}             icon="🏆" delay={0.15} />
      </motion.div>

      {/* Top products + Low stock */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={stagger} initial="hidden" animate="show">
        {/* Top products */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold tracking-tight text-gray-800">Top Products</h2>
            <Link
              href="/dashboard/products"
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--color-brand)' }}
            >
              View all →
            </Link>
          </div>
          {data?.topProducts?.length ? (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-brand)' }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-gray-700 truncate max-w-[180px]">{p._id}</span>
                  </div>
                  <span className="text-gray-500 flex-shrink-0 text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                    {p.totalSold} sold
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm text-gray-400">No sales data yet.</p>
            </div>
          )}
        </motion.div>

        {/* Low stock */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold tracking-tight text-gray-800">Low Stock Alerts</h2>
            <Link
              href="/dashboard/products"
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--color-brand)' }}
            >
              Manage →
            </Link>
          </div>
          {data?.lowStock?.length ? (
            <div className="space-y-3">
              {data.lowStock.map((p) => (
                <div key={p._id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate max-w-[200px]">{p.title}</span>
                  <span
                    className={`text-xs font-semibold flex-shrink-0 px-2.5 py-1 rounded-full ${
                      p.stock === 0
                        ? 'bg-red-100 text-red-600'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm text-gray-400">All products are well stocked.</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Quick action cards */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" animate="show">
        {[
          { href: '/dashboard/products', label: 'Manage Products', desc: 'Add, edit, or remove items', icon: '📦' },
          { href: '/dashboard/orders',   label: 'View Orders',     desc: 'Track and update orders',    icon: '📋' },
          { href: '/dashboard/settings', label: 'Store Settings',  desc: 'Customize your storefront',  icon: '⚙️' },
        ].map(({ href, label, desc, icon }) => (
          <motion.div key={href} variants={fadeUp} transition={{ duration: 0.4 }} whileHover={{ y: -4 }}>
            <Link
              href={href}
              className="flex items-center gap-4 p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-brand) 10%, white)' }}
              >
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
              <svg
                className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
