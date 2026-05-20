import { motion } from 'framer-motion';
import { useState } from 'react';
import { FileText, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import KPICard from '../components/KPICard';
import ActivityChart from '../components/ActivityChart';
import CategoryChart from '../components/CategoryChart';
import RecentDocuments from '../components/RecentDocuments';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-[#FAFAFA]">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar sidebarOpen={true} onClose={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        {/* Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Header */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Overview</h1>
              <p className="text-sm text-zinc-500 mt-1 font-light">Ringkasan aktivitas arsip dokumen perusahaan.</p>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Total Dokumen"
                value="1,245"
                subtitle="Seluruh arsip tersimpan"
                icon={FileText}
                accent="gold"
                delay={0.15}
              />
              <KPICard
                title="Surat Masuk"
                value="420"
                subtitle="Bulan ini"
                icon={ArrowDownRight}
                accent="blue"
                delay={0.2}
              />
              <KPICard
                title="Surat Keluar"
                value="315"
                subtitle="Bulan ini"
                icon={ArrowUpRight}
                accent="green"
                delay={0.25}
              />
              <KPICard
                title="Perlu Verifikasi"
                value="12"
                subtitle="Akurasi di bawah 80%"
                icon={AlertTriangle}
                accent="red"
                delay={0.3}
              />
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

            {/* Recent Documents */}
            <RecentDocuments />
          </div>
        </main>
      </div>
    </div>
  );
}
