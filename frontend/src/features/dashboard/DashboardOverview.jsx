import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useToast } from '../../contexts/ToastContext.jsx';
import ActivityChart from './components/ActivityChart';
import CategoryChart from './components/CategoryChart';
import DashboardStats from './components/DashboardStats';
import RecentDocuments from './components/RecentDocuments';

export default function DashboardOverview({ onNavigate }) {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const exportSummary = () => {
    if (!stats) return;
    const rows = [
      ['Metrik', 'Jumlah'],
      ['Total Dokumen', stats.total_documents || 0],
      ['Surat Masuk', stats.surat_masuk_count || 0],
      ['Surat Keluar', stats.surat_keluar_count || 0],
      ['Dokumen Bulan Ini', stats.documents_this_month_count || 0],
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ringkasan-dashboard-almex.csv';
    link.click();
    URL.revokeObjectURL(url);
    addToast('Ringkasan dashboard berhasil diunduh', 'success');
  };

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        if (mounted) setStats(data);
      } catch (err) {
        addToast('Gagal memuat dashboard: ' + err.message, 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStats();
    return () => { mounted = false; };
  }, [addToast]);

  return (
    <div className="space-y-[18px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-[var(--almex-text)]">Dashboard Arsip</h1>
          <p className="mt-1 text-[13px] text-[var(--almex-text-2)]">Pantau dokumen masuk, dokumen keluar, dan kategori arsip dalam satu workspace.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportSummary} disabled={!stats || loading} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--almex-border-strong)] bg-white px-3 text-xs text-[var(--almex-text)] disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-3.5 w-3.5" />Export</button>
          <button onClick={() => onNavigate?.('arsip')} className="h-8 rounded-md border border-[var(--almex-border-strong)] bg-white px-3 text-xs text-[var(--almex-text)]">Lihat Arsip</button>
        </div>
      </div>

      <DashboardStats stats={stats} loading={loading} />
      <RecentDocuments stats={stats} loading={loading} />

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.6fr_0.9fr]">
        <ActivityChart stats={stats} loading={loading} />
        <CategoryChart stats={stats} loading={loading} />
      </div>
    </div>
  );
}
