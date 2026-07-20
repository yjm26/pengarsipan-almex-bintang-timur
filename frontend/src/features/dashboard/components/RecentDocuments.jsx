import { ArrowUpDown, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import DashboardPanel from './DashboardPanel';
import DirectionBadge from './DirectionBadge';
import FileTypeBadge from './FileTypeBadge';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function EmptyState({ hasFilter }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm font-medium text-[var(--almex-text)]">
        {hasFilter ? 'Dokumen tidak ditemukan' : 'Belum ada dokumen diarsipkan'}
      </p>
      <p className="mt-1 text-xs text-[var(--almex-text-3)]">
        {hasFilter ? 'Coba ubah kata kunci atau filter arah surat.' : 'Upload dokumen pertama untuk mulai membuat arsip perusahaan.'}
      </p>
    </div>
  );
}

export default function RecentDocuments({ stats, loading }) {
  const [query, setQuery] = useState('');
  const [direction, setDirection] = useState('Semua');
  const [sortDesc, setSortDesc] = useState(true);
  const documents = useMemo(() => stats?.recent_documents || [], [stats]);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return documents
      .filter((doc) => direction === 'Semua' || doc.arah === direction)
      .filter((doc) => {
        if (!normalizedQuery) return true;
        return [doc.nama_file, doc.jenis, doc.nama_pt, doc.arah]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => {
        const aDate = new Date(a.tanggal_unggah || a.created_at || 0).getTime();
        const bDate = new Date(b.tanggal_unggah || b.created_at || 0).getTime();
        return sortDesc ? bDate - aDate : aDate - bDate;
      });
  }, [direction, documents, query, sortDesc]);

  const hasFilter = query.trim() !== '' || direction !== 'Semua';

  return (
    <DashboardPanel
      title="Arsip Terbaru"
      description="Dokumen terakhir yang diproses sistem"
      action={
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <label className="flex h-8 min-w-[220px] flex-1 items-center gap-2 rounded-md border border-[var(--almex-border)] bg-[#fafaf9] px-2.5 text-xs text-[var(--almex-text-2)] sm:w-[260px] sm:flex-none">
            <Search className="h-3.5 w-3.5" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari dokumen..."
              className="min-w-0 flex-1 bg-transparent text-xs text-[var(--almex-text)] outline-none placeholder:text-[var(--almex-text-3)]"
            />
          </label>
          <label className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--almex-border)] bg-white px-2.5 text-xs text-[var(--almex-text-2)]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <select value={direction} onChange={(event) => setDirection(event.target.value)} className="bg-transparent outline-none">
              <option>Semua</option>
              <option>Masuk</option>
              <option>Keluar</option>
            </select>
          </label>
          <button onClick={() => setSortDesc((value) => !value)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--almex-border)] bg-white px-2.5 text-xs text-[var(--almex-text-2)]">
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortDesc ? 'Terbaru' : 'Terlama'}
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-0">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-[42px] border-b border-[#eaeae8] bg-[var(--almex-surface)]" />)}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <EmptyState hasFilter={hasFilter} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] border-collapse">
            <thead>
              <tr>
                <th className="h-[34px] w-9 border-b border-[var(--almex-border)] bg-[#fafaf9] px-2 text-left"><input type="checkbox" className="h-3.5 w-3.5" aria-label="Pilih semua dokumen" /></th>
                {['Nama Dokumen', 'Arah', 'Jenis', 'Perusahaan', 'Tanggal', 'Aksi'].map((header) => (
                  <th key={header} className="h-[34px] border-b border-[var(--almex-border)] bg-[#fafaf9] px-2.5 text-left text-[11px] font-medium text-[var(--almex-text-3)] last:text-right">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="group hover:bg-[var(--almex-bg)]">
                  <td className="h-[42px] border-b border-[#eaeae8] px-2"><input type="checkbox" className="h-3.5 w-3.5" aria-label={`Pilih ${doc.nama_file}`} /></td>
                  <td className="h-[42px] border-b border-[#eaeae8] px-2.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--almex-text)]">
                      <FileTypeBadge filename={doc.nama_file} />
                      <span className="max-w-[260px] truncate">{doc.nama_file}</span>
                    </div>
                  </td>
                  <td className="h-[42px] border-b border-[#eaeae8] px-2.5"><DirectionBadge arah={doc.arah} /></td>
                  <td className="h-[42px] border-b border-[#eaeae8] px-2.5 text-xs text-[var(--almex-text-2)]">{doc.jenis || '-'}</td>
                  <td className="h-[42px] border-b border-[#eaeae8] px-2.5 text-xs text-[var(--almex-text-2)]">{doc.nama_pt || '-'}</td>
                  <td className="h-[42px] border-b border-[#eaeae8] px-2.5 text-xs text-[var(--almex-text-2)]">{formatDate(doc.tanggal_unggah || doc.created_at)}</td>
                  <td className="h-[42px] border-b border-[#eaeae8] px-2.5 text-right text-xs text-[var(--almex-text-3)]">Preview</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardPanel>
  );
}
