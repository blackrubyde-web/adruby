import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../public-landing-home/components/Header';

const comparisonRows = [
  {
    label: 'Komplexität / Learning Curve',
    madgicx: 'Viele Features, steile Lernkurve',
    adruby: 'Fokussiert auf Meta Ads Strategie, klarer Einstieg'
  },
  {
    label: 'Fokus',
    madgicx: 'Multi-Channel + viele AI-Funktionen',
    adruby: 'Meta Ads OS: Strategie, Creatives, Setup, Testing'
  },
  {
    label: 'Strategic Guidance',
    madgicx: 'Tools müssen gedeutet werden',
    adruby: 'Frameworks & Fragebögen liefern konkrete Pläne'
  },
  {
    label: 'Geeignet für',
    madgicx: 'Erfahrene Teams mit Zeit für Tiefe',
    adruby: 'Solo-Media Buyer, kleine Teams, E-Com Brands'
  }
];

const features = [
  {
    title: 'KI-gestützter Strategie-Generator',
    desc: 'Meta-spezifische Strategien in Minuten, angepasst an Ziel, Budget und Risiko.'
  },
  {
    title: 'Fertige Ad Copy & Hooks',
    desc: 'Hooks, Copy und UGC-Ideen abgestimmt auf Funnel und Zielgruppe.'
  },
  {
    title: 'Meta Setup Empfehlungen',
    desc: 'Exportierbare Kampagnen-, AdSet- und Ad-Strukturen mit klaren Testing-Plänen.'
  },
  {
    title: 'Speicherbare Strategien pro Kampagne',
    desc: 'Bewährte Playbooks sichern, wiederverwenden und iterieren – pro Brand oder Kampagne.'
  }
];

const switchReasons = [
  'Zu viel Zeit im Tool, zu wenig Zeit in Werbewirkung.',
  'Team kommt mit der Komplexität nicht klar.',
  'Fokus liegt auf Meta Ads – kein Multi-Channel nötig.',
  'Du willst klare Strategien statt Feature-Overload.'
];

const faqItems = [
  {
    q: 'Kann ich AdRuby testen, bevor ich Madgicx kündige?',
    a: 'Ja. Du kannst AdRuby parallel nutzen und prüfen, ob du deine Ziele schneller erreichst.'
  },
  {
    q: 'Ist AdRuby nur für Meta Ads?',
    a: 'Ja, AdRuby ist spezialisiert auf Meta Ads – mit Fokus auf Strategie, Creatives und Setup.'
  },
  {
    q: 'Brauche ich viel Einarbeitungszeit?',
    a: 'Nein. Der geführte Fragen-Flow liefert in Minuten ein Setup, das du direkt nutzen kannst.'
  },
  {
    q: 'Für wen lohnt sich AdRuby preislich?',
    a: 'Für Solo-Buyer, kleine Teams und E-Com Brands, die Meta Ads ernst nehmen und klare ROAS/CPA-Ziele verfolgen.'
  },
  {
    q: 'Kann ich meine bestehenden Kampagnen integrieren?',
    a: 'Du kannst Ziele, Audiences und Budgets übernehmen und AdRuby liefert dir dazu passende Strategien und Setups.'
  }
];

