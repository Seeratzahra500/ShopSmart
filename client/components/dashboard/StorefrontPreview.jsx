'use client';
import { buildStoreVars, resolveDesign } from '@/lib/themes';

// Miniature fake storefront rendered with the CURRENT unsaved form state —
// self-contained via inline style vars, so every picker click updates it
// instantly without touching the real documentElement theme vars.
export default function StorefrontPreview({ formState }) {
  const vars   = buildStoreVars(formState);
  const design = resolveDesign(formState);

  const products = [
    { title: 'Sample Product One', price: 4200 },
    { title: 'Sample Product Two', price: 2800 },
  ];

  return (
    <div
      className="sticky top-6 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]"
      style={{ ...vars, backgroundColor: 'var(--bg-page)', fontFamily: 'var(--font-body)' }}
    >
      {/* Mini hero */}
      <div
        className="px-6 py-8 relative overflow-hidden"
        style={{
          backgroundColor: formState.heroImage ? undefined : 'var(--color-brand)',
          backgroundImage: formState.heroImage ? `url(${formState.heroImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70 mb-2">
            {formState.tagline || 'Welcome'}
          </p>
          <p style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-white leading-tight">
            {formState.heroHeadline || formState.name || 'Your Store'}
          </p>
          <span
            className="inline-block mt-4 px-4 py-1.5 text-xs font-semibold bg-white"
            style={{ color: 'var(--color-brand)', borderRadius: 'var(--border-radius-btn)' }}
          >
            {formState.heroCta || 'Shop Now'}
          </span>
        </div>
      </div>

      {/* Mini product grid */}
      <div className="p-5" style={{ backgroundColor: 'var(--bg-page)' }}>
        <p className="eyebrow text-[9px] mb-3" style={{ color: 'var(--color-accent)' }}>Catalogue</p>
        <div className="grid grid-cols-2 gap-3">
          {products.map((p, i) => (
            <div key={p.title}>
              <div
                className="relative aspect-[4/5] mb-2"
                style={{
                  backgroundColor: 'var(--bg-sunken)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: design.cardStyle === 'framed' || design.cardStyle === 'gallery' ? 'var(--shadow-card)' : undefined,
                  border: design.cardStyle === 'framed' ? 'var(--card-border)' : undefined,
                }}
              >
                {i === 0 && (
                  <span
                    className="absolute top-1.5 left-1.5 text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-[3px]"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  >
                    New
                  </span>
                )}
              </div>
              <p className="text-xs font-medium leading-snug" style={{ color: 'var(--text-main)' }}>{p.title}</p>
              <p className="font-tabular text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
                {formState.currency || 'PKR'} {p.price.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
