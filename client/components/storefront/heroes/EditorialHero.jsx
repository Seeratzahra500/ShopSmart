'use client';
import { motion } from 'framer-motion';
import { fadeUp, stagger } from '@/lib/motion';

// No-image statement hero: oversized display type on the page background,
// a brand-colored rule, tagline in a side column — 12-col editorial grid.
export default function EditorialHero({ store }) {
  return (
    <motion.section
      variants={stagger()}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-8 pt-28 pb-20"
    >
      <div className="grid grid-cols-12 gap-8 items-end">
        <motion.div variants={fadeUp} className="col-span-12 md:col-span-3 order-2 md:order-1">
          <p className="eyebrow mb-3">{store.tagline ? 'Welcome' : 'Store'}</p>
          {store.tagline && (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{store.tagline}</p>
          )}
          <a
            href="#products"
            className="inline-block mt-6 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-brand)', borderRadius: 'var(--border-radius-btn)' }}
          >
            {store.heroCta || 'Shop Now'}
          </a>
        </motion.div>

        <motion.div variants={fadeUp} className="col-span-12 md:col-span-9 order-1 md:order-2">
          <h1 className="hero-heading text-[var(--text-main)]">
            {store.heroHeadline || store.name}
          </h1>
          <div
            className="mt-8 h-px w-32"
            style={{ backgroundColor: 'var(--color-brand)' }}
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
