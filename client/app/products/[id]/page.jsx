'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageWrapper from '@/components/PageWrapper';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';

export default function ProductDetailPage() {
  const { id }            = useParams();
  const router            = useRouter();
  const { addToCart }     = useCart();
  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imgIdx, setImgIdx]     = useState(0);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => router.push('/products'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleAdd = () => {
    addToCart(product, quantity);
    toast.success(`${product.title} added to cart!`);
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
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-gray-800">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-800">Products</Link>
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

            <p className="text-3xl font-bold" style={{ color: 'var(--color-brand)' }}>
              {formatPrice(product.price)}
            </p>

            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {product.stock === 0 ? 'Out of stock' : product.stock < 10 ? `Only ${product.stock} left` : 'In stock'}
              </span>
            </div>

            {/* Quantity + Add */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium"
                  >−</button>
                  <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium"
                  >+</button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAdd}
                  className="flex-1 py-2.5 text-white font-semibold rounded-lg transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-brand)' }}
                >
                  Add to Cart
                </motion.button>
              </div>
            )}

            <Link
              href="/cart"
              className="block text-center py-2.5 text-sm font-medium border-2 rounded-lg transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--color-brand)', color: 'var(--color-brand)' }}
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
