'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageWrapper from '@/components/PageWrapper';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';

const FIELDS = [
  { name: 'street',  label: 'Street Address',   placeholder: 'House 12, Street 4, Sector G-9' },
  { name: 'city',    label: 'City',              placeholder: 'Islamabad' },
  { name: 'country', label: 'Country',           placeholder: 'Pakistan' },
  { name: 'zip',     label: 'ZIP / Postal Code', placeholder: '44000' },
];

const STEPS = ['Cart', 'Details', 'Confirm'];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, storeSlug, cartTotal, clearCart } = useCart();

  const [form, setForm]       = useState({ street: '', city: '', country: 'Pakistan', zip: '' });
  const [guestEmail, setGuest] = useState('');
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

    if (!user && !/\S+@\S+\.\S+/.test(guestEmail)) e.guestEmail = 'Valid email required for guest checkout';
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
        guestEmail:      user ? undefined : guestEmail,
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

  if (user && user.role !== 'customer') {
    return (
      <PageWrapper>
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto px-4 py-28 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border border-amber-200 mb-6">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-9a3 3 0 100 6 3 3 0 000-6zm0 0V4m6.364 1.636l-1.414 1.414M4 6l1.414 1.414M20 12h2M2 12h2m16.364 6.364l-1.414-1.414M4 18l1.414-1.414" />
            </svg>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-left">
            <h1 className="text-xl font-bold tracking-tight text-amber-900 mb-2">Shopping not available</h1>
            <p className="text-amber-700 leading-relaxed text-sm">
              Admin and shopowner accounts cannot make purchases. Please log in with a customer account to shop.
            </p>
          </div>
          <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
            <Link
              href="/auth/login"
              className="inline-block bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Log in as Customer
            </Link>
          </motion.div>
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
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto px-4 py-28 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-3">Nothing to checkout</h1>
          <p className="text-gray-600 leading-relaxed mb-8">Add items to your cart first.</p>
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
        {/* Progress indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-0">
            {STEPS.map((step, i) => {
              const isActive   = i === 1; // "Details" step is current
              const isComplete = i === 0; // "Cart" step is done
              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={
                        isComplete
                          ? { backgroundColor: 'var(--color-brand)', color: '#fff' }
                          : isActive
                          ? { backgroundColor: 'var(--color-brand)', color: '#fff', boxShadow: '0 0 0 4px color-mix(in srgb, var(--color-brand) 20%, transparent)' }
                          : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                      }
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
                      style={{ color: isActive || isComplete ? 'var(--color-brand)' : '#9ca3af' }}
                    >
                      {step}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="w-16 h-0.5 mx-2 mb-4 rounded transition-colors"
                      style={{ backgroundColor: isComplete ? 'var(--color-brand)' : '#e5e7eb' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Page heading + store back link */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Checkout</h1>
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
              {/* Guest email */}
              {!user && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-bold tracking-tight text-gray-900 mb-1">Contact</h2>
                  <p className="text-sm text-gray-500 mb-5">We'll send your order confirmation here.</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => { setGuest(e.target.value); if (errors.guestEmail) setErrors((p) => ({ ...p, guestEmail: '' })); }}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors
                        ${errors.guestEmail ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-[var(--color-brand)] focus:border-transparent'}`}
                    />
                    {errors.guestEmail && <p className="text-red-500 text-xs mt-1.5">{errors.guestEmail}</p>}
                  </div>
                </div>
              )}

              {/* Shipping address */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold tracking-tight text-gray-900 mb-1">Shipping Information</h2>
                <p className="text-sm text-gray-500 mb-5">Enter the address where you'd like your order delivered.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {FIELDS.map(({ name, label, placeholder }) => (
                    <div key={name} className={name === 'street' ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                      <input
                        type="text"
                        value={form[name]}
                        onChange={set(name)}
                        placeholder={placeholder}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors
                          ${errors[name] ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-[var(--color-brand)] focus:border-transparent'}`}
                      />
                      {errors[name] && <p className="text-red-500 text-xs mt-1.5">{errors[name]}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
                <h2 className="font-bold tracking-tight text-gray-900 mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm text-gray-600">
                      <span className="truncate max-w-[160px] leading-relaxed">
                        {item.title} × {item.quantity}
                      </span>
                      <span className="font-medium flex-shrink-0 ml-2 text-gray-800">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base">
                    <span>Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <p className="text-xs text-green-600 mb-5">Free shipping included</p>

                {errors.items && (
                  <p className="text-red-500 text-xs mb-4 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    {errors.items}
                  </p>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {loading ? 'Placing order…' : 'Place Order'}
                </motion.button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </PageWrapper>
  );
}
