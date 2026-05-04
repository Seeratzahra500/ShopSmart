'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useStore } from '@/context/StoreContext';

const TABS = ['Branding', 'Appearance', 'Home Page', 'Store Info'];

const FONTS = ['Inter', 'Playfair Display', 'Poppins', 'Lato', 'Merriweather', 'Nunito', 'Raleway', 'Oswald'];
const THEMES = ['minimal', 'bold', 'elegant', 'playful'];
const SCHEMES = ['light', 'dark', 'system'];
const GRIDS = [2, 3];

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
      {...props}
    />
  );
}

export default function StoreSettingsPage() {
  const { applyVars } = useStore();
  const [tab, setTab]     = useState(0);
  const [storeId, setStoreId] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({
    name: '', tagline: '', slug: '', logoUrl: '',
    primaryColor: '#4f46e5', accentColor: '#818cf8',
    fontFamily: 'Inter', theme: 'minimal', colorScheme: 'light', gridColumns: 3,
    heroImage: '', heroHeadline: '', heroCta: '',
    announcementText: '', announcementColor: '#4f46e5', announcementActive: false,
    contactEmail: '', contactPhone: '', contactAddress: '',
    contactInstagram: '', contactFacebook: '', contactTwitter: '',
    currency: 'PKR', locale: 'en-PK',
  });

  useEffect(() => {
    api.get('/store/mine/data').then(({ data }) => {
      setStoreId(data._id);
      setForm({
        name:               data.name          || '',
        tagline:            data.tagline        || '',
        slug:               data.slug           || '',
        logoUrl:            data.logoUrl        || '',
        primaryColor:       data.primaryColor   || '#4f46e5',
        accentColor:        data.accentColor    || '#818cf8',
        fontFamily:         data.fontFamily     || 'Inter',
        theme:              data.theme          || 'minimal',
        colorScheme:        data.colorScheme    || 'light',
        gridColumns:        data.gridColumns    || 3,
        heroImage:          data.heroImage      || '',
        heroHeadline:       data.heroHeadline   || '',
        heroCta:            data.heroCta        || '',
        announcementText:   data.announcement?.text   || '',
        announcementColor:  data.announcement?.color  || '#4f46e5',
        announcementActive: data.announcement?.isActive || false,
        contactEmail:       data.contact?.email       || '',
        contactPhone:       data.contact?.phone       || '',
        contactAddress:     data.contact?.address     || '',
        contactInstagram:   data.contact?.instagram   || '',
        contactFacebook:    data.contact?.facebook    || '',
        contactTwitter:     data.contact?.twitter     || '',
        currency:           data.currency || 'PKR',
        locale:             data.locale   || 'en-PK',
      });
    }).catch(() => toast.error('Could not load store settings.'));
  }, []);

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(p => ({ ...p, [key]: val }));
  };

  const save = async () => {
    if (!storeId) return;
    setSaving(true);
    try {
      const payload = {
        name:        form.name,
        tagline:     form.tagline,
        slug:        form.slug,
        logoUrl:     form.logoUrl,
        primaryColor:  form.primaryColor,
        accentColor:   form.accentColor,
        fontFamily:    form.fontFamily,
        theme:         form.theme,
        colorScheme:   form.colorScheme,
        gridColumns:   Number(form.gridColumns),
        heroImage:     form.heroImage,
        heroHeadline:  form.heroHeadline,
        heroCta:       form.heroCta,
        announcement: {
          text:     form.announcementText,
          color:    form.announcementColor,
          isActive: form.announcementActive,
        },
        contact: {
          email:     form.contactEmail,
          phone:     form.contactPhone,
          address:   form.contactAddress,
          instagram: form.contactInstagram,
          facebook:  form.contactFacebook,
          twitter:   form.contactTwitter,
        },
        currency: form.currency,
        locale:   form.locale,
      };
      const { data } = await api.patch(`/store/${storeId}`, payload);
      applyVars(data);
      toast.success('Store settings saved.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const tabContent = [
    // --- Branding ---
    <div key="branding" className="space-y-5">
      <Field label="Store Name">
        <Input value={form.name} onChange={set('name')} placeholder="My ShopSmart Store" />
      </Field>
      <Field label="Tagline" hint="Short phrase shown under your store name">
        <Input value={form.tagline} onChange={set('tagline')} placeholder="Fresh products, fast delivery" />
      </Field>
      <Field label="URL Slug" hint="Your store URL: shopsmart.pk/store/your-slug">
        <Input value={form.slug} onChange={set('slug')} placeholder="my-store" />
      </Field>
      <Field label="Logo URL" hint="Direct link to your logo image">
        <Input value={form.logoUrl} onChange={set('logoUrl')} placeholder="https://..." />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Brand Color">
          <div className="flex items-center gap-2">
            <input type="color" value={form.primaryColor} onChange={set('primaryColor')}
              className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5" />
            <span className="text-sm text-gray-500 font-mono">{form.primaryColor}</span>
          </div>
        </Field>
        <Field label="Accent Color">
          <div className="flex items-center gap-2">
            <input type="color" value={form.accentColor} onChange={set('accentColor')}
              className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5" />
            <span className="text-sm text-gray-500 font-mono">{form.accentColor}</span>
          </div>
        </Field>
      </div>
    </div>,

    // --- Appearance ---
    <div key="appearance" className="space-y-5">
      <Field label="Font Family">
        <select value={form.fontFamily} onChange={set('fontFamily')}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </Field>
      <Field label="Theme Style">
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map(t => (
            <button key={t} type="button" onClick={() => setForm(p => ({ ...p, theme: t }))}
              className={`py-2.5 rounded-lg border text-sm font-medium capitalize transition-all
                ${form.theme === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Color Scheme">
        <div className="flex gap-3">
          {SCHEMES.map(s => (
            <button key={s} type="button" onClick={() => setForm(p => ({ ...p, colorScheme: s }))}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-all
                ${form.colorScheme === s ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {s}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Product Grid Columns">
        <div className="flex gap-3">
          {GRIDS.map(g => (
            <button key={g} type="button" onClick={() => setForm(p => ({ ...p, gridColumns: g }))}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all
                ${form.gridColumns === g ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {g} columns
            </button>
          ))}
        </div>
      </Field>
    </div>,

    // --- Home Page ---
    <div key="homepage" className="space-y-5">
      <Field label="Hero Image URL" hint="Full-width banner image at the top of your store">
        <Input value={form.heroImage} onChange={set('heroImage')} placeholder="https://..." />
      </Field>
      <Field label="Hero Headline">
        <Input value={form.heroHeadline} onChange={set('heroHeadline')} placeholder="Discover amazing products" />
      </Field>
      <Field label="Hero Button Text">
        <Input value={form.heroCta} onChange={set('heroCta')} placeholder="Shop Now" />
      </Field>

      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-semibold text-gray-800 mb-3">Announcement Bar</p>
        <div className="space-y-3">
          <Field label="Message">
            <Input value={form.announcementText} onChange={set('announcementText')} placeholder="Free shipping on orders over Rs. 2,000!" />
          </Field>
          <Field label="Background Color">
            <div className="flex items-center gap-2">
              <input type="color" value={form.announcementColor} onChange={set('announcementColor')}
                className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5" />
              <span className="text-sm text-gray-500 font-mono">{form.announcementColor}</span>
            </div>
          </Field>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.announcementActive} onChange={set('announcementActive')}
              className="w-4 h-4 rounded accent-indigo-600" />
            <span className="text-sm text-gray-700">Show announcement bar</span>
          </label>
        </div>
      </div>
    </div>,

    // --- Store Info ---
    <div key="storeinfo" className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Currency">
          <Input value={form.currency} onChange={set('currency')} placeholder="PKR" />
        </Field>
        <Field label="Locale">
          <Input value={form.locale} onChange={set('locale')} placeholder="en-PK" />
        </Field>
      </div>
      <Field label="Contact Email">
        <Input type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="store@example.com" />
      </Field>
      <Field label="Phone Number">
        <Input value={form.contactPhone} onChange={set('contactPhone')} placeholder="+92 300 1234567" />
      </Field>
      <Field label="Address">
        <Input value={form.contactAddress} onChange={set('contactAddress')} placeholder="Islamabad, Pakistan" />
      </Field>
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm font-semibold text-gray-800 mb-3">Social Links</p>
        <div className="space-y-3">
          {[
            ['Instagram', 'contactInstagram', 'https://instagram.com/yourstore'],
            ['Facebook',  'contactFacebook',  'https://facebook.com/yourstore'],
            ['Twitter/X', 'contactTwitter',   'https://twitter.com/yourstore'],
          ].map(([label, key, ph]) => (
            <Field key={key} label={label}>
              <Input value={form[key]} onChange={set(key)} placeholder={ph} />
            </Field>
          ))}
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Customize your storefront appearance and information</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-5 py-3 text-sm font-medium transition-colors
                ${tab === i ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px' : 'text-gray-500 hover:text-gray-800'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {tabContent[tab]}

          <div className="pt-6 border-t border-gray-100 mt-6">
            <button onClick={save} disabled={saving}
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-60 transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brand)' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
