'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';

const NavLink = ({ href, children, onClick, mobile }) => {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-sm font-medium transition-colors ${
        mobile ? 'block py-2.5 px-3 rounded-lg' : ''
      } ${active
        ? mobile ? 'text-white' : 'text-gray-900'
        : mobile ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:text-gray-900'
      }`}
      style={active && !mobile ? { color: 'var(--color-brand)' } : undefined}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const { user, logout }  = useAuth();
  const { cartCount }     = useCart();
  const { store }         = useStore();
  const [open, setOpen]   = useState(false);
  const close = () => setOpen(false);

  const storeName = store?.name || 'ShopSmart';
  const logoUrl   = store?.logoUrl;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-xl font-bold" style={{ color: 'var(--color-brand)' }}>{storeName}</span>
            )}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink href="/products">Products</NavLink>
            {user?.role === 'admin' && (
              <Link href="/admin/dashboard" className="text-sm font-semibold" style={{ color: 'var(--color-brand)' }}>
                Admin ↗
              </Link>
            )}
            {user ? (
              <>
                <NavLink href="/orders">My Orders</NavLink>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink href="/auth/login">Login</NavLink>
                <Link
                  href="/auth/register"
                  className="text-sm font-semibold text-white px-4 py-2 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-brand)', borderRadius: 'var(--border-radius-btn, 8px)' }}
                >
                  Register
                </Link>
              </>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative text-gray-500 hover:text-gray-900 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    style={{ backgroundColor: 'var(--color-brand)' }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <Link href="/cart" className="relative text-gray-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  style={{ backgroundColor: 'var(--color-brand)' }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setOpen(o => !o)}
              className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              onClick={close}
            />
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col md:hidden"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/20">
                <span className="text-white font-bold text-lg">{storeName}</span>
                <button onClick={close} className="text-white/80 hover:text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                <NavLink href="/products" mobile onClick={close}>Products</NavLink>
                {user?.role === 'admin' && (
                  <NavLink href="/admin/dashboard" mobile onClick={close}>Admin Panel</NavLink>
                )}
                {user ? (
                  <>
                    <NavLink href="/orders" mobile onClick={close}>My Orders</NavLink>
                    <NavLink href="/cart" mobile onClick={close}>Cart {cartCount > 0 ? `(${cartCount})` : ''}</NavLink>
                    <button
                      onClick={() => { logout(); close(); }}
                      className="block w-full text-left py-2.5 px-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink href="/auth/login" mobile onClick={close}>Login</NavLink>
                    <NavLink href="/auth/register" mobile onClick={close}>Register</NavLink>
                    <NavLink href="/cart" mobile onClick={close}>Cart {cartCount > 0 ? `(${cartCount})` : ''}</NavLink>
                  </>
                )}
              </nav>

              {/* Footer */}
              {user && (
                <div className="px-5 py-4 border-t border-white/20">
                  <p className="text-xs text-white/60">Signed in as</p>
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
