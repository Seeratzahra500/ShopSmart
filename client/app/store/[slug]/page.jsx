import StorePageClient from './StorePageClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const FALLBACK_METADATA = {
  title: 'Store — ShopSmart',
  description: 'Discover independent stores on ShopSmart.',
};

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const res = await fetch(`${API_BASE}/stores/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return FALLBACK_METADATA;

    const store = await res.json();
    const title = `${store.name} — ShopSmart`;
    const description = store.tagline || store.description || FALLBACK_METADATA.description;
    const images = [store.heroImage, store.logoUrl].filter(Boolean);

    return {
      title,
      description,
      openGraph: { title, description, images, type: 'website' },
      twitter: { card: 'summary_large_image' },
    };
  } catch {
    return FALLBACK_METADATA;
  }
}

export default function StorePage() {
  return <StorePageClient />;
}
