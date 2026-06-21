import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api from '../lib/api';

const UploadContext = createContext(null);

export function UploadProvider({ children }) {
  const [uploads, setUploads] = useState([]);
  const processingRef = useRef(false);

  // Process queue: pick next 'waiting' item and upload it
  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    
    // Find next waiting item
    let nextItem = null;
    setUploads(prev => {
      nextItem = prev.find(u => u.status === 'waiting');
      return prev;
    });
    
    if (!nextItem) return;
    
    processingRef.current = true;
    
    // Mark as processing
    setUploads(prev => prev.map(u =>
      u.id === nextItem.id ? { ...u, status: 'processing' } : u
    ));

    try {
      const formData = new FormData();
      formData.append('file', nextItem.file);
      const doc = await api.uploadDocument(formData);

      setUploads(prev => prev.map(u =>
        u.id === nextItem.id ? {
          ...u,
          status: 'done',
          result: {
            id: doc.id,
            namaFile: doc.nama_file,
            arah: doc.arah || '',
            jenis: doc.jenis || '',
            confidence: doc.confidence != null ? Math.round(doc.confidence * 100) : 0,
            namaPt: doc.nama_pt || '',
            tanggalSurat: doc.tanggal_surat || '',
            manualPerusahaan: '',
            manualTanggal: '',
            ocrFailed: !doc.extracted_text,
          },
        } : u
      ));
    } catch (err) {
      setUploads(prev => prev.map(u =>
        u.id === nextItem.id ? { ...u, status: 'error', error: err.message || 'Upload gagal' } : u
      ));
    }

    processingRef.current = false;
    
    // Process next item in queue
    setTimeout(() => processQueue(), 100);
  }, []);

  const addFiles = useCallback((files) => {
    const newItems = files.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      file,
      status: 'waiting',
      result: null,
      error: null,
    }));

    setUploads(prev => [...prev, ...newItems]);
  }, []);

  // Trigger queue processing whenever uploads change
  useEffect(() => {
    const hasWaiting = uploads.some(u => u.status === 'waiting');
    if (hasWaiting && !processingRef.current) {
      processQueue();
    }
  }, [uploads, processQueue]);

  const removeUpload = useCallback((id) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  }, []);

  const updateResult = useCallback((id, updates) => {
    setUploads(prev => prev.map(u =>
      u.id === id && u.result ? { ...u, result: { ...u.result, ...updates } } : u
    ));
  }, []);

  const clearAll = useCallback(() => {
    setUploads([]);
    processingRef.current = false;
  }, []);

  return (
    <UploadContext.Provider value={{ uploads, addFiles, removeUpload, updateResult, clearAll }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error('useUpload must be inside UploadProvider');
  return ctx;
}
