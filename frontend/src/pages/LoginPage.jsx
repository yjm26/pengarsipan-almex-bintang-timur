import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { InputField } from '../components/Input';
import { PrimaryButton } from '../components/Button';
import { BrandPanel } from '../components/BrandPanel';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <BrandPanel />
      
      {/* Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow border border-zinc-100 p-1">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <span className="text-[#111111] font-bold text-[10px] hidden">ABT</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Arsip Surat</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">Selamat Datang</h1>
            <p className="text-zinc-500 mt-2 text-sm">Silakan masuk untuk mengakses sistem.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField 
              label="Username" 
              placeholder="Masukkan username" 
              icon={Mail} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <InputField 
              type="password" 
              label="Password" 
              placeholder="Masukkan password" 
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
            
            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

            <PrimaryButton>Masuk</PrimaryButton>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-400">
            © 2025 PT. Almex Bintang Timur
          </p>
        </div>
      </div>
    </div>
  );
}
