import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Archive, FileText, LayoutDashboard, Menu, Settings, Upload, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Topbar from '../../layout/Topbar';
import DashboardOverview from '../../features/dashboard/DashboardOverview';
import ArsipPage from '../../pages/arsip/ArsipPage';
import UploadForm from '../../pages/upload/UploadPage';
import SettingsPage from '../../pages/settings/SettingsPage';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Upload, label: 'Upload Dokumen', path: '/dashboard/upload' },
  { icon: FileText, label: 'Arsip Surat', path: '/dashboard/arsip' },
  { icon: Settings, label: 'Pengaturan', path: '/dashboard/pengaturan' },
];

const collections = ['Keuangan', 'Pembelian', 'Penawaran', 'Surat Jalan'];

function resolvePage(pathname, { onNavigate } = {}) {
  if (pathname === '/dashboard') return <DashboardOverview onNavigate={onNavigate} />;
  if (pathname === '/dashboard/arsip') return <ArsipPage />;
  if (pathname === '/dashboard/upload') return <UploadForm />;
  if (pathname === '/dashboard/pengaturan') return <SettingsPage />;
  return <DashboardOverview onNavigate={onNavigate} />;
}

function resolveTitle(pathname) {
  if (pathname === '/dashboard/arsip') return 'Arsip Surat';
  if (pathname === '/dashboard/upload') return 'Upload Dokumen';
  if (pathname === '/dashboard/pengaturan') return 'Pengaturan';
  return 'Dashboard';
}

function SidebarContent({ activePath, onNavigate }) {
  return (
    <div className="flex h-full flex-col gap-4 px-2.5 py-3.5">
      <div className="flex items-center gap-2.5 border-b border-[var(--almex-border)] px-2 pb-3">
        <div className="grid h-7 w-7 place-items-center rounded-[7px] border border-[var(--almex-border-strong)] bg-white text-[10px] font-bold tracking-[0.08em] text-[var(--almex-text)]">
          ABT
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--almex-text)]">ALMEX Arsip</p>
          <p className="mt-[-2px] text-[11px] text-[var(--almex-text-3)]">Document workspace</p>
        </div>
      </div>

      <section className="px-1">
        <p className="mb-1.5 px-2 text-[11px] text-[var(--almex-text-3)]">Menu</p>
        <nav className="grid gap-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activePath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`flex h-[34px] items-center gap-2.5 rounded-md px-2.5 text-left text-[13px] transition-colors ${
                  active
                    ? 'bg-[var(--almex-muted-2)] font-medium text-[var(--almex-text)]'
                    : 'text-[#555] hover:bg-[var(--almex-muted)]'
                }`}
              >
                <Icon className="h-3.5 w-3.5 opacity-80" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </section>

      <section className="px-1">
        <p className="mb-1.5 px-2 text-[11px] text-[var(--almex-text-3)]">Koleksi</p>
        <div className="grid gap-0.5">
          {collections.map((item) => (
            <div key={item} className="flex h-[34px] items-center gap-2.5 rounded-md px-2.5 text-[13px] text-[#555]">
              <Archive className="h-3.5 w-3.5 opacity-70" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-auto border-t border-[var(--almex-border)] px-2 pt-3 text-xs text-[var(--almex-text-2)]">
        <strong className="block font-medium text-[var(--almex-text)]">Admin Dokumen</strong>
        <span>PT. Almex Bintang Timur</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const activePath = useMemo(() => {
    const base = location.pathname.split('/').slice(0, 3).join('/');
    return menuItems.find((item) => item.path === base)?.path || '/dashboard';
  }, [location.pathname]);

  const onNavigate = (pathOrPage, filterParams) => {
    if (pathOrPage === 'arsip') {
      const params = new URLSearchParams();
      if (filterParams?.arah) params.set('arah', filterParams.arah);
      if (filterParams?.confidence) params.set('confidence', filterParams.confidence);
      navigate(`/dashboard/arsip${params.toString() ? `?${params}` : ''}`);
    } else {
      navigate(pathOrPage);
    }
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--almex-bg)] text-[var(--almex-text)]">
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="fixed left-3 top-3 z-30 grid h-8 w-8 place-items-center rounded-md border border-[var(--almex-border)] bg-white text-[var(--almex-text-2)] lg:hidden"
        aria-label="Buka menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-[248px] border-r border-[var(--almex-border)] bg-[var(--almex-bg)] lg:block">
        <SidebarContent activePath={activePath} onNavigate={onNavigate} />
      </aside>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/35 lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 top-0 z-50 h-screen w-[248px] border-r border-[var(--almex-border)] bg-[var(--almex-bg)] lg:hidden"
            >
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-md border border-[var(--almex-border)] bg-white text-[var(--almex-text-2)]"
                aria-label="Tutup menu"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <SidebarContent activePath={activePath} onNavigate={onNavigate} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="min-w-0 lg:pl-[248px]">
        <Topbar pageTitle={resolveTitle(location.pathname)} />
        <main className="px-4 py-[18px] sm:px-5">
          <div className="mx-auto max-w-[1280px]">
            {resolvePage(location.pathname, { onNavigate })}
          </div>
        </main>
      </div>
    </div>
  );
}
