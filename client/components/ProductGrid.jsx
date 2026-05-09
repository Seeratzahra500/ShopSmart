import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';

export default function ProductGrid({ products, loading = false, columns = 3, currency, locale, slug }) {
  const gridClass = columns === 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  if (loading) {
    return (
      <div className={`grid gap-6 ${gridClass}`}>
        {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">No products found.</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${gridClass}`}>
      {products.map(product => (
        <ProductCard key={product._id} product={product} currency={currency} locale={locale} slug={slug} />
      ))}
    </div>
  );
}
