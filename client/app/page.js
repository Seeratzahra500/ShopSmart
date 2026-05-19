'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

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
    <div className="min-h-screen bg-white">

      {/* ── HERO: full-bleed photo + overlaid headline ── */}
      <section
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/55" />

        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50 mb-8"
          >
            The platform for independent businesses
          </motion.p>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-6xl md:text-[7rem] font-bold tracking-tight text-white leading-none"
          >
            Your store.
          </motion.h1>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-6xl md:text-[7rem] font-bold tracking-tight text-white leading-none mt-1"
          >
            Your brand.
          </motion.h1>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-12 flex items-center justify-center gap-6"
          >
            <Link href="/auth/register">
              <motion.span
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                whileTap={{ scale: 0.97 }}
                className="inline-block px-10 py-3.5 text-sm font-semibold text-white border border-white/70 cursor-pointer transition-colors"
              >
                Start Selling Free
              </motion.span>
            </Link>
            <Link href="/auth/login">
              <motion.span
                whileTap={{ scale: 0.97 }}
                className="inline-block text-sm font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Sign In →
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Vertical scroll line */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-px h-12 bg-white/40" />
        </motion.div>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <section className="bg-gray-50 py-10 border-y border-gray-100 overflow-hidden">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 text-center mb-6">
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

      {/* ── ABOUT: Estate editorial 12-col side-label layout ── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            className="grid grid-cols-12 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="col-span-12 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">About</p>
            </motion.div>

            <div className="col-span-12 md:col-span-10">
              <motion.h2
                variants={fadeUp}
                transition={{ duration: 0.55 }}
                className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight max-w-3xl"
              >
                The best place to launch your online store — we make it beautifully simple.
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-10 mt-12">
                <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-gray-500 leading-relaxed text-base">
                  Whether you're selling handmade crafts, clothing, electronics, or food — ShopSmart gives you a beautiful storefront with your own branding. Set up in minutes, no technical skills needed.
                </motion.p>
                <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-gray-500 leading-relaxed text-base">
                  We pride ourselves on giving every business a professional online presence. Custom themes, product management, and real-time analytics — all in one place, built for Pakistan's businesses.
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FULL-BLEED IMAGE BREAK ── */}
      <section
        className="relative h-[55vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-white/70 text-xl mb-6"
          >
            Hundreds of stores. One platform.
          </motion.p>
          <Link href="/auth/register">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-white/70 cursor-pointer"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <div className="grid grid-cols-12 gap-8 mb-20">
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="col-span-12 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">How it works</p>
              </motion.div>
              <motion.div variants={fadeUp} transition={{ duration: 0.55 }} className="col-span-12 md:col-span-10">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
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
                <motion.div key={step.number} variants={fadeUp} transition={{ duration: 0.5 }}>
                  <span className="text-xs font-bold text-gray-300 block mb-6">{step.number}</span>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES: dark section ── */}
      <section className="py-32 bg-gray-950">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <div className="grid grid-cols-12 gap-8 mb-20">
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="col-span-12 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Features</p>
              </motion.div>
              <motion.div variants={fadeUp} transition={{ duration: 0.55 }} className="col-span-12 md:col-span-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  Built for real businesses
                </h2>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:pl-[calc(16.666%+2rem)]">
              {[
                {
                  title: 'Beautiful Storefronts',
                  desc: 'Custom branding, themes, hero banners — your store, your identity.',
                  border: 'border-white/10',
                },
                {
                  title: 'Inventory Management',
                  desc: 'Real-time stock tracking, low-stock alerts, and easy product management.',
                  border: 'border-white/10',
                },
                {
                  title: 'Analytics Dashboard',
                  desc: "Orders, revenue, and top products at a glance — always know how you're doing.",
                  border: 'border-white/10',
                },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className={`border ${f.border} p-8`}
                >
                  <h3 className="text-lg font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
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
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <div className="col-span-12 md:col-span-2" />
            <div className="col-span-12 md:col-span-10">
              <motion.h2
                variants={fadeUp}
                transition={{ duration: 0.55 }}
                className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight"
              >
                Ready to grow<br />your business?
              </motion.h2>
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="mt-10 flex flex-wrap items-center gap-6"
              >
                <Link href="/auth/register">
                  <motion.span
                    whileHover={{ opacity: 0.85 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-block px-10 py-3.5 text-sm font-semibold text-white cursor-pointer"
                    style={{ backgroundColor: 'var(--color-brand, #5C4E4E)' }}
                  >
                    Get Started Free
                  </motion.span>
                </Link>
                <Link href="/auth/login">
                  <span className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    Already have an account? Sign in →
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 py-14">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white font-bold text-xl">ShopSmart</p>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} ShopSmart. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
