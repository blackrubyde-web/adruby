import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AnalysisPlaceholder = () => {
  return (
    <div className="bg-card rounded-lg border border-border p-8 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="Brain" size={32} className="text-primary" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-3">
        KI-Analyse in Entwicklung
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Unsere fortschrittlichen KI-Algorithmen werden bald verfügbar sein, um Ihnen 
        detaillierte Kampagnenanalysen und Optimierungsvorschläge zu liefern.
      </p>
      
      <div className="space-y-3 mb-8">
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Icon name="CheckCircle" size={16} className="text-success" />
          <span>Leistungsvorhersagen</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Icon name="CheckCircle" size={16} className="text-success" />
          <span>Zielgruppen-Insights</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Icon name="CheckCircle" size={16} className="text-success" />
          <span>Automatische Optimierung</span>
        </div>
      </div>
      
      <Button 
        variant="default" 
        disabled 
        iconName="Zap" 
        iconPosition="left"
        className="opacity-50 cursor-not-allowed"
      >
        Analysieren
      </Button>
    </div>
  );
};

export default AnalysisPlaceholder;