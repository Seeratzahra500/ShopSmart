import ProductPageClient from './ProductPageClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const FALLBACK_METADATA = {
  title: 'Product — ShopSmart',
  description: 'Discover products from independent stores on ShopSmart.',
};

export async function generateMetadata({ params }) {
  try {
    const { slug, id } = await params;
    const [productRes, storeRes] = await Promise.all([
      fetch(`${API_BASE}/stores/${slug}/products/${id}`, { next: { revalidate: 300 } }),
      fetch(`${API_BASE}/stores/${slug}`, { next: { revalidate: 300 } }),
    ]);
    if (!productRes.ok) return FALLBACK_METADATA;

    const product = await productRes.json();
    const store = storeRes.ok ? await storeRes.json() : null;

    const title = `${product.title} — ${store?.name || 'ShopSmart'}`;
    const description = (product.description || FALLBACK_METADATA.description).slice(0, 160);
    const images = [product.images?.[0]].filter(Boolean);

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

export default function StoreProductPage() {
  return <ProductPageClient />;
}
