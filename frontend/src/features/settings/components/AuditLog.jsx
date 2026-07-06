import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Upload, UserPlus, Settings, RotateCw, Search } from 'lucide-react';
import api from '../../../lib/api';

const typeConfig = {
  upload: { icon: Upload, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Dokumen' },
  auth: { icon: ClipboardList, color: 'text-zinc-500', bg: 'bg-zinc-50', border: 'border-zinc-100', label: 'Auth' },
  ai: { icon: RotateCw, color: 'text-[#D49A28]', bg: 'bg-amber-50', border: 'border-amber-100', label: 'Klasifikasi' },
  user: { icon: UserPlus, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', label: 'User' },
  category: { icon: Settings, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Kategori' },
  settings: { icon: Settings, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100', label: 'Settings' },
};

function formatTimestamp(ts) {
  if (!ts) return '-';
  const date = new Date(ts);
  if (isNaN(date.getTime())) return ts;

  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  if (diffHour < 24) return `${diffHour} jam yang lalu`;
  if (diffDay === 1) return `Kemarin, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDay < 7) return `${diffDay} hari yang lalu`;

  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fullTimestamp(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  if (isNaN(date.getTime())) return ts;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.getAuditLogs();
        const mapped = (res.data || []).map((log) => ({
          id: log.id,
          user: log.user || log.username || '-',
          action: log.action || '',
          detail: log.detail || log.description || '',
          timestamp: log.timestamp || log.created_at || '',
          type: log.type || log.action || 'settings',
        }));
        setLogs(mapped);
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

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
            <option value="ai">Klasifikasi</option>
            <option value="user">User</option>
            <option value="category">Kategori</option>
            <option value="settings">Settings</option>
          </select>
        </div>

        {/* Log List */}
        {loading ? (
          <div className="space-y-2">
            {[0,1,2,3,4,5].map((i) => <div key={i} className="h-12 rounded-lg bg-zinc-50 animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log, i) => {
              const config = typeConfig[log.type] || typeConfig.settings;
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
                  <span className="text-xs text-zinc-400 whitespace-nowrap" title={fullTimestamp(log.timestamp)}>{formatTimestamp(log.timestamp)}</span>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && filteredLogs.length === 0 && (
          <div className="text-center py-12 text-sm text-zinc-400">Tidak ada log yang sesuai.</div>
        )}
      </div>
    </div>
  );
}
