import React from 'react';
import { motion } from 'framer-motion';

const PaymentBenefits = ({ compact = false }) => {
  const trialBenefits = [
    {
      icon: '🎯',
      title: 'Sofort 1.000 Credits',
      description: 'Starten Sie direkt nach der Verifizierung mit einem vollen Credit-Paket'
    },
    {
      icon: '🚀',
      title: 'Vollzugang zu allen Features',
      description: 'KI-Ad-Builder, Strategien, Analysen und Creative Insights ohne Einschränkungen'
    },
    {
      icon: '📊',
      title: 'Performance-Tracking',
      description: 'Überwachen Sie Ihre Kampagnen-Performance in Echtzeit'
    },
    {
      icon: '💡',
      title: 'KI-Strategieempfehlungen',
      description: 'Erhalten Sie datenbasierte Strategievorschläge für bessere ROI'
    }
  ];

  const securityFeatures = [
    { icon: '🔒', text: 'SSL-verschlüsselt' },
    { icon: '🛡️', text: 'PCI DSS konform' },
    { icon: '💰', text: 'Geld-zurück-Garantie' }
  ];

  if (compact) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-bold text-[#111111] mb-4">
          Was Sie nach der Verifizierung erhalten
        </h3>
        {/* Quick Benefits Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {trialBenefits?.map((benefit, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">{benefit?.icon}</div>
              <div className="text-xs font-medium text-gray-800">{benefit?.title}</div>
            </div>
          ))}
        </div>
        {/* Security Icons */}
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-[#C80000] rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">AR</span>
          </div>
          <h2 className="text-2xl font-bold text-[#111111]">Trial-Verifizierung</h2>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Nur noch ein Schritt zu Ihren 1.000 Credits
        </h3>
        <p className="text-gray-600">
          Bestätigen Sie Ihre Zahlungsmethode und erhalten Sie sofortigen Zugang zu AdRuby
        </p>
      </div>
      {/* Zero-Charge Notice */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-start space-x-3">
          <div className="text-green-500 text-2xl">💳</div>
          <div>
            <h4 className="font-semibold text-green-800 mb-1">Heute 0€ Belastung</h4>
            <p className="text-sm text-green-700">
              Wir verifizieren nur Ihre Zahlungsmethode. Die ersten 7 Tage sind komplett kostenlos - 
              keine versteckten Kosten, keine automatische Verlängerung ohne Ihre Zustimmung.
            </p>
          </div>
        </div>
      </div>
      {/* Trial Benefits */}
      <div className="space-y-6 mb-8">
        <h4 className="font-semibold text-gray-800">Was Sie sofort nach der Verifizierung erhalten:</h4>
        {trialBenefits?.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            className="flex items-start space-x-4"
          >
            <div className="text-2xl flex-shrink-0">{benefit?.icon}</div>
            <div>
              <h5 className="font-semibold text-gray-800 mb-1">{benefit?.title}</h5>
              <p className="text-sm text-gray-600">{benefit?.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Trial Timeline */}
      <div className="bg-gradient-to-r from-[#C80000]/10 to-[#C80000]/5 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-gray-800 mb-4">Ihr Trial-Ablauf im Detail:</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-[#C80000] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <span className="text-gray-700">Registrierung abgeschlossen</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-[#C80000] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <span className="text-gray-700 font-medium">Zahlungsverifizierung (jetzt)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <span className="text-gray-700">Sofortiger Dashboard-Zugang + 1.000 Credits</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-xs font-bold">4</span>
            </div>
            <span className="text-gray-500">Tag 7: Upgrade-Erinnerung (optional)</span>
          </div>
        </div>
      </div>
      {/* Payment Security */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center mb-3">
          <h5 className="text-sm font-medium text-gray-800">Sicher & Vertrauenswürdig</h5>
        </div>
        <div className="flex items-center justify-between">
          {securityFeatures?.map((feature, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-lg mb-1">{feature?.icon}</span>
              <span className="text-xs font-medium text-gray-700 text-center">{feature?.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600">
            Zahlungen werden sicher durch Stripe und PayPal verarbeitet
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentBenefits;