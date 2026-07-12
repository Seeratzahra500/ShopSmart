'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { fadeUp, stagger } from '@/lib/motion';
import { validateImageUrl } from '@/lib/validateImage';
import { uploadImage } from '@/lib/uploadImage';

const EMPTY = { title: '', description: '', price: '', stock: '', category: '', images: '' };
const CATEGORIES = ['Electronics', 'Clothing', 'Food & Beverages', 'Home & Living', 'Beauty', 'Books', 'Sports', 'Toys'];

const fieldStyle = (hasError) => [
  'w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-sm)] bg-[var(--bg-card)]',
  'border transition-colors outline-none',
  hasError
    ? 'border-[var(--danger)] focus:ring-2 focus:ring-[var(--danger)]/20'
    : 'border-[var(--border-strong)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15',
].join(' ');

// Small live thumbnail with inline "couldn't load" state — mirrors the
// pattern used on the settings page for logo/hero URL previews.
function ImageThumb({ url }) {
  const [failed, setFailed] = useState(false);
  const [prevUrl, setPrevUrl] = useState(url);

  // Reset the "failed" state when the URL changes (adjust state during render).
  if (prevUrl !== url) {
    setPrevUrl(url);
    setFailed(false);
  }

  return (
    <div className="w-14 h-14 flex-shrink-0 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg-sunken)] overflow-hidden flex flex-col items-center justify-center relative">
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Preview" onError={() => setFailed(true)} className="w-full h-full object-cover" />
      ) : (
        <span className="text-[9px] text-[var(--danger)] text-center leading-tight px-1">Couldn&apos;t load</span>
      )}
    </div>
  );
}

function ImagesPreview({ images }) {
  const urls = images.split(',').map((s) => s.trim()).filter((u) => /^https?:\/\/.+/.test(u));
  if (!urls.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {urls.map((u, i) => <ImageThumb key={`${u}-${i}`} url={u} />)}
    </div>
  );
}

