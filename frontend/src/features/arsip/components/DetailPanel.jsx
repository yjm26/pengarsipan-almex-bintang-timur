import { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, FileText, Trash2, Save, ExternalLink, ZoomIn, ZoomOut, Pencil, Eye } from 'lucide-react';
import api from '../../../lib/api';

const AKURASI_COLORS = {
  bg: { Akurat: '#00AA00', Cukup: '#D4A000', 'Tidak Akurat': '#DD0000' },
  label: { Akurat: 'Akurat', Cukup: 'Cukup', 'Tidak Akurat': 'Tidak Akurat' },
};

function getBadge(c) {
  const pct = Math.round((c || 0) * 100);
  if (pct >= 75) return { label: 'Akurat', bg: AKURASI_COLORS.bg.Akurat };
  if (pct >= 50) return { label: 'Cukup', bg: AKURASI_COLORS.bg.Cukup };
  return { label: 'Tidak Akurat', bg: AKURASI_COLORS.bg['Tidak Akurat'] };
}

function formatDate(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return d; }
}

export default function DetailPanel({ doc, onClose, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nama_pt: doc.nama_pt || '', tanggal_surat: doc.tanggal_surat?.split('T')[0] || '', arah: doc.arah || '', jenis: doc.jenis || '' });
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const badge = getBadge(doc.confidence);
  const isMasuk = doc.arah === 'Masuk';
  const previewUrl = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/documents/${doc.id}/preview`;
  const downloadUrl = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/documents/${doc.id}/download`;

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await api.updateDocument(doc.id, form);
      onUpdate(updated);
      setEditing(false);
    } catch (err) {
      console.error('Gagal menyimpan:', err);
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm('Hapus dokumen ini?')) return;
    try {
      await api.deleteDocument(doc.id);
      onDelete(doc.id);
    } catch (err) {
      console.error('Gagal menghapus:', err);
    }
  }

  return (
    <>
      <div className="w-[340px] flex-shrink-0 border-l border-zinc-100 bg-white overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <h3 className="text-sm font-semibold text-zinc-900">Detail Dokumen</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-all"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center"><FileText className="w-4 h-4 text-red-400" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900 truncate">{doc.nama_file}</p>
              <p className="text-xs text-zinc-400 mt-0.5">Diunggah {doc.tanggal_unggah}</p>
            </div>
          </div>
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
                    <span className="text-xs font-semibold text-zinc-900">{key === 'tanggal_surat' ? formatDate(doc.tanggal_surat) : doc[key] || '-'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Klasifikasi</h4>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: badge.bg }}>{badge.label}</span>
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
                  <input type="text" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })} className="text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 rounded px-2 py-1 w-32" />
                ) : (
                  <span className="text-sm font-semibold text-zinc-900">{doc.jenis}</span>
                )}
              </div>
            </div>
          </div>
          {/* 3 tombol: Edit / Preview / Delete */}
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
                <button onClick={() => setEditing(true)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-all">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => setPreviewOpen(true)} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-all">
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button onClick={handleDelete} className="p-2.5 rounded-xl hover:bg-red-50 text-zinc-400 hover:text-red-500 border border-zinc-200 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </>
            )}
          </div>
          {/* Download lebar di bawah */}
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-all">
            <ExternalLink className="w-3.5 h-3.5" /> Download
          </a>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => { setPreviewOpen(false); setZoom(1); }}>
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3 justify-center">
              <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-all"><ZoomOut className="w-4 h-4" /></button>
              <span className="text-xs text-white font-medium px-2">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-all"><ZoomIn className="w-4 h-4" /></button>
              <button onClick={() => { setPreviewOpen(false); setZoom(1); }} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-all ml-2"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-auto max-h-[80vh] rounded-xl bg-white">
              <img
                src={previewUrl}
                alt={doc.nama_file}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                className="max-w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
