import { ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function PrimaryButton({ children, onClick, disabled, type = 'submit' }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
        disabled 
          ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' 
          : 'bg-[#D49A28] text-white hover:bg-[#b8841f] hover:shadow-lg hover:shadow-[#D49A28]/10 active:shadow-none'
      }`}
    >
      {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
      {!disabled && <ArrowRight className="w-4 h-4" />}
    </motion.button>
  );
}
