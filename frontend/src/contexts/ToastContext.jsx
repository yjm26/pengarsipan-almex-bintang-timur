import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', action = null) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, action }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border min-w-[280px] max-w-[400px] ${
                toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  : toast.type === 'error'
                  ? 'bg-red-50 border-red-100 text-red-800'
                  : 'bg-blue-50 border-blue-100 text-blue-800'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />}
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              {toast.action && (
                <button 
                  onClick={() => { toast.action.onClick(); removeToast(toast.id); }}
                  className="text-xs font-semibold px-2 py-1 rounded bg-white/50 hover:bg-white transition-colors whitespace-nowrap"
                >
                  {toast.action.label}
                </button>
              )}
              <button onClick={() => removeToast(toast.id)} className="p-1 rounded hover:bg-black/5 transition-all">
                <X className="w-3.5 h-3.5 opacity-60" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
