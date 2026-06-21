import { useState } from 'react';
import { FileText, Eye, Trash2, ArrowDownLeft, ArrowUpRight, Download, X, Pencil } from 'lucide-react';
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

function formatSize(bytes) {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Side Panel (right)
function DetailPanel({ doc, onClose, onUpdate, onDelete }) {
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

  const isMasuk = doc.arah === 'Masuk';
  const akurasi = getAkurasiLabel(doc.confidence);

  return (
    <div className="fixed top-0 right-0 h-full w-[360px] bg-white border-l border-zinc-200 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <h3 className="text-sm font-semibold text-zinc-900">Detail Dokumen</h3>
        <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* File Info */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
          <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 truncate">{doc.namaFile}</p>
            <p className="text-xs text-zinc-400">{formatSize(doc.ukuran)} · Diunggah {formatDate(doc.tanggalUnggah)}</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Metadata</div>
          {editing ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-24">Perusahaan</span>
                <input
                  value={formData.nama_pt}
                  onChange={(e) => setFormData({ ...formData, nama_pt: e.target.value })}
                  className="flex-1 text-xs px-2 py-1.5 rounded border border-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-24">Tanggal Surat</span>
                <input
                  type="date"
                  value={formData.tanggal_surat}
                  onChange={(e) => setFormData({ ...formData, tanggal_surat: e.target.value })}
                  className="flex-1 text-xs px-2 py-1.5 rounded border border-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-24">Jenis</span>
                <input
                  value={formData.jenis}
                  onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                  className="flex-1 text-xs px-2 py-1.5 rounded border border-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-24">Arah</span>
                <select
                  value={formData.arah}
                  onChange={(e) => setFormData({ ...formData, arah: e.target.value })}
                  className="flex-1 text-xs px-2 py-1.5 rounded border border-zinc-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Masuk">Masuk</option>
                  <option value="Keluar">Keluar</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 rounded-lg hover:bg-zinc-100">
                  Batal
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-50">
                <span className="text-xs text-zinc-500">Perusahaan</span>
                <span className="text-xs font-medium text-zinc-900">{doc.namaPt || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-50">
                <span className="text-xs text-zinc-500">Tanggal Surat</span>
                <span className="text-xs font-medium text-zinc-900">{formatDate(doc.tanggalSurat)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-50">
                <span className="text-xs text-zinc-500">Status</span>
                <span className="text-xs font-medium text-zinc-900 capitalize">{doc.status || 'pending'}</span>
              </div>
            </>
          )}
        </div>

        {/* Hasil Klasifikasi */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Hasil Klasifikasi</div>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white"
              style={{ backgroundColor: getAkurasiColor(doc.confidence) }}
            >
              {akurasi}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg border border-zinc-100">
              <span className="text-[10px] text-zinc-400">Arah</span>
              <div className="flex items-center gap-1.5 mt-1">
                {isMasuk ? (
                  <ArrowDownLeft className="w-3.5 h-3.5" style={{ color: '#00AA00' }} />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#DD0000' }} />
                )}
                <span className="text-sm font-semibold text-zinc-900">{doc.arah}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-zinc-100">
              <span className="text-[10px] text-zinc-400">Jenis</span>
              <p className="text-sm font-semibold text-zinc-900 mt-1">{doc.jenis || '-'}</p>
            </div>
          </div>
        </div>

        {/* Koreksi */}
        {!showKoreksi ? (
          <button
            onClick={() => setShowKoreksi(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Koreksi Klasifikasi
          </button>
        ) : (
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 space-y-2">
            <div className="text-[10px] font-semibold text-amber-700">Koreksi Klasifikasi</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-500">Jenis</label>
                <select
                  value={formData.jenis}
                  onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                  className="w-full text-xs px-2 py-1.5 rounded border border-zinc-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Purchase Order">Purchase Order</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Surat Penawaran">Surat Penawaran</option>
                  <option value="Nota Dinas">Nota Dinas</option>
                  <option value="Surat Jalan">Surat Jalan</option>
                  <option value="Batal Order">Batal Order</option>
                  <option value="Kontrak">Kontrak</option>
                  <option value="MoU">MoU</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500">Arah</label>
                <select
                  value={formData.arah}
                  onChange={(e) => setFormData({ ...formData, arah: e.target.value })}
                  className="w-full text-xs px-2 py-1.5 rounded border border-zinc-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Masuk">Masuk</option>
                  <option value="Keluar">Keluar</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleKoreksi} className="flex-1 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                Simpan Koreksi
              </button>
              <button onClick={() => setShowKoreksi(false)} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 rounded-lg hover:bg-zinc-100">
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-zinc-100 flex items-center gap-2">
        <a
          href={`${API_URL}/api/documents/${doc.id}/download`}
          target="_blank"
          rel="noopener"
          className="flex-1 flex items-center justify-center gap-2 py-2 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Unduh
        </a>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        )}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2 border border-red-200 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Hapus"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleDelete}
            className="p-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors text-[10px] font-medium"
          >
            Yakin?
          </button>
        )}
      </div>
    </div>
  );
}

// Main Table Component
export default function DocumentTable({ documents, selected, onSelect, onDelete, onUpdate }) {
  const [detailDoc, setDetailDoc] = useState(null);

  const handleUpdate = (id, updates) => {
    if (onUpdate) onUpdate(id, updates);
    // Also update the detail panel if it's the same doc
    if (detailDoc && detailDoc.id === id) {
      setDetailDoc(prev => ({ ...prev, ...updates }));
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
        {/* Table Header */}
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50/80 border-b border-zinc-100">
              <th className="px-2 py-2.5 w-10">
                <input
                  type="checkbox"
                  checked={selected && selected.length === documents.length && documents.length > 0}
                  onChange={(e) => onSelect && onSelect(e.target.checked ? documents.map(d => d.id) : [])}
                  className="w-3.5 h-3.5 rounded border-zinc-300 accent-amber-500"
                />
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] font-medium text-zinc-400 uppercase tracking-wider">File</th>
              <th className="px-3 py-2.5 text-left text-[10px] font-medium text-zinc-400 uppercase tracking-wider w-[180px]">Perusahaan</th>
              <th className="px-3 py-2.5 text-left text-[10px] font-medium text-zinc-400 uppercase tracking-wider w-[140px]">Tanggal</th>
              <th className="px-3 py-2.5 text-left text-[10px] font-medium text-zinc-400 uppercase tracking-wider w-[100px]">Arah</th>
              <th className="px-3 py-2.5 text-left text-[10px] font-medium text-zinc-400 uppercase tracking-wider w-[140px]">Kategori</th>
              <th className="px-3 py-2.5 w-20"></th>
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
                return (
                  <tr
                    key={doc.id}
                    className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                    onClick={() => setDetailDoc(doc)}
                  >
                    <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
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
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-zinc-800 truncate block max-w-[200px]">{doc.namaFile}</span>
                          <span className="text-[10px] text-zinc-400">{formatSize(doc.ukuran)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-zinc-600 truncate block max-w-[160px]">{doc.namaPt || '-'}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-zinc-600">{formatDate(doc.tanggalSurat)}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white"
                        style={{ backgroundColor: isMasuk ? '#00AA00' : '#DD0000' }}
                      >
                        {isMasuk ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {doc.arah}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-zinc-600 truncate block max-w-[120px]">{doc.jenis || '-'}</span>
                    </td>
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setDetailDoc(doc)}
                          className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Side Panel */}
      {detailDoc && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setDetailDoc(null)} />
          <DetailPanel
            doc={detailDoc}
            onClose={() => setDetailDoc(null)}
            onUpdate={handleUpdate}
            onDelete={onDelete}
          />
        </>
      )}
    </>
  );
}
