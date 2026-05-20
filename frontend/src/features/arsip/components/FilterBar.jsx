import { useState } from 'react';
import { Search, X, Calendar, Building2, FileBadge, SlidersHorizontal } from 'lucide-react';
import { categories, companies } from '../mockData';

export default function FilterBar({ filters, onFilterChange, totalResults }) {
  const [expanded, setExpanded] = useState(false);
  const hasActiveFilters = filters.arah || filters.jenis || filters.company || filters.dateFrom || filters.dateTo || filters.confidence || filters.search;

  return (
    <div className="bg-white rounded-xl border border-zinc-200/60 p-5">
      {/* Row 1: Search + Quick Filters (Always Visible) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Cari file, perusahaan, atau kategori..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 focus:bg-white transition-all placeholder:text-zinc-400"
          />
        </div>

        <select
          value={filters.arah}
          onChange={(e) => onFilterChange('arah', e.target.value)}
          className="px-3 py-2 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 focus:bg-white transition-all text-zinc-700 cursor-pointer min-w-[130px]"
        >
          <option value="">Arah</option>
          <option value="Masuk">Masuk</option>
          <option value="Keluar">Keluar</option>
        </select>

        <select
          value={filters.jenis}
          onChange={(e) => onFilterChange('jenis', e.target.value)}
          className="px-3 py-2 text-sm bg-zinc-50/50 border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 focus:bg-white transition-all text-zinc-700 cursor-pointer min-w-[150px]"
        >
          <option value="">Kategori</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-all cursor-pointer ${
            expanded || hasActiveFilters
              ? 'bg-[#D49A28]/10 border-[#D49A28]/30 text-[#D49A28]'
              : 'bg-zinc-50/50 border-zinc-200/60 text-zinc-500 hover:bg-zinc-100'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* Row 2: Advanced Filters (Expandable) */}
      {expanded && (
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-zinc-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50/50 border border-zinc-200/60 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <input type="date" value={filters.dateFrom} onChange={(e) => onFilterChange('dateFrom', e.target.value)} className="text-xs text-zinc-600 bg-transparent outline-none cursor-pointer" />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50/50 border border-zinc-200/60 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <input type="date" value={filters.dateTo} onChange={(e) => onFilterChange('dateTo', e.target.value)} className="text-xs text-zinc-600 bg-transparent outline-none cursor-pointer" />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50/50 border border-zinc-200/60 rounded-lg">
            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
            <select value={filters.company} onChange={(e) => onFilterChange('company', e.target.value)} className="text-xs text-zinc-600 bg-transparent outline-none cursor-pointer max-w-[180px]">
              <option value="">Semua PT</option>
              {companies.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50/50 border border-zinc-200/60 rounded-lg">
            <FileBadge className="w-3.5 h-3.5 text-zinc-400" />
            <select value={filters.confidence} onChange={(e) => onFilterChange('confidence', e.target.value)} className="text-xs text-zinc-600 bg-transparent outline-none cursor-pointer">
              <option value="">Akurasi</option>
              <option value="90">≥ 90%</option>
              <option value="75">75-89%</option>
              <option value="low">&lt; 75%</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button onClick={() => { onFilterChange('clear'); setExpanded(false); }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-1">
              <X className="w-3 h-3" /> Reset
            </button>
          )}

          <span className="text-xs text-zinc-400 ml-auto">{totalResults} dokumen</span>
        </div>
      )}

      {/* Result count (collapsed state) */}
      {!expanded && <span className="text-xs text-zinc-400 mt-2 block">{totalResults} dokumen ditemukan</span>}
    </div>
  );
}
