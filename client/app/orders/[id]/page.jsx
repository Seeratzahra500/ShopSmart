'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-600',
};

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function OrderDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user)                    { router.replace(`/auth/login?next=/orders/${id}`); return; }
    if (user.role !== 'customer') { router.replace(user.role === 'admin' ? '/admin/dashboard' : '/dashboard'); return; }

    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id, user, authLoading, router]);

  if (authLoading || !user || user.role !== 'customer') return null;

  if (loading) {
    return (
      <PageWrapper>
        <div className="max-w-3xl mx-auto px-4 py-20 space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-6" />
          <div className="h-32 bg-gray-100 rounded-2xl" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
          <div className="h-28 bg-gray-100 rounded-2xl" />
        </div>
      </PageWrapper>
    );
  }

  if (!order) {
    return (
      <PageWrapper>
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto px-4 py-28 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-3">Order not found</h1>
          <Link href="/orders" className="text-sm hover:underline" style={{ color: 'var(--color-brand)' }}>
            ← Back to My Orders
          </Link>
        </motion.div>
      </PageWrapper>
    );
  }

  const stepIndex   = STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <PageWrapper>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-3xl mx-auto px-4 py-20"
      >
        {/* Back button */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            My Orders
          </Link>
        </motion.div>

        {/* Order header card */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-gray-400 mb-1">Order ID</p>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-PK', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold capitalize flex-shrink-0 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
            >
              {order.status}
            </span>
          </div>
        </motion.div>

        {/* Order progress */}
        {!isCancelled && (
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"
          >
            <h2 className="text-sm font-semibold text-gray-700 mb-6">Order Progress</h2>
            <div className="flex items-center">
              {STEPS.map((step, i) => {
                const done    = i <= stepIndex;
                const current = i === stepIndex;
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                        style={
                          done
                            ? { backgroundColor: 'var(--color-brand)', color: '#fff' }
                            : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                        }
                      >
                        {done && !current ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span
                        className={`text-xs mt-1.5 capitalize font-medium ${done ? 'text-gray-700' : 'text-gray-400'}`}
                      >
                        {step}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className="flex-1 h-0.5 mx-2 mb-4 rounded transition-colors"
                        style={{ backgroundColor: i < stepIndex ? 'var(--color-brand)' : '#e5e7eb' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Items list */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"
        >
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Items Ordered</h2>
          <div className="divide-y divide-gray-50 space-y-1">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                {/* Image placeholder */}
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm line-clamp-1">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <p className="font-semibold text-gray-800 text-sm flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Summary within items card */}
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-800">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </motion.div>

        {/* Shipping address */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Shipping Address</h2>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.zip}<br />
                {order.shippingAddress?.country}
              </p>
              {order.guestEmail && (
                <p className="text-sm text-gray-500 mt-2">
                  Contact: <span className="font-medium text-gray-700">{order.guestEmail}</span>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
}
