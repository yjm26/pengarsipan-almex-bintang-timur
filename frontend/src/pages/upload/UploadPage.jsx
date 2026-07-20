import { useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Clock, FileText, Loader2, Pencil, Save, Upload, X } from 'lucide-react';
import { useUpload } from '../../store/uploadStore';
import api from '../../lib/api';
import { useToast } from '../../contexts/ToastContext.jsx';

const MAX_FILES = 10;
const ACCEPTED_EXTENSIONS = /\.(pdf|jpg|jpeg|png|bmp|tiff?|docx?|xlsx?)$/i;

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (dateStr.includes('T')) return dateStr.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const date = new Date(dateStr);
  if (!Number.isNaN(date.getTime())) return date.toISOString().split('T')[0];
  return dateStr;
}

function formatSize(size) {
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function getStatusMeta(status, result) {
  if (status === 'waiting') return { label: 'Menunggu giliran', tone: 'neutral', icon: Clock };
  if (status === 'processing') return { label: 'Sedang membaca dokumen', tone: 'active', icon: Loader2 };
  if (status === 'error') return { label: 'Perlu diunggah ulang', tone: 'danger', icon: X };
  if (result?.ocrFailed || (result?.confidence || 0) < 75) return { label: 'Perlu diperiksa', tone: 'review', icon: Pencil };
  return { label: 'Siap disimpan', tone: 'done', icon: CheckCircle2 };
}

function UploadProgress({ uploads }) {
  const total = uploads.length;
  const saved = uploads.filter((item) => item.status === 'done').length;
  const active = uploads.some((item) => item.status === 'processing');
  const errors = uploads.filter((item) => item.status === 'error').length;
  const width = total ? Math.round((saved / total) * 100) : 0;

  return (
    <div className="rounded-[10px] border border-[var(--almex-border)] bg-white p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[var(--almex-text)]">Proses Dokumen</p>
          <p className="mt-0.5 text-xs text-[var(--almex-text-3)]">
            {active ? 'Sistem sedang membaca isi dokumen.' : total ? `${saved} dari ${total} file sudah selesai dibaca.` : 'Setelah memilih file, statusnya muncul di sini.'}
          </p>
        </div>
        <span className="rounded-full border border-[var(--almex-border)] bg-[#fafaf9] px-2.5 py-1 text-xs font-medium text-[var(--almex-text-2)]">
          {total ? `${saved}/${total}` : '0/0'}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--almex-muted)]">
        <div className="h-full rounded-full bg-[var(--almex-ink)] transition-all duration-300" style={{ width: `${width}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-[var(--almex-text-3)]">
        <span>Dipilih: {total}</span>
        <span>Selesai: {saved}</span>
        <span>Gagal: {errors}</span>
      </div>
    </div>
  );
}

function InfoField({ label, value, children }) {
  return (
    <div className="rounded-[8px] border border-[var(--almex-border)] bg-[#fafaf9] p-3">
      <p className="text-[11px] text-[var(--almex-text-3)]">{label}</p>
      <div className="mt-1 text-sm font-medium text-[var(--almex-text)]">{children || value || '-'}</div>
    </div>
  );
}

export default function UploadForm() {
  const { addToast } = useToast();
  const { uploads, addFiles, removeUpload, updateResult, clearAll } = useUpload();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const selected = Array.from(files || []).filter((file) => ACCEPTED_EXTENSIONS.test(file.name));
    if (selected.length === 0) {
      addToast('Format file belum sesuai. Gunakan PDF, gambar, Word, atau Excel.', 'error');
      return;
    }
    const remaining = MAX_FILES - uploads.length;
    if (remaining <= 0) {
      addToast(`Maksimal ${MAX_FILES} file dalam satu proses`, 'error');
      return;
    }
    addFiles(selected.slice(0, remaining));
    if (selected.length > remaining) addToast(`Hanya ${remaining} file yang ditambahkan`, 'error');
  };

  const saveDocument = async (item) => {
    if (!item.result) return;
    const { id, namaPt, tanggalSurat, manualPerusahaan, manualTanggal } = item.result;
    try {
      await api.updateDocument(id, {
        nama_pt: manualPerusahaan || namaPt || null,
        tanggal_surat: (manualTanggal || tanggalSurat) || null,
      });
      await api.confirmDocument(id);
      window.dispatchEvent(new CustomEvent('doc-updated'));
      removeUpload(item.id);
      addToast('Dokumen berhasil disimpan ke arsip', 'success', {
        label: 'Lihat di Arsip',
        onClick: () => { window.location.href = '/dashboard/arsip'; },
      });
    } catch (err) {
      addToast('Gagal menyimpan: ' + err.message, 'error');
    }
  };

  const saveAll = async () => {
    const done = uploads.filter((item) => item.status === 'done' && item.result);
    for (const item of done) {
      const { id, namaPt, tanggalSurat, manualPerusahaan, manualTanggal } = item.result;
      try {
        await api.updateDocument(id, {
          nama_pt: manualPerusahaan || namaPt || null,
          tanggal_surat: (manualTanggal || tanggalSurat) || null,
        });
        await api.confirmDocument(id);
      } catch (err) {
        addToast(`Gagal menyimpan ${item.file.name}: ${err.message}`, 'error');
      }
    }
    window.dispatchEvent(new CustomEvent('doc-updated'));
    clearAll();
    addToast(`${done.length} dokumen berhasil disimpan ke arsip`, 'success');
  };

  const isFull = uploads.length >= MAX_FILES;
  const hasDone = uploads.some((item) => item.status === 'done');

  return (
    <div className="space-y-[18px]">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-[var(--almex-text)]">Upload Dokumen</h1>
        <p className="mt-1 text-[13px] text-[var(--almex-text-2)]">Unggah dokumen, tunggu sistem membaca isinya, lalu simpan ke arsip.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section
          className={`rounded-[10px] border border-dashed bg-white p-6 transition-colors ${dragActive ? 'border-[var(--almex-ink)] bg-[#fafaf9]' : 'border-[var(--almex-border)]'} ${isFull ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-[#fafaf9]'}`}
          onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => { event.preventDefault(); setDragActive(false); if (!isFull) handleFiles(event.dataTransfer.files); }}
          onClick={() => !isFull && fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff,.tif,.doc,.docx,.xls,.xlsx" multiple className="hidden" onChange={(event) => handleFiles(event.target.files)} />
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="grid h-11 w-11 place-items-center rounded-[9px] border border-[var(--almex-border)] bg-[#fafaf9] text-[var(--almex-text-2)]">
              <Upload className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-medium text-[var(--almex-text)]">Tarik file ke sini atau klik untuk memilih</p>
            <p className="mt-1 text-xs text-[var(--almex-text-3)]">PDF, gambar, Word, atau Excel. Maksimal {MAX_FILES} file.</p>
            <button type="button" className="mt-4 h-9 rounded-md border border-[var(--almex-ink)] bg-[var(--almex-ink)] px-4 text-xs font-medium text-white">
              Pilih File
            </button>
          </div>
        </section>

        <UploadProgress uploads={uploads} />
      </div>

      {uploads.length > 0 && (
        <section className="rounded-[10px] border border-[var(--almex-border)] bg-white">
          <div className="flex items-center justify-between border-b border-[var(--almex-border)] px-3.5 py-3">
            <div>
              <h2 className="text-[13px] font-semibold text-[var(--almex-text)]">File Dipilih</h2>
              <p className="mt-0.5 text-xs text-[var(--almex-text-3)]">Periksa hasil baca sebelum menyimpan ke arsip.</p>
            </div>
            <div className="flex gap-2">
              {uploads.every((item) => item.status === 'done') && <button onClick={clearAll} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-3 text-xs font-medium text-[var(--almex-text-2)]">Reset</button>}
              {uploads.length > 1 && hasDone && <button onClick={saveAll} className="h-8 rounded-md border border-[var(--almex-ink)] bg-[var(--almex-ink)] px-3 text-xs font-medium text-white">Simpan Semua</button>}
            </div>
          </div>

          <div className="divide-y divide-[#eaeae8]">
            {uploads.map((item) => (
              <FileCard
                key={item.id}
                item={item}
                onRemove={() => removeUpload(item.id)}
                onUpdateResult={(updates) => updateResult(item.id, updates)}
                onSave={() => saveDocument(item)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FileCard({ item, onRemove, onUpdateResult, onSave }) {
  const [expanded, setExpanded] = useState(true);
  const [showKoreksi, setShowKoreksi] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { file, status, result, error } = item;
  const meta = getStatusMeta(status, result);
  const StatusIcon = meta.icon;
  const isBusy = status === 'processing';
  const canSave = status === 'done' && result;

  return (
    <article className="bg-white">
      <div className="flex flex-col gap-3 px-3.5 py-3 sm:flex-row sm:items-center">
        <div className="grid h-9 w-9 flex-none place-items-center rounded-[8px] border border-[var(--almex-border)] bg-[#fafaf9] text-[var(--almex-text-2)]">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--almex-text)]">{file.name}</p>
          <p className="mt-0.5 text-xs text-[var(--almex-text-3)]">{formatSize(file.size)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[var(--almex-border)] bg-[#fafaf9] px-2.5 text-xs font-medium text-[var(--almex-text-2)]">
            <StatusIcon className={`h-3.5 w-3.5 ${isBusy ? 'animate-spin' : ''}`} />
            {meta.label}
          </span>
          {result && (
            <button onClick={() => setExpanded((value) => !value)} className="grid h-7 w-7 place-items-center rounded-md border border-[var(--almex-border)] bg-white text-[var(--almex-text-2)]" aria-label="Buka detail hasil baca">
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
          {showConfirmDelete ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--almex-text-2)]">Hapus?</span>
              <button onClick={onRemove} className="h-7 rounded-md border border-[#7f1d1d] bg-[#7f1d1d] px-2 text-xs font-medium text-white">Ya</button>
              <button onClick={() => setShowConfirmDelete(false)} className="h-7 rounded-md border border-[var(--almex-border)] bg-white px-2 text-xs text-[var(--almex-text-2)]">Batal</button>
            </div>
          ) : (
            <button onClick={() => setShowConfirmDelete(true)} className="grid h-7 w-7 place-items-center rounded-md border border-[var(--almex-border)] bg-white text-[var(--almex-text-2)]" aria-label="Hapus file">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {isBusy && (
        <div className="px-3.5 pb-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--almex-muted)]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--almex-ink)]" />
          </div>
          <p className="mt-2 text-xs text-[var(--almex-text-3)]">Mohon tunggu, isi dokumen sedang dibaca.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="px-3.5 pb-3">
          <div className="rounded-[8px] border border-[var(--almex-border)] bg-[#fafaf9] p-3">
            <p className="text-xs font-medium text-[var(--almex-text)]">File belum bisa dibaca.</p>
            <p className="mt-1 text-xs text-[var(--almex-text-2)]">{error || 'Silakan cek file, lalu unggah ulang.'}</p>
          </div>
        </div>
      )}

      {expanded && result && (
        <div className="space-y-3 px-3.5 pb-3">
          {(result.ocrFailed || result.confidence < 75) && (
            <div className="rounded-[8px] border border-[var(--almex-border)] bg-[#fafaf9] p-3">
              <p className="text-xs font-medium text-[var(--almex-text)]">Hasil perlu diperiksa.</p>
              <p className="mt-1 text-xs text-[var(--almex-text-2)]">Beberapa bagian belum terbaca jelas. Periksa data di bawah sebelum disimpan.</p>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-5">
            <InfoField label="Arah" value={result.arah} />
            <InfoField label="Jenis" value={result.jenis} />
            <InfoField label="Hasil Baca" value={`${result.confidence || 0}%`} />
            <InfoField label="Perusahaan">
              {result.ocrFailed ? (
                <input value={result.manualPerusahaan || ''} onChange={(event) => onUpdateResult({ manualPerusahaan: event.target.value })} placeholder="Isi nama perusahaan" className="w-full rounded-md border border-[var(--almex-border)] bg-white px-2 py-1.5 text-xs outline-none focus:border-[#b8b3ff]" />
              ) : result.namaPt || '-'}
            </InfoField>
            <InfoField label="Tanggal Surat">
              {result.ocrFailed ? (
                <input type="date" value={result.manualTanggal || ''} onChange={(event) => onUpdateResult({ manualTanggal: event.target.value })} className="w-full rounded-md border border-[var(--almex-border)] bg-white px-2 py-1.5 text-xs outline-none focus:border-[#b8b3ff]" />
              ) : formatDate(result.tanggalSurat) || '-'}
            </InfoField>
          </div>

          {showKoreksi && (
            <KoreksiInline
              docId={result.id}
              currentJenis={result.jenis}
              currentArah={result.arah}
              onClose={() => setShowKoreksi(false)}
              onUpdate={(updates) => {
                onUpdateResult(updates);
                setShowKoreksi(false);
              }}
            />
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button onClick={onSave} disabled={!canSave} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--almex-ink)] bg-[var(--almex-ink)] px-3 text-xs font-medium text-white disabled:opacity-50">
              <Save className="h-3.5 w-3.5" />Simpan ke Arsip
            </button>
            <button onClick={() => setShowKoreksi((value) => !value)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--almex-border)] bg-white px-3 text-xs font-medium text-[var(--almex-text-2)]">
              <Pencil className="h-3.5 w-3.5" />Koreksi
            </button>
            <button onClick={() => { window.dispatchEvent(new CustomEvent('doc-updated')); onRemove(); }} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-3 text-xs font-medium text-[var(--almex-text-2)]">Upload Lainnya</button>
          </div>
        </div>
      )}
    </article>
  );
}

function KoreksiInline({ docId, currentJenis, currentArah, onClose, onUpdate }) {
  const { addToast } = useToast();
  const [jenis, setJenis] = useState(currentJenis || '');
  const [arah, setArah] = useState(currentArah || 'Masuk');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateDocument(docId, { jenis, arah });
      onUpdate({ jenis, arah, confidence: 100 });
      addToast('Koreksi berhasil disimpan', 'success');
    } catch (err) {
      addToast('Gagal menyimpan koreksi: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-[8px] border border-[var(--almex-border)] bg-[#fafaf9] p-3">
      <p className="text-xs font-medium text-[var(--almex-text)]">Koreksi Hasil Baca</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-[11px] text-[var(--almex-text-3)]">
          Jenis Dokumen
          <select value={jenis} onChange={(event) => setJenis(event.target.value)} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-2 text-xs text-[var(--almex-text)] outline-none focus:border-[#b8b3ff]">
            <option value="">Pilih jenis</option>
            {['PurchaseOrder', 'Invoice', 'Penawaran', 'SalesOrder', 'SuratJalan', 'Lainnya'].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-[11px] text-[var(--almex-text-3)]">
          Arah Dokumen
          <select value={arah} onChange={(event) => setArah(event.target.value)} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-2 text-xs text-[var(--almex-text)] outline-none focus:border-[#b8b3ff]">
            <option value="Masuk">Masuk</option>
            <option value="Keluar">Keluar</option>
          </select>
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={handleSave} disabled={saving} className="h-8 rounded-md border border-[var(--almex-ink)] bg-[var(--almex-ink)] px-3 text-xs font-medium text-white disabled:opacity-60">
          {saving ? 'Menyimpan' : 'Simpan Koreksi'}
        </button>
        <button onClick={onClose} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-3 text-xs font-medium text-[var(--almex-text-2)]">Batal</button>
      </div>
    </div>
  );
}
