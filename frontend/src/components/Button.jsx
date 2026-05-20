import { ArrowRight } from 'lucide-react';

export function PrimaryButton({ children, onClick }) {
  return (
    <button
      type="submit"
      onClick={onClick}
      className="w-full py-2.5 px-4 bg-[#D49A28] text-white text-sm font-semibold rounded-lg hover:bg-[#C08A20] focus:outline-none focus:ring-2 focus:ring-[#D49A28]/30 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 group shadow-md shadow-[#D49A28]/20"
    >
      {children}
      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}
