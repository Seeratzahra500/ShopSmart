'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';

export default function AnnouncementBar() {
  const { store } = useStore();
  const [dismissed, setDismissed] = useState(false);

  if (!store?.announcement?.isActive || !store.announcement.text) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key="announcement-bar"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full flex items-center justify-center text-sm font-medium py-2.5 px-10"
          style={{
            backgroundColor: store.announcement.color || 'var(--color-brand)',
            color: '#fff',
          }}
        >
          <span className="text-center leading-snug">{store.announcement.text}</span>

          <motion.button
            aria-label="Dismiss announcement"
            onClick={() => setDismissed(true)}
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
