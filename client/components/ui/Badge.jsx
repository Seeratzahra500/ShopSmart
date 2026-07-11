'use client';

const TONES = {
  neutral: 'bg-[var(--bg-sunken)] text-[var(--text-secondary)]',
  brand:   'bg-[var(--brand-soft)] text-[var(--brand-ink)]',
  success: 'bg-[var(--success)]/10 text-[var(--success)]',
  warning: 'bg-[var(--warning)]/10 text-[var(--warning)]',
  danger:  'bg-[var(--danger)]/10 text-[var(--danger)]',
};

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-sm)]',
        'text-[11px] font-medium uppercase tracking-wide',
        TONES[tone],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
