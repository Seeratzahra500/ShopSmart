'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/formatPrice';
import { SPRING } from '@/lib/motion';

export default function ProductCard({ product, currency = 'PKR', locale = 'ur-PK', slug }) {
  const { addToCart } = useCart();
  const { user }      = useAuth();
  const canShop        = !user || user.role === 'customer';
  const [liked, setLiked] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, storeSlug: slug }, 1);
    toast.success(`${product.title} added to cart`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock   = product.stock > 0 && product.stock < 5;

  return (
    <div className="group flex flex-col">
      <Link
        href={slug ? `/store/${slug}/products/${product._id}` : `/products/${product._id}`}
        className="relative block aspect-[4/5] rounded-[var(--radius-lg)] bg-[var(--bg-sunken)] overflow-hidden"
      >
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className={[
              'object-cover transition-transform duration-700 ease-out',
              'group-hover:scale-[1.04]',
              isOutOfStock ? 'saturate-0 opacity-60' : '',
            ].join(' ')}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
            No image
          </div>
        )}

        {isOutOfStock && (
          <span className="absolute top-3 left-3 bg-[var(--bg-card)] text-[var(--text-secondary)] text-[11px] font-medium px-2.5 py-1 rounded-[var(--radius-sm)]">
            Sold out
          </span>
        )}
        {isLowStock && (
          <span className="absolute top-3 left-3 bg-[var(--warning)]/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-[var(--radius-sm)]">
            Only {product.stock} left
          </span>
        )}

        {canShop && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked((v) => !v); }}
            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-card)]/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
            aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6"
              className={`w-4 h-4 ${liked ? 'text-[var(--danger)]' : 'text-[var(--text-secondary)]'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {canShop && !isOutOfStock && (
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.9 }}
            transition={SPRING}
            aria-label="Add to cart"
            className={[
              'absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full',
              'bg-[var(--bg-card)] text-[var(--text-main)] shadow-[var(--shadow-lift)]',
              'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0',
              'transition-all duration-200 focus-visible:opacity-100 focus-visible:translate-y-0',
            ].join(' ')}
          >
            {justAdded ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--success)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            )}
          </motion.button>
        )}
      </Link>

      <div className="mt-3 flex flex-col gap-0.5">
        {product.category && (
          <p className="eyebrow text-[10px]">{product.category}</p>
        )}
        <h3 className="text-sm font-medium text-[var(--text-main)] leading-snug line-clamp-2">
          {product.title}
        </h3>
        <p className={[
          'font-tabular text-sm font-semibold mt-0.5',
          isOutOfStock ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-main)]',
        ].join(' ')}>
          {formatPrice(product.price, currency, locale)}
        </p>
      </div>
    </div>
  );
}
