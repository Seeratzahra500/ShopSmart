'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import Button from './ui/Button';

/* ─── Animated nav link with sliding underline ─── */
const NavLink = ({ href, children, onClick, mobile, prefetch, light }) => {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  const [hovered, setHovered] = useState(false);

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        prefetch={prefetch}
        className={`block py-3 px-4 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
          active
            ? 'text-[var(--text-main)] bg-[var(--bg-sunken)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sunken)]'
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
      prefetch={prefetch}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative text-sm font-medium pb-0.5"
      style={{ color: active ? 'var(--color-brand)' : undefined }}
    >
      <span className={active ? '' : light ? 'text-white/70 hover:text-white transition-colors' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors'}>
        {children}
      </span>
      <motion.span
        className="absolute bottom-0 left-0 h-0.5 rounded-full"
        style={{ backgroundColor: 'var(--color-brand)' }}
        initial={{ width: active ? '100%' : '0%' }}
        animate={{ width: active || hovered ? '100%' : '0%' }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />
    </Link>
  );
};

/* ─── Cart icon with animated badge ─── */
const CartIcon = ({ count, className = '' }) => (
  <Link href="/cart" className={`relative text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors ${className}`}>
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
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      )}
    </AnimatePresence>
  </Link>
);

/* ─── Signed-in user menu ─── */
const UserMenu = ({ user, logout }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 hover:bg-[var(--bg-sunken)] transition-colors"
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          {user.name?.charAt(0)?.toUpperCase() || '?'}
        </span>
        <span className="text-sm font-medium text-[var(--text-main)] hidden lg:inline">{user.name}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-overlay)] py-1.5 z-50"
          >
            <div className="px-3.5 py-2 border-b border-[var(--border)]">
              <p className="text-sm font-medium text-[var(--text-main)] truncate">{user.name}</p>
              <p className="eyebrow mt-0.5">{user.role}</p>
            </div>
            {user.role === 'customer' && (
              <Link href="/orders" className="block px-3.5 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-main)] transition-colors">
                My Orders
              </Link>
            )}
            <button
              onMouseDown={logout}
              className="block w-full text-left px-3.5 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger)]/8 transition-colors"
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main Navbar ─── */
export default function Navbar() {
  const { user, logout }  = useAuth();
  const { cartCount }     = useCart();
  const { store }         = useStore();
  const [open, setOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const close = () => setOpen(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));

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

  // The landing hero is light (ink-on-paper), so the navbar always reads
  // dark-on-light — only the scrolled blur/bg treatment changes.
  const light = false;

  return (
    <>
      <nav
        className={[
          'sticky top-0 z-50 border-b transition-colors duration-200',
          scrolled
            ? 'backdrop-blur-md bg-[var(--bg-page)]/85 border-[var(--border)]'
            : 'bg-transparent border-transparent',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          {/* ── Brand / Logo ── */}
          <Link href={brandHref} className="flex items-center gap-2 shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-8 w-auto object-contain" />
            ) : (
              <span
                className="font-display text-xl font-semibold tracking-tight"
                style={{ color: light ? '#FFFFFF' : 'var(--color-brand)' }}
              >
                {storeName}
              </span>
            )}
          </Link>

          {/* ── Desktop Nav Links (center) ── */}
          <div className="hidden md:flex items-center gap-7">
            <NavLink href="/about" light={light}>About</NavLink>
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                prefetch={false}
                className="text-sm font-semibold hover:opacity-80 transition-opacity"
                style={{ color: light ? '#FFFFFF' : 'var(--color-brand)' }}
              >
                Admin Panel ↗
              </Link>
            )}
            {isShopowner && (
              <Link
                href="/dashboard"
                className="text-sm font-semibold hover:opacity-80 transition-opacity"
                style={{ color: light ? '#FFFFFF' : 'var(--color-brand)' }}
              >
                Dashboard ↗
              </Link>
            )}
            {isCustomer && (
              <>
                <NavLink href="/stores" light={light}>Stores</NavLink>
                <NavLink href="/orders" light={light}>My Orders</NavLink>
              </>
            )}
          </div>

          {/* ── Desktop Auth + Cart (right) ── */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <UserMenu user={user} logout={logout} />
            ) : (
              <>
                <NavLink href="/auth/login" light={light}>Login</NavLink>
                <Button as={Link} href="/auth/register" size="sm">Register</Button>
              </>
            )}

            {isCustomer && <CartIcon count={cartCount} />}
          </div>

          {/* ── Mobile: cart + hamburger ── */}
          <div className="md:hidden flex items-center gap-3">
            {isCustomer && (
              <CartIcon count={cartCount} className="text-[var(--text-secondary)] hover:text-[var(--text-main)]" />
            )}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setOpen((o) => !o)}
              className={`p-1.5 rounded-lg transition-colors ${
                light
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sunken)]'
              }`}
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
              className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col md:hidden overflow-hidden bg-[var(--bg-card)]"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <span className="font-display font-semibold text-lg tracking-tight text-[var(--text-main)]">{storeName}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={close}
                  className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sunken)] transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Drawer links */}
              <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
                <NavLink href="/about" mobile onClick={close}>About</NavLink>
                {isAdmin && (
                  <NavLink href="/admin/dashboard" mobile prefetch={false} onClick={close}>Admin Panel</NavLink>
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
                  <button
                    onClick={() => { logout(); close(); }}
                    className="block w-full text-left py-3 px-4 text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger)]/8 rounded-[var(--radius-md)] transition-colors"
                  >
                    Logout
                  </button>
                )}
              </nav>

              {/* Drawer footer — signed-in user info */}
              {user && (
                <div className="px-5 py-4 border-t border-[var(--border)]">
                  <p className="eyebrow">Signed in as</p>
                  <p className="text-sm font-semibold text-[var(--text-main)] truncate mt-0.5">{user.name}</p>
                  <p className="text-xs text-[var(--text-muted)] capitalize mt-0.5">{user.role}</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
