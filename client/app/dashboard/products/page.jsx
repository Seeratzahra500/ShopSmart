'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/formatPrice';
import api from '@/lib/api';

const EMPTY = { title: '', description: '', price: '', stock: '', category: '', images: '' };
const CATEGORIES = ['Electronics', 'Clothing', 'Food & Beverages', 'Home & Living', 'Beauty', 'Books', 'Sports', 'Toys'];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {[
            { f: 'title',  label: 'Title',             type: 'text',   ph: 'Product name' },
            { f: 'price',  label: 'Price (PKR)',        type: 'number', ph: '0' },
            { f: 'stock',  label: 'Stock',              type: 'number', ph: '0' },
            { f: 'images', label: 'Image URLs (comma-separated)', type: 'text', ph: 'https://…' },
          ].map(({ f, label, type, ph }) => (
            <div key={f}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type} value={form[f]} onChange={set(f)} placeholder={ph}
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors
                  ${errors[f] ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'}`}
              />
              {errors[f] && <p className="text-red-500 text-xs mt-0.5">{errors[f]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category} onChange={set('category')}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors
                ${errors.category ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'}`}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-0.5">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description} onChange={set('description')} rows={3}
              placeholder="Describe the product…"
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none transition-colors
                ${errors.description ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-0.5">{errors.description}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 text-sm font-semibold text-white rounded-lg transition-opacity disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-brand)' }}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
            </button>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModal('new')}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📦</p>
          <p>No products yet. Add your first one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 truncate max-w-[180px]">{p.title}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category}</td>
                  <td className="px-4 py-3 font-medium text-gray-700">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock < 10 ? 'text-amber-500' : 'text-green-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => setModal(p)} className="text-xs font-medium hover:underline" style={{ color: 'var(--color-brand)' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p._id, p.title)} className="text-xs font-medium text-red-400 hover:text-red-600 hover:underline">
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
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
