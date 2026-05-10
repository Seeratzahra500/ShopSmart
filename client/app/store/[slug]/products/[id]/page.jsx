'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageWrapper from '@/components/PageWrapper';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';

const fadeUp = {
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
};

function StarRating({ value, max = 5, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`text-2xl transition-colors ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
          style={{ color: star <= (hover || value) ? '#f59e0b' : '#d1d5db' }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function StoreProductPage() {
  const { slug, id }  = useParams();
  const router        = useRouter();
  const { addToCart } = useCart();
  const { user }      = useAuth();
  const { store }     = useStore();
  const canShop       = !user || user.role === 'customer';

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imgIdx, setImgIdx]     = useState(0);

  const [reviews, setReviews]             = useState([]);
  const [reviewTotal, setReviewTotal]     = useState(0);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewForm, setReviewForm]       = useState({ rating: 0, title: '', body: '' });
  const [submitting, setSubmitting]       = useState(false);

  useEffect(() => {
    api.get(`/stores/${slug}/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => router.push(`/store/${slug}`))
      .finally(() => setLoading(false));
  }, [slug, id, router]);

  useEffect(() => {
    api.get(`/stores/${slug}/products/${id}/reviews`)
      .then(({ data }) => { setReviews(data.reviews); setReviewTotal(data.total); })
      .catch(() => {})
      .finally(() => setReviewLoading(false));
  }, [slug, id]);

  const handleAdd = () => {
    addToCart({ ...product, storeSlug: slug }, quantity);
    toast.success(`${product.title} added to cart!`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) return toast.error('Please select a rating.');
    setSubmitting(true);
    try {
      const { data } = await api.post(`/stores/${slug}/products/${id}/reviews`, reviewForm);
      setReviews((prev) => [data, ...prev]);
      setReviewTotal((t) => t + 1);
      setReviewForm({ rating: 0, title: '', body: '' });
      toast.success('Review submitted!');
      if (product) setProduct((p) => ({ ...p, reviewCount: p.reviewCount + 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  /* Loading skeleton */
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-5 pt-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-28 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length ? product.images : [null];

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Back link */}
        <Link
          href={`/store/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8 group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to {store?.name || 'Store'}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">

          {/* Image gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              {images[imgIdx] ? (
                <Image
                  src={images[imgIdx]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No image available
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-gray-800 font-semibold px-5 py-2 rounded-full text-sm">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors
                      ${i === imgIdx ? 'border-[var(--color-brand)]' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    {img ? (
                      <Image src={img} alt="" fill className="object-cover" />
                    ) : (
                      <div className="bg-gray-100 w-full h-full" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product details */}
          <motion.div {...fadeUp} className="space-y-5">
            {/* Category badge */}
            <span className="inline-block bg-gray-100 text-gray-600 text-xs rounded-full px-3 py-1 font-medium">
              {product.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {product.title}
            </h1>

            {/* Star rating summary */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(product.averageRating)} />
                <span className="text-sm text-gray-500">
                  {product.averageRating.toFixed(1)} ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            {/* Price */}
            <p className="text-2xl font-bold" style={{ color: 'var(--color-brand)' }}>
              {formatPrice(product.price, store?.currency, store?.locale)}
            </p>

            {/* Stock badge */}
            <div>
              {product.stock === 0 ? (
                <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 rounded-full text-xs px-3 py-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  Out of Stock
                </span>
              ) : product.stock < 10 ? (
                <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 rounded-full text-xs px-3 py-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  Only {product.stock} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 rounded-full text-xs px-3 py-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  In Stock
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed text-sm">
              {product.description}
            </p>

            {/* Add to cart / non-customer banner */}
            {product.stock > 0 && (
              canShop ? (
                <div className="space-y-3">
                  {/* Quantity stepper */}
                  <div className="flex items-center gap-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                      Quantity
                    </p>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 text-lg font-medium transition-colors"
                      >
                        −
                      </button>
                      <span className="px-5 py-2.5 text-sm font-semibold min-w-[3rem] text-center border-x border-gray-200">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 text-lg font-medium transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to cart button */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAdd}
                    className="w-full bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm"
                  >
                    Add to Cart
                  </motion.button>
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3.5">
                  Admin and shopowner accounts cannot make purchases. Log in as a customer to shop.
                </div>
              )
            )}

            {/* View Cart — customers only */}
            {canShop && (
              <Link
                href="/cart"
                className="block text-center border border-gray-200 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
              >
                View Cart
              </Link>
            )}
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="mt-20 pt-10 border-t border-gray-100">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">
            Reviews{' '}
            {reviewTotal > 0 && (
              <span className="text-gray-400 font-normal text-base">({reviewTotal})</span>
            )}
          </h2>

          {/* Write a review — customers only */}
          {user?.role === 'customer' && (
            <form
              onSubmit={handleReviewSubmit}
              className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-10 space-y-4"
            >
              <h3 className="font-bold text-gray-900">Write a Review</h3>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-2">
                  Rating
                </label>
                <StarRating
                  value={reviewForm.rating}
                  onChange={(r) => setReviewForm((f) => ({ ...f, rating: r }))}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-2">
                  Title (optional)
                </label>
                <input
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Summary of your experience"
                  className="rounded-xl border border-gray-200 w-full px-4 py-3 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none text-sm transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-2">
                  Review (optional)
                </label>
                <textarea
                  value={reviewForm.body}
                  onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Tell others about your experience…"
                  rows={3}
                  className="rounded-xl border border-gray-200 w-full px-4 py-3 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-none text-sm transition resize-none"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={submitting}
                className="bg-[var(--color-brand)] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </motion.button>
            </form>
          )}

          {/* Review list */}
          {reviewLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-2xl border border-gray-100 p-6 space-y-3"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {review.customer?.name || 'Anonymous'}
                      </p>
                      <StarRating value={review.rating} />
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && (
                    <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="text-gray-600 text-sm leading-relaxed">{review.body}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
