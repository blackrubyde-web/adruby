import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const FAQSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const faqCategories = [
    {
      title: 'Kampagnen-Management',
      icon: 'Target',
      items: [
        {
          id: 1,
          question: 'Wie erstelle ich eine neue Werbekampagne?',
          answer: 'Um eine neue Kampagne zu erstellen, gehen Sie zum Kampagnen-Dashboard und klicken Sie auf "Neue Kampagne". Wählen Sie Ihr Ziel, definieren Sie Ihre Zielgruppe und erstellen Sie Ihre Anzeigeninhalte. Unser KI-System hilft Ihnen dabei, optimierte Inhalte basierend auf erfolgreichen Kampagnen zu generieren.'
        },
        {
          id: 2,
          question: 'Wie kann ich die Performance meiner Kampagnen analysieren?',
          answer: 'In Ihrem Dashboard finden Sie detaillierte Analysen zu CTR, ROAS, Conversion-Raten und anderen wichtigen Metriken. Sie können Filter anwenden, um spezifische Zeiträume oder Kampagnen zu analysieren. Unsere KI bietet auch automatische Optimierungsvorschläge basierend auf der Performance.'
        },
        {
          id: 3,
          question: 'Kann ich meine Kampagnen automatisch optimieren lassen?',
          answer: 'Ja! BlackRuby bietet automatische Optimierung basierend auf Machine Learning. Das System passt Gebote, Zielgruppen und Anzeigeninhalte kontinuierlich an, um die beste Performance zu erzielen. Sie können diese Funktion in den Kampagneneinstellungen aktivieren.'
        }
      ]
    },
    {
      title: 'KI & Automatisierung',
      icon: 'Zap',
      items: [
        {
          id: 4,
          question: 'Wie funktioniert die KI-gestützte Anzeigenerstellung?',
          answer: 'Unsere KI analysiert Millionen von erfolgreichen Werbeanzeigen aus der Facebook Ads Library und identifiziert erfolgreiche Muster. Basierend auf diesen Erkenntnissen generiert sie optimierte Headlines, Beschreibungen und Call-to-Actions für Ihre spezifische Branche und Zielgruppe.'
        },
        {
          id: 5,
          question: 'Welche Daten nutzt die KI für Optimierungsempfehlungen?',
          answer: 'Die KI nutzt verschiedene Datenquellen: Performance-Daten Ihrer Kampagnen, Markttrends aus der Facebook Ads Library, demografische Insights, saisonale Muster und Competitor-Analysen. Alle Daten werden anonymisiert und DSGVO-konform verarbeitet.'
        },
        {
          id: 6,
          question: 'Kann ich die KI-Vorschläge anpassen oder ablehnen?',
          answer: 'Absolut! Sie haben immer die volle Kontrolle. Alle KI-Vorschläge können bearbeitet, angepasst oder abgelehnt werden. Sie können auch spezifische Parameter für die KI setzen, wie Tonalität, Zielgruppe oder bevorzugte Call-to-Actions.'
        }
      ]
    },
    {
      title: 'Abrechnung & Pläne',
      icon: 'CreditCard',
      items: [
        {
          id: 7,
          question: 'Welche Preispläne sind verfügbar?',
          answer: 'Wir bieten drei Pläne an: Starter (19,99€/Monat) für 50 KI-Generierungen, Pro (39,99€/Monat) für 200 Generierungen mit Teamfunktionen, und Enterprise (individuell) für große Unternehmen. Alle Pläne inkludieren 14 Tage Geld-zurück-Garantie.'
        },
        {
          id: 8,
          question: 'Kann ich meinen Plan jederzeit ändern?',
          answer: 'Ja, Sie können jederzeit upgraden oder downgraden. Upgrades sind sofort wirksam, bei Downgrades gelten die neuen Limits ab dem nächsten Abrechnungszyklus. Nicht genutzte KI-Generierungen verfallen am Monatsende.'
        },
        {
          id: 9,
          question: 'Gibt es eine kostenlose Testversion?',
          answer: 'Neue Benutzer erhalten 10 kostenlose KI-Generierungen ohne Kreditkarte. Zusätzlich bieten wir eine 14-tägige Geld-zurück-Garantie für alle bezahlten Pläne. Sie können BlackRuby also risikofrei testen.'
        }
      ]
    },
    {
      title: 'Technische Probleme',
      icon: 'Settings',
      items: [
        {
          id: 10,
          question: 'Die Anzeigenerstellung funktioniert nicht. Was kann ich tun?',
          answer: 'Prüfen Sie zunächst Ihre Internetverbindung und aktualisieren Sie die Seite. Wenn das Problem weiterhin besteht, leeren Sie den Browser-Cache oder versuchen Sie einen anderen Browser. Bei anhaltenden Problemen kontaktieren Sie unseren Support mit einer Beschreibung der Fehlermeldung.'
        },
        {
          id: 11,
          question: 'Warum werden meine Kampagnendaten nicht geladen?',
          answer: 'Dies kann verschiedene Ursachen haben: Serverüberlastung, veraltete Browser-Version oder Verbindungsprobleme mit Facebook API. Warten Sie 2-3 Minuten und versuchen Sie es erneut. Bei wiederholten Problemen prüfen Sie den Status auf unserer Status-Seite oder kontaktieren Sie den Support.'
        },
        {
          id: 12,
          question: 'Welche Browser werden unterstützt?',
          answer: 'BlackRuby funktioniert optimal mit aktuellen Versionen von Chrome, Firefox, Safari und Edge. Für die beste Performance empfehlen wir Chrome oder Firefox. Internet Explorer wird nicht unterstützt. Stellen Sie sicher, dass JavaScript aktiviert ist.'
        }
      ]
    }
  ];

  const toggleItem = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded?.has(id)) {
      newExpanded?.delete(id);
    } else {
      newExpanded?.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredCategories = faqCategories?.map(category => ({
    ...category,
    items: category?.items?.filter(item =>
      item?.question?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      item?.answer?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    )
  }))?.filter(category => category?.items?.length > 0);

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Häufig gestellte Fragen
        </h2>
        <p className="text-muted-foreground">
          Finden Sie schnell Antworten auf die häufigsten Fragen zu BlackRuby
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Input
            type="text"
            placeholder="FAQ durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="pl-10 pr-4 py-3 w-full"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Icon name="Search" size={18} />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" size={18} />
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            {filteredCategories?.reduce((acc, cat) => acc + cat?.items?.length, 0)} Ergebnisse gefunden
          </p>
        )}
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {filteredCategories?.length > 0 ? (
          filteredCategories?.map((category) => (
            <div key={category?.title} className="bg-card rounded-xl border border-border shadow-minimal">
              
              {/* Category Header */}
              <div className="px-6 py-4 border-b border-border bg-muted rounded-t-xl">
                <h3 className="text-lg font-semibold text-foreground flex items-center">
                  <Icon name={category?.icon} size={20} className="mr-2 text-primary" />
                  {category?.title}
                </h3>
              </div>

              {/* FAQ Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {category?.items?.map((item, index) => (
                    <div key={item?.id} className={`border border-border rounded-lg ${
                      index === category?.items?.length - 1 ? '' : 'mb-4'
                    }`}>
                      
                      {/* Question */}
                      <button
                        onClick={() => toggleItem(item?.id)}
                        className="w-full px-4 py-4 text-left hover:bg-muted transition-colors rounded-lg flex items-center justify-between"
                      >
                        <span className="font-medium text-foreground pr-4">
                          {item?.question}
                        </span>
                        <Icon 
                          name={expandedItems?.has(item?.id) ? "ChevronUp" : "ChevronDown"} 
                          size={18} 
                          className="text-muted-foreground flex-shrink-0" 
                        />
                      </button>

                      {/* Answer */}
                      {expandedItems?.has(item?.id) && (
                        <div className="px-4 pb-4 border-t border-border bg-muted rounded-b-lg">
                          <div className="pt-4">
                            <p className="text-foreground leading-relaxed">
                              {item?.answer}
                            </p>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-border shadow-minimal">
            <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Keine Ergebnisse gefunden</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 
                `Keine FAQ-Einträge gefunden für "${searchTerm}"` : 
                'Keine FAQ-Kategorien verfügbar'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-primary hover:opacity-80 font-medium"
              >
                Suche zurücksetzen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Still need help */}
      <div className="mt-12 text-center bg-muted rounded-xl p-8 border border-border">
        <Icon name="MessageCircle" size={48} className="text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Antwort nicht gefunden?
        </h3>
        <p className="text-muted-foreground mb-6">
          Unser Support-Team hilft Ihnen gerne weiter. Kontaktieren Sie uns für individuelle Unterstützung.
        </p>
        <button
          onClick={() => window?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
        >
          <Icon name="Mail" size={18} className="mr-2" />
          Support kontaktieren
        </button>
      </div>

    </div>
  );
};

export default FAQSection;
