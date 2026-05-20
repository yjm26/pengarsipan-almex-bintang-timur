import { FileText } from 'lucide-react';

export function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-[#111111] text-white overflow-hidden">
      {/* Subtle Dot Pattern */}
      <div 
        className="absolute inset-0 opacity-5" 
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #D49A28 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Gold Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D49A28]/15 via-transparent to-transparent" />
      
      {/* Gold Decorative Circle */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full border border-[#D49A28]/20" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full border border-[#D49A28]/10" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D49A28] rounded-xl flex items-center justify-center shadow-lg shadow-[#D49A28]/20">
            <FileText className="text-[#111111] w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight">ArsipPro</span>
            <p className="text-[10px] text-zinc-500 tracking-wider uppercase">PT. Almex Bintang Timur</p>
          </div>
        </div>

        {/* Center Message */}
        <div className="max-w-md">
          <h2 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-tight mb-6">
            Kelola Arsip <br/>
            <span className="text-[#D49A28]">Lebih Cerdas.</span>
          </h2>
          <p className="text-base text-zinc-400 leading-relaxed">
            Sistem pengarsipan otomatis berbasis AI untuk klasifikasi surat masuk & keluar. 
            Menggantikan proses manual yang rentan kesalahan.
          </p>
        </div>

        {/* Bottom Stats */}
        <div className="flex gap-12">
          <div>
            <p className="text-3xl font-semibold text-white">2-Level</p>
            <p className="text-xs text-zinc-500 mt-1 tracking-wide uppercase">Klasifikasi AI</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-white">&lt;5s</p>
            <p className="text-xs text-zinc-500 mt-1 tracking-wide uppercase">Proses per Dokumen</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-white">99%</p>
            <p className="text-xs text-zinc-500 mt-1 tracking-wide uppercase">Akurasi Model</p>
          </div>
        </div>
      </div>
    </div>
  );
}
