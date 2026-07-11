'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { SPRING } from '@/lib/motion';
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

const strengthTone = (strength) => {
  if (strength === 1) return 'var(--danger)';
  if (strength === 2) return 'var(--warning)';
  return 'var(--success)';
};

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token');

  const [form, setForm]           = useState({ password: '', confirm: '' });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!token) router.replace('/auth/forgot-password');
  }, [token, router]);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!rules.every((r) => r.test(form.password))) e.password = 'Password does not meet requirements';
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
      await api.post('/auth/reset-password', { token, password: form.password });
      setDone(true);
      toast.success('Password reset! Please sign in.');
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. The link may have expired.';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  const passStrength = rules.filter((r) => r.test(form.password)).length;

  if (!token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-[var(--bg-card)] rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-lift)] p-8"
      >
        {done ? (
          /* Success state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-5"
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...SPRING, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-[var(--success)]/12 flex items-center justify-center mx-auto"
            >
              <svg
                className="w-8 h-8 text-[var(--success)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <div>
              <h1 className="text-2xl tracking-tight text-[var(--text-main)]">Password reset!</h1>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mt-2">
                Your password has been reset successfully. Redirecting you to sign in…
              </p>
            </div>

            <Button as={Link} href="/auth/login" className="rounded-full">
              Go to Login
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-sunken)] flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-[var(--text-muted)]"
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
              </div>
              <h1 className="text-2xl tracking-tight text-[var(--text-main)]">Reset your password</h1>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mt-1">
                Choose a strong new password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    autoFocus
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

              {errors.form && (
                <p className="text-sm text-center text-[var(--danger)] bg-[var(--danger)]/8 border border-[var(--danger)]/20 rounded-[var(--radius-md)] py-2.5 px-3">
                  {errors.form}
                </p>
              )}

              <Button type="submit" loading={loading} className="w-full rounded-full" size="lg">
                {loading ? 'Resetting…' : 'Reset Password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
