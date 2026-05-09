'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AdminStoresPage() {
  const [stores, setStores]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/stores')
      .then(({ data }) => setStores(data))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (id, name) => {
    setBusy(id);
    try {
      const { data } = await api.patch(`/admin/stores/${id}/status`);
      setStores((prev) => prev.map((s) => s._id === id ? { ...s, isActive: data.isActive } : s));
      toast.success(`"${name}" ${data.isActive ? 'activated' : 'deactivated'}.`);
    } catch { toast.error('Update failed.'); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
        <p className="text-sm text-gray-500 mt-0.5">{stores.length} store{stores.length !== 1 ? 's' : ''} on the platform</p>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🏪</p>
          <p>No stores yet. Sellers will appear here once they register.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Store', 'Owner', 'Slug', 'Status', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stores.map((store) => (
                <tr key={store._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
                        style={{ backgroundColor: store.primaryColor || '#4f46e5' }}
                      >
                        {store.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{store.name}</p>
                        {store.tagline && <p className="text-xs text-gray-400 truncate max-w-[160px]">{store.tagline}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{store.owner?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{store.owner?.email || ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/store/${store.slug}`}
                      target="_blank"
                      className="font-mono text-xs hover:underline"
                      style={{ color: 'var(--color-brand)' }}
                    >
                      /{store.slug}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${store.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                      {store.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(store.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(store._id, store.name)}
                      disabled={busy === store._id}
                      className={`text-xs font-medium hover:underline disabled:opacity-50 transition-colors
                        ${store.isActive ? 'text-red-400 hover:text-red-600' : 'text-green-500 hover:text-green-700'}`}
                    >
                      {store.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
