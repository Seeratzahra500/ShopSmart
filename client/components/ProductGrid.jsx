'use client';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from './ui/Skeleton';
import EmptyState from './ui/EmptyState';
import { fadeUp, stagger, revealOnce } from '@/lib/motion';

export default function ProductGrid({ products, loading = false, columns = 3, currency, locale, slug }) {
  const gridClass =
    columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  if (loading) {
    return (
      <motion.div
        variants={stagger()}
        initial="hidden"
        animate="show"
        className={`grid gap-x-6 gap-y-10 ${gridClass}`}
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
      className={`grid gap-x-6 gap-y-10 ${gridClass}`}
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
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
