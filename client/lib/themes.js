// Each preset maps onto the shared radius/shadow language (--radius-sm/md/lg/xl,
// --shadow-lift/overlay from globals.css) via a per-tenant --radius-card /
// --shadow-card pair, so presets still visually differentiate (bold stays sharp
// and graphic, playful stays soft) without inventing a second token system.
export const themes = {
  minimal: {
    '--color-brand':  '#5C4E4E',
    '--color-accent': '#988686',
    '--color-bg':     '#ffffff',
    '--color-text':   '#111827',
    '--radius-card':  'var(--radius-lg)',
    '--shadow-card':  'var(--shadow-lift)',
    '--font-display': "'Fraunces', serif",
    '--font-body':    "'Inter', sans-serif",
  },
  bold: {
    '--color-brand':  '#facc15',
    '--color-accent': '#fbbf24',
    '--color-bg':     '#0a0a0a',
    '--color-text':   '#ffffff',
    '--radius-card':  'var(--radius-sm)',
    '--shadow-card':  '4px 4px 0px #facc15',
    '--font-display': "'Space Grotesk', sans-serif",
    '--font-body':    "'Space Grotesk', sans-serif",
  },
  elegant: {
    '--color-brand':  '#b8860b',
    '--color-accent': '#d4a843',
    '--color-bg':     '#fdf8f0',
    '--color-text':   '#1c1917',
    '--radius-card':  'var(--radius-md)',
    '--shadow-card':  '0 4px 24px rgba(0,0,0,0.08)',
    '--font-display': "'Playfair Display', serif",
    '--font-body':    "'Inter', sans-serif",
  },
  playful: {
    '--color-brand':  '#ec4899',
    '--color-accent': '#a855f7',
    '--color-bg':     '#fafafa',
    '--color-text':   '#1f2937',
    '--radius-card':  'var(--radius-xl)',
    '--shadow-card':  '0 6px 20px rgba(0,0,0,0.10)',
    '--font-display': "'DM Sans', sans-serif",
    '--font-body':    "'DM Sans', sans-serif",
  },
};

export const buildStoreVars = (store) => {
  const base = themes[store?.theme] || themes.minimal;
  const fontValue = store?.fontFamily
    ? `'${store.fontFamily}', sans-serif`
    : base['--font-display'];
  return {
    ...base,
    '--color-brand':  store?.primaryColor  || base['--color-brand'],
    '--color-accent': store?.accentColor   || base['--color-accent'],
    '--font-display': fontValue,
    '--font-heading': fontValue,
    '--font-body':    base['--font-body'],
  };
};
