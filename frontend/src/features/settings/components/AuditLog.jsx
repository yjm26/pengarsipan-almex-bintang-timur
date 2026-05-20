import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, FileUp, Upload, UserPlus, Key, Trash2, Settings, RotateCw, Search } from 'lucide-react';

const initialLogs = [
  { id: 1, user: 'Administrator', action: 'upload', detail: 'Upload dokumen: PO_Almex_001.pdf', timestamp: '20 Mei 2025, 14:32', type: 'upload' },
  { id: 2, user: 'Administrator', action: 'login', detail: 'Login berhasil dari 192.168.1.10', timestamp: '20 Mei 2025, 08:15', type: 'auth' },
  { id: 3, user: 'Budi Santoso', action: 'retrain', detail: 'Retrain model AI — Akurasi: 94.2%', timestamp: '18 Mei 2025, 14:30', type: 'ai' },
  { id: 4, user: 'Administrator', action: 'upload', detail: 'Upload dokumen: INV_Q2_2025.pdf', timestamp: '18 Mei 2025, 11:20', type: 'upload' },
  { id: 5, user: 'Siti Rahayu', action: 'edit_category', detail: 'Edit kategori: "Lainnya" → "Dokumen Tambahan"', timestamp: '17 Mei 2025, 16:45', type: 'category' },
  { id: 6, user: 'Administrator', action: 'add_user', detail: 'Tambah user: Andi Pratama (Admin)', timestamp: '17 Mei 2025, 09:00', type: 'user' },
  { id: 7, user: 'Administrator', action: 'delete', detail: 'Hapus dokumen: Draft_Kontrak_lama.pdf', timestamp: '16 Mei 2025, 15:10', type: 'upload' },
  { id: 8, user: 'Administrator', action: 'reset_password', detail: 'Reset password user: Siti Rahayu', timestamp: '15 Mei 2025, 13:22', type: 'user' },
  { id: 9, user: 'Budi Santoso', action: 'login', detail: 'Login berhasil dari 192.168.1.25', timestamp: '15 Mei 2025, 08:45', type: 'auth' },
  { id: 10, user: 'Administrator', action: 'settings', detail: 'Ubah confidence threshold: 70% → 75%', timestamp: '14 Mei 2025, 10:30', type: 'settings' },
  { id: 11, user: 'Administrator', action: 'upload', detail: 'Upload dokumen: MoU_Partnership_2025.pdf', timestamp: '14 Mei 2025, 09:15', type: 'upload' },
  { id: 12, user: 'Siti Rahayu', action: 'login', detail: 'Login berhasil dari 10.0.0.5', timestamp: '13 Mei 2025, 08:00', type: 'auth' },
];

const typeConfig = {
  upload: { icon: Upload, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Dokumen' },
  auth: { icon: ClipboardList, color: 'text-zinc-500', bg: 'bg-zinc-50', border: 'border-zinc-100', label: 'Auth' },
  ai: { icon: RotateCw, color: 'text-[#D49A28]', bg: 'bg-amber-50', border: 'border-amber-100', label: 'AI' },
  user: { icon: UserPlus, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', label: 'User' },
  category: { icon: Settings, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Kategori' },
  settings: { icon: Settings, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100', label: 'Settings' },
};

export default function AuditLog() {
  const [logs] = useState(initialLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchSearch = !searchTerm || log.detail.toLowerCase().includes(searchTerm.toLowerCase()) || log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = !filterType || log.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Card */}
      <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-zinc-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">Audit Log</h2>
            <p className="text-sm text-zinc-500 mt-1">Riwayat aktivitas semua pengguna di sistem.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari aktivitas..." className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all placeholder:text-zinc-400" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all text-zinc-700 cursor-pointer min-w-[150px]">
            <option value="">Semua Tipe</option>
            <option value="upload">Dokumen</option>
            <option value="auth">Auth</option>
            <option value="ai">AI</option>
            <option value="user">User</option>
            <option value="category">Kategori</option>
            <option value="settings">Settings</option>
          </select>
        </div>

        {/* Log List */}
        <div className="space-y-1">
          {filteredLogs.map((log, i) => {
            const config = typeConfig[log.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-zinc-50/50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg} border ${config.border}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-900 truncate">{log.detail}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{log.user} · {config.label}</p>
                </div>
                <span className="text-xs text-zinc-400 whitespace-nowrap">{log.timestamp}</span>
              </motion.div>
            );
          })}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-sm text-zinc-400">Tidak ada log yang sesuai.</div>
        )}
      </div>
    </div>
  );
}
