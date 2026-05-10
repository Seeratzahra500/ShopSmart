'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

/* ── SVG icons ── */
const IconOrders = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);
const IconRevenue = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.5A2.5 2.5 0 0 0 12 7v0a2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 1 0 5v0a2.5 2.5 0 0 1-2.5-2.5" />
    <path d="M12 7V5.5M12 18.5V17" />
  </svg>
);
const IconWarning = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconTrophy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
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

/* ── Stat card configs ── */
const STAT_CONFIGS = [
  {
    key: 'orders',
    topBarClass: 'bg-[var(--color-brand)]',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    Icon: IconOrders,
  },
  {
    key: 'revenue',
    topBarClass: 'bg-emerald-400',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    Icon: IconRevenue,
  },
  {
    key: 'lowStock',
    topBarClass: 'bg-amber-400',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    Icon: IconWarning,
  },
  {
    key: 'topProduct',
    topBarClass: 'bg-purple-400',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    Icon: IconTrophy,
  },
];

function StatCard({ label, value, sub, config, delay }) {
  const { topBarClass, iconBg, iconColor, Icon } = config;
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
      className="relative pt-1 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
    >
      {/* Colored top bar */}
      <div className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl ${topBarClass}`} />
      <div className="p-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
          <Icon />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Quick action card configs ── */
const QUICK_ACTIONS = [
  {
    href: '/dashboard/products',
    label: 'Manage Products',
    desc: 'Add, edit, or remove items',
    Icon: IconProducts,
    topBarClass: 'bg-[var(--color-brand)]',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    hoverShadow: 'hover:shadow-indigo-100',
  },
  {
    href: '/dashboard/orders',
    label: 'View Orders',
    desc: 'Track and update orders',
    Icon: IconOrdersAction,
    topBarClass: 'bg-blue-400',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    hoverShadow: 'hover:shadow-blue-100',
  },
  {
    href: '/dashboard/settings',
    label: 'Store Settings',
    desc: 'Customize your storefront',
    Icon: IconSettings,
    topBarClass: 'bg-purple-400',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    hoverShadow: 'hover:shadow-purple-100',
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
      <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-gray-200 rounded-2xl w-full" />
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

  /* max sold count for progress bars */
  const maxSold = Math.max(1, ...(data?.topProducts?.map((p) => p.totalSold) ?? [1]));

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      {/* ── Welcome banner ── */}
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
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <StatCard
          label="Total Orders"
          value={data?.totalOrders ?? 0}
          config={STAT_CONFIGS[0]}
          delay={0}
        />
        <StatCard
          label="Total Revenue"
          value={formatPrice(data?.totalRevenue ?? 0)}
          config={STAT_CONFIGS[1]}
          delay={0.05}
        />
        <StatCard
          label="Low Stock Items"
          value={data?.lowStock?.length ?? 0}
          sub="< 10 units"
          config={STAT_CONFIGS[2]}
          delay={0.1}
        />
        <StatCard
          label="Top Product"
          value={data?.topProducts?.[0]?._id ?? '—'}
          config={STAT_CONFIGS[3]}
          delay={0.15}
        />
      </motion.div>

      {/* ── Top products + Low stock ── */}
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
                      {/* Colored dot indicator */}
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: 'var(--color-brand)' }}
                      />
                      <span className="text-gray-700 truncate max-w-[160px]">{p._id}</span>
                    </div>
                    <span className="bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0">
                      {p.totalSold} sold
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
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
            <div className="space-y-2">
              {data.lowStock.map((p) => (
                <div
                  key={p._id}
                  className={`flex items-center justify-between text-sm px-3 py-2.5 rounded-xl ${
                    p.stock === 0 ? 'bg-red-50' : 'bg-amber-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* Colored dot */}
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        p.stock === 0 ? 'bg-red-400' : 'bg-amber-400'
                      }`}
                    />
                    <span className="text-gray-700 truncate max-w-[180px]">{p.title}</span>
                  </div>
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

      {/* ── Quick action cards ── */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" animate="show">
        {QUICK_ACTIONS.map(({ href, label, desc, Icon, topBarClass, iconBg, iconColor, hoverShadow }) => (
          <motion.div
            key={href}
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
          >
            <Link
              href={href}
              className={`relative overflow-hidden flex items-center gap-4 p-6 pt-7 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md ${hoverShadow} transition-shadow group`}
            >
              {/* Top gradient strip */}
              <div className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl ${topBarClass}`} />
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
                <Icon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
              {/* Chevron arrow */}
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
