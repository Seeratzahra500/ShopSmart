'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/formatPrice';

export default function CartPage() {
  const { user, loading }  = useAuth();
  const { items, storeSlug, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) return; // handled by the render guard below
    if (user.role !== 'customer') {
      router.replace(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    }
  }, [user, loading, router]);

  const continueHref = storeSlug ? `/store/${storeSlug}` : '/stores';

  if (loading) return null;

  if (!user) {
    return (
      <PageWrapper>
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Sign in to view your cart</h1>
          <p className="text-gray-500 mb-6">Your cart is saved to your account. Please log in to continue.</p>
          <Link
            href="/auth/login?next=/cart"
            className="inline-block px-6 py-2.5 text-white rounded-lg font-medium hover:opacity-90"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            Log In
          </Link>
        </div>
      </PageWrapper>
    );
  }

  if (user.role !== 'customer') return null;

  if (!items.length) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Add some products to get started.</p>
          <Link
            href="/stores"
            className="inline-block px-8 py-3 text-white font-semibold rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            Browse Stores
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        </div>

        {/* Store badge */}
        {storeSlug && (
          <div className="mb-6">
            <Link
              href={`/store/${storeSlug}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--color-brand)', color: 'var(--color-brand)' }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l1-5h16l1 5M3 9h18M3 9v11a1 1 0 001 1h4a1 1 0 001-1v-4h4v4a1 1 0 001 1h4a1 1 0 001-1V9" />
              </svg>
              Shopping from /{storeSlug}
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4"
                >
                  <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {item.images?.[0] ? (
                      <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={storeSlug ? `/store/${storeSlug}/products/${item._id}` : `/products/${item._id}`}
                      className="font-medium text-gray-800 hover:underline line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-400 mt-0.5">{item.category}</p>
                    <p className="font-bold mt-1 text-sm" style={{ color: 'var(--color-brand)' }}>
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                      aria-label="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-2 py-1 text-gray-500 hover:bg-gray-100 text-sm">−</button>
                      <span className="px-3 py-1 text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2 py-1 text-gray-500 hover:bg-gray-100 text-sm">+</button>
                    </div>

                    <p className="text-sm font-semibold text-gray-700">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block text-center py-3 text-white font-semibold rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--color-brand)' }}
              >
                Proceed to Checkout
              </Link>

              <Link
                href={continueHref}
                className="block text-center mt-3 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
