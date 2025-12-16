import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../public-landing-home/components/Header';

const comparisonRows = [
  {
    label: 'Strategie-Entwicklung',
    agency: 'Workshops, Retainer, viele Abstimmungen',
    adruby: 'KI-gestützte Meta Strategie in Minuten, exportierbar'
  },
  {
    label: 'Creative-Entwicklung',
    agency: 'Begrenzte Ad-Varianten, langsame Iteration',
    adruby: 'Unbegrenzte Hooks, Copy & UGC-Ideen on-demand'
  },
  {
    label: 'Setup & Struktur',
    agency: 'Individuell, aber oft undurchsichtig',
    adruby: 'Klares Funnel-Setup, Testing-Plan, sofort bereit für den Meta Ads Manager'
  },
  {
    label: 'Reaktionsgeschwindigkeit',
    agency: 'Warteschleifen & Freigaben bremsen Tests',
    adruby: 'Neue Varianten und Strategien in Minuten'
  },
  {
    label: 'Kostenstruktur',
    agency: 'Retainer + Setup-Fee, oft pro Ad begrenzt',
    adruby: 'Planpreis, keine Begrenzung bei Strategien und Varianten'
  }
];

const agencyFaqs = [
  {
    q: 'Kann AdRuby meine Agentur komplett ersetzen?',
    a: 'Ja, wenn du intern umsetzen kannst. AdRuby liefert Strategie, Creatives, Copy und Setup-Vorschläge, die du direkt in Meta umsetzt.'
  },
  {
    q: 'Brauche ich Marketing-Erfahrung?',
    a: 'Grundverständnis hilft. AdRuby führt dich durch Fragen und liefert klare, umsetzbare Schritte für ROAS/CPA-Ziele.'
  },
  {
    q: 'Wie lange dauert es bis erste Ergebnisse kommen?',
    a: 'Du hast in Minuten ein Setup. Ergebnisse siehst du, sobald die ersten Tests laufen – meist in den ersten Tagen.'
  },
  {
    q: 'Kann ich AdRuby parallel zu meiner Agentur nutzen?',
    a: 'Ja. Viele Teams nutzen AdRuby als Strategie- und Creative-Maschine und lassen die Agentur umsetzen.'
  },
  {
    q: 'Wie viel Zeit pro Woche muss ich einplanen?',
    a: '1–2 Stunden pro Woche für Inputs und Auswertung reichen oft, weil AdRuby Strategien und Varianten für dich vorbereitet.'
  },
  {
    q: 'Kann ich mehrere Marken betreuen?',
    a: 'Ja, du kannst pro Brand Strategien speichern, Varianten generieren und Setups exportieren.'
  }
];

