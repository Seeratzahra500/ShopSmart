'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeUp, stagger } from '@/lib/motion';

// Asymmetric two-column hero: left content on page bg, right the hero image
// (or a brand-color panel with an oversized initial if no image is set).
export default function SplitHero({ store }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
      <motion.div
        variants={stagger()}
        initial="hidden"
        animate="show"
        className="flex flex-col justify-center px-8 sm:px-14 py-20 order-2 lg:order-1"
      >
        <motion.p variants={fadeUp} className="eyebrow mb-4">
          {store.tagline || 'Welcome'}
        </motion.p>
        <motion.h1 variants={fadeUp} className="hero-heading text-[var(--text-main)] mb-6">
          {store.heroHeadline || store.name}
        </motion.h1>
        {store.tagline && (
          <motion.p variants={fadeUp} className="text-lg text-[var(--text-secondary)] mb-10 max-w-md leading-relaxed">
            {store.tagline}
          </motion.p>
        )}
        <motion.a
          variants={fadeUp}
          href="#products"
          whileHover={{ y: -2 }}
          className="inline-block w-fit px-8 py-3 font-semibold text-sm text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-brand)', borderRadius: 'var(--border-radius-btn)' }}
        >
          {store.heroCta || 'Shop Now'}
        </motion.a>
      </motion.div>

      <div className="relative min-h-[40vh] lg:min-h-full order-1 lg:order-2 overflow-hidden">
        {store.heroImage ? (
          <Image src={store.heroImage} alt={store.name} fill className="object-cover" priority />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            <span className="font-display text-[14rem] leading-none font-semibold text-white/25 select-none">
              {store.name?.[0] || 'S'}
            </span>
          </div>
        )}
        {store.logoUrl && (
          <div className="absolute left-6 top-6 rounded-[var(--radius-xl)] overflow-hidden border border-white/15 shadow-[var(--shadow-overlay)] bg-white/10 backdrop-blur-md p-3">
            <Image src={store.logoUrl} alt={`${store.name} logo`} width={96} height={96} className="object-cover rounded-[var(--radius-lg)]" />
          </div>
        )}
      </div>
    </section>
  );
}
