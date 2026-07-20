import { useEffect, useState } from 'react';
import { Download, Eye, Save, Trash2, X } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext.jsx';
import PreviewModal from './PreviewModal';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatUploadDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function confidenceLabel(value) {
  const pct = Math.round((value || 0) * 100);
  if (pct >= 90) return `${pct}%`;
  if (pct >= 75) return `${pct}%`;
  return `${pct}%`;
}

function DetailRow({ label, value, editing, children }) {
  return (
    <div className="grid min-h-9 grid-cols-[120px_1fr] items-center border-b border-[#eaeae8] px-2.5 last:border-b-0">
      <span className="text-[11px] text-[var(--almex-text-3)]">{label}</span>
      <div className="min-w-0 text-right text-xs font-medium text-[var(--almex-text)]">
        {editing ? children : value || '-'}
      </div>
    </div>
  );
}

export default function DetailPanel({ doc, onClose, onUpdate, onDelete }) {
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({
    nama_pt: doc.nama_pt || '',
    tanggal_surat: doc.tanggal_surat?.split('T')[0] || '',
    arah: doc.arah || 'Masuk',
    jenis: doc.jenis || '',
  });

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const inputClass = 'h-8 w-full rounded-md border border-[var(--almex-border)] bg-white px-2 text-right text-xs text-[var(--almex-text)] outline-none focus:border-[#b8b3ff] focus:ring-2 focus:ring-[rgba(75,60,255,0.08)]';

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(doc.id, {
      ...form,
      nama_pt: form.nama_pt || null,
      tanggal_surat: form.tanggal_surat || null,
    });
    setSaving(false);
    setEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(doc.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDownload = async () => {
    try {
      const res = await api.request(`/api/documents/${doc.id}/download`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.nama_file;
      link.click();
      URL.revokeObjectURL(url);
      addToast(`"${doc.nama_file}" berhasil diunduh`, 'success');
    } catch (err) {
      addToast('Gagal download: ' + err.message, 'error');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-5" onClick={onClose}>
        <section
          className="w-full max-w-[720px] overflow-hidden rounded-[12px] border border-[var(--almex-border)] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.16)]"
          onClick={(event) => event.stopPropagation()}
          aria-label="Detail dokumen"
        >
          <div className="flex h-[54px] items-center justify-between border-b border-[var(--almex-border)] px-4">
            <h2 className="text-[15px] font-semibold text-[var(--almex-text)]">Detail Dokumen</h2>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md border border-[var(--almex-border)] bg-white text-[var(--almex-text-2)] hover:bg-[var(--almex-muted)]" aria-label="Tutup detail">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <div className="sm:col-span-2 rounded-[9px] border border-[var(--almex-border)] bg-[#fafaf9] p-3">
              <p className="truncate text-[13px] font-medium text-[var(--almex-text)]">{doc.nama_file}</p>
              <p className="mt-1 text-[11px] text-[var(--almex-text-3)]">Diunggah {formatUploadDate(doc.tanggal_unggah)}</p>
            </div>

            <section>
              <h3 className="mb-2 text-[11px] font-semibold text-[var(--almex-text-3)]">Metadata</h3>
              <div className="overflow-hidden rounded-[9px] border border-[var(--almex-border)]">
                <DetailRow label="Perusahaan" value={doc.nama_pt} editing={editing}>
                  <input value={form.nama_pt} onChange={(event) => setForm({ ...form, nama_pt: event.target.value })} className={inputClass} />
                </DetailRow>
                <DetailRow label="Tanggal Surat" value={formatDate(doc.tanggal_surat)} editing={editing}>
                  <input type="date" value={form.tanggal_surat} onChange={(event) => setForm({ ...form, tanggal_surat: event.target.value })} className={inputClass} />
                </DetailRow>
                <DetailRow label="Status" value={doc.status || '-'} />
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-[11px] font-semibold text-[var(--almex-text-3)]">Klasifikasi</h3>
              <div className="overflow-hidden rounded-[9px] border border-[var(--almex-border)]">
                <DetailRow label="Arah" value={doc.arah} editing={editing}>
                  <select value={form.arah} onChange={(event) => setForm({ ...form, arah: event.target.value })} className={inputClass}>
                    <option value="Masuk">Masuk</option>
                    <option value="Keluar">Keluar</option>
                  </select>
                </DetailRow>
                <DetailRow label="Jenis" value={doc.jenis} editing={editing}>
                  <input value={form.jenis} onChange={(event) => setForm({ ...form, jenis: event.target.value })} className={inputClass} />
                </DetailRow>
                <DetailRow label="Akurasi" value={confidenceLabel(doc.confidence)} />
              </div>
            </section>
          </div>

          {showDeleteConfirm && (
            <div className="border-t border-[var(--almex-border)] bg-[#fafaf9] px-4 py-3">
              <p className="text-xs text-[var(--almex-text-2)]">Dokumen akan dihapus permanen dari arsip.</p>
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-3 text-xs font-medium text-[var(--almex-text-2)]">Batal</button>
                <button onClick={handleDelete} className="h-8 rounded-md border border-[#7f1d1d] bg-[#7f1d1d] px-3 text-xs font-medium text-white">Hapus</button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-[var(--almex-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={saving} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--almex-ink)] bg-[var(--almex-ink)] px-3 text-xs font-medium text-white disabled:opacity-60">
                    <Save className="h-3.5 w-3.5" />{saving ? 'Menyimpan' : 'Simpan'}
                  </button>
                  <button onClick={() => setEditing(false)} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-3 text-xs font-medium text-[var(--almex-text-2)]">Batal</button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-3 text-xs font-medium text-[var(--almex-text-2)]">Edit</button>
              )}
              <button onClick={() => setShowPreview(true)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--almex-border)] bg-white px-3 text-xs font-medium text-[var(--almex-text-2)]">
                <Eye className="h-3.5 w-3.5" />Preview
              </button>
              <button onClick={handleDownload} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--almex-border)] bg-white px-3 text-xs font-medium text-[var(--almex-text-2)]">
                <Download className="h-3.5 w-3.5" />Download
              </button>
            </div>
            <button onClick={() => setShowDeleteConfirm(true)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--almex-border)] bg-white px-3 text-xs font-medium text-[#7f1d1d]">
              <Trash2 className="h-3.5 w-3.5" />Hapus
            </button>
          </div>
        </section>
      </div>

      {showPreview && <PreviewModal doc={doc} onClose={() => setShowPreview(false)} />}
    </>
  );
}
