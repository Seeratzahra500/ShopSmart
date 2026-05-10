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

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, storeSlug: slug }, 1);
    toast.success(`${product.title} added to cart!`);
  };

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
        className="relative block aspect-square bg-gray-100 overflow-hidden"
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
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
            Out of Stock
          </span>
        )}

        {/* Low stock badge (only when NOT out of stock) */}
        {product.stock > 0 && product.stock < 5 && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
            Only {product.stock} left
          </span>
        )}

        {/* Category badge */}
        {product.category && (
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1 rounded-full z-10">
            {product.category}
          </span>
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
      <div className="p-6 flex flex-col flex-1 gap-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 truncate">
          {product.category || ' '}
        </p>
        <h3 className="font-semibold text-gray-800 truncate leading-snug">
          {product.title}
        </h3>
        <p className="text-xl font-bold text-gray-900 mt-1" style={{ color: 'var(--color-brand, #4f46e5)' }}>
          {formatPrice(product.price, currency, locale)}
        </p>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        {canShop ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="w-full text-white px-6 py-3 rounded-full font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            style={{ backgroundColor: 'var(--color-brand, #4f46e5)' }}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </motion.button>
        ) : (
          <p className="w-full py-3 text-center text-xs text-gray-400 border border-gray-200 rounded-full">
            Log in as customer to shop
          </p>
        )}
      </div>
    </motion.div>
  );
}
