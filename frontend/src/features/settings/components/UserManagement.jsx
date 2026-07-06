import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Pencil, Trash2, Key, Shield, Users, User, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../../lib/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ nama_lengkap: '', username: '', role: 'admin', password: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setEditUser(null);
    setFormData({ nama_lengkap: '', username: '', role: 'admin', password: '', is_active: true });
    setError(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      nama_lengkap: user.nama_lengkap || '',
      username: user.username || '',
      role: user.role || 'admin',
      password: '',
      is_active: user.is_active ?? true,
    });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menonaktifkan user ini?')) return;
    try {
      await api.deleteUser(id);
      setUsers(users.map((u) => (u.id === id ? { ...u, is_active: false } : u)));
    } catch (err) {
      alert('Gagal menonaktifkan: ' + err.message);
    }
  };

  const handleResetPassword = async (id) => {
    alert('Fitur reset password belum diimplementasikan. Hubungi super admin.');
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editUser) {
        const payload = {};
        if (formData.nama_lengkap) payload.nama_lengkap = formData.nama_lengkap;
        if (formData.username && formData.username !== editUser.username) payload.username = formData.username;
        if (formData.role) payload.role = formData.role;
        if (formData.password) payload.password = formData.password;
        if (formData.is_active !== undefined) payload.is_active = formData.is_active;
        const updated = await api.updateUser(editUser.id, payload);
        setUsers(users.map((u) => (u.id === editUser.id ? updated : u)));
      } else {
        const payload = {
          username: formData.username,
          nama_lengkap: formData.nama_lengkap,
          role: formData.role,
          password: formData.password,
        };
        const created = await api.createUser(payload);
        setUsers([...users, created]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Gagal menyimpan user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200/60 p-12 text-center">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin mx-auto mb-3" />
        <p className="text-sm text-zinc-500">Memuat data user...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center">
              <Users className="w-6 h-6 text-zinc-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">Manajemen User</h2>
              <p className="text-sm text-zinc-500 mt-1">Kelola akun administrator dan hak akses.</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D49A28] text-white text-sm font-medium rounded-lg hover:bg-[#C08A20] transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Tambah User
          </motion.button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3">User</th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Dibuat</th>
                <th className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-sm text-zinc-400">Belum ada user</td></tr>
              ) : users.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors group"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200/60 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900">{user.nama_lengkap}</p>
                        <p className="text-xs text-zinc-400">{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                      user.role === 'super_admin'
                        ? 'bg-[#D49A28]/10 text-[#D49A28] border-[#D49A28]/20'
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {user.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 hidden sm:table-cell">
                    <span className="text-sm text-zinc-600">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleResetPassword(user.id)} className="p-2 rounded-lg hover:bg-amber-50 text-zinc-400 hover:text-amber-600 transition-all" title="Reset Password">
                        <Key className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(user)} className="p-2 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600 transition-all" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {user.is_active && (
                        <button onClick={() => handleDelete(user.id)} className="p-2 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-all" title="Nonaktifkan">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl border border-zinc-200/60 p-8 w-full max-w-md shadow-xl"
          >
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 mb-6">
              {editUser ? 'Edit User' : 'Tambah User Baru'}
            </h3>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Nama Lengkap</label>
                <input type="text" value={formData.nama_lengkap} onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })} className="w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Username</label>
                <input type="text" value={formData.username} disabled={!!editUser} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className={`w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all ${editUser ? 'opacity-60 cursor-not-allowed' : ''}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all">
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              {editUser && (
                <div className="flex items-center gap-3">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-zinc-300 w-4 h-4 accent-[#D49A28]"
                  />
                  <label htmlFor="is_active" className="text-sm text-zinc-700">User aktif</label>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  {editUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}
                </label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-zinc-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all">Batal</button>
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#D49A28] text-white text-sm font-medium rounded-lg hover:bg-[#C08A20] transition-colors disabled:opacity-60">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Menyimpan...' : 'Simpan'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
