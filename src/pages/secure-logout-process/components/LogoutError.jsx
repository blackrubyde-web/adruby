import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LogoutError = ({ error, onRetry, onForceLogout, retryCount, maxRetries }) => {
  const canRetry = retryCount < maxRetries;

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Error Animation */}
      <motion.div
        className="mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
          animate={{ 
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut"
          }}
        >
          <Icon name="AlertTriangle" size={32} className="text-red-600" />
        </motion.div>
      </motion.div>
      {/* Error Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Abmeldung fehlgeschlagen
        </h3>
        <p className="text-gray-600 mb-4">
          Bei der sicheren Abmeldung ist ein Problem aufgetreten.
        </p>
      </motion.div>
      {/* Error Details */}
      <motion.div
        className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-start space-x-2 text-sm text-red-800">
          <Icon name="Info" size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Fehlerdetails:</p>
            <p className="text-xs font-mono bg-red-100 p-2 rounded">
              {error || 'Unbekannter Fehler bei der Abmeldung'}
            </p>
          </div>
        </div>
      </motion.div>
      {/* Retry Information */}
      {canRetry && (
        <motion.div
          className="mb-6 text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>Versuch {retryCount + 1} von {maxRetries}</p>
        </motion.div>
      )}
      {/* Action Buttons */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {canRetry ? (
          <>
            <Button
              onClick={onRetry}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
             
            >
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Erneut versuchen
            </Button>
            <Button
              onClick={onForceLogout}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Trotzdem abmelden
            </Button>
          </>
        ) : (
          <Button
            onClick={onForceLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            Abmeldung erzwingen
          </Button>
        )}
      </motion.div>
      {/* Help Text */}
      <motion.div
        className="mt-6 p-4 bg-gray-50 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="text-xs text-gray-500 space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Icon name="HelpCircle" size={14} />
            <span>Mögliche Ursachen:</span>
          </div>
          <ul className="text-left space-y-1 max-w-xs mx-auto">
            <li>• Internetverbindung unterbrochen</li>
            <li>• Supabase Service nicht verfügbar</li>
            <li>• Session bereits abgelaufen</li>
          </ul>
          <p className="mt-3 text-center">
            Bei "Abmeldung erzwingen" werden alle lokalen Daten gelöscht und Sie zur Startseite weitergeleitet.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LogoutError;