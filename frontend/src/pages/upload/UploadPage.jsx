import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, CheckCircle2, Loader2, AlertTriangle, ChevronDown, ChevronUp, Pencil, Clock } from 'lucide-react';
import { useUpload } from '../../store/uploadStore';
import api from '../../lib/api';
import { useToast } from '../../contexts/ToastContext.jsx';

const MAX_FILES = 5;

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (dateStr.includes('T')) return dateStr.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch {}
  return dateStr;
}

export default function UploadForm() {
  const { addToast } = useToast();
  const { uploads, addFiles, removeUpload, updateResult, clearAll } = useUpload();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const pdfFiles = Array.from(files).filter(f =>
      f.name.toLowerCase().endsWith('.pdf') ||
      /\.(jpg|jpeg|png|bmp|tiff?)$/i.test(f.name)
    );
    if (pdfFiles.length === 0) return;
    const remaining = MAX_FILES - uploads.length;
    addFiles(pdfFiles.slice(0, remaining));
  };

  const handleSimpan = async (item) => {
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
        onClick: () => window.location.href = '/dashboard/arsip'
      });
    } catch (err) {
      addToast('Gagal menyimpan: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragActive 
            ? 'border-amber-500 bg-amber-50/50 scale-[1.02] shadow-lg' 
            : uploads.length >= MAX_FILES 
              ? 'border-zinc-200 bg-zinc-50 opacity-50 cursor-not-allowed' 
              : 'border-zinc-200 hover:border-amber-400 hover:bg-amber-50/30 hover:shadow-md'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); if (uploads.length < MAX_FILES) handleFiles(e.dataTransfer.files); }}
        onClick={() => uploads.length < MAX_FILES && fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff,.tif" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        
        {/* File count badge */}
        {uploads.length > 0 && (
          <div className="absolute top-3 right-3 bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
            {uploads.length}/{MAX_FILES}
          </div>
        )}
        
        <div className={`w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4 transition-transform duration-300 ${dragActive ? 'scale-110' : ''}`}>
          <Upload className="w-6 h-6 text-amber-500" />
        </div>
        <p className="text-sm font-medium text-zinc-700 mb-1">Upload surat masuk dan keluar untuk diproses</p>
        <p className="text-xs text-zinc-400 mt-1">PDF atau gambar (JPG/PNG/BMP/TIFF) &bull; Maksimal {MAX_FILES} file</p>
      </div>

      {/* Queue */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-700">{uploads.length} file dipilih</span>
            </div>
            {uploads.every(u => u.status === 'done') && (
              <button onClick={clearAll} className="text-xs text-zinc-400 hover:text-zinc-600">Reset</button>
            )}
          </div>

          {uploads.map((item) => (
            <FileCard
              key={item.id}
              item={item}
              onRemove={() => removeUpload(item.id)}
              onUpdateResult={(updates) => updateResult(item.id, updates)}
              onSimpan={() => handleSimpan(item)}
            />
          ))}

          {uploads.length > 1 && uploads.some(u => u.status === 'done') && (
            <button
              onClick={async () => {
                const done = uploads.filter(u => u.status === 'done' && u.result);
                for (const u of done) {
                  const { id, namaPt, tanggalSurat, manualPerusahaan, manualTanggal } = u.result;
                  try {
                    await api.updateDocument(id, {
                      nama_pt: manualPerusahaan || namaPt || null,
                      tanggal_surat: (manualTanggal || tanggalSurat) || null,
                    });
                    await api.confirmDocument(id);
                  } catch (err) {
                    addToast(`Gagal menyimpan ${u.file.name}: ${err.message}`, 'error');
                  }
                }
                window.dispatchEvent(new CustomEvent('doc-updated'));
                clearAll();
                addToast(`${done.length} dokumen berhasil disimpan ke arsip`, 'success');
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Simpan Semua
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FileCard({ item, onRemove, onUpdateResult, onSimpan }) {
  const { addToast } = useToast();
  const [expanded, setExpanded] = useState(true);
  const [showKoreksi, setShowKoreksi] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { file, status, result, error } = item;

  return (
    <div className={`border border-zinc-100 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-bounce-in ${
      result ? (result.confidence >= 75 ? 'border-l-4 border-l-green-500' : result.confidence >= 50 ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-red-500') : ''
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate">{file.name}</p>
          <p className="text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <div className="flex items-center gap-2">
          {status === 'waiting' && <span className="text-xs text-zinc-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Menunggu</span>}
          {status === 'processing' && <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
          {status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          {status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
          {result && (
            <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-zinc-100 rounded">
              {expanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>
          )}
          {showConfirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-zinc-500">Yakin?</span>
              <button onClick={onRemove} className="text-xs text-red-600 font-medium px-2 py-1 bg-red-50 rounded">Ya</button>
              <button onClick={() => setShowConfirmDelete(false)} className="text-xs text-zinc-500 px-2 py-1 bg-zinc-50 rounded">Batal</button>
            </div>
          ) : (
            <button onClick={() => setShowConfirmDelete(true)} className="p-1 hover:bg-red-50 rounded"><X className="w-4 h-4 text-zinc-400 hover:text-red-500" /></button>
          )}
        </div>
      </div>

      {/* Status */}
      {status === 'done' && (
        <div className="px-4 pb-1">
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> Klasifikasi selesai
          </span>
        </div>
      )}

      {status === 'processing' && (
        <div className="px-4 pb-1">
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sedang memproses...
          </span>
        </div>
      )}

      {/* Details */}
      {expanded && result && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Arah Dokumen</p>
              <p className="text-sm font-semibold" style={{ color: result.arah === 'Masuk' ? '#00AA00' : '#DD0000' }}>{result.arah || '-'}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Jenis Dokumen</p>
              <p className="text-sm font-semibold text-zinc-900">{result.jenis || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Hasil</p>
              <p className="text-sm font-semibold" style={{ color: result.confidence >= 75 ? '#00AA00' : result.confidence >= 50 ? '#D4A000' : '#DD0000' }}>
                {result.confidence >= 75 ? 'Akurat' : result.confidence >= 50 ? 'Cukup' : 'Tidak Akurat'}
                <span className="text-[11px] ml-1 opacity-70">({(result.confidence || 0).toFixed(0)}%)</span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Perusahaan</p>
              {result.ocrFailed ? (
                <input
                  type="text"
                  placeholder="Isi manual..."
                  value={result.manualPerusahaan || ''}
                  onChange={(e) => onUpdateResult({ manualPerusahaan: e.target.value })}
                  className="w-full text-xs p-1.5 border border-zinc-200 rounded bg-white"
                />
              ) : (
                <p className="text-sm font-semibold text-zinc-900">{result.namaPt || '-'}</p>
              )}
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Tanggal Surat</p>
              {result.ocrFailed ? (
                <input
                  type="date"
                  value={result.manualTanggal || ''}
                  onChange={(e) => onUpdateResult({ manualTanggal: e.target.value })}
                  className="w-full text-xs p-1.5 border border-zinc-200 rounded bg-white"
                />
              ) : (
                <p className="text-sm font-semibold text-zinc-900">{formatDate(result.tanggalSurat)}</p>
              )}
            </div>
          </div>

          {result.ocrFailed && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-700">Teks gagal diekstrak dari dokumen ini.</p>
                  <p className="text-[11px] text-amber-600 mt-0.5">Silakan isi Perusahaan dan Tanggal Surat secara manual, lalu klik Simpan.</p>
                </div>
              </div>
            </div>
          )}

          {/* Confidence warning badge */}
          {result.confidence < 75 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-[11px] text-amber-700">
                Confidence rendah ({(result.confidence || 0).toFixed(0)}%). Silakan <strong className="text-amber-800">periksa & koreksi</strong> sebelum menyimpan.
              </p>
            </div>
          )}

          {/* Koreksi + Simpan */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onSimpan}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                result.confidence >= 75
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {result.confidence >= 75 ? 'Simpan ke Arsip' : 'Simpan Tanpa Koreksi'}
            </button>
            <button
              onClick={() => setShowKoreksi(!showKoreksi)}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors ${
                result.confidence < 75
                  ? 'bg-amber-500 text-white hover:bg-amber-600 font-medium'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" /> Koreksi
            </button>
            <button onClick={() => { window.dispatchEvent(new CustomEvent('doc-updated')); onRemove(); }} className="text-xs text-zinc-400 hover:text-zinc-600">Upload Lainnya</button>
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
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="px-4 pb-4">
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs text-red-600">{error || 'Gagal memproses file'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function KoreksiInline({ docId, currentJenis, currentArah, onClose, onUpdate }) {
  const { addToast } = useToast();
  const [jenis, setJenis] = useState(currentJenis);
  const [arah, setArah] = useState(currentArah);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateDocument(docId, { jenis, arah });
      onUpdate({ jenis, arah, confidence: 100 });
      addToast('Koreksi klasifikasi berhasil disimpan', 'success');
    } catch (err) {
      addToast('Gagal menyimpan koreksi: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
      <p className="text-xs font-medium text-zinc-500">Koreksi Klasifikasi</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-zinc-400">Jenis Dokumen</label>
          <select value={jenis} onChange={(e) => setJenis(e.target.value)} className="w-full text-xs p-1.5 border border-zinc-200 rounded bg-white">
            <option value="">Pilih...</option>
            {['PurchaseOrder', 'Invoice', 'Penawaran', 'SalesOrder', 'SuratJalan', 'Lainnya'].map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-zinc-400">Arah Dokumen</label>
          <select value={arah} onChange={(e) => setArah(e.target.value)} className="w-full text-xs p-1.5 border border-zinc-200 rounded bg-white">
            <option value="Masuk">Masuk</option>
            <option value="Keluar">Keluar</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleSave} disabled={saving} className="text-xs font-medium text-amber-600 hover:text-amber-700">
          {saving ? 'Menyimpan...' : 'Simpan Koreksi'}
        </button>
        <button onClick={onClose} className="text-xs text-zinc-400 hover:text-zinc-600">Batal</button>
      </div>
    </div>
  );
}
