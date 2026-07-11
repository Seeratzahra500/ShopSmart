'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/formatPrice';
import { fadeUp } from '@/lib/motion';

export default function CartPage() {
  const { user, loading }  = useAuth();
  const { items, storeSlug, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const router = useRouter();

  // Cart works for guests (localStorage-backed); only non-customer roles
  // (admin/shopowner) are bounced since they can't shop.
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (user.role !== 'customer') {
      router.replace(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    }
  }, [user, loading, router]);

  const continueHref = storeSlug ? `/store/${storeSlug}` : '/stores';

  if (loading) return null;

  if (user && user.role !== 'customer') return null;

  if (!items.length) {
    return (
      <PageWrapper>
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="max-w-2xl mx-auto px-4 py-28"
        >
          <EmptyState
            title="Your cart is empty"
            description="Add some products to get started."
            action={<Button as={Link} href="/stores">Browse Stores</Button>}
          />
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
        className="max-w-5xl mx-auto px-4 py-20"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--text-main)]">Your Cart</h1>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={clearCart}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
          >
            Clear all
          </motion.button>
        </div>

        {/* Store badge */}
        {storeSlug && (
          <div className="mb-8">
            <Link
              href={`/store/${storeSlug}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors hover:bg-[var(--bg-sunken)]"
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
                  className="flex gap-4 bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-4 shadow-[var(--shadow-lift)] hover:shadow-[var(--shadow-overlay)] transition-shadow"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 bg-[var(--bg-sunken)] rounded-[var(--radius-md)] overflow-hidden">
                    {item.images?.[0] ? (
                      <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={storeSlug ? `/store/${storeSlug}/products/${item._id}` : `/products/${item._id}`}
                      className="font-medium text-[var(--text-main)] hover:underline line-clamp-1 leading-snug"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">{item.category}</p>
                    <p className="font-tabular font-semibold mt-1.5 text-sm" style={{ color: 'var(--color-brand)' }}>
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-end justify-between gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item._id)}
                      className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                      aria-label="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>

                    {/* Quantity stepper */}
                    <div className="flex items-center border border-[var(--border-strong)] rounded-[var(--radius-md)] overflow-hidden">
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="px-2.5 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] text-sm font-medium transition-colors"
                      >
                        −
                      </motion.button>
                      <span className="font-tabular px-3 py-1.5 text-sm font-semibold text-[var(--text-main)] border-x border-[var(--border-strong)]">
                        {item.quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="px-2.5 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] text-sm font-medium transition-colors"
                      >
                        +
                      </motion.button>
                    </div>

                    <p className="font-tabular text-sm font-semibold text-[var(--text-main)]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6 shadow-[var(--shadow-lift)] sticky top-24">
              <h2 className="font-display font-semibold tracking-tight text-lg text-[var(--text-main)] mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm text-[var(--text-secondary)] mb-5">
                <div className="flex justify-between">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-tabular font-medium text-[var(--text-main)]">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-[var(--success)] font-medium">Free</span>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-4 mb-6">
                <div className="flex justify-between font-semibold text-[var(--text-main)] text-base">
                  <span>Total</span>
                  <span className="font-tabular">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <Button as={Link} href="/checkout" className="w-full">
                Proceed to Checkout
              </Button>

              <Link
                href={continueHref}
                className="block text-center mt-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
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
