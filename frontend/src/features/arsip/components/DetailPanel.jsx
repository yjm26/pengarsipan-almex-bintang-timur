import { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, FileText, Trash2, Save, ExternalLink, Eye, ZoomIn, ZoomOut, Download } from 'lucide-react';
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

function formatDate(d) {
  if (!d) return '-';
  if (d.includes('T')) d = d.split('T')[0];
  try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return d; }
}

function PreviewModal({ doc, onClose }) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  useState(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    fetch(`${API_URL}/api/documents/${doc.id}/preview`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.blob() : Promise.reject())
      .then(blob => { setSrc(URL.createObjectURL(blob)); setLoading(false); })
      .catch(() => setLoading(false));
  });

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-[90vw] max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-zinc-900">{doc.namaFile || doc.nama_file}</span>
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
  const [form, setForm] = useState({
    nama_pt: doc.namaPt || doc.nama_pt || '',
    tanggal_surat: (doc.tanggalSurat || doc.tanggal_surat || '').split('T')[0] || '',
    arah: doc.arah || '',
    jenis: doc.jenis || ''
  });
  const [saving, setSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const isMasuk = doc.arah === 'Masuk';
  const akurasi = getAkurasiLabel(doc.confidence);
  const badgeColor = getAkurasiColor(doc.confidence);

  async function handleSave() {
    setSaving(true);
    try {
      await api.updateDocument(doc.id, form);
      onUpdate(doc.id, form);
      setEditing(false);
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {showPreview && <PreviewModal doc={doc} onClose={() => setShowPreview(false)} />}
      <div className="w-[340px] flex-shrink-0 border-l border-zinc-100 bg-white overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <h3 className="text-sm font-semibold text-zinc-900">Detail Dokumen</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-all"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* File Info */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center"><FileText className="w-4 h-4 text-red-400" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900 truncate">{doc.namaFile || doc.nama_file}</p>
              <p className="text-xs text-zinc-400 mt-0.5">Diunggah {doc.tanggalUnggah ? new Date(doc.tanggalUnggah).toLocaleDateString('id-ID') : '-'}</p>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Metadata</h4>
            <div className="space-y-2">
              {[
                ['Perusahaan', 'nama_pt'],
                ['Tanggal Surat', 'tanggal_surat'],
                ['Status', 'status'],
              ].map(([label, key]) => (
                <div key={key} className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-50">
                  <span className="text-xs text-zinc-500">{label}</span>
                  {editing && key !== 'status' ? (
                    key === 'tanggal_surat' ? (
                      <input type="date" value={form.tanggal_surat} onChange={(e) => setForm({ ...form, tanggal_surat: e.target.value })} className="text-xs text-zinc-900 bg-white border border-zinc-200 rounded px-2 py-1 w-36" />
                    ) : (
                      <input type="text" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="text-xs text-zinc-900 bg-white border border-zinc-200 rounded px-2 py-1 w-36" />
                    )
                  ) : (
                    <span className="text-xs font-semibold text-zinc-900">{key === 'tanggal_surat' ? formatDate(doc.tanggalSurat || doc.tanggal_surat) : (doc.namaPt || doc.nama_pt || doc[key] || '-')}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hasil Klasifikasi */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Hasil Klasifikasi</h4>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: badgeColor }}>{akurasi}</span>
            </div>
            <div className="space-y-2">
              <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${isMasuk ? 'bg-emerald-50/50 border border-emerald-100' : 'bg-red-50/50 border border-red-100'}`}>
                <span className="text-xs text-zinc-600">Arah</span>
                <div className="flex items-center gap-1.5">
                  {isMasuk ? <ArrowDownLeft className="w-3.5 h-3.5" style={{ color: '#00AA00' }} /> : <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#DD0000' }} />}
                  {editing ? (
                    <select value={form.arah} onChange={(e) => setForm({ ...form, arah: e.target.value })} className="text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 rounded px-2 py-1">
                      <option value="Masuk">Masuk</option>
                      <option value="Keluar">Keluar</option>
                    </select>
                  ) : (
                    <span className="text-sm font-semibold text-zinc-900">{doc.arah}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-blue-50/50 border border-blue-100">
                <span className="text-xs text-zinc-600">Jenis</span>
                {editing ? (
                  <select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })} className="text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 rounded px-2 py-1 w-32">
                    {['Purchase Order', 'Invoice', 'Surat Penawaran', 'Surat Jalan', 'Nota Dinas', 'Kontrak', 'Batal Order', 'MoU', 'Lainnya'].map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm font-semibold text-zinc-900">{doc.jenis || '-'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-60" style={{ backgroundColor: '#C49A38' }}>
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-all">Batal</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-all">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => setShowPreview(true)} className="p-2.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 border border-zinc-200 transition-all" title="Preview">
                  <Eye className="w-3.5 h-3.5" />
                </button>
                {showConfirmDelete ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-500">Yakin?</span>
                    <button onClick={() => onDelete(doc.id)} className="text-[10px] text-red-600 font-medium px-2 py-1 bg-red-50 rounded">Ya</button>
                    <button onClick={() => setShowConfirmDelete(false)} className="text-[10px] text-zinc-500 px-2 py-1 bg-zinc-50 rounded">Batal</button>
                  </div>
                ) : (
                  <button onClick={() => setShowConfirmDelete(true)} className="p-2.5 rounded-xl hover:bg-red-50 text-zinc-400 hover:text-red-500 border border-zinc-200 transition-all" title="Hapus">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Download Button (wide) */}
          <a href={`${API_URL}/api/documents/${doc.id}/download`} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-all">
            <ExternalLink className="w-3.5 h-3.5" /> Download
          </a>
        </div>
      </div>
    </>
  );
}
