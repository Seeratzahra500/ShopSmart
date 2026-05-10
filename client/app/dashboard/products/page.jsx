'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';

const EMPTY = { title: '', description: '', price: '', stock: '', category: '', images: '' };
const CATEGORIES = ['Electronics', 'Clothing', 'Food & Beverages', 'Home & Living', 'Beauty', 'Books', 'Sports', 'Toys'];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

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

  const set = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }));
    setErrors((p) => ({ ...p, [f]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    if (!form.category)           e.category    = 'Required';
    if (isNaN(form.price) || Number(form.price) < 0)  e.price = 'Must be a positive number';
    if (isNaN(form.stock) || Number(form.stock) < 0)  e.stock = 'Must be a non-negative number';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        price:  Number(form.price),
        stock:  Number(form.stock),
        images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
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
        className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            {editing ? 'Edit Product' : 'New Product'}
          </h2>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Modal body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {[
            { f: 'title',  label: 'Title',                          type: 'text',   ph: 'Product name' },
            { f: 'price',  label: 'Price (PKR)',                     type: 'number', ph: '0' },
            { f: 'stock',  label: 'Stock',                           type: 'number', ph: '0' },
            { f: 'images', label: 'Image URLs (comma-separated)',    type: 'text',   ph: 'https://…' },
          ].map(({ f, label, type, ph }) => (
            <div key={f}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                type={type} value={form[f]} onChange={set(f)} placeholder={ph}
                className={`rounded-xl border w-full px-4 py-3 focus:ring-2 focus:ring-[var(--color-brand)] outline-none text-sm transition-colors ${
                  errors[f] ? 'border-red-400 focus:ring-red-200' : 'border-gray-200'
                }`}
              />
              {errors[f] && <p className="text-red-500 text-xs mt-1">{errors[f]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={form.category} onChange={set('category')}
              className={`rounded-xl border w-full px-4 py-3 focus:ring-2 focus:ring-[var(--color-brand)] outline-none text-sm transition-colors ${
                errors.category ? 'border-red-400 focus:ring-red-200' : 'border-gray-200'
              }`}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description} onChange={set('description')} rows={3}
              placeholder="Describe the product…"
              className={`rounded-xl border w-full px-4 py-3 focus:ring-2 focus:ring-[var(--color-brand)] outline-none text-sm resize-none transition-colors ${
                errors.description ? 'border-red-400 focus:ring-red-200' : 'border-gray-200'
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="flex-1 py-3 text-sm font-semibold text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={saving}
              className="flex-1 py-3 text-sm font-semibold text-white rounded-full transition-opacity disabled:opacity-60 hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
            </motion.button>
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
    setLoading(true);
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
      load();
    } catch { toast.error('Failed to remove product.'); }
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      {/* Top bar */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
            {products.length} product{products.length !== 1 ? 's' : ''} in your store
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setModal('new')}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-full hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </motion.button>
      </motion.div>

      {/* Loading skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 rounded-2xl border border-gray-100 bg-white space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-16 h-16 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty state */
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="text-center py-24 rounded-2xl border border-dashed border-gray-200 bg-white"
        >
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg font-semibold text-gray-700">No products yet</p>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">Add your first product to start selling.</p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setModal('new')}
            className="mt-5 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-full hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add your first product
          </motion.button>
        </motion.div>
      ) : (
        /* Product grid */
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {products.map((p) => (
            <motion.div
              key={p._id}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -2 }}
              className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col gap-4"
            >
              {/* Product header: thumbnail + name */}
              <div className="flex items-start gap-3">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-2xl">
                    🖼️
                  </div>
                )}
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="font-semibold text-gray-800 text-sm leading-snug truncate">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
                </div>
              </div>

              {/* Price + stock + status */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-gray-900 text-sm">{formatPrice(p.price)}</span>
                <div className="flex items-center gap-2">
                  {/* Stock badge */}
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      p.stock === 0
                        ? 'bg-red-100 text-red-600'
                        : p.stock < 10
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                  </span>
                  {/* Active badge */}
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {p.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setModal(p)}
                  className="flex-1 py-2 text-xs font-semibold rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Edit
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDelete(p._id, p.title)}
                  className="flex-1 py-2 text-xs font-semibold rounded-full border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                >
                  Remove
                </motion.button>
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
            onSaved={() => { setModal(null); load(); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
