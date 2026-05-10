'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';

const EMPTY = { title: '', description: '', price: '', stock: '', category: '', images: '' };
const CATEGORIES = ['Electronics', 'Clothing', 'Food & Beverages', 'Home & Living', 'Beauty', 'Books', 'Sports', 'Toys'];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

function ProductModal({ product, onClose, onSaved }) {
  const editing = !!product?._id;
  const [form, setForm]     = useState(product ? {
    ...product, price: product.price, stock: product.stock,
    images: product.images?.join(', ') || '',
  } : EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })); };

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
        images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold tracking-tight text-gray-900">{editing ? 'Edit Product' : 'New Product'}</h2>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {[
            { f: 'title',  label: 'Title',       type: 'text',   ph: 'Product name' },
            { f: 'price',  label: 'Price (PKR)', type: 'number', ph: '0' },
            { f: 'stock',  label: 'Stock',       type: 'number', ph: '0' },
            { f: 'images', label: 'Image URLs (comma-separated)', type: 'text', ph: 'https://...' },
          ].map(({ f, label, type, ph }) => (
            <div key={f}>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</label>
              <input type={type} value={form[f]} onChange={set(f)} placeholder={ph}
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors
                  ${errors[f] ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-stone-300 focus:border-stone-400'}`} />
              {errors[f] && <p className="text-red-500 text-xs mt-0.5">{errors[f]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Category</label>
            <select value={form.category} onChange={set('category')}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors
                ${errors.category ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-stone-300 focus:border-stone-400'}`}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-0.5">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Describe the product…"
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none transition-colors
                ${errors.description ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-stone-300 focus:border-stone-400'}`} />
            {errors.description && <p className="text-red-500 text-xs mt-0.5">{errors.description}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={saving}
              className="flex-1 py-2 text-sm font-semibold text-white rounded-full transition-opacity disabled:opacity-60 hover:opacity-90"
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

function SkeletonRows() {
  return (
    <div className="divide-y divide-gray-100 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 bg-gray-200 rounded" />
            <div className="h-2 w-24 bg-gray-100 rounded" />
          </div>
          <div className="h-3 w-16 bg-gray-100 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
          <div className="h-3 w-12 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | 'new' | product obj
  const [search, setSearch]     = useState('');

  const load = () => {
    setLoading(true);
    api.get('/products?limit=100')
      .then(({ data }) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Remove "${title}"? It will be hidden from the store.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product removed.');
      load();
    } catch { toast.error('Failed to remove product.'); }
  };

  const filtered = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Products</h1>
          <p className="text-sm text-gray-600 leading-relaxed mt-0.5">
            {products.length} active product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-full hover:opacity-90 transition-opacity flex-shrink-0"
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </motion.button>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="relative"
      >
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search products by name or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400 transition-colors"
        />
      </motion.div>

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <SkeletonRows />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm">{search ? 'No products match your search.' : 'No products yet. Add your first one.'}</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-gray-100"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {filtered.map((p, i) => (
                <motion.tr
                  key={p._id}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  className="hover:bg-gray-50 transition-colors even:bg-gray-50/50"
                >
                  {/* Image + name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <p className="font-semibold text-gray-800 truncate max-w-[160px]">{p.title}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{p.category}</td>
                  <td className="px-5 py-4 font-semibold text-gray-700">{formatPrice(p.price)}</td>
                  {/* Stock badge */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${p.stock === 0
                          ? 'bg-red-100 text-red-600'
                          : p.stock < 10
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-green-100 text-green-700'}`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${p.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {p.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {/* Edit */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setModal(p)}
                        title="Edit"
                        className="p-2 rounded-lg text-gray-400 hover:text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L13 14l-4 1 1-4 8.5-8.5z" />
                        </svg>
                      </motion.button>
                      {/* Delete */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleDelete(p._id, p.title)}
                        title="Delete"
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <ProductModal
            product={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={() => { setModal(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
