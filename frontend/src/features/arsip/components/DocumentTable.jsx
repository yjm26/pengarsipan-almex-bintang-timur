import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Eye, FilePlus, Filter, MoreHorizontal, RefreshCw, Search, SearchX, X } from 'lucide-react';
import DetailPanel from './DetailPanel';
import PreviewModal from './PreviewModal';
import api from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext.jsx';

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((item) => (
    item === 1 || item === totalPages || Math.abs(item - page) <= 1
  ));

  return (
    <div className="mt-3 flex items-center justify-between">
      <p className="text-xs text-[var(--almex-text-3)]">Halaman {page} dari {totalPages}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1} className="grid h-7 w-7 place-items-center rounded-md border border-[var(--almex-border)] bg-white text-[var(--almex-text-2)] disabled:opacity-35">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        {pages.map((item, index) => {
          const prev = pages[index - 1];
          return (
            <span key={item} className="flex items-center gap-1">
              {prev && item - prev > 1 && <span className="px-1 text-xs text-[var(--almex-text-3)]">...</span>}
              <button onClick={() => onChange(item)} className={`h-7 min-w-7 rounded-md px-2 text-xs ${item === page ? 'bg-[var(--almex-ink)] text-white' : 'border border-[var(--almex-border)] bg-white text-[var(--almex-text-2)]'}`}>
                {item}
              </button>
            </span>
          );
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="grid h-7 w-7 place-items-center rounded-md border border-[var(--almex-border)] bg-white text-[var(--almex-text-2)] disabled:opacity-35">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function FileBadge({ filename }) {
  const lower = (filename || '').toLowerCase();
  const type = lower.endsWith('.doc') || lower.endsWith('.docx') ? 'DOC' : lower.endsWith('.xls') || lower.endsWith('.xlsx') ? 'XLS' : 'PDF';
  return <span className="grid h-[22px] w-[28px] place-items-center rounded-[5px] border border-[var(--almex-border)] bg-[var(--almex-muted)] text-[9px] font-semibold text-[var(--almex-text-2)]">{type}</span>;
}

function DirectionPill({ value }) {
  return <span className="inline-flex h-[22px] items-center rounded-full border border-[var(--almex-border)] bg-[#fafaf9] px-2 text-[11px] font-medium text-[var(--almex-text-2)]">{value || '-'}</span>;
}

export default function DocumentTable({ documents, loading, onRefresh, onDelete, onBulkDelete, onUpdate }) {
  const { addToast } = useToast();
  const [searchRaw, setSearchRaw] = useState('');
  const search = useDebounce(searchRaw, DEBOUNCE_MS);
  const [filters, setFilters] = useState({ arah: '', jenis: '', confidence: '' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [detailDoc, setDetailDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showConfirmBulkDelete, setShowConfirmBulkDelete] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchSearch = !q || [doc.nama_file, doc.nama_pt, doc.jenis, doc.arah].filter(Boolean).some((item) => String(item).toLowerCase().includes(q));
      const matchArah = !filters.arah || doc.arah === filters.arah;
      const matchJenis = !filters.jenis || doc.jenis === filters.jenis;
      const matchConfidence = !filters.confidence
        || (filters.confidence === '90' && doc.confidence >= 0.9)
        || (filters.confidence === '75' && doc.confidence >= 0.75 && doc.confidence < 0.9)
        || (filters.confidence === 'low' && doc.confidence < 0.75);
      return matchSearch && matchArah && matchJenis && matchConfidence;
    });
  }, [documents, filters, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasActiveFilters = filters.arah || filters.jenis || filters.confidence;

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const ids = paginated.map((doc) => doc.id);
    setSelected((prev) => prev.length === ids.length ? [] : ids);
  };

  const clearFilters = () => {
    setFilters({ arah: '', jenis: '', confidence: '' });
    setSearchRaw('');
  };

  const handleDownload = async (doc) => {
    try {
      const res = await api.request(`/api/documents/${doc.id}/download`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.nama_file;
      link.click();
      URL.revokeObjectURL(url);
      addToast(`"${doc.nama_file}" berhasil diunduh`, 'success');
    } catch (err) {
      addToast('Gagal download: ' + err.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    await onDelete(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    await onBulkDelete(selected);
    setSelected([]);
    setShowConfirmBulkDelete(false);
  };

  if (loading) {
    return (
      <section className="rounded-[10px] border border-[var(--almex-border)] bg-white p-12 text-center">
        <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-[var(--almex-text-3)]" />
        <p className="text-sm text-[var(--almex-text-2)]">Memuat dokumen...</p>
      </section>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-[10px] border border-[var(--almex-border)] bg-white">
        <div className="flex min-h-12 flex-col gap-2 border-b border-[var(--almex-border)] px-3.5 py-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-[13px] font-semibold text-[var(--almex-text)]">Daftar Dokumen</h3>
            <p className="mt-0.5 text-xs text-[var(--almex-text-3)]">{filtered.length} dokumen ditemukan</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-8 min-w-[240px] flex-1 items-center gap-2 rounded-md border border-[var(--almex-border)] bg-[#fafaf9] px-2.5 text-xs text-[var(--almex-text-2)] lg:w-[280px] lg:flex-none">
              <Search className="h-3.5 w-3.5" />
              <input value={searchRaw} onChange={(event) => { setSearchRaw(event.target.value); setPage(1); }} placeholder="Cari dokumen..." className="min-w-0 flex-1 bg-transparent text-xs text-[var(--almex-text)] outline-none placeholder:text-[var(--almex-text-3)]" />
              {searchRaw && <button type="button" onClick={() => { setSearchRaw(''); setPage(1); }} className="text-[var(--almex-text-3)]"><X className="h-3.5 w-3.5" /></button>}
            </label>
            <button onClick={() => setExpanded((value) => !value)} className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium ${hasActiveFilters ? 'border-[var(--almex-ink)] bg-[var(--almex-ink)] text-white' : 'border-[var(--almex-border)] bg-white text-[var(--almex-text-2)]'}`}>
              <Filter className="h-3.5 w-3.5" />Filter
            </button>
            <button onClick={onRefresh} className="grid h-8 w-8 place-items-center rounded-md border border-[var(--almex-border)] bg-white text-[var(--almex-text-2)]" aria-label="Refresh dokumen">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--almex-border)] bg-[#fafaf9] px-3.5 py-2.5">
            <select value={filters.arah} onChange={(event) => { setFilters((prev) => ({ ...prev, arah: event.target.value })); setPage(1); }} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-2.5 text-xs text-[var(--almex-text-2)] outline-none focus:border-[#b8b3ff]">
              <option value="">Semua Arah</option>
              <option value="Masuk">Masuk</option>
              <option value="Keluar">Keluar</option>
            </select>
            <select value={filters.jenis} onChange={(event) => { setFilters((prev) => ({ ...prev, jenis: event.target.value })); setPage(1); }} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-2.5 text-xs text-[var(--almex-text-2)] outline-none focus:border-[#b8b3ff]">
              <option value="">Semua Jenis</option>
              <option value="PurchaseOrder">PurchaseOrder</option>
              <option value="Invoice">Invoice</option>
              <option value="Penawaran">Penawaran</option>
              <option value="SalesOrder">SalesOrder</option>
              <option value="SuratJalan">SuratJalan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            <select value={filters.confidence} onChange={(event) => { setFilters((prev) => ({ ...prev, confidence: event.target.value })); setPage(1); }} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-2.5 text-xs text-[var(--almex-text-2)] outline-none focus:border-[#b8b3ff]">
              <option value="">Semua Akurasi</option>
              <option value="90">Akurat (≥90%)</option>
              <option value="75">Cukup (75-89%)</option>
              <option value="low">Rendah (&lt;75%)</option>
            </select>
            {(hasActiveFilters || searchRaw) && <button onClick={clearFilters} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-2.5 text-xs text-[var(--almex-text-2)]">Reset</button>}
          </div>
        )}

        {selected.length > 0 && (
          <div className="flex items-center justify-between border-b border-[var(--almex-border)] bg-[#fafaf9] px-3.5 py-2 text-xs text-[var(--almex-text-2)]">
            <span>{selected.length} dokumen dipilih</span>
            <div className="flex gap-2">
              <button onClick={() => setSelected([])} className="h-7 rounded-md border border-[var(--almex-border)] bg-white px-2.5 text-xs">Batal pilih</button>
              <button onClick={() => setShowConfirmBulkDelete(true)} className="h-7 rounded-md border border-[var(--almex-border)] bg-white px-2.5 text-xs text-[#7f1d1d]">Hapus</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse">
            <thead>
              <tr>
                <th className="h-[34px] w-9 border-b border-[var(--almex-border)] bg-[#fafaf9] px-2 text-left"><input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0} onChange={toggleSelectAll} className="h-3.5 w-3.5" aria-label="Pilih semua dokumen" /></th>
                {['Nama Dokumen', 'Arah', 'Jenis', 'Perusahaan', 'Tanggal', 'Aksi'].map((header) => (
                  <th key={header} className="h-[34px] border-b border-[var(--almex-border)] bg-[#fafaf9] px-2.5 text-left text-[11px] font-medium text-[var(--almex-text-3)] last:text-right">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="mx-auto grid max-w-sm justify-items-center gap-2">
                      {search || hasActiveFilters ? <SearchX className="h-6 w-6 text-[var(--almex-text-3)]" /> : <FilePlus className="h-6 w-6 text-[var(--almex-text-3)]" />}
                      <p className="text-sm font-medium text-[var(--almex-text)]">{search || hasActiveFilters ? 'Dokumen tidak ditemukan' : 'Belum ada dokumen'}</p>
                      <p className="text-xs text-[var(--almex-text-3)]">{search || hasActiveFilters ? 'Coba ubah kata kunci atau filter.' : 'Upload dokumen pertama untuk mulai membuat arsip.'}</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((doc) => (
                <tr key={doc.id} onClick={() => setDetailDoc(doc)} className="group cursor-pointer hover:bg-[var(--almex-bg)]">
                  <td className="h-[42px] border-b border-[#eaeae8] px-2" onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(doc.id)} onChange={() => toggleSelect(doc.id)} className="h-3.5 w-3.5" aria-label={`Pilih ${doc.nama_file}`} />
                  </td>
                  <td className="h-[42px] border-b border-[#eaeae8] px-2.5">
                    <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-[var(--almex-text)]">
                      <FileBadge filename={doc.nama_file} />
                      <span className="max-w-[300px] truncate">{doc.nama_file}</span>
                    </div>
                  </td>
                  <td className="h-[42px] border-b border-[#eaeae8] px-2.5"><DirectionPill value={doc.arah} /></td>
                  <td className="h-[42px] border-b border-[#eaeae8] px-2.5 text-xs text-[var(--almex-text-2)]">{doc.jenis || '-'}</td>
                  <td className="h-[42px] border-b border-[#eaeae8] px-2.5 text-xs text-[var(--almex-text-2)]">{doc.nama_pt || '-'}</td>
                  <td className="h-[42px] border-b border-[#eaeae8] px-2.5 text-xs text-[var(--almex-text-2)]">{doc.tanggalSurat || '-'}</td>
                  <td className="h-[42px] border-b border-[#eaeae8] px-2.5" onClick={(event) => event.stopPropagation()}>
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => setPreviewDoc(doc)} className="inline-flex h-7 items-center gap-1 rounded-md border border-[var(--almex-border)] bg-white px-2 text-[11px] font-medium text-[var(--almex-text-2)]"><Eye className="h-3.5 w-3.5" />Preview</button>
                      <button onClick={() => handleDownload(doc)} className="grid h-7 w-7 place-items-center rounded-md border border-[var(--almex-border)] bg-white text-[var(--almex-text-2)]" title="Download"><Download className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setConfirmDeleteId(doc.id)} className="grid h-7 w-7 place-items-center rounded-md border border-[var(--almex-border)] bg-white text-[var(--almex-text-2)]" title="Aksi"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />

      {detailDoc && <DetailPanel key={detailDoc.id} doc={detailDoc} onClose={() => setDetailDoc(null)} onUpdate={onUpdate} onDelete={onDelete} />}
      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-5">
          <div className="w-full max-w-sm rounded-[10px] border border-[var(--almex-border)] bg-white p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-[var(--almex-text)]">Hapus dokumen?</h3>
            <p className="mt-1 text-xs text-[var(--almex-text-2)]">Dokumen akan dihapus permanen dari arsip.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmDeleteId(null)} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-3 text-xs text-[var(--almex-text-2)]">Batal</button>
              <button onClick={confirmDelete} className="h-8 rounded-md border border-[#7f1d1d] bg-[#7f1d1d] px-3 text-xs font-medium text-white">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmBulkDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-5">
          <div className="w-full max-w-sm rounded-[10px] border border-[var(--almex-border)] bg-white p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-[var(--almex-text)]">Hapus {selected.length} dokumen?</h3>
            <p className="mt-1 text-xs text-[var(--almex-text-2)]">Semua dokumen terpilih akan dihapus permanen.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowConfirmBulkDelete(false)} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-3 text-xs text-[var(--almex-text-2)]">Batal</button>
              <button onClick={handleBulkDelete} className="h-8 rounded-md border border-[#7f1d1d] bg-[#7f1d1d] px-3 text-xs font-medium text-white">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
