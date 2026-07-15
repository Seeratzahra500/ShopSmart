'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';
import { fadeUp } from '@/lib/motion';

const FIELDS = [
  { name: 'street',  label: 'Street Address',   placeholder: 'House 12, Street 4, Sector G-9' },
  { name: 'city',    label: 'City',              placeholder: 'Islamabad' },
  { name: 'country', label: 'Country',           placeholder: 'Pakistan' },
  { name: 'zip',     label: 'ZIP / Postal Code', placeholder: '44000' },
];

const STEPS = ['Cart', 'Details', 'Confirm'];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, storeSlug, cartTotal, clearCart } = useCart();

  const [form, setForm]       = useState({ street: '', city: '', country: 'Pakistan', zip: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    FIELDS.forEach(({ name, label }) => {
      if (!form[name].trim()) e[name] = `${label} is required`;
    });

    if (form.city.trim() && !/^[a-zA-Z\s\-'\.]+$/.test(form.city.trim()))
      e.city = 'City must contain letters only';

    if (form.country.trim() && !/^[a-zA-Z\s]+$/.test(form.country.trim()))
      e.country = 'Country must contain letters only';

    if (form.zip.trim() && !/^[a-zA-Z0-9][a-zA-Z0-9 \-]{1,9}$/.test(form.zip.trim()))
      e.zip = 'Enter a valid ZIP / postal code (e.g. 44000, SW1A 1AA)';

    if (!items.length) e.items = 'Your cart is empty';
    if (!storeSlug) e.items = 'Cart has no store associated. Please add items from a store.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const payload = {
        storeSlug,
        items:           items.map((i) => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: form,
      };
      const { data } = await api.post('/orders', payload);
      clearCart();
      toast.success('Order placed successfully!');
      router.push(`/orders/${data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Checkout requires an account: guests can build a cart, but must sign in
  // (or register) before placing an order. Wait for the auth restore to finish
  // so a logged-in reload doesn't flash the sign-in gate.
  if (authLoading) return <PageWrapper><div className="py-40" /></PageWrapper>;

  if (!user) {
    return (
      <PageWrapper>
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="max-w-xl mx-auto px-4 py-28 text-center"
        >
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-lift)]">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-main)] mb-2">
              Sign in to checkout
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
              Your cart is saved. Sign in — or create an account — and your items will come with you.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button as={Link} href="/auth/login?next=/checkout">Sign In</Button>
              <Button as={Link} variant="secondary" href="/auth/register">Create Account</Button>
            </div>
          </div>
        </motion.div>
      </PageWrapper>
    );
  }

  if (user.role !== 'customer') {
    return (
      <PageWrapper>
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="max-w-xl mx-auto px-4 py-28 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--warning)]/10 border border-[var(--warning)]/30 mb-6">
            <svg className="w-10 h-10 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-9a3 3 0 100 6 3 3 0 000-6zm0 0V4m6.364 1.636l-1.414 1.414M4 6l1.414 1.414M20 12h2M2 12h2m16.364 6.364l-1.414-1.414M4 18l1.414-1.414" />
            </svg>
          </div>
          <div className="bg-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-[var(--radius-lg)] p-6 mb-6 text-left">
            <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--warning)] mb-2">Shopping not available</h1>
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
              Admin and shopowner accounts cannot make purchases. Please log in with a customer account to shop.
            </p>
          </div>
          <Button as={Link} href="/auth/login">Log in as Customer</Button>
        </motion.div>
      </PageWrapper>
    );
  }

  if (!items.length) {
    return (
      <PageWrapper>
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="max-w-xl mx-auto px-4 py-28"
        >
          <EmptyState
            title="Nothing to checkout"
            description="Add items to your cart first."
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
        {/* Progress indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-0">
            {STEPS.map((step, i) => {
              const isActive   = i === 1; // "Details" step is current
              const isComplete = i === 0; // "Cart" step is done
              const on = isActive || isComplete;
              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={[
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                        on ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--bg-sunken)] text-[var(--text-muted)]',
                        isActive ? 'ring-4 ring-[var(--brand-soft)]' : '',
                      ].join(' ')}
                    >
                      {isComplete ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className="text-xs mt-1.5 font-medium"
                      style={{ color: on ? 'var(--color-brand)' : 'var(--text-muted)' }}
                    >
                      {step}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="w-16 h-0.5 mx-2 mb-4 rounded transition-colors"
                      style={{ backgroundColor: isComplete ? 'var(--color-brand)' : 'var(--border)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Page heading + store back link */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--text-main)]">Checkout</h1>
          {storeSlug && (
            <Link
              href={`/store/${storeSlug}`}
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--color-brand)' }}
            >
              ← Back to /{storeSlug}
            </Link>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping address */}
              <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6 shadow-[var(--shadow-lift)]">
                <h2 className="font-display font-semibold tracking-tight text-[var(--text-main)] mb-1">Shipping Information</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-5">Enter the address where you&apos;d like your order delivered.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {FIELDS.map(({ name, label, placeholder }) => (
                    <Input
                      key={name}
                      className={name === 'street' ? 'sm:col-span-2' : ''}
                      label={label}
                      type="text"
                      name={name}
                      value={form[name]}
                      onChange={set(name)}
                      placeholder={placeholder}
                      error={errors[name]}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div>
              <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6 shadow-[var(--shadow-lift)] sticky top-24">
                <h2 className="font-display font-semibold tracking-tight text-[var(--text-main)] mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm text-[var(--text-secondary)]">
                      <span className="truncate max-w-[160px] leading-relaxed">
                        {item.title} × {item.quantity}
                      </span>
                      <span className="font-tabular font-medium flex-shrink-0 ml-2 text-[var(--text-main)]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--border)] pt-4 mb-2">
                  <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-2">
                    <span>Shipping</span>
                    <span className="text-[var(--success)] font-medium">Free</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[var(--text-main)] text-base">
                    <span>Total</span>
                    <span className="font-tabular">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <p className="text-xs text-[var(--success)] mb-5">Free shipping included</p>

                {errors.items && (
                  <p className="text-[var(--danger)] text-xs mb-4 bg-[var(--danger)]/8 border border-[var(--danger)]/20 rounded-[var(--radius-md)] px-3 py-2">
                    {errors.items}
                  </p>
                )}

                <Button type="submit" loading={loading} className="w-full">
                  {loading ? 'Placing order…' : 'Place Order'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </PageWrapper>
  );
}
