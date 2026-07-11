import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FileText, ArrowDownRight, ArrowUpRight, AlertTriangle } from 'lucide-react';
import KPICard from './components/KPICard';
import ActivityChart from './components/ActivityChart';
import CategoryChart from './components/CategoryChart';
import RecentDocuments from './components/RecentDocuments';
import api from '../../lib/api';

import { useToast } from '../../contexts/ToastContext.jsx';

export default function DashboardOverview({ onNavigate }) {
  const { addToast } = useToast();
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await api.getDashboardStats();
        setKpiData([
          { title: 'Total Dokumen', value: stats.total_documents?.toLocaleString() ?? '0', subtitle: 'Seluruh arsip tersimpan', icon: FileText, accent: 'gold', filter: null },
          { title: 'Surat Masuk', value: stats.surat_masuk_count?.toLocaleString() ?? '0', subtitle: 'Bulan ini', icon: ArrowDownRight, accent: 'blue', filter: { arah: 'Masuk' } },
          { title: 'Surat Keluar', value: stats.surat_keluar_count?.toLocaleString() ?? '0', subtitle: 'Bulan ini', icon: ArrowUpRight, accent: 'green', filter: { arah: 'Keluar' } },
          { title: 'Perlu Verifikasi', value: stats.perlu_verifikasi_count?.toLocaleString() ?? '0', subtitle: 'Akurasi di bawah 80%', icon: AlertTriangle, accent: 'red', filter: { confidence: 'low' } },
        ]);
      } catch (err) {
        addToast('Gagal memuat statistik dashboard: ' + err.message, 'error');
        // Default 0 biar card tetap muncul
        setKpiData([
          { title: 'Total Dokumen', value: '0', subtitle: 'Seluruh arsip tersimpan', icon: FileText, accent: 'gold', filter: null },
          { title: 'Surat Masuk', value: '0', subtitle: 'Bulan ini', icon: ArrowDownRight, accent: 'blue', filter: { arah: 'Masuk' } },
          { title: 'Surat Keluar', value: '0', subtitle: 'Bulan ini', icon: ArrowUpRight, accent: 'green', filter: { arah: 'Keluar' } },
          { title: 'Perlu Verifikasi', value: '0', subtitle: 'Akurasi di bawah 80%', icon: AlertTriangle, accent: 'red', filter: { confidence: 'low' } },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1.5 font-light">Ringkasan aktivitas arsip dokumen perusahaan.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            {[0,1,2,3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-zinc-100 animate-pulse" />
            ))}
          </>
        ) : (
          kpiData.map((kpi, i) => (
            <KPICard key={kpi.title} {...kpi} delay={0.15 + i * 0.05} onClick={() => kpi.filter && onNavigate?.('arsip', kpi.filter)} />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><ActivityChart /></div>
        <div><CategoryChart /></div>
      </div>

      <RecentDocuments />
    </div>
  );
}
