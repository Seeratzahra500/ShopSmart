'use client';

const VARIANTS = {
  primary:
    'bg-[var(--color-brand)] text-white hover:bg-[var(--brand-ink)] disabled:hover:bg-[var(--color-brand)]',
  secondary:
    'border border-[var(--border-strong)] text-[var(--text-main)] bg-transparent hover:bg-[var(--bg-sunken)]',
  ghost:
    'text-[var(--text-main)] bg-transparent hover:bg-[var(--bg-sunken)]',
  destructive:
    'text-[var(--danger)] bg-transparent border border-transparent hover:bg-[var(--danger)]/8 hover:border-[var(--danger)]/20',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  as: Component = 'button',
  ...props
}) {
  return (
    <Component
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-md)]',
        'transition-colors duration-150 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/30',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-90" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </Component>
  );
}
