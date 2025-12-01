import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SupportResources = () => {
  const [downloadingGuide, setDownloadingGuide] = useState(null);

  const resources = [
    {
      category: 'Video-Tutorials',
      icon: 'Play',
      color: 'bg-primary/10 text-primary',
      items: [
        {
          id: 1,
          title: 'BlackRuby Schnellstart-Guide',
          description: 'Lernen Sie in 10 Minuten die Grundlagen der Plattform kennen',
          duration: '10:24',
          level: 'Einsteiger',
          type: 'video',
          url: '#'
        },
        {
          id: 2,
          title: 'KI-Anzeigen erstellen - Schritt für Schritt',
          description: 'Detaillierte Anleitung zur Erstellung KI-optimierter Werbeanzeigen',
          duration: '15:42',
          level: 'Fortgeschritten',
          type: 'video',
          url: '#'
        },
        {
          id: 3,
          title: 'Campaign Analytics verstehen und nutzen',
          description: 'Wie Sie Ihre Kampagnen-Performance richtig analysieren und optimieren',
          duration: '12:18',
          level: 'Fortgeschritten',
          type: 'video',
          url: '#'
        }
      ]
    },
    {
      category: 'Dokumentation',
      icon: 'FileText',
      color: 'bg-primary/10 text-primary',
      items: [
        {
          id: 4,
          title: 'API-Dokumentation',
          description: 'Vollständige Referenz für die BlackRuby API Integration',
          pages: '45 Seiten',
          level: 'Entwickler',
          type: 'pdf',
          fileSize: '2.4 MB'
        },
        {
          id: 5,
          title: 'Benutzerhandbuch',
          description: 'Umfassendes Handbuch für alle Funktionen der Plattform',
          pages: '120 Seiten',
          level: 'Alle',
          type: 'pdf',
          fileSize: '5.8 MB'
        },
        {
          id: 6,
          title: 'Best Practices Guide',
          description: 'Bewährte Strategien für erfolgreiche Werbekampagnen',
          pages: '28 Seiten',
          level: 'Fortgeschritten',
          type: 'pdf',
          fileSize: '1.9 MB'
        }
      ]
    },
    {
      category: 'Webinare & Events',
      icon: 'Calendar',
      color: 'bg-primary/10 text-primary',
      items: [
        {
          id: 7,
          title: 'BlackRuby Master Class - Dezember 2025',
          description: 'Live-Training mit unseren Experten zu fortgeschrittenen Funktionen',
          date: '15. Dezember 2025',
          time: '14:00 - 16:00 CET',
          type: 'webinar',
          status: 'upcoming'
        },
        {
          id: 8,
          title: 'Q4 Marketing Strategies Workshop',
          description: 'Erfolgreiche Werbestrategien für das vierte Quartal',
          date: '8. November 2025',
          time: '10:00 - 12:00 CET',
          type: 'webinar',
          status: 'recording'
        }
      ]
    },
    {
      category: 'Community & Support',
      icon: 'Users',
      color: 'bg-primary/10 text-primary',
      items: [
        {
          id: 9,
          title: 'BlackRuby Community Forum',
          description: 'Tauschen Sie sich mit anderen Nutzern aus und finden Sie Lösungen',
          members: '2.4k Mitglieder',
          type: 'community',
          url: '#'
        },
        {
          id: 10,
          title: 'Discord Server',
          description: 'Echzeit-Chat mit der Community und direkter Support',
          members: '850 Online',
          type: 'chat',
          url: '#'
        },
        {
          id: 11,
          title: 'Knowledge Base',
          description: 'Durchsuchbare Wissensdatenbank mit Artikeln und Lösungen',
          articles: '240 Artikel',
          type: 'database',
          url: '#'
        }
      ]
    }
  ];

  const handleDownload = async (itemId, filename) => {
    setDownloadingGuide(itemId);
    
    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would trigger actual download
      console.log(`Downloading: ${filename}`);
      
      // Create a fake download blob for demonstration
      const demoContent = `BlackRuby ${filename} - Demo Content\n\nDies ist eine Beispiel-Datei für die Demo.\nIn der echten Implementierung würde hier der tatsächliche Inhalt stehen.`;
      const blob = new Blob([demoContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.txt`;
      document.body?.appendChild(a);
      a?.click();
      document.body?.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadingGuide(null);
    }
  };

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'Einsteiger': return 'bg-emerald-500/10 text-emerald-500';
      case 'Fortgeschritten': return 'bg-amber-500/10 text-amber-500';
      case 'Entwickler': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-foreground';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return 'Play';
      case 'pdf': return 'FileText';
      case 'webinar': return 'Video';
      case 'community': return 'MessageSquare';
      case 'chat': return 'MessageCircle';
      case 'database': return 'Database';
      default: return 'File';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Support-Ressourcen
        </h2>
        <p className="text-muted-foreground">
          Entdecken Sie Tutorials, Dokumentationen und Community-Ressourcen
        </p>
      </div>

      {/* Resource Categories */}
      <div className="space-y-12">
        {resources?.map((category) => (
          <div key={category?.category} className="bg-card rounded-xl border border-border shadow-minimal">
            
            {/* Category Header */}
            <div className="px-6 py-4 border-b border-border bg-muted rounded-t-xl">
              <h3 className="text-xl font-semibold text-foreground flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${category?.color}`}>
                  <Icon name={category?.icon} size={20} />
                </div>
                {category?.category}
              </h3>
            </div>

            {/* Items Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category?.items?.map((item) => (
                  <div key={item?.id} className="border border-border rounded-lg p-4 hover:shadow-minimal transition-shadow bg-card">
                    
                    {/* Item Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <Icon name={getTypeIcon(item?.type)} size={18} className="text-muted-foreground mr-2" />
                        {item?.level && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(item?.level)}`}>
                            {item?.level}
                          </span>
                        )}
                      </div>
                      {item?.status === 'upcoming' && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                          Bald verfügbar
                        </span>
                      )}
                      {item?.status === 'recording' && (
                        <span className="bg-muted text-foreground px-2 py-1 rounded-full text-xs font-medium">
                          Aufzeichnung
                        </span>
                      )}
                    </div>

                    {/* Item Content */}
                    <h4 className="font-semibold text-foreground mb-2 line-clamp-2">
                      {item?.title}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {item?.description}
                    </p>

                    {/* Item Metadata */}
                    <div className="space-y-2 mb-4">
                      {item?.duration && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Icon name="Clock" size={14} className="mr-1" />
                          {item?.duration}
                        </div>
                      )}
                      {item?.pages && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Icon name="FileText" size={14} className="mr-1" />
                          {item?.pages}
                          {item?.fileSize && ` • ${item?.fileSize}`}
                        </div>
                      )}
                      {item?.date && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Icon name="Calendar" size={14} className="mr-1" />
                          {item?.date}
                          {item?.time && ` • ${item?.time}`}
                        </div>
                      )}
                      {item?.members && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Icon name="Users" size={14} className="mr-1" />
                          {item?.members}
                        </div>
                      )}
                      {item?.articles && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Icon name="BookOpen" size={14} className="mr-1" />
                          {item?.articles}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex space-x-2">
                      {item?.type === 'pdf' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(item?.id, item?.title)}
                          disabled={downloadingGuide === item?.id}
                          className="flex-1"
                        >
                          {downloadingGuide === item?.id ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-3 w-3 border border-border border-t-transparent mr-1"></div>
                              Lädt...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Icon name="Download" size={14} className="mr-1" />
                              Download
                            </div>
                          )}
                        </Button>
                      )}
                      
                      {(item?.type === 'video' || item?.type === 'webinar') && (
                        <Button size="sm" className="flex-1">
                          <Icon name="Play" size={14} className="mr-1" />
                          {item?.type === 'webinar' && item?.status === 'upcoming' ? 'Anmelden' : 'Ansehen'}
                        </Button>
                      )}
                      
                      {(item?.type === 'community' || item?.type === 'chat' || item?.type === 'database') && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Icon name="ExternalLink" size={14} className="mr-1" />
                          Besuchen
                        </Button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-12 bg-muted rounded-xl p-8 border border-border text-center">
        <Icon name="BookOpen" size={48} className="text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Benötigen Sie zusätzliche Ressourcen?
        </h3>
        <p className="text-muted-foreground mb-6">
          Lassen Sie uns wissen, welche Tutorials oder Dokumentationen Sie benötigen. 
          Wir erstellen gerne neue Inhalte basierend auf Ihrem Feedback.
        </p>
        <Button className="px-6 py-3">
          <Icon name="MessageSquare" size={18} className="mr-2" />
          Ressource vorschlagen
        </Button>
      </div>

    </div>
  );
};

export default SupportResources;
