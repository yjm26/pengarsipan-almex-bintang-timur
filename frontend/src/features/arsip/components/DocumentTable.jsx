import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Pencil, Trash2, Download, ArrowDownLeft, ArrowUpRight, X, ChevronDown, RefreshCw, FileText, SearchX, FilePlus } from 'lucide-react';
import FilterBar from './FilterBar';
import DetailPanel from './DetailPanel';
import PreviewModal from './PreviewModal';
import api from '../../../lib/api';
import { useToast } from '../../../../contexts/ToastContext.jsx';

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

  const getPages = () => {
    const pages = [];
    const add = (p) => pages.push({ type: 'page', num: p, active: p === page });
    const ellipsis = () => { if (pages[pages.length - 1]?.type !== 'ellipsis') pages.push({ type: 'ellipsis' }); };

    add(1);
    if (page > 4) ellipsis();
    for (let p = Math.max(2, page - 2); p <= Math.min(totalPages - 1, page + 2); p++) add(p);
    if (page < totalPages - 3) ellipsis();
    if (totalPages > 1) add(totalPages);
    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex items-center justify-between mt-3">
      <p className="text-xs text-zinc-500">Halaman {page} dari {totalPages}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 disabled:opacity-30 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p.type === 'ellipsis' ? (
            <span key={`e${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-zinc-400">...</span>
          ) : (
            <button key={p.num} onClick={() => onChange(p.num)} className={`w-7 h-7 text-xs rounded-lg transition-all ${p.active ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}>
              {p.num}
            </button>
          )
        )}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 disabled:opacity-30 transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
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

  const filtered = useMemo(() => {
    let data = [...documents];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d => d.nama_file.toLowerCase().includes(q) || (d.nama_pt || '').toLowerCase().includes(q));
    }
    if (filters.arah) data = data.filter(d => d.arah === filters.arah);
    if (filters.jenis) data = data.filter(d => d.jenis === filters.jenis);
    if (filters.confidence === '90') data = data.filter(d => d.confidence >= 0.9);
    else if (filters.confidence === '75') data = data.filter(d => d.confidence >= 0.75 && d.confidence < 0.9);
    else if (filters.confidence === 'low') data = data.filter(d => d.confidence < 0.75);
    return data;
  }, [documents, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasActiveFilters = filters.arah || filters.jenis || filters.confidence;

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const handleFilterChange = (key, val) => {
    if (key === 'clear') setFilters({ arah: '', jenis: '', confidence: '' });
    else setFilters(prev => ({ ...prev, [key]: val }));
  };

  const toggleSelectAll = () => {
    const ids = paginated.map(d => d.id);
    setSelected(prev => prev.length === ids.length ? [] : ids);
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!selected.length || !confirm(`Hapus ${selected.length} dokumen?`)) return;
    try {
      await onBulkDelete(selected);
      addToast(`${selected.length} dokumen berhasil dihapus`, 'success');
      setSelected([]);
    } catch (err) {
      addToast(err.message || 'Gagal menghapus dokumen', 'error');
    }
  };

  const getBadge = (confidence) => {
    const pct = Math.round(confidence * 100);
    if (pct >= 75) return { bg: '#00AA00', label: 'Akurat' };
    if (pct >= 50) return { bg: '#D4A000', label: 'Cukup' };
    return { bg: '#DD0000', label: 'Tidak Akurat' };
  };

  const handleUpdate = async (id, data) => {
    await onUpdate(id, data);
    setDetailDoc(prev => prev && prev.id === id ? { ...prev, ...data } : prev);
  };

  const handleDownload = async (doc) => {
    try {
      const res = await api.request(`/api/documents/${doc.id}/download`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nama_file;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast(`"${doc.nama_file}" berhasil diunduh`, 'success');
    } catch (err) {
      addToast('Gagal download: ' + err.message, 'error');
    }
  };

  const handlePreview = (doc) => {
    setPreviewDoc(doc);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200/60 p-12 text-center">
        <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin mx-auto mb-3" />
        <p className="text-sm text-zinc-500">Memuat dokumen...</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input type="text" placeholder="Cari dokumen..." value={searchRaw} onChange={(e) => setSearchRaw(e.target.value)} className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-zinc-200/60 bg-zinc-50/50 outline-none focus:border-zinc-400 transition-all" />
              {searchRaw && (
                <button onClick={() => setSearchRaw('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600 transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button onClick={() => setExpanded(!expanded)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all ${expanded ? 'border-zinc-400 bg-zinc-100' : 'border-zinc-200/60 bg-zinc-50/50 hover:bg-zinc-100'} ${hasActiveFilters ? 'border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800' : 'text-zinc-600'}`}>
              <Filter className="w-3.5 h-3.5" /> Filter {hasActiveFilters && `(${Object.values(filters).filter(Boolean).length})`}
            </button>
            {selected.length > 0 && (
              <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100 transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Hapus ({selected.length})
              </button>
            )}
          </div>
          <button onClick={onRefresh} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"><RefreshCw className="w-4 h-4" /></button>
        </div>

        {/* Filter */}
        {expanded && <FilterBar filters={filters} onFilterChange={handleFilterChange} />}

        {/* Info */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500">{filtered.length} dokumen ditemukan</p>
          {selected.length > 0 && <button onClick={() => setSelected([])} className="text-xs text-zinc-400 hover:text-zinc-600">Batal pilih</button>}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-zinc-200/60 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="pl-3 pr-1 py-2 w-6"><input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0} onChange={toggleSelectAll} className="rounded border-zinc-300 w-3 h-3" /></th>
                <th className="text-left px-2 py-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">File</th>
                <th className="text-left px-2 py-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Perusahaan</th>
                <th className="text-left px-2 py-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Tanggal</th>
                <th className="text-left px-2 py-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Arah</th>
                <th className="text-left px-2 py-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Kategori</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14">
                    <div className="flex flex-col items-center gap-3">
                      {hasActiveFilters || search ? (
                        <>
                          <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                            <SearchX className="w-6 h-6 text-zinc-300" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-500">Tidak ada dokumen yang cocok</p>
                            <p className="text-xs text-zinc-400 mt-0.5">Coba ubah kata kunci atau filter</p>
                          </div>
                          <button
                            onClick={() => { setSearchRaw(''); setFilters({ arah: '', jenis: '', confidence: '' }); }}
                            className="mt-1 px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-all"
                          >
                            Reset pencarian
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                            <FilePlus className="w-6 h-6 text-zinc-300" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-500">Belum ada dokumen</p>
                            <p className="text-xs text-zinc-400 mt-0.5">Unggah dokumen pertama Anda</p>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : paginated.map((doc) => {
                const isMasuk = doc.arah === 'Masuk';
                return (
                  <tr key={doc.id} className={`group border-b border-zinc-50 hover:bg-zinc-50/50 cursor-pointer transition-colors ${selected.includes(doc.id) ? 'bg-zinc-50' : ''}`} onClick={() => setDetailDoc(doc)}>
                    <td className="pl-3 pr-1 py-1.5" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selected.includes(doc.id)} onChange={() => toggleSelect(doc.id)} className="rounded border-zinc-300 w-3 h-3" /></td>
                    <td className="px-2 py-1.5"><div className="flex items-center gap-1.5 min-w-0"><div className="w-5 h-5 rounded flex items-center justify-center bg-zinc-100 flex-shrink-0"><FileText className="w-2.5 h-2.5 text-zinc-500" /></div><div className="min-w-0"><p className="text-[11px] font-medium text-zinc-900 truncate max-w-[140px]">{doc.nama_file}</p><p className="text-[9px] text-zinc-400">{doc.ukuran ? `${(doc.ukuran / 1024 / 1024).toFixed(1)} MB` : ''}</p></div></div></td>
                    <td className="px-2 py-1.5 text-[11px] text-zinc-600 max-w-[120px] truncate">{doc.nama_pt || <span className="text-zinc-300">-</span>}</td>
                    <td className="px-2 py-1.5 text-[11px] text-zinc-600 whitespace-nowrap">{doc.tanggalSurat || <span className="text-zinc-300">-</span>}</td>
                    <td className="px-2 py-1.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-white" style={{ backgroundColor: isMasuk ? '#00AA00' : '#DD0000' }}>
                        {isMasuk ? <ArrowDownLeft className="w-2.5 h-2.5" /> : <ArrowUpRight className="w-2.5 h-2.5" />}
                        {doc.arah}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-[11px] text-zinc-600 max-w-[100px] truncate">{doc.jenis}</td>
                    <td className="pr-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handlePreview(doc)} className="p-1.5 rounded-lg bg-zinc-200 hover:bg-violet-100 text-zinc-700 hover:text-violet-600 transition-all" title="Preview"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDownload(doc)} className="p-1.5 rounded-lg bg-zinc-200 hover:bg-emerald-100 text-zinc-700 hover:text-emerald-600 transition-all" title="Download"><Download className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onDelete(doc.id)} className="p-1.5 rounded-lg bg-zinc-200 hover:bg-red-100 text-zinc-700 hover:text-red-600 transition-all" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Detail panel */}
      {detailDoc && (
        <DetailPanel doc={detailDoc} onClose={() => setDetailDoc(null)} onUpdate={handleUpdate} onDelete={(id) => { onDelete(id); setDetailDoc(null); }} />
      )}

      {/* Preview modal */}
      {previewDoc && (
        <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </div>
  );
}
