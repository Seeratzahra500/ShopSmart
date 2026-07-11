'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import { fadeUp, stagger } from '@/lib/motion';

const staggerContainer = stagger(0.08);

function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-[var(--radius-lg)] bg-[var(--bg-card)] border border-[var(--border)] p-6 h-32">
          <div className="h-3 w-20 skeleton rounded mb-4" />
          <div className="h-8 w-24 skeleton rounded mb-2" />
          <div className="h-2 w-16 skeleton rounded" />
        </div>
      ))}
    </div>
  );
}

const STAT_CONFIGS = [
  { key: 'users',   label: 'Total Users' },
  { key: 'stores',  label: 'Total Stores' },
  { key: 'orders',  label: 'Total Orders' },
  { key: 'revenue', label: 'Revenue' },
];

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
        className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--brand-ink)] py-8 px-8 text-white"
      >
        {/* Decorative blur circle */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Left copy */}
          <div>
            <p className="eyebrow mb-1 text-white/60">Admin Dashboard</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Platform Overview</h1>
            <p className="text-sm text-white/70 mt-1">
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
                <span className="font-tabular font-bold">{value}</span>
                <span className="text-white/60">{label}</span>
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
            <motion.div key={cfg.key} variants={fadeUp}>
              <StatCard label={cfg.label} value={statValues[i]} />
            </motion.div>
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
            className="p-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]"
          >
            <h2 className="font-display font-semibold tracking-tight text-[var(--text-main)] mb-4">Top Products (Platform)</h2>
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
                        <span className="text-[var(--text-main)] truncate max-w-[180px]">{p._id}</span>
                      </div>
                      <span className="text-[var(--text-muted)] flex-shrink-0 text-xs font-semibold font-tabular">{p.totalSold} sold</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full bg-[var(--bg-sunken)] relative overflow-hidden">
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
              <p className="text-sm text-[var(--text-muted)] text-center py-6">No sales data yet.</p>
            )}
          </motion.div>

          {/* Low stock */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
            className="p-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]"
          >
            <h2 className="font-display font-semibold tracking-tight text-[var(--text-main)] mb-4">Low Stock Alerts</h2>
            {data?.lowStock?.length ? (
              <div className="space-y-2">
                {data.lowStock.map((p) =>
                  p.stock === 0 ? (
                    <div
                      key={p._id}
                      className="flex items-center justify-between bg-[var(--danger)]/8 border border-[var(--danger)]/20 rounded-[var(--radius-md)] px-3 py-2 text-sm"
                    >
                      <span className="text-[var(--text-main)] truncate max-w-[200px]">{p.title}</span>
                      <span className="ml-3 flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20">
                        Out of stock
                      </span>
                    </div>
                  ) : (
                    <div
                      key={p._id}
                      className="flex items-center justify-between bg-[var(--warning)]/8 border border-[var(--warning)]/20 rounded-[var(--radius-md)] px-3 py-2 text-sm"
                    >
                      <span className="text-[var(--text-main)] truncate max-w-[200px]">{p.title}</span>
                      <span className="ml-3 flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20">
                        {p.stock} left
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] text-center py-6">All products are well stocked.</p>
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
              icon: (
                <svg className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ),
            },
            {
              href: '/admin/users',
              label: 'Manage Users',
              icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--success)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87a4 4 0 100-8 4 4 0 000 8zm6-10a4 4 0 10-8 0 4 4 0 008 0z" />
                </svg>
              ),
            },
          ].map(({ href, label, icon }) => (
            <motion.div key={href} variants={fadeUp} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
              <Link
                href={href}
                className="flex items-center gap-3 bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-5 hover:shadow-[var(--shadow-lift)] transition-shadow text-sm font-semibold text-[var(--text-main)] border-l-4"
                style={{ borderLeftColor: 'var(--color-brand)' }}
              >
                {icon}
                <span className="flex-1">{label}</span>
                {/* Chevron arrow */}
                <svg className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
