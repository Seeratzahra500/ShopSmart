'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: 'easeOut' },
});

// Full-bleed image hero — dark overlay, centered content, ~80vh, brand glow.
export default function FullBleedHero({ store }) {
  return (
    <section
      className="relative min-h-[80vh] flex items-center overflow-hidden"
      style={{ backgroundColor: store.heroImage ? undefined : '#161311' }}
    >
      {store.heroImage && (
        <div className="absolute inset-0">
          <Image src={store.heroImage} alt={store.name} fill className="object-cover" priority />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/75" />
      <div
        className="absolute -top-32 -right-32 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-brand), transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center w-full">
        {store.logoUrl && (
          <div className="absolute left-6 top-6 rounded-[var(--radius-xl)] overflow-hidden border border-white/15 shadow-[var(--shadow-overlay)] bg-white/10 backdrop-blur-md p-3">
            <Image src={store.logoUrl} alt={`${store.name} logo`} width={112} height={112} className="object-cover rounded-[var(--radius-lg)]" />
          </div>
        )}
        <motion.p {...fadeUp(0)} className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-4">
          {store.tagline || 'Welcome'}
        </motion.p>

        <motion.h1 {...fadeUp(0.1)} className="hero-heading text-white mb-6">
          {store.heroHeadline || store.name}
        </motion.h1>

        {store.tagline && (
          <motion.p {...fadeUp(0.2)} className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed font-display">
            {store.tagline}
          </motion.p>
        )}

        <motion.a
          href="#products"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          whileHover={{ y: -2 }}
          className="inline-block px-8 py-3 bg-white font-semibold rounded-full hover:opacity-90 transition-opacity text-sm"
          style={{ color: 'var(--color-brand)' }}
        >
          {store.heroCta || 'Shop Now'}
        </motion.a>
      </div>
    </section>
  );
}
