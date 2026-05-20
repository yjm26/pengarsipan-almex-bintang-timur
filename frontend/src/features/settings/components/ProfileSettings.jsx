import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Edit2, Check, X, Lock } from 'lucide-react';

export default function ProfileSettings() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    nama: 'Administrator',
    email: 'admin@almex.co.id',
    role: 'Super Admin',
  });
  const [tempProfile, setTempProfile] = useState({ ...profile });
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleSave = () => {
    setProfile({ ...tempProfile });
    setEditing(false);
  };

  const handleCancel = () => {
    setTempProfile({ ...profile });
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">Informasi Profil</h2>
            <p className="text-sm text-zinc-500 mt-1">Kelola informasi akun Anda.</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-zinc-100">
          <div className="w-20 h-20 rounded-2xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center">
            <User className="w-8 h-8 text-zinc-400" />
          </div>
          <div>
            <p className="text-xl font-semibold text-zinc-900">{profile.nama}</p>
            <p className="text-sm text-zinc-500 mt-1">{profile.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Nama Lengkap</label>
            {editing ? (
              <input
                type="text"
                value={tempProfile.nama}
                onChange={(e) => setTempProfile({ ...tempProfile, nama: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all"
              />
            ) : (
              <p className="text-sm text-zinc-900 px-3 py-2.5 bg-zinc-50/50 rounded-lg">{profile.nama}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Email</label>
            {editing ? (
              <input
                type="email"
                value={tempProfile.email}
                onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all"
              />
            ) : (
              <p className="text-sm text-zinc-900 px-3 py-2.5 bg-zinc-50/50 rounded-lg">{profile.email}</p>
            )}
          </div>
        </div>

        {editing && (
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-zinc-100">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D49A28] text-white text-sm font-medium rounded-lg hover:bg-[#C08A20] transition-colors"
            >
              <Check className="w-4 h-4" />
              Simpan
            </button>
            <button onClick={handleCancel} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all">
              <X className="w-4 h-4" />
              Batal
            </button>
          </div>
        )}
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">Ubah Password</h2>
            <p className="text-sm text-zinc-500 mt-1">Pastikan password minimal 8 karakter.</p>
          </div>
          <Lock className="w-5 h-5 text-zinc-300" />
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Password Saat Ini</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="Masukkan password lama"
              className="w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all placeholder:text-zinc-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Password Baru</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              placeholder="Minimal 8 karakter"
              className="w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all placeholder:text-zinc-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Konfirmasi Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="Ulangi password baru"
              className="w-full px-3 py-2.5 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all placeholder:text-zinc-400"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-[#D49A28] text-white text-sm font-medium rounded-lg hover:bg-[#C08A20] transition-colors"
          >
            Update Password
          </motion.button>
        </div>
      </div>
    </div>
  );
}
