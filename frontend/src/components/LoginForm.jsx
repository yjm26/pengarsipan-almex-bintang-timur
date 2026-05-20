import { useState } from 'react';
import { FileText, Mail, Lock } from 'lucide-react';
import { InputField } from './Input';
import { PrimaryButton } from './Button';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-sm">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#D49A28] rounded-xl flex items-center justify-center">
            <FileText className="text-[#111111] w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight">ArsipPro</span>
            <p className="text-[10px] text-zinc-500 tracking-wider uppercase">PT. Almex Bintang Timur</p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">Selamat Datang</h1>
          <p className="text-zinc-500 mt-2 text-sm">Masuk ke akun Anda untuk melanjutkan</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField 
            type="email" 
            label="Email" 
            placeholder="admin@almex.co.id" 
            icon={Mail} 
          />
          <InputField 
            type="password" 
            label="Password" 
            placeholder="••••••••" 
            icon={Lock} 
          />
          
          <div className="flex justify-end">
            <a href="#" className="text-sm font-medium text-[#D49A28] hover:opacity-80 transition-opacity">Lupa password?</a>
          </div>

          <PrimaryButton>Masuk ke Dashboard</PrimaryButton>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-zinc-400">
          © 2025 PT. Almex Bintang Timur. All rights reserved.
        </p>
      </div>
    </div>
  );
}
