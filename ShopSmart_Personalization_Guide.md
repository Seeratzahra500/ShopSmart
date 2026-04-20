# ShopSmart — Shop Personalization Guide

**What businesses can customize about their storefront, how it works technically, and how to implement it.**

---

## Table of Contents

1. [Core Concept — How Personalization Works](#1-core-concept--how-personalization-works)
2. [Updated Store Model](#2-updated-store-model)
3. [Tier 1 — Easy Personalizations](#3-tier-1--easy-personalizations)
4. [Tier 2 — Medium Personalizations](#4-tier-2--medium-personalizations)
5. [Tier 3 — Advanced Personalizations](#5-tier-3--advanced-personalizations)
6. [The Store Settings Dashboard](#6-the-store-settings-dashboard)
7. [Recommended Scope for This Project](#7-recommended-scope-for-this-project)

---

## 1. Core Concept — How Personalization Works

All personalization is just **data stored in MongoDB**. Your store layout reads that data and injects it as CSS variables. No per-store code, no extra deployments, no builds — one component, infinite looks.

```
Customer visits zaras.shopsmart.pk
        ↓
Server fetches Store document from MongoDB
{ primaryColor: "#e63946", font: "Playfair Display", theme: "elegant", logoUrl: "..." }
        ↓
Next.js injects these as CSS variables into the <html> tag
<html style="--color-brand: #e63946; --font-heading: 'Playfair Display'">
        ↓
Every component uses var(--color-brand) — they automatically reflect the business's choices
```

Every change a business saves hits `PATCH /api/store/:id` and updates the MongoDB document. The store re-renders with new values on the next visit — no redeployment needed.

---

## 2. Updated Store Model

Add all personalization fields to your existing Store/Business model:

```js
// server/src/models/Store.js
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({

  // --- Identity ---
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  tagline:     { type: String, default: '' },
  description: { type: String, default: '' },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  customDomain:{ type: String, unique: true, sparse: true },

  // --- Branding ---
  logoUrl:      { type: String, default: '' },
  primaryColor: { type: String, default: '#4f46e5' },
  accentColor:  { type: String, default: '#818cf8' },
  fontFamily:   {
    type: String,
    enum: ['Inter', 'Playfair Display', 'Poppins', 'Lato', 'Montserrat', 'Merriweather', 'Raleway', 'Space Grotesk'],
    default: 'Inter'
  },
  theme: {
    type: String,
    enum: ['minimal', 'bold', 'elegant', 'playful'],
    default: 'minimal'
  },
  colorScheme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },

  // --- Home Page ---
  heroImage:    { type: String, default: '' },
  heroHeadline: { type: String, default: '' },
  heroCta:      { type: String, default: 'Shop Now' },
  announcement: {
    text:     { type: String, default: '' },
    color:    { type: String, default: '#4f46e5' },
    isActive: { type: Boolean, default: false },
  },

  // --- Layout ---
  gridColumns: { type: Number, enum: [2, 3], default: 3 },

  // --- Contact & Social ---
  contact: {
    email:    { type: String, default: '' },
    phone:    { type: String, default: '' },
    address:  { type: String, default: '' },
    instagram:{ type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter:  { type: String, default: '' },
  },

  // --- Store Config ---
  currency: { type: String, default: 'PKR' },
  locale:   { type: String, default: 'ur-PK' },
  isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
```

---

## 3. Tier 1 — Easy Personalizations

These are all simple text/color fields stored in MongoDB and rendered directly. Low effort, high visual impact.

### 3.1 Store Name, Tagline & Description

Stored as plain strings. Used across the store layout:

```jsx
// client/app/store/[slug]/layout.jsx
export default async function StoreLayout({ children, params }) {
  const store = await fetchStore(params.slug);

  return (
    <html
      lang="en"
      style={{
        '--color-brand':   store.primaryColor,
        '--color-accent':  store.accentColor,
        '--font-heading':  `'${store.fontFamily}', sans-serif`,
      }}
    >
      <head>
        <title>{store.name}</title>
        <meta name="description" content={store.tagline} />
        {/* Dynamically load Google Font */}
        <link
          href={`https://fonts.googleapis.com/css2?family=${store.fontFamily.replace(/ /g, '+')}:wght@400;500;700&display=swap`}
          rel="stylesheet"
        />
      </head>
      <body>
        <StoreNavbar store={store} />
        {store.announcement.isActive && <AnnouncementBar store={store} />}
        <main>{children}</main>
        <StoreFooter store={store} />
      </body>
    </html>
  );
}
```

### 3.2 Logo Upload

Use Cloudinary for image hosting (free tier). Business uploads a logo via the dashboard; you store the URL in MongoDB.

```bash
npm install cloudinary multer multer-storage-cloudinary
```

```js
// server/src/routes/store.routes.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'shopsmart/logos', allowed_formats: ['jpg', 'png', 'svg', 'webp'] },
});

const upload = multer({ storage });

// PATCH /api/store/:id/logo
router.patch('/:id/logo', verifyToken, upload.single('logo'), async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { logoUrl: req.file.path },
      { new: true }
    );
    res.json({ logoUrl: store.logoUrl });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed.' });
  }
});
```

In the Navbar, swap the text logo for the image if one is set:

```jsx
// client/components/StoreNavbar.jsx
{store.logoUrl
  ? <Image src={store.logoUrl} alt={store.name} width={120} height={40} className="object-contain" />
  : <span className="text-xl font-bold" style={{ color: 'var(--color-brand)' }}>{store.name}</span>
}
```

### 3.3 Primary & Accent Colors

A color picker input in the dashboard saves a hex value to the DB. The store layout injects it as a CSS variable. Every button, link, and accent in the store automatically inherits the brand color:

```jsx
// In your global store CSS
button.primary {
  background-color: var(--color-brand);
}
a:hover {
  color: var(--color-accent);
}
.badge {
  background-color: var(--color-accent);
}
```

Dashboard color picker (React):

```jsx
// client/app/admin/store-settings/page.jsx
<div className="flex items-center gap-3">
  <label className="text-sm font-medium">Primary Color</label>
  <input
    type="color"
    value={form.primaryColor}
    onChange={e => setForm({ ...form, primaryColor: e.target.value })}
    className="w-10 h-10 rounded cursor-pointer border-0"
  />
  <span className="text-sm text-gray-500 font-mono">{form.primaryColor}</span>
