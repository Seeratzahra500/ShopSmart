// Each preset is a complete design language: `vars` paints every surface/text/
// radius/shadow/font token the storefront actually reads (see globals.css —
// --bg-page, --bg-card, --bg-sunken, --text-main/secondary/muted, --border(-strong),
// plus legacy aliases), and `structure` picks the default hero/card/button/density/
// background treatment. Store-level `design.*` overrides win over `structure`
// (see resolveDesign), and store primaryColor/accentColor/fontFamily win over
// `vars` (see buildStoreVars) — so an owner can nudge a theme without forking it.

export const themes = {
  minimal: {
    label: 'Minimal',
    description: 'Warm ink-on-paper — airy, editorial, quietly confident.',
    swatch: { bg: '#FAF9F7', card: '#FFFFFF', brand: '#5C4E4E', accent: '#988686' },
    fonts: { display: 'Fraunces', body: 'Inter' },
    vars: {
      '--color-brand':  '#5C4E4E',
      '--color-accent': '#988686',
      '--bg-page':      '#FAF9F7',
      '--bg-card':      '#FFFFFF',
      '--bg-sunken':    '#F3F1EE',
      '--text-main':      '#1C1917',
      '--text-secondary': '#57534E',
      '--text-muted':     '#A8A29E',
      '--border':        '#E7E5E4',
      '--border-strong': '#D6D3D1',
      '--radius-card':  'var(--radius-lg)',
      '--shadow-card':  'var(--shadow-lift)',
      '--card-border':  '1px solid var(--border)',
      '--font-display': "'Fraunces', serif",
      '--font-body':    "'Inter', sans-serif",
    },
    dark: {
      '--bg-page':      '#131110',
      '--bg-card':      '#1C1917',
      '--bg-sunken':    '#201C1A',
      '--text-main':      '#F5F2F0',
      '--text-secondary': '#C7C0BB',
      '--text-muted':     '#8A8480',
      '--border':        '#2E2A28',
      '--border-strong': '#3D3835',
    },
    structure: { heroLayout: 'editorial', cardStyle: 'gallery', buttonShape: 'pill', density: 'airy', background: 'clean' },
  },

  bold: {
    label: 'Bold',
    description: 'Near-black canvas, electric yellow, hard graphic shadows.',
    swatch: { bg: '#0A0A0A', card: '#161616', brand: '#FACC15', accent: '#FBBF24' },
    fonts: { display: 'Space Grotesk', body: 'Space Grotesk' },
    vars: {
      '--color-brand':  '#FACC15',
      '--color-accent': '#FBBF24',
      '--bg-page':      '#0A0A0A',
      '--bg-card':      '#161616',
      '--bg-sunken':    '#1F1F1F',
      '--text-main':      '#FFFFFF',
      '--text-secondary': '#D4D4D4',
      '--text-muted':     '#8A8A8A',
      '--border':        '#2B2B2B',
      '--border-strong': '#3D3D3D',
      '--radius-card':  'var(--radius-sm)',
      '--shadow-card':  '4px 4px 0px var(--color-brand)',
      '--card-border':  '2px solid var(--border-strong)',
      '--font-display': "'Space Grotesk', sans-serif",
      '--font-body':    "'Space Grotesk', sans-serif",
    },
    forceScheme: 'dark', // intrinsically dark — ignore light/dark toggle
    structure: { heroLayout: 'banner', cardStyle: 'framed', buttonShape: 'sharp', density: 'compact', background: 'clean' },
  },

  elegant: {
    label: 'Elegant',
    description: 'Cream and gold, serif headlines, soft wide shadows.',
    swatch: { bg: '#FDF8F0', card: '#FFFFFF', brand: '#B8860B', accent: '#D4A843' },
    fonts: { display: 'Playfair Display', body: 'Inter' },
    vars: {
      '--color-brand':  '#B8860B',
      '--color-accent': '#D4A843',
      '--bg-page':      '#FDF8F0',
      '--bg-card':      '#FFFFFF',
      '--bg-sunken':    '#F6EEDD',
      '--text-main':      '#1C1917',
      '--text-secondary': '#5C5344',
      '--text-muted':     '#A69A82',
      '--border':        '#EADFC7',
      '--border-strong': '#DDCDA4',
      '--radius-card':  'var(--radius-md)',
      '--shadow-card':  '0 4px 24px rgba(0,0,0,0.08)',
      '--card-border':  '1px solid var(--border)',
      '--font-display': "'Playfair Display', serif",
      '--font-body':    "'Inter', sans-serif",
    },
    dark: {
      '--bg-page':      '#171310',
      '--bg-card':      '#211B15',
      '--bg-sunken':    '#28211A',
      '--text-main':      '#F5EEDF',
      '--text-secondary': '#C9BC9F',
      '--text-muted':     '#8F836A',
      '--border':        '#332A20',
      '--border-strong': '#443725',
    },
    structure: { heroLayout: 'split', cardStyle: 'gallery', buttonShape: 'rounded', density: 'airy', background: 'clean' },
  },

  playful: {
    label: 'Playful',
    description: 'Pink and purple pop, chunky radii, tilted product cards.',
    swatch: { bg: '#FAFAF9', card: '#FFFFFF', brand: '#EC4899', accent: '#A855F7' },
    fonts: { display: 'DM Sans', body: 'DM Sans' },
    vars: {
      '--color-brand':  '#EC4899',
      '--color-accent': '#A855F7',
      '--bg-page':      '#FAFAF9',
      '--bg-card':      '#FFFFFF',
      '--bg-sunken':    '#F4F0FA',
      '--text-main':      '#1F2937',
      '--text-secondary': '#54525B',
      '--text-muted':     '#9A96A3',
      '--border':        '#ECE7F3',
      '--border-strong': '#DCD3EB',
      '--radius-card':  'var(--radius-xl)',
      '--shadow-card':  '0 6px 20px rgba(168,85,247,0.14)',
      '--card-border':  '1px solid var(--border)',
      '--font-display': "'DM Sans', sans-serif",
      '--font-body':    "'DM Sans', sans-serif",
    },
    dark: {
      '--bg-page':      '#18141C',
      '--bg-card':      '#221C2B',
      '--bg-sunken':    '#2A2233',
      '--text-main':      '#F5F1F9',
      '--text-secondary': '#C9C0D4',
      '--text-muted':     '#8D8496',
      '--border':        '#332B3E',
      '--border-strong': '#463A54',
    },
    structure: { heroLayout: 'fullbleed', cardStyle: 'tilted', buttonShape: 'pill', density: 'regular', background: 'clean' },
  },

  brutalist: {
    label: 'Brutalist',
    description: 'Paper white, pure black, one loud red — zero radius, hard borders.',
    swatch: { bg: '#FFFFFF', card: '#FFFFFF', brand: '#EF4444', accent: '#111111' },
    fonts: { display: 'Space Grotesk', body: 'IBM Plex Mono' },
    vars: {
      '--color-brand':  '#EF4444',
      '--color-accent': '#111111',
      '--bg-page':      '#FFFFFF',
      '--bg-card':      '#FFFFFF',
      '--bg-sunken':    '#F0F0F0',
      '--text-main':      '#0A0A0A',
      '--text-secondary': '#3A3A3A',
      '--text-muted':     '#6B6B6B',
      '--border':        '#0A0A0A',
      '--border-strong': '#0A0A0A',
      '--radius-card':  '0px',
      '--shadow-card':  'none',
      '--card-border':  '2px solid #0A0A0A',
      '--font-display': "'Space Grotesk', sans-serif",
      '--font-body':    "'IBM Plex Mono', monospace",
    },
    dark: {
      '--bg-page':      '#0A0A0A',
      '--bg-card':      '#0A0A0A',
      '--bg-sunken':    '#171717',
      '--text-main':      '#FFFFFF',
      '--text-secondary': '#D4D4D4',
      '--text-muted':     '#8A8A8A',
      '--border':        '#FFFFFF',
      '--border-strong': '#FFFFFF',
      '--card-border':  '2px solid #FFFFFF',
    },
    structure: { heroLayout: 'editorial', cardStyle: 'framed', buttonShape: 'sharp', density: 'compact', background: 'clean' },
  },

  midnight: {
    label: 'Midnight',
    description: 'Deep navy-charcoal with luminous cyan and glassy cards.',
    swatch: { bg: '#0F1420', card: '#171D2C', brand: '#22D3EE', accent: '#2DD4BF' },
    fonts: { display: 'Manrope', body: 'Inter' },
    vars: {
      '--color-brand':  '#22D3EE',
      '--color-accent': '#2DD4BF',
      '--bg-page':      '#0F1420',
      '--bg-card':      'color-mix(in oklch, #171D2C 88%, transparent)',
      '--bg-sunken':    '#161B28',
      '--text-main':      '#F1F5F9',
      '--text-secondary': '#AEB9CC',
      '--text-muted':     '#707B90',
      '--border':        '#242C3D',
      '--border-strong': '#333D53',
      '--radius-card':  'var(--radius-lg)',
      '--shadow-card':  '0 8px 32px rgba(34,211,238,0.10)',
      '--card-border':  '1px solid var(--border-strong)',
      '--font-display': "'Manrope', sans-serif",
      '--font-body':    "'Inter', sans-serif",
    },
    forceScheme: 'dark', // intrinsically dark — ignore light/dark toggle
    structure: { heroLayout: 'fullbleed', cardStyle: 'gallery', buttonShape: 'rounded', density: 'regular', background: 'clean' },
  },
};

