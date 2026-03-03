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

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Erste Schritte',
      icon: <Zap className="w-4 h-4" />,
      questions: [
        { q: 'Wie erstelle ich meine erste Kampagne?', a: 'Klicke auf "Kampagne erstellen" oben rechts. Folge dem Schritt-für-Schritt-Wizard, um deine Kampagnendetails, Zielgruppe, Budget und Creatives einzurichten. Danach klicke auf "Kampagne starten".' },
        { q: 'Wie verbinde ich mein Meta Ads Konto?', a: 'Gehe zu Einstellungen > Integrationen, klicke auf "Meta verbinden" und folge dem OAuth-Flow. Stelle sicher, dass du Admin-Zugriff auf dein Facebook Ads Konto hast.' },
        { q: 'Was sind die Mindestanforderungen zum Starten?', a: 'Du brauchst ein verifiziertes Facebook Ads Konto, eine verbundene Zahlungsmethode und mindestens €50 Mindestbudget für deine erste Kampagne.' },
      ],
    },
    {
      id: 'campaigns',
      title: 'Kampagnen-Management',
      icon: <Target className="w-4 h-4" />,
      questions: [
        { q: 'Wie pausiere oder stoppe ich eine Kampagne?', a: 'Gehe zu deiner Kampagnen-Übersicht, finde die gewünschte Kampagne, klicke auf das Drei-Punkte-Menü und wähle "Kampagne pausieren". Zum endgültigen Beenden wähle "Kampagne beenden".' },
        { q: 'Kann ich eine laufende Kampagne bearbeiten?', a: 'Ja, du kannst die meisten Einstellungen bearbeiten während sie läuft. Budget- oder Targeting-Änderungen können jedoch eine Ad-Review auslösen.' },
        { q: 'Wie lange dauert die Kampagnen-Freigabe?', a: 'Facebook prüft Ads normalerweise innerhalb von 24 Stunden. Die meisten Ads werden innerhalb weniger Stunden freigegeben.' },
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      icon: <BarChart3 className="w-4 h-4" />,
      questions: [
        { q: 'Wie oft werden die Daten aktualisiert?', a: 'Kampagnen-Daten werden alle 15 Minuten von Meta synchronisiert. Für akkurate Daten warte 24-48 Stunden nach Kampagnenstart.' },
        { q: 'Was bedeutet ROAS?', a: 'ROAS (Return on Ad Spend) misst, wie viel Umsatz du pro ausgegebenem Euro verdienst. Ein 5x ROAS bedeutet, dass du €5 für jeden investierten Euro zurückbekommst.' },
        { q: 'Kann ich meine Kampagnen-Daten exportieren?', a: 'Ja! Gehe zur Kampagnen-Seite, wähle die gewünschten Kampagnen aus, klicke auf "Exportieren" und wähle dein bevorzugtes Format (CSV, Excel oder PDF).' },
      ],
    },
    {
      id: 'billing',
      title: 'Abrechnung & Preise',
      icon: <CreditCard className="w-4 h-4" />,
      questions: [
        { q: 'Welche Zahlungsmethoden akzeptiert ihr?', a: 'Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, American Express), PayPal und SEPA-Lastschrift.' },
        { q: 'Wann wird abgerechnet?', a: 'Dein Abo wird monatlich am Anmeldedatum abgerechnet. Ad Spend wird separat über dein Facebook Ads Konto eingezogen.' },
        { q: 'Kann ich meinen Plan ändern oder kündigen?', a: 'Ja, du kannst jederzeit upgraden, downgraden oder kündigen unter Einstellungen > Abrechnung.' },
      ],
    },
    {
      id: 'account',
      title: 'Konto & Sicherheit',
      icon: <Shield className="w-4 h-4" />,
      questions: [
        { q: 'Wie aktiviere ich die Zwei-Faktor-Authentifizierung?', a: 'Gehe zu Einstellungen > Sicherheit, klicke auf "2FA aktivieren", scanne den QR-Code mit deiner Authenticator-App und gib den Code ein.' },
        { q: 'Passwort vergessen - was tun?', a: 'Klicke auf "Passwort vergessen" auf der Login-Seite, gib deine E-Mail-Adresse ein, und wir senden dir einen Reset-Link.' },
        { q: 'Wie lösche ich mein Konto?', a: 'Gehe zu Einstellungen > Sicherheit > Gefahrenzone, klicke auf "Konto löschen" und bestätige. Alle Daten werden innerhalb von 30 Tagen gelöscht.' },
      ],
    },
  ];

  const resources = [
    {
      title: 'Video-Tutorials',
      description: 'Schritt-für-Schritt Anleitungen',
      icon: <Video className="w-4 h-4" />,
      items: ['Erste Schritte mit Meta Ads', 'Deine erste Kampagne erstellen', 'Analytics Dashboard verstehen', 'Fortgeschrittene Targeting-Strategien'],
    },
    {
      title: 'Dokumentation',
      description: 'Technische Docs',
      icon: <BookOpen className="w-4 h-4" />,
      items: ['API-Referenz', 'Integrations-Guide', 'Best Practices', 'Fehlerbehebung'],
    },
    {
      title: 'Wissensdatenbank',
      description: 'Artikel und Guides',
      icon: <FileText className="w-4 h-4" />,
      items: ['Facebook Ads Grundlagen', 'Optimierungs-Tipps', 'Budget-Management', 'A/B Testing Guide'],
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

  const sectionTabs = [
    { id: 'faq' as const, label: 'FAQs', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'contact' as const, label: 'Kontakt', icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { id: 'resources' as const, label: 'Ressourcen', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <DashboardShell hideHero>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Hilfe & Support</h1>
          <p className="text-sm text-muted-foreground">Finde Antworten auf deine Fragen</p>
        </div>
      </div>

      {/* ── Search ─────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Hilfe-Artikel, Tutorials oder FAQs suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-border/50 rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all"
        />
      </div>

      {/* ── Section Tabs ───────────────────────────────── */}
      <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border/50 w-fit">
        {sectionTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeSection === tab.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── FAQ Section ────────────────────────────────── */}
      {activeSection === 'faq' && (
        <div className="space-y-6">
          {faqCategories.map((category) => (
            <div key={category.id} className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border/50 bg-muted/30">
                <span className="text-muted-foreground">{category.icon}</span>
                <h3 className="text-sm font-semibold text-foreground">{category.title}</h3>
              </div>
              <div className="divide-y divide-border/50">
                {category.questions.map((faq, index) => {
                  const globalIndex = faqCategories.indexOf(category) * 100 + index;
                  const isExpanded = expandedFaq === globalIndex;
                  return (
                    <div key={index}>
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : globalIndex)}
                        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-muted/20 transition-colors"
                      >
                        <span className="text-sm font-medium text-foreground pr-4">{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
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
      )}

      {/* ── Contact Section ────────────────────────────── */}
      {activeSection === 'contact' && (
        <div className="space-y-4">
          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">E-Mail Support</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Antwort innerhalb von 24 Stunden</p>
              <a href="mailto:support@adruby.ai" className="text-xs text-primary hover:underline flex items-center gap-1">
                support@adruby.ai
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Live Chat</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Mo-Fr, 9-18 Uhr MEZ</p>
              <button
                onClick={() => toast.info('Live Chat kommt bald!', { duration: 3000 })}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Gespräch starten
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Nachricht senden</h3>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Dein Name"
                    className="w-full px-3 py-2 bg-transparent border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">E-Mail</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="deine@email.de"
                    className="w-full px-3 py-2 bg-transparent border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Betreff</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="Wie können wir dir helfen?"
                  className="w-full px-3 py-2 bg-transparent border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nachricht</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Beschreibe dein Anliegen..."
                  rows={5}
                  className="w-full px-3 py-2 bg-transparent border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all resize-none"
                  required
                />
              </div>
              {submitError && (
                <div className="text-sm text-destructive">{submitError}</div>
              )}
              <Button type="submit" disabled={isSubmitting} size="sm" className="gap-1.5">
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Senden…' : 'Absenden'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ── Resources Section ──────────────────────────── */}
      {activeSection === 'resources' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {resources.map((resource, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                  <span className="text-muted-foreground">{resource.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{resource.title}</h3>
                    <p className="text-[11px] text-muted-foreground">{resource.description}</p>
                  </div>
                </div>
                <div className="divide-y divide-border/50">
                  {resource.items.map((item, j) => (
                    <button
                      key={j}
                      onClick={() => handleResourceClick(item)}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted/30 transition-colors flex items-center justify-between group"
                    >
                      {item}
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Popular Articles */}
          <div className="rounded-xl border border-border/50 bg-card">
            <div className="px-5 py-3 border-b border-border/50">
              <h3 className="text-sm font-semibold text-foreground">Beliebte Artikel</h3>
            </div>
            <div className="divide-y divide-border/50">
              {[
                { title: 'Wie du deine Kampagnen optimierst', views: '2.4K', time: '5 Min' },
                { title: 'Facebook Ads Targeting verstehen', views: '1.8K', time: '8 Min' },
                { title: 'Budget-Zuweisung Best Practices', views: '1.5K', time: '6 Min' },
                { title: 'Kampagnen-Performance analysieren', views: '1.2K', time: '7 Min' },
              ].map((article, i) => (
                <button
                  key={i}
                  className="w-full text-left px-5 py-3.5 hover:bg-muted/30 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{article.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{article.views} Aufrufe · {article.time}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
