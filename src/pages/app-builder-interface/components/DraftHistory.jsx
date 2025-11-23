import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DraftHistory = ({ drafts, onLoadDraft, onSaveDraft, currentDraft }) => {
  const mockDrafts = [
    {
      id: 1,
      title: "Premium Fitness Tracker Kampagne",
      date: "2025-10-13",
      time: "14:30",
      productName: "Premium Fitness Tracker",
      description: "Revolutionärer Fitness Tracker mit 24/7 Herzfrequenzmessung und GPS",
      targetAudience: "Fitness-Enthusiasten, 25-45 Jahre",
      targetUrl: "https://www.beispiel.com/fitness-tracker",
      tonality: "professional",
      ctaText: "Jetzt bestellen"
    },
    {
      id: 2,
      title: "Smartphone Zubehör Anzeige",
      date: "2025-10-13",
      time: "12:15",
      productName: "Wireless Charging Pad",
      description: "Kabelloses Laden für alle Qi-fähigen Geräte mit elegantem Design",
      targetAudience: "Tech-Enthusiasten, 20-50 Jahre",
      targetUrl: "https://www.beispiel.com/wireless-charger",
      tonality: "friendly",
      ctaText: "Mehr erfahren"
    },
    {
      id: 3,
      title: "Bio Kaffee Marketing",
      date: "2025-10-12",
      time: "16:45",
      productName: "Bio Fair Trade Kaffee",
      description: "100% biologisch angebauter Kaffee direkt von den Bauern",
      targetAudience: "Kaffeeliebhaber, umweltbewusste Verbraucher",
      targetUrl: "https://www.beispiel.com/bio-kaffee",
      tonality: "casual",
      ctaText: "Probieren Sie jetzt"
    }
  ];

  const allDrafts = [...mockDrafts, ...drafts];
  const recentDrafts = allDrafts?.slice(0, 3);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <Icon name="History" size={20} className="text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Verlauf</h2>
            <p className="text-sm text-muted-foreground">Letzte 3 Entwürfe</p>
          </div>
        </div>

        {currentDraft && (
          <Button
            variant="outline"
            size="sm"
            iconName="Save"
            iconPosition="left"
            onClick={() => onSaveDraft(currentDraft)}
          >
            Speichern
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {recentDrafts?.length > 0 ? (
          recentDrafts?.map((draft) => (
            <div
              key={draft?.id}
              className="group p-4 border border-border rounded-lg hover:bg-accent transition-smooth cursor-pointer"
              onClick={() => onLoadDraft(draft)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {draft?.title}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(draft?.date)}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {draft?.time}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onLoadDraft(draft);
                    }}
                  >
                    <Icon name="Download" size={14} />
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {draft?.description}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Icon name="FileText" size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Noch keine Entwürfe erstellt</p>
            <p className="text-xs text-muted-foreground mt-1">
              Generieren Sie Ihren ersten Entwurf, um ihn hier zu sehen
            </p>
          </div>
        )}
      </div>
      {recentDrafts?.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            iconName="Archive"
            iconPosition="left"
            className="w-full"
          >
            Alle Entwürfe anzeigen ({allDrafts?.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default DraftHistory;