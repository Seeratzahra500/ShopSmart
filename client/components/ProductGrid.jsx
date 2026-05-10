'use client';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function ProductGrid({ products, loading = false, columns = 3, currency, locale, slug }) {
  const gridClass =
    columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={`grid gap-6 ${gridClass}`}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div key={i} variants={itemVariants}>
            <ProductSkeleton />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (!products?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center py-16 text-gray-500"
      >
        <p className="text-lg">No products found.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className={`grid gap-6 ${gridClass}`}
    >
      <AnimatePresence mode="popLayout">
        {products.map((product) => (
          <motion.div
            key={product._id}
            layout
            variants={itemVariants}
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
