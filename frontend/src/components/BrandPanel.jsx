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
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 w-full">
        
        {/* Top Logo */}
        <div className="flex items-center gap-3 mb-16">
          {/* Placeholder for Logo - User should put logo.png in public/ */}
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
            <span className="text-[#111111] font-bold text-[10px] hidden">ABT</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">Arsip Surat</span>
        </div>

        {/* Center Corporate Text */}
        <div className="max-w-md">
          <h2 className="text-4xl xl:text-5xl font-bold tracking-tight leading-tight mb-6">
            PT. Almex Bintang Timur
          </h2>
          <p className="text-lg text-[#D49A28] font-medium">
            Membangun dengan Integritas, Melayani dengan Kualitas
          </p>
        </div>
      </div>
    </div>
  );
}
