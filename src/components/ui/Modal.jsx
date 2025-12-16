import React, { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UI } from './uiPrimitives';

const Modal = ({ open, onClose, title, subtitle, footer, children }) => {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" aria-hidden />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`relative w-full max-w-2xl ${UI.card} bg-popover text-popover-foreground p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || subtitle) && (
              <div className="flex items-start justify-between gap-4">
                <div>
                  {title && <h3 className={UI.h2}>{title}</h3>}
                  {subtitle && <p className={UI.meta}>{subtitle}</p>}
                </div>
                <button
                  type="button"
                  aria-label="Schließen"
                  onClick={handleClose}
                  className={UI.btnQuiet}
                >
                  ×
                </button>
              </div>
            )}
            <div className="mt-4">{children}</div>
            {footer && <div className="mt-6 pt-4 border-t border-border/60">{footer}</div>}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default Modal;
