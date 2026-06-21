import { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, FileText, Trash2, Save, Pencil, Download, Eye, ZoomIn, ZoomOut } from 'lucide-react';
import api from '../../../lib/api';

const API_URL = import.meta.env.VITE_API_URL || '';

function getAkurasiLabel(confidence) {
  if (confidence >= 75) return 'Akurat';
  if (confidence >= 50) return 'Cukup';
  return 'Tidak Akurat';
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  if (dateStr.includes('T')) dateStr = dateStr.split('T')[0];
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function PreviewModal({ doc, onClose }) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    fetch(`${API_URL}/api/documents/${doc.id}/preview`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.blob() : Promise.reject())
      .then(blob => { setSrc(URL.createObjectURL(blob)); setLoading(false); })
      .catch(() => setLoading(false));
    return () => { if (src) URL.revokeObjectURL(src); };
  }, [doc.id]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-[90vw] max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-zinc-900">{doc.namaFile}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-xs text-zinc-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500"><ZoomIn className="w-4 h-4" /></button>
            <a href={`${API_URL}/api/documents/${doc.id}/download`} className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500"><Download className="w-4 h-4" /></a>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-zinc-100">
          {loading ? (
            <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" /></div>
          ) : src ? (
            <img src={src} alt="Preview" className="mx-auto transition-transform duration-200" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }} />
          ) : (
            <div className="flex items-center justify-center h-64 text-zinc-400 text-sm">Preview tidak tersedia</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DetailPanel({ doc, onClose, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama_pt: doc.namaPt || '',
    tanggal_surat: doc.tanggalSurat ? doc.tanggalSurat.split('T')[0] : '',
    jenis: doc.jenis || '',
    arah: doc.arah || 'Masuk',
  });
  const [saving, setSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const isMasuk = doc.arah === 'Masuk';
  const akurasi = getAkurasiLabel(doc.confidence);
  const badgeColor = akurasi === 'Akurat' ? '#00AA00' : akurasi === 'Cukup' ? '#D4A000' : '#DD0000';

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

  return (
    <>
      {showPreview && <PreviewModal doc={doc} onClose={() => setShowPreview(false)} />}
      <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={onClose}>
        <div className="w-full max-w-md bg-white h-full shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded">
                <span className="text-zinc-400 text-sm">&gt;</span>
              </button>
              <span className="text-sm font-semibold text-zinc-900">Detail Dokumen</span>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded">
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          {/* File Info */}
          <div className="p-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">{doc.namaFile}</p>
                <p className="text-xs text-zinc-400 mt-0.5">Diunggah {doc.tanggalUnggah ? new Date(doc.tanggalUnggah).toLocaleDateString('id-ID') : '-'}</p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="px-4 pb-4 space-y-3">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Metadata</p>
            <div className="space-y-2">
              <MetaRow label="Perusahaan" value={editing ? <input type="text" value={formData.nama_pt} onChange={(e) => setFormData({ ...formData, nama_pt: e.target.value })} className="w-full text-xs p-1.5 border border-zinc-200 rounded" /> : (doc.namaPt || '-')} />
              <MetaRow label="Tanggal Surat" value={editing ? <input type="date" value={formData.tanggal_surat} onChange={(e) => setFormData({ ...formData, tanggal_surat: e.target.value })} className="w-full text-xs p-1.5 border border-zinc-200 rounded" /> : formatDate(doc.tanggalSurat)} />
              <MetaRow label="Status" value={<span className="text-xs font-medium text-zinc-600">{doc.status || 'Pending'}</span>} />
            </div>
          </div>

          {/* Hasil Klasifikasi */}
          <div className="px-4 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Hasil Klasifikasi</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white" style={{ backgroundColor: badgeColor }}>
                {akurasi}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                <p className="text-[10px] text-zinc-400 mb-1">Arah</p>
                <div className="flex items-center gap-1.5">
                  {isMasuk ? <ArrowDownLeft className="w-3.5 h-3.5" style={{ color: '#00AA00' }} /> : <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#DD0000' }} />}
                  <span className="text-sm font-semibold text-zinc-900">{doc.arah}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                <p className="text-[10px] text-zinc-400 mb-1">Jenis</p>
                <p className="text-sm font-semibold text-zinc-900">{doc.jenis || '-'}</p>
              </div>
            </div>
          </div>

          {/* Edit Section (when editing) */}
          {editing && (
            <div className="px-4 pb-4">
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400">Jenis</label>
                    <select value={formData.jenis} onChange={(e) => setFormData({ ...formData, jenis: e.target.value })} className="w-full text-xs p-1.5 border border-zinc-200 rounded bg-white">
                      {['Purchase Order', 'Invoice', 'Surat Penawaran', 'Surat Jalan', 'Nota Dinas', 'Kontrak', 'Batal Order', 'MoU', 'Lainnya'].map(j => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400">Arah</label>
                    <select value={formData.arah} onChange={(e) => setFormData({ ...formData, arah: e.target.value })} className="w-full text-xs p-1.5 border border-zinc-200 rounded bg-white">
                      <option value="Masuk">Masuk</option>
                      <option value="Keluar">Keluar</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-4 pb-4 flex items-center gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium">
                  <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50">Batal</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium">
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => setShowPreview(true)} className="p-2.5 rounded-lg border border-zinc-200 hover:bg-zinc-50" title="Preview">
                  <Eye className="w-4 h-4 text-zinc-500" />
                </button>
                {showConfirmDelete ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-500">Yakin?</span>
                    <button onClick={() => onDelete(doc.id)} className="text-xs text-red-600 font-medium px-2 py-1 bg-red-50 rounded">Ya</button>
                    <button onClick={() => setShowConfirmDelete(false)} className="text-xs text-zinc-500 px-2 py-1 bg-zinc-50 rounded">Batal</button>
                  </div>
                ) : (
                  <button onClick={() => setShowConfirmDelete(true)} className="p-2.5 rounded-lg border border-zinc-200 hover:bg-red-50 text-zinc-400 hover:text-red-500" title="Hapus">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Download Button (wide) */}
          <div className="px-4 pb-6">
            <a href={`${API_URL}/api/documents/${doc.id}/download`} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-sm text-zinc-600">
              <Download className="w-4 h-4" /> Download
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-50">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-xs font-medium text-zinc-900">{value}</span>
    </div>
  );
}
