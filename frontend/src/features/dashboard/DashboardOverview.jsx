import { motion } from 'framer-motion';
import { FileText, ArrowDownRight, ArrowUpRight, AlertTriangle } from 'lucide-react';
import KPICard from './components/KPICard';
import ActivityChart from './components/ActivityChart';
import CategoryChart from './components/CategoryChart';
import RecentDocuments from './components/RecentDocuments';

const kpiData = [
  { title: 'Total Dokumen', value: '1,245', subtitle: 'Seluruh arsip tersimpan', icon: FileText, accent: 'gold' },
  { title: 'Surat Masuk', value: '420', subtitle: 'Bulan ini', icon: ArrowDownRight, accent: 'blue' },
  { title: 'Surat Keluar', value: '315', subtitle: 'Bulan ini', icon: ArrowUpRight, accent: 'green' },
  { title: 'Perlu Verifikasi', value: '12', subtitle: 'Akurasi di bawah 80%', icon: AlertTriangle, accent: 'red' },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1.5 font-light">Ringkasan aktivitas arsip dokumen perusahaan.</p>
      </motion.div>

      {/* KPI Cards (Generated from array) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} delay={0.15 + i * 0.05} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        <div>
          <CategoryChart />
        </div>
      </div>

      {/* Table */}
      <RecentDocuments />
    </div>
  );
}
