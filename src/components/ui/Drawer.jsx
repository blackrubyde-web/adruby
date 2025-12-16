import React, { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UI } from './uiPrimitives';

const sideConfig = {
  right: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  left: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
};

const Drawer = ({ open, onClose, title, subtitle, side = 'right', width = 'max-w-xl', children }) => {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  const motionProps = sideConfig[side] || sideConfig.right;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" aria-hidden />
          <motion.div
            {...motionProps}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className={`relative h-[90vh] sm:h-auto sm:min-h-full w-full sm:w-auto ${width} ${UI.card} bg-popover text-popover-foreground p-6 overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || subtitle) && (
              <div className="flex items-start justify-between gap-3">
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
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default Drawer;
