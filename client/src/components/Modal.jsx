import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, children, labelledBy, variant = 'dark' }) {
  useEffect(() => {
    if (!open) return undefined;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const isLight = variant === 'light';

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`absolute inset-0 backdrop-blur-sm ${isLight ? 'bg-gray-900/50' : 'bg-ink/80'}`}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className={`relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:p-8 ${
              isLight ? 'border-gray-200 bg-white text-gray-900' : 'border-line bg-ink-soft text-paper'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`absolute right-4 top-4 rounded-full border p-1.5 transition-colors focus-visible:ring-2 ${
                isLight
                  ? 'border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900 focus-visible:ring-gray-900'
                  : 'border-line text-stone hover:border-accent hover:text-accent focus-visible:ring-accent'
              }`}
            >
              <X className="size-4" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
