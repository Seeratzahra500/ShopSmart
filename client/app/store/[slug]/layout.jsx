'use client';
import { useParams } from 'next/navigation';
import { StoreProvider } from '@/context/StoreContext';
import AnnouncementBar from '@/components/AnnouncementBar';

export default function StoreLayout({ children }) {
  const { slug } = useParams();

  return (
    <StoreProvider slug={slug}>
      <AnnouncementBar />
      {children}
    </StoreProvider>
  );
}
