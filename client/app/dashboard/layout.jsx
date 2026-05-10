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

  useEffect(() => {
    if (!loading && (!user || user.role !== 'shopowner')) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'shopowner') return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed top-16 bottom-0 z-40">
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Seller Dashboard</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5 truncate">{user.name}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={active
                  ? { backgroundColor: 'color-mix(in srgb, var(--color-brand) 10%, white)', color: 'var(--color-brand)' }
                  : { color: '#6b7280' }
                }
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-1">
          <ViewStoreLink />
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-56 p-8">{children}</main>
    </div>
  );
}

function ViewStoreLink() {
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
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      View Store
    </Link>
  );
}
