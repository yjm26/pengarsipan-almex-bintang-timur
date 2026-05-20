import { motion } from 'framer-motion';
import { FileText, Eye, Download, CheckCircle2, AlertTriangle, XCircle, Clock, Building } from 'lucide-react';

function getConfidenceBadge(score) {
  if (score >= 90) {
    return {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'text-emerald-700',
      icon: CheckCircle2,
      label: `${score}%`,
      tooltip: 'Verified',
    };
  }
  if (score >= 75) {
    return {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-700',
      icon: AlertTriangle,
      label: `${score}%`,
      tooltip: 'Needs Review',
    };
  }
  return {
    bg: 'bg-red-50',
    border: 'border-red-100',
    text: 'text-red-700',
    icon: XCircle,
    label: `${score}%`,
    tooltip: 'Low Confidence',
  };
}

function getDirectionBadge(arah) {
  return arah === 'Masuk'
    ? { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: Clock }
    : { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', icon: Clock };
}

export default function DocumentTable({ documents, page = 1 }) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center mb-4">
          <FileText className="w-7 h-7 text-zinc-300" />
        </div>
        <p className="text-sm font-medium text-zinc-600">Tidak ada dokumen ditemukan</p>
        <p className="text-xs text-zinc-400 mt-1">Coba ubah filter atau kata kunci pencarian</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-100">
            <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-8 py-3">File</th>
            <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-8 py-3 hidden lg:table-cell">Perusahaan</th>
            <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-8 py-3 hidden sm:table-cell">Tanggal</th>
            <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-8 py-3">Arah</th>
            <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-8 py-3">Kategori</th>
            <th className="text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider px-8 py-3">Akurasi</th>
            <th className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider px-8 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc, i) => {
            const badge = getConfidenceBadge(doc.confidence);
            const BadgeIcon = badge.icon;
            const dirBadge = getDirectionBadge(doc.arah);

            return (
              <motion.tr
                key={doc.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors group"
              >
                {/* File Name */}
                <td className="px-8 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200/60 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-200/60 transition-colors">
                      <FileText className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate max-w-[220px]">{doc.nama}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{doc.ukuran} · Diunggah {doc.tanggalUnggah}</p>
                    </div>
                  </div>
                </td>

                {/* Company */}
                <td className="px-8 py-3.5 hidden lg:table-cell">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-zinc-300" />
                    <span className="text-sm text-zinc-600 truncate max-w-[180px]">{doc.namaPt}</span>
                  </div>
                </td>

                {/* Date */}
                <td className="px-8 py-3.5 hidden sm:table-cell">
                  <span className="text-sm text-zinc-600 whitespace-nowrap">{doc.tanggalSurat}</span>
                </td>

                {/* Direction */}
                <td className="px-8 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${dirBadge.bg} ${dirBadge.text} ${dirBadge.border}`}>
                    <dirBadge.icon className="w-3 h-3" />
                    {doc.arah}
                  </span>
                </td>

                {/* Category */}
                <td className="px-8 py-3.5">
                  <span className="text-sm text-zinc-700">{doc.jenis}</span>
                </td>

                {/* Accuracy */}
                <td className="px-8 py-3.5 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                    title={badge.tooltip}
                  >
                    <BadgeIcon className="w-3 h-3" />
                    {badge.label}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-8 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-all" title="Lihat Detail">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-all" title="Download">
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
  );
}
