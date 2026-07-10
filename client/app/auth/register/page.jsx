'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const EyeOpen = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOff = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const rules = [
  { test: (p) => p.length >= 8,   label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p) => /[0-9]/.test(p), label: 'One number' },
];

const ROLES = [
  {
    value: 'customer',
    title: 'Shop as Customer',
    description: 'Browse stores, buy products, track orders',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    value: 'shopowner',
    title: 'Open a Store',
    description: 'Sell products, manage your storefront, track sales',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l1-5h16l1 5M3 9h18M3 9v11a1 1 0 001 1h4a1 1 0 001-1v-4h4v4a1 1 0 001 1h4a1 1 0 001-1V9" />
      </svg>
    ),
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole]           = useState('customer');
  const [form, setForm]           = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/\S+@\S+\.\S+/.test(form.email))            e.email    = 'Enter a valid email address';
    if (!rules.every((r) => r.test(form.password)))  e.password = 'Password does not meet requirements';
    if (form.password !== form.confirm)              e.confirm  = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name:     form.name,
        email:    form.email,
        password: form.password,
        role,
      });
      toast.success(
        role === 'shopowner'
          ? 'Store created! Please sign in to set it up.'
          : 'Account created! Please sign in.'
      );
      router.push('/auth/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  const passStrength = rules.filter((r) => r.test(form.password)).length;

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel — md+ only */}
      <div
        className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow orb */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 70%)' }}
        />

        <Link href="/" className="relative z-10 text-2xl font-bold tracking-tight text-white">
          ShopSmart
        </Link>

        <motion.div
          className="relative z-10 space-y-6"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-semibold uppercase tracking-widest text-gray-400"
          >
            Join thousands of sellers
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-5xl font-bold tracking-tight leading-tight text-white"
          >
            Your store.<br />Your brand.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-gray-400 leading-relaxed max-w-xs"
          >
            Set up your storefront in minutes. Customize your brand, list your products, and start selling today.
          </motion.p>
        </motion.div>

        <p className="relative z-10 text-xs text-gray-600">
          &copy; {new Date().getFullYear()} ShopSmart. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="md:hidden text-center mb-8">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--color-brand)' }}
            >
              ShopSmart
            </Link>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Get Started
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create Account</h1>
            <p className="text-gray-600 leading-relaxed mt-1 text-sm">
              Choose how you want to get started.
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex flex-col items-center text-center gap-2 p-4 rounded-2xl border-2 transition-all text-sm
                  ${role === r.value
                    ? 'border-[var(--color-brand)] bg-[color-mix(in_srgb,var(--color-brand)_8%,white)]'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <span
                  className="transition-colors"
                  style={{ color: role === r.value ? 'var(--color-brand)' : '#9ca3af' }}
                >
                  {r.icon}
                </span>
                <span
                  className="font-semibold leading-tight text-xs"
                  style={{ color: role === r.value ? 'var(--color-brand)' : '#374151' }}
                >
                  {r.title}
                </span>
                <span className="text-xs text-gray-400 leading-tight">{r.description}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                {role === 'shopowner' ? 'Store / Display Name' : 'Full Name'}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder={role === 'shopowner' ? 'My Awesome Shop' : 'Seerat Zahra'}
                autoComplete="name"
                className={`rounded-xl border w-full px-4 py-3 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none transition text-sm
                  ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
              />
              {role === 'shopowner' && !errors.name && (
                <p className="text-xs text-gray-400 mt-1">This becomes your store&apos;s URL slug</p>
              )}
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                autoComplete="email"
                className={`rounded-xl border w-full px-4 py-3 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none transition text-sm
                  ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`rounded-xl border w-full px-4 py-3 pr-11 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none transition text-sm
                    ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>

              {/* Strength meter */}
              {form.password && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors duration-300"
                        style={{
                          backgroundColor:
                            i < passStrength
                              ? passStrength === 1
                                ? '#ef4444'
                                : passStrength === 2
                                ? '#f59e0b'
                                : '#22c55e'
                              : '#e5e7eb',
                        }}
                      />
                    ))}
                  </div>
                  <ul className="space-y-0.5">
                    {rules.map((r) => (
                      <li
                        key={r.label}
                        className={`flex items-center gap-1.5 text-xs ${
                          r.test(form.password) ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        <span>{r.test(form.password) ? '✓' : '○'}</span>
                        {r.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`rounded-xl border w-full px-4 py-3 pr-11 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none transition text-sm
                    ${errors.confirm ? 'border-red-400' : 'border-gray-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-red-500 text-xs mt-1.5">{errors.confirm}</p>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 text-sm mt-2"
            >
              {loading
                ? 'Creating…'
                : role === 'shopowner'
                ? 'Create Store & Account'
                : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-semibold hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-brand)' }}
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