</div>
```

### 3.4 Contact Info & Social Links

Stored in the `contact` sub-document. Rendered in the store footer:

```jsx
// client/components/StoreFooter.jsx
export default function StoreFooter({ store }) {
  const { contact, name } = store;
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-2">{name}</h3>
          <p className="text-sm">{store.description}</p>
        </div>
        <div>
          <h4 className="text-white font-medium mb-2">Contact</h4>
          {contact.email   && <p className="text-sm">{contact.email}</p>}
          {contact.phone   && <p className="text-sm">{contact.phone}</p>}
          {contact.address && <p className="text-sm">{contact.address}</p>}
        </div>
        <div>
          <h4 className="text-white font-medium mb-2">Follow Us</h4>
          <div className="flex gap-4 text-sm">
            {contact.instagram && <a href={contact.instagram} className="hover:text-white">Instagram</a>}
            {contact.facebook  && <a href={contact.facebook}  className="hover:text-white">Facebook</a>}
            {contact.twitter   && <a href={contact.twitter}   className="hover:text-white">Twitter</a>}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-3 text-xs text-gray-500">
        © {new Date().getFullYear()} {name}. Powered by ShopSmart.
      </div>
    </footer>
  );
}
```

### 3.5 Currency & Locale

All prices across the store format using the store's currency setting:

```js
// client/lib/formatPrice.js
export const formatPrice = (amount, currency = 'PKR', locale = 'ur-PK') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Usage in any component:
// formatPrice(product.price, store.currency, store.locale)
// → "Rs 2,500" for PKR, "€25.00" for EUR, "$25.00" for USD
```

---

## 4. Tier 2 — Medium Personalizations

These require a bit more structure but are very achievable within the project timeline.

### 4.1 Theme Presets

You design 4 themes — each is just a collection of CSS variable overrides. Business picks one from a visual card selector in the dashboard.

```js
// client/lib/themes.js
export const themes = {
  minimal: {
    '--border-radius-card': '4px',
    '--border-radius-btn':  '4px',
    '--font-size-heading':  '1.5rem',
    '--card-shadow':        'none',
    '--card-border':        '1px solid #e5e7eb',
    '--nav-style':          'bordered',
  },
  bold: {
    '--border-radius-card': '0px',
    '--border-radius-btn':  '0px',
    '--font-size-heading':  '2rem',
    '--card-shadow':        '4px 4px 0px #000',
    '--card-border':        '2px solid #000',
    '--nav-style':          'filled',
  },
  elegant: {
    '--border-radius-card': '12px',
    '--border-radius-btn':  '999px',
    '--font-size-heading':  '1.75rem',
    '--card-shadow':        '0 4px 24px rgba(0,0,0,0.08)',
    '--card-border':        'none',
    '--nav-style':          'transparent',
  },
  playful: {
    '--border-radius-card': '20px',
    '--border-radius-btn':  '999px',
    '--font-size-heading':  '1.6rem',
    '--card-shadow':        '0 6px 20px rgba(0,0,0,0.12)',
    '--card-border':        'none',
    '--nav-style':          'filled',
  },
};
```

Inject the chosen theme's variables alongside color/font variables in the store layout:

```jsx
// In StoreLayout — merge theme variables with store's color choices
const themeVars = themes[store.theme] || themes.minimal;
const allVars = {
  '--color-brand':  store.primaryColor,
  '--color-accent': store.accentColor,
  '--font-heading': `'${store.fontFamily}', sans-serif`,
  ...themeVars,
};

