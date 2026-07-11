'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LandingContent from '@/components/LandingContent';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user?.role === 'admin')       router.replace('/admin/dashboard');
    else if (user?.role === 'shopowner') router.replace('/dashboard');
    else if (user)                    router.replace('/stores');
  }, [user, loading, router]);

  if (loading) return null;
  if (user) return null;

  return <LandingContent />;
}
