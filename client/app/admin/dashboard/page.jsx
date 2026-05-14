'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 h-32">
          <div className="h-3 w-20 bg-gray-200 rounded mb-4" />
          <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-2 w-16 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

const STAT_CONFIGS = [
  {
    key: 'users',
    label: 'Total Users',
    iconBg: 'bg-stone-100',
    iconColorStyle: { color: 'var(--color-brand)' },
    cardGradient: 'bg-gradient-to-br from-stone-50 to-white',
    borderColor: 'border-stone-200',
    barColorStyle: { backgroundColor: 'var(--color-brand)' },
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87a4 4 0 100-8 4 4 0 000 8zm6-10a4 4 0 10-8 0 4 4 0 008 0z" />
      </svg>
    ),
  },
  {
    key: 'stores',
    label: 'Total Stores',
    iconBg: 'bg-green-100',
    iconColorStyle: { color: '#16a34a' },
    cardGradient: 'bg-gradient-to-br from-green-50 to-white',
    borderColor: 'border-green-100',
    barColorStyle: { backgroundColor: '#4ade80' },
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h11m-5 0a2 2 0 100 4 2 2 0 000-4zm-6 0a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
  },
  {
    key: 'orders',
    label: 'Total Orders',
    iconBg: 'bg-stone-100',
    iconColorStyle: { color: '#78716c' },
    cardGradient: 'bg-gradient-to-br from-stone-50 to-white',
    borderColor: 'border-stone-200',
    barColorStyle: { backgroundColor: '#a8a29e' },
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-3-3v6m9-6a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'revenue',
    label: 'Revenue',
    iconBg: 'bg-orange-100',
    iconColorStyle: { color: '#ea580c' },
    cardGradient: 'bg-gradient-to-br from-orange-50 to-white',
    borderColor: 'border-orange-100',
    barColorStyle: { backgroundColor: '#fb923c' },
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
  },
];

function StatCard({ label, value, iconBg, iconColorStyle, icon, cardGradient, borderColor, barColorStyle }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl ${cardGradient} border ${borderColor} shadow-sm p-6 relative overflow-hidden`}
    >
      <div
        className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}
        style={iconColorStyle}
      >
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <p className="text-3xl font-bold tracking-tight text-gray-900">{value}</p>
      {/* Accent bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full">
        <div className="h-full rounded-full" style={barColorStyle} />
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const statValues = data
    ? [
        data.totalUsers   ?? 0,
        data.totalStores  ?? 0,
        data.totalOrders  ?? 0,
        formatPrice(data.totalRevenue ?? 0),
      ]
    : [0, 0, 0, formatPrice(0)];

  // Banner inline stat pills — show dash while loading
  const bannerStats = [
    { label: 'users',   value: loading ? '—' : (data?.totalUsers  ?? 0) },
    { label: 'stores',  value: loading ? '—' : (data?.totalStores ?? 0) },
    { label: 'orders',  value: loading ? '—' : (data?.totalOrders ?? 0) },
    { label: 'revenue', value: loading ? '—' : formatPrice(data?.totalRevenue ?? 0) },
  ];

  // Progress bar helpers for top products
  const maxSold =
    data?.topProducts?.length
      ? Math.max(...data.topProducts.map((p) => p.totalSold ?? 0))
      : 1;

  return (
    <div className="space-y-8">

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black to-stone-900 py-8 px-8 text-white"
      >
        {/* Decorative blur circle */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full bg-stone-800/30 blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Left copy */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-300 mb-1">
              Admin Dashboard
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
            <p className="text-sm text-gray-400 mt-1">
              Monitor users, stores, orders and revenue in real-time.
            </p>
          </div>

          {/* Right: inline stat pills (hidden on mobile) */}
          <div className="hidden sm:flex flex-wrap gap-2">
            {bannerStats.map(({ label, value }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-white backdrop-blur-sm border border-white/10"
              >
                <span className="text-stone-300 font-bold">{value}</span>
                <span className="text-gray-400">{label}</span>
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      {loading ? (
        <SkeletonStatCards />
      ) : (
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {STAT_CONFIGS.map((cfg, i) => (
            <StatCard
              key={cfg.key}
              label={cfg.label}
              value={statValues[i]}
              iconBg={cfg.iconBg}
              iconColorStyle={cfg.iconColorStyle}
              icon={cfg.icon}
              cardGradient={cfg.cardGradient}
              borderColor={cfg.borderColor}
              barColorStyle={cfg.barColorStyle}
              index={i}
            />
          ))}
        </motion.div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <h2 className="font-bold tracking-tight text-gray-800 mb-4">Top Products (Platform)</h2>
            {data?.topProducts?.length ? (
              <div className="space-y-4">
                {data.topProducts.map((p, i) => (
                  <div key={p._id}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: 'var(--color-brand)' }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-gray-700 truncate max-w-[180px]">{p._id}</span>
                      </div>
                      <span className="text-gray-500 flex-shrink-0 text-xs font-semibold">{p.totalSold} sold</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full bg-stone-200 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round(((p.totalSold ?? 0) / maxSold) * 100)}%`,
                          backgroundColor: 'var(--color-brand)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No sales data yet.</p>
            )}
          </motion.div>

          {/* Low stock */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
            className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <h2 className="font-bold tracking-tight text-gray-800 mb-4">Low Stock Alerts</h2>
            {data?.lowStock?.length ? (
              <div className="space-y-2">
                {data.lowStock.map((p) =>
                  p.stock === 0 ? (
                    <div
                      key={p._id}
                      className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-sm"
                    >
                      <span className="text-gray-700 truncate max-w-[200px]">{p.title}</span>
                      <span className="ml-3 flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 border border-red-200">
                        Out of stock
                      </span>
                    </div>
                  ) : (
                    <div
                      key={p._id}
                      className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-sm"
                    >
                      <span className="text-gray-700 truncate max-w-[200px]">{p.title}</span>
                      <span className="ml-3 flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-600 border border-amber-200">
                        {p.stock} left
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">All products are well stocked.</p>
            )}
          </motion.div>
        </div>
      )}

      {/* Quick links */}
      {!loading && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {[
            {
              href: '/admin/stores',
              label: 'Manage Stores',
              accentBorderClass: 'border-l-4',
              accentBorderStyle: { borderLeftColor: 'var(--color-brand)' },
              icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  style={{ color: 'var(--color-brand)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h11m-5 0a2 2 0 100 4 2 2 0 000-4zm-6 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              ),
            },
            {
              href: '/admin/orders',
              label: 'View Orders',
              accentBorderClass: 'border-l-4 border-l-stone-400',
              accentBorderStyle: {},
              icon: (
                <svg className="w-5 h-5 text-stone-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ),
            },
            {
              href: '/admin/users',
              label: 'Manage Users',
              accentBorderClass: 'border-l-4 border-l-green-500',
              accentBorderStyle: {},
              icon: (
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87a4 4 0 100-8 4 4 0 000 8zm6-10a4 4 0 10-8 0 4 4 0 008 0z" />
                </svg>
              ),
            },
          ].map(({ href, label, icon, accentBorderClass, accentBorderStyle }) => (
            <motion.div key={href} variants={fadeUp} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
              <Link
                href={href}
                className={`flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow text-sm font-semibold text-gray-700 ${accentBorderClass}`}
                style={accentBorderStyle}
              >
                {icon}
                <span className="flex-1">{label}</span>
                {/* Chevron arrow */}
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
