import React from 'react';
import { motion } from 'framer-motion';

const RegistrationBenefits = ({ compact = false }) => {
  const benefits = [
    {
      icon: '🎯',
      title: '1.000 Credits geschenkt',
      description: 'Starten Sie sofort mit einem vollen Credit-Paket für Ihre ersten Kampagnen'
    },
    {
      icon: '⏱️', 
      title: '7 Tage kostenlos testen',
      description: 'Keine Vorauszahlung - testen Sie alle Features risikofrei'
    },
    {
      icon: '🚀',
      title: 'KI-powered Ads in Sekunden',
      description: 'Erstellen Sie performante Werbeanzeigen mit unserer fortschrittlichen KI'
    },
    {
      icon: '📊',
      title: 'Echtzeit-Analysen',
      description: 'Überwachen Sie Ihre Kampagnen-Performance in Echtzeit'
    }
  ];

  const securityFeatures = [
    { icon: '🔒', text: 'SSL-verschlüsselt' },
    { icon: '🇪🇺', text: 'DSGVO-konform' },
    { icon: '🛡️', text: 'Sichere Zahlungen' }
  ];

  if (compact) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-bold text-[#111111] mb-4">
          Warum AdRuby wählen?
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {benefits?.slice(0, 4)?.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl mb-1">{benefit?.icon}</div>
              <div className="text-xs font-medium text-gray-800">{benefit?.title}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center space-x-4">
          {securityFeatures?.map((feature, index) => (
            <div key={index} className="flex items-center space-x-1">
              <span className="text-sm">{feature?.icon}</span>
              <span className="text-xs text-gray-600">{feature?.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full"
    >
      {/* Logo & Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-[#C80000] rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">AR</span>
          </div>
          <h2 className="text-2xl font-bold text-[#111111]">AdRuby</h2>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          KI-gesteuerte Werbeanzeigen in Sekunden
        </h3>
        <p className="text-gray-600">
          Revolutionieren Sie Ihr Marketing mit der Kraft künstlicher Intelligenz
        </p>
      </div>
      {/* Benefits List */}
      <div className="space-y-6 mb-8">
        {benefits?.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            className="flex items-start space-x-4"
          >
            <div className="text-2xl flex-shrink-0">{benefit?.icon}</div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">{benefit?.title}</h4>
              <p className="text-sm text-gray-600">{benefit?.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Trial Timeline */}
      <div className="bg-gradient-to-r from-[#C80000]/10 to-[#C80000]/5 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-gray-800 mb-4">Ihr 7-Tage-Trial im Überblick</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-[#C80000] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <span className="text-sm text-gray-700">Registrierung & Zahlungsverifizierung</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-[#C80000] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <span className="text-sm text-gray-700">1.000 Credits erhalten & Dashboard-Zugang</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <span className="text-sm text-gray-500">Nach 7 Tagen: Upgrade-Optionen</span>
          </div>
        </div>
      </div>
      {/* Security Features */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          {securityFeatures?.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-lg">{feature?.icon}</span>
              <span className="text-xs font-medium text-gray-700">{feature?.text}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default RegistrationBenefits;