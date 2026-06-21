import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, CheckCircle2, AlertTriangle, XCircle, Pencil, Trash2, ArrowDownLeft, ArrowUpRight, X, ChevronRight, Edit3, Download, Check, Loader2 } from 'lucide-react';
import { api } from '../../../lib/api';

function getConfidenceBadge(score) {
  if (score >= 75) {
    return { bg: '#00AA00', border: '#009900', text: 'text-white', icon: CheckCircle2, label: 'Akurat' };
  }
  if (score >= 50) {
    return { bg: '#D4A000', border: '#B88600', text: 'text-white', icon: AlertTriangle, label: 'Cukup' };
  }
  return { bg: '#DD0000', border: '#BB0000', text: 'text-white', icon: XCircle, label: 'Tidak Akurat' };
}

/* ===== DETAIL PANEL (Feature 1) ===== */
function DetailPanel({ doc, onClose, onCorrect }) {
  const [correcting, setCorrecting] = useState(false);
  const [correction, setCorrection] = useState({ arah: doc.arah, jenis: doc.jenis });
  const [saving, setSaving] = useState(false);
  const badge = getConfidenceBadge(doc.confidence);
  const BadgeIcon = badge.icon;

  const handleCorrect = () => {
    setSaving(true);
    setTimeout(() => {
      onCorrect(doc.id, correction);
      setSaving(false);
      setCorrecting(false);
    }, 800);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-screen w-full xl:w-[960px] bg-white border-l border-zinc-200/60 z-50 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">Detail Dokumen</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-column layout: Preview (left) | Details (right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: PDF Preview */}
          <div className="flex-1 bg-zinc-100 border-r border-zinc-200 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
              <img
                src={`${api.baseUrl}/api/documents/${doc.id}/preview`}
                alt={doc.nama}
                className="max-w-full max-h-[600px] rounded-lg shadow-lg border border-zinc-200 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden flex-col items-center justify-center text-zinc-400">
                <FileText className="w-12 h-12 mb-2" />
                <p className="text-sm">Preview tidak tersedia</p>
              </div>
            </div>
            {/* Preview footer */}
            <div className="px-6 py-3 bg-white border-t border-zinc-100 flex items-center justify-between flex-shrink-0">
              <div>
                <p className="text-sm font-medium text-zinc-900 truncate max-w-[200px]">{doc.nama}</p>
                <p className="text-xs text-zinc-400">{doc.ukuran} · PDF Document</p>
              </div>
              <button onClick={() => window.open(`${api.baseUrl}/api/documents/${doc.id}/download`, '_blank')} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-600 hover:text-[#D49A28] hover:bg-[#D49A28]/5 rounded-lg border border-zinc-200/60 hover:border-[#D49A28]/30 transition-all">
                <Download className="w-3.5 h-3.5" />
                Unduh
              </button>
            </div>
          </div>

          {/* RIGHT: Details sidebar */}
          <div className="w-[340px] flex-shrink-0 overflow-y-auto bg-white">
            <div className="p-5 space-y-5">
              {/* File Info */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{doc.nama}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Diunggah {doc.tanggalUnggah}</p>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Metadata</h3>
                {[
                  { label: 'Perusahaan', value: doc.namaPt },
                  { label: 'Tanggal Surat', value: doc.tanggalSurat },
                  { label: 'Status', value: doc.status === 'verified' ? 'Terverifikasi' : doc.status === 'review' ? 'Perlu Review' : 'Pending' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                    <span className="text-xs text-zinc-500">{item.label}</span>
                    <span className="text-sm font-medium text-zinc-900 text-right">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* AI Result */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Hasil Klasifikasi</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: badge.bg }}>
                    <BadgeIcon className="w-3 h-3" />
                    {badge.label}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <span className="text-xs text-zinc-600">Arah</span>
                    <div className="flex items-center gap-1.5">
                      {doc.arah === 'Masuk' ? <ArrowDownLeft className="w-3.5 h-3.5" style={{ color: '#00AA00' }} /> : <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#DD0000' }} />}
                      <span className="text-sm font-semibold text-zinc-900">{doc.arah}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <span className="text-xs text-zinc-600">Jenis</span>
                    <span className="text-sm font-semibold text-zinc-900">{doc.jenis}</span>
                  </div>
                </div>
              </div>

              {/* Correction */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Koreksi</h3>
                {!correcting ? (
                  <button onClick={() => setCorrecting(true)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-zinc-600 hover:text-[#D49A28] hover:bg-[#D49A28]/5 rounded-lg transition-all border border-zinc-200/60 hover:border-[#D49A28]/30">
                    <Edit3 className="w-4 h-4" />
                    Koreksi Klasifikasi
                  </button>
                ) : (
                  <div className="space-y-3 p-3 rounded-lg border border-[#D49A28]/30 bg-[#D49A28]/5">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1.5">Arah</label>
                      <select value={correction.arah} onChange={(e) => setCorrection({ ...correction, arah: e.target.value })} className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20">
                        <option value="Masuk">Surat Masuk</option>
                        <option value="Keluar">Surat Keluar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1.5">Jenis</label>
                      <select value={correction.jenis} onChange={(e) => setCorrection({ ...correction, jenis: e.target.value })} className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20">
                        {['Surat Masuk', 'Surat Keluar', 'Penawaran', 'Purchase Order', 'Invoice', 'Kontrak', 'Nota Dinas', 'MoU', 'Lainnya'].map((j) => (
                          <option key={j} value={j}>{j}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleCorrect} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#D49A28] text-white text-xs font-medium rounded-lg hover:bg-[#C08A20] transition-colors disabled:opacity-50">
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Simpan
                      </button>
                      <button onClick={() => setCorrecting(false)} className="px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-all">Batal</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ===== MAIN TABLE ===== */
export default function DocumentTable({ documents, selectedIds, onToggleSelect }) {
  const [detailDoc, setDetailDoc] = useState(null);

  const handleCorrect = (docId, correction) => {
    console.log('Corrected:', docId, correction);
  };

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

  const allSelected = documents.length > 0 && documents.every((d) => selectedIds?.has(d.id));

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-8 py-3 w-12">
                <input type="checkbox" checked={allSelected} onChange={() => {
                  documents.forEach((d) => {
                    if (allSelected) onToggleSelect?.(d.id, false);
                    else onToggleSelect?.(d.id, true);
                  });
                }} className="w-4 h-4 rounded border-zinc-300 text-[#D49A28] focus:ring-[#D49A28]/20 cursor-pointer" />
              </th>
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
              const isMasuk = doc.arah === 'Masuk';
              const isSelected = selectedIds?.has(doc.id);

              return (
                <motion.tr
                  key={doc.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border-b border-zinc-50 last:border-0 transition-colors group ${
                    isSelected ? 'bg-[#D49A28]/5' : 'hover:bg-zinc-50/50'
                  }`}
                >
                  <td className="px-8 py-3.5">
                    <input type="checkbox" checked={isSelected} onChange={(e) => onToggleSelect?.(doc.id, e.target.checked)} className="w-4 h-4 rounded border-zinc-300 text-[#D49A28] focus:ring-[#D49A28]/20 cursor-pointer" />
                  </td>
                  <td className="px-8 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200/60 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-200/60 transition-colors">
                        <FileText className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate max-w-[220px]">{doc.nama}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{doc.ukuran}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-3.5 hidden lg:table-cell">
                    <span className="text-sm text-zinc-600 truncate max-w-[180px] block">{doc.namaPt}</span>
                  </td>
                  <td className="px-8 py-3.5 hidden sm:table-cell">
                    <span className="text-sm text-zinc-600 whitespace-nowrap">{doc.tanggalSurat}</span>
                  </td>
                  <td className="px-8 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${                      isMasuk ? 'text-emerald-700 border border-emerald-100' : 'text-red-700 border border-red-100'                    }`} style={{ backgroundColor: isMasuk ? '#E8F5E9' : '#FFEBEE' }}>
                      {isMasuk ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      {doc.arah}
                    </span>
                  </td>
                  <td className="px-8 py-3.5">
                    <span className="text-sm text-zinc-700">{doc.jenis}</span>
                  </td>
                  <td className="px-8 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-white" style={{ backgroundColor: badge.bg, borderColor: badge.border, borderWidth: 1, borderStyle: 'solid' }}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-8 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setDetailDoc(doc)} className="p-2 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600 transition-all" title="Lihat Detail">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-amber-50 text-zinc-400 hover:text-amber-600 transition-all" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-all" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {detailDoc && <DetailPanel doc={detailDoc} onClose={() => setDetailDoc(null)} onCorrect={handleCorrect} />}
    </>
  );
}
