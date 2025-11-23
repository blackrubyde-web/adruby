import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';

const LogoutConfirmation = ({ message, redirectMessage }) => {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Success Animation */}
      <motion.div
        className="mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
          animate={{ 
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut"
          }}
        >
          <Icon name="Check" size={32} className="text-green-600" />
        </motion.div>
        
        {/* Checkmark Animation */}
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        >
          <svg 
            className="mx-auto w-8 h-8 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </svg>
        </motion.div>
      </motion.div>
      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {message}
        </h3>
        <p className="text-gray-600 mb-6">
          Ihre Session wurde sicher beendet und alle Daten wurden erfolgreich entfernt.
        </p>
      </motion.div>
      {/* Security Confirmation */}
      <motion.div
        className="mb-6 space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-3 text-sm text-green-600">
          <Icon name="Check" size={16} />
          <span>Supabase Session beendet</span>
        </div>
        <div className="flex items-center justify-center space-x-3 text-sm text-green-600">
          <Icon name="Check" size={16} />
          <span>Lokale Daten gelöscht</span>
        </div>
        <div className="flex items-center justify-center space-x-3 text-sm text-green-600">
          <Icon name="Check" size={16} />
          <span>Cache geleert</span>
        </div>
        <div className="flex items-center justify-center space-x-3 text-sm text-green-600">
          <Icon name="Check" size={16} />
          <span>Authentication Token entfernt</span>
        </div>
      </motion.div>
      {/* Redirect Information */}
      <motion.div
        className="p-4 bg-blue-50 rounded-lg border border-blue-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-center space-x-2 text-sm text-blue-700">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Icon name="ArrowRight" size={16} />
          </motion.div>
          <span>{redirectMessage}</span>
        </div>
      </motion.div>
      {/* Security Badge */}
      <motion.div
        className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Icon name="ShieldCheck" size={14} className="text-green-500" />
        <span>Sichere Abmeldung abgeschlossen</span>
      </motion.div>
    </motion.div>
  );
};

export default LogoutConfirmation;