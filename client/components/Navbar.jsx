'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';

/* ─── Animated nav link with sliding underline ─── */
const NavLink = ({ href, children, onClick, mobile }) => {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  const [hovered, setHovered] = useState(false);

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`block py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
          active
            ? 'text-white bg-white/15'
            : 'text-white/75 hover:text-white hover:bg-white/10'
        }`}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative text-sm font-medium pb-0.5"
      style={{ color: active ? 'var(--color-brand)' : undefined }}
    >
      <span className={active ? '' : 'text-gray-500 hover:text-gray-900 transition-colors'}>
        {children}
      </span>
      <motion.span
        className="absolute bottom-0 left-0 h-0.5 rounded-full"
        style={{ backgroundColor: 'var(--color-brand, #4f46e5)' }}
        initial={{ width: active ? '100%' : '0%' }}
        animate={{ width: active || hovered ? '100%' : '0%' }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />
    </Link>
  );
};

/* ─── Cart icon with animated badge ─── */
const CartIcon = ({ count, className = '' }) => (
  <Link href="/cart" className={`relative text-gray-500 hover:text-gray-900 transition-colors ${className}`}>
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
    <AnimatePresence mode="popLayout">
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="absolute -top-2 -right-2 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold"
          style={{ backgroundColor: 'var(--color-brand, #4f46e5)' }}
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      )}
    </AnimatePresence>
  </Link>
);

/* ─── Main Navbar ─── */
export default function Navbar() {
  const { user, logout }  = useAuth();
  const { cartCount }     = useCart();
  const { store }         = useStore();
  const [open, setOpen]   = useState(false);
  const close = () => setOpen(false);

  const storeName = store?.name || 'ShopSmart';
  const logoUrl   = store?.logoUrl;
  const isCustomer  = user?.role === 'customer';
  const isShopowner = user?.role === 'shopowner';
  const isAdmin     = user?.role === 'admin';

  const brandHref = isAdmin
    ? '/admin/dashboard'
    : isShopowner
    ? '/dashboard'
    : isCustomer
    ? '/stores'
    : '/auth/login';

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          {/* ── Brand / Logo ── */}
          <Link href={brandHref} className="flex items-center gap-2 shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-brand, #4f46e5)' }}>
                {storeName}
              </span>
            )}
          </Link>

          {/* ── Desktop Nav Links (center) ── */}
          <div className="hidden md:flex items-center gap-7">
            {isAdmin && (
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  href="/admin/dashboard"
                  className="text-sm font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--color-brand, #4f46e5)' }}
                >
                  Admin Panel ↗
                </Link>
              </motion.div>
            )}
            {isShopowner && (
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--color-brand, #4f46e5)' }}
                >
                  Dashboard ↗
                </Link>
              </motion.div>
            )}
            {isCustomer && (
              <>
                <NavLink href="/stores">Stores</NavLink>
                <NavLink href="/orders">My Orders</NavLink>
              </>
            )}
          </div>

          {/* ── Desktop Auth + Cart (right) ── */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={logout}
                className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
              >
                Logout
              </motion.button>
            ) : (
              <>
                <NavLink href="/auth/login">Login</NavLink>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/auth/register"
                    className="text-sm font-semibold text-white px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--color-brand, #4f46e5)' }}
                  >
                    Register
                  </Link>
                </motion.div>
              </>
            )}

            {isCustomer && <CartIcon count={cartCount} />}
          </div>

          {/* ── Mobile: cart + hamburger ── */}
          <div className="md:hidden flex items-center gap-3">
            {isCustomer && (
              <CartIcon count={cartCount} className="text-gray-600 hover:text-gray-900" />
            )}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setOpen((o) => !o)}
              className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={close}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: 'easeInOut' }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col md:hidden overflow-hidden"
              style={{ backgroundColor: 'var(--color-brand, #4f46e5)' }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/20">
                <span className="text-white font-bold text-lg tracking-tight">{storeName}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={close}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Drawer links */}
              <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
                {isAdmin && (
                  <NavLink href="/admin/dashboard" mobile onClick={close}>Admin Panel</NavLink>
                )}
                {isShopowner && (
                  <NavLink href="/dashboard" mobile onClick={close}>Dashboard</NavLink>
                )}
                {isCustomer && (
                  <>
                    <NavLink href="/stores" mobile onClick={close}>Stores</NavLink>
                    <NavLink href="/orders" mobile onClick={close}>My Orders</NavLink>
                    <NavLink href="/cart" mobile onClick={close}>
                      Cart{cartCount > 0 ? ` (${cartCount})` : ''}
                    </NavLink>
                  </>
                )}
                {!user && (
                  <>
                    <NavLink href="/auth/login" mobile onClick={close}>Login</NavLink>
                    <NavLink href="/auth/register" mobile onClick={close}>Register</NavLink>
                  </>
                )}
                {user && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { logout(); close(); }}
                    className="block w-full text-left py-3 px-4 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
                  >
                    Logout
                  </motion.button>
                )}
              </nav>

              {/* Drawer footer — signed-in user info */}
              {user && (
                <div className="px-5 py-4 border-t border-white/20">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Signed in as</p>
                  <p className="text-sm font-semibold text-white truncate mt-0.5">{user.name}</p>
                  <p className="text-xs text-white/50 capitalize mt-0.5">{user.role}</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
