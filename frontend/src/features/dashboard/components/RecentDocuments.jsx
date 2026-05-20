import { motion } from 'framer-motion';
import { Eye, FileText, Clock, Download, CheckCircle2, AlertTriangle } from 'lucide-react';

const documents = [
  {
    id: 1,
    tanggal: '20 Mei 2025',
    nama: 'PO_Almex_Bintang_Timur.pdf',
    klasifikasi: 'Masuk · Purchase Order',
    akurasi: 96,
    waktu: '14:32',
  },
  {
    id: 2,
    tanggal: '20 Mei 2025',
    nama: 'Invoice_Q2_2025.pdf',
    klasifikasi: 'Keluar · Invoice',
    akurasi: 94,
    waktu: '13:15',
  },
  {
    id: 3,
    tanggal: '19 Mei 2025',
    nama: 'Surat_Penawaran_ProjectX.pdf',
    klasifikasi: 'Masuk · Penawaran',
    akurasi: 89,
    waktu: '16:45',
  },
  {
    id: 4,
    tanggal: '19 Mei 2025',
    nama: 'Nota_Dinas_Internal.pdf',
    klasifikasi: 'Keluar · Nota Dinas',
    akurasi: 72,
    waktu: '11:20',
  },
  {
    id: 5,
    tanggal: '18 Mei 2025',
    nama: 'Kontrak_Kerjasama_2025.pdf',
    klasifikasi: 'Masuk · Kontrak',
    akurasi: 98,
    waktu: '09:05',
  },
];

function getConfidenceBadge(score) {
  if (score >= 90) {
    return {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'text-emerald-700',
      icon: CheckCircle2,
      label: `${score}%`,
    };
  }
  if (score >= 75) {
    return {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-700',
      icon: AlertTriangle,
      label: `${score}%`,
    };
  }
  return {
    bg: 'bg-red-50',
    border: 'border-red-100',
    text: 'text-red-700',
    icon: AlertTriangle,
    label: `${score}%`,
  };
}

export default function RecentDocuments() {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/60">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-5 border-b border-zinc-100">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-zinc-900">Dokumen Terbaru</h3>
          <p className="text-sm text-zinc-500 mt-1">5 dokumen terakhir yang diproses</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-8 py-3">File</th>
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-8 py-3 hidden sm:table-cell">Tanggal</th>
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-8 py-3">Klasifikasi</th>
              <th className="text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider px-8 py-3">Akurasi</th>
              <th className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider px-8 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, i) => {
              const badge = getConfidenceBadge(doc.akurasi);
              const BadgeIcon = badge.icon;
              return (
                <motion.tr
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors"
                >
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200/60 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate max-w-[200px]">{doc.nama}</p>
                        <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />{doc.waktu}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 hidden sm:table-cell">
                    <span className="text-sm text-zinc-600">{doc.tanggal}</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm text-zinc-700">{doc.klasifikasi}</span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 transition-all" title="Lihat">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 transition-all" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
