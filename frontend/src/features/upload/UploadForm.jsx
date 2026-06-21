import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle2, Loader2, FilePlus, Sparkles, AlertTriangle, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import api from '../../lib/api';

const MAX_FILES = 5;

export default function UploadForm({ onUpload }) {
  const [dragActive, setDragActive] = useState(false);
  const [queue, setQueue] = useState([]); // [{file, status, progress, result, error, manualMeta}]
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = useCallback(async (f, index) => {
    // Update status to uploading
    setQueue(prev => prev.map((item, i) => 
      i === index ? { ...item, status: 'uploading', progress: 0 } : item
    ));

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setQueue(prev => prev.map((item, i) => {
        if (i === index && item.status === 'uploading') {
          const newProgress = Math.min(item.progress + Math.random() * 15, 90);
          return { ...item, progress: newProgress };
        }
        return item;
      }));
    }, 150);

    try {
      // Update status to processing
      setQueue(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'processing', progress: 0 } : item
      ));

      // Restart progress for AI processing
      clearInterval(progressInterval);
      const processInterval = setInterval(() => {
        setQueue(prev => prev.map((item, i) => {
          if (i === index && item.status === 'processing') {
            const newProgress = Math.min(item.progress + Math.random() * 10, 90);
            return { ...item, progress: newProgress };
          }
          return item;
        }));
      }, 200);

      const doc = await api.uploadDocument(f);
      clearInterval(processInterval);

      // Update with result
      setQueue(prev => prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            status: 'done',
            progress: 100,
            result: {
              id: doc.id,
              arah: doc.arah || '',
              jenis: doc.jenis || '',
              confidence: doc.confidence != null ? Math.round(doc.confidence * 100) : 0,
              namaPt: doc.nama_pt || '',
              tanggalSurat: doc.tanggal_surat || '',
              extractedText: doc.extracted_text || '',
            },
          };
        }
        return item;
      }));
    } catch (err) {
      clearInterval(progressInterval);
      setQueue(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'error', error: err.message || 'Upload gagal' } : item
      ));
    }
  }, []);

  const processQueue = useCallback(async () => {
    setProcessing(true);
    
    // Process files sequentially (FCFS)
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'pending') {
        await processFile(item.file, i);
      }
    }
    
    setProcessing(false);
  }, [queue, processFile]);

  const handleFiles = useCallback((files) => {
    if (!files || files.length === 0) return;
    
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/bmp', 'image/tiff'];
    const newFiles = Array.from(files).filter(f => allowed.includes(f.type)).slice(0, MAX_FILES);
    
    if (newFiles.length === 0) {
      alert('Hanya file PDF dan gambar (JPG/PNG/BMP/TIFF) yang diizinkan');
      return;
    }

    const newQueue = newFiles.map(f => ({
      file: f,
      status: 'pending',
      progress: 0,
      result: null,
      error: null,
      manualMeta: { namaPt: '', tanggal: '' },
      expanded: false,
    }));

    setQueue(prev => {
      const combined = [...prev, ...newQueue].slice(0, MAX_FILES);
      return combined;
    });

    // Auto-start processing
    setTimeout(() => {
      if (!processing) {
        processQueue();
      }
    }, 100);
  }, [processing, processQueue]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e) => {
    handleFiles(e.target.files);
    e.target.value = ''; // Reset input
  };

  const handleReset = () => {
    setQueue([]);
    setProcessing(false);
  };

  const handleRemoveItem = (index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleExpand = (index) => {
    setQueue(prev => prev.map((item, i) => 
      i === index ? { ...item, expanded: !item.expanded } : item
    ));
  };

  const handleManualMetaChange = (index, field, value) => {
    setQueue(prev => prev.map((item, i) => 
      i === index ? { ...item, manualMeta: { ...item.manualMeta, [field]: value } } : item
    ));
  };

  const handleSaveAll = async () => {
    for (const item of queue) {
      if (item.result && (item.manualMeta.namaPt || item.manualMeta.tanggal)) {
        try {
          await api.updateDocument(item.result.id, {
            nama_pt: item.manualMeta.namaPt || undefined,
            tanggal_surat: item.manualMeta.tanggal || undefined,
          });
        } catch (e) {
          console.error('Update metadata failed:', e);
        }
      }
    }
    if (onUpload) onUpload();
    handleReset();
  };

  const allDone = queue.length > 0 && queue.every(item => item.status === 'done' || item.status === 'error');
  const hasResults = queue.some(item => item.result);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Upload Dokumen</h1>
        <p className="text-sm text-zinc-500 mt-1.5 font-light">Upload surat untuk diklasifikasi otomatis oleh AI (2-Level Naïve Bayes + TF-IDF). Maksimal {MAX_FILES} file.</p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-[#D49A28] bg-[#D49A28]/5'
              : 'border-zinc-200/60 hover:border-zinc-300 hover:bg-zinc-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff,.tif"
            multiple
            onChange={handleFileInput}
            className="hidden"
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
              <p className="text-xs text-zinc-400 mt-1">PDF atau gambar (JPG/PNG), maks {MAX_FILES} file, 10MB per file</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Queue */}
      {queue.length > 0 && (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
          <div className="bg-white rounded-xl border border-zinc-200/60 overflow-hidden">
            {/* Queue Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-700">
                  {queue.length} file dipilih
                </span>
                {processing && (
                  <span className="text-xs text-[#D49A28] font-medium ml-2">Memproses...</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {allDone && hasResults && (
                  <button
                    onClick={handleSaveAll}
                    className="flex items-center gap-2 px-4 py-2 bg-[#D49A28] text-white text-sm font-medium rounded-lg hover:bg-[#C08A20] transition-colors"
                  >
                    <FilePlus className="w-4 h-4" />
                    Simpan Semua
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Queue Items */}
            <div className="divide-y divide-zinc-100">
              {queue.map((item, index) => (
                <div key={index} className="p-4">
                  {/* File Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-900 truncate">{item.file.name}</p>
                        <p className="text-xs text-zinc-400">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {/* Status Badge */}
                      {item.status === 'pending' && (
                        <span className="text-xs text-zinc-400 px-2 py-1 rounded bg-zinc-50">Menunggu</span>
                      )}
                      {item.status === 'uploading' && (
                        <span className="text-xs text-blue-600 px-2 py-1 rounded bg-blue-50 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Upload
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="text-xs text-[#D49A28] px-2 py-1 rounded bg-amber-50 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI
                        </span>
                      )}
                      {item.status === 'done' && (
                        <span className="text-xs text-green-600 px-2 py-1 rounded bg-green-50 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Selesai
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="text-xs text-red-600 px-2 py-1 rounded bg-red-50 flex items-center gap-1">
                          <X className="w-3 h-3" />
                          Error
                        </span>
                      )}

                      {/* Expand/Collapse */}
                      {(item.status === 'done' || item.status === 'error') && (
                        <button
                          onClick={() => handleToggleExpand(index)}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"
                        >
                          {item.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}

                      {/* Remove */}
                      {!processing && (
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(item.status === 'uploading' || item.status === 'processing') && (
                    <div className="mt-3 space-y-1">
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.status === 'processing' ? 'bg-[#D49A28]' : 'bg-zinc-400'
                          }`}
                          style={{ width: `${Math.min(item.progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-zinc-400 text-right">{Math.min(Math.round(item.progress), 100)}%</p>
                    </div>
                  )}

                  {/* Error */}
                  {item.status === 'error' && (
                    <div className="mt-3 p-2 rounded-lg bg-red-50 border border-red-100">
                      <p className="text-xs text-red-700">{item.error}</p>
                    </div>
                  )}

                  {/* Result (Expanded) */}
                  {item.expanded && item.result && (
                    <div className="mt-4 pt-4 border-t border-zinc-100 space-y-3">
                      {/* Classification */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                          <p className="text-xs text-zinc-500 mb-1">Arah Dokumen</p>
                          <p className="text-sm font-semibold text-emerald-700">{item.result.arah}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                          <p className="text-xs text-zinc-500 mb-1">Jenis Dokumen</p>
                          <p className="text-sm font-semibold text-blue-700">{item.result.jenis}</p>
                        </div>
                      </div>

                      {/* Confidence & Metadata */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                          <p className="text-xs text-zinc-500 mb-1">Hasil Klasifikasi</p>
                          <p className="text-sm font-semibold" style={{ color: item.result.confidence >= 75 ? '#00AA00' : item.result.confidence >= 50 ? '#D4A000' : '#DD0000' }}>
                            {item.result.confidence >= 75 ? 'Akurat' : item.result.confidence >= 50 ? 'Cukup' : 'Tidak Akurat'}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                          <p className="text-xs text-zinc-500 mb-1">Perusahaan</p>
                          {item.result.namaPt ? (
                            <p className="text-xs font-medium text-zinc-900">{item.result.namaPt}</p>
                          ) : (
                            <input
                              type="text"
                              value={item.manualMeta.namaPt}
                              onChange={(e) => handleManualMetaChange(index, 'namaPt', e.target.value)}
                              placeholder="Isi manual..."
                              className="w-full text-xs font-medium text-zinc-900 bg-white border border-zinc-200 rounded px-2 py-1 outline-none focus:border-amber-400"
                            />
                          )}
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                          <p className="text-xs text-zinc-500 mb-1">Tanggal Surat</p>
                          {item.result.tanggalSurat ? (
                            <p className="text-xs font-medium text-zinc-900">{item.result.tanggalSurat}</p>
                          ) : (
                            <input
                              type="date"
                              value={item.manualMeta.tanggal}
                              onChange={(e) => handleManualMetaChange(index, 'tanggal', e.target.value)}
                              className="w-full text-xs font-medium text-zinc-900 bg-white border border-zinc-200 rounded px-2 py-1 outline-none focus:border-amber-400"
                            />
                          )}
                        </div>
                      </div>

                      {/* OCR Warning */}
                      {(!item.result.extractedText || item.result.extractedText.length < 10) && (
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-800">Teks gagal diekstrak. Silakan isi Perusahaan dan Tanggal secara manual.</p>
                        </div>
                      )}

                      {/* Extracted Text */}
                      {item.result.extractedText && item.result.extractedText.length >= 10 && (
                        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                          <p className="text-xs text-zinc-500 mb-1">Teks Terekstrak</p>
                          <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">{item.result.extractedText}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
