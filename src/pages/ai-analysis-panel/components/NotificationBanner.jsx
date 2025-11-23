import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon name="Info" size={14} className="text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm mb-1">
            KI-Funktionen in Vorbereitung
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Wir arbeiten intensiv an der Implementierung fortschrittlicher KI-Analysefunktionen. 
            Diese werden Ihnen dabei helfen, Kampagnenleistung zu optimieren und datengesteuerte 
            Entscheidungen zu treffen. Erwartete Verfügbarkeit: Q1 2025.
          </p>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" iconName="Bell" iconPosition="left">
              Benachrichtigung aktivieren
            </Button>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Ausblenden
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <Icon name="X" size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;