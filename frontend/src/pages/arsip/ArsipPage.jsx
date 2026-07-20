import { useState, useEffect, useCallback } from 'react';
import DocumentTable from '../../features/arsip/components/DocumentTable';
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
      addToast('Gagal memuat dokumen arsip: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const timer = setTimeout(fetchDocuments, 0);
    return () => clearTimeout(timer);
  }, [fetchDocuments]);

  const handleDelete = async (id) => {
    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      addToast('Dokumen berhasil dihapus', 'success');
    } catch (err) {
      addToast('Gagal menghapus dokumen: ' + err.message, 'error');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map((id) => api.deleteDocument(id)));
      setDocuments((prev) => prev.filter((d) => !ids.includes(d.id)));
      addToast(`${ids.length} dokumen berhasil dihapus`, 'success');
    } catch (err) {
      addToast('Gagal menghapus dokumen: ' + err.message, 'error');
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const res = await api.updateDocument(id, data);
      setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...res } : d)));
      addToast('Dokumen berhasil diperbarui', 'success');
    } catch (err) {
      addToast('Gagal memperbarui dokumen: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-[18px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-[var(--almex-text)]">Arsip Surat</h1>
          <p className="mt-1 text-[13px] text-[var(--almex-text-2)]">Kelola dokumen masuk, dokumen keluar, dan hasil klasifikasi arsip.</p>
        </div>
      </div>

      <DocumentTable
        documents={documents}
        loading={loading}
        onRefresh={fetchDocuments}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
