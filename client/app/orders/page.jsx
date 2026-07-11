'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';
import { fadeUp, stagger } from '@/lib/motion';

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
            <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--border)] p-5 skeleton">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-[var(--border)] rounded w-24" />
                  <div className="h-4 bg-[var(--border)] rounded w-40" />
                  <div className="h-3 bg-[var(--border)] rounded w-32" />
                </div>
                <div className="h-6 bg-[var(--border)] rounded-full w-20" />
              </div>
              <div className="h-3 bg-[var(--border)] rounded w-full mt-3" />
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
        className="max-w-3xl mx-auto px-4 py-20"
      >
        {/* Heading */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--text-main)]">My Orders</h1>
          {orders.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--bg-sunken)] text-[var(--text-secondary)]">
              {orders.length}
            </span>
          )}
        </div>

        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="You haven't placed any orders yet. Start shopping to see them here."
            action={<Button as={Link} href="/stores">Start Shopping</Button>}
          />
        ) : (
          <motion.div
            variants={stagger()}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <div className="overflow-x-auto">
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  variants={fadeUp}
                  className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-lift)] hover:shadow-[var(--shadow-overlay)] transition-shadow mb-4"
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Left info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <p className="font-tabular text-xs text-[var(--text-muted)]">
                            #{order._id.slice(-8).toUpperCase()}
                          </p>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="font-medium text-[var(--text-main)] text-sm">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          <span className="text-[var(--text-muted)] mx-1.5">·</span>
                          <span className="font-tabular">{formatPrice(order.totalAmount)}</span>
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1.5 line-clamp-1">
                          {order.items.map((i) => i.title).join(', ')}
                        </p>
                      </div>

                      {/* View details */}
                      <div className="flex-shrink-0">
                        <Button as={Link} href={`/orders/${order._id}`} variant="secondary" size="sm">
                          View Details
                        </Button>
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
