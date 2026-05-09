'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageWrapper from '@/components/PageWrapper';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
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
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-500 mb-6">You haven&apos;t placed any orders yet.</p>
            <Link href="/stores" className="inline-block px-6 py-2.5 text-white rounded-lg font-medium" style={{ backgroundColor: 'var(--color-brand)' }}>
              Browse Stores
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order._id} href={`/orders/${order._id}`}>
                <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p className="font-semibold text-gray-800">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {formatPrice(order.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize flex-shrink-0 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-1">
                    {order.items.map((i) => i.title).join(', ')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
