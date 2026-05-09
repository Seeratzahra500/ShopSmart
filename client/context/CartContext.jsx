'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const CartContext = createContext(null);

const cartKey  = (uid) => `shopsmart_cart_${uid  || 'guest'}`;
const storeKey = (uid) => `shopsmart_cart_store_${uid || 'guest'}`;

export function CartProvider({ children }) {
  const { user }                  = useAuth();
  const [items, setItems]         = useState([]);
  const [storeSlug, setStoreSlug] = useState(null);

  // Reload from localStorage whenever the logged-in user changes (login / logout / switch account)
  useEffect(() => {
    try {
      const uid         = user?._id;
      const stored      = localStorage.getItem(cartKey(uid));
      const storedStore = localStorage.getItem(storeKey(uid));
      setItems(stored ? JSON.parse(stored) : []);
      setStoreSlug(storedStore || null);
    } catch {
      setItems([]);
      setStoreSlug(null);
    }
  }, [user?._id]);

  const persist = (newItems, slug) => {
    const uid = user?._id;
    setItems(newItems);
    localStorage.setItem(cartKey(uid), JSON.stringify(newItems));
    if (slug !== undefined) {
      setStoreSlug(slug);
      if (slug) localStorage.setItem(storeKey(uid), slug);
      else      localStorage.removeItem(storeKey(uid));
    }
  };

  const addToCart = (product, quantity = 1) => {
    if (user?.role === 'admin' || user?.role === 'shopowner') {
      toast.error('Admin and shopowner accounts cannot shop. Log in as a customer.');
      return;
    }

    const productStore = product.storeSlug || null;

    if (items.length > 0 && storeSlug && productStore && productStore !== storeSlug) {
      toast('Cart cleared — switching to a new store.', { icon: '🛒' });
      persist([{ ...product, quantity }], productStore);
      return;
    }

    const existing = items.find((i) => i._id === product._id);
    const updated = existing
      ? items.map((i) => i._id === product._id ? { ...i, quantity: i.quantity + quantity } : i)
      : [...items, { ...product, quantity }];
    persist(updated, productStore ?? storeSlug);
  };

  const removeFromCart = (productId) => {
    const updated = items.filter((i) => i._id !== productId);
    persist(updated, updated.length === 0 ? null : storeSlug);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    persist(items.map((i) => i._id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    const uid = user?._id;
    setItems([]);
    setStoreSlug(null);
    localStorage.removeItem(cartKey(uid));
    localStorage.removeItem(storeKey(uid));
  };

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, storeSlug, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
