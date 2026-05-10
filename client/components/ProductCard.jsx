'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/formatPrice';

export default function ProductCard({ product, currency = 'PKR', locale = 'ur-PK', slug }) {
  const { addToCart } = useCart();
  const { user }      = useAuth();
  const canShop       = !user || user.role === 'customer';
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked]     = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, storeSlug: slug }, 1);
    toast.success(`${product.title} added to cart!`);
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock   = product.stock > 0 && product.stock < 5;

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm flex flex-col"
    >
      {/* Image block */}
      <Link
        href={slug ? `/store/${slug}/products/${product._id}` : `/products/${product._id}`}
        className="relative block aspect-[3/4] bg-gray-100 overflow-hidden"
      >
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}

        {/* Out of Stock badge */}
        {isOutOfStock && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
            Out of Stock
          </span>
        )}

        {/* Low stock badge (only when NOT out of stock) */}
        {isLowStock && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
            Only {product.stock} left
          </span>
        )}

        {/* Category badge — bottom-left of image */}
        {product.category && (
          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1 rounded-full z-10">
            {product.category}
          </span>
        )}

        {/* Wishlist heart — only for customers, top-right */}
        {canShop && (
          <motion.button
            whileTap={{ scale: 1.3 }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked((v) => !v); }}
            className="absolute top-3 right-3 z-20 flex items-center justify-center w-8 h-8"
            aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {liked ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-red-500 drop-shadow"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </motion.button>
        )}

        {/* Quick Add overlay — only for customers on hover */}
        <AnimatePresence>
          {hovered && canShop && product.stock > 0 && (
            <motion.div
              key="quick-add-overlay"
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute inset-x-0 bottom-0 flex items-end justify-center pb-4 z-20"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                className="text-white text-sm font-semibold px-5 py-2 rounded-full border border-white/60 hover:bg-white/20 backdrop-blur-sm transition-colors"
              >
                Quick Add
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Details block */}
      <div className="p-4 flex flex-col flex-1 gap-1">
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
          {product.title}
        </h3>

        {/* Price row */}
        <div className="mt-1">
          {isOutOfStock ? (
            <>
              <p className="text-2xl font-bold text-gray-400 line-through">
                {formatPrice(product.price, currency, locale)}
              </p>
              <p className="text-xs font-semibold text-red-500 mt-0.5">Out of Stock</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-brand, #4f46e5)' }}>
                {formatPrice(product.price, currency, locale)}
              </p>
              {isLowStock && (
                <p className="text-xs font-medium text-amber-600 mt-0.5">
                  Only {product.stock} left
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        {canShop ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="w-full flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            style={{ backgroundColor: 'var(--color-brand, #4f46e5)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 shrink-0"
            >
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </motion.button>
        ) : (
          <p className="w-full py-3 text-center text-xs text-gray-400 border border-gray-200 rounded-xl">
            Log in as customer to shop
          </p>
        )}
      </div>

      {/* Bottom brand accent — only when in stock */}
      {!isOutOfStock && (
        <div className="h-0.5 bg-[var(--color-brand)]" />
      )}
    </motion.div>
  );
}
