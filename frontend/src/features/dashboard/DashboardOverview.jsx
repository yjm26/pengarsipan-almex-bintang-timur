import { motion } from 'framer-motion';
import { FileText, ArrowDownRight, ArrowUpRight, AlertTriangle } from 'lucide-react';
import KPICard from './components/KPICard';
import ActivityChart from './components/ActivityChart';
import CategoryChart from './components/CategoryChart';
import RecentDocuments from './components/RecentDocuments';

const kpiData = [
  { title: 'Total Dokumen', value: '1,245', subtitle: 'Seluruh arsip tersimpan', icon: FileText, accent: 'gold', filter: null },
  { title: 'Surat Masuk', value: '420', subtitle: 'Bulan ini', icon: ArrowDownRight, accent: 'blue', filter: { arah: 'Masuk' } },
  { title: 'Surat Keluar', value: '315', subtitle: 'Bulan ini', icon: ArrowUpRight, accent: 'green', filter: { arah: 'Keluar' } },
  { title: 'Perlu Verifikasi', value: '12', subtitle: 'Akurasi di bawah 80%', icon: AlertTriangle, accent: 'red', filter: { confidence: 'low' } },
];

export default function DashboardOverview({ onNavigate }) {
  return (
    <div className="space-y-8">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1.5 font-light">Ringkasan aktivitas arsip dokumen perusahaan.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} delay={0.15 + i * 0.05} onClick={() => kpi.filter && onNavigate?.('arsip', kpi.filter)} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><ActivityChart /></div>
        <div><CategoryChart /></div>
      </div>

      <RecentDocuments />
    </div>
  );
}
