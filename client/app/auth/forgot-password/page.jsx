'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { SPRING, EASE } from '@/lib/motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const LockIcon = () => (
  <svg
    className="w-12 h-12 text-[var(--text-muted)]"
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
    className="w-10 h-10 text-[var(--success)]"
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-md bg-[var(--bg-card)] rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-lift)] p-8"
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
              transition={{ ...SPRING, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-[var(--success)]/12 flex items-center justify-center mx-auto"
            >
              <CheckIcon />
            </motion.div>

            <div>
              <h1 className="text-2xl tracking-tight text-[var(--text-main)]">Check your email</h1>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mt-2">
                If{' '}
                <span className="font-semibold text-[var(--text-main)]">{email}</span>{' '}
                is registered, a password reset link has been sent. It expires in{' '}
                <span className="font-semibold">1 hour</span>.
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Don&apos;t see it? Check your spam folder.
              </p>
            </div>

            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="text-sm font-medium text-[var(--color-brand)] hover:opacity-70 transition-opacity"
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
                <h1 className="text-2xl tracking-tight text-[var(--text-main)]">
                  Forgot your password?
                </h1>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mt-1">
                  Enter your account email and we&apos;ll send you a link to reset your password.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                error={error}
              />

              <Button type="submit" loading={loading} className="w-full rounded-full" size="lg">
                {loading ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </form>
          </>
        )}

        <p className="text-center mt-6">
          <Link
            href="/auth/login"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors font-medium"
          >
            ← Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
