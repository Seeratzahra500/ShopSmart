'use client';
import { AnimatePresence, motion } from 'framer-motion';

export default function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || props.name;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-sm)] bg-[var(--bg-card)]',
          'border transition-colors outline-none',
          error
            ? 'border-[var(--danger)] focus:ring-2 focus:ring-[var(--danger)]/20'
            : 'border-[var(--border-strong)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15',
        ].join(' ')}
        {...props}
      />
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="text-xs text-[var(--danger)] mt-1.5 overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
