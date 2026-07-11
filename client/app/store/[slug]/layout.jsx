'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StoreProvider } from '@/context/StoreContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import { useAuth } from '@/context/AuthContext';

export default function StoreLayout({ children }) {
  const { slug }          = useParams();
  const { user, loading } = useAuth();
  const router            = useRouter();

  useEffect(() => {
    if (loading) return;
    // Guests and shopowners may browse any storefront; only admins are bounced
    // (they manage the platform, not shop) back to their own dashboard.
    if (user?.role === 'admin') { router.replace('/admin/dashboard'); return; }
  }, [user, loading, router]);

  if (loading || user?.role === 'admin') return null;

  return (
    <StoreProvider slug={slug}>
      <AnnouncementBar />
      {children}
    </StoreProvider>
  );
}
