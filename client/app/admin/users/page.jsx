'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-700',
  user:  'bg-gray-100 text-gray-600',
};

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

  const toggleStatus = async (id, currentStatus) => {
    setBusy(id + 'status');
    try {
      const { data } = await api.patch(`/admin/users/${id}/status`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.isActive } : u));
      toast.success(data.message);
    } catch { toast.error('Update failed.'); }
    finally { setBusy(null); }
  };

  const changeRole = async (id, role) => {
    setBusy(id + 'role');
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
      toast.success('Role updated.');
    } catch { toast.error('Update failed.'); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user._id, e.target.value)}
                      disabled={busy === user._id + 'role'}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50
                        ${ROLE_COLORS[user.role]}`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(user._id, user.isActive)}
                      disabled={busy === user._id + 'status'}
                      className={`text-xs font-medium hover:underline disabled:opacity-50 transition-colors
                        ${user.isActive ? 'text-red-400 hover:text-red-600' : 'text-green-500 hover:text-green-700'}`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
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
