import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle2, Loader2, FilePlus, Sparkles, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';

export default function UploadForm({ onUpload }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, done, error
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualMeta, setManualMeta] = useState({ namaPt: '', tanggal: '' });

  const uploadAndClassify = useCallback(async (f) => {
    setStatus('uploading');
    setProgress(0);
    setErrorMsg('');

    // Simulate upload progress (since fetch doesn't give progress easily)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    try {
      setStatus('processing');
      setProgress(0);

      // Restart progress for AI processing phase
      clearInterval(progressInterval);
      const processInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(processInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const doc = await api.uploadDocument(f);
      clearInterval(processInterval);
      setProgress(100);

      setResult({
        id: doc.id,
        arah: doc.arah || '',
        jenis: doc.jenis || '',
        confidence: doc.confidence != null ? Math.round(doc.confidence * 100) : 0,
        namaPt: doc.nama_pt || '',
        tanggalSurat: doc.tanggal_surat || '',
        extractedText: doc.extracted_text || '',
      });
      setStatus('done');
    } catch (err) {
      clearInterval(progressInterval);
      setErrorMsg(err.message || 'Upload gagal');
      setStatus('error');
    }
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/bmp', 'image/tiff'];
    if (allowed.includes(f.type)) {
      setFile(f);
      uploadAndClassify(f);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    handleFile(droppedFile);
  };

  const handleReset = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setErrorMsg('');
    setManualMeta({ namaPt: '', tanggal: '' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Upload Dokumen</h1>
        <p className="text-sm text-zinc-500 mt-1.5 font-light">Upload surat untuk diklasifikasi otomatis oleh AI (2-Level Naïve Bayes + TF-IDF).</p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-[#D49A28] bg-[#D49A28]/5'
                : 'border-zinc-200/60 hover:border-zinc-300 hover:bg-zinc-50/50'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff,.tif"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                dragActive ? 'bg-[#D49A28]/15' : 'bg-zinc-100'
              }`}>
                <Upload className={`w-6 h-6 ${dragActive ? 'text-[#D49A28]' : 'text-zinc-400'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-700">
                  <span className="text-[#D49A28]">Klik untuk upload</span> atau drag & drop
                </p>
                <p className="text-xs text-zinc-400 mt-1">PDF atau gambar (JPG/PNG), maks 10 MB</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200/60 p-6">
            {/* File Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-red-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate max-w-[300px]">{file.name}</p>
                  <p className="text-xs text-zinc-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              {status === 'done' && (
                <button onClick={handleReset} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Progress */}
            {(status === 'uploading' || status === 'processing') && (
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-2 ${status === 'processing' ? 'text-[#D49A28] font-medium' : 'text-zinc-500'}`}>
                    <Loader2 className={`w-3.5 h-3.5 ${status === 'processing' ? 'animate-spin' : ''}`} />
                    {status === 'uploading' ? 'Mengunggah dokumen...' : 'AI sedang mengklasifikasi...'}
                  </span>
                  <span className="text-zinc-400">{Math.min(Math.round(progress), 100)}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      status === 'processing' ? 'bg-[#D49A28]' : 'bg-zinc-400'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                {status === 'processing' && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Sparkles className="w-3 h-3" />
                    <span>Case folding → Stopword removal → Stemming → TF-IDF → Multinomial Naïve Bayes</span>
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className="mt-5 p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2">
                <X className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{errorMsg}</span>
                <button onClick={handleReset} className="ml-auto text-xs text-red-500 underline">Coba lagi</button>
              </div>
            )}

            {/* Result */}
            {status === 'done' && result && (
              <div className="mt-6 space-y-4 pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Klasifikasi selesai
                </div>

                {/* Classification Results */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <p className="text-xs text-zinc-500 mb-1">Arah Dokumen</p>
                    <p className="text-lg font-semibold text-emerald-700">{result.arah}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                    <p className="text-xs text-zinc-500 mb-1">Jenis Dokumen</p>
                    <p className="text-lg font-semibold text-blue-700">{result.jenis}</p>
                  </div>
                </div>

                {/* Confidence & Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
                    <p className="text-xs text-zinc-500 mb-1">Hasil Klasifikasi</p>
                    <p className="text-lg font-semibold" style={{ color: result.confidence >= 75 ? '#00AA00' : result.confidence >= 50 ? '#D4A000' : '#DD0000' }}>
                      {result.confidence >= 75 ? 'Akurat' : result.confidence >= 50 ? 'Cukup' : 'Tidak Akurat'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
                    <p className="text-xs text-zinc-500 mb-1">Perusahaan</p>
                    {result.namaPt ? (
                      <p className="text-sm font-medium text-zinc-900">{result.namaPt}</p>
                    ) : (
                      <input type="text" value={manualMeta.namaPt} onChange={(e) => setManualMeta(m => ({...m, namaPt: e.target.value}))} placeholder="Masukkan nama perusahaan..." className="w-full text-sm font-medium text-zinc-900 bg-white border border-zinc-200 rounded px-2 py-1 outline-none focus:border-amber-400" />
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
                    <p className="text-xs text-zinc-500 mb-1">Tanggal Surat</p>
                    {result.tanggalSurat ? (
                      <p className="text-sm font-medium text-zinc-900">{result.tanggalSurat}</p>
                    ) : (
                      <input type="date" value={manualMeta.tanggal} onChange={(e) => setManualMeta(m => ({...m, tanggal: e.target.value}))} className="w-full text-sm font-medium text-zinc-900 bg-white border border-zinc-200 rounded px-2 py-1 outline-none focus:border-amber-400" />
                    )}
                  </div>
                </div>

                {/* OCR Warning */}
                {(!result.extractedText || result.extractedText.length < 10) && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Teks gagal diekstrak dari dokumen ini.</p>
                      <p className="text-xs mt-1 text-amber-600">Silakan isi Perusahaan dan Tanggal Surat secara manual di atas, lalu klik Simpan ke Arsip.</p>
                    </div>
                  </div>
                )}

                {/* Extracted Text Preview */}
                {result.extractedText && result.extractedText.length >= 10 && (
                  <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
                    <p className="text-xs text-zinc-500 mb-2">Teks Terekstrak</p>
                    <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">{result.extractedText}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      if (manualMeta.namaPt || manualMeta.tanggal) {
                        try {
                          await api.updateDocument(result.id, {
                            nama_pt: manualMeta.namaPt || undefined,
                            tanggal_surat: manualMeta.tanggal || undefined,
                          });
                        } catch (e) { console.error('Update metadata failed:', e); }
                      }
                      if (onUpload) onUpload();
                      handleReset();
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#D49A28] text-white text-sm font-medium rounded-lg hover:bg-[#C08A20] transition-colors"
                  >
                    <FilePlus className="w-4 h-4" />
                    Simpan ke Arsip
                  </motion.button>
                  <button onClick={handleReset} className="px-5 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all">
                    Upload Lainnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
