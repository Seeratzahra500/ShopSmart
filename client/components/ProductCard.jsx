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

// Shared wishlist heart — same markup/behavior across every card variant.
function WishlistButton({ liked, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={className}
      aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6"
        className={`w-4 h-4 ${liked ? 'text-[var(--danger)]' : 'text-[var(--text-secondary)]'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}

function AddToCartIcon({ justAdded }) {
  return justAdded ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--success)]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function StockBadge({ isOutOfStock, isLowStock, stock }) {
  if (isOutOfStock) {
    return (
      <span className="absolute top-3 left-3 bg-[var(--bg-card)] text-[var(--text-secondary)] text-[11px] font-medium px-2.5 py-1 rounded-[var(--radius-sm)]">
        Sold out
      </span>
    );
  }
  if (isLowStock) {
    return (
      <span className="absolute top-3 left-3 bg-[var(--warning)]/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-[var(--radius-sm)]">
        Only {stock} left
      </span>
    );
  }
  return null;
}

export default function ProductCard({ product, currency = 'PKR', locale = 'ur-PK', slug, cardStyle = 'gallery' }) {
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

  const toggleLike = (e) => {
    e.preventDefault(); e.stopPropagation();
    setLiked((v) => !v);
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock   = product.stock > 0 && product.stock < 5;
  const href = slug ? `/store/${slug}/products/${product._id}` : `/products/${product._id}`;
  const price = formatPrice(product.price, currency, locale);

  if (cardStyle === 'framed') return <FramedCard {...{ product, href, price, canShop, isOutOfStock, isLowStock, liked, toggleLike, justAdded, handleAdd }} />;
  if (cardStyle === 'tilted') return <TiltedCard {...{ product, href, price, canShop, isOutOfStock, isLowStock, liked, toggleLike, justAdded, handleAdd }} />;
  if (cardStyle === 'compact') return <CompactCard {...{ product, href, price, canShop, isOutOfStock, isLowStock, liked, toggleLike, justAdded, handleAdd }} />;
  return <GalleryCard {...{ product, href, price, canShop, isOutOfStock, isLowStock, liked, toggleLike, justAdded, handleAdd }} />;
}

/* ── Gallery (default) — current design, unchanged ─────────────────────── */
function GalleryCard({ product, href, price, canShop, isOutOfStock, isLowStock, liked, toggleLike, justAdded, handleAdd }) {
  return (
    <div className="group flex flex-col">
      <Link href={href} className="relative block aspect-[4/5] rounded-[var(--radius-lg)] bg-[var(--bg-sunken)] overflow-hidden">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className={['object-cover transition-transform duration-700 ease-out', 'group-hover:scale-[1.04]', isOutOfStock ? 'saturate-0 opacity-60' : ''].join(' ')}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm">No image</div>
        )}

        <StockBadge isOutOfStock={isOutOfStock} isLowStock={isLowStock} stock={product.stock} />

        {canShop && (
          <WishlistButton
            liked={liked}
            onClick={toggleLike}
            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-card)]/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
          />
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
            <AddToCartIcon justAdded={justAdded} />
          </motion.button>
        )}
      </Link>

      <div className="mt-3 flex flex-col gap-0.5">
        {product.category && <p className="eyebrow text-[10px]">{product.category}</p>}
        <h3 className="text-sm font-medium text-[var(--text-main)] leading-snug line-clamp-2">{product.title}</h3>
        <p className={['font-tabular text-sm font-semibold mt-0.5', isOutOfStock ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-main)]'].join(' ')}>
          {price}
        </p>
      </div>
    </div>
  );
}

/* ── Framed — visible card with border/bg/shadow, always-on add button ──── */
function FramedCard({ product, href, price, canShop, isOutOfStock, isLowStock, liked, toggleLike, justAdded, handleAdd }) {
  return (
    <div
      className="group flex flex-col h-full bg-[var(--bg-card)] overflow-hidden"
      style={{ border: 'var(--card-border)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}
    >
      <Link href={href} className="relative block aspect-[4/5] p-3">
        <div className="relative w-full h-full rounded-[var(--radius-sm)] overflow-hidden bg-[var(--bg-sunken)]">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className={['object-cover transition-transform duration-500', 'group-hover:scale-[1.03]', isOutOfStock ? 'saturate-0 opacity-60' : ''].join(' ')}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm">No image</div>
          )}
          <StockBadge isOutOfStock={isOutOfStock} isLowStock={isLowStock} stock={product.stock} />
          {canShop && (
            <WishlistButton
              liked={liked}
              onClick={toggleLike}
              className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-card)]/90 backdrop-blur-sm"
            />
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-1 px-4 pb-4 pt-1 flex-1">
        {product.category && <p className="eyebrow text-[10px]">{product.category}</p>}
        <h3 className="text-sm font-medium text-[var(--text-main)] leading-snug line-clamp-2">{product.title}</h3>
        <p className={['font-tabular text-base font-bold mt-0.5', isOutOfStock ? 'text-[var(--text-muted)] line-through' : ''].join(' ')} style={isOutOfStock ? undefined : { color: 'var(--color-brand)' }}>
          {price}
        </p>

        {canShop && (
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="mt-auto pt-2 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-brand)', borderRadius: 'var(--border-radius-btn)' }}
          >
            <AddToCartIcon justAdded={justAdded} />
            {isOutOfStock ? 'Sold out' : justAdded ? 'Added' : 'Add to cart'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Tilted — playful, slight rotate on hover, brand blob backdrop ──────── */
function TiltedCard({ product, href, price, canShop, isOutOfStock, isLowStock, liked, toggleLike, justAdded, handleAdd }) {
  return (
    <div className="group flex flex-col">
      <Link href={href} className="relative block aspect-[4/5]">
        <div
          className="absolute -inset-2 rounded-[var(--radius-xl)] opacity-0 group-hover:opacity-60 transition-opacity duration-300 blur-lg pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--color-brand), transparent 70%)' }}
        />
        <motion.div
          whileHover={{ rotate: -2, scale: 1.02 }}
          transition={SPRING}
          className="relative w-full h-full rounded-[var(--radius-xl)] bg-[var(--bg-sunken)] overflow-hidden"
        >
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className={['object-cover', isOutOfStock ? 'saturate-0 opacity-60' : ''].join(' ')}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm">No image</div>
          )}
          <StockBadge isOutOfStock={isOutOfStock} isLowStock={isLowStock} stock={product.stock} />
          {canShop && (
            <WishlistButton
              liked={liked}
              onClick={toggleLike}
              className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-card)]/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
            />
          )}
        </motion.div>
      </Link>

      <div className="mt-4 flex flex-col gap-1 items-start">
        {product.category && <p className="eyebrow text-[10px]">{product.category}</p>}
        <h3 className="text-sm font-semibold text-[var(--text-main)] leading-snug line-clamp-2">{product.title}</h3>
        <div className="flex items-center gap-3 mt-1 w-full">
          <p className={['font-tabular text-sm font-bold', isOutOfStock ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-main)]'].join(' ')}>
            {price}
          </p>
          {canShop && !isOutOfStock && (
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.9 }}
              transition={SPRING}
              aria-label="Add to cart"
              className="ml-auto flex items-center justify-center w-8 h-8 rounded-full text-white"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              <AddToCartIcon justAdded={justAdded} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Compact — horizontal, small image left, suits compact density ──────── */
function CompactCard({ product, href, price, canShop, isOutOfStock, isLowStock, liked, toggleLike, justAdded, handleAdd }) {
  return (
    <Link href={href} className="group flex items-center gap-3 py-2 border-b border-[var(--border)]">
      <div className="relative w-16 h-16 flex-shrink-0 rounded-[var(--radius-sm)] bg-[var(--bg-sunken)] overflow-hidden">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className={['object-cover', isOutOfStock ? 'saturate-0 opacity-60' : ''].join(' ')}
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[10px]">No image</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {product.category && <p className="eyebrow text-[9px] mb-0.5">{product.category}</p>}
        <h3 className="text-sm font-medium text-[var(--text-main)] leading-snug truncate">{product.title}</h3>
        <p className={['font-tabular text-xs font-semibold mt-0.5', isOutOfStock ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-main)]'].join(' ')}>
          {price}
        </p>
        {isLowStock && <p className="text-[10px] text-[var(--warning)] mt-0.5">Only {product.stock} left</p>}
        {isOutOfStock && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Sold out</p>}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {canShop && (
          <WishlistButton
            liked={liked}
            onClick={toggleLike}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--bg-sunken)] transition-colors"
          />
        )}
        {canShop && !isOutOfStock && (
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.9 }}
            transition={SPRING}
            aria-label="Add to cart"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--bg-sunken)] transition-colors text-[var(--text-main)]"
          >
            <AddToCartIcon justAdded={justAdded} />
          </motion.button>
        )}
      </div>
    </Link>
  );
}
