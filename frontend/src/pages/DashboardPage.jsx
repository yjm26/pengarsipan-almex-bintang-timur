import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Menu, LayoutDashboard, Upload, FileText, Settings, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Topbar from '../components/Topbar';
import DashboardOverview from '../features/dashboard/DashboardOverview';
import ArsipPage from '../features/arsip/ArsipPage';
import UploadForm from '../features/upload/UploadForm';
import SettingsPage from '../features/settings/SettingsPage';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Upload, label: 'Upload Dokumen', path: '/dashboard/upload' },
  { icon: FileText, label: 'Arsip Surat', path: '/dashboard/arsip' },
  { icon: Settings, label: 'Pengaturan', path: '/dashboard/pengaturan' },
];

function resolvePage(pathname) {
  if (pathname === '/dashboard') return <DashboardOverview />;
  if (pathname === '/dashboard/arsip') return <ArsipPage />;
  if (pathname === '/dashboard/upload') return <UploadForm />;
  if (pathname === '/dashboard/pengaturan') return <SettingsPage />;
  return <DashboardOverview />;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activePath = useMemo(() => {
    const base = location.pathname.split('/').slice(0, 3).join('/');
    return menuItems.find((item) => item.path === base)?.path || '/dashboard';
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-[#FAFAFA]">

      {/* Floating Toggle Button (Snapped to sidebar edge) */}
      <motion.button
        initial={false}
        animate={{ left: sidebarOpen ? '256px' : '0px' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-1/2 -translate-y-1/2 z-50 p-2 rounded-r-lg bg-[#0A0A0A] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors shadow-lg"
        style={{ left: sidebarOpen ? '256px' : '0px' }}
      >
        {sidebarOpen ? <ChevronRight className="w-4 h-4 rotate-180" /> : <ChevronRight className="w-4 h-4" />}
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
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activePath === item.path
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Logout */}
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
            {resolvePage(location.pathname)}
          </div>
        </main>
      </div>
    </div>
  );
}
