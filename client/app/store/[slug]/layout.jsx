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
    if (!user)                          { router.replace(`/auth/login?next=/store/${slug}`); return; }
    if (user.role === 'admin')          { router.replace('/admin/dashboard'); return; }
    if (user.role === 'shopowner')      { router.replace('/dashboard'); return; }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'customer') return null;

  return (
    <StoreProvider slug={slug}>
      <AnnouncementBar />
      {children}
    </StoreProvider>
  );
}
