'use client';
import { motion } from 'framer-motion';
import Button from './Button';

export default function EmptyState({ title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none" className="mb-6 text-[var(--text-muted)]">
        <motion.circle
          cx="44" cy="44" r="34"
          stroke="currentColor" strokeWidth="1.2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d="M30 44h28M44 30v28"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <h3 className="font-display text-2xl font-semibold tracking-tight mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
