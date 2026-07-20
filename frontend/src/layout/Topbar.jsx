import { useEffect, useState } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext.jsx';

function roleLabel(role) {
  const labels = {
    owner: 'Owner',
    super_admin: 'Super Admin',
    admin: 'Administrator',
    admin_dokumen: 'Admin Dokumen',
  };
  return labels[role] || role || 'User';
}

export default function Topbar({ pageTitle = 'Dashboard' }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [user, setUser] = useState({ nama: 'User', role: 'User' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.getMe()
      .then((data) => {
        if (!mounted) return;
        setUser({
          nama: data.nama_lengkap || data.username || 'User',
          role: roleLabel(data.role),
        });
      })
      .catch(() => {
        if (mounted) setUser({ nama: 'User', role: 'User' });
      });
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    api.setToken(null);
    localStorage.removeItem('isAuthenticated');
    setShowLogoutConfirm(false);
    addToast('Berhasil logout', 'success');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 flex h-[54px] items-center justify-between border-b border-[var(--almex-border)] bg-[rgba(247,247,246,0.86)] px-5 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-xs text-[var(--almex-text-2)]">
        <span>Workspace</span>
        <span>/</span>
        <strong className="font-medium text-[var(--almex-text)]">{pageTitle}</strong>
      </div>

      <div className="flex items-center gap-2.5 text-xs text-[var(--almex-text-2)]">
        <button className="grid h-[30px] w-[30px] place-items-center rounded-md border border-[var(--almex-border-strong)] bg-white text-[var(--almex-text-2)]" aria-label="Notifikasi">
          <Bell className="h-3.5 w-3.5" />
        </button>
        <span className="text-[var(--almex-border-strong)]">|</span>
        <div className="hidden min-w-0 text-right sm:block">
          <strong className="block max-w-[180px] truncate text-[13px] font-semibold leading-4 text-[var(--almex-text)]">{user.nama}</strong>
          <span className="block text-xs font-medium leading-4 text-[var(--almex-text-3)]">{user.role}</span>
        </div>
        <span className="text-[var(--almex-border-strong)]">|</span>
        <button onClick={() => setShowLogoutConfirm(true)} className="grid h-[30px] w-[30px] place-items-center rounded-md border border-[var(--almex-border-strong)] bg-white text-[var(--almex-text-2)] hover:text-[var(--almex-text)]" aria-label="Logout">
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[10px] border border-[var(--almex-border)] bg-white p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-[var(--almex-text)]">Keluar dari aplikasi?</h3>
            <p className="mt-1 text-xs text-[var(--almex-text-2)]">Sesi aktif akan diakhiri dan Anda perlu login kembali.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowLogoutConfirm(false)} className="h-8 rounded-md border border-[var(--almex-border)] bg-white px-3 text-xs text-[var(--almex-text-2)]">Batal</button>
              <button onClick={handleLogout} className="h-8 rounded-md border border-[var(--almex-ink)] bg-[var(--almex-ink)] px-3 text-xs font-medium text-white">Logout</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
