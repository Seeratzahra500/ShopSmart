'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-stone-100 text-stone-700',
  shipped:    'bg-[#988686]/20 text-[#5C4E4E]',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-600',
};

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user)                     { router.replace('/auth/login?next=/orders'); return; }
    if (user.role !== 'customer')  { router.replace(user.role === 'admin' ? '/admin/dashboard' : '/dashboard'); return; }

    api.get('/orders/my')
      .then(({ data }) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || !user || user.role !== 'customer') return null;

  if (loading) {
    return (
      <PageWrapper>
        <div className="max-w-3xl mx-auto px-4 py-20 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-40" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-20" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-full mt-3" />
            </div>
          ))}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto px-4 py-20"
      >
        {/* Heading */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Orders</h1>
          {orders.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
              {orders.length}
            </span>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              You haven&apos;t placed any orders yet. Start shopping to see them here.
            </p>
            <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
              <Link
                href="/stores"
                className="inline-block bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Start Shopping
              </Link>
            </motion.div>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <div className="overflow-x-auto">
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow mb-4"
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Left info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <p className="font-mono text-xs text-gray-400">
                            #{order._id.slice(-8).toUpperCase()}
                          </p>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          <span className="text-gray-400 mx-1.5">·</span>
                          {formatPrice(order.totalAmount)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">
                          {order.items.map((i) => i.title).join(', ')}
                        </p>
                      </div>

                      {/* View details */}
                      <div className="flex-shrink-0">
                        <motion.div whileTap={{ scale: 0.97 }}>
                          <Link
                            href={`/orders/${order._id}`}
                            className="inline-block border border-gray-200 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            View Details
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </PageWrapper>
  );
}
