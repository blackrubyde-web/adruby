import { useEffect, useState } from 'react';
import {
  HelpCircle,
  MessageCircle,
  BookOpen,
  Video,
  Mail,
  Send,
  Search,
  ChevronRight,
  ExternalLink,
  FileText,
  Zap,
  Target,
  BarChart3,
  CreditCard,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthState } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { DashboardShell } from './layout/DashboardShell';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

export function HelpSupportPage() {
  const [activeSection, setActiveSection] = useState<'faq' | 'contact' | 'resources'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { user, profile } = useAuthState();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // FAQ Kategorien
  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Erste Schritte',
      icon: <Zap className="w-5 h-5" />,
      questions: [
        {
          q: 'Wie erstelle ich meine erste Kampagne?',
          a: 'Klicke auf "Kampagne erstellen" oben rechts. Folge dem Schritt-für-Schritt-Wizard, um deine Kampagnendetails, Zielgruppe, Budget und Creatives einzurichten. Danach klicke auf "Kampagne starten".',
        },
        {
          q: 'Wie verbinde ich mein Meta Ads Konto?',
          a: 'Gehe zu Einstellungen > Integrationen, klicke auf "Meta verbinden" und folge dem OAuth-Flow. Stelle sicher, dass du Admin-Zugriff auf dein Facebook Ads Konto hast.',
        },
        {
          q: 'Was sind die Mindestanforderungen zum Starten?',
          a: 'Du brauchst ein verifiziertes Facebook Ads Konto, eine verbundene Zahlungsmethode und mindestens €50 Mindestbudget für deine erste Kampagne.',
        },
      ],
    },
    {
      id: 'campaigns',
      title: 'Kampagnen-Management',
      icon: <Target className="w-5 h-5" />,
      questions: [
        {
          q: 'Wie pausiere oder stoppe ich eine Kampagne?',
          a: 'Gehe zu deiner Kampagnen-Übersicht, finde die gewünschte Kampagne, klicke auf das Drei-Punkte-Menü und wähle "Kampagne pausieren". Zum endgültigen Beenden wähle "Kampagne beenden".',
        },
        {
          q: 'Kann ich eine laufende Kampagne bearbeiten?',
          a: 'Ja, du kannst die meisten Einstellungen bearbeiten während sie läuft. Budget- oder Targeting-Änderungen können jedoch eine Ad-Review auslösen. Größere Änderungen starten möglicherweise die Lernphase neu.',
        },
        {
          q: 'Wie lange dauert die Kampagnen-Freigabe?',
          a: 'Facebook prüft Ads normalerweise innerhalb von 24 Stunden. Die meisten Ads werden innerhalb weniger Stunden freigegeben. Du erhältst eine Benachrichtigung sobald deine Kampagne läuft.',
        },
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      icon: <BarChart3 className="w-5 h-5" />,
      questions: [
        {
          q: 'Wie oft werden die Daten aktualisiert?',
          a: 'Kampagnen-Daten werden alle 15 Minuten von Meta synchronisiert. Echtzeit-Metriken wie Impressionen und Klicks können leicht verzögert sein. Für akkurate Daten warte 24-48 Stunden nach Kampagnenstart.',
        },
        {
          q: 'Was bedeutet ROAS?',
          a: 'ROAS (Return on Ad Spend) misst, wie viel Umsatz du pro ausgegebenem Euro verdienst. Ein 5x ROAS bedeutet z.B., dass du €5 für jeden investierten Euro zurückbekommst.',
        },
        {
          q: 'Kann ich meine Kampagnen-Daten exportieren?',
          a: 'Ja! Gehe zur Kampagnen-Seite, wähle die gewünschten Kampagnen aus, klicke auf "Exportieren" und wähle dein bevorzugtes Format (CSV, Excel oder PDF).',
        },
      ],
    },
    {
      id: 'billing',
      title: 'Abrechnung & Preise',
      icon: <CreditCard className="w-5 h-5" />,
      questions: [
        {
          q: 'Welche Zahlungsmethoden akzeptiert ihr?',
          a: 'Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, American Express), PayPal und SEPA-Lastschrift für europäische Kunden.',
        },
        {
          q: 'Wann wird abgerechnet?',
          a: 'Dein Abo wird monatlich am Anmeldedatum abgerechnet. Ad Spend wird separat über dein Facebook Ads Konto nach Facebooks Abrechnungsbedingungen eingezogen.',
        },
        {
          q: 'Kann ich meinen Plan ändern oder kündigen?',
          a: 'Ja, du kannst jederzeit upgraden, downgraden oder kündigen unter Einstellungen > Abrechnung. Änderungen werden zum nächsten Abrechnungszyklus wirksam.',
        },
      ],
    },
    {
      id: 'account',
      title: 'Konto & Sicherheit',
      icon: <Shield className="w-5 h-5" />,
      questions: [
        {
          q: 'Wie aktiviere ich die Zwei-Faktor-Authentifizierung?',
          a: 'Gehe zu Einstellungen > Sicherheit, klicke auf "2FA aktivieren", scanne den QR-Code mit deiner Authenticator-App (Google Authenticator, Authy) und gib den Code ein.',
        },
        {
          q: 'Passwort vergessen - was tun?',
          a: 'Klicke auf "Passwort vergessen" auf der Login-Seite, gib deine E-Mail-Adresse ein, und wir senden dir einen Reset-Link. Der Link ist 24 Stunden gültig.',
        },
        {
          q: 'Wie lösche ich mein Konto?',
          a: 'Gehe zu Einstellungen > Sicherheit > Gefahrenzone, klicke auf "Konto löschen" und bestätige. Achtung: Diese Aktion ist unwiderruflich. Alle Daten werden innerhalb von 30 Tagen gelöscht.',
        },
      ],
    },
  ];

  // Ressourcen
  const resources = [
    {
      title: 'Video-Tutorials',
      description: 'Schritt-für-Schritt Video-Anleitungen',
      icon: <Video className="w-6 h-6" />,
      color: 'from-red-500/20',
      iconColor: 'text-red-500',
      items: [
        'Erste Schritte mit Meta Ads',
        'Deine erste Kampagne erstellen',
        'Analytics Dashboard verstehen',
        'Fortgeschrittene Targeting-Strategien',
      ],
    },
    {
      title: 'Dokumentation',
      description: 'Ausführliche technische Docs',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-blue-500/20',
      iconColor: 'text-blue-500',
      items: [
        'API-Referenz',
        'Integrations-Guide',
        'Best Practices',
        'Fehlerbehebung',
      ],
    },
    {
      title: 'Wissensdatenbank',
      description: 'Artikel und Guides',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-green-500/20',
      iconColor: 'text-green-500',
      items: [
        'Facebook Ads Grundlagen',
        'Optimierungs-Tipps',
        'Budget-Management',
        'A/B Testing Guide',
      ],
    },
  ];

  useEffect(() => {
    if (!profile && !user) return;
    setContactForm((prev) => ({
      ...prev,
      name: prev.name || profile?.full_name || '',
      email: prev.email || profile?.email || user?.email || '',
    }));
  }, [profile, user]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        user_id: user?.id ?? null,
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        subject: contactForm.subject.trim(),
        message: contactForm.message.trim(),
        status: 'open',
      };
      const { error } = await supabase.from('support_requests').insert(payload);
      if (error) throw error;
      setContactForm({ name: '', email: payload.email, subject: '', message: '' });
      toast.success('Anfrage erfolgreich gesendet');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Senden fehlgeschlagen';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResourceClick = (label: string) => {
    setActiveSection('faq');
    setSearchQuery(label);
    setExpandedFaq(null);
  };

  return (
    <DashboardShell
      title="Hilfe & Support"
      subtitle="Finde Antworten auf deine Fragen"
    >
      {/* Search Bar */}
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Suche nach Hilfeartikeln, Tutorials oder FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveSection('faq')}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${activeSection === 'faq'
            ? 'border-primary/50 bg-primary/10'
            : 'border-border/30 bg-card hover:scale-[1.02] hover:border-primary/30'
            }`}
        >
          <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
            <HelpCircle className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">FAQs</h3>
          <p className="text-sm text-muted-foreground">Häufig gestellte Fragen</p>
        </button>

        <button
          onClick={() => setActiveSection('contact')}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${activeSection === 'contact'
            ? 'border-primary/50 bg-primary/10'
            : 'border-border/30 bg-card hover:scale-[1.02] hover:border-primary/30'
            }`}
        >
          <div className="p-3 bg-green-500/20 rounded-xl w-fit mb-4">
            <MessageCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Support kontaktieren</h3>
          <p className="text-sm text-muted-foreground">Hilfe vom Support-Team</p>
        </button>

        <button
          onClick={() => setActiveSection('resources')}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${activeSection === 'resources'
            ? 'border-primary/50 bg-primary/10'
            : 'border-border/30 bg-card hover:scale-[1.02] hover:border-primary/30'
            }`}
        >
          <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4">
            <BookOpen className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Ressourcen</h3>
          <p className="text-sm text-muted-foreground">Tutorials, Guides und Docs</p>
        </button>
      </div>

      {/* Content Area */}
      <Card variant="glass">
        {/* FAQ Section */}
        {activeSection === 'faq' && (
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Häufig gestellte Fragen</h2>
              <p className="text-sm text-muted-foreground">Durchsuche Fragen nach Kategorie</p>
            </div>

            <div className="space-y-6">
              {faqCategories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">{category.icon}</div>
                    <h3 className="text-xl font-bold text-foreground">{category.title}</h3>
                  </div>

                  <div className="space-y-3">
                    {category.questions.map((faq, index) => {
                      const isExpanded = expandedFaq === index;

                      return (
                        <div
                          key={index}
                          className="bg-muted/30 border border-border/30 rounded-xl overflow-hidden hover:bg-muted/50 transition-all"
                        >
                          <button
                            onClick={() => setExpandedFaq(isExpanded ? null : index)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left"
                          >
                            <span className="font-semibold text-foreground pr-4">{faq.q}</span>
                            <ChevronDown
                              className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''
                                }`}
                            />
                          </button>
                          {isExpanded && (
                            <div className="px-6 pb-4 text-sm text-muted-foreground border-t border-border/30 pt-4">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}

        {/* Contact Support Section */}
        {activeSection === 'contact' && (
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Support kontaktieren</h2>
              <p className="text-sm text-muted-foreground">
                Nicht gefunden was du suchst? Schreib uns und wir melden uns innerhalb von 24 Stunden.
              </p>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl">
                <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2">E-Mail Support</h3>
                <p className="text-sm text-muted-foreground mb-3">Antwort innerhalb von 24 Stunden</p>
                <a
                  href="mailto:support@adruby.ai"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  support@adruby.ai
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-2xl">
                <div className="p-3 bg-green-500/20 rounded-xl w-fit mb-4">
                  <MessageCircle className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-3">Mo-Fr, 9-18 Uhr MEZ</p>
                <button
                  onClick={() => {
                    toast.info('Live Chat kommt bald! Nutze bis dahin unser Kontaktformular.', { duration: 4000 });
                    setActiveSection('contact');
                  }}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Gespräch starten
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Dein Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Dein Name"
                    className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">E-Mail-Adresse</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="deine@email.de"
                    className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Betreff</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="Wie können wir dir helfen?"
                  className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Nachricht</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Beschreibe dein Anliegen oder deine Frage im Detail..."
                  rows={6}
                  className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  required
                />
              </div>

              {submitError && (
                <div className="text-sm text-red-500">{submitError}</div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto gap-2"
                size="lg"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? 'Wird gesendet…' : 'Nachricht senden'}
              </Button>
            </form>
          </CardContent>
        )}

        {/* Resources Section */}
        {activeSection === 'resources' && (
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Lernressourcen</h2>
              <p className="text-sm text-muted-foreground">
                Entdecke unsere Guides, Tutorials und Dokumentation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {resources.map((resource, i) => (
                <div
                  key={i}
                  className={`p-6 bg-gradient-to-br ${resource.color} to-transparent border border-border/30 rounded-2xl hover:scale-[1.02] transition-all`}
                >
                  <div className={`p-4 bg-background/50 rounded-2xl w-fit mb-4 ${resource.iconColor}`}>
                    {resource.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>

                  <div className="space-y-2">
                    {resource.items.map((item, j) => (
                      <button
                        key={j}
                        onClick={() => handleResourceClick(item)}
                        className="w-full text-left px-3 py-2 bg-background/50 hover:bg-background/70 rounded-lg text-sm text-foreground flex items-center justify-between group transition-all"
                      >
                        {item}
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Popular Articles */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Beliebte Artikel</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Wie du deine Kampagnen optimierst', views: '2.4K', time: '5 Min Lesezeit' },
                  { title: 'Facebook Ads Targeting verstehen', views: '1.8K', time: '8 Min Lesezeit' },
                  { title: 'Budget-Zuweisung Best Practices', views: '1.5K', time: '6 Min Lesezeit' },
                  { title: 'Kampagnen-Performance analysieren', views: '1.2K', time: '7 Min Lesezeit' },
                ].map((article, i) => (
                  <button
                    key={i}
                    className="p-4 bg-muted/30 border border-border/30 rounded-xl hover:bg-muted/50 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors pr-4">
                        {article.title}
                      </h4>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{article.views} Aufrufe</span>
                      <span>•</span>
                      <span>{article.time}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </DashboardShell>
  );
}
