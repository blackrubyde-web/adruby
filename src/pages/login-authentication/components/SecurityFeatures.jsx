import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';

const SecurityFeatures = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'Sichere Verschlüsselung',
      description: 'End-to-End-Verschlüsselung für alle Datenübertragungen'
    },
    {
      icon: 'Lock',
      title: 'Zwei-Faktor-Authentifizierung',
      description: 'Zusätzliche Sicherheitsebene für Ihr Konto'
    },
    {
      icon: 'Eye',
      title: 'Aktivitätsüberwachung',
      description: 'Kontinuierliche Überwachung verdächtiger Aktivitäten'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="hidden lg:block"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Sicherheit steht an erster Stelle
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Ihre Kampagnendaten und Geschäftsinformationen sind mit 
            modernsten Sicherheitsprotokollen geschützt.
          </p>
        </div>

        <div className="space-y-6">
          {securityFeatures?.map((feature, index) => (
            <motion.div
              key={feature?.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="flex items-start space-x-4"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={feature?.icon} size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  {feature?.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature?.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-6 border-t border-border">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="CheckCircle" size={16} className="text-success" />
            <span>DSGVO-konform und ISO 27001 zertifiziert</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SecurityFeatures;