'use client';
import { useStore } from '@/context/StoreContext';

export default function AnnouncementBar() {
  const { store } = useStore();

  if (!store?.announcement?.isActive || !store.announcement.text) return null;

  return (
    <div
      className="w-full text-center text-sm font-medium py-2 px-4"
      style={{ backgroundColor: store.announcement.color || 'var(--color-brand)', color: '#fff' }}
    >
      {store.announcement.text}
    </div>
  );
}
