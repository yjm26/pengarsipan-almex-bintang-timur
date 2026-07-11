import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { InputField } from '../components/Input';
import { PrimaryButton } from '../components/Button';
import { BrandPanel } from '../components/BrandPanel';
import api from '../lib/api';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.login(username, password);
      api.setToken(data.access_token);
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Username atau password salah.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-white">
      <BrandPanel />
      
      {/* Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800 shadow-lg">
            <span className="text-white font-bold text-[10px] tracking-widest">ABT</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900">Arsip</span>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-sm"
        >
          
          {/* Header */}
          <motion.div variants={item} className="mb-10 pt-12 lg:pt-0">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Selamat Datang</h1>
            <p className="text-zinc-500 mt-3 text-base font-light leading-relaxed">
              Masuk untuk mengakses sistem arsip PT. Almex Bintang Timur.
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={item}>
              <InputField 
                label="Username" 
                placeholder="Masukkan username" 
                icon={Mail} 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </motion.div>

            <motion.div variants={item}>
              <InputField 
                type="password" 
                label="Password" 
                placeholder="Masukkan password" 
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
            </motion.div>
            
            <motion.div variants={item} className="flex justify-end">
              <span className="text-sm font-medium text-zinc-400 cursor-default">Lupa password? Hubungi admin</span>
            </motion.div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-md border border-red-100"
              >
                {error}
              </motion.p>
            )}

            <motion.div variants={item}>
              <PrimaryButton disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </PrimaryButton>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.p variants={item} className="mt-12 text-center text-xs text-zinc-400 tracking-wide">
            ALMEX Arsip v1.0.0
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
