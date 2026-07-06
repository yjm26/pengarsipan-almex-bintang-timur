import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext.jsx';

export default function UploadModal({ onClose, onSuccess }) {
  const { addToast } = useToast();
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const isPDF = (f) => f?.name?.toLowerCase().endsWith('.pdf');
  const isImage = (f) => /\.(jpg|jpeg|png|bmp|tiff|tif)$/i.test(f?.name || '');
  const isValid = (f) => isPDF(f) || isImage(f);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setDragOver(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && isValid(dropped)) {
      setFile(dropped);
      setError(null);
    } else if (dropped) {
      setError('Hanya file PDF dan gambar (JPG/PNG/BMP/TIFF) yang diizinkan');
    }
  }, []);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected && isValid(selected)) {
      setFile(selected);
      setError(null);
    } else if (selected) {
      setError('Hanya file PDF dan gambar (JPG/PNG/BMP/TIFF) yang diizinkan');
    }
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) { clearInterval(interval); return p; }
        return p + Math.random() * 12;
      });
    }, 200);
    return interval;
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    const progressInterval = simulateProgress();

    try {
      const res = await api.uploadDocument(file);
      clearInterval(progressInterval);
      setProgress(100);

      const mapped = {
        id: res.id,
        nama_file: res.nama_file || file.name,
        nama_pt: res.nama_pt || '',
        tanggal_surat: res.tanggal_surat || '',
        tanggalSurat: res.tanggal_surat
          ? new Date(res.tanggal_surat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          : '',
        tanggal_unggah: res.tanggal_unggah || '',
        arah: res.arah || '',
        jenis: res.jenis || '',
        confidence: res.confidence ?? 0,
        ukuran: res.ukuran || file.size,
        status: res.status || '',
      };
      setResult(mapped);
      onSuccess?.(mapped);
      addToast(`Dokumen "${mapped.nama_file}" berhasil diunggah — ${mapped.arah}, ${mapped.jenis}`, 'success');
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      setError(err.message || 'Gagal mengunggah dokumen');
      addToast(err.message || 'Gagal mengunggah dokumen', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const isMasuk = result?.arah === 'Masuk';
  const confidencePct = Math.round((result?.confidence || 0) * 100);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const onDragOver = (e) => { e.preventDefault(); };
    const onDrop = (e) => {
      if (!e.target.closest('.upload-drop-zone')) {
        e.preventDefault();
        addToast('Taruh file di area yang ditandai', 'info');
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('drop', onDrop);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('drop', onDrop);
    };
  }, [onClose, addToast]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl border border-zinc-200/60 w-full max-w-lg shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h3 className="text-base font-semibold tracking-tight text-zinc-900">
            {result ? 'Hasil Klasifikasi' : 'Unggah Dokumen'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Result State */}
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {/* File info */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 truncate">{result.nama_file}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{formatSize(result.ukuran)}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">Berhasil</span>
                  </div>
                </div>

                {/* Classification */}
                <div className="space-y-2">
                  <div className={`flex items-center justify-between py-3 px-4 rounded-lg ${isMasuk ? 'bg-emerald-50/50 border border-emerald-100' : 'bg-red-50/50 border border-red-100'}`}>
                    <span className="text-sm text-zinc-600">Arah</span>
                    <div className="flex items-center gap-1.5">
                      {isMasuk ? <ArrowDownLeft className="w-4 h-4" style={{ color: '#00AA00' }} /> : <ArrowUpRight className="w-4 h-4" style={{ color: '#DD0000' }} />}
                      <span className="text-sm font-semibold text-zinc-900">{result.arah}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-blue-50/50 border border-blue-100">
                    <span className="text-sm text-zinc-600">Jenis</span>
                    <span className="text-sm font-semibold text-zinc-900">{result.jenis}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-amber-50/50 border border-amber-100">
                    <span className="text-sm text-zinc-600">Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-amber-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#D49A28] rounded-full transition-all" style={{ width: `${confidencePct}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-zinc-900">{confidencePct}%</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-sm font-medium text-zinc-700 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> Unggah Lagi
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#D49A28] hover:bg-[#C08A20] text-sm font-medium text-white transition-all"
                  >
                    Selesai
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Upload State */}
            {!result && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span className="text-sm text-red-700">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Drop zone */}
                {!file && !uploading && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`upload-drop-zone relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      dragOver
                        ? 'border-[#D49A28] bg-[#D49A28]/5'
                        : 'border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff,.tif" onChange={handleFileSelect} className="hidden" />
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center">
                      <Upload className={`w-6 h-6 ${dragOver ? 'text-[#D49A28]' : 'text-zinc-400'}`} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-zinc-700">
                        {dragOver ? 'Lepaskan file di sini' : 'Klik atau tarik file ke sini'}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">PDF, JPG, PNG, BMP, TIFF (max 20MB)</p>
                    </div>
                  </div>
                )}

                {/* File selected */}
                {file && !uploading && !result && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                    <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 truncate">{file.name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{formatSize(file.size)}</p>
                    </div>
                    <button onClick={handleReset} className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Progress */}
                {uploading && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                      <Loader2 className="w-5 h-5 text-[#D49A28] animate-spin flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">{file?.name}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">Mengunggah dan mengklasifikasikan...</p>
                      </div>
                      <span className="text-sm font-medium text-zinc-700">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#D49A28] rounded-full transition-all duration-200" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                  </div>
                )}

                {/* Actions */}
                {file && !uploading && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
                    >
                      Batal
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUpload}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#D49A28] hover:bg-[#C08A20] text-sm font-medium text-white transition-all"
                    >
                      <Upload className="w-4 h-4" /> Unggah
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
