'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user)                          router.replace('/auth/login');
    else if (user.role === 'admin')     router.replace('/admin/dashboard');
    else if (user.role === 'shopowner') router.replace('/dashboard');
    else                                router.replace('/stores');
  }, [user, loading, router]);

  return null;
}
