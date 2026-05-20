import { motion } from 'framer-motion';
import { LogOut, Search, LayoutDashboard, FileText, Upload, FileArchive, Settings, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ sidebarOpen, onClose }) {
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true, path: '/dashboard' },
    { icon: Upload, label: 'Upload Dokumen', path: '/dashboard/upload' },
    { icon: FileText, label: 'Arsip Surat', path: '/dashboard/arsip' },
    { icon: FileArchive, label: 'Kategori', path: '/dashboard/kategori' },
    { icon: Settings, label: 'Pengaturan', path: '/dashboard/pengaturan' },
  ];

  return (
    <motion.aside
      initial={{ x: -256, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -256, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-64 bg-[#0A0A0A] flex-shrink-0 flex flex-col relative z-20"
    >
      {/* Header: Logo + Close Button */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-zinc-950 font-bold text-[10px] tracking-widest">ABT</span>
          </div>
          <span className="font-semibold tracking-tight text-lg text-white">Arsip</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onClose}
          className="p-1.5 rounded-full bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Search */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800 text-zinc-500 text-xs">
          <Search className="w-3.5 h-3.5" />
          <span>Cari menu...</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.path)}
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
  );
}
