'use client';

const ITEMS = [
  {
    label: 'Free Delivery on orders over PKR 1,000', short: 'Free Delivery',
    path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    label: 'Secure Checkout', short: 'Secure',
    path: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    label: 'Easy Returns', short: 'Easy Returns',
    path: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
  {
    label: '24/7 Support', short: '24/7 Support',
    path: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
  },
];

// Extracted from the storefront page so its visibility can be toggled
// per-store via design.showTrustStrip.
export default function TrustStrip() {
  return (
    <div className="bg-[var(--bg-card)] border-b border-[var(--border)] py-4">
      <div className="hidden sm:flex items-center justify-center gap-10 flex-wrap px-6">
        {ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.path} />
            </svg>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="flex sm:hidden items-center justify-center gap-6 flex-wrap px-6">
        {ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.path} />
            </svg>
            <span>{item.short}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
