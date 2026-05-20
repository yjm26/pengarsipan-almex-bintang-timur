import { LayoutDashboard, FileText, Upload, Settings, LogOut, Menu, Bell, Search, User } from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-zinc-50 text-zinc-900">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-zinc-200 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-100">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">ABT</span>
          </div>
          {sidebarOpen && <span className="ml-3 font-semibold tracking-tight text-lg">Arsip</span>}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', active: true },
            { icon: Upload, label: 'Upload Dokumen' },
            { icon: FileText, label: 'Arsip Surat' },
            { icon: Settings, label: 'Pengaturan' },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                item.active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-zinc-100">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-zinc-100">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-zinc-100 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-zinc-900 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-zinc-600" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
            <p className="text-zinc-500 mb-8">Ringkasan data arsip dokumen perusahaan.</p>

            {/* Placeholder Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {['Total Dokumen', 'Surat Masuk', 'Surat Keluar'].map((title, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                  <p className="text-sm text-zinc-500 font-medium mb-1">{title}</p>
                  <p className="text-3xl font-semibold text-zinc-900">0</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
