import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Pencil, Trash2, Key, Shield, Users } from 'lucide-react';

const initialUsers = [
  { id: 1, nama: 'Administrator', email: 'admin@almex.co.id', role: 'Super Admin', status: 'Aktif', lastLogin: '20 Mei 2025' },
  { id: 2, nama: 'Budi Santoso', email: 'budi@almex.co.id', role: 'Admin', status: 'Aktif', lastLogin: '19 Mei 2025' },
  { id: 3, nama: 'Siti Rahayu', email: 'siti@almex.co.id', role: 'Admin', status: 'Aktif', lastLogin: '18 Mei 2025' },
  { id: 4, nama: 'Andi Pratama', email: 'andi@almex.co.id', role: 'Admin', status: 'Nonaktif', lastLogin: '2 Mei 2025' },
];

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ nama: '', email: '', role: 'Admin', password: '' });

  const handleAdd = () => {
    setEditUser(null);
    setFormData({ nama: '', email: '', role: 'Admin', password: '' });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({ nama: user.nama, email: user.email, role: user.role, password: '' });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  const handleResetPassword = (id) => {
    alert(`Password user ${id} telah direset ke default.`);
  };

  const handleSave = () => {
    if (editUser) {
      setUsers(users.map((u) => (u.id === editUser.id ? { ...u, ...formData } : u)));
    } else {
      setUsers([...users, { id: Date.now(), ...formData, status: 'Aktif', lastLogin: '-' }]);
    }
    setShowModal(false);
  };

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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3">User</th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Login Terakhir</th>
                <th className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
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
                        <p className="text-sm font-medium text-zinc-900">{user.nama}</p>
                        <p className="text-xs text-zinc-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                      user.role === 'Super Admin'
                        ? 'bg-[#D49A28]/10 text-[#D49A28] border-[#D49A28]/20'
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      user.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 hidden sm:table-cell">
                    <span className="text-sm text-zinc-600">{user.lastLogin}</span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleResetPassword(user.id)} className="p-2 rounded-lg hover:bg-amber-50 text-zinc-400 hover:text-amber-600 transition-all" title="Reset Password">
                        <Key className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(user)} className="p-2 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600 transition-all" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-2 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-all" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Nama Lengkap</label>
                <input type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all">
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              {!editUser && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Password</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-zinc-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all">Batal</button>
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} className="px-5 py-2.5 bg-[#D49A28] text-white text-sm font-medium rounded-lg hover:bg-[#C08A20] transition-colors">Simpan</motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
