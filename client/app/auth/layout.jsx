'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin')     { router.replace('/admin/dashboard'); return; }
      if (user.role === 'shopowner') { router.replace('/dashboard');       return; }
      router.replace('/stores');
    }
  }, [user, loading, router]);

  if (loading || user) return null;
  return <>{children}</>;
}
