import { useState, useEffect } from 'react';
import { FileText, Eye, Pencil, Trash2, ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Download, X } from 'lucide-react';
import api from '../../../lib/api';

const API_URL = import.meta.env.VITE_API_URL || '';

function getAkurasiLabel(confidence) {
  if (confidence >= 75) return 'Akurat';
  if (confidence >= 50) return 'Cukup';
  return 'Tidak Akurat';
}

function getAkurasiColor(confidence) {
  if (confidence >= 75) return '#00AA00';
  if (confidence >= 50) return '#D4A000';
  return '#DD0000';
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  if (dateStr.includes('T')) dateStr = dateStr.split('T')[0];
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function InlineDetail({ doc, onClose, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama_pt: doc.namaPt || '',
    tanggal_surat: doc.tanggalSurat ? doc.tanggalSurat.split('T')[0] : '',
    jenis: doc.jenis || '',
    arah: doc.arah || 'Masuk',
  });
  const [saving, setSaving] = useState(false);
  const [showKoreksi, setShowKoreksi] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateDocument(doc.id, formData);
      onUpdate(doc.id, formData);
      setEditing(false);
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleKoreksi = async () => {
    try {
      await api.updateDocument(doc.id, { jenis: formData.jenis, arah: formData.arah });
      onUpdate(doc.id, { jenis: formData.jenis, arah: formData.arah });
      setShowKoreksi(false);
    } catch (err) {
      alert('Gagal koreksi: ' + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(doc.id);
      onClose();
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const previewUrl = `${API_URL}/api/documents/${doc.id}/preview`;
  const [previewSrc, setPreviewSrc] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const isMasuk = doc.arah === 'Masuk';
  const akurasi = getAkurasiLabel(doc.confidence);

  // Fetch preview with auth header (img src can't send Authorization)
  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('token');
    if (!token) { setPreviewLoading(false); return; }
    
    fetch(previewUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.blob() : Promise.reject())
      .then(blob => {
        if (!cancelled) {
          setPreviewSrc(URL.createObjectURL(blob));
          setPreviewLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => { cancelled = true; if (previewSrc) URL.revokeObjectURL(previewSrc); };
  }, [doc.id]);

  return (
    <tr>
      <td colSpan={7} className="p-0">
        <div className="bg-zinc-50/50 border-t border-b border-zinc-200 px-6 py-4">
          <div className="grid grid-cols-[1fr_280px] gap-6">
            {/* Left: Document Preview */}
            <div className="space-y-3">
              <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Preview Dokumen</div>
              <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden relative" style={{ height: 320 }}>
                {previewLoading ? (
                  <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-500 rounded-full animate-spin" /></div>
                ) : previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-300">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-xs">Preview tidak tersedia</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Metadata + Actions */}
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-zinc-200">
                <div className="w-8 h-8 rounded-md bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 truncate">{doc.namaFile}</p>
                  <p className="text-[10px] text-zinc-400">{doc.ukuran}</p>
                </div>
                <a href={`${API_URL}/api/documents/${doc.id}/download`} target="_blank" rel="noopener" className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-600">
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Metadata */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Metadata</div>
                {editing ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 w-20">Perusahaan</span>
                      <input type="text" value={formData.nama_pt} onChange={(e) => setFormData({...formData, nama_pt: e.target.value})} className="flex-1 text-xs p-1.5 border border-zinc-200 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 w-20">Tanggal</span>
                      <input type="date" value={formData.tanggal_surat} onChange={(e) => setFormData({...formData, tanggal_surat: e.target.value})} className="flex-1 text-xs p-1.5 border border-zinc-200 rounded" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[10px] text-zinc-500">Perusahaan</span>
                      <span className="text-xs font-medium text-zinc-800">{doc.namaPt || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-t border-zinc-100">
                      <span className="text-[10px] text-zinc-500">Tanggal Surat</span>
                      <span className="text-xs text-zinc-800">{formatDate(doc.tanggalSurat)}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between py-1 border-t border-zinc-100">
                  <span className="text-[10px] text-zinc-500">Status</span>
                  <span className="text-xs font-medium text-zinc-600">{doc.status || 'Pending'}</span>
                </div>
              </div>

              {/* Klasifikasi */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Hasil Klasifikasi</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded text-white" style={{ backgroundColor: getAkurasiColor(doc.confidence) }}>
                    {akurasi}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-white border border-zinc-200">
                    <p className="text-[10px] text-zinc-500 mb-0.5">Arah</p>
                    <p className="text-xs font-semibold" style={{ color: isMasuk ? '#00AA00' : '#DD0000' }}>{doc.arah}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-zinc-200">
                    <p className="text-[10px] text-zinc-500 mb-0.5">Jenis</p>
                    <p className="text-xs font-semibold text-blue-600">{doc.jenis || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Koreksi */}
              {showKoreksi && (
                <div className="p-2.5 rounded-lg bg-white border border-zinc-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 w-12">Jenis</span>
                    <select value={formData.jenis} onChange={(e) => setFormData({...formData, jenis: e.target.value})} className="flex-1 text-xs p-1.5 border border-zinc-200 rounded">
                      <option value="Purchase Order">Purchase Order</option>
                      <option value="Invoice">Invoice</option>
                      <option value="Surat Penawaran">Surat Penawaran</option>
                      <option value="Nota Dinas">Nota Dinas</option>
                      <option value="Kontrak">Kontrak</option>
                      <option value="Surat Jalan">Surat Jalan</option>
                      <option value="Batal Order">Batal Order</option>
                      <option value="MoU">MoU</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 w-12">Arah</span>
                    <select value={formData.arah} onChange={(e) => setFormData({...formData, arah: e.target.value})} className="flex-1 text-xs p-1.5 border border-zinc-200 rounded">
                      <option value="Masuk">Masuk</option>
                      <option value="Keluar">Keluar</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleKoreksi} className="flex-1 text-xs font-medium py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600">Simpan</button>
                    <button onClick={() => setShowKoreksi(false)} className="text-xs px-3 py-1.5 bg-zinc-100 rounded hover:bg-zinc-200">Batal</button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {editing ? (
                  <>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 disabled:opacity-50">
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg bg-zinc-100 text-xs text-zinc-600 hover:bg-zinc-200">Batal</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => setShowKoreksi(!showKoreksi)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
                      <Pencil className="w-3 h-3" /> Koreksi
                    </button>
                    {confirmDelete ? (
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-[10px] text-zinc-500">Yakin?</span>
                        <button onClick={handleDelete} className="text-[10px] text-red-600 font-medium px-2 py-1 bg-red-50 rounded">Ya, Hapus</button>
                        <button onClick={() => setConfirmDelete(false)} className="text-[10px] text-zinc-500 px-2 py-1 bg-zinc-50 rounded">Batal</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-100 text-xs font-medium text-red-600 hover:bg-red-50 ml-auto">
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function DocumentTable({ documents, total, page, totalPages, onPageChange, onDelete, onUpdate, onSelect, selected }) {
  const [expandedId, setExpandedId] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDelete = async (id) => {
    await onDelete(id);
    setConfirmDeleteId(null);
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-zinc-50/80 border-b border-zinc-100">
            <th className="w-10 px-2 py-2.5">
              <input
                type="checkbox"
                checked={selected && selected.length === documents.length && documents.length > 0}
                onChange={(e) => onSelect && onSelect(e.target.checked ? documents.map(d => d.id) : [])}
                className="w-3.5 h-3.5 rounded border-zinc-300 accent-amber-500"
              />
            </th>
            <th className="text-left px-3 py-2.5 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">File</th>
            <th className="text-left px-3 py-2.5 text-[10px] font-medium text-zinc-400 uppercase tracking-wider w-40">Perusahaan</th>
            <th className="text-left px-3 py-2.5 text-[10px] font-medium text-zinc-400 uppercase tracking-wider w-32">Tanggal</th>
            <th className="text-left px-3 py-2.5 text-[10px] font-medium text-zinc-400 uppercase tracking-wider w-20">Arah</th>
            <th className="text-right px-3 py-2.5 text-[10px] font-medium text-zinc-400 uppercase tracking-wider w-32">Kategori</th>
          </tr>
        </thead>
        <tbody>
          {documents.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-16 text-center">
                <FileText className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">Belum ada dokumen</p>
              </td>
            </tr>
          ) : (
            documents.map((doc) => {
              const isMasuk = doc.arah === 'Masuk';
              const isExpanded = expandedId === doc.id;
              const isHovered = hoveredRow === doc.id;
              return (
                <>
                  <tr
                    key={doc.id}
                    className={`border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group ${isExpanded ? 'bg-zinc-50/80' : ''}`}
                    onMouseEnter={() => setHoveredRow(doc.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-2 py-2.5">
                      <input
                        type="checkbox"
                        checked={selected && selected.includes(doc.id)}
                        onChange={(e) => onSelect && onSelect(e.target.checked ? [...selected, doc.id] : selected.filter(id => id !== doc.id))}
                        className="w-3.5 h-3.5 rounded border-zinc-300 accent-amber-500"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3 h-3 text-zinc-400" />
                        </div>
                        <span className="text-xs font-medium text-zinc-800 truncate">{doc.namaFile}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-zinc-600 truncate block max-w-[150px]">{doc.namaPt || '-'}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-zinc-600">{formatDate(doc.tanggalSurat)}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-white"
                        style={{ backgroundColor: isMasuk ? '#00AA00' : '#DD0000' }}
                      >
                        {isMasuk ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {doc.arah}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-zinc-600 truncate max-w-[100px]">{doc.jenis || '-'}</span>
                        <div className={`flex items-center gap-0.5 transition-opacity ${isHovered || isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                          <button onClick={() => setExpandedId(isExpanded ? null : doc.id)} className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600" title="Detail">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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
                    </td>
                  </tr>
                  {isExpanded && (
                    <InlineDetail
                      doc={doc}
                      onClose={() => setExpandedId(null)}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                    />
                  )}
                </>
              );
            })
          )}
        </tbody>
      </table>

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
  );
}