const FacebookAdsAgenturAlternative = () => {
  return (
    <>
      <Header />
      <main className="bg-background text-foreground">
        <section
          id="hero"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link to="/" className="text-sm font-semibold text-primary hover:underline">
                Zur Startseite
              </Link>
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-1">
                    <Link to="/" className="hover:underline text-foreground">
                      Startseite
                    </Link>
                    <span className="text-muted-foreground">›</span>
                  </li>
                  <li className="text-foreground font-semibold">Facebook Ads Agentur Alternative</li>
                </ol>
              </nav>
            </div>
            <div className="grid gap-10 md:gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Meta Ads ohne Agentur-Overhead
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  Die beste Alternative zur Facebook Ads Agentur
                </h1>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed space-y-3">
                  <span className="block">
                    Genervt von Fees, Intransparenz und langen Abstimmungsschleifen?
                  </span>
                  <span className="block">
                    Mit AdRuby steuerst du deine Meta Ads wie eine Top-Agentur – mit KI, klarer Strategie und einem System, das du selbst kontrollierst.
                  </span>
                </p>
                <ul className="space-y-2 text-sm md:text-base text-muted-foreground">
                  {[
                    'Keine Lust mehr auf 10 Meetings, bevor eine neue Ad live geht?',
                    'Du willst genau wissen, warum eine Kampagne läuft – oder eben nicht?',
                    'Du willst Budget in Ergebnisse investieren statt in Retainer?'
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Link
                    to="/ad-ruby-registration"
                    className="w-full sm:w-auto inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors min-h-[44px]"
                  >
                    AdRuby kostenlos testen
                  </Link>
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-center border border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-card transition-colors min-h-[44px]"
                  >
                    Demo-Video ansehen
                  </button>
                </div>
              </div>
              <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Agentur-Setup</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Retainer + Setup-Fee</li>
                      <li>Wenige Creative-Iterationen pro Monat</li>
                      <li>Langsame Freigaben</li>
                      <li>Limitierte Transparenz bei ROAS/CPA</li>
                    </ul>
                  </div>
                  <div className="bg-card text-primary-foreground rounded-xl p-5 shadow-md border border-border">
                    <h3 className="text-lg font-semibold mb-3">AdRuby-Setup</h3>
                    <ul className="space-y-2 text-sm text-primary-foreground/80">
                      <li>Planpreis, unbegrenzte Strategien & Ads</li>
                      <li>KI-Hooks, Copy & UGC-Ideen on-demand</li>
                      <li>Exportierbare Meta Setups in Minuten</li>
                      <li>Volle Kontrolle & sofortige Iterationen</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="agency-problems"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-white scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Warum viele Meta Ads Agenturen nicht (mehr) passen</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Typische Pain Points, wenn du Performance und Tempo brauchst.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  title: 'Teuer und intransparent',
                  desc: 'Retainer, Setup-Fees und kaum Sicht auf ROAS/CPA-Logik.'
                },
                {
                  title: 'Keine echte Strategie',
                  desc: 'Oft nur einzelne Kampagnen statt klarer Funnel-Logik und Testing-Plan.'
                },
                {
                  title: 'Langsame Umsetzung',
                  desc: 'Creative-Iterationen brauchen Tage, Tests werden selten gefahren.'
                },
                {
                  title: 'Abhängigkeit statt Kontrolle',
                  desc: 'Du wartest auf Freigaben, während Budget verbrennt.'
                }
              ].map((card) => (
                <div key={card.title} className="p-5 rounded-xl border border-border bg-background shadow-sm">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="needs"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-background scroll-mt-24"
        >
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Was du stattdessen brauchst</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Kontrolle, Tempo und eine klare Meta Ads Engine.
              </p>
            </div>
            <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
              {[
                'Klare, wiederholbare Meta Ads Strategie',
                'Schnelle Erstellung von Creatives und Copy',
                'Strukturiertes Testing & Skalierung',
                'Volle Transparenz über Budget, Funnel und Performance'
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm md:text-base text-muted-foreground">
              Genau hier setzt AdRuby an.
            </p>
          </div>
        </section>

        <section
          id="adruby-vs-agency"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-white scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">AdRuby – dein Meta Ads OS statt externer Agentur</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Strategien, Creatives, Copy und Setups, die du sofort umsetzen kannst.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4 bg-background border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-foreground">Warum AdRuby für Selbststeuerer</h3>
                <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span>Fertige Strategien & Setups, die ROAS und CPA im Blick haben.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span>Unbegrenzte Creative- und Copy-Varianten, testbar in Minuten.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span>Vollständige Transparenz: du weißt, warum etwas funktioniert.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span>Planpreis statt Retainer, keine Wartezeit auf Freigaben.</span>
                  </li>
                </ul>
              </div>
              <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <div className="grid grid-cols-2 bg-card text-sm font-semibold text-foreground">
                  <div className="px-4 py-3">Agentur</div>
                  <div className="px-4 py-3 bg-white">AdRuby</div>
                </div>
                <div className="divide-y divide-border/60 text-sm text-muted-foreground">
                  {comparisonRows.map((row) => (
                    <div key={row.label} className="grid grid-cols-2">
                      <div className="px-4 py-3">
                        <p className="font-semibold text-foreground">{row.label}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{row.agency}</p>
                      </div>
                      <div className="px-4 py-3 bg-background">
                        <p className="font-semibold text-foreground">{row.label}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{row.adruby}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-background scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">So ersetzt oder ergänzt AdRuby deine Agentur</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                In drei Schritten von Input zu umsetzbarem Meta Setup.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: '1. Kampagne oder Produkt anlegen',
                  desc: 'Ziel, Budget-Level und Audience angeben – oder bestehende Kampagnen importieren.'
                },
                {
                  title: '2. Strategie & Creatives generieren',
                  desc: 'Fragen beantworten, AdRuby liefert Funnel-Strategie, Hooks, Copy und Varianten.'
                },
                {
                  title: '3. Setup umsetzen & skalieren',
                  desc: 'Export ins Meta Ads Manager Setup, Tests fahren, AdRuby liefert laufend neue Ideen.'
                }
              ].map((step, idx) => (
                <div key={step.title} className="p-6 rounded-xl border border-border bg-white shadow-sm">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold mb-3">
                    {idx + 1}
                  </span>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm md:text-base text-center text-muted-foreground">
              Du kannst AdRuby auch mit deiner Agentur nutzen – als Strategie- und Creative-Maschine.
            </p>
          </div>
        </section>

        <section
          id="cases"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-white scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Wer AdRuby statt Agentur nutzt</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Beispiele, wie Teams Kontrolle zurückholen und ROAS sichern.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'E-Commerce: Agentur gekündigt',
                  story: 'Shop übernimmt Steuerung mit AdRuby, fährt wöchentliche Creative-Tests und steuert Budgets selbst.',
                  metric: 'ROAS stabilisiert bei 3.5x'
                },
                {
                  title: 'Brand: Agentur bleibt, Strategie via AdRuby',
                  story: 'AdRuby liefert Hooks, Copy und Setups; Agentur setzt um. Mehr Tests, klarere Reports.',
                  metric: '20% niedrigere CPA'
                },
                {
                  title: 'Coaching: Komplett Self-Service',
                  story: 'Founder legt Ziele fest, AdRuby liefert Funnel-Strategie und Ads, Umsetzung intern.',
                  metric: '+45% mehr qualifizierte Leads'
                }
              ].map((card) => (
                <div key={card.title} className="p-6 rounded-xl border border-border bg-background shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{card.story}</p>
                  <p className="text-sm font-semibold text-primary">{card.metric}</p>
                </div>
                ))}
              </div>
            <div className="text-center text-sm text-primary font-semibold">
              <Link to="/meta-ads-tool-ecommerce" className="hover:underline">
                Mehr zu AdRuby für E-Commerce & D2C Brands
              </Link>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-background scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Häufige Fragen zur AdRuby-Agentur-Alternative</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Klare Antworten für Entscheider:innen.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agencyFaqs.map((faq) => (
                <div key={faq.q} className="p-5 md:p-6 rounded-xl border border-border bg-white shadow-sm space-y-2">
                  <h3 className="font-semibold text-foreground">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="final-cta"
          className="px-4 md:px-8 lg:px-16 py-14 md:py-16 bg-primary text-primary-foreground scroll-mt-24"
        >
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Bereit für mehr Kontrolle über deine Meta Ads?
            </h2>
            <p className="text-base md:text-lg text-primary-foreground/90">
              Ersetze oder ergänze deine Agentur mit AdRuby – Strategie, Creatives und Setup in einem Tool.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/ad-ruby-registration"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                AdRuby kostenlos testen
              </Link>
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center border border-white/40 text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-card/10 transition-colors min-h-[44px]"
              >
                Kurzberatung buchen
              </button>
            </div>
          </div>
        </section>

        <footer className="bg-background text-primary-foreground py-14">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-4 gap-12 mb-12">
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src="/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png"
                    alt="AdRuby Markenlogo"
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-xl font-bold">AdRuby</span>
                </div>
                <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                  KI-basiertes Meta Ads OS für Marketer:innen & Brands. Strategien, Creatives, Copy und Setup in einem Workflow.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Produkt</h4>
                <div className="space-y-3">
                  {['KI-Strategie', 'Ad Generator', 'Meta Setup', 'Analytics', 'API Access'].map((item) => (
                    <a key={item} href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-4">Unternehmen</h4>
                <div className="space-y-3">
                  {['Über uns', 'Blog', 'Karriere', 'Presse', 'Kontakt'].map((item) => (
                    <a key={item} href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center pt-8 border-t border-gray-800 text-sm text-muted-foreground gap-4">
              <span>© 2025 AdRuby. Alle Rechte vorbehalten.</span>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-foreground transition-colors">Impressum</a>
                <a href="#" className="hover:text-foreground transition-colors">Datenschutz</a>
                <a href="#" className="hover:text-foreground transition-colors">AGB</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

export default FacebookAdsAgenturAlternative;
