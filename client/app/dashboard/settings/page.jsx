'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageField from '@/components/ui/ImageField';
import { fadeUp } from '@/lib/motion';
import StorefrontPreview from '@/components/dashboard/StorefrontPreview';
import { ThemePresetPicker, HeroLayoutPicker, CardStylePicker, SegmentedControl } from '@/components/dashboard/DesignPickers';
import { validateImageUrl } from '@/lib/validateImage';

const TABS   = ['Branding', 'Design', 'Home Page', 'Store Info'];
const FONTS  = ['Inter', 'Playfair Display', 'Poppins', 'Lato', 'Merriweather', 'Nunito', 'Raleway', 'Oswald'];
const SCHEMES = ['light', 'dark', 'system'];
const GRIDS  = [2, 3];

const BUTTON_SHAPES = [{ key: '', label: 'Theme default' }, { key: 'pill', label: 'Pill' }, { key: 'rounded', label: 'Rounded' }, { key: 'sharp', label: 'Sharp' }];
const DENSITIES      = [{ key: '', label: 'Theme default' }, { key: 'airy', label: 'Airy' }, { key: 'regular', label: 'Regular' }, { key: 'compact', label: 'Compact' }];
const BACKGROUNDS    = [{ key: '', label: 'Theme default' }, { key: 'clean', label: 'Clean' }, { key: 'tinted', label: 'Tinted' }, { key: 'texture', label: 'Texture' }];

const tabFade = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } }, exit: { opacity: 0, y: -8, transition: { duration: 0.15 } } };

const fieldStyle = 'w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-sm)] bg-[var(--bg-card)] border border-[var(--border-strong)] transition-colors outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15';

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

function ColorSwatch({ value, onChange }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-sunken)]">
      <div className="relative w-10 h-10 flex-shrink-0 rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border)] shadow-[var(--shadow-lift)]">
        <div className="absolute inset-0" style={{ backgroundColor: value }} />
        <input
          type="color"
          value={value}
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Pick color"
        />
      </div>
      <span className="font-tabular text-sm text-[var(--text-secondary)] uppercase">{value}</span>
    </div>
  );
}

