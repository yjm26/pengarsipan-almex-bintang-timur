import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Upload, Settings, LogOut, Menu, Bell, User, Search, ChevronRight, FileArchive } from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Upload, label: 'Upload Dokumen' },
    { icon: FileText, label: 'Arsip Surat' },
    { icon: FileArchive, label: 'Kategori' },
    { icon: Settings, label: 'Pengaturan' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex bg-[#F8F8FA]"
    >
      {/* Sidebar - Dark Theme for Premium Feel */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-[72px]'} bg-[#0A0A0A] transition-all duration-300 flex flex-col flex-shrink-0`}>
        
        {/* Logo Area */}
        <div className="h-16 flex items-center px-5 border-b border-zinc-800/50">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/50">
            <span className="text-zinc-950 font-bold text-[10px] tracking-widest">ABT</span>
          </div>
          {sidebarOpen && <span className="ml-3 font-semibold tracking-tight text-lg text-white">Arsip</span>}
        </div>

        {/* Search Bar (Sidebar) */}
        {sidebarOpen && (
          <div className="px-4 py-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/60 rounded-lg border border-zinc-800 text-zinc-500 text-xs">
              <Search className="w-3.5 h-3.5" />
              <span>Cari menu...</span>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {menuItems.map((item, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
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

        {/* Bottom Logout */}
        <div className="p-4 border-t border-zinc-800/50">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && 'Logout'}
          </motion.button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-zinc-200/60 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-600"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900 hidden sm:block">Dashboard</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Search (Topbar - Desktop) */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-lg border border-zinc-200 text-zinc-500 text-sm w-64 focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400 transition-all">
              <Search className="w-4 h-4" />
              <input type="text" placeholder="Try to search..." className="bg-transparent outline-none w-full placeholder:text-zinc-400" />
            </div>

            <motion.button whileTap={{ scale: 0.95 }} className="p-2 rounded-lg hover:bg-zinc-100 relative text-zinc-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </motion.button>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
              <div className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
                <User className="w-4 h-4 text-zinc-600" />
              </div>
              <div className="flex flex-col items-start hidden sm:block">
                <span className="text-sm font-semibold text-zinc-900 leading-none">Hi, Admin</span>
                <span className="text-[10px] text-zinc-500 mt-1 font-medium uppercase tracking-wide">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Placeholder - Overview content will go here later */}
          </div>
        </main>
      </div>
    </motion.div>
  );
}
