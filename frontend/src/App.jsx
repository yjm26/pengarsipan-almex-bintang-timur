import { LayoutDashboard, FileText, Upload, Settings, LogOut, Menu, Bell, Search } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 p-6 flex flex-col hidden md:flex">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">ArsipPro</h1>
        </div>

        <nav className="space-y-1.5 flex-1">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active />
          <NavItem icon={<Upload />} label="Upload Dokumen" />
          <NavItem icon={<FileText />} label="Arsip Surat" />
          <NavItem icon={<Settings />} label="Pengaturan" />
        </nav>

        <button className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 hover:bg-zinc-100 rounded-lg">
              <Menu className="w-5 h-5 text-zinc-600" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Cari dokumen..." 
                className="pl-9 pr-4 py-2 w-64 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-zinc-100 rounded-full relative">
              <Bell className="w-5 h-5 text-zinc-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 bg-zinc-200 rounded-full"></div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h2>
            <p className="text-zinc-500 mt-1">Selamat datang kembali, Admin.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Dokumen" value="1,240" trend="+12%" />
            <StatCard title="Surat Masuk" value="850" trend="+5%" />
            <StatCard title="Surat Keluar" value="390" trend="+18%" />
          </div>

          {/* Recent Activity / Table Placeholder */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-zinc-200 bg-zinc-50/50">
              <h3 className="font-semibold text-zinc-900">Dokumen Terbaru</h3>
            </div>
            <div className="p-12 text-center text-zinc-500 text-sm">
              Data akan muncul di sini setelah sistem terhubung ke Backend.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active 
        ? 'bg-blue-50 text-blue-700' 
        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
    }`}>
      <span className={active ? 'text-blue-600' : 'text-zinc-500'}>{icon}</span>
      {label}
    </button>
  );
}

function StatCard({ title, value, trend }) {
  return (
    <div className="p-6 border border-zinc-200 rounded-xl bg-white hover:shadow-sm transition-shadow">
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-zinc-900">{value}</span>
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>
      </div>
    </div>
  );
}

export default App;
