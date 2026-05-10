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

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function CartPage() {
  const { user, loading }  = useAuth();
  const { items, storeSlug, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (user.role !== 'customer') {
      router.replace(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    }
  }, [user, loading, router]);

  const continueHref = storeSlug ? `/store/${storeSlug}` : '/stores';

  if (loading) return null;

  if (!user) {
    return (
      <PageWrapper>
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto px-4 py-28 text-center"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-3">Sign in to view your cart</h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            Your cart is saved to your account. Please log in to continue.
          </p>
          <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
            <Link
              href="/auth/login?next=/cart"
              className="inline-block bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Log In
            </Link>
          </motion.div>
        </motion.div>
      </PageWrapper>
    );
  }

  if (user.role !== 'customer') return null;

  if (!items.length) {
    return (
      <PageWrapper>
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto px-4 py-28 text-center"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 leading-relaxed mb-8">Add some products to get started.</p>
          <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
            <Link
              href="/stores"
              className="inline-block bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Browse Stores
            </Link>
          </motion.div>
        </motion.div>
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
        className="max-w-5xl mx-auto px-4 py-20"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Cart</h1>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </motion.button>
        </div>

        {/* Store badge */}
        {storeSlug && (
          <div className="mb-8">
            <Link
              href={`/store/${storeSlug}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--color-brand)', color: 'var(--color-brand)' }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9l1-5h16l1 5M3 9h18M3 9v11a1 1 0 001 1h4a1 1 0 001-1v-4h4v4a1 1 0 001 1h4a1 1 0 001-1V9" />
              </svg>
              Shopping from /{storeSlug}
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence initial={false}>
              {items.map((item, index) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className="flex gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                    {item.images?.[0] ? (
                      <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={storeSlug ? `/store/${storeSlug}/products/${item._id}` : `/products/${item._id}`}
                      className="font-semibold text-gray-800 hover:underline line-clamp-1 leading-snug"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-400 mt-0.5">{item.category}</p>
                    <p className="font-bold mt-1.5 text-sm" style={{ color: 'var(--color-brand)' }}>
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-end justify-between gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item._id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                      aria-label="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>

                    {/* Quantity stepper */}
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 text-sm font-medium transition-colors"
                      >
                        −
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold text-gray-800 border-x border-gray-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 text-sm font-medium transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-sm font-semibold text-gray-700">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <h2 className="font-bold tracking-tight text-lg text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm text-gray-600 mb-5">
                <div className="flex justify-between">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium text-gray-800">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  href="/checkout"
                  className="block text-center w-full bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                  Proceed to Checkout
                </Link>
              </motion.div>

              <Link
                href={continueHref}
                className="block text-center mt-3 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </PageWrapper>
  );
}