<html style={allVars}>
```

Dashboard theme picker:

```jsx
// client/app/admin/store-settings/page.jsx
const THEMES = ['minimal', 'bold', 'elegant', 'playful'];

<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {THEMES.map(t => (
    <button
      key={t}
      onClick={() => setForm({ ...form, theme: t })}
      className={`p-4 rounded-xl border-2 capitalize font-medium transition-all
        ${form.theme === t
          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
          : 'border-gray-200 hover:border-gray-400'
        }`}
    >
      {t}
    </button>
  ))}
</div>
```

### 4.2 Font Selection

```jsx
// Font options with Google Fonts
const FONTS = [
  'Inter',
  'Playfair Display',
  'Poppins',
  'Lato',
  'Montserrat',
  'Merriweather',
  'Raleway',
  'Space Grotesk',
];

// Dashboard dropdown
<select
  value={form.fontFamily}
  onChange={e => setForm({ ...form, fontFamily: e.target.value })}
  className="border rounded-lg px-3 py-2 w-full"
>
  {FONTS.map(f => (
    <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
  ))}
</select>

// Live preview of font in settings page
<p style={{ fontFamily: `'${form.fontFamily}', sans-serif`, fontSize: '1.25rem' }}>
  The quick brown fox jumps over the lazy dog.
</p>
```

### 4.3 Hero Banner

```jsx
// client/app/store/[slug]/page.jsx
export default function StoreHomePage({ store }) {
  return (
    <>
      {/* Hero section */}
      {store.heroImage && (
        <section className="relative w-full h-96 overflow-hidden">
          <Image src={store.heroImage} alt="Store banner" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
            {store.heroHeadline && (
              <h1 className="text-4xl font-bold mb-4">{store.heroHeadline}</h1>
            )}
            <a
              href="#products"
              className="px-8 py-3 rounded-full font-medium text-white"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              {store.heroCta || 'Shop Now'}
            </a>
          </div>
        </section>
      )}

      {/* Products section */}
      <section id="products" className="max-w-6xl mx-auto px-4 py-12">
        <ProductGrid storeId={store._id} columns={store.gridColumns} />
      </section>
    </>
  );
}
```

### 4.4 Announcement Bar

```jsx
// client/components/AnnouncementBar.jsx
export default function AnnouncementBar({ store }) {
  if (!store.announcement?.isActive || !store.announcement?.text) return null;

  return (
    <div
      className="w-full text-center py-2 px-4 text-sm font-medium text-white"
      style={{ backgroundColor: store.announcement.color || 'var(--color-brand)' }}
    >
      {store.announcement.text}
    </div>
  );
}
```

Dashboard toggle:

```jsx
<div className="flex items-center justify-between p-4 border rounded-lg">
  <div>
    <p className="font-medium">Announcement Bar</p>
    <input
      type="text"
      placeholder="e.g. Free delivery on orders over PKR 2000!"
      value={form.announcement.text}
      onChange={e => setForm({ ...form, announcement: { ...form.announcement, text: e.target.value }})}
      className="mt-2 w-full border rounded px-3 py-1 text-sm"
    />
  </div>
  <label className="relative inline-flex items-center cursor-pointer ml-4">
    <input
      type="checkbox"
      checked={form.announcement.isActive}
      onChange={e => setForm({ ...form, announcement: { ...form.announcement, isActive: e.target.checked }})}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
  </label>
