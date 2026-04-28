export const themes = {
  minimal: {
    '--border-radius-card': '4px',
    '--border-radius-btn':  '4px',
    '--font-size-heading':  '1.5rem',
    '--card-shadow':        'none',
    '--card-border':        '1px solid #e5e7eb',
  },
  bold: {
    '--border-radius-card': '0px',
    '--border-radius-btn':  '0px',
    '--font-size-heading':  '2rem',
    '--card-shadow':        '4px 4px 0px #000',
    '--card-border':        '2px solid #000',
  },
  elegant: {
    '--border-radius-card': '12px',
    '--border-radius-btn':  '999px',
    '--font-size-heading':  '1.75rem',
    '--card-shadow':        '0 4px 24px rgba(0,0,0,0.08)',
    '--card-border':        'none',
  },
  playful: {
    '--border-radius-card': '20px',
    '--border-radius-btn':  '999px',
    '--font-size-heading':  '1.6rem',
    '--card-shadow':        '0 6px 20px rgba(0,0,0,0.12)',
    '--card-border':        'none',
  },
};

export const buildStoreVars = (store) => ({
  '--color-brand':  store?.primaryColor  || '#4f46e5',
  '--color-accent': store?.accentColor   || '#818cf8',
  '--font-heading': `'${store?.fontFamily || 'Inter'}', sans-serif`,
  ...(themes[store?.theme] || themes.minimal),
});
