'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { fadeUp, stagger, EASE } from '@/lib/motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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

const strengthTone = (strength) => {
  if (strength === 1) return 'var(--danger)';
  if (strength === 2) return 'var(--warning)';
  return 'var(--success)';
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
      {/* Left editorial panel — md+ only */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-[var(--text-main)]">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow orb */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 70%)' }}
        />

        <Link href="/" className="relative z-10 font-display text-2xl font-semibold tracking-tight text-white">
          ShopSmart
        </Link>

        <motion.div
          className="relative z-10 space-y-6"
          initial="hidden"
          animate="show"
          variants={stagger(0.1)}
        >
          <motion.p variants={fadeUp} className="eyebrow text-white/50">
            Join thousands of sellers
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-display text-5xl font-semibold tracking-tight leading-tight text-white"
          >
            Your store.<br />Your brand.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/60 leading-relaxed max-w-xs">
            Set up your storefront in minutes. Customize your brand, list your products, and start selling today.
          </motion.p>
        </motion.div>

        <p className="relative z-10 text-xs text-white/35">
          &copy; {new Date().getFullYear()} ShopSmart. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[var(--bg-page)] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="md:hidden text-center mb-8">
            <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-[var(--color-brand)]">
              ShopSmart
            </Link>
          </div>

          <div className="mb-6">
            <p className="eyebrow mb-2">Get Started</p>
            <h1 className="text-3xl tracking-tight text-[var(--text-main)]">Create Account</h1>
            <p className="text-[var(--text-secondary)] leading-relaxed mt-1 text-sm">
              Choose how you want to get started.
            </p>
          </div>

          {/* Role selector — segmented control */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map((r) => {
              const active = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={[
                    'flex flex-col items-center text-center gap-2 p-4 rounded-[var(--radius-lg)] border transition-all text-sm',
                    active
                      ? 'border-[var(--color-brand)] bg-[var(--brand-soft)]'
                      : 'border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-sunken)]',
                  ].join(' ')}
                >
                  <span className={active ? 'text-[var(--color-brand)]' : 'text-[var(--text-muted)]'}>
                    {r.icon}
                  </span>
                  <span className={[
                    'font-semibold leading-tight text-xs',
                    active ? 'text-[var(--color-brand)]' : 'text-[var(--text-main)]',
                  ].join(' ')}>
                    {r.title}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] leading-tight">{r.description}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <Input
                label={role === 'shopowner' ? 'Store / Display Name' : 'Full Name'}
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder={role === 'shopowner' ? 'My Awesome Shop' : 'Seerat Zahra'}
                autoComplete="name"
                error={errors.name}
              />
              {role === 'shopowner' && !errors.name && (
                <p className="text-xs text-[var(--text-muted)] mt-1">This becomes your store&apos;s URL slug</p>
              )}
            </div>

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
            />

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  error={errors.password}
                  className="[&_input]:pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
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
                          backgroundColor: i < passStrength ? strengthTone(passStrength) : 'var(--border)',
                        }}
                      />
                    ))}
                  </div>
                  <ul className="space-y-0.5">
                    {rules.map((r) => (
                      <li
                        key={r.label}
                        className={`flex items-center gap-1.5 text-xs ${
                          r.test(form.password) ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        <span>{r.test(form.password) ? '✓' : '○'}</span>
                        {r.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  error={errors.confirm}
                  className="[&_input]:pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full rounded-full mt-2" size="lg">
              {loading
                ? 'Creating…'
                : role === 'shopowner'
                ? 'Create Store & Account'
                : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-semibold text-[var(--color-brand)] hover:opacity-70 transition-opacity"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
