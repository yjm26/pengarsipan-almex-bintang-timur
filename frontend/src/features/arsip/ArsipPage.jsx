import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Filter } from 'lucide-react';
import FilterBar from './components/FilterBar';
import DocumentTable from './components/DocumentTable';
import Pagination from './components/Pagination';
import { generateDocuments } from './mockData';

const ITEMS_PER_PAGE = 10;

export default function ArsipPage() {
  const allDocuments = useMemo(() => generateDocuments(45), []);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    arah: '',
    jenis: '',
    company: '',
    dateFrom: '',
    dateTo: '',
    confidence: '',
  });

  const handleFilterChange = (key, value) => {
    if (key === 'clear') {
      setFilters({
        search: '',
        arah: '',
        jenis: '',
        company: '',
        dateFrom: '',
        dateTo: '',
        confidence: '',
      });
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
    setCurrentPage(1);
  };

  const filteredDocuments = useMemo(() => {
    return allDocuments.filter((doc) => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchSearch =
          doc.nama.toLowerCase().includes(q) ||
          doc.namaPt.toLowerCase().includes(q) ||
          doc.klasifikasi.toLowerCase().includes(q) ||
          doc.jenis.toLowerCase().includes(q);
        if (!matchSearch) return false;
      }

      // Direction
      if (filters.arah && doc.arah !== filters.arah) return false;

      // Category
      if (filters.jenis && doc.jenis !== filters.jenis) return false;

      // Company
      if (filters.company && doc.namaPt !== filters.company) return false;

      // Confidence
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
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D49A28]/10 border border-[#D49A28]/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#D49A28]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Arsip Surat</h1>
            <p className="text-sm text-zinc-500 mt-1 font-light">Semua dokumen terklasifikasi beserta hasil analisis AI.</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          totalResults={filteredDocuments.length}
        />
      </motion.div>

      {/* Table Card */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-zinc-200/60 overflow-hidden"
      >
        <DocumentTable documents={paginatedDocuments} page={currentPage} />
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
