import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const MetaConnectionModal = ({ isOpen, onClose, onConnect, isConnecting }) => {
  const [step, setStep] = useState(1);
  const [connectionData, setConnectionData] = useState({
    accessToken: '',
    adAccountId: '',
    pageId: ''
  });

  const handleInputChange = (field, value) => {
    setConnectionData(prev => ({ ...prev, [field]: value }));
  };

  const handleConnect = async () => {
    try {
      await onConnect(connectionData);
      onClose();
      setStep(1);
      setConnectionData({ accessToken: '', adAccountId: '', pageId: '' });
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

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
            {/* Header */}
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
                    Schritt {step} von 3
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

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex space-x-2">
                {[1, 2, 3]?.map((i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      i <= step
                        ? 'bg-primary' :'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="space-y-4">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      1. Access Token generieren
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Besuchen Sie den Meta for Developers Graph API Explorer und generieren Sie einen Access Token mit den erforderlichen Berechtigungen.
                    </p>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">
                        Erforderliche Berechtigungen: ads_read, ads_management, read_insights
                      </p>
                    </div>
                  </div>
                  <Input
                    placeholder="Access Token eingeben..."
                    value={connectionData?.accessToken}
                    onChange={(e) => handleInputChange('accessToken', e?.target?.value)}
                    className="w-full"
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      2. Ad Account ID
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Geben Sie Ihre Facebook Ads Account ID ein. Sie finden diese im Facebook Ads Manager unter "Konto-Einstellungen".
                    </p>
                  </div>
                  <Input
                    placeholder="act_1234567890"
                    value={connectionData?.adAccountId}
                    onChange={(e) => handleInputChange('adAccountId', e?.target?.value)}
                    className="w-full"
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      3. Page ID (Optional)
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Fügen Sie optional Ihre Facebook Page ID hinzu für erweiterte Insights und Posting-Funktionen.
                    </p>
                  </div>
                  <Input
                    placeholder="123456789012345"
                    value={connectionData?.pageId}
                    onChange={(e) => handleInputChange('pageId', e?.target?.value)}
                    className="w-full"
                  />
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Icon name="CheckCircle" size={16} className="text-green-600 dark:text-green-400" />
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        Bereit zur Verbindung
                      </p>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 ml-6">
                      AdRuby kann jetzt Ihre Kampagnendaten abrufen und analysieren.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={step === 1 ? onClose : prevStep}
                disabled={isConnecting}
                className="border-border text-muted-foreground hover:border-primary hover:text-foreground"
              >
                {step === 1 ? 'Abbrechen' : 'Zurück'}
              </Button>
              
              {step < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={
                    (step === 1 && !connectionData?.accessToken) ||
                    (step === 2 && !connectionData?.adAccountId) ||
                    isConnecting
                  }
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Weiter
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={!connectionData?.accessToken || !connectionData?.adAccountId || isConnecting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  iconName={isConnecting ? "Loader2" : "Link"}
                  iconPosition="left"
                >
                  {isConnecting ? 'Verbinde...' : 'Verbinden'}
                </Button>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-start space-x-2">
                <Icon name="Info" size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium">Benötigen Sie Hilfe?</p>
                  <p>Besuchen Sie unsere Dokumentation für eine Schritt-für-Schritt Anleitung zur Token-Generierung.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MetaConnectionModal;