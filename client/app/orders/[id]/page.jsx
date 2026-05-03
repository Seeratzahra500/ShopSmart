'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PageWrapper from '@/components/PageWrapper';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-32 bg-gray-100 rounded-xl" />
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Order not found</h1>
        <Link href="/orders" className="text-sm hover:underline" style={{ color: 'var(--color-brand)' }}>← Back to orders</Link>
      </div>
    );
  }

  const stepIndex    = STEPS.indexOf(order.status);
  const isCancelled  = order.status === 'cancelled';

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/orders" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← My Orders
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className={`text-sm font-semibold px-3 py-1.5 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status}
          </span>
        </div>

        {/* Status stepper */}
        {!isCancelled && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-5">Order Progress</h2>
            <div className="flex items-center">
              {STEPS.map((step, i) => {
                const done    = i <= stepIndex;
                const current = i === stepIndex;
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                        style={done
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
                      <span className={`text-xs mt-1.5 capitalize font-medium ${done ? 'text-gray-700' : 'text-gray-400'}`}>
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
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Items Ordered</h2>
          <div className="divide-y divide-gray-50">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-800">{item.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <p className="font-semibold text-gray-700">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Shipping Address</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {order.shippingAddress?.street}<br />
            {order.shippingAddress?.city}, {order.shippingAddress?.zip}<br />
            {order.shippingAddress?.country}
          </p>
          {order.guestEmail && (
            <p className="text-sm text-gray-500 mt-2">Contact: {order.guestEmail}</p>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
