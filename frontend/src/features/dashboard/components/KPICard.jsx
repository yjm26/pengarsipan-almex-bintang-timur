import { motion } from 'framer-motion';

export default function KPICard({ title, value, subtitle, icon: Icon, accent = 'zinc', delay = 0, onClick }) {
  const accentMap = {
    gold: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  const isClickable = !!onClick;

  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={`bg-white rounded-xl border border-zinc-200/60 p-6 transition-all ${
        isClickable ? 'cursor-pointer hover:border-[#D49A28]/40 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${accentMap[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {isClickable && (
          <span className="text-xs text-zinc-400">→</span>
        )}
      </div>
      <p className="text-3xl font-semibold tracking-tight text-zinc-900">{value || '—'}</p>
      <p className="text-sm font-medium text-zinc-900 mt-1">{title}</p>
      {subtitle && (
        <p className="text-xs text-zinc-400 mt-1 font-light">{subtitle}</p>
      )}
    </motion.div>
  );
}
