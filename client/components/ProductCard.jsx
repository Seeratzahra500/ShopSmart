'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/formatPrice';

export default function ProductCard({ product, currency = 'PKR', locale = 'ur-PK' }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(product);
    toast.success(`${product.title} added to cart!`);
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
      className="bg-white overflow-hidden flex flex-col"
      style={{
        borderRadius: 'var(--border-radius-card, 8px)',
        border: 'var(--card-border, 1px solid #e5e7eb)',
        boxShadow: 'var(--card-shadow, none)',
      }}
    >
      <Link href={`/products/${product._id}`}>
        <div className="relative h-48 bg-gray-100">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
          )}
          {product.stock > 0 && product.stock < 5 && (
            <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Out of Stock
            </span>
          )}
        </div>
        <div className="p-4 flex-1">
          <h3 className="font-semibold text-gray-800 truncate">{product.title}</h3>
          <p className="text-sm text-gray-500 mt-1 truncate">{product.category}</p>
          <p className="font-bold mt-2" style={{ color: 'var(--color-brand, #4f46e5)' }}>
            {formatPrice(product.price, currency, locale)}
          </p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="w-full text-white py-2 text-sm font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--color-brand, #4f46e5)',
            borderRadius: 'var(--border-radius-btn, 8px)',
          }}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  );
}
