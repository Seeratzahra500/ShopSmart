'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const ROLE_COLORS = {
  admin:     'bg-purple-100 text-purple-700',
  shopowner: 'bg-blue-100 text-blue-700',
  customer:  'bg-gray-100 text-gray-600',
};

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-blue-500', 'bg-green-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
];

function avatarColor(name = '') {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

function SkeletonRows() {
  return (
    <div className="divide-y divide-gray-100 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-gray-200 rounded" />
            <div className="h-2 w-40 bg-gray-100 rounded" />
          </div>
          <div className="h-5 w-16 bg-gray-100 rounded-full" />
          <div className="h-5 w-14 bg-gray-100 rounded-full" />
          <div className="h-2 w-20 bg-gray-100 rounded" />
          <div className="h-6 w-20 bg-gray-100 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(({ data }) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (id) => {
    setBusy(id + 'status');
    try {
      const { data } = await api.patch(`/admin/users/${id}/status`);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: data.isActive } : u));
      toast.success(data.message);
    } catch { toast.error('Update failed.'); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Users</h1>
        {!loading && (
          <span className="px-3 py-0.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600">
            {users.length}
          </span>
        )}
      </motion.div>

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <SkeletonRows />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87a4 4 0 100-8 4 4 0 000 8zm6-10a4 4 0 10-8 0 4 4 0 008 0z" />
          </svg>
          <p className="text-sm">No users yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-x-auto border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
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
              {users.map((user) => (
                <motion.tr
                  key={user._id}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  className="hover:bg-gray-50 transition-colors even:bg-gray-50/50"
                >
                  {/* Name + initials avatar */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(user.name)}`}
                      >
                        {user.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  {/* Email */}
                  <td className="px-5 py-4 text-xs text-gray-500">{user.email}</td>
                  {/* Role — READ-ONLY badge */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                        ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {user.role === 'shopowner' ? 'Shop Owner' : user.role}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {/* Joined */}
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-4">
                    {user.role !== 'admin' && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleStatus(user._id)}
                        disabled={busy === user._id + 'status'}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors disabled:opacity-50
                          ${user.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      )}
    </div>
  );
}
