'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    href: '/admin/stores',
    label: 'Stores',
    icon: 'M3 9l1-5h16l1 5M3 9h18M3 9v11a1 1 0 001 1h4a1 1 0 001-1v-4h4v4a1 1 0 001 1h4a1 1 0 001-1V9',
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
];

function SidebarContent({ pathname, user, onNavClick }) {
  return (
    <>
      {/* Top section: brand + user */}
      <div className="p-4 border-b border-[var(--border)]">
        <p
          className="text-sm font-bold tracking-tight"
          style={{ color: 'var(--color-brand)' }}
        >
          ShopSmart
        </p>
        <p className="eyebrow mt-0.5">Admin Panel</p>
        <div className="flex items-center gap-2 mt-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            <span className="text-white text-xs font-bold uppercase">
              {user.name ? user.name.charAt(0) : '?'}
            </span>
          </div>
          <p className="text-sm font-medium text-[var(--text-main)] truncate">{user.name}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={[
                'relative flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors',
                active
                  ? 'text-[var(--brand-ink)] bg-[var(--brand-soft)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sunken)]',
              ].join(' ')}
            >
              {active && (
                <motion.span
                  layoutId="admin-nav-active"
                  className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-brand)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: back to home */}
      <div className="p-3 border-t border-[var(--border)]">
        <Link
          href="/"
          onClick={onNavClick}
          className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sunken)] rounded-[var(--radius-md)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </>
  );
}

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (loading || !user || user.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)]">

      {/* ── Desktop sidebar (md+) ── */}
      <aside className="hidden md:flex w-56 bg-[var(--bg-card)] border-r border-[var(--border)] text-[var(--text-main)] flex-col fixed top-16 bottom-0 z-40">
        <SidebarContent pathname={pathname} user={user} onNavClick={undefined} />
      </aside>

      {/* ── Mobile top bar (below md) ── */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-50 bg-[var(--bg-card)] text-[var(--text-main)] flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <span className="text-sm font-bold tracking-tight">Admin Panel</span>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sunken)] transition-colors"
        >
          {/* Hamburger icon */}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      <AnimatePresence>
        {drawerOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 flex"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Slide-in panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
              className="relative w-64 bg-[var(--bg-card)] text-[var(--text-main)] flex flex-col h-full shadow-[var(--shadow-overlay)]"
            >
              {/* Close button */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="eyebrow">Menu</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sunken)] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <SidebarContent
                pathname={pathname}
                user={user}
                onNavClick={() => setDrawerOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      {/* On mobile: add top padding to clear the top bar (top-16 navbar + ~48px admin bar) */}
      <main className="flex-1 md:ml-56 p-8 pt-24 md:pt-8">{children}</main>
    </div>
  );
}
