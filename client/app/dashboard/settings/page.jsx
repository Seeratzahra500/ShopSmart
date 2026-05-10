'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';

const TABS   = ['Branding', 'Appearance', 'Home Page', 'Store Info'];
const FONTS  = ['Inter', 'Playfair Display', 'Poppins', 'Lato', 'Merriweather', 'Nunito', 'Raleway', 'Oswald'];
const THEMES = ['minimal', 'bold', 'elegant', 'playful'];
const SCHEMES = ['light', 'dark', 'system'];
const GRIDS  = [2, 3];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const tabFade = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } }, exit: { opacity: 0, y: -8, transition: { duration: 0.15 } } };

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{hint}</p>}
    </div>
  );
}

function StyledInput(props) {
  return (
    <input
      className="rounded-xl border border-gray-200 w-full px-4 py-3 focus:ring-2 focus:ring-[var(--color-brand)] outline-none text-sm transition-colors"
      {...props}
    />
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
      });
    }).catch(() => toast.error('Could not load store settings.'));
  }, []);

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [key]: val }));
  };

  const save = async () => {
    if (!storeId) return;
    setSaving(true);
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
      <Field label="Store Name">
        <StyledInput value={form.name} onChange={set('name')} placeholder="My Store" />
      </Field>
      <Field label="Tagline" hint="Short phrase shown under your store name">
        <StyledInput value={form.tagline} onChange={set('tagline')} placeholder="Fresh products, fast delivery" />
      </Field>
      <Field label="URL Slug" hint={`Your store will be live at: /store/${form.slug || 'your-slug'}`}>
        <StyledInput value={form.slug} onChange={set('slug')} placeholder="my-store" />
      </Field>
      <Field label="Logo URL" hint="Direct link to your logo image">
        <StyledInput value={form.logoUrl} onChange={set('logoUrl')} placeholder="https://…" />
      </Field>

      {/* Color pickers */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Brand Color">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
            <input
              type="color"
              value={form.primaryColor}
              onChange={set('primaryColor')}
              className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent p-0 flex-shrink-0"
              style={{ backgroundColor: form.primaryColor }}
            />
            <span className="text-sm text-gray-600 font-mono">{form.primaryColor}</span>
          </div>
        </Field>
        <Field label="Accent Color">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
            <input
              type="color"
              value={form.accentColor}
              onChange={set('accentColor')}
              className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent p-0 flex-shrink-0"
              style={{ backgroundColor: form.accentColor }}
            />
            <span className="text-sm text-gray-600 font-mono">{form.accentColor}</span>
          </div>
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

    /* ── Appearance ──────────────────────────────── */
    <motion.div key="appearance" variants={tabFade} initial="hidden" animate="show" exit="exit" className="space-y-5">
      <Field label="Font Family">
        <select
          value={form.fontFamily}
          onChange={set('fontFamily')}
          className="rounded-xl border border-gray-200 w-full px-4 py-3 focus:ring-2 focus:ring-[var(--color-brand)] outline-none text-sm"
        >
          {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
        </select>
      </Field>

      <Field label="Theme Style">
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((t) => (
            <motion.button
              key={t}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setForm((p) => ({ ...p, theme: t }))}
              className={`py-3 rounded-xl border text-sm font-semibold capitalize transition-all ${
                form.theme === t
                  ? 'text-white border-transparent'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              style={form.theme === t ? { backgroundColor: 'var(--color-brand)' } : {}}
            >
              {t}
            </motion.button>
          ))}
        </div>
      </Field>

      <Field label="Color Scheme">
        <div className="flex gap-3">
          {SCHEMES.map((s) => (
            <motion.button
              key={s}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setForm((p) => ({ ...p, colorScheme: s }))}
              className={`flex-1 py-3 rounded-xl border text-sm font-semibold capitalize transition-all ${
                form.colorScheme === s
                  ? 'text-white border-transparent'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              style={form.colorScheme === s ? { backgroundColor: 'var(--color-brand)' } : {}}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </Field>

      <Field label="Product Grid Columns">
        <div className="flex gap-3">
          {GRIDS.map((g) => (
            <motion.button
              key={g}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setForm((p) => ({ ...p, gridColumns: g }))}
              className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                form.gridColumns === g
                  ? 'text-white border-transparent'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              style={form.gridColumns === g ? { backgroundColor: 'var(--color-brand)' } : {}}
            >
              {g} columns
            </motion.button>
          ))}
        </div>
      </Field>
    </motion.div>,

    /* ── Home Page ───────────────────────────────── */
    <motion.div key="homepage" variants={tabFade} initial="hidden" animate="show" exit="exit" className="space-y-5">
      <Field label="Hero Image URL" hint="Full-width banner shown at the top of your store">
        <StyledInput value={form.heroImage} onChange={set('heroImage')} placeholder="https://…" />
      </Field>
      <Field label="Hero Headline">
        <StyledInput value={form.heroHeadline} onChange={set('heroHeadline')} placeholder="Discover amazing products" />
      </Field>
      <Field label="Hero Button Text">
        <StyledInput value={form.heroCta} onChange={set('heroCta')} placeholder="Shop Now" />
      </Field>

      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-bold text-gray-800 mb-4 tracking-tight">Announcement Bar</p>
        <div className="space-y-4">
          <Field label="Message">
            <StyledInput value={form.announcementText} onChange={set('announcementText')} placeholder="Free shipping on orders over Rs. 2,000!" />
          </Field>
          <Field label="Background Color">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
              <input
                type="color"
                value={form.announcementColor}
                onChange={set('announcementColor')}
                className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent p-0 flex-shrink-0"
                style={{ backgroundColor: form.announcementColor }}
              />
              <span className="text-sm text-gray-600 font-mono">{form.announcementColor}</span>
            </div>
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
                className={`w-10 h-6 rounded-full transition-colors ${form.announcementActive ? '' : 'bg-gray-200'}`}
                style={form.announcementActive ? { backgroundColor: 'var(--color-brand)' } : {}}
              />
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.announcementActive ? 'translate-x-4' : ''}`}
              />
            </div>
            <span className="text-sm text-gray-700 font-medium">Show announcement bar</span>
          </label>
        </div>
      </div>
    </motion.div>,

    /* ── Store Info ──────────────────────────────── */
    <motion.div key="storeinfo" variants={tabFade} initial="hidden" animate="show" exit="exit" className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Currency">
          <StyledInput value={form.currency} onChange={set('currency')} placeholder="PKR" />
        </Field>
        <Field label="Locale">
          <StyledInput value={form.locale} onChange={set('locale')} placeholder="en-PK" />
        </Field>
      </div>
      <Field label="Contact Email">
        <StyledInput type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="store@example.com" />
      </Field>
      <Field label="Phone Number">
        <StyledInput value={form.contactPhone} onChange={set('contactPhone')} placeholder="+92 300 1234567" />
      </Field>
      <Field label="Address">
        <StyledInput value={form.contactAddress} onChange={set('contactAddress')} placeholder="Islamabad, Pakistan" />
      </Field>

      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-bold text-gray-800 mb-4 tracking-tight">Social Links</p>
        <div className="space-y-4">
          {[
            ['Instagram', 'contactInstagram', 'https://instagram.com/yourstore'],
            ['Facebook',  'contactFacebook',  'https://facebook.com/yourstore'],
            ['Twitter/X', 'contactTwitter',   'https://twitter.com/yourstore'],
          ].map(([label, key, ph]) => (
            <Field key={key} label={label}>
              <StyledInput value={form[key]} onChange={set(key)} placeholder={ph} />
            </Field>
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
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Store Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">Customize your storefront appearance and information</p>
      </motion.div>

      {/* Settings card */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Pill tabs */}
        <div className="flex gap-2 flex-wrap mb-6 pb-5 border-b border-gray-100">
          {TABS.map((t, i) => (
            <motion.button
              key={t}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                tab === i
                  ? 'text-white border-transparent'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
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
        <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-gray-400">Changes apply immediately after saving.</p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={save}
            disabled={saving}
            className="px-6 py-3 text-sm font-semibold text-white rounded-full disabled:opacity-60 transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