</div>
```

### 4.5 Product Grid Layout

```jsx
// client/components/ProductGrid.jsx
export default function ProductGrid({ products, columns = 3 }) {
  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  }[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid gap-6 ${gridClass}`}>
      {products.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

### 4.6 Dark / Light Mode Default

```jsx
// client/app/store/[slug]/layout.jsx
// Set the data-theme attribute based on store's preference
// The visitor's OS preference can still override if set to "system"

const colorSchemeScript = `
  (function() {
    const scheme = '${store.colorScheme}';
    if (scheme === 'dark') document.documentElement.classList.add('dark');
    else if (scheme === 'light') document.documentElement.classList.remove('dark');
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

// Inject as an inline script before any CSS loads (prevents flash)
<head>
  <script dangerouslySetInnerHTML={{ __html: colorSchemeScript }} />
</head>
```

---

## 5. Tier 3 — Advanced Personalizations

These are stretch goals — impressive if included, not required for the core project.

### 5.1 Custom Home Page Sections (Drag-and-Drop)

Business can reorder and toggle blocks on their home page. Each section is a JSON object in the DB:

```js
// In Store model
sections: [
  { type: 'hero',        order: 1, isActive: true  },
  { type: 'featured',    order: 2, isActive: true  },
  { type: 'testimonials',order: 3, isActive: false },
  { type: 'newsletter',  order: 4, isActive: true  },
]
```

Available section types:
- `hero` — full-width banner with headline and CTA
- `featured` — manually picked featured products
- `categories` — category grid/chips
- `testimonials` — customer review quotes
- `newsletter` — email signup form
- `about` — a short text + image strip

Render them dynamically in the store home page:

```jsx
// client/app/store/[slug]/page.jsx
const SECTION_COMPONENTS = {
  hero:         HeroSection,
  featured:     FeaturedSection,
  testimonials: TestimonialsSection,
  newsletter:   NewsletterSection,
  about:        AboutSection,
};

export default function StoreHome({ store }) {
  const activeSections = store.sections
    .filter(s => s.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {activeSections.map(section => {
        const Component = SECTION_COMPONENTS[section.type];
        return Component ? <Component key={section.type} store={store} /> : null;
      })}
    </>
  );
}
```

For drag-and-drop reordering in the dashboard, use `@dnd-kit/core`:

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

### 5.2 Custom Pages (About, FAQ)

Use TipTap as a rich text editor. Content is stored as JSON in the DB and rendered as HTML:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image
```

```js
// StorePage model
const storePageSchema = new mongoose.Schema({
  store:   { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  slug:    { type: String, required: true },  // 'about', 'faq', 'returns'
  title:   { type: String, required: true },
  content: { type: Object },                  // TipTap JSON output
  isActive:{ type: Boolean, default: true },
});
```

```jsx
// client/components/RichTextEditor.jsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex gap-2 p-2 border-b bg-gray-50">
        <button onClick={() => editor.chain().toggleBold().run()} className="px-2 py-1 rounded text-sm font-bold">B</button>
        <button onClick={() => editor.chain().toggleItalic().run()} className="px-2 py-1 rounded text-sm italic">I</button>
        <button onClick={() => editor.chain().toggleHeading({ level: 2 }).run()} className="px-2 py-1 rounded text-sm">H2</button>
        <button onClick={() => editor.chain().toggleBulletList().run()} className="px-2 py-1 rounded text-sm">List</button>
      </div>
      <EditorContent editor={editor} className="p-4 min-h-48 prose max-w-none" />
    </div>
  );
}
```

### 5.3 Custom Domain

See the full Multi-Tenancy guide in `ShopSmart_Execution_Plan.md`. In summary:

- Business adds `customDomain` field in their store settings
- They point their domain's CNAME to your server
- Your Express middleware reads the `Host` header and looks up the store
- Next.js middleware rewrites the URL internally to `/store/[slug]`

---

## 6. The Store Settings Dashboard

The business owner's settings page is organized into clear tabs. All changes call `PATCH /api/store/:id`.

```jsx
// client/app/admin/store-settings/page.jsx
'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const TABS = ['Branding', 'Appearance', 'Home Page', 'Store Info', 'Domain'];

