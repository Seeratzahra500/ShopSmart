'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';

export default function AnnouncementBar() {
  const { store } = useStore();
  const key = store?._id ? `announcement-dismissed-${store._id}` : null;
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined' || !key) return false;
    return sessionStorage.getItem(key) === '1';
  });

  if (!store?.announcement?.isActive || !store.announcement.text) return null;

  const dismiss = () => {
    setDismissed(true);
    if (key) sessionStorage.setItem(key, '1');
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key="announcement-bar"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full flex items-center justify-center text-xs font-medium tracking-wide py-2.5 px-10"
          style={{
            backgroundColor: store.announcement.color || 'var(--color-brand)',
            color: '#fff',
          }}
        >
          <span className="text-center leading-snug">{store.announcement.text}</span>

          <motion.button
            aria-label="Dismiss announcement"
            onClick={dismiss}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
