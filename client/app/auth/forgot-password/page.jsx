'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-xl font-semibold text-gray-900 mt-3">Forgot password?</h1>
          <p className="text-sm text-gray-500 mt-1">
            {sent ? 'Check your inbox' : "We'll send you a reset link"}
          </p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'color-mix(in srgb, var(--color-brand) 10%, white)' }}>
              <svg className="w-7 h-7" style={{ color: 'var(--color-brand)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              If <span className="font-medium text-gray-800">{email}</span> is registered, a password reset link has been sent. It expires in <span className="font-medium">1 hour</span>.
            </p>
            <p className="text-xs text-gray-400">Don&apos;t see it? Check your spam folder.</p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="text-sm hover:underline"
              style={{ color: 'var(--color-brand)' }}
            >
              Try a different email
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors
                  ${error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'}`}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </motion.button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/auth/login" className="font-medium hover:underline" style={{ color: 'var(--color-brand)' }}>
            ← Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
