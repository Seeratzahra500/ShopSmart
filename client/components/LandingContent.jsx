'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import { fadeUp, stagger, revealOnce } from '@/lib/motion';
import { themes } from '@/lib/themes';
import { formatPrice } from '@/lib/formatPrice';

/* Curated fallback tiles — used whenever the API is empty/unreachable so the
   collage/marketplace strip never renders blank. Clearly illustrative. */
const FALLBACK_PRODUCTS = [
  { title: 'Hand-thrown ceramic mug', price: 1450, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', storeName: 'Kiln & Co', storeSlug: null },
  { title: 'Oat-milk sourdough loaf', price: 850, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80', storeName: 'FreshBakes', storeSlug: null },
  { title: 'Woven cotton tote', price: 1990, image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80', storeName: 'UrbanWear', storeSlug: null },
  { title: 'Cold-brew concentrate', price: 690, image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80', storeName: 'GreenLeaf', storeSlug: null },
  { title: 'Walnut desk organizer', price: 3200, image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80', storeName: 'CraftCorner', storeSlug: null },
  { title: 'Minimalist leather wallet', price: 2450, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80', storeName: 'StyleHub', storeSlug: null },
  { title: 'Single-origin coffee beans', price: 1100, image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80', storeName: 'TechZone', storeSlug: null },
  { title: 'Hand-poured soy candle', price: 990, image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=600&q=80', storeName: 'Kiln & Co', storeSlug: null },
];

const FALLBACK_STORES = [
  { name: 'Kiln & Co', tagline: 'Small-batch ceramics, made by hand.', slug: null, theme: 'minimal', primaryColor: null, sample: true },
  { name: 'UrbanWear', tagline: 'Streetwear cut for the everyday.', slug: null, theme: 'bold', primaryColor: null, sample: true },
  { name: 'FreshBakes', tagline: 'Sourdough, slow-proofed daily.', slug: null, theme: 'elegant', primaryColor: null, sample: true },
  { name: 'CraftCorner', tagline: 'Wood, brass, and things built to last.', slug: null, theme: 'playful', primaryColor: null, sample: true },
];

const BUILTIN_FONTS = new Set(['Fraunces', 'Inter', 'JetBrains Mono']);

// Slight, deterministic per-index variance so the collage/marquee feel hand-placed
// rather than randomly jittered on every re-render.
const ROTATIONS = [-2, 1.5, -1, 2, -1.5, 1, -2, 1.5];
const DRIFT_DURATIONS = [7, 8.5, 6.5, 9, 7.5, 8, 6, 9.5];

function StoreLetter({ name }) {
  return (name?.charAt(0) || '?').toUpperCase();
}

/* Self-contained marketing landing markup — used by the guest homepage
   (app/page.js) and the always-visible /about route. No auth logic here. */
export default function LandingContent() {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  // Broken product image URLs (hero collage + marketplace marquee) — tiles
  // whose src ends up here are filtered out entirely rather than showing a
  // broken-image icon.
  const [brokenSrcs, setBrokenSrcs] = useState(() => new Set());
  const markBroken = (src) => setBrokenSrcs((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data } = await api.get('/stores?limit=6');
        const liveStores = data?.stores || [];
        if (cancelled) return;
        if (liveStores.length === 0) { setLoaded(true); return; }
        setStores(liveStores);

        // Pull products from the first few stores in parallel — enough to fill
        // the collage + marketplace strip without over-fetching.
        const sampleStores = liveStores.slice(0, 3);
        const results = await Promise.all(
          sampleStores.map((s) =>
            api.get(`/stores/${s.slug}/products?limit=4`)
              .then(({ data }) => (data?.products || []).map((p) => ({
                title: p.title,
                price: p.price,
                image: p.images?.[0],
                storeSlug: s.slug,
                storeName: s.name,
              })))
              .catch(() => [])
          )
        );
        if (cancelled) return;
        const flat = results.flat().filter((p) => p.image).slice(0, 8);
        setProducts(flat);
      } catch {
        // API unreachable — fallback arrays already cover the render.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Inject Google Font links for any non-builtin preset fonts actually used by
  // the featured-store cards below (mirrors StoreContext's collectFontFamilies pattern).
  const displayStores = stores.length ? stores : FALLBACK_STORES;
  useEffect(() => {
    const families = new Set();
    displayStores.slice(0, 6).forEach((s) => {
      const preset = themes[s.theme] || themes.minimal;
      families.add(preset.fonts.display);
      families.add(preset.fonts.body);
    });
    families.forEach((family) => {
      if (BUILTIN_FONTS.has(family)) return;
      const fontId = `gfont-${family.replace(/\s+/g, '-')}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId; link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores]);

  const collageProducts = (products.length ? products : FALLBACK_PRODUCTS)
    .filter((p) => !brokenSrcs.has(p.image))
    .slice(0, 5);
  const collageStore = stores[0] || null;
  const marketplaceProducts = (products.length ? products : FALLBACK_PRODUCTS)
    .filter((p) => !brokenSrcs.has(p.image));
  const marqueeLoop = [...marketplaceProducts, ...marketplaceProducts];

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">

      {/* ── HERO: dual-audience, drifting product collage (no stock photo) ── */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Ambient brand glow, matches the rest of the site's light sections */}
        <div className="pointer-events-none absolute top-[-10%] right-[-10%] w-[36rem] h-[36rem] rounded-full blur-3xl opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, var(--color-brand), transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left: copy */}
            <motion.div
              className="lg:col-span-5"
              variants={stagger()}
              initial="hidden"
              animate="show"
            >
              <motion.p variants={fadeUp} className="eyebrow mb-6">
                The marketplace for independent business
              </motion.p>

              <motion.h1 variants={fadeUp} className="hero-heading text-[var(--text-main)]">
                Where independent stores sell —
              </motion.h1>
              <motion.h1 variants={fadeUp} className="hero-heading mt-1 text-[var(--text-main)]">
                and you shop.
                <span className="block w-24 h-1 mt-4 rounded-full" style={{ backgroundColor: 'var(--color-brand)' }} />
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 text-[var(--text-secondary)] leading-relaxed max-w-md">
                Every store on ShopSmart is real, run by a real owner, with its own look and its own products. Open one in minutes, or browse dozens already live.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
                <Button as={Link} href="/auth/register" size="lg">
                  Start selling
                </Button>
                <Link
                  href="/stores"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-main)] border border-[var(--border-strong)] rounded-[var(--radius-md)] px-6 py-3.5 hover:bg-[var(--bg-sunken)] transition-colors"
                >
                  Browse stores →
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: drifting collage (desktop) */}
            <div className="lg:col-span-7 hidden lg:block">
              <div className="grid grid-cols-3 gap-5">
                <div className="flex flex-col gap-5 mt-12">
                  <CollageProductTile item={collageProducts[0]} index={0} onBroken={markBroken} />
                  <CollageProductTile item={collageProducts[1]} index={1} onBroken={markBroken} />
                </div>
                <div className="flex flex-col gap-5">
                  <CollageStoreTile store={collageStore} index={2} />
                  <CollageProductTile item={collageProducts[2]} index={3} onBroken={markBroken} />
                </div>
                <div className="flex flex-col gap-5 mt-20">
                  <CollageProductTile item={collageProducts[3]} index={4} onBroken={markBroken} />
                  <CollageProductTile item={collageProducts[4]} index={5} onBroken={markBroken} />
                </div>
              </div>
            </div>

            {/* Mobile: horizontal snap-scroll strip */}
            <div className="lg:hidden -mx-6 px-6">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
                {collageProducts.map((item, i) => (
                  <div key={i} className="snap-start shrink-0 w-40">
                    <CollageProductTile item={item} index={i} static onBroken={markBroken} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED STORES: each card wears its own store's theme ── */}
      <section className="py-32 border-y border-[var(--border)] bg-[var(--bg-sunken)]">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={revealOnce}
            variants={stagger()}
          >
            <div className="grid grid-cols-12 gap-8 mb-16">
              <motion.div variants={fadeUp} className="col-span-12 md:col-span-2">
                <p className="eyebrow">Featured stores</p>
              </motion.div>
              <motion.div variants={fadeUp} className="col-span-12 md:col-span-10">
                <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-main)]">
                  Every store, its own world.
                </h2>
              </motion.div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayStores.slice(0, 6).map((store, i) => (
                <FeaturedStoreCard key={store.slug || store.name || i} store={store} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SHOP THE MARKETPLACE: drifting marquee of real products ── */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 mb-10">
          <p className="eyebrow mb-3">Shop the marketplace</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-[var(--text-main)]">
            Fresh from independent sellers.
          </h2>
        </div>

        <MarketplaceMarquee items={marqueeLoop} loaded={loaded} onBroken={markBroken} />
      </section>

      {/* ── ABOUT: editorial 12-col side-label layout ── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            className="grid grid-cols-12 gap-8"
            initial="hidden"
            whileInView="show"
            viewport={revealOnce}
            variants={stagger()}
          >
            <motion.div variants={fadeUp} className="col-span-12 md:col-span-2">
              <p className="eyebrow">About</p>
            </motion.div>

            <div className="col-span-12 md:col-span-10">
              <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-main)] leading-tight max-w-3xl">
                A real marketplace, built from real storefronts — not a template gallery.
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-10 mt-12">
                <motion.p variants={fadeUp} className="text-[var(--text-secondary)] leading-relaxed text-base">
                  <strong className="text-[var(--text-main)] font-semibold">For sellers</strong> — whether you&apos;re selling handmade crafts, clothing, electronics, or food, ShopSmart gives you a storefront that&apos;s entirely yours: your branding, your theme, your domain-worthy link. Set up in minutes, no technical skills needed.
                </motion.p>
                <motion.p variants={fadeUp} className="text-[var(--text-secondary)] leading-relaxed text-base">
                  <strong className="text-[var(--text-main)] font-semibold">For shoppers</strong> — every store here is independently run, not a faceless warehouse. Discover local sellers, browse real products, and check out knowing exactly who you&apos;re buying from.
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS: sellers + shoppers, side by side ── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={revealOnce}
            variants={stagger()}
          >
            <div className="grid grid-cols-12 gap-8 mb-16">
              <motion.div variants={fadeUp} className="col-span-12 md:col-span-2">
                <p className="eyebrow">For sellers</p>
              </motion.div>
              <motion.div variants={fadeUp} className="col-span-12 md:col-span-10">
                <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-main)]">
                  Your store live in minutes
                </h2>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-12 md:pl-[calc(16.666%+2rem)] mb-24">
              {[
                { number: '01', title: 'Create your account', desc: 'Sign up with email, choose your store name and branding colors.' },
                { number: '02', title: 'Add your products', desc: 'Upload images, set prices, manage inventory in real time.' },
                { number: '03', title: 'Start selling', desc: 'Share your store link and watch orders come in.' },
              ].map((step) => (
                <motion.div key={step.number} variants={fadeUp}>
                  <span className="font-tabular text-xs font-bold text-[var(--text-muted)] block mb-6">{step.number}</span>
                  <h3 className="font-display font-semibold text-xl text-[var(--text-main)] mb-3">{step.title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{step.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Mirrored, compact row for shoppers */}
            <div className="grid grid-cols-12 gap-8 mb-16">
              <motion.div variants={fadeUp} className="col-span-12 md:col-span-2">
                <p className="eyebrow">For shoppers</p>
              </motion.div>
              <motion.div variants={fadeUp} className="col-span-12 md:col-span-10">
                <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-main)]">
                  From discovery to your door
                </h2>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-12 md:pl-[calc(16.666%+2rem)]">
              {[
                { number: '01', title: 'Discover stores', desc: 'Browse independent sellers across crafts, fashion, food, and more.' },
                { number: '02', title: 'Order in a few taps', desc: 'Simple checkout, no account required to get started.' },
                { number: '03', title: 'Track it to your door', desc: 'Follow your order from confirmation to delivery.' },
              ].map((step) => (
                <motion.div key={step.number} variants={fadeUp}>
                  <span className="font-tabular text-xs font-bold text-[var(--text-muted)] block mb-6">{step.number}</span>
                  <h3 className="font-display font-semibold text-xl text-[var(--text-main)] mb-3">{step.title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES: warm dark section (ink, not flat gray) ── */}
      <section className="py-32 bg-[#161311]">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={revealOnce}
            variants={stagger()}
          >
            <div className="grid grid-cols-12 gap-8 mb-20">
              <motion.div variants={fadeUp} className="col-span-12 md:col-span-2">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/40">Features</p>
              </motion.div>
              <motion.div variants={fadeUp} className="col-span-12 md:col-span-10">
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-white">
                  Built for real businesses
                </h2>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:pl-[calc(16.666%+2rem)]">
              {[
                {
                  title: 'Beautiful Storefronts',
                  desc: 'Custom branding, themes, hero banners — your store, your identity.',
                },
                {
                  title: 'Inventory Management',
                  desc: 'Real-time stock tracking, low-stock alerts, and easy product management.',
                },
                {
                  title: 'Analytics Dashboard',
                  desc: "Orders, revenue, and top products at a glance — always know how you're doing.",
                },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="border border-white/10 rounded-[var(--radius-lg)] p-8"
                >
                  <h3 className="font-display text-lg font-semibold text-white mb-3">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA: sell + shop ── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            className="grid grid-cols-12 gap-8"
            initial="hidden"
            whileInView="show"
            viewport={revealOnce}
            variants={stagger()}
          >
            <div className="col-span-12 md:col-span-2" />
            <div className="col-span-12 md:col-span-10">
              <motion.h2
                variants={fadeUp}
                className="font-display text-4xl md:text-6xl font-semibold tracking-tight text-[var(--text-main)] leading-tight"
              >
                Sell your way,<br />or shop independent.
              </motion.h2>
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-6">
                <Button as={Link} href="/auth/register" size="lg">
                  Start selling
                </Button>
                <Link
                  href="/stores"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-main)] border border-[var(--border-strong)] rounded-[var(--radius-md)] px-6 py-3.5 hover:bg-[var(--bg-sunken)] transition-colors"
                >
                  Browse stores →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

/* ── Collage tiles (hero) ─────────────────────────────────────────────── */

function CollageProductTile({ item, index, static: isStatic, onBroken }) {
  if (!item) return null;
  const rotate = ROTATIONS[index % ROTATIONS.length];
  const duration = DRIFT_DURATIONS[index % DRIFT_DURATIONS.length];
  const href = item.storeSlug ? `/store/${item.storeSlug}` : '/stores';

  const inner = (
    <div
      className="relative rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-sunken)] shadow-[var(--shadow-lift)]"
      style={{ aspectRatio: '4 / 5', transform: `rotate(${rotate}deg)` }}
    >
      <img src={item.image} alt={item.title} onError={() => onBroken?.(item.image)} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-white bg-black/45 backdrop-blur-sm rounded-full px-2 py-1 truncate max-w-[65%]">
          {item.title}
        </span>
        <span className="font-tabular text-[11px] font-semibold text-white bg-black/45 backdrop-blur-sm rounded-full px-2 py-1 shrink-0">
          {formatPrice(item.price)}
        </span>
      </div>
    </div>
  );

  if (isStatic) {
    return <Link href={href}>{inner}</Link>;
  }

  return (
    <Link href={href}>
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration, ease: 'easeInOut', delay: index * 0.3 }}
      >
        {inner}
      </motion.div>
    </Link>
  );
}

function CollageStoreTile({ store, index }) {
  const rotate = ROTATIONS[index % ROTATIONS.length];
  const duration = DRIFT_DURATIONS[index % DRIFT_DURATIONS.length];
  const name = store?.name || 'Kiln & Co';
  const tagline = store?.tagline || 'Small-batch ceramics, made by hand.';
  const brand = store?.primaryColor || 'var(--color-brand)';
  const href = store?.slug ? `/store/${store.slug}` : '/stores';

  return (
    <Link href={href}>
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration, ease: 'easeInOut', delay: index * 0.3 }}
        className="relative rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-lift)] p-5 flex flex-col justify-between"
        style={{
          aspectRatio: '4 / 5',
          transform: `rotate(${rotate}deg)`,
          backgroundColor: `color-mix(in oklch, ${brand} 12%, white)`,
        }}
      >
        <span
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
          style={{ backgroundColor: brand }}
        >
          <StoreLetter name={name} />
        </span>
        <div>
          <p className="font-display font-semibold text-sm text-[var(--text-main)] leading-snug">{name}</p>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug line-clamp-2">{tagline}</p>
        </div>
      </motion.div>
    </Link>
  );
}

/* ── Featured store card, themed with the store's own preset ────────────── */

function FeaturedStoreCard({ store }) {
  const preset = themes[store.theme] || themes.minimal;
  const brand = store.primaryColor || preset.vars['--color-brand'];
  const cardStyle = {
    ...preset.vars,
    '--color-brand': brand,
    backgroundColor: preset.vars['--bg-page'],
    color: preset.vars['--text-main'],
    borderRadius: preset.vars['--radius-card'],
    boxShadow: preset.vars['--shadow-card'],
    border: preset.vars['--card-border'],
    fontFamily: preset.vars['--font-body'],
  };
  const href = store.slug ? `/store/${store.slug}` : '/stores';

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="p-7 h-full flex flex-col"
        style={cardStyle}
      >
        <div className="flex items-center gap-3 mb-5">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="w-11 h-11 rounded-full object-cover" />
          ) : (
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-semibold shrink-0"
              style={{ backgroundColor: brand }}
            >
              <StoreLetter name={store.name} />
            </span>
          )}
          {store.sample && (
            <span className="eyebrow ml-auto" style={{ color: preset.vars['--text-muted'] }}>Sample</span>
          )}
        </div>

        <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: preset.vars['--font-display'] }}>
          {store.name}
        </h3>
        <p className="text-sm leading-relaxed flex-1" style={{ color: preset.vars['--text-secondary'] }}>
          {store.tagline || 'A storefront on ShopSmart.'}
        </p>

        <span className="mt-5 text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: brand }}>
          Visit store →
        </span>
      </motion.div>
    </Link>
  );
}

/* ── Marketplace marquee: drifting real products, pauses on hover ───────── */

function MarketplaceMarquee({ items, loaded, onBroken }) {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="flex gap-5 px-8 w-max"
        animate={paused ? {} : { x: ['0%', '-50%'] }}
        transition={paused ? {} : { repeat: Infinity, duration: 28, ease: 'linear' }}
        style={{ opacity: loaded || items.length ? 1 : 0 }}
      >
        {items.map((item, i) => {
          const href = item.storeSlug ? `/store/${item.storeSlug}` : '/stores';
          return (
            <Link key={i} href={href} className="shrink-0 w-52">
              <div className="rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-sunken)] aspect-[4/5] relative shadow-[var(--shadow-lift)]">
                <img src={item.image} alt={item.title} onError={() => onBroken?.(item.image)} className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-[var(--text-main)] truncate">{item.title}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-[var(--text-muted)] truncate">{item.storeName}</p>
                  <p className="font-tabular text-xs font-semibold text-[var(--text-main)] shrink-0 ml-2">{formatPrice(item.price)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
