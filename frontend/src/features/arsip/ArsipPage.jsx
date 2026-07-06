import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import DocumentTable from './components/DocumentTable';
import api from '../../lib/api';
import { useToast } from '../../contexts/ToastContext.jsx';

export default function ArsipPage() {
  const { addToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getDocuments({ per_page: 100 });
      const mapped = (res.data || []).map((doc) => ({
        id: doc.id,
        nama_file: doc.nama_file || '',
        nama_pt: doc.nama_pt || '',
        tanggal_surat: doc.tanggal_surat || '',
        tanggalSurat: doc.tanggal_surat
          ? new Date(doc.tanggal_surat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          : '',
        tanggal_unggah: doc.tanggal_unggah || '',
        arah: doc.arah || '',
        jenis: doc.jenis || '',
        confidence: doc.confidence ?? 0,
        ukuran: doc.ukuran || 0,
        status: doc.status || '',
      }));
      setDocuments(mapped);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleDelete = async (id) => {
    try {
      await api.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      addToast('Dokumen berhasil dihapus', 'success');
    } catch (err) {
      addToast('Gagal menghapus dokumen: ' + err.message, 'error');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => api.deleteDocument(id)));
      setDocuments(prev => prev.filter(d => !ids.includes(d.id)));
      addToast(`${ids.length} dokumen berhasil dihapus`, 'success');
    } catch (err) {
      addToast('Gagal menghapus dokumen: ' + err.message, 'error');
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const res = await api.updateDocument(id, data);
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...res } : d));
      addToast('Dokumen berhasil diperbarui', 'success');
    } catch (err) {
      addToast('Gagal memperbarui dokumen: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Arsip Surat</h1>
        <p className="text-sm text-zinc-500 mt-1.5 font-light">Semua dokumen terklasifikasi.</p>
      </motion.div>

      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
        <DocumentTable
          documents={documents}
          loading={loading}
          onRefresh={fetchDocuments}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onUpdate={handleUpdate}
        />
      </motion.div>
    </div>
  );
}
