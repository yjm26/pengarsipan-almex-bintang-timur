import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Menu, LayoutDashboard, Upload, FileText, Settings, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Topbar from '../../layout/Topbar';
import DashboardOverview from '../../features/dashboard/DashboardOverview';
import ArsipPage from '../../pages/arsip/ArsipPage';
import UploadForm from '../../pages/upload/UploadPage';
import SettingsPage from '../../pages/settings/SettingsPage';
import { useToast } from '../../contexts/ToastContext.jsx';
import api from '../../lib/api';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Upload, label: 'Upload Dokumen', path: '/dashboard/upload' },
  { icon: FileText, label: 'Arsip Surat', path: '/dashboard/arsip' },
  { icon: Settings, label: 'Pengaturan', path: '/dashboard/pengaturan' },
];

function resolvePage(pathname, { onNavigate } = {}) {
  if (pathname === '/dashboard') return <DashboardOverview onNavigate={onNavigate} />;
  if (pathname === '/dashboard/arsip') return <ArsipPage />;
  if (pathname === '/dashboard/upload') return <UploadForm />;
  if (pathname === '/dashboard/pengaturan') return <SettingsPage />;
  return <DashboardOverview onNavigate={onNavigate} />;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { addToast } = useToast();

  const handleLogout = () => {
    api.setToken(null);
    localStorage.removeItem('isAuthenticated');
    setShowLogoutConfirm(false);
    addToast('Berhasil logout', 'success');
    navigate('/');
  };

  const logoutButton = (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => setShowLogoutConfirm(true)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
    >
      <LogOut className="w-5 h-5 flex-shrink-0" />
      Logout
    </motion.button>
  );

  const LogoutConfirmModal = () => (
    <AnimatePresence>
      {showLogoutConfirm && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 w-full max-w-sm shadow-xl"
            >
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">Keluar dari aplikasi?</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Semua sesi aktif akan diakhiri dan Anda harus login kembali.</p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all"
                >
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const onNavigate = (page, filterParams) => {
    if (page === 'arsip') {
      const params = new URLSearchParams();
      if (filterParams?.arah) params.set('arah', filterParams.arah);
      if (filterParams?.confidence) params.set('confidence', filterParams.confidence);
      navigate(`/dashboard/arsip?${params}`);
    }
    setSidebarOpen(false);
  };

  const activePath = useMemo(() => {
    const base = location.pathname.split('/').slice(0, 3).join('/');
    return menuItems.find((item) => item.path === base)?.path || '/dashboard';
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] dark:bg-zinc-950 transition-colors">

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -256, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -256, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 left-0 h-screen w-64 bg-[#0A0A0A] z-50 flex flex-col lg:shadow-xl"
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
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
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
              {logoutButton}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop fixed sidebar (always visible on lg+) */}
      <motion.aside
        className="hidden lg:flex fixed top-0 left-0 h-screen w-64 bg-[#0A0A0A] z-30 flex-col"
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
          {logoutButton}
        </div>
      </motion.aside>

      {/* Main Content — always full width on mobile, shifted on desktop */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {resolvePage(location.pathname, { onNavigate })}
          </div>
        </main>
      </div>
      <LogoutConfirmModal />
    </div>
  );
}
