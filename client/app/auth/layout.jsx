'use client';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout({ children }) {
  const { loading } = useAuth();
  if (loading) return null;
  return <>{children}</>;
}
