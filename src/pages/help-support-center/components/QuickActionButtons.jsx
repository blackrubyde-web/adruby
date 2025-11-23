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
      color: 'bg-blue-500 hover:bg-blue-600',
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
      color: 'bg-green-500 hover:bg-green-600',
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
      color: 'bg-purple-500 hover:bg-purple-600',
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
      color: 'bg-orange-500 hover:bg-orange-600',
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Schnelle Hilfe
        </h2>
        <p className="text-gray-600">
          Klicken Sie auf die passende Kategorie für sofortige Unterstützung
        </p>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions?.map((action) => (
          <button
            key={action?.id}
            onClick={action?.action}
            className={`${action?.color} text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg group`}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-full mb-4 group-hover:bg-opacity-30 transition-all">
                <Icon name={action?.icon} size={24} className="text-white" />
              </div>
              
              <h3 className="font-semibold text-lg mb-2">
                {action?.title}
              </h3>
              
              <p className="text-sm opacity-90">
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
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          <Icon name="MessageCircle" size={16} className="mr-2" />
          Live Chat
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window?.open('tel:+49123456789', '_self')}
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          <Icon name="Phone" size={16} className="mr-2" />
          Anrufen
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onError?.('Status-Seite wird implementiert.')}
          className="text-purple-600 border-purple-600 hover:bg-purple-50"
        >
          <Icon name="Activity" size={16} className="mr-2" />
          Service-Status
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window?.open('mailto:support@blackruby.com', '_blank')}
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          <Icon name="Mail" size={16} className="mr-2" />
          E-Mail senden
        </Button>
      </div>

    </div>
  );
};

export default QuickActionButtons;