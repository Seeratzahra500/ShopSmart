'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { fadeUp, stagger, revealOnce } from '@/lib/motion';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user?.role === 'admin')       router.replace('/admin/dashboard');
    else if (user?.role === 'shopowner') router.replace('/dashboard');
    else if (user)                    router.replace('/stores');
  }, [user, loading, router]);

  if (loading) return null;
  if (user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">

      {/* ── HERO: warm ink-on-paper hero, no stock photo ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg-page)]">
        {/* Ambient brand glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] rounded-full blur-3xl opacity-[0.08] pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--color-brand), transparent 70%)' }}
        />

        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          variants={stagger()}
          initial="hidden"
          animate="show"
        >
          <motion.p variants={fadeUp} className="eyebrow mb-8">
            The platform for independent businesses
          </motion.p>

          <motion.h1 variants={fadeUp} className="hero-heading text-[var(--text-main)]">
            Your store.
          </motion.h1>

          <motion.h1 variants={fadeUp} className="hero-heading mt-1" style={{ color: 'var(--color-brand)' }}>
            Your brand.
          </motion.h1>

          <motion.div variants={fadeUp} className="mt-12 flex items-center justify-center gap-6">
            <Button as={Link} href="/auth/register" size="lg">
              Start Selling Free
            </Button>
            <motion.span whileTap={{ scale: 0.97 }}>
              <Link href="/auth/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors">
                Sign In →
              </Link>
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Vertical scroll line */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-px h-12 bg-[var(--border-strong)]" />
        </motion.div>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <section className="bg-[var(--bg-sunken)] py-10 border-y border-[var(--border)] overflow-hidden">
        <p className="eyebrow text-center mb-6">
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
              <span key={i} className="font-display font-semibold text-[var(--text-muted)] text-lg flex-shrink-0">
                {brand}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ABOUT: editorial 12-col side-label layout ── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            className="grid grid-cols-12 gap-8"
            initial="hidden"
            whileInView="show"
            viewport={revealOnce}
            variants={stagger()}
          >
            <motion.div variants={fadeUp} className="col-span-12 md:col-span-2">
              <p className="eyebrow">About</p>
            </motion.div>

            <div className="col-span-12 md:col-span-10">
              <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-main)] leading-tight max-w-3xl">
                The best place to launch your online store — we make it beautifully simple.
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-10 mt-12">
                <motion.p variants={fadeUp} className="text-[var(--text-secondary)] leading-relaxed text-base">
                  Whether you&apos;re selling handmade crafts, clothing, electronics, or food — ShopSmart gives you a beautiful storefront with your own branding. Set up in minutes, no technical skills needed.
                </motion.p>
                <motion.p variants={fadeUp} className="text-[var(--text-secondary)] leading-relaxed text-base">
                  We pride ourselves on giving every business a professional online presence. Custom themes, product management, and real-time analytics — all in one place, built for Pakistan&apos;s businesses.
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATEMENT BREAK ── */}
      <section className="relative py-28 flex items-center justify-center overflow-hidden bg-[var(--bg-sunken)] border-y border-[var(--border)]">
        <div className="relative z-10 text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={revealOnce}
            transition={{ duration: 0.6 }}
            className="font-display text-2xl md:text-3xl text-[var(--text-secondary)] mb-6"
          >
            Hundreds of stores. One platform.
          </motion.p>
          <Link href="/auth/register">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-[var(--border-strong)] cursor-pointer text-[var(--text-main)]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.span>
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={revealOnce}
            variants={stagger()}
          >
            <div className="grid grid-cols-12 gap-8 mb-20">
              <motion.div variants={fadeUp} className="col-span-12 md:col-span-2">
                <p className="eyebrow">How it works</p>
              </motion.div>
              <motion.div variants={fadeUp} className="col-span-12 md:col-span-10">
                <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-main)]">
                  Your store live in minutes
                </h2>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-12 md:pl-[calc(16.666%+2rem)]">
              {[
                { number: '01', title: 'Create your account', desc: 'Sign up with email, choose your store name and branding colors.' },
                { number: '02', title: 'Add your products', desc: 'Upload images, set prices, manage inventory in real time.' },
                { number: '03', title: 'Start selling', desc: 'Share your store link and watch orders come in.' },
              ].map((step) => (
                <motion.div key={step.number} variants={fadeUp}>
                  <span className="font-tabular text-xs font-bold text-[var(--text-muted)] block mb-6">{step.number}</span>
                  <h3 className="font-display font-semibold text-xl text-[var(--text-main)] mb-3">{step.title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES: warm dark section (ink, not flat gray) ── */}
      <section className="py-32 bg-[#161311]">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={revealOnce}
            variants={stagger()}
          >
            <div className="grid grid-cols-12 gap-8 mb-20">
              <motion.div variants={fadeUp} className="col-span-12 md:col-span-2">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/40">Features</p>
              </motion.div>
              <motion.div variants={fadeUp} className="col-span-12 md:col-span-10">
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-white">
                  Built for real businesses
                </h2>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:pl-[calc(16.666%+2rem)]">
              {[
                {
                  title: 'Beautiful Storefronts',
                  desc: 'Custom branding, themes, hero banners — your store, your identity.',
                },
                {
                  title: 'Inventory Management',
                  desc: 'Real-time stock tracking, low-stock alerts, and easy product management.',
                },
                {
                  title: 'Analytics Dashboard',
                  desc: "Orders, revenue, and top products at a glance — always know how you're doing.",
                },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="border border-white/10 rounded-[var(--radius-lg)] p-8"
                >
                  <h3 className="font-display text-lg font-semibold text-white mb-3">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            className="grid grid-cols-12 gap-8"
            initial="hidden"
            whileInView="show"
            viewport={revealOnce}
            variants={stagger()}
          >
            <div className="col-span-12 md:col-span-2" />
            <div className="col-span-12 md:col-span-10">
              <motion.h2
                variants={fadeUp}
                className="font-display text-4xl md:text-6xl font-semibold tracking-tight text-[var(--text-main)] leading-tight"
              >
                Ready to grow<br />your business?
              </motion.h2>
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-6">
                <Button as={Link} href="/auth/register" size="lg">
                  Get Started Free
                </Button>
                <Link href="/auth/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors">
                  Already have an account? Sign in →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#161311] py-14">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display text-white font-semibold text-xl">ShopSmart</p>
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} ShopSmart. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
