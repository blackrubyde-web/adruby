import React from 'react';
import Icon from '../../../components/AppIcon';

const FeaturePreview = () => {
  const upcomingFeatures = [
    {
      id: 1,
      title: "Kampagnen-Performance Vorhersage",
      description: "Prognostizieren Sie CTR, Conversion-Raten und ROAS basierend auf historischen Daten und Markttrends.",
      icon: "TrendingUp",
      status: "Bald verfügbar"
    },
    {
      id: 2,
      title: "Zielgruppen-Segmentierung",
      description: "Automatische Identifikation optimaler Zielgruppensegmente durch maschinelles Lernen.",
      icon: "Users",
      status: "In Entwicklung"
    },
    {
      id: 3,
      title: "Budget-Optimierung",
      description: "KI-gesteuerte Budgetverteilung für maximale Kampagneneffizienz und ROI.",
      icon: "DollarSign",
      status: "Geplant"
    },
    {
      id: 4,
      title: "A/B-Test Empfehlungen",
      description: "Intelligente Vorschläge für A/B-Tests basierend auf Kampagnenleistung und Branchenbenchmarks.",
      icon: "GitBranch",
      status: "Konzept"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Bald verfügbar':
        return 'bg-success/10 text-success border-success/20';
      case 'In Entwicklung':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Geplant':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Kommende KI-Features
        </h2>
        <p className="text-muted-foreground">
          Entdecken Sie die leistungsstarken Analysefunktionen, die bald verfügbar sein werden
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {upcomingFeatures?.map((feature) => (
          <div
            key={feature?.id}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={feature?.icon} size={24} className="text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground text-sm">
                    {feature?.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(feature?.status)}`}>
                    {feature?.status}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature?.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturePreview;