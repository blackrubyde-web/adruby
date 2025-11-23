import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';

const LogoutLoader = ({ user, message }) => {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Loading Animation */}
      <div className="mb-6">
        <motion.div
          className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <Icon name="LogOut" size={32} className="text-red-600" />
        </motion.div>
        
        <motion.div
          className="flex justify-center space-x-1 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[0, 1, 2]?.map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-red-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </motion.div>
      </div>
      {/* User Info */}
      {user && (
        <motion.div
          className="mb-6 pb-6 border-b border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-lg font-medium">
              {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 
               user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900">
            {user?.user_metadata?.full_name || 'Benutzer'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {user?.email}
          </p>
        </motion.div>
      )}
      {/* Status Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {message}
        </h3>
        <div className="text-sm text-gray-600 space-y-1">
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✓ Supabase Session beenden
          </motion.p>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          >
            ✓ Lokale Daten löschen
          </motion.p>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          >
            ✓ Cache leeren
          </motion.p>
        </div>
      </motion.div>
      {/* Security Note */}
      <motion.div
        className="mt-6 p-4 bg-gray-50 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Icon name="Shield" size={14} />
          <span>Alle Daten werden sicher entfernt</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LogoutLoader;