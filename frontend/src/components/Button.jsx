import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function PrimaryButton({ children, onClick, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      type="submit"
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#D49A28]/10 ${
        disabled 
          ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none' 
          : 'bg-[#D49A28] text-white hover:bg-[#b8841f] hover:shadow-[#D49A28]/20 active:shadow-none'
      }`}
    >
      {children}
      {!disabled && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
    </motion.button>
  );
}
