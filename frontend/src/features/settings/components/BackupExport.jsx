import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Download, HardDrive, FileSpreadsheet, FileText, Archive, Clock, Loader2, Lock } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext.jsx';

export default function BackupExport() {
  const { addToast } = useToast();
  const [exporting, setExporting] = useState(null);
  const [storageStats, setStorageStats] = useState({
    totalDocuments: 0,
    totalSize: '0 B',
    usedPercent: 0,
    databaseSize: '-',
    fileStorage: '-',
    lastBackup: '-',
  });
  const [backups, setBackups] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [stats, me] = await Promise.all([
          api.getStorageStats().catch(() => null),
          api.getMe().catch(() => null),
        ]);
        if (stats) {
          setStorageStats({
            totalDocuments: stats.total_documents ?? 0,
            totalSize: stats.total_size ?? '0 B',
            usedPercent: stats.used_percent ?? 0,
            databaseSize: stats.database_size ?? '-',
            fileStorage: stats.file_storage ?? '-',
            lastBackup: stats.last_backup ?? '-',
          });
        }
        if (me) setIsSuperAdmin(me.role === 'super_admin');
      } catch (err) {
        addToast('Gagal memuat statistik penyimpanan: ' + err.message, 'error');
      } finally {
        setLoadingStats(false);
      }
    };
    load();
  }, []);

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      let res;
      if (type === 'csv') {
        res = await api.exportCSV();
      } else if (type === 'excel') {
        res = await api.exportExcel();
      } else if (type === 'backup') {
        res = await api.backupDatabase();
        addToast('Backup berhasil dibuat', 'success');
        return;
      } else {
        return;
      }

      if (res instanceof Response) {
        const blob = await res.blob();
        const ext = type === 'csv' ? 'csv' : 'xlsx';
        downloadFile(blob, `arsip_export.${ext}`);
        addToast(`${type.toUpperCase()} berhasil diunduh`, 'success');
      }
    } catch (err) {
      addToast('Gagal: ' + err.message, 'error');
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    { type: 'csv', icon: FileSpreadsheet, label: 'Export CSV', desc: 'Semua data dokumen dalam format CSV', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', disabled: false },
    { type: 'excel', icon: FileSpreadsheet, label: 'Export Excel (.xlsx)', desc: 'Format spreadsheet dengan format lengkap', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', disabled: false },
    { type: 'report', icon: FileText, label: 'Export Klasifikasi Report', desc: 'Laporan akurasi klasifikasi dan distribusi kategori', color: 'text-[#D49A28]', bg: 'bg-amber-50', border: 'border-amber-100', disabled: true, soon: true },
    { type: 'backup', icon: Archive, label: 'Full Database Backup', desc: 'Backup seluruh database + file upload', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', disabled: !isSuperAdmin },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-zinc-200/60 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center">
            <Database className="w-6 h-6 text-zinc-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">Penyimpanan & Backup</h2>
            <p className="text-sm text-zinc-500 mt-1">Info penggunaan storage dan opsi backup data.</p>
          </div>
        </div>

        {/* Storage Bar */}
        <div className="mb-8 pb-8 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-700">Storage Terpakai</span>
            <span className="text-sm text-zinc-500">{storageStats.usedPercent}% dari 15 GB</span>
          </div>
          <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#D49A28] rounded-full transition-all" style={{ width: `${storageStats.usedPercent}%` }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
              <HardDrive className="w-4 h-4 text-zinc-400 mb-2" />
              <p className="text-lg font-semibold text-zinc-900">{storageStats.totalSize}</p>
              <p className="text-xs text-zinc-500 mt-1">Total terpakai</p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
              <FileText className="w-4 h-4 text-zinc-400 mb-2" />
              <p className="text-lg font-semibold text-zinc-900">{storageStats.totalDocuments}</p>
              <p className="text-xs text-zinc-500 mt-1">Total dokumen</p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
              <Database className="w-4 h-4 text-zinc-400 mb-2" />
              <p className="text-lg font-semibold text-zinc-900">{storageStats.databaseSize}</p>
              <p className="text-xs text-zinc-500 mt-1">Ukuran database</p>
            </div>
          </div>
        </div>

        {/* Last Backup Info */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-100 mb-8">
          <Clock className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-emerald-700">Backup otomatis terakhir</p>
            <p className="text-xs text-emerald-600">{storageStats.lastBackup} — berhasil</p>
          </div>
        </div>

        {/* Export Options */}
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Export Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {exportOptions.map((option, i) => {
            const isDisabled = option.disabled || !!exporting;
            return (
              <motion.button
                key={i}
                whileTap={isDisabled ? {} : { scale: 0.98 }}
                onClick={() => !isDisabled && handleExport(option.type)}
                disabled={isDisabled}
                className={`flex items-start gap-4 p-5 rounded-lg border text-left group transition-all ${
                  isDisabled
                    ? 'bg-zinc-50 border-zinc-100 opacity-60 cursor-not-allowed'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${option.bg} border ${option.border}`}>
                  {exporting === option.type ? (
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                  ) : option.soon ? (
                    <Lock className={`w-5 h-5 ${option.color}`} />
                  ) : (
                    <option.icon className={`w-5 h-5 ${option.color}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${isDisabled ? 'text-zinc-500' : 'text-zinc-900 group-hover:text-[#D49A28]'} transition-colors`}>
                      {option.label}
                    </p>
                    {option.soon && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
                        Segera
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{option.desc}</p>
                </div>
                {!isDisabled && (
                  <Download className="w-4 h-4 text-zinc-300 group-hover:text-[#D49A28] transition-colors flex-shrink-0 mt-1" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
