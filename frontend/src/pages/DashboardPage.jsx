import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Menu, LayoutDashboard, Upload, FileText, FileArchive, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import DashboardOverview from '../features/dashboard/DashboardOverview';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Upload, label: 'Upload Dokumen' },
  { icon: FileText, label: 'Arsip Surat' },
  { icon: FileArchive, label: 'Kategori' },
  { icon: Settings, label: 'Pengaturan' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-[#FAFAFA]">
      
      {/* Floating Toggle Button (Always Visible) */}
      <motion.button
        initial={false}
        animate={{ x: sidebarOpen ? 256 : 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-5 z-50 p-2 rounded-lg bg-white border border-zinc-200 shadow-sm hover:bg-zinc-50 text-zinc-600 transition-colors"
        style={{ left: sidebarOpen ? 'calc(256px + 12px)' : '12px' }}
      >
        {sidebarOpen ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </motion.button>

      {/* Sidebar (Fixed - Doesn't scroll with content) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -256, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -256, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 left-0 h-screen w-64 bg-[#0A0A0A] z-40 flex flex-col"
          >
            {/* Logo Area */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800/50">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-zinc-950 font-bold text-[10px] tracking-widest">ABT</span>
              </div>
              <span className="font-semibold tracking-tight text-lg text-white">Arsip</span>
            </div>

            {/* Search */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800 text-zinc-500 text-xs">
                <span className="text-lg leading-none">⌕</span>
                <span>Cari menu...</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate('/dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    item.active
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Logout (Stays at bottom, always visible) */}
            <div className="p-4 border-t border-zinc-800/50">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  localStorage.removeItem('isAuthenticated');
                  navigate('/');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                Logout
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content (Scrolls independently) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <DashboardOverview />
          </div>
        </main>
      </div>
    </div>
  );
}
