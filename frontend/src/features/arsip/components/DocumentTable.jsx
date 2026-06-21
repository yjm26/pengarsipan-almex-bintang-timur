import { useState } from 'react';
import { FileText, Eye, Pencil, Trash2, ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import DetailPanel from './DetailPanel';

const AKURASI_COLORS = {
  bg: { Akurat: '#00AA00', Cukup: '#D4A000', 'Tidak Akurat': '#DD0000' },
};

function getAkurasiLabel(confidence) {
  if (confidence >= 75) return 'Akurat';
  if (confidence >= 50) return 'Cukup';
  return 'Tidak Akurat';
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function DocumentTable({ documents, total, page, totalPages, onPageChange, onDelete, onUpdate, onSelect, selected }) {
  const [detailDoc, setDetailDoc] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDelete = async (id) => {
    await onDelete(id);
    setConfirmDeleteId(null);
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_160px_120px_80px_120px] gap-2 px-4 py-2.5 bg-zinc-50/80 border-b border-zinc-100">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selected && selected.length === documents.length && documents.length > 0}
              onChange={(e) => onSelect && onSelect(e.target.checked ? documents.map(d => d.id) : [])}
              className="w-3.5 h-3.5 rounded border-zinc-300 accent-amber-500"
            />
          </div>
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">File</span>
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Perusahaan</span>
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Tanggal</span>
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Arah</span>
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider text-right pr-2">Kategori</span>
        </div>

        {/* Table Body */}
        {documents.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">Belum ada dokumen</p>
          </div>
        ) : (
          documents.map((doc) => {
            const isMasuk = doc.arah === 'Masuk';
            const isHovered = hoveredRow === doc.id;
            return (
              <div
                key={doc.id}
                className="grid grid-cols-[40px_1fr_160px_120px_80px_120px] gap-2 px-4 py-2.5 border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group"
                onMouseEnter={() => setHoveredRow(doc.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selected && selected.includes(doc.id)}
                    onChange={(e) => onSelect && onSelect(e.target.checked ? [...selected, doc.id] : selected.filter(id => id !== doc.id))}
                    className="w-3.5 h-3.5 rounded border-zinc-300 accent-amber-500"
                  />
                </div>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-zinc-50 border border-zinc-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-800 truncate">{doc.namaFile}</p>
                    <p className="text-[10px] text-zinc-400">{doc.ukuran}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-zinc-600 truncate">{doc.namaPt || '-'}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-zinc-600">{formatDate(doc.tanggalSurat)}</span>
                </div>
                <div className="flex items-center">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-white"
                    style={{ backgroundColor: isMasuk ? '#00AA00' : '#DD0000' }}
                  >
                    {isMasuk ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    {doc.arah}
                  </span>
                </div>
                <div className="flex items-center justify-end pr-2 gap-1">
                  <span className="text-xs text-zinc-600 truncate">{doc.jenis || '-'}</span>
                  <div className={`flex items-center gap-0.5 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <button onClick={() => setDetailDoc(doc)} className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600" title="Detail">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {confirmDeleteId === doc.id ? (
                      <div className="flex items-center gap-1 ml-1">
                        <span className="text-[10px] text-zinc-500">Yakin?</span>
                        <button onClick={() => handleDelete(doc.id)} className="text-[10px] text-red-600 font-medium px-1.5 py-0.5 bg-red-50 rounded">Ya</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] text-zinc-500 px-1.5 py-0.5 bg-zinc-50 rounded">Batal</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(doc.id)} className="p-1 rounded hover:bg-red-50 text-zinc-400 hover:text-red-500" title="Hapus">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50/50 border-t border-zinc-100">
            <span className="text-xs text-zinc-400">Halaman {page} dari {totalPages}</span>
            <div className="flex items-center gap-1">
              <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="p-1.5 rounded hover:bg-zinc-100 disabled:opacity-30"><ChevronLeft className="w-3.5 h-3.5" /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                return <button key={p} onClick={() => onPageChange(p)} className={`w-7 h-7 rounded text-xs font-medium ${p === page ? 'bg-amber-500 text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}>{p}</button>;
              })}
              <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="p-1.5 rounded hover:bg-zinc-100 disabled:opacity-30"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {detailDoc && (
        <DetailPanel doc={detailDoc} onClose={() => setDetailDoc(null)} onUpdate={onUpdate} onDelete={(id) => { onDelete(id); setDetailDoc(null); }} />
      )}
    </>
  );
}
