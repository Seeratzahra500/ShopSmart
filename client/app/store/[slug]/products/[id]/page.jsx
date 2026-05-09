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
  const { slug, id }    = useParams();
  const router          = useRouter();
  const { addToCart }   = useCart();
  const { user }        = useAuth();
  const { store }       = useStore();
  const canShop         = !user || user.role === 'customer';

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imgIdx, setImgIdx]     = useState(0);

  const [reviews, setReviews]         = useState([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewForm, setReviewForm]   = useState({ rating: 0, title: '', body: '' });
  const [submitting, setSubmitting]   = useState(false);

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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square bg-gray-200 rounded-xl" />
        <div className="space-y-4 pt-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!product) return null;
  const images = product.images?.length ? product.images : [null];

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-gray-800">Home</Link>
          <span>/</span>
          <Link href="/stores" className="hover:text-gray-800">Stores</Link>
          <span>/</span>
          <Link href={`/store/${slug}`} className="hover:text-gray-800">{store?.name || slug}</Link>
          <span>/</span>
          <span className="text-gray-800 truncate max-w-xs">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
              {images[imgIdx] ? (
                <Image src={images[imgIdx]} alt={product.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-gray-800 font-semibold px-4 py-2 rounded-full text-sm">Out of Stock</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-indigo-500' : 'border-gray-200'}`}
                  >
                    {img ? <Image src={img} alt="" fill className="object-cover" /> : <div className="bg-gray-100 w-full h-full" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{product.category}</span>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.title}</h1>
            </div>

            {/* Rating summary */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(product.averageRating)} />
                <span className="text-sm text-gray-500">
                  {product.averageRating.toFixed(1)} ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            <p className="text-3xl font-bold" style={{ color: 'var(--color-brand)' }}>
              {formatPrice(product.price, store?.currency, store?.locale)}
            </p>

            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {product.stock === 0 ? 'Out of stock' : product.stock < 10 ? `Only ${product.stock} left` : 'In stock'}
              </span>
            </div>

            {product.stock > 0 && (
              canShop ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100 text-lg font-medium">−</button>
                    <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center">{quantity}</span>
                    <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100 text-lg font-medium">+</button>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAdd}
                    className="flex-1 py-2.5 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--color-brand)' }}
                  >
                    Add to Cart
                  </motion.button>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                  Admin and shopowner accounts cannot make purchases. Log in as a customer to shop.
                </div>
              )
            )}

            {canShop && (
              <Link
                href="/cart"
                className="block text-center py-2.5 text-sm font-medium border-2 rounded-lg hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--color-brand)', color: 'var(--color-brand)' }}
              >
                View Cart
              </Link>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Reviews {reviewTotal > 0 && <span className="text-gray-400 font-normal text-base">({reviewTotal})</span>}
          </h2>

          {/* Write review form */}
          {user?.role === 'customer' && (
            <form onSubmit={handleReviewSubmit} className="bg-gray-50 rounded-xl p-6 mb-8 space-y-4">
              <h3 className="font-semibold text-gray-800">Write a Review</h3>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Rating</label>
                <StarRating value={reviewForm.rating} onChange={(r) => setReviewForm((f) => ({ ...f, rating: r }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Title (optional)</label>
                <input
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Summary of your experience"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Review (optional)</label>
                <textarea
                  value={reviewForm.body}
                  onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Tell others about your experience…"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="px-6 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
                style={{ backgroundColor: 'var(--color-brand)' }}
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </motion.button>
            </form>
          )}

          {reviewLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-100 p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{review.customer?.name || 'Anonymous'}</p>
                      <StarRating value={review.rating} />
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && <p className="font-medium text-gray-700 mt-2 text-sm">{review.title}</p>}
                  {review.body  && <p className="text-gray-600 text-sm mt-1 leading-relaxed">{review.body}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
