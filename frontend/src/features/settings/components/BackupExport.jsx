import { motion } from 'framer-motion';
import { Database, Download, HardDrive, FileSpreadsheet, FileText, Archive, Clock } from 'lucide-react';

export default function BackupExport() {
  const storageStats = {
    totalDocuments: 1245,
    totalSize: '4.8 GB',
    usedPercent: 32,
    databaseSize: '1.2 GB',
    fileStorage: '3.6 GB',
    lastBackup: '19 Mei 2025, 02:00',
  };

  return (
    <div className="space-y-6">
      {/* Storage Info */}
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
          {[
            { icon: FileSpreadsheet, label: 'Export CSV', desc: 'Semua data dokumen dalam format CSV', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { icon: FileSpreadsheet, label: 'Export Excel (.xlsx)', desc: 'Format spreadsheet dengan format lengkap', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            { icon: FileText, label: 'Export Klasifikasi Report', desc: 'Laporan akurasi AI dan distribusi kategori', color: 'text-[#D49A28]', bg: 'bg-amber-50', border: 'border-amber-100' },
            { icon: Archive, label: 'Full Database Backup', desc: 'Backup seluruh database + file upload', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
          ].map((option, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              className="flex items-start gap-4 p-5 rounded-lg bg-zinc-50 border border-zinc-100 hover:bg-white hover:border-zinc-200 hover:shadow-sm transition-all text-left group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${option.bg} border ${option.border}`}>
                <option.icon className={`w-5 h-5 ${option.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 group-hover:text-[#D49A28] transition-colors">{option.label}</p>
                <p className="text-xs text-zinc-500 mt-1">{option.desc}</p>
              </div>
              <Download className="w-4 h-4 text-zinc-300 group-hover:text-[#D49A28] transition-colors flex-shrink-0 mt-1" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
