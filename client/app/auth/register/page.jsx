'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const rules = [
  { test: (p) => p.length >= 8,        label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p),      label: 'One uppercase letter' },
  { test: (p) => /[0-9]/.test(p),      label: 'One number' },
];

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                      e.name     = 'Name is required';
    if (!/\S+@\S+\.\S+/.test(form.email))       e.email    = 'Enter a valid email address';
    if (!rules.every((r) => r.test(form.password))) e.password = 'Password does not meet requirements';
    if (form.password !== form.confirm)          e.confirm  = 'Passwords do not match';
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
      });
      toast.success('Account created! Please sign in.');
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
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold" style={{ color: 'var(--color-brand)' }}>
            ShopSmart
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 mt-3">Create an account</h1>
          <p className="text-sm text-gray-500 mt-1">Start selling in minutes</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Seerat Zahra"
              autoComplete="name"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors
                ${errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors
                ${errors.email ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors
                  ${errors.password ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'}`}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPass ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-colors duration-300"
                      style={{
                        backgroundColor: i < passStrength
                          ? passStrength === 1 ? '#ef4444' : passStrength === 2 ? '#f59e0b' : '#22c55e'
                          : '#e5e7eb',
                      }}
                    />
                  ))}
                </div>
                <ul className="space-y-0.5">
                  {rules.map((r) => (
                    <li key={r.label} className={`flex items-center gap-1.5 text-xs ${r.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <span>{r.test(form.password) ? '✓' : '○'}</span>
                      {r.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="••••••••"
              autoComplete="new-password"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors
                ${errors.confirm ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'}`}
            />
            {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium hover:underline" style={{ color: 'var(--color-brand)' }}>
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
