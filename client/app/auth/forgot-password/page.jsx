'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const LockIcon = () => (
  <svg
    className="w-12 h-12 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-10 h-10 text-green-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
      >
        {sent ? (
          /* Success state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="text-center space-y-5"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto"
            >
              <CheckIcon />
            </motion.div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Check your email</h1>
              <p className="text-gray-500 text-sm leading-relaxed mt-2">
                If{' '}
                <span className="font-semibold text-gray-700">{email}</span>{' '}
                is registered, a password reset link has been sent. It expires in{' '}
                <span className="font-semibold">1 hour</span>.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Don&apos;t see it? Check your spam folder.
              </p>
            </div>

            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-brand)' }}
            >
              Try a different email
            </button>
          </motion.div>
        ) : (
          /* Form state */
          <>
            <div className="flex flex-col items-center text-center mb-8 space-y-3">
              <LockIcon />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Forgot your password?
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed mt-1">
                  Enter your account email and we&apos;ll send you a link to reset your password.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  className={`rounded-xl border w-full px-4 py-3 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none transition text-sm
                    ${error ? 'border-red-400' : 'border-gray-200'}`}
                />
                {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </motion.button>
            </form>
          </>
        )}

        <p className="text-center mt-6">
          <Link
            href="/auth/login"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
          >
            ← Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
