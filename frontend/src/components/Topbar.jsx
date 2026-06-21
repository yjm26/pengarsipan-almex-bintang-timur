import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, Search, Moon, Sun, Menu, FileText, CheckCircle2, AlertTriangle, X } from 'lucide-react';

const mockNotifications = [
  { id: 1, type: 'success', title: 'Klasifikasi Selesai', desc: '12 dokumen baru telah diklasifikasi.', time: '2 menit lalu', read: false },
  { id: 2, type: 'warning', title: 'Confidence Rendah', desc: '3 dokumen memiliki akurasi di bawah 75%.', time: '15 menit lalu', read: false },
  { id: 3, type: 'info', title: 'Upload Berhasil', desc: 'Surat_PO_ABT_042.pdf berhasil diarsipkan.', time: '1 jam lalu', read: true },
  { id: 4, type: 'info', title: 'Backup Harian', desc: 'Backup database otomatis selesai.', time: '3 jam lalu', read: true },
  { id: 5, type: 'success', title: 'Model Retrained', desc: 'Model klasifikasi telah di-retrain dengan 45 dokumen baru.', time: 'Kemarin', read: true },
];

export default function Topbar({ onOpenSidebar }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200/60 dark:border-zinc-800 flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-10 transition-colors">
      {/* Mobile Hamburger */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onOpenSidebar}
        className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all"
      >
        <Menu className="w-5 h-5" />
      </motion.button>

      {/* Search Bar - full width */}
      <div className="hidden md:flex flex-1 items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-sm max-w-xl focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400 transition-all">
        <Search className="w-4 h-4 flex-shrink-0" />
        <input type="text" placeholder="Cari dokumen..." className="bg-transparent outline-none w-full placeholder:text-zinc-400 dark:placeholder:text-zinc-500" />
      </div>

      <div className="flex items-center gap-3 lg:gap-4 ml-auto">

        {/* Dark Mode Toggle */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-all"
          title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 relative text-zinc-600 dark:text-zinc-400 transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">{unreadCount}</span>
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <>
                {/* Backdrop */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />

                {/* Dropdown */}
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-80 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200/60 dark:border-zinc-700 z-50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-700">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-[#D49A28] hover:text-[#C08A20] font-medium">Tandai semua dibaca</button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`px-4 py-3 border-b border-zinc-50 dark:border-zinc-700/50 last:border-0 ${
                        !n.read ? 'bg-zinc-50/50 dark:bg-zinc-800/50' : ''
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5 ${
                            n.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' :
                            n.type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
                            'bg-blue-50 dark:bg-blue-500/10 text-blue-600'
                          }`}>
                            {n.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                             n.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                             <FileText className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{n.title}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{n.desc}</p>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">{n.time}</p>
                          </div>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-[#D49A28] flex-shrink-0 mt-2" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 text-center">
                    <button onClick={() => setNotifOpen(false)} className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium">
                      Tutup
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-200 dark:border-zinc-700">
          <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
            <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="flex flex-col items-start hidden sm:block">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white leading-none">Hi, Admin</span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium uppercase tracking-wide">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
