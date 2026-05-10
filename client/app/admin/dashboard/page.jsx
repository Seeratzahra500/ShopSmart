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
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
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
    iconColor: 'text-green-600',
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
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
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
    iconColor: 'text-orange-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
  },
];

function StatCard({ label, value, iconBg, iconColor, icon, index }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 relative overflow-hidden"
    >
      <div className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <p className="text-3xl font-bold tracking-tight text-gray-900">{value}</p>
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

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 leading-relaxed mt-0.5">Platform overview</p>
      </motion.div>

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
              iconColor={cfg.iconColor}
              icon={cfg.icon}
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
                    <span className="text-gray-500 flex-shrink-0 text-xs font-semibold">{p.totalSold} sold</span>
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
              <div className="space-y-3">
                {data.lowStock.map((p) => (
                  <div key={p._id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate max-w-[200px]">{p.title}</span>
                    <span className={`font-semibold flex-shrink-0 text-xs ${p.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </span>
                  </div>
                ))}
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
              icon: (
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h11m-5 0a2 2 0 100 4 2 2 0 000-4zm-6 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              ),
            },
            {
              href: '/admin/orders',
              label: 'View Orders',
              icon: (
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ),
            },
            {
              href: '/admin/users',
              label: 'Manage Users',
              icon: (
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87a4 4 0 100-8 4 4 0 000 8zm6-10a4 4 0 10-8 0 4 4 0 008 0z" />
                </svg>
              ),
            },
          ].map(({ href, label, icon }) => (
            <motion.div key={href} variants={fadeUp}>
              <Link
                href={href}
                className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow text-sm font-semibold text-gray-700"
              >
                <span className="flex-shrink-0">{icon}</span>
                {label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
