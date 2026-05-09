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
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Shopping not available</h1>
          <p className="text-gray-500 mb-6">
            Admin and shopowner accounts cannot make purchases.<br />
            Please log in with a customer account to shop.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2.5 text-white rounded-lg font-medium hover:opacity-90"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            Log in as Customer
          </Link>
        </div>
      </PageWrapper>
    );
  }

  if (!items.length) {
    return (
      <PageWrapper>
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Nothing to checkout</h1>
          <p className="text-gray-500 mb-6">Add items to your cart first.</p>
          <Link
            href="/stores"
            className="inline-block px-6 py-2.5 text-white rounded-lg font-medium hover:opacity-90"
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
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
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

        <form onSubmit={handleSubmit} noValidate className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Guest email */}
              {!user && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="font-semibold text-gray-800 mb-4">Contact</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => { setGuest(e.target.value); if (errors.guestEmail) setErrors((p) => ({ ...p, guestEmail: '' })); }}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors
                        ${errors.guestEmail ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'}`}
                    />
                    {errors.guestEmail && <p className="text-red-500 text-xs mt-1">{errors.guestEmail}</p>}
                  </div>
                </div>
              )}

              {/* Shipping address */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {FIELDS.map(({ name, label, placeholder }) => (
                    <div key={name} className={name === 'street' ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input
                        type="text"
                        value={form[name]}
                        onChange={set(name)}
                        placeholder={placeholder}
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors
                          ${errors[name] ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'}`}
                      />
                      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div>
              <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
                <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm text-gray-600">
                      <span className="truncate max-w-[160px]">{item.title} × {item.quantity}</span>
                      <span className="font-medium flex-shrink-0 ml-2">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 mb-5">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Free shipping included</p>
                </div>

                {errors.items && <p className="text-red-500 text-xs mb-3">{errors.items}</p>}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white font-semibold rounded-lg transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: 'var(--color-brand)' }}
                >
                  {loading ? 'Placing order…' : 'Place Order'}
                </motion.button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}
