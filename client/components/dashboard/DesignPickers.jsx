'use client';
import { motion } from 'framer-motion';
import { themes } from '@/lib/themes';

// Small CSS-drawn wireframe thumbnails for hero layouts and card styles —
// no images, just divs sketching the structure so owners recognize the shape
// before committing.
const HERO_WIREFRAMES = {
  fullbleed: (
    <div className="w-full h-full bg-[var(--bg-sunken)] rounded-[3px] flex items-center justify-center">
      <div className="w-8 h-2 rounded-full bg-[var(--text-muted)]/50" />
    </div>
  ),
  split: (
    <div className="w-full h-full grid grid-cols-2 gap-0.5">
      <div className="bg-[var(--bg-sunken)] rounded-[3px] flex flex-col justify-center gap-1 p-1.5">
        <div className="w-6 h-1 rounded-full bg-[var(--text-muted)]/50" />
        <div className="w-8 h-1 rounded-full bg-[var(--text-muted)]/50" />
      </div>
      <div className="bg-[var(--border-strong)] rounded-[3px]" />
    </div>
  ),
  banner: (
    <div className="w-full h-full flex flex-col gap-0.5">
      <div className="h-1/2 bg-[var(--bg-sunken)] rounded-[3px] flex items-center px-1.5">
        <div className="w-6 h-1 rounded-full bg-[var(--text-muted)]/50" />
      </div>
      <div className="h-1/2 grid grid-cols-3 gap-0.5">
        <div className="bg-[var(--border)] rounded-[2px]" />
        <div className="bg-[var(--border)] rounded-[2px]" />
        <div className="bg-[var(--border)] rounded-[2px]" />
      </div>
    </div>
  ),
  editorial: (
    <div className="w-full h-full grid grid-cols-4 gap-0.5 items-center px-1">
      <div className="col-span-1 flex flex-col gap-1">
        <div className="w-full h-1 rounded-full bg-[var(--text-muted)]/50" />
      </div>
      <div className="col-span-3 h-3 rounded-full bg-[var(--text-muted)]/70" />
    </div>
  ),
};

const CARD_WIREFRAMES = {
  gallery: (
    <div className="w-full h-full flex flex-col gap-1">
      <div className="flex-1 bg-[var(--bg-sunken)] rounded-[3px]" />
      <div className="w-2/3 h-1 rounded-full bg-[var(--text-muted)]/50" />
    </div>
  ),
  framed: (
    <div className="w-full h-full border border-[var(--border-strong)] rounded-[3px] p-1 flex flex-col gap-1">
      <div className="flex-1 bg-[var(--bg-sunken)] rounded-[2px]" />
      <div className="w-2/3 h-1 rounded-full bg-[var(--text-muted)]/50" />
    </div>
  ),
  tilted: (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-4/5 h-4/5 bg-[var(--bg-sunken)] rounded-[4px] rotate-[-6deg]" />
    </div>
  ),
  compact: (
    <div className="w-full h-full flex items-center gap-1">
      <div className="w-1/3 h-4/5 bg-[var(--bg-sunken)] rounded-[2px]" />
      <div className="flex-1 flex flex-col gap-1">
        <div className="w-full h-1 rounded-full bg-[var(--text-muted)]/50" />
        <div className="w-1/2 h-1 rounded-full bg-[var(--text-muted)]/50" />
      </div>
    </div>
  ),
};

function WireframeOption({ active, onClick, wireframe, label }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex flex-col gap-2 p-2.5 rounded-[var(--radius-md)] border transition-all ${
        active ? 'border-transparent ring-2 ring-[var(--color-brand)]' : 'border-[var(--border-strong)] hover:bg-[var(--bg-sunken)]'
      }`}
    >
      <div className="w-full h-12 rounded-[var(--radius-sm)] bg-[var(--bg-card)] border border-[var(--border)] p-1.5">
        {wireframe}
      </div>
      <span className="text-xs font-medium text-[var(--text-secondary)] capitalize">{label}</span>
    </motion.button>
  );
}

export function HeroLayoutPicker({ value, onChange }) {
  const options = [
    { key: '', label: 'Theme default', wireframe: <div className="w-full h-full flex items-center justify-center text-[9px] text-[var(--text-muted)]">Auto</div> },
    { key: 'fullbleed', label: 'Full bleed', wireframe: HERO_WIREFRAMES.fullbleed },
    { key: 'split', label: 'Split', wireframe: HERO_WIREFRAMES.split },
    { key: 'banner', label: 'Banner', wireframe: HERO_WIREFRAMES.banner },
    { key: 'editorial', label: 'Editorial', wireframe: HERO_WIREFRAMES.editorial },
  ];
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {options.map((opt) => (
        <WireframeOption key={opt.key || 'default'} active={value === opt.key} onClick={() => onChange(opt.key)} wireframe={opt.wireframe} label={opt.label} />
      ))}
    </div>
  );
}

export function CardStylePicker({ value, onChange }) {
  const options = [
    { key: '', label: 'Theme default', wireframe: <div className="w-full h-full flex items-center justify-center text-[9px] text-[var(--text-muted)]">Auto</div> },
    { key: 'gallery', label: 'Gallery', wireframe: CARD_WIREFRAMES.gallery },
    { key: 'framed', label: 'Framed', wireframe: CARD_WIREFRAMES.framed },
    { key: 'tilted', label: 'Tilted', wireframe: CARD_WIREFRAMES.tilted },
    { key: 'compact', label: 'Compact', wireframe: CARD_WIREFRAMES.compact },
  ];
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {options.map((opt) => (
        <WireframeOption key={opt.key || 'default'} active={value === opt.key} onClick={() => onChange(opt.key)} wireframe={opt.wireframe} label={opt.label} />
      ))}
    </div>
  );
}

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <motion.button
          key={opt.key || 'default'}
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => onChange(opt.key)}
          className={`px-4 py-2 rounded-[var(--radius-md)] border text-xs font-semibold capitalize transition-all ${
            value === opt.key
              ? 'text-white border-transparent'
              : 'border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)]'
          }`}
          style={value === opt.key ? { backgroundColor: 'var(--color-brand)' } : {}}
        >
          {opt.label}
        </motion.button>
      ))}
    </div>
  );
}

export function ThemePresetPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.entries(themes).map(([key, preset]) => (
        <motion.button
          key={key}
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(key)}
          className={`text-left p-4 rounded-[var(--radius-lg)] border transition-all overflow-hidden ${
            value === key ? 'border-transparent ring-2 ring-[var(--color-brand)]' : 'border-[var(--border-strong)] hover:border-[var(--text-muted)]'
          }`}
          style={{ backgroundColor: preset.swatch.bg }}
        >
          <p style={{ fontFamily: `'${preset.fonts.display}', serif`, color: preset.swatch.brand }} className="text-lg font-semibold mb-1">
            {preset.label}
          </p>
          <p style={{ color: preset.swatch.brand, opacity: 0.75 }} className="text-xs leading-relaxed mb-3">
            {preset.description}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.swatch.brand }} />
            <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.swatch.accent }} />
            <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.swatch.card }} />
          </div>
        </motion.button>
      ))}
    </div>
  );
}
