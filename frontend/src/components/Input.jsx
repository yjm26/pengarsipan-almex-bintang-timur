import { Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export function InputField({ type = 'text', label, placeholder, icon: Icon, value, onChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-2">
      <label className={`text-xs font-semibold tracking-wide uppercase transition-colors duration-200 ${
        isFocused ? 'text-[#D49A28]' : 'text-zinc-500'
      }`}>
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
            isFocused ? 'text-[#D49A28]' : 'text-zinc-400'
          }`} />
        )}
        <motion.input
          whileFocus={{ scale: 1.005 }}
          type={inputType}
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-11' : 'pr-4'} py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:bg-white focus:border-[#D49A28]/50 focus:ring-4 focus:ring-[#D49A28]/5 transition-all placeholder:text-zinc-300`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