const BUTTON_RADIUS = { pill: '9999px', rounded: '10px', sharp: '2px' };

// Fonts already loaded via next/font in app/layout.js — never fetch these from Google.
const BUILTIN_FONTS = new Set(['Fraunces', 'Inter', 'JetBrains Mono']);

function pickTheme(store) {
  return themes[store?.theme] || themes.minimal;
}

// Merge store.design.* (non-empty values only) over the preset's structure defaults.
export const resolveDesign = (store) => {
  const preset = pickTheme(store);
  const overrides = store?.design || {};
  const pick = (key) => (overrides[key] ? overrides[key] : preset.structure[key]);
  return {
    heroLayout:  pick('heroLayout'),
    cardStyle:   pick('cardStyle'),
    buttonShape: pick('buttonShape'),
    density:     pick('density'),
    background:  pick('background'),
    showTrustStrip: overrides.showTrustStrip !== false,
  };
};

export const buildStoreVars = (store) => {
  const preset = pickTheme(store);
  const design = resolveDesign(store);

  // Effective color scheme: intrinsically-dark presets ignore the toggle;
  // otherwise fall back to system preference when unset.
  let scheme = store?.colorScheme || 'system';
  if (preset.forceScheme) scheme = preset.forceScheme;
  else if (scheme === 'system') {
    scheme = (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
      ? 'dark' : 'light';
  }

  const vars = {
    ...preset.vars,
    ...(scheme === 'dark' && preset.dark ? preset.dark : {}),
  };

  const brand  = store?.primaryColor || vars['--color-brand'];
  const accent = store?.accentColor  || vars['--color-accent'];

  const fontValue = store?.fontFamily
    ? `'${store.fontFamily}', sans-serif`
    : vars['--font-display'];

  const btnRadius = BUTTON_RADIUS[design.buttonShape] || BUTTON_RADIUS.rounded;

  return {
    ...vars,
    '--color-brand':  brand,
    '--color-accent': accent,
    '--brand-soft': `color-mix(in oklch, ${brand} 8%, ${scheme === 'dark' ? 'black' : 'white'})`,
    '--brand-ink':  `color-mix(in oklch, ${brand} ${scheme === 'dark' ? '70%' : '85%'}, ${scheme === 'dark' ? 'white' : 'black'})`,
    '--font-display': fontValue,
    '--font-heading': fontValue,
    '--font-body':    vars['--font-body'],
    // Legacy aliases some components still read directly
    '--border-radius-card': vars['--radius-card'],
    '--border-radius-btn':  btnRadius,
    '--radius-card':  vars['--radius-card'],
    '--shadow-card':  vars['--shadow-card'],
    '--card-shadow':  vars['--shadow-card'],
    '--card-border':  vars['--card-border'],
  };
};

// Collects every non-builtin Google Font family this store's resolved vars use,
// so StoreContext can inject <link> tags for them (display + body may differ,
// and store.fontFamily can override display independently).
export const collectFontFamilies = (store) => {
  const preset = pickTheme(store);
  const names = new Set();
  const displayFont = store?.fontFamily || preset.fonts.display;
  names.add(displayFont);
  names.add(preset.fonts.body);
  return [...names].filter((f) => f && !BUILTIN_FONTS.has(f));
};
