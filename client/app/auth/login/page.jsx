'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
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

export default function LoginPage() {
  const router       = useRouter();
  const { login }    = useAuth();

  const [form, setForm]         = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = 'Enter a valid email address';
    if (!form.password)                    e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const user = await login(form.email, form.password, form.rememberMe);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);

      if (user.role === 'admin')     { window.location.href = '/admin/dashboard'; return; }
      if (user.role === 'shopowner') { window.location.href = '/dashboard'; return; }

      const next = new URLSearchParams(window.location.search).get('next');
      router.push(next && next.startsWith('/') ? next : '/stores');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  return (
    <div className="min-h-screen flex">
      {/* Left editorial panel — md+ only */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-[var(--text-main)]">
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Gradient glow orb */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-brand), transparent 70%)' }}
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
            Your Commerce, Elevated
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-display text-5xl font-semibold tracking-tight leading-tight text-white"
          >
            Your store.<br />Your brand.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/60 leading-relaxed max-w-xs">
            Launch your storefront, reach customers everywhere, and grow your business — all in one place.
          </motion.p>
        </motion.div>

        <p className="relative z-10 text-xs text-white/35">
          &copy; {new Date().getFullYear()} ShopSmart. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-[var(--bg-page)]">
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

          <div className="mb-8">
            <p className="eyebrow mb-2">Sign In</p>
            <h1 className="text-3xl tracking-tight text-[var(--text-main)]">Welcome back</h1>
            <p className="text-[var(--text-secondary)] leading-relaxed mt-1 text-sm">
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[var(--text-secondary)]">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-[var(--color-brand)] hover:opacity-70 transition-opacity"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={set('rememberMe')}
                className="w-4 h-4 rounded accent-[var(--color-brand)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">Remember me for 7 days</span>
            </label>

            {errors.form && (
              <p className="text-xs text-center text-[var(--danger)] bg-[var(--danger)]/8 border border-[var(--danger)]/20 rounded-[var(--radius-md)] py-2 px-3">
                {errors.form}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full rounded-full" size="lg">
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="font-semibold text-[var(--color-brand)] hover:opacity-70 transition-opacity"
            >
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
