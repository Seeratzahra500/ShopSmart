'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const NAV = [
  {
    href: '/dashboard',
    label: 'Overview',
    exact: true,
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    href: '/dashboard/products',
    label: 'Products',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    href: '/dashboard/orders',
    label: 'Orders',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    href: '/dashboard/settings',
    label: 'Store Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
];

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'shopowner')) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (loading || !user || user.role !== 'shopowner') return null;

  const SidebarContent = ({ onLinkClick }) => (
    <>
      <div className="p-4 border-b border-[var(--border)]">
        <p className="eyebrow">Seller Dashboard</p>
        <p className="text-sm font-medium text-[var(--text-main)] mt-0.5 truncate">{user.name}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors relative',
                active
                  ? 'bg-[var(--brand-soft)] text-[var(--brand-ink)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-main)]',
              ].join(' ')}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[var(--color-brand)]" />
              )}
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[var(--border)] space-y-1">
        <ViewStoreLink onLinkClick={onLinkClick} />
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] rounded-[var(--radius-md)] hover:bg-[var(--bg-sunken)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)]">

      {/* ── Desktop Sidebar (md+) ── */}
      <aside className="hidden md:flex w-56 bg-[var(--bg-card)] border-r border-[var(--border)] flex-col fixed top-16 bottom-0 z-40">
        <SidebarContent onLinkClick={undefined} />
      </aside>

      {/* ── Mobile: top bar with hamburger ── */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-[var(--bg-card)] border-b border-[var(--border)] h-12 flex items-center px-4 gap-3">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sunken)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-[var(--text-main)] truncate">Seller Dashboard</p>
      </div>

      {/* ── Mobile: slide drawer overlay ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={() => setDrawerOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

          {/* Drawer panel */}
          <aside
            className="relative w-64 bg-[var(--bg-card)] flex flex-col h-full shadow-[var(--shadow-overlay)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <p className="text-sm font-bold" style={{ color: 'var(--color-brand)' }}>ShopSmart</p>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sunken)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarContent onLinkClick={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-56 pt-12 md:pt-0 p-6 md:p-8">{children}</main>
    </div>
  );
}

function ViewStoreLink({ onLinkClick }) {
  const { user } = useAuth();
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get('/store/mine/data')
      .then(({ data }) => setSlug(data.slug))
      .catch(() => {});
  }, [user]);

  if (!user) return null;

  return (
    <Link
      href={slug ? `/store/${slug}` : '#'}
      target={slug ? '_blank' : undefined}
      rel="noopener noreferrer"
      onClick={onLinkClick}
      className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] rounded-[var(--radius-md)] hover:bg-[var(--bg-sunken)] transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      View Store
    </Link>
  );
}
