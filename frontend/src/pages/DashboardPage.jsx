import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Upload, Settings, LogOut, Menu, Bell, User } from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex bg-[#FAFAFA] text-zinc-900"
    >
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-zinc-200/60 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-100">
          <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-[10px] tracking-widest">ABT</span>
          </div>
          {sidebarOpen && <span className="ml-3 font-semibold tracking-tight text-lg text-zinc-900">Arsip</span>}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1.5">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', active: true },
            { icon: Upload, label: 'Upload Dokumen' },
            { icon: FileText, label: 'Arsip Surat' },
            { icon: Settings, label: 'Pengaturan' },
          ].map((item, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                item.active 
                  ? 'bg-zinc-100 text-zinc-900 shadow-sm' 
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && item.label}
            </motion.button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-zinc-100">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && 'Logout'}
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 flex items-center justify-between px-6 sticky top-0 z-10">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-600"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center gap-4">
            <motion.button whileTap={{ scale: 0.95 }} className="p-2 rounded-lg hover:bg-zinc-100 relative text-zinc-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </motion.button>
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
              <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
                <User className="w-4 h-4 text-zinc-600" />
              </div>
              {sidebarOpen && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-zinc-900 leading-none">Admin</span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Super Admin</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
              <p className="text-zinc-500 mt-1 font-light">Ringkasan data arsip dokumen perusahaan.</p>
            </motion.div>

            {/* Placeholder Cards */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {['Total Dokumen', 'Surat Masuk', 'Surat Keluar'].map((title, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-zinc-200/60 shadow-sm hover:border-zinc-300 transition-colors">
                  <p className="text-xs font-semibold tracking-wide uppercase text-zinc-500 mb-3">{title}</p>
                  <p className="text-4xl font-semibold text-zinc-900 tracking-tight">0</p>
                </div>
              ))}
            </motion.div>
          </div>
        </main>
      </div>
    </motion.div>
  );
}
