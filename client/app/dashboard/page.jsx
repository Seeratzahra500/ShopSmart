'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/ui/StatCard';
import { fadeUp, stagger } from '@/lib/motion';

/* ── SVG icons ── */
const IconOrders = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);
const IconShop = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M3 9l1-5h16l1 5" />
    <path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
    <path d="M5 9v11a1 1 0 0 0 1 1h4V15h4v6h4a1 1 0 0 0 1-1V9" />
  </svg>
);
const IconProducts = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-4 0v2" />
  </svg>
);
const IconOrdersAction = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/* ── Quick action card configs ── */
const QUICK_ACTIONS = [
  {
    href: '/dashboard/products',
    label: 'Manage Products',
    desc: 'Add, edit, or remove items',
    Icon: IconProducts,
  },
  {
    href: '/dashboard/orders',
    label: 'View Orders',
    desc: 'Track and update orders',
    Icon: IconOrdersAction,
  },
  {
    href: '/dashboard/settings',
    label: 'Store Settings',
    desc: 'Customize your storefront',
    Icon: IconSettings,
  },
];

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
      <div className="space-y-6">
        <div className="skeleton h-36 rounded-[var(--radius-lg)] w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-[var(--radius-lg)]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-48 rounded-[var(--radius-lg)]" />
          <div className="skeleton h-48 rounded-[var(--radius-lg)]" />
        </div>
      </div>
    );
  }

  /* max sold count for progress bars */
  const maxSold = Math.max(1, ...(data?.topProducts?.map((p) => p.totalSold) ?? [1]));

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="show"
      variants={stagger()}
    >
      {/* ── Welcome banner ── */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-[var(--radius-lg)] py-8 px-8 text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-accent) 100%)' }}
      >
        <div className="relative z-10">
          <p className="eyebrow text-white/70 mb-1">Seller Dashboard</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="mt-2 opacity-75 text-sm leading-relaxed">
            Here&apos;s what&apos;s happening in your store today.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 inline-block" />
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

        {/* Large semi-transparent store icon */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-32 h-32 text-white opacity-10 pointer-events-none">
          <IconShop />
        </div>

        {/* Last updated */}
        <p className="absolute bottom-3 right-5 text-white/50 text-xs">Last updated just now</p>
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={stagger()}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <StatCard label="Total Orders" value={data?.totalOrders ?? 0} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="Total Revenue" value={formatPrice(data?.totalRevenue ?? 0)} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="Low Stock Items" value={data?.lowStock?.length ?? 0} caption="< 10 units" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="Top Product" value={data?.topProducts?.[0]?._id ?? '—'} />
        </motion.div>
      </motion.div>

      {/* ── Top products + Low stock ── */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={stagger()} initial="hidden" animate="show">

        {/* Top products */}
        <motion.div variants={fadeUp} className="p-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold tracking-tight text-[var(--text-main)]">Top Products</h2>
            <Link
              href="/dashboard/products"
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--color-brand)' }}
            >
              View all →
            </Link>
          </div>
          {data?.topProducts?.length ? (
            <div className="space-y-4">
              {data.topProducts.map((p, i) => (
                <div key={p._id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: 'var(--color-brand)' }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-[var(--text-secondary)] truncate max-w-[160px]">{p._id}</span>
                    </div>
                    <span className="bg-[var(--bg-sunken)] text-[var(--text-secondary)] rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0 font-tabular">
                      {p.totalSold} sold
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-[var(--bg-sunken)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((p.totalSold / maxSold) * 100)}%`,
                        backgroundColor: 'var(--color-brand)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--text-muted)]">No sales data yet.</p>
            </div>
          )}
        </motion.div>

        {/* Low stock */}
        <motion.div variants={fadeUp} className="p-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold tracking-tight text-[var(--text-main)]">Low Stock Alerts</h2>
            <Link
              href="/dashboard/products"
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--color-brand)' }}
            >
              Manage →
            </Link>
          </div>
          {data?.lowStock?.length ? (
            <div className="space-y-2">
              {data.lowStock.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between text-sm px-3 py-2.5 rounded-[var(--radius-md)]"
                  style={{ backgroundColor: p.stock === 0 ? 'color-mix(in oklch, var(--danger) 10%, white)' : 'color-mix(in oklch, var(--warning) 10%, white)' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.stock === 0 ? 'var(--danger)' : 'var(--warning)' }}
                    />
                    <span className="text-[var(--text-secondary)] truncate max-w-[180px]">{p.title}</span>
                  </div>
                  <span
                    className="text-xs font-semibold flex-shrink-0 px-2.5 py-1 rounded-full font-tabular"
                    style={{
                      backgroundColor: p.stock === 0 ? 'color-mix(in oklch, var(--danger) 16%, white)' : 'color-mix(in oklch, var(--warning) 16%, white)',
                      color: p.stock === 0 ? 'var(--danger)' : 'var(--warning)',
                    }}
                  >
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--text-muted)]">All products are well stocked.</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ── Quick action cards ── */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger()} initial="hidden" animate="show">
        {QUICK_ACTIONS.map(({ href, label, desc, Icon }) => (
          <motion.div
            key={href}
            variants={fadeUp}
            whileHover={{ y: -4 }}
          >
            <Link
              href={href}
              className="relative overflow-hidden flex items-center gap-4 p-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] hover:shadow-[var(--shadow-lift)] transition-shadow group"
            >
              <div className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0 bg-[var(--brand-soft)] text-[var(--brand-ink)]">
                <Icon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--text-main)] text-sm">{label}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{desc}</p>
              </div>
              {/* Chevron arrow */}
              <svg
                className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors flex-shrink-0"
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
