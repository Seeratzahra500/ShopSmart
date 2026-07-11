'use client';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from './ui/Skeleton';
import EmptyState from './ui/EmptyState';
import { fadeUp, stagger, revealOnce } from '@/lib/motion';

const GAP_BY_DENSITY = {
  airy:    'gap-x-8 gap-y-14',
  regular: 'gap-x-6 gap-y-10',
  compact: 'gap-x-4 gap-y-5',
};

export default function ProductGrid({ products, loading = false, columns = 3, currency, locale, slug, cardStyle = 'gallery', density = 'regular' }) {
  const gapClass = GAP_BY_DENSITY[density] || GAP_BY_DENSITY.regular;

  // The compact card is horizontal/list-like — a single column reads best
  // regardless of the store's configured grid column count.
  const gridClass = cardStyle === 'compact'
    ? 'grid-cols-1 max-w-2xl'
    : columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  if (loading) {
    return (
      <motion.div
        variants={stagger()}
        initial="hidden"
        animate="show"
        className={`grid ${gapClass} ${gridClass}`}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div key={i} variants={fadeUp}>
            <ProductCardSkeleton />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (!products?.length) {
    return <EmptyState title="No products found" description="Try adjusting your search or filters." />;
  }

  return (
    <motion.div
      variants={stagger()}
      initial="hidden"
      whileInView="show"
      viewport={revealOnce}
      className={`grid ${gapClass} ${gridClass}`}
    >
      <AnimatePresence mode="popLayout">
        {products.map((product) => (
          <motion.div
            key={product._id}
            layout
            variants={fadeUp}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
          >
            <ProductCard
              product={product}
              currency={currency}
              locale={locale}
              slug={slug}
              cardStyle={cardStyle}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
