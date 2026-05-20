import { Search, Filter, X, Calendar, Building2, ArrowUpDown, FileBadge } from 'lucide-react';
import { categories, companies } from '../mockData';

export default function FilterBar({ filters, onFilterChange, totalResults }) {
  const hasActiveFilters = filters.arah || filters.jenis || filters.company || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-4">
      {/* Search + Primary Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Cari nama file, perusahaan, atau klasifikasi..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all placeholder:text-zinc-400"
          />
        </div>

        {/* Direction Filter */}
        <select
          value={filters.arah}
          onChange={(e) => onFilterChange('arah', e.target.value)}
          className="px-3 py-2.5 text-sm bg-white border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all text-zinc-700 cursor-pointer min-w-[140px]"
        >
          <option value="">Semua Arah</option>
          <option value="Masuk">Surat Masuk</option>
          <option value="Keluar">Surat Keluar</option>
        </select>

        {/* Category Filter */}
        <select
          value={filters.jenis}
          onChange={(e) => onFilterChange('jenis', e.target.value)}
          className="px-3 py-2.5 text-sm bg-white border border-zinc-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D49A28]/20 focus:border-[#D49A28]/50 transition-all text-zinc-700 cursor-pointer min-w-[160px]"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Secondary Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date From */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200/60 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            className="text-xs text-zinc-600 bg-transparent outline-none cursor-pointer"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200/60 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
            className="text-xs text-zinc-600 bg-transparent outline-none cursor-pointer"
          />
        </div>

        {/* Company Filter */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200/60 rounded-lg">
          <Building2 className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={filters.company}
            onChange={(e) => onFilterChange('company', e.target.value)}
            className="text-xs text-zinc-600 bg-transparent outline-none cursor-pointer"
          >
            <option value="">Semua PT</option>
            {companies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Confidence Filter */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200/60 rounded-lg">
          <FileBadge className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={filters.confidence}
            onChange={(e) => onFilterChange('confidence', e.target.value)}
            className="text-xs text-zinc-600 bg-transparent outline-none cursor-pointer"
          >
            <option value="">Semua Akurasi</option>
            <option value="90">≥ 90% (Verified)</option>
            <option value="75">75–89% (Review)</option>
            <option value="low">&lt; 75% (Pending)</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={() => onFilterChange('clear')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <X className="w-3 h-3" />
            Reset Filter
          </button>
        )}

        {/* Result Count */}
        <span className="text-xs text-zinc-400 ml-auto">
          {totalResults} dokumen ditemukan
        </span>
      </div>
    </div>
  );
}
