export const themes = {
  minimal: {
    '--color-brand':  '#4f46e5',
    '--color-accent': '#818cf8',
    '--color-bg':     '#ffffff',
    '--color-text':   '#111827',
    '--radius-card':  '1rem',
    '--shadow-card':  '0 1px 3px rgba(0,0,0,0.06)',
    '--font-display': "'Inter', sans-serif",
    '--font-body':    "'Inter', sans-serif",
  },
  bold: {
    '--color-brand':  '#facc15',
    '--color-accent': '#fbbf24',
    '--color-bg':     '#0a0a0a',
    '--color-text':   '#ffffff',
    '--radius-card':  '0.25rem',
    '--shadow-card':  '4px 4px 0px #facc15',
    '--font-display': "'Space Grotesk', sans-serif",
    '--font-body':    "'Space Grotesk', sans-serif",
  },
  elegant: {
    '--color-brand':  '#b8860b',
    '--color-accent': '#d4a843',
    '--color-bg':     '#fdf8f0',
    '--color-text':   '#1c1917',
    '--radius-card':  '0.75rem',
    '--shadow-card':  '0 4px 24px rgba(0,0,0,0.08)',
    '--font-display': "'Playfair Display', serif",
    '--font-body':    "'Inter', sans-serif",
  },
  playful: {
    '--color-brand':  '#ec4899',
    '--color-accent': '#a855f7',
    '--color-bg':     '#fafafa',
    '--color-text':   '#1f2937',
    '--radius-card':  '1.5rem',
    '--shadow-card':  '0 6px 20px rgba(0,0,0,0.10)',
    '--font-display': "'DM Sans', sans-serif",
    '--font-body':    "'DM Sans', sans-serif",
  },
};

export const buildStoreVars = (store) => {
  const base = themes[store?.theme] || themes.minimal;
  return {
    ...base,
    '--color-brand':  store?.primaryColor  || base['--color-brand'],
    '--color-accent': store?.accentColor   || base['--color-accent'],
    '--font-display': store?.fontFamily
      ? `'${store.fontFamily}', sans-serif`
      : base['--font-display'],
    '--font-body': base['--font-body'],
  };
};