const MadgicxAlternative = () => {
  return (
    <>
      <Header />
      <main className="bg-[#fafafa] text-[#0b0b0b]">
        <section
          id="hero"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link to="/" className="text-sm font-semibold text-[#C80000] hover:underline">
                Zur Startseite
              </Link>
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center space-x-1 text-sm text-[#4a4a4a]">
                  <li className="flex items-center space-x-1">
                    <Link to="/" className="hover:underline text-[#0b0b0b]">
                      Startseite
                    </Link>
                    <span className="text-[#7a7a7a]">›</span>
                  </li>
                  <li className="text-[#0b0b0b] font-semibold">Madgicx Alternative</li>
                </ol>
              </nav>
            </div>
            <div className="grid gap-10 md:gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C80000]">
                Fokussiert auf Meta Ads
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Madgicx Alternative für klare, fokussierte Meta Ads Strategien
              </h1>
              <p className="text-base md:text-lg text-[#2c2c2c] leading-relaxed space-y-2">
                <span className="block">
                  Madgicx ist mächtig, aber oft komplex und überladen.
                </span>
                <span className="block">
                  AdRuby konzentriert sich auf das, was deine Meta Ads wirklich skalierbar macht: Strategie, Creatives, Setup und Testing – ohne Overkill.
                </span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link
                  to="/ad-ruby-registration"
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-[#C80000] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#a50000] transition-colors min-h-[44px]"
                >
                  AdRuby kostenlos testen
                </Link>
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center border border-[#d4d4d4] text-[#0b0b0b] px-6 py-3 rounded-lg font-semibold hover:bg-white transition-colors min-h-[44px]"
                >
                  Strategie-Beispiel ansehen
                </button>
              </div>
            </div>
              <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2 text-[#0b0b0b]">Madgicx</h3>
                  <ul className="space-y-2 text-sm text-[#4a4a4a]">
                    <li>Breites Feature-Set, viele Optionen</li>
                    <li>Multi-Channel, komplexe Oberflächen</li>
                    <li>Erfordert Einarbeitung und Zeit</li>
                  </ul>
                </div>
                <div className="bg-[#0f172a] text-white rounded-xl p-5 shadow-md border border-[#1f2937]">
                  <h3 className="text-lg font-semibold mb-2">AdRuby</h3>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>Fokus: Meta Ads Strategie & Setup</li>
                    <li>Geführte Fragen, klare Outputs</li>
                    <li>Schnelle Iterationen & weniger Overhead</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="madgicx-strong"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-white scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Madgicx ist stark – aber oft zu viel des Guten</h2>
              <p className="text-base md:text-lg text-[#4a4a4a] leading-relaxed">
                Viele Performance Buyer lieben die Power, scheitern aber an der Komplexität.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-[#e5e5e5] bg-[#fafafa] shadow-sm">
                <h3 className="text-lg font-semibold text-[#0b0b0b] mb-3">Stärken</h3>
                <ul className="space-y-2 text-sm text-[#4a4a4a]">
                  <li>Umfangreiche Automationen</li>
                  <li>Multi-Channel Features</li>
                  <li>Viele Optimierungshebel</li>
                </ul>
              </div>
              <div className="p-6 rounded-xl border border-[#e5e5e5] bg-[#fafafa] shadow-sm">
                <h3 className="text-lg font-semibold text-[#0b0b0b] mb-3">Typische Probleme</h3>
                <ul className="space-y-2 text-sm text-[#4a4a4a]">
                  <li>Überkomplexität, steile Lernkurve</li>
                  <li>Feature-Overload, wenig Fokus auf Strategie</li>
                  <li>Viel Zeit im Tool, weniger Zeit im Testing</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section
          id="comparison"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-[#fafafa] scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">AdRuby vs Madgicx im Überblick</h2>
              <p className="text-base md:text-lg text-[#4a4a4a] leading-relaxed">
                Fokus statt Overkill: Meta Ads OS mit klarer Guidance.
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
              <div className="grid grid-cols-3 bg-[#f3f4f6] text-sm font-semibold text-[#0b0b0b]">
                <div className="px-4 py-3 text-left">Kriterium</div>
                <div className="px-4 py-3 text-left">Madgicx</div>
                <div className="px-4 py-3 text-left bg-white">AdRuby</div>
              </div>
              <div className="divide-y divide-[#e5e7eb] text-sm text-[#2c2c2c]">
                {comparisonRows.map((row) => (
                  <div key={row.label} className="grid grid-cols-3">
                    <div className="px-4 py-3 font-semibold text-[#0b0b0b]">{row.label}</div>
                    <div className="px-4 py-3">{row.madgicx}</div>
                    <div className="px-4 py-3 bg-[#fafafa]">{row.adruby}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-white scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Was du mit AdRuby bekommst</h2>
              <p className="text-base md:text-lg text-[#4a4a4a] leading-relaxed">
                Meta Ads Outputs, die du sofort umsetzen und skalieren kannst.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feat) => (
                <div key={feat.title} className="p-6 rounded-xl border border-[#e5e5e5] bg-[#fafafa] shadow-sm">
                  <h3 className="text-lg font-semibold text-[#0b0b0b] mb-2">{feat.title}</h3>
                  <p className="text-sm text-[#4a4a4a] leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="switch-reasons"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-[#fafafa] scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Wann sich ein Wechsel lohnt</h2>
              <p className="text-base md:text-lg text-[#4a4a4a] leading-relaxed">
                Für Media Buyer, die Einfachheit und Klarheit wollen.
              </p>
            </div>
            <ul className="space-y-3 text-sm md:text-base text-[#2c2c2c]">
              {switchReasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#C80000]" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
            <div className="text-center text-sm text-[#C80000] font-semibold">
              <Link to="/meta-ads-tool-agenturen" className="hover:underline">
                Mehr zu AdRuby für Performance-Agenturen
              </Link>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-white scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">FAQ zur Madgicx Alternative</h2>
              <p className="text-base md:text-lg text-[#4a4a4a] leading-relaxed">
                Antworten für den Umstieg.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqItems.map((faq) => (
                <div key={faq.q} className="p-5 md:p-6 rounded-xl border border-[#e5e5e5] bg-[#fafafa] shadow-sm space-y-2">
                  <h3 className="font-semibold text-[#0b0b0b]">{faq.q}</h3>
                  <p className="text-sm text-[#4a4a4a] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="final-cta"
          className="px-4 md:px-8 lg:px-16 py-14 md:py-16 bg-[#C80000] text-white scroll-mt-24"
        >
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Klarheit statt Overkill: AdRuby für deine Meta Ads
            </h2>
            <p className="text-base md:text-lg text-white/90">
              Strategie, Creatives und Setup in einem Tool – fokussiert auf Meta Ads Performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/ad-ruby-registration"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-[#C80000] px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                AdRuby kostenlos testen
              </Link>
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center border border-white/40 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors min-h-[44px]"
              >
                Strategie-Beispiel ansehen
              </button>
            </div>
          </div>
        </section>

        <footer className="bg-[#000000] text-white py-14">
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
                <p className="text-gray-400 max-w-md text-sm leading-relaxed">
                  KI-basiertes Meta Ads OS für Marketer:innen & Brands. Strategien, Creatives, Copy und Setup in einem Workflow.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Produkt</h4>
                <div className="space-y-3">
                  {['KI-Strategie', 'Ad Generator', 'Meta Setup', 'Analytics', 'API Access'].map((item) => (
                    <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-4">Unternehmen</h4>
                <div className="space-y-3">
                  {['Über uns', 'Blog', 'Karriere', 'Presse', 'Kontakt'].map((item) => (
                    <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center pt-8 border-t border-gray-800 text-sm text-gray-400 gap-4">
              <span>© 2025 AdRuby. Alle Rechte vorbehalten.</span>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-white transition-colors">Impressum</a>
                <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
                <a href="#" className="hover:text-white transition-colors">AGB</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

export default MadgicxAlternative;
