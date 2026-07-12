'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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
          style={{ color: star <= (hover || value) ? 'var(--warning)' : 'var(--border-strong)' }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ProductPageClient() {
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

  const [failedImgs, setFailedImgs]       = useState(() => new Set());
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
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="h-5 skeleton rounded w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square skeleton rounded-[var(--radius-lg)]" />
          <div className="space-y-5 pt-2">
            <div className="h-4 skeleton rounded w-24" />
            <div className="h-8 skeleton rounded w-3/4" />
            <div className="h-6 skeleton rounded w-1/3" />
            <div className="h-28 skeleton rounded" />
            <div className="h-12 skeleton rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length ? product.images : [null];
  const markFailed = (i) => setFailedImgs((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Back link */}
        <Link
          href={`/store/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors mb-8 group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to {store?.name || 'Store'}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">

          {/* Image gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-[var(--bg-sunken)] rounded-[var(--radius-lg)] overflow-hidden">
              {images[imgIdx] && !failedImgs.has(imgIdx) ? (
                <Image
                  src={images[imgIdx]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={() => markFailed(imgIdx)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
                  No image available
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-[var(--bg-card)] text-[var(--text-main)] font-semibold px-5 py-2 rounded-full text-sm">
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
                    className={`relative w-16 h-16 flex-shrink-0 rounded-[var(--radius-md)] overflow-hidden border-2 transition-colors
                      ${i === imgIdx ? 'border-[var(--color-brand)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'}`}
                  >
                    {img && !failedImgs.has(i) ? (
                      <Image src={img} alt="" fill className="object-cover" onError={() => markFailed(i)} />
                    ) : (
                      <div className="bg-[var(--bg-sunken)] w-full h-full" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product details */}
          <motion.div {...fadeUp} className="space-y-5">
            {/* Category badge */}
            <span
              className="inline-block text-xs rounded-full px-3 py-1 font-semibold"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-ink)' }}
            >
              {product.category}
            </span>

            {/* Title */}
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--text-main)]">
              {product.title}
            </h1>

            {/* Star rating summary */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(product.averageRating)} />
                <span className="text-sm text-[var(--text-muted)]">
                  {product.averageRating.toFixed(1)} ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            {/* Price */}
            <p className="font-tabular text-2xl font-semibold" style={{ color: 'var(--color-brand)' }}>
              {formatPrice(product.price, store?.currency, store?.locale)}
            </p>

            {/* Stock badge */}
            <div>
              {product.stock === 0 ? (
                <span className="inline-flex items-center gap-1.5 bg-[var(--danger)]/10 text-[var(--danger)] rounded-full text-xs px-3 py-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] inline-block" />
                  Out of Stock
                </span>
              ) : product.stock < 10 ? (
                <span className="inline-flex items-center gap-1.5 bg-[var(--warning)]/10 text-[var(--warning)] rounded-full text-xs px-3 py-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] inline-block" />
                  Only {product.stock} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-[var(--success)]/10 text-[var(--success)] rounded-full text-xs px-3 py-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] inline-block" />
                  In Stock
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
              {product.description}
            </p>

            {/* Add to cart / non-customer banner */}
            {product.stock > 0 && (
              canShop ? (
                <div className="space-y-3">
                  {/* Quantity stepper */}
                  <div className="flex items-center gap-4">
                    <p className="eyebrow">
                      Quantity
                    </p>
                    <div className="flex items-center border border-[var(--border-strong)] rounded-[var(--radius-md)] overflow-hidden">
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-4 py-2.5 text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] text-lg font-medium transition-colors"
                      >
                        −
                      </motion.button>
                      <span className="font-tabular px-5 py-2.5 text-sm font-semibold min-w-[3rem] text-center border-x border-[var(--border-strong)]">
                        {quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="px-4 py-2.5 text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] text-lg font-medium transition-colors"
                      >
                        +
                      </motion.button>
                    </div>
                  </div>

                  {/* Add to cart button */}
                  <Button onClick={handleAdd} className="w-full">
                    Add to Cart
                  </Button>
                </div>
              ) : (
                <div className="rounded-[var(--radius-md)] bg-[var(--warning)]/10 border border-[var(--warning)]/30 text-[var(--warning)] text-sm px-4 py-3.5">
                  Admin and shopowner accounts cannot make purchases. Log in as a customer to shop.
                </div>
              )
            )}

            {/* View Cart — customers only */}
            {canShop && (
              <Button as={Link} href="/cart" variant="secondary" className="w-full">
                View Cart
              </Button>
            )}
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="mt-20 pt-10 border-t border-[var(--border)]">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-main)] mb-8">
            Reviews{' '}
            {reviewTotal > 0 && (
              <span className="text-[var(--text-muted)] font-normal text-base">({reviewTotal})</span>
            )}
          </h2>

          {/* Write a review — customers only */}
          {user?.role === 'customer' && (
            <form
              onSubmit={handleReviewSubmit}
              className="bg-[var(--bg-sunken)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6 mb-10 space-y-4"
            >
              <h3 className="font-display font-semibold text-[var(--text-main)]">Write a Review</h3>

              <div>
                <label className="eyebrow block mb-2">
                  Rating
                </label>
                <StarRating
                  value={reviewForm.rating}
                  onChange={(r) => setReviewForm((f) => ({ ...f, rating: r }))}
                />
              </div>

              <Input
                label="Title (optional)"
                name="title"
                value={reviewForm.title}
                onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Summary of your experience"
              />

              <div>
                <label htmlFor="review-body" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Review (optional)
                </label>
                <textarea
                  id="review-body"
                  value={reviewForm.body}
                  onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Tell others about your experience…"
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-sm)] bg-[var(--bg-card)] border border-[var(--border-strong)] transition-colors outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15 resize-none"
                />
              </div>

              <Button type="submit" loading={submitting}>
                {submitting ? 'Submitting…' : 'Submit Review'}
              </Button>
            </form>
          )}

          {/* Review list */}
          {reviewLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="skeleton bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6 space-y-3"
                >
                  <div className="h-4 rounded w-1/4" />
                  <div className="h-3 rounded w-full" />
                  <div className="h-3 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-muted)]">
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
                  className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-lift)] p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-[var(--text-main)] text-sm">
                        {review.customer?.name || 'Anonymous'}
                      </p>
                      <StarRating value={review.rating} />
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && (
                    <p className="font-semibold text-[var(--text-main)] text-sm mb-1">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{review.body}</p>
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
