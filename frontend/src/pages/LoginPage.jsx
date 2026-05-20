import { useState } from 'react';
import { FileText, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 text-white overflow-hidden">
        {/* Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <FileText className="text-zinc-950 w-6 h-6" />
            </div>
            <span className="text-xl font-semibold tracking-tight">ArsipPro</span>
          </div>

          {/* Center Message */}
          <div className="max-w-md">
            <h2 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-tight mb-6">
              Kelola Arsip Dokumen <br/>
              <span className="text-zinc-400">Lebih Cerdas.</span>
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Sistem pengarsipan otomatis berbasis AI yang mengklasifikasikan surat masuk & keluar secara instan.
            </p>
          </div>

          {/* Bottom Stats */}
          <div className="flex gap-12">
            <div>
              <p className="text-3xl font-semibold">2-Level</p>
              <p className="text-sm text-zinc-500 mt-1">Klasifikasi AI</p>
            </div>
            <div>
              <p className="text-3xl font-semibold">&lt;5s</p>
              <p className="text-sm text-zinc-500 mt-1">Proses per Dokumen</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center">
              <FileText className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-semibold tracking-tight">ArsipPro</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Selamat Datang
            </h1>
            <p className="text-zinc-500 mt-2">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-950">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@almex.co.id"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-950">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Lupa password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-200 rounded transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-zinc-950 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 group"
            >
              Masuk ke Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-zinc-500">
            © 2025 PT. Almex Bintang Timur. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
