'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerContainerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
function IconUserPlus({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  );
}

function IconBox({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function IconTrendingUp({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function IconStorefront({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.651V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.061.44l1.19 2.53a3.001 3.001 0 01-.621 4.72m-16.5 0h16.5" />
    </svg>
  );
}

function IconChartBar({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function IconCube({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  );
}

function IconChevronDown({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user?.role === 'admin')     router.replace('/admin/dashboard');
    else if (user?.role === 'shopowner') router.replace('/dashboard');
    else if (user)                  router.replace('/stores');
    // Not logged in → show homepage
  }, [user, loading, router]);

  // While auth is resolving, render nothing to avoid flash
  if (loading) return null;

  // If user is logged in we're about to redirect; don't render homepage
  if (user) return null;

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── SECTION 1: NAVBAR ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-16 bg-white border-b border-gray-100 flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
          <span className="font-bold text-xl" style={{ color: 'var(--color-brand, #4f46e5)' }}>
            ShopSmart
          </span>
          <nav className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-2 transition-colors"
            >
              Login
            </Link>
            <Link href="/auth/register">
              <motion.span
                whileHover={{ opacity: 0.88 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block px-5 py-2 rounded-full text-white text-sm font-semibold cursor-pointer"
                style={{ background: 'var(--color-brand, #4f46e5)' }}
              >
                Get Started
              </motion.span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── SECTION 2: HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-6">
        {/* Background gradient blob */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, rgba(168,85,247,0.04) 50%, transparent 70%)',
            }}
          />
        </div>

        <motion.div
          className="relative z-10 max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-4 py-1.5 rounded-full inline-block">
              The platform for independent businesses
            </span>
          </motion.div>

          {/* Headline line 1 */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mt-6 leading-tight"
          >
            Launch your store.
          </motion.h1>

          {/* Headline line 2 */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mt-2 leading-tight"
            style={{ color: 'var(--color-brand, #4f46e5)' }}
          >
            Reach more customers.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mt-6"
          >
            ShopSmart gives independent businesses a beautiful online storefront with everything they need — products, orders, analytics, and your own branding.
          </motion.p>

          {/* CTA row */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/auth/register">
              <motion.span
                whileHover={{ y: -2, opacity: 0.92 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block px-8 py-4 rounded-full text-white font-semibold text-base cursor-pointer shadow-lg"
                style={{ background: 'var(--color-brand, #4f46e5)' }}
              >
                Start Selling Free
              </motion.span>
            </Link>
            <Link href="/auth/login">
              <motion.span
                whileHover={{ backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.97 }}
                className="inline-block px-8 py-4 rounded-full border border-gray-300 text-gray-700 font-semibold text-base cursor-pointer"
              >
                Browse Stores
              </motion.span>
            </Link>
          </motion.div>

          {/* Stat pills */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500"
          >
            {[
              '500+ Active Stores',
              '10,000+ Products',
              '99.9% Uptime',
            ].map((stat) => (
              <span key={stat} className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                {stat}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <IconChevronDown className="w-6 h-6 text-gray-300" />
        </motion.div>
      </section>

      {/* ── SECTION 3: SOCIAL PROOF STRIP ────────────────────────────────── */}
      <section className="bg-gray-50 py-12 border-y border-gray-100 overflow-hidden">
        <p className="text-xs uppercase tracking-widest text-gray-400 text-center mb-8">
          Trusted by businesses across Pakistan
        </p>
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-16 items-center whitespace-nowrap"
            animate={{ x: [0, -700] }}
            transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          >
            {['FreshBakes', 'StyleHub', 'TechZone', 'GreenLeaf', 'CraftCorner', 'UrbanWear',
              'FreshBakes', 'StyleHub', 'TechZone', 'GreenLeaf', 'CraftCorner', 'UrbanWear'].map((brand, i) => (
              <span key={i} className="font-semibold text-gray-300 text-lg flex-shrink-0">
                {brand}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 4: HOW IT WORKS ───────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-xs font-semibold uppercase tracking-widest text-indigo-500"
            >
              Simple setup
            </motion.p>
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-gray-900 mt-3"
            >
              Your store live in minutes
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              {[
                {
                  number: '01',
                  icon: <IconUserPlus className="w-6 h-6 text-indigo-600" />,
                  iconBg: 'bg-indigo-100',
                  title: 'Create your account',
                  desc: 'Sign up with email, choose your store name and branding.',
                },
                {
                  number: '02',
                  icon: <IconBox className="w-6 h-6 text-green-600" />,
                  iconBg: 'bg-green-100',
                  title: 'Add your products',
                  desc: 'Upload images, set prices, manage inventory.',
                },
                {
                  number: '03',
                  icon: <IconTrendingUp className="w-6 h-6 text-purple-600" />,
                  iconBg: 'bg-purple-100',
                  title: 'Start selling',
                  desc: 'Share your store link and watch orders come in.',
                },
              ].map((step) => (
                <motion.div
                  key={step.number}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col"
                >
                  <span className="text-xs font-bold text-gray-300 mb-4">{step.number}</span>
                  <div className={`${step.iconBg} rounded-2xl p-4 inline-flex w-fit`}>
                    {step.icon}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mt-4">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mt-2">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 5: FEATURES ───────────────────────────────────────────── */}
      <section className="py-24 bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainerFast}
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-indigo-400 uppercase tracking-widest text-xs font-semibold"
            >
              Everything you need
            </motion.p>
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-white mt-3"
            >
              Built for real businesses
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-6 mt-16">
              {[
                {
                  icon: <IconStorefront className="w-6 h-6 text-white" />,
                  title: 'Beautiful Storefronts',
                  desc: 'Custom branding, themes, hero banners — your store, your identity.',
                  cardClass: 'bg-gradient-to-br from-indigo-900 to-indigo-950 border border-indigo-800/50',
                },
                {
                  icon: <IconCube className="w-6 h-6 text-white" />,
                  title: 'Inventory Management',
                  desc: 'Real-time stock tracking, low-stock alerts, and easy product management.',
                  cardClass: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-white/5',
                },
                {
                  icon: <IconChartBar className="w-6 h-6 text-white" />,
                  title: 'Analytics Dashboard',
                  desc: 'Orders, revenue, and top products at a glance — always know how you\'re doing.',
                  cardClass: 'bg-gradient-to-br from-purple-900 to-purple-950 border border-purple-800/50',
                },
              ].map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className={`${feature.cardClass} rounded-2xl p-8`}
                >
                  <div className="bg-white/10 rounded-xl p-3 inline-block">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-6">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mt-3">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 6: CTA BANNER ─────────────────────────────────────────── */}
      <section className="py-28">
        <motion.div
          className="max-w-6xl mx-auto px-6 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900"
          >
            Ready to grow your business?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-gray-500 mt-4 text-lg"
          >
            Join hundreds of businesses already selling on ShopSmart.
          </motion.p>
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/auth/register">
              <motion.span
                whileHover={{ y: -2, opacity: 0.92 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block px-8 py-4 rounded-full text-white font-semibold text-base cursor-pointer shadow-lg"
                style={{ background: 'var(--color-brand, #4f46e5)' }}
              >
                Get Started Free
              </motion.span>
            </Link>
            <Link href="/auth/login">
              <motion.span
                whileHover={{ backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.97 }}
                className="inline-block px-8 py-4 rounded-full border border-gray-300 text-gray-700 font-semibold text-base cursor-pointer"
              >
                Sign In
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── SECTION 7: FOOTER ─────────────────────────────────────────────── */}
      <footer className="bg-gray-950 py-12 text-center">
        <p className="text-white font-bold text-xl">ShopSmart</p>
        <p className="text-gray-500 text-sm mt-2">© 2025 ShopSmart. All rights reserved.</p>
        <p className="text-gray-600 text-xs mt-1">Built for independent businesses in Pakistan.</p>
      </footer>

    </div>
  );
}
