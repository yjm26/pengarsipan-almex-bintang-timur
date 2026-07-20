import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext.jsx';
import api from '../../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.login(username, password);
      api.setToken(data.access_token);
      localStorage.setItem('isAuthenticated', 'true');
      addToast(`Selamat datang${data.nama_lengkap ? ', ' + data.nama_lengkap : ''}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-[100dvh] grid-cols-1 gap-5 bg-[var(--almex-bg)] p-[22px] text-[var(--almex-text)] lg:grid-cols-[minmax(520px,0.96fr)_minmax(520px,1.04fr)]">
      <section
        aria-label="PT. Almex Bintang Timur"
        className="relative min-h-[420px] overflow-hidden rounded-[22px] border border-[#d8d5cc] bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(255,255,255,0.10)),linear-gradient(155deg,#ebe9e2,#d8d4c8)] p-[34px] lg:min-h-[calc(100dvh-44px)]"
      >
        <div className="pointer-events-none absolute -bottom-[170px] -right-[150px] h-[380px] w-[380px] rounded-full border border-black/[0.06] bg-white/[0.14]" />

        <div className="relative z-10 flex h-full min-h-[352px] flex-col justify-between lg:min-h-[calc(100dvh-112px)]">
          <div className="flex items-center gap-3">
            <div className="grid h-[38px] w-[38px] place-items-center rounded-[10px] border border-black/15 bg-white/70 text-[10px] font-extrabold tracking-[0.08em] text-[var(--almex-ink)]">
              ABT
            </div>
            <p className="m-0 text-[15px] font-semibold tracking-[-0.01em] text-[var(--almex-text)]">ALMEX Arsip</p>
          </div>

          <div className="max-w-[520px] pb-9">
            <h1 className="m-0 text-[52px] font-extrabold leading-none tracking-[-0.045em] text-[var(--almex-ink)] xl:text-[78px]">
              PT. Almex
              <span className="block text-[var(--almex-ink)]">Bintang Timur</span>
            </h1>
            <div className="mt-7 h-[3px] w-[92px] rounded-full bg-[var(--almex-accent)]" />
          </div>
        </div>
      </section>

      <section aria-label="Login" className="flex min-h-[calc(100dvh-44px)] items-center justify-center px-0 py-5 lg:px-16 lg:py-10">
        <div className="w-full max-w-[430px] rounded-2xl border border-[var(--almex-border)] bg-white p-[30px] shadow-[0_18px_56px_rgba(31,31,31,0.05)]">
          <h2 className="mb-6 text-[25px] font-bold leading-tight tracking-[-0.02em] text-[var(--almex-ink)]">Login</h2>

          <form onSubmit={handleSubmit} className="grid gap-[15px]">
            <div className="grid gap-2">
              <label htmlFor="username" className="text-xs font-medium text-[var(--almex-text)]">Username</label>
              <input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Masukkan username"
                className="h-[42px] w-full rounded-[10px] border border-[var(--almex-border-strong)] bg-white px-3 text-[13px] text-[var(--almex-text)] outline-none placeholder:text-[var(--almex-text-3)] focus:border-[#b8b3ff] focus:ring-4 focus:ring-[rgba(75,60,255,0.10)]"
                autoComplete="username"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="text-xs font-medium text-[var(--almex-text)]">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password"
                className="h-[42px] w-full rounded-[10px] border border-[var(--almex-border-strong)] bg-white px-3 text-[13px] text-[var(--almex-text)] outline-none placeholder:text-[var(--almex-text-3)] focus:border-[#b8b3ff] focus:ring-4 focus:ring-[rgba(75,60,255,0.10)]"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-[#ffd7d3] bg-[#fff1f0] px-3 py-2 text-xs font-medium text-[#b42318]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-0.5 inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] border border-[var(--almex-ink)] bg-[var(--almex-ink)] text-[13px] font-semibold text-white transition-transform active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Masuk
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
