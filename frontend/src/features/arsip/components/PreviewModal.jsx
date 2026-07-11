import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Loader2, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';

export default function PreviewModal({ doc, onClose }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let revoked = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.request(`/api/documents/${doc.id}/preview`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (!revoked) {
          setPreviewUrl(url);
          setLoading(false);
        } else {
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        if (!revoked) {
          setError(err.message || 'Gagal memuat preview');
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      revoked = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [doc.id]);

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={handleClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-3 justify-center">
          <button
            onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-all"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-white font-medium px-2 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(4, z + 0.25))}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs text-zinc-400 mx-2">|</span>
          <span className="text-xs text-zinc-300 max-w-[200px] truncate">{doc.nama_file}</span>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-all ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto bg-white rounded-2xl" style={{ maxHeight: '80vh' }}>
          {loading && (
            <div className="flex flex-col items-center gap-3 p-12">
              <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
              <p className="text-sm text-zinc-500">Memuat preview...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center gap-3 p-12">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {previewUrl && !loading && (
            <img
              src={previewUrl}
              alt={doc.nama_file}
              style={{ 
                maxWidth: zoom <= 1 ? '100%' : 'none',
                width: zoom <= 1 ? 'auto' : `${zoom * 100}%`,
                height: 'auto',
                display: 'block'
              }}
              className="mx-auto"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
