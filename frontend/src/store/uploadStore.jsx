import { createContext, useContext, useState, useCallback } from 'react';
import api from '../lib/api';

const UploadContext = createContext(null);

export function UploadProvider({ children }) {
  const [uploads, setUploads] = useState([]);

  const addFiles = useCallback(async (files) => {
    const newItems = files.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      file,
      status: 'waiting', // waiting | processing | done | error
      result: null,
      error: null,
    }));

    setUploads(prev => [...prev, ...newItems]);

    // Process sequentially (FCFS)
    for (const item of newItems) {
      setUploads(prev => prev.map(u =>
        u.id === item.id ? { ...u, status: 'processing' } : u
      ));

      try {
        const formData = new FormData();
        formData.append('file', item.file);
        const doc = await api.uploadDocument(formData);

        setUploads(prev => prev.map(u =>
          u.id === item.id ? {
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
              extractedText: doc.extracted_text || '',
              manualPerusahaan: '',
              manualTanggal: '',
              ocrFailed: !doc.extracted_text,
            },
          } : u
        ));
      } catch (err) {
        setUploads(prev => prev.map(u =>
          u.id === item.id ? { ...u, status: 'error', error: err.message } : u
        ));
      }
    }
  }, []);

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
