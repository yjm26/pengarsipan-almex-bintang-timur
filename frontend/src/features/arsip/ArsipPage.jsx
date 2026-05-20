import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import FilterBar from './components/FilterBar';
import DocumentTable from './components/DocumentTable';
import Pagination from './components/Pagination';
import { generateDocuments } from './mockData';

const ITEMS_PER_PAGE = 10;

export default function ArsipPage() {
  const allDocuments = useMemo(() => generateDocuments(45), []);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '', arah: '', jenis: '', company: '',
    dateFrom: '', dateTo: '', confidence: '',
  });

  const handleFilterChange = (key, value) => {
    if (key === 'clear') {
      setFilters({ search: '', arah: '', jenis: '', company: '', dateFrom: '', dateTo: '', confidence: '' });
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
    setCurrentPage(1);
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
      {/* Header */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Arsip Surat</h1>
        <p className="text-sm text-zinc-500 mt-1.5 font-light">Semua dokumen terklasifikasi beserta hasil analisis AI.</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          totalResults={filteredDocuments.length}
        />
      </motion.div>

      {/* Table */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-xl border border-zinc-200/60 overflow-hidden"
      >
        <DocumentTable documents={paginatedDocuments} />
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