export default function StoreSettingsPage() {
  const [activeTab, setActiveTab] = useState('Branding');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/store/mine').then(res => setForm(res.data));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/store/${form._id}`, form);
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Store Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 border-b">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
              ${activeTab === tab
                ? 'bg-white border border-b-white text-indigo-600'
                : 'text-gray-500 hover:text-gray-800'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Branding */}
      {activeTab === 'Branding' && (
        <div className="space-y-6">
          <Field label="Store Name">
            <input type="text" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="input" />
          </Field>
          <Field label="Tagline">
            <input type="text" value={form.tagline}
              onChange={e => setForm({ ...form, tagline: e.target.value })}
              className="input" placeholder="e.g. Fresh bakes, delivered daily" />
          </Field>
          <Field label="Logo">
            <LogoUploader currentUrl={form.logoUrl} storeId={form._id}
              onUpload={url => setForm({ ...form, logoUrl: url })} />
          </Field>
          <Field label="Primary Color">
            <div className="flex items-center gap-3">
              <input type="color" value={form.primaryColor}
                onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer" />
              <span className="text-sm font-mono text-gray-500">{form.primaryColor}</span>
            </div>
          </Field>
          <Field label="Accent Color">
            <div className="flex items-center gap-3">
              <input type="color" value={form.accentColor}
                onChange={e => setForm({ ...form, accentColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer" />
              <span className="text-sm font-mono text-gray-500">{form.accentColor}</span>
            </div>
          </Field>
        </div>
      )}

      {/* Tab: Appearance */}
      {activeTab === 'Appearance' && (
        <div className="space-y-6">
          <Field label="Theme">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['minimal', 'bold', 'elegant', 'playful'].map(t => (
                <button key={t}
                  onClick={() => setForm({ ...form, theme: t })}
                  className={`p-4 rounded-xl border-2 capitalize font-medium text-sm
                    ${form.theme === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Font">
            <select value={form.fontFamily}
              onChange={e => setForm({ ...form, fontFamily: e.target.value })}
              className="input">
              {['Inter','Playfair Display','Poppins','Lato','Montserrat','Merriweather','Raleway','Space Grotesk'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <p className="mt-2 text-lg" style={{ fontFamily: `'${form.fontFamily}', sans-serif` }}>
              Preview: The quick brown fox
            </p>
          </Field>
          <Field label="Product Grid">
            <div className="flex gap-3">
              {[2, 3].map(n => (
                <button key={n}
                  onClick={() => setForm({ ...form, gridColumns: n })}
                  className={`px-6 py-2 rounded-lg border-2 font-medium
                    ${form.gridColumns === n ? 'border-indigo-500 text-indigo-600' : 'border-gray-200'}`}
                >
                  {n} columns
                </button>
              ))}
            </div>
          </Field>
          <Field label="Color Scheme">
            <div className="flex gap-3">
              {['light', 'dark', 'system'].map(s => (
                <button key={s}
                  onClick={() => setForm({ ...form, colorScheme: s })}
                  className={`px-5 py-2 rounded-lg border-2 capitalize font-medium text-sm
                    ${form.colorScheme === s ? 'border-indigo-500 text-indigo-600' : 'border-gray-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {/* Tab: Home Page */}
      {activeTab === 'Home Page' && (
        <div className="space-y-6">
          <Field label="Hero Image">
            <ImageUploader currentUrl={form.heroImage} storeId={form._id} field="hero"
              onUpload={url => setForm({ ...form, heroImage: url })} />
          </Field>
          <Field label="Hero Headline">
            <input type="text" value={form.heroHeadline}
              onChange={e => setForm({ ...form, heroHeadline: e.target.value })}
              className="input" placeholder="e.g. Fresh from the oven, every morning" />
          </Field>
          <Field label="CTA Button Text">
            <input type="text" value={form.heroCta}
              onChange={e => setForm({ ...form, heroCta: e.target.value })}
              className="input" placeholder="e.g. Shop Now, Order Today" />
          </Field>
          <Field label="Announcement Bar">
            <input type="text" value={form.announcement.text}
              onChange={e => setForm({ ...form, announcement: { ...form.announcement, text: e.target.value }})}
              className="input mb-2" placeholder="e.g. Free delivery on orders over PKR 2000!" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.announcement.isActive}
                onChange={e => setForm({ ...form, announcement: { ...form.announcement, isActive: e.target.checked }})} />
              Show announcement bar
            </label>
          </Field>
        </div>
      )}

      {/* Tab: Store Info */}
      {activeTab === 'Store Info' && (
        <div className="space-y-6">
          <Field label="Description">
            <textarea value={form.description} rows={4}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input resize-none" />
          </Field>
          <Field label="Currency">
            <select value={form.currency}
              onChange={e => setForm({ ...form, currency: e.target.value })}
              className="input">
              {['PKR','USD','EUR','GBP','AED','SAR'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          {['email','phone','address','instagram','facebook','twitter'].map(field => (
            <Field key={field} label={field.charAt(0).toUpperCase() + field.slice(1)}>
              <input type="text" value={form.contact[field]}
                onChange={e => setForm({ ...form, contact: { ...form.contact, [field]: e.target.value }})}
                className="input" />
            </Field>
          ))}
        </div>
      )}

      {/* Tab: Domain */}
      {activeTab === 'Domain' && (
        <div className="space-y-6">
          <Field label="Your ShopSmart URL">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">https://</span>
              <input type="text" value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="input flex-1" />
              <span className="text-gray-500">.shopsmart.pk</span>
            </div>
          </Field>
          <Field label="Custom Domain (optional)">
            <input type="text" value={form.customDomain || ''}
              onChange={e => setForm({ ...form, customDomain: e.target.value })}
              className="input" placeholder="e.g. zaras-boutique.com" />
            <p className="text-xs text-gray-400 mt-1">
              Point your domain's CNAME record to shopsmart.pk, then enter it here.
            </p>
          </Field>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
}
```

---

## 7. Recommended Scope for This Project

| Feature | Effort | Rubric Impact | Recommendation |
|---|---|---|---|
| Store name, tagline, description | 30 min | #27 content, #29 unique concept | Must do |
| Logo upload (Cloudinary) | 2 hrs | #28 images, #30 polish | Must do |
| Primary + accent color pickers | 1 hr | #30 visual polish, #32 creativity | Must do |
| Contact info + social links in footer | 1 hr | #26 footer, #27 content | Must do |
| Currency formatting | 30 min | #1 features | Must do |
| Theme presets (4 themes) | 3 hrs | #29 unique, #32 delight | Strongly recommended |
| Font selection (Google Fonts) | 1 hr | #30 typography | Strongly recommended |
| Hero banner upload + headline | 2 hrs | #28 images, #31 visual impact | Strongly recommended |
| Announcement bar | 30 min | #32 delight | Quick win — do it |
| Product grid columns | 30 min | #20 layout | Quick win — do it |
| Dark/light mode default | 1 hr | #19 consistency | Recommended |
| Custom home page sections | 2–3 days | #29, #32 | Stretch goal |
| Rich text custom pages | 1–2 days | #27 content | Stretch goal |
| Custom domains | 3–5 days | #29 unique | Stretch goal |

**Sweet spot for this project:** Everything in "Must do" + "Strongly recommended" + the two quick wins. That's roughly **12–14 hours of extra work** on top of the core project, and it transforms ShopSmart from a standard e-commerce app into a genuine multi-tenant platform — something no generic tutorial covers.

---

> **Key principle:** All personalization is data, not code. One deployment serves every store. The business customizes through their dashboard; the store re-renders instantly. No builds, no deployments per customer — that's the platform model.
