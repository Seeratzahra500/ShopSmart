'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col fixed top-16 bottom-0 z-40">

        {/* Top section: brand + user */}
        <div className="p-4 border-b border-white/10">
          <p
            className="text-sm font-bold tracking-tight"
            style={{ color: 'var(--color-brand)' }}
          >
            ShopSmart
          </p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5">
            Admin Panel
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold uppercase">
                {user.name ? user.name.charAt(0) : '?'}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-200 truncate">{user.name}</p>
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
                className={[
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'text-white bg-white/10 border-l-2 border-[var(--color-brand)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5',
                ].join(' ')}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: back to home */}
        <div className="p-3 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
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
