import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { FileText, Trash2, Tag, Download, X } from 'lucide-react';
import FilterBar from './components/FilterBar';
import DocumentTable from './components/DocumentTable';
import Pagination from './components/Pagination';
import { generateDocuments } from './mockData';

const ITEMS_PER_PAGE = 10;

export default function ArsipPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const allDocuments = useMemo(() => generateDocuments(45), []);
  const [currentPage, setCurrentPage] = useState(1);
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

  const filteredDocuments = useMemo(() => {
    return allDocuments.filter((doc) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!doc.nama.toLowerCase().includes(q) &&
            !doc.namaPt.toLowerCase().includes(q) &&
            !doc.klasifikasi.toLowerCase().includes(q) &&
            !doc.jenis.toLowerCase().includes(q)) return false;
      }
      if (filters.arah && doc.arah !== filters.arah) return false;
      if (filters.jenis && doc.jenis !== filters.jenis) return false;
      if (filters.company && doc.namaPt !== filters.company) return false;
      if (filters.confidence === '90' && doc.confidence < 90) return false;
      if (filters.confidence === '75' && (doc.confidence < 75 || doc.confidence >= 90)) return false;
      if (filters.confidence === 'low' && doc.confidence >= 75) return false;
      return true;
    });
  }, [allDocuments, filters]);

  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Arsip Surat</h1>
        <p className="text-sm text-zinc-500 mt-1.5 font-light">Semua dokumen terklasifikasi beserta hasil analisis AI.</p>
      </motion.div>

      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <FilterBar filters={filters} onFilterChange={handleFilterChange} totalResults={filteredDocuments.length} />
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

        <DocumentTable documents={paginatedDocuments} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredDocuments.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </motion.div>
    </div>
  );
}
