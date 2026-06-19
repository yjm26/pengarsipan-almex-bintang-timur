import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { FileText, Trash2, Tag, Download, X } from 'lucide-react';
import FilterBar from './components/FilterBar';
import DocumentTable from './components/DocumentTable';
import Pagination from './components/Pagination';
import api from '../../lib/api';

const ITEMS_PER_PAGE = 10;

export default function ArsipPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '', arah: '', jenis: '', company: '',
    dateFrom: '', dateTo: '', confidence: '',
  });

  // Apply URL filters on mount (Feature 2: KPI click-through)
  useEffect(() => {
    const arah = searchParams.get('arah');
    const confidence = searchParams.get('confidence');
    if (arah || confidence) {
      setFilters((prev) => ({ ...prev, arah: arah || '', confidence: confidence || '' }));
    }
  }, [searchParams]);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      };
      if (filters.search) params.search = filters.search;
      if (filters.arah) params.arah = filters.arah;
      if (filters.jenis) params.jenis = filters.jenis;

      const res = await api.getDocuments(params);

      const mapped = (res.data || []).map((doc) => ({
        id: doc.id,
        nama: doc.nama_file || '',
        namaPt: doc.nama_pt || '',
        tanggalSurat: doc.tanggal_surat || '',
        tanggalUnggah: doc.tanggal_unggah || '',
        klasifikasi: `${doc.arah || ''} · ${doc.jenis || ''}`,
        arah: doc.arah || '',
        jenis: doc.jenis || '',
        confidence: doc.confidence != null ? Math.round(doc.confidence * 100) : 0,
        ukuran: doc.ukuran ? `${(doc.ukuran / (1024 * 1024)).toFixed(1)} MB` : '',
        status: doc.status || '',
      }));

      setDocuments(mapped);
      setTotalPages(res.total_pages || 1);
      setTotalItems(res.total || 0);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters.search, filters.arah, filters.jenis]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Reset to page 1 when filters change (except on initial mount URL params)
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.arah, filters.jenis]);

  const handleFilterChange = (key, value) => {
    if (key === 'clear') {
      setFilters({ search: '', arah: '', jenis: '', company: '', dateFrom: '', dateTo: '', confidence: '' });
      setSearchParams({});
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
    setCurrentPage(1);
  };

  const handleToggleSelect = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkAction = (action) => {
    if (action === 'delete') {
      alert(`${selectedIds.size} dokumen akan dihapus.`);
      setSelectedIds(new Set());
    } else if (action === 'export') {
      alert(`${selectedIds.size} dokumen akan di-export.`);
    } else if (action === 'category') {
      alert(`Ubah kategori untuk ${selectedIds.size} dokumen.`);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Arsip Surat</h1>
        <p className="text-sm text-zinc-500 mt-1.5 font-light">Semua dokumen terklasifikasi beserta hasil analisis AI.</p>
      </motion.div>

      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <FilterBar filters={filters} onFilterChange={handleFilterChange} totalResults={totalItems} />
      </motion.div>

      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-xl border border-zinc-200/60 overflow-hidden"
      >
        {/* Bulk Action Bar (Feature 3) */}
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-8 py-3 bg-[#D49A28]/5 border-b border-[#D49A28]/20"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#D49A28]">{selectedIds.size} dipilih</span>
              <button onClick={() => setSelectedIds(new Set())} className="p-1 rounded hover:bg-[#D49A28]/10 text-zinc-400 hover:text-zinc-600 transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleBulkAction('export')} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button onClick={() => handleBulkAction('category')} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all">
                <Tag className="w-3.5 h-3.5" /> Ubah Kategori
              </button>
              <button onClick={() => handleBulkAction('delete')} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="p-8 space-y-3">
            {[0,1,2,3,4].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-zinc-50 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <DocumentTable documents={documents} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}
