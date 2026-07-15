'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const CartContext = createContext(null);

const cartKey  = (uid) => `shopsmart_cart_${uid  || 'guest'}`;
const storeKey = (uid) => `shopsmart_cart_store_${uid || 'guest'}`;

// Settles the guest cart when a session becomes logged-in. House rule:
// guest items merge into the account's saved cart (quantities add up for
// the same product), and the guest keys are removed so the next signed-out
// visitor starts with a clean cart. The cart is single-store, so when the
// two carts belong to different stores the guest cart wins outright — the
// same "most recent store wins" rule addToCart applies on a store switch.
const settleGuestCart = (uid) => {
  const guestRaw = localStorage.getItem(cartKey());
  if (guestRaw) {
    const guestItems = JSON.parse(guestRaw);
    if (guestItems.length) {
      const guestStore = localStorage.getItem(storeKey());
      const userStore  = localStorage.getItem(storeKey(uid));
      const userRaw    = localStorage.getItem(cartKey(uid));
      const userItems  = userRaw ? JSON.parse(userRaw) : [];
      const sameStore  = !userItems.length || !guestStore || !userStore || guestStore === userStore;
      const merged = sameStore ? [...userItems] : [];
      for (const g of guestItems) {
        const existing = merged.find((i) => i._id === g._id);
        if (existing) existing.quantity += g.quantity;
        else merged.push(g);
      }
      localStorage.setItem(cartKey(uid), JSON.stringify(merged));
      const slug = guestStore || (sameStore ? userStore : null);
      if (slug) localStorage.setItem(storeKey(uid), slug);
      else      localStorage.removeItem(storeKey(uid));
    }
  }
  localStorage.removeItem(cartKey());
  localStorage.removeItem(storeKey());
};

export function CartProvider({ children }) {
  const { user }                  = useAuth();
  const [items, setItems]         = useState([]);
  const [storeSlug, setStoreSlug] = useState(null);

  // Reload from localStorage whenever the logged-in user changes (login / logout / switch account).
  // Deliberately reads localStorage + sets state inside the effect (not a
  // useState initializer) to stay hydration-safe — localStorage isn't
  // available during SSR, so reading it during render would mismatch.
  const prevUid = useRef(null);
  useEffect(() => {
    try {
      const uid = user?.id;
      // Guest → logged-in transition (explicit login, or a remembered session
      // resuming after a reload — both count as "signing in" for cart rules).
      if (uid && !prevUid.current) settleGuestCart(uid);
      prevUid.current = uid || null;
      const stored      = localStorage.getItem(cartKey(uid));
      const storedStore = localStorage.getItem(storeKey(uid));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
      setItems(stored ? JSON.parse(stored) : []);
      setStoreSlug(storedStore || null);
    } catch {
      setItems([]);
      setStoreSlug(null);
    }
  }, [user?.id]);

  const persist = (newItems, slug) => {
    const uid = user?.id;
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
    const uid = user?.id;
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
