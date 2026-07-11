import { motion } from 'framer-motion';

export function BrandPanel() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1, ease: "easeOut" }}
      className="hidden lg:flex lg:w-1/2 relative bg-[#050505] text-white overflow-hidden"
    >
      {/* Ambient Lighting / Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#D49A28] opacity-[0.04] rounded-full blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-zinc-800 opacity-[0.15] rounded-full blur-[120px]" />
      
      {/* Dot Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-between p-16">
        
        {/* Top Brand */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border border-zinc-800 bg-zinc-900/50 backdrop-blur-md flex items-center justify-center rounded-xl shadow-2xl shadow-black/50">
               <span className="text-zinc-100 font-bold tracking-widest text-sm">ABT</span>
            </div>
            <span className="text-sm font-medium tracking-[0.2em] uppercase text-zinc-500">Arsip Surat</span>
          </div>
        </motion.div>

        {/* Center Message */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.5, duration: 0.7 }}
          className="space-y-8"
        >
          <h1 className="text-6xl font-semibold tracking-tight leading-[1.05]">
            PT. Almex <br />
            <span className="text-zinc-500">Bintang Timur</span>
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="h-px w-16 bg-[#D49A28]" />
            <p className="text-lg text-zinc-400 font-light max-w-md leading-relaxed">
              Sistem manajemen arsip digital terintegrasi untuk efisiensi dan keamanan dokumen perusahaan.
            </p>
          </div>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-500">Sistem Aktif</span>
          </div>
          <div className="h-3 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs text-zinc-500">v1.0.0</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
