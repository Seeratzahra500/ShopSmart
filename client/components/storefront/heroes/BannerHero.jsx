'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' },
});

// Compact ~40vh band, left-aligned content over image/brand bg — products
// visible almost immediately below the fold.
export default function BannerHero({ store }) {
  return (
    <section
      className="relative min-h-[40vh] flex items-center overflow-hidden"
      style={{ backgroundColor: store.heroImage ? undefined : 'var(--color-brand)' }}
    >
      {store.heroImage && (
        <div className="absolute inset-0">
          <Image src={store.heroImage} alt={store.name} fill className="object-cover" priority />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-14 w-full">
        <div className="max-w-xl">
          {store.logoUrl && (
            <motion.div {...fadeUp(0)} className="mb-5 w-14 h-14 rounded-[var(--radius-md)] overflow-hidden border border-white/20 bg-white/10 backdrop-blur-md p-1.5">
              <Image src={store.logoUrl} alt={`${store.name} logo`} width={56} height={56} className="object-cover rounded-[var(--radius-sm)] w-full h-full" />
            </motion.div>
          )}
          <motion.p {...fadeUp(0.05)} className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-3">
            {store.tagline || 'Welcome'}
          </motion.p>
          <motion.h1 {...fadeUp(0.1)} className="font-display text-3xl sm:text-4xl font-semibold text-white mb-6 leading-tight">
            {store.heroHeadline || store.name}
          </motion.h1>
          <motion.a
            {...fadeUp(0.15)}
            href="#products"
            className="inline-block px-7 py-2.5 bg-white font-semibold rounded-[var(--border-radius-btn)] hover:opacity-90 transition-opacity text-sm"
            style={{ color: 'var(--color-brand)' }}
          >
            {store.heroCta || 'Shop Now'}
          </motion.a>
        </div>
      </div>
    </section>
  );
}