export default function DashboardSettingsPage() {
  const [tab, setTab]         = useState(0);
  const [storeId, setStoreId] = useState(null);
  const [slug, setSlug]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({
    name: '', tagline: '', slug: '', logoUrl: '',
    primaryColor: '#5C4E4E', accentColor: '#988686',
    fontFamily: 'Inter', theme: 'minimal', colorScheme: 'light', gridColumns: 3,
    heroImage: '', heroHeadline: '', heroCta: '',
    announcementText: '', announcementColor: '#5C4E4E', announcementActive: false,
    contactEmail: '', contactPhone: '', contactAddress: '',
    contactInstagram: '', contactFacebook: '', contactTwitter: '',
    currency: 'PKR', locale: 'en-PK',
    heroLayout: '', cardStyle: '', buttonShape: '', density: '', background: '', showTrustStrip: true,
  });

  useEffect(() => {
    api.get('/store/mine/data').then(({ data }) => {
      setStoreId(data._id);
      setSlug(data.slug);
      setForm({
        name:               data.name            || '',
        tagline:            data.tagline          || '',
        slug:               data.slug             || '',
        logoUrl:            data.logoUrl          || '',
        primaryColor:       data.primaryColor     || '#5C4E4E',
        accentColor:        data.accentColor      || '#988686',
        fontFamily:         data.fontFamily       || 'Inter',
        theme:              data.theme            || 'minimal',
        colorScheme:        data.colorScheme      || 'light',
        gridColumns:        data.gridColumns      || 3,
        heroImage:          data.heroImage        || '',
        heroHeadline:       data.heroHeadline     || '',
        heroCta:            data.heroCta          || '',
        announcementText:   data.announcement?.text    || '',
        announcementColor:  data.announcement?.color   || '#5C4E4E',
        announcementActive: data.announcement?.isActive || false,
        contactEmail:       data.contact?.email        || '',
        contactPhone:       data.contact?.phone        || '',
        contactAddress:     data.contact?.address      || '',
        contactInstagram:   data.contact?.instagram    || '',
        contactFacebook:    data.contact?.facebook     || '',
        contactTwitter:     data.contact?.twitter      || '',
        currency:           data.currency || 'PKR',
        locale:             data.locale   || 'en-PK',
        heroLayout:         data.design?.heroLayout      || '',
        cardStyle:          data.design?.cardStyle       || '',
        buttonShape:        data.design?.buttonShape     || '',
        density:            data.design?.density         || '',
        background:         data.design?.background      || '',
        showTrustStrip:     data.design?.showTrustStrip !== false,
      });
    }).catch(() => toast.error('Could not load store settings.'));
  }, []);

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [key]: val }));
  };

  const save = async () => {
    if (!storeId) return;

    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error('Store name must be at least 2 characters.'); return;
    }
    if (form.slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
      toast.error('Slug must be lowercase letters, numbers, and hyphens only (e.g. my-store).'); return;
    }
    if (form.logoUrl.trim() && !/^https?:\/\/.+/.test(form.logoUrl.trim())) {
      toast.error('Logo URL must start with https://'); return;
    }
    if (form.heroImage.trim() && !/^https?:\/\/.+/.test(form.heroImage.trim())) {
      toast.error('Hero Image URL must start with https://'); return;
    }
    if (form.contactEmail.trim() && !/\S+@\S+\.\S+/.test(form.contactEmail.trim())) {
      toast.error('Contact email is not a valid email address.'); return;
    }
    if (form.contactPhone.trim() && !/^[+\d][\d\s\-().]{4,19}$/.test(form.contactPhone.trim())) {
      toast.error('Phone number must contain digits only (e.g. +92 300 1234567).'); return;
    }
    for (const [label, key] of [['Instagram', 'contactInstagram'], ['Facebook', 'contactFacebook'], ['Twitter', 'contactTwitter']]) {
      if (form[key].trim() && !/^https?:\/\/.+/.test(form[key].trim())) {
        toast.error(`${label} URL must start with https://`); return;
      }
    }
    if (!/^[a-zA-Z]{2,5}$/.test(form.currency.trim())) {
      toast.error('Currency must be 2–5 letters only (e.g. PKR, USD).');
      return;
    }
    if (!/^[a-zA-Z]{2,3}(-[a-zA-Z]{2,4})?$/.test(form.locale.trim())) {
      toast.error('Locale must be letters only (e.g. en-PK, en-US).');
      return;
    }

    setSaving(true);

    // Validate that logo/hero URLs actually load as images before saving —
    // run both checks in parallel to avoid doubling the wait.
    const [logoOk, heroOk] = await Promise.all([
      form.logoUrl.trim() ? validateImageUrl(form.logoUrl.trim()) : Promise.resolve(true),
      form.heroImage.trim() ? validateImageUrl(form.heroImage.trim()) : Promise.resolve(true),
    ]);
    if (!logoOk) {
      toast.error('Logo URL did not load as an image — check the link.');
      setSaving(false);
      return;
    }
    if (!heroOk) {
      toast.error('Hero Image URL did not load as an image — check the link.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: form.name, tagline: form.tagline, slug: form.slug, logoUrl: form.logoUrl,
        primaryColor: form.primaryColor, accentColor: form.accentColor,
        fontFamily: form.fontFamily, theme: form.theme, colorScheme: form.colorScheme,
        gridColumns: Number(form.gridColumns),
        heroImage: form.heroImage, heroHeadline: form.heroHeadline, heroCta: form.heroCta,
        announcement: { text: form.announcementText, color: form.announcementColor, isActive: form.announcementActive },
        contact: {
          email: form.contactEmail, phone: form.contactPhone, address: form.contactAddress,
          instagram: form.contactInstagram, facebook: form.contactFacebook, twitter: form.contactTwitter,
        },
        currency: form.currency, locale: form.locale,
        design: {
          heroLayout: form.heroLayout, cardStyle: form.cardStyle, buttonShape: form.buttonShape,
          density: form.density, background: form.background, showTrustStrip: form.showTrustStrip,
        },
      };
      await api.patch(`/store/${storeId}`, payload);
      setSlug(form.slug);
      toast.success('Store settings saved.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const tabPanels = [
    /* ── Branding ────────────────────────────────── */
    <motion.div key="branding" variants={tabFade} initial="hidden" animate="show" exit="exit" className="space-y-5">
      <Input label="Store Name" value={form.name} onChange={set('name')} placeholder="My Store" />
      <Input label="Tagline" value={form.tagline} onChange={set('tagline')} placeholder="Fresh products, fast delivery" />
      <p className="text-xs text-[var(--text-muted)] -mt-4 leading-relaxed">Short phrase shown under your store name</p>
      <Input label="URL Slug" value={form.slug} onChange={set('slug')} placeholder="my-store" />
      <p className="text-xs text-[var(--text-muted)] -mt-4 leading-relaxed">{`Your store will be live at: /store/${form.slug || 'your-slug'}`}</p>
      <ImageField
        label="Logo URL"
        value={form.logoUrl}
        onChange={(url) => setForm((p) => ({ ...p, logoUrl: url }))}
        hint="Direct link to your logo image"
      />

      {/* Color pickers */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Brand Color">
          <ColorSwatch value={form.primaryColor} onChange={set('primaryColor')} />
        </Field>
        <Field label="Accent Color">
          <ColorSwatch value={form.accentColor} onChange={set('accentColor')} />
        </Field>
      </div>

      {slug && (
        <div className="pt-1">
          <Link
            href={`/store/${slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            style={{ color: 'var(--color-brand)' }}
          >
            View your live store →
          </Link>
        </div>
      )}
    </motion.div>,

    /* ── Design ──────────────────────────────────── */
    <motion.div key="design" variants={tabFade} initial="hidden" animate="show" exit="exit" className="space-y-7">
      <Field label="Font Family">
        <select
          value={form.fontFamily}
          onChange={set('fontFamily')}
          className={fieldStyle}
        >
          {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
        </select>
      </Field>

      <Field label="Theme Preset" hint="Each preset is a complete design language — page background, card design, typography, and layout defaults.">
        <ThemePresetPicker value={form.theme} onChange={(v) => setForm((p) => ({ ...p, theme: v }))} />
      </Field>

      <Field label="Color Scheme">
        <div className="flex gap-3">
          {SCHEMES.map((s) => (
            <motion.button
              key={s}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setForm((p) => ({ ...p, colorScheme: s }))}
              className={`flex-1 py-3 rounded-[var(--radius-md)] border text-sm font-semibold capitalize transition-all ${
                form.colorScheme === s
                  ? 'text-white border-transparent'
                  : 'border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)]'
              }`}
              style={form.colorScheme === s ? { backgroundColor: 'var(--color-brand)' } : {}}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </Field>

      <Field label="Hero Layout" hint="'Theme default' inherits the layout the selected preset ships with.">
        <HeroLayoutPicker value={form.heroLayout} onChange={(v) => setForm((p) => ({ ...p, heroLayout: v }))} />
      </Field>

      <Field label="Product Card Style" hint="'Theme default' inherits the card style the selected preset ships with.">
        <CardStylePicker value={form.cardStyle} onChange={(v) => setForm((p) => ({ ...p, cardStyle: v }))} />
      </Field>

      <Field label="Button Shape">
        <SegmentedControl options={BUTTON_SHAPES} value={form.buttonShape} onChange={(v) => setForm((p) => ({ ...p, buttonShape: v }))} />
      </Field>

      <Field label="Density">
        <SegmentedControl options={DENSITIES} value={form.density} onChange={(v) => setForm((p) => ({ ...p, density: v }))} />
      </Field>

      <Field label="Background Treatment">
        <SegmentedControl options={BACKGROUNDS} value={form.background} onChange={(v) => setForm((p) => ({ ...p, background: v }))} />
      </Field>

      <Field label="Product Grid Columns">
        <div className="flex gap-3">
          {GRIDS.map((g) => (
            <motion.button
              key={g}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setForm((p) => ({ ...p, gridColumns: g }))}
              className={`flex-1 py-3 rounded-[var(--radius-md)] border text-sm font-semibold transition-all ${
                form.gridColumns === g
                  ? 'text-white border-transparent'
                  : 'border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)]'
              }`}
              style={form.gridColumns === g ? { backgroundColor: 'var(--color-brand)' } : {}}
            >
              {g} columns
            </motion.button>
          ))}
        </div>
      </Field>

      <label className="flex items-center gap-3 cursor-pointer select-none group">
        <div className="relative">
          <input
            type="checkbox"
            checked={form.showTrustStrip}
            onChange={set('showTrustStrip')}
            className="sr-only"
          />
          <div
            className={`w-10 h-6 rounded-full transition-colors ${form.showTrustStrip ? '' : 'bg-[var(--bg-sunken)]'}`}
            style={form.showTrustStrip ? { backgroundColor: 'var(--color-brand)' } : {}}
          />
          <div
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-[var(--shadow-lift)] transition-transform ${form.showTrustStrip ? 'translate-x-4' : ''}`}
          />
        </div>
        <span className="text-sm text-[var(--text-secondary)] font-medium">Show trust strip (delivery, checkout, returns, support)</span>
      </label>
    </motion.div>,

    /* ── Home Page ───────────────────────────────── */
    <motion.div key="homepage" variants={tabFade} initial="hidden" animate="show" exit="exit" className="space-y-5">
      <ImageField
        label="Hero Image URL"
        value={form.heroImage}
        onChange={(url) => setForm((p) => ({ ...p, heroImage: url }))}
        hint="Full-width banner shown at the top of your store"
      />
      <Input label="Hero Headline" value={form.heroHeadline} onChange={set('heroHeadline')} placeholder="Discover amazing products" />
      <Input label="Hero Button Text" value={form.heroCta} onChange={set('heroCta')} placeholder="Shop Now" />

      <div className="border-t border-[var(--border)] pt-5">
        <p className="font-display text-sm font-semibold text-[var(--text-main)] mb-4 tracking-tight">Announcement Bar</p>
        <div className="space-y-4">
          <Input label="Message" value={form.announcementText} onChange={set('announcementText')} placeholder="Free shipping on orders over Rs. 2,000!" />
          <Field label="Background Color">
            <ColorSwatch value={form.announcementColor} onChange={set('announcementColor')} />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.announcementActive}
                onChange={set('announcementActive')}
                className="sr-only"
              />
              <div
                className={`w-10 h-6 rounded-full transition-colors ${form.announcementActive ? '' : 'bg-[var(--bg-sunken)]'}`}
                style={form.announcementActive ? { backgroundColor: 'var(--color-brand)' } : {}}
              />
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-[var(--shadow-lift)] transition-transform ${form.announcementActive ? 'translate-x-4' : ''}`}
              />
            </div>
            <span className="text-sm text-[var(--text-secondary)] font-medium">Show announcement bar</span>
          </label>
        </div>
      </div>
    </motion.div>,

    /* ── Store Info ──────────────────────────────── */
    <motion.div key="storeinfo" variants={tabFade} initial="hidden" animate="show" exit="exit" className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Currency" value={form.currency} onChange={set('currency')} placeholder="PKR" />
        <Input label="Locale" value={form.locale} onChange={set('locale')} placeholder="en-PK" />
      </div>
      <Input label="Contact Email" type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="store@example.com" />
      <Input label="Phone Number" value={form.contactPhone} onChange={set('contactPhone')} placeholder="+92 300 1234567" />
      <Input label="Address" value={form.contactAddress} onChange={set('contactAddress')} placeholder="Islamabad, Pakistan" />

      <div className="border-t border-[var(--border)] pt-5">
        <p className="font-display text-sm font-semibold text-[var(--text-main)] mb-4 tracking-tight">Social Links</p>
        <div className="space-y-4">
          {[
            ['Instagram', 'contactInstagram', 'https://instagram.com/yourstore'],
            ['Facebook',  'contactFacebook',  'https://facebook.com/yourstore'],
            ['Twitter/X', 'contactTwitter',   'https://twitter.com/yourstore'],
          ].map(([label, key, ph]) => (
            <Input key={key} label={label} value={form[key]} onChange={set(key)} placeholder={ph} />
          ))}
        </div>
      </div>
    </motion.div>,
  ];

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      {/* Page heading */}
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-main)]">Store Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5 leading-relaxed">Customize your storefront appearance and information</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Settings card */}
        <div className="p-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
          {/* Pill tabs */}
          <div className="flex gap-2 flex-wrap mb-6 pb-5 border-b border-[var(--border)]">
            {TABS.map((t, i) => (
              <motion.button
                key={t}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTab(i)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  tab === i
                    ? 'text-white border-transparent'
                    : 'border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)]'
                }`}
                style={tab === i ? { backgroundColor: 'var(--color-brand)' } : {}}
              >
                {t}
              </motion.button>
            ))}
          </div>

          {/* Tab content with AnimatePresence */}
          <AnimatePresence mode="wait">
            {tabPanels[tab]}
          </AnimatePresence>

          {/* Save button */}
          <div className="pt-6 mt-6 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-[var(--text-muted)]">Changes apply immediately after saving.</p>
            <Button variant="primary" className="rounded-full" onClick={save} loading={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Live preview panel */}
        <div className="hidden lg:block">
          <StorefrontPreview formState={form} />
        </div>
      </motion.div>
    </motion.div>
  );
}
