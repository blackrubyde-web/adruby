import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const MetaConnectionModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e?.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                  <Icon name="Facebook" size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Facebook Ads verbinden
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Authentifiziere dich mit Facebook
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Verbinde dein Facebook Konto über Supabase OAuth. Es sind keine manuellen Tokens erforderlich.
              </p>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                iconName="Facebook"
                iconPosition="left"
                onClick={() => {
                  window.location.href = "https://isyvoxpfhgeziqpwkxtd.supabase.co/auth/v1/authorize?provider=facebook&redirect_to=https://adruby.de/ai-analyse";
                }}
              >
                Mit Facebook verbinden
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MetaConnectionModal;
