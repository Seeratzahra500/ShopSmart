'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { fadeUp, stagger } from '@/lib/motion';

const ROLE_TONE = {
  admin:     'brand',
  shopowner: 'neutral',
  customer:  'neutral',
};

const ROLE_LABEL = {
  admin: 'Admin',
  shopowner: 'Shop Owner',
  customer: 'Customer',
};

const ROLES = ['customer', 'shopowner', 'admin'];

const AVATAR_COLORS = [
  'var(--color-brand)', '#15803D', '#0E7490',
  '#B45309', '#BE185D', '#0369A1',
];

function avatarColor(name = '') {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

const staggerContainer = stagger(0.08);

function SkeletonRows() {
  return (
    <div className="divide-y divide-[var(--border)] animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 skeleton rounded" />
            <div className="h-2 w-40 skeleton rounded" />
          </div>
          <div className="h-5 w-16 skeleton rounded-full" />
          <div className="h-5 w-14 skeleton rounded-full" />
          <div className="h-2 w-20 skeleton rounded" />
          <div className="h-6 w-20 skeleton rounded-full" />
        </div>
      ))}
    </div>
  );
}

function RoleDropdown({ value, onChange, disabled, userName }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-label={`Change role for ${userName}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] px-3 py-2 text-[var(--text-secondary)] hover:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 disabled:opacity-50 cursor-pointer transition-colors"
        style={{ minWidth: '7.5rem' }}
      >
        {ROLE_LABEL[value] || value}
        <svg className="w-3 h-3 text-[var(--text-muted)] ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1 w-36 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-overlay)] py-1 z-20"
          >
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { onChange(r); setOpen(false); }}
                className={[
                  'block w-full text-left px-3 py-1.5 text-xs font-medium transition-colors',
                  r === value
                    ? 'text-[var(--brand-ink)] bg-[var(--brand-soft)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-main)]',
                ].join(' ')}
              >
                {ROLE_LABEL[r]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(null);

  const load = () => {
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

  const changeRole = async (id, role) => {
    setBusy(id + 'role');
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role } : u));
      toast.success(`Role updated to ${role}.`);
    } catch { toast.error('Role update failed.'); }
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
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-main)]">Users</h1>
        {!loading && (
          <span className="px-3 py-0.5 rounded-full text-sm font-semibold bg-[var(--bg-sunken)] text-[var(--text-secondary)] font-tabular">
            {users.length}
          </span>
        )}
      </motion.div>

      {/* Table */}
      {loading ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
          <SkeletonRows />
        </div>
      ) : users.length === 0 ? (
        <EmptyState title="No users yet" />
      ) : (
        <div className="rounded-[var(--radius-lg)] overflow-x-auto border border-[var(--border)] bg-[var(--bg-card)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-sunken)] border-b border-[var(--border)]">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 eyebrow">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-[var(--border)]"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {users.map((user) => (
                <motion.tr
                  key={user._id}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  className="hover:bg-[var(--bg-sunken)] transition-colors"
                >
                  {/* Name + initials avatar */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: avatarColor(user.name) }}
                      >
                        {user.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="font-medium text-[var(--text-main)]">{user.name}</span>
                    </div>
                  </td>
                  {/* Email */}
                  <td className="px-5 py-4 text-xs text-[var(--text-muted)]">{user.email}</td>
                  {/* Role badge */}
                  <td className="px-5 py-4">
                    <Badge tone={ROLE_TONE[user.role] || 'neutral'}>
                      {user.role === 'shopowner' ? 'Shop Owner' : user.role}
                    </Badge>
                  </td>
                  {/* Status */}
                  <td className="px-5 py-4">
                    <Badge tone={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  {/* Joined */}
                  <td className="px-5 py-4 text-xs text-[var(--text-muted)]">
                    {new Date(user.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-4">
                    {user.role !== 'admin' ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Activate / Deactivate */}
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => toggleStatus(user._id)}
                          disabled={busy === user._id + 'status' || busy === user._id + 'role'}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors disabled:opacity-50
                            ${user.isActive
                              ? 'bg-[var(--danger)]/8 text-[var(--danger)] hover:bg-[var(--danger)]/15'
                              : 'bg-[var(--success)]/8 text-[var(--success)] hover:bg-[var(--success)]/15'}`}
                        >
                          {busy === user._id + 'status' ? '…' : (user.isActive ? 'Deactivate' : 'Activate')}
                        </motion.button>

                        {/* Role selector */}
                        <RoleDropdown
                          value={user.role}
                          userName={user.name}
                          disabled={busy === user._id + 'role' || busy === user._id + 'status'}
                          onChange={(role) => changeRole(user._id, role)}
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)] italic">—</span>
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
