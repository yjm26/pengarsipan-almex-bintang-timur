import { motion } from 'framer-motion';
import { Bell, User, Search } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-zinc-200/60 flex items-center justify-end px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-lg border border-zinc-200 text-zinc-500 text-sm w-64 focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400 transition-all">
          <Search className="w-4 h-4" />
          <input type="text" placeholder="Try to search..." className="bg-transparent outline-none w-full placeholder:text-zinc-400" />
        </div>

        {/* Notifications */}
        <motion.button whileTap={{ scale: 0.95 }} className="p-2 rounded-lg hover:bg-zinc-100 relative text-zinc-600 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </motion.button>

        {/* Profile */}
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
  );
}
