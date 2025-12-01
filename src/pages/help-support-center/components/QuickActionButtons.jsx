import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionButtons = ({ onError }) => {
  
  const quickActions = [
    {
      id: 1,
      title: 'Technisches Problem',
      description: 'Fehlerbehebung und technische Unterstützung',
      icon: 'Settings',
      action: () => {
        // Simulate quick action
        console.log('Technical support requested');
        onError?.('Technischer Support wird implementiert. Bitte nutzen Sie das Kontaktformular.');
      }
    },
    {
      id: 2,
      title: 'Abrechnung',
      description: 'Fragen zu Rechnungen und Zahlungen',
      icon: 'CreditCard',
      action: () => {
        console.log('Billing support requested');
        onError?.('Abrechnungsunterstützung wird implementiert. Bitte nutzen Sie das Kontaktformular.');
      }
    },
    {
      id: 3,
      title: 'Kampagnen-Hilfe',
      description: 'Unterstützung bei der Kampagnenerstellung',
      icon: 'Target',
      action: () => {
        console.log('Campaign help requested');
        onError?.('Kampagnen-Unterstützung wird implementiert. Bitte nutzen Sie das Kontaktformular.');
      }
    },
    {
      id: 4,
      title: 'Account-Problem',
      description: 'Hilfe bei Anmeldung und Kontoeinstellungen',
      icon: 'User',
      action: () => {
        console.log('Account help requested');
        onError?.('Konto-Unterstützung wird implementiert. Bitte nutzen Sie das Kontaktformular.');
      }
    }
  ];

  return (
    <div className="mb-12">
      
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Schnelle Hilfe
        </h2>
        <p className="text-muted-foreground">
          Klicken Sie auf die passende Kategorie für sofortige Unterstützung
        </p>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions?.map((action) => (
          <button
            key={action?.id}
            onClick={action?.action}
            className="bg-card border border-border text-foreground p-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:border-primary group"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-all">
                <Icon name={action?.icon} size={24} className="text-primary" />
              </div>
              
              <h3 className="font-semibold text-lg mb-2">
                {action?.title}
              </h3>
              
              <p className="text-sm text-muted-foreground">
                {action?.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Additional Quick Links */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onError?.('Live Chat wird bald verfügbar sein!')}
        >
          <Icon name="MessageCircle" size={16} className="mr-2" />
          Live Chat
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window?.open('tel:+49123456789', '_self')}
        >
          <Icon name="Phone" size={16} className="mr-2" />
          Anrufen
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onError?.('Status-Seite wird implementiert.')}
        >
          <Icon name="Activity" size={16} className="mr-2" />
          Service-Status
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window?.open('mailto:support@blackruby.com', '_blank')}
        >
          <Icon name="Mail" size={16} className="mr-2" />
          E-Mail senden
        </Button>
      </div>

    </div>
  );
};

export default QuickActionButtons;