function ProductModal({ product, onClose, onSaved }) {
  const editing = !!product?._id;
  const [form, setForm]     = useState(product ? {
    ...product,
    price:  product.price,
    stock:  product.stock,
    images: product.images?.join(', ') || '',
  } : EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }));
    setErrors((p) => ({ ...p, [f]: '' }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((p) => ({ ...p, images: p.images.trim() ? `${p.images.trim()}, ${url}` : url }));
      setErrors((p) => ({ ...p, images: '' }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    if (!form.category)           e.category    = 'Required';
    if (isNaN(form.price) || Number(form.price) < 0)  e.price = 'Must be a positive number';
    if (isNaN(form.stock) || Number(form.stock) < 0)  e.stock = 'Must be a non-negative number';

    if (form.images.trim()) {
      const VALID_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
      const urls = form.images.split(',').map((s) => s.trim()).filter(Boolean);
      const bad = urls.filter((url) => {
        if (!/^https?:\/\//i.test(url)) return true;
        const path = url.split('?')[0].toLowerCase();
        return !VALID_EXTS.some((ext) => path.endsWith(ext));
      });
      if (bad.length)
        e.images = 'Each URL must start with https:// and end in .jpg, .jpeg, .png, .gif, .webp, or .svg.';
    }

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const imageUrls = form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [];

    setSaving(true);

    // Confirm every image URL actually loads before saving — run checks in
    // parallel and surface the first failing URL by name.
    if (imageUrls.length) {
      const results = await Promise.all(imageUrls.map((url) => validateImageUrl(url)));
      const badIndex = results.findIndex((ok) => !ok);
      if (badIndex !== -1) {
        toast.error(`Image URL did not load: ${imageUrls[badIndex]}`);
        setSaving(false);
        return;
      }
    }

    try {
      const payload = {
        ...form,
        price:  Number(form.price),
        stock:  Number(form.stock),
        images: imageUrls,
      };
      if (editing) {
        await api.put(`/products/${product._id}`, payload);
        toast.success('Product updated.');
      } else {
        await api.post('/products', payload);
        toast.success('Product created.');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-overlay)] w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--text-main)]">
            {editing ? 'Edit Product' : 'New Product'}
          </h2>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sunken)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Modal body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <Input label="Title" type="text" value={form.title} onChange={set('title')} placeholder="Product name" error={errors.title} />
          <Input label="Price (PKR)" type="number" value={form.price} onChange={set('price')} placeholder="0" error={errors.price} />
          <Input label="Stock" type="number" value={form.stock} onChange={set('stock')} placeholder="0" error={errors.stock} />
          <div>
            <div className="flex items-end gap-2">
              <Input label="Image URLs (comma-separated)" type="text" value={form.images} onChange={set('images')} placeholder="https://…" error={errors.images} className="flex-1" />
              <Button type="button" variant="secondary" onClick={() => document.getElementById('product-image-upload').click()} loading={uploading}>
                {uploading ? 'Uploading…' : 'Upload image'}
              </Button>
              <input id="product-image-upload" type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </div>
            <ImagesPreview images={form.images} />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Category</label>
            <select
              value={form.category} onChange={set('category')}
              className={fieldStyle(!!errors.category)}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-[var(--danger)] mt-1.5">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Description</label>
            <textarea
              value={form.description} onChange={set('description')} rows={3}
              placeholder="Describe the product…"
              className={[fieldStyle(!!errors.description), 'resize-none'].join(' ')}
            />
            {errors.description && <p className="text-xs text-[var(--danger)] mt-1.5">{errors.description}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1 rounded-full" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1 rounded-full" loading={saving}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function DashboardProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);

  const load = () => {
    api.get('/store/products')
      .then(({ data }) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Remove "${title}"? It will be hidden from your store.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product removed.');
      setLoading(true);
      load();
    } catch { toast.error('Failed to remove product.'); }
  };

  const handleRestore = async (id, title) => {
    try {
      await api.put(`/products/${id}`, { isActive: true });
      toast.success(`"${title}" is visible in your store again.`);
      setLoading(true);
      load();
    } catch { toast.error('Failed to restore product.'); }
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={stagger()}
    >
      {/* Top bar */}
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-main)]">My Products</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5 leading-relaxed">
            {products.length} product{products.length !== 1 ? 's' : ''} in your store
          </p>
        </div>
        <Button variant="primary" className="rounded-full" onClick={() => setModal('new')}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Button>
      </motion.div>

      {/* Loading skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] space-y-3">
              <div className="flex gap-3 items-start">
                <div className="skeleton w-16 h-16 rounded-[var(--radius-md)] flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-4 rounded w-3/4" />
                  <div className="skeleton h-3 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty state */
        <motion.div
          variants={fadeUp}
          className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--bg-card)]"
        >
          <EmptyState
            title="No products yet"
            description="Add your first product to start selling."
            action={
              <Button variant="primary" className="rounded-full" onClick={() => setModal('new')}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add your first product
              </Button>
            }
          />
        </motion.div>
      ) : (
        /* Product grid */
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={stagger()}
          initial="hidden"
          animate="show"
        >
          {products.map((p) => (
            <motion.div
              key={p._id}
              variants={fadeUp}
              whileHover={{ y: -2 }}
              className="p-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-lift)] flex flex-col gap-4"
            >
              {/* Product header: thumbnail + name */}
              <div className="flex items-start gap-3">
                {p.images?.[0] ? (
                  <Image
                    src={p.images[0]}
                    alt={p.title}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-[var(--radius-md)] object-cover flex-shrink-0 border border-[var(--border)]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-[var(--radius-md)] bg-[var(--bg-sunken)] flex items-center justify-center flex-shrink-0 text-[var(--text-muted)] text-xs">
                    No image
                  </div>
                )}
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="font-semibold text-[var(--text-main)] text-sm leading-snug truncate">{p.title}</p>
                  <p className="eyebrow text-[10px] mt-0.5">{p.category}</p>
                </div>
              </div>

              {/* Price + stock + status */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-tabular font-bold text-[var(--text-main)] text-sm">{formatPrice(p.price)}</span>
                <div className="flex items-center gap-2">
                  <Badge tone={p.stock === 0 ? 'danger' : p.stock < 10 ? 'warning' : 'success'}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                  </Badge>
                  <Badge tone={p.isActive ? 'brand' : 'neutral'}>
                    {p.isActive ? 'Active' : 'Hidden'}
                  </Badge>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)]">
                <Button variant="secondary" size="sm" className="flex-1 rounded-full" onClick={() => setModal(p)}>
                  Edit
                </Button>
                {p.isActive ? (
                  <Button variant="destructive" size="sm" className="flex-1 rounded-full border border-[var(--danger)]/20" onClick={() => handleDelete(p._id, p.title)}>
                    Remove
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" className="flex-1 rounded-full" onClick={() => handleRestore(p._id, p.title)}>
                    Restore
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <ProductModal
            product={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={() => { setModal(null); setLoading(true); load(); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
