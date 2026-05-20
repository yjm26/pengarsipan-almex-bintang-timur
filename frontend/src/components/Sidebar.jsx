import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Search, LayoutDashboard, FileText, Upload, FileArchive, Settings, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Upload, label: 'Upload Dokumen' },
    { icon: FileText, label: 'Arsip Surat' },
    { icon: FileArchive, label: 'Kategori' },
    { icon: Settings, label: 'Pengaturan' },
  ];

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-[72px]'} bg-[#0A0A0A] transition-all duration-300 flex flex-col flex-shrink-0`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-zinc-800/50">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/50">
          <span className="text-zinc-950 font-bold text-[10px] tracking-widest">ABT</span>
        </div>
        {sidebarOpen && <span className="ml-3 font-semibold tracking-tight text-lg text-white">Arsip</span>}
      </div>

      {/* Search */}
      {sidebarOpen && (
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/60 rounded-lg border border-zinc-800 text-zinc-500 text-xs">
            <Search className="w-3.5 h-3.5" />
            <span>Cari menu...</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {menuItems.map((item, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              item.active 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && item.label}
            {sidebarOpen && item.active && <ChevronRight className="w-3 h-3 ml-auto text-zinc-500" />}
          </motion.button>
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
          {sidebarOpen && 'Logout'}
        </motion.button>
      </div>
    </aside>
  );
}
