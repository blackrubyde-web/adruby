import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../public-landing-home/components/Header';

const comparisonRows = [
  {
    label: 'Fokus',
    adcreative: 'Creatives generieren',
    adruby: 'Strategie + Funnel + Setup + Creatives'
  },
  {
    label: 'Meta Ads Spezialisierung',
    adcreative: 'Allgemeine Ad-Generierung',
    adruby: 'Meta Ads OS mit Budget-, Funnel- und Audience-Logik'
  },
  {
    label: 'Funnel- & Testing-Frameworks',
    adcreative: 'Basis-Ideen',
    adruby: 'Strukturierter Testing-Plan mit ROAS/CPA-Zielen'
  },
  {
    label: 'Integration ins Setup',
    adcreative: 'Export von Assets',
    adruby: 'Exportierbare Meta Setups (Kampagne, AdSets, Ads)'
  },
  {
    label: 'Strategische Tiefe',
    adcreative: 'Primär Creative-Output',
    adruby: 'Strategie, Copy, Creatives + laufende Iterationen'
  }
];

const testimonials = [
  {
    quote: 'Wir wollten mehr als nur Bilder. AdRuby liefert Strategien, Setups und Copy – wir testen doppelt so schnell.',
    author: 'Lena Fischer',
    role: 'Head of Growth, D2C Brand'
  },
  {
    quote: 'Klarer Funnel-Plan, Hooks und AdSets in Minuten. Wir behalten die Kontrolle und sparen Agenturkosten.',
    author: 'Marc Hoffmann',
    role: 'Marketing Lead, SaaS'
  },
  {
    quote: 'Meta-spezifische Empfehlungen, die sofort umsetzbar sind. Weniger Rätselraten, mehr ROAS.',
    author: 'Sarah König',
    role: 'Performance Managerin, E-Com'
  }
];

const features = [
  {
    title: 'Komplette Meta Ads Strategien',
    desc: 'Funnel-Logik, Audience-Clustering und Budget-Empfehlungen statt nur einzelne Ads.'
  },
  {
    title: 'Meta Ads Setup Empfehlungen',
    desc: 'Exportierbare Kampagnen-, AdSet- und Ad-Layouts mit klaren Naming- und Testing-Strukturen.'
  },
  {
    title: 'Fragebogen-basiertes Strategie-Tuning',
    desc: 'AdRuby passt Empfehlungen an dein Risiko-Level, Budget und Ziel-KPIs an.'
  },
  {
    title: 'Speicherbare Strategien für jede Kampagne',
    desc: 'Bewährte Strategien sichern und wiederverwenden, inklusive Hooks und Copy-Blöcke.'
  }
];

const useCases = [
  {
    title: 'Du willst skalieren, nicht nur Creatives austauschen.',
    bullets: [
      'Funnel-Plan pro Ziel, nicht nur neue Bilder',
      'Testing-Sequenzen für Prospecting und Retargeting',
      'ROAS/CPA-Alerts und klare Next Steps'
    ]
  },
  {
    title: 'Du brauchst ein wiederholbares Framework für deine Meta Ads.',
    bullets: [
      'Standardisierte Setups, die du kopieren kannst',
      'Hooks/Copy nach Zielgruppe und Intent',
      'Weniger Rätselraten bei Budget- und Audience-Splits'
    ]
  },
  {
    title: 'Strategien, die zu Funnel, Zielgruppe und Budget passen.',
    bullets: [
      'Fragen zu Risiko-Level und KPIs steuern die Empfehlungen',
      'Creatives und Copy orientieren sich an deinem Offer',
      'Skalierungs- und Testpläne kommen integriert'
    ]
  }
];

const faqItems = [
  {
    q: 'Kann ich AdRuby zusätzlich zu AdCreative.ai nutzen?',
    a: 'Ja. Du kannst Creatives von dort nutzen und Strategie, Copy und Setup aus AdRuby ziehen – oder komplett auf AdRuby setzen.'
  },
  {
    q: 'Unterstützt AdRuby auch andere Kanäle?',
    a: 'AdRuby ist auf Meta Ads spezialisiert, liefert aber strategische Inputs, die du auch auf andere Kanäle übertragen kannst.'
  },
  {
    q: 'Für welche Budgets lohnt sich AdRuby?',
    a: 'Ab niedrigen vierstelligen Monatsbudgets sinnvoll, je höher das Budget, desto mehr zahlt sich die strukturierte Strategie aus.'
  },
  {
    q: 'Brauche ich Meta Ads Erfahrung?',
    a: 'Grundverständnis hilft. AdRuby führt dich durch Fragen und liefert ein Setup, das sofort umsetzbar ist.'
  },
  {
    q: 'Wie schnell bekomme ich Ergebnisse?',
    a: 'Du hast in Minuten einen umsetzbaren Plan. Ergebnisse kommen, sobald deine Tests live gehen und Daten sammeln.'
  }
];

const AdCreativeAiAlternative = () => {
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
                  <li className="text-[#0b0b0b] font-semibold">AdCreative.ai Alternative</li>
                </ol>
              </nav>
            </div>
            <div className="grid gap-10 md:gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C80000]">
                Faire Gegenüberstellung
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                AdCreative.ai Alternative für ernsthafte Meta Ads Strategien
              </h1>
              <p className="text-base md:text-lg text-[#2c2c2c] leading-relaxed space-y-2">
                <span className="block">
                  Du willst mehr als nur automatisch generierte Creatives?
                </span>
                <span className="block">
                  AdRuby kombiniert KI-Creatives mit kompletter Meta Ads Strategie, Funnel-Logik und Setup-Empfehlungen.
                </span>
                <span className="block text-sm text-[#4a4a4a]">
                  Diese Seite vergleicht fair, wo AdCreative.ai gut ist – und wo AdRuby weitergeht.
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
                  <h3 className="text-lg font-semibold mb-2 text-[#0b0b0b]">AdCreative.ai</h3>
                  <ul className="space-y-2 text-sm text-[#4a4a4a]">
                    <li>Fokus: Creative-Generierung</li>
                    <li>Bildvarianten & Basis-Adtexte</li>
                    <li>Kein tiefes Funnel- oder Setup-Playbook</li>
                  </ul>
                </div>
                <div className="bg-[#0f172a] text-white rounded-xl p-5 shadow-md border border-[#1f2937]">
                  <h3 className="text-lg font-semibold mb-2">AdRuby</h3>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>Fokus: Strategie + Creatives + Setup</li>
                    <li>Meta-spezifische Testing- & Funnel-Frameworks</li>
                    <li>Exportierbare Kampagnen-Layouts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="short-comparison"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-white scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Wofür AdCreative.ai gut ist – und wo AdRuby weitergeht</h2>
              <p className="text-base md:text-lg text-[#4a4a4a] leading-relaxed">
                AdCreative.ai ist stark, wenn du schnelle Creative-Ideen brauchst.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-2 text-sm md:text-base text-[#2c2c2c]">
                <p className="font-semibold">Pluspunkte AdCreative.ai:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#C80000]" />
                    <span>Schnelle Generierung von Anzeigenbildern</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#C80000]" />
                    <span>Basic Ad-Varianten</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2 text-sm md:text-base text-[#2c2c2c]">
                <p className="font-semibold">Aber wenn du mehr willst:</p>
                <p className="text-[#4a4a4a]">
                  Wenn du komplette Meta Ads Strategien, Testing-Pläne und Setup-Logik brauchst, stößt du dort an Grenzen.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-[#C80000] font-semibold">
            <Link to="/meta-ads-tool-agenturen" className="hover:underline">
              Mehr zu AdRuby für Performance-Agenturen
            </Link>
          </div>
        </section>

        <section
          id="comparison-table"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-[#fafafa] scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">AdCreative.ai vs AdRuby im Vergleich</h2>
              <p className="text-base md:text-lg text-[#4a4a4a] leading-relaxed">
                Fairer Vergleich: Creative-Tool vs Meta Ads OS mit Strategie-Fokus.
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
              <div className="grid grid-cols-3 bg-[#f3f4f6] text-sm font-semibold text-[#0b0b0b]">
                <div className="px-4 py-3 text-left">Kriterium</div>
                <div className="px-4 py-3 text-left">AdCreative.ai</div>
                <div className="px-4 py-3 text-left bg-white">AdRuby</div>
              </div>
              <div className="divide-y divide-[#e5e7eb] text-sm text-[#2c2c2c]">
                {comparisonRows.map((row) => (
                  <div key={row.label} className="grid grid-cols-3">
                    <div className="px-4 py-3 font-semibold text-[#0b0b0b]">{row.label}</div>
                    <div className="px-4 py-3">{row.adcreative}</div>
                    <div className="px-4 py-3 bg-[#fafafa]">{row.adruby}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="adruby-features"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-white scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Was du mit AdRuby on top bekommst</h2>
              <p className="text-base md:text-lg text-[#4a4a4a] leading-relaxed">
                Strategie, Setup und Creatives – alles in einem Meta Ads OS.
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
          id="use-cases"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-[#fafafa] scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Wann AdRuby die bessere Wahl ist</h2>
              <p className="text-base md:text-lg text-[#4a4a4a] leading-relaxed">
                Für Teams, die mehr Kontrolle, Strategie und Skalierung brauchen.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {useCases.map((useCase) => (
                <div key={useCase.title} className="p-6 rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
                  <h3 className="text-lg font-semibold text-[#0b0b0b] mb-3">{useCase.title}</h3>
                  <ul className="space-y-2 text-sm text-[#4a4a4a]">
                    {useCase.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#C80000]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="testimonials"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-white scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Was Nutzer:innen an AdRuby schätzen</h2>
              <p className="text-base md:text-lg text-[#4a4a4a] leading-relaxed">
                Struktur, Klarheit und Geschwindigkeit beim Testen.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.author} className="p-6 rounded-xl border border-[#e5e5e5] bg-[#fafafa] shadow-sm">
                  <p className="text-sm text-[#2c2c2c] leading-relaxed mb-4">“{t.quote}”</p>
                  <p className="text-sm font-semibold text-[#0b0b0b]">{t.author}</p>
                  <p className="text-xs text-[#6b6b6b]">{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 bg-[#fafafa] scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">FAQ zur AdCreative.ai Alternative</h2>
              <p className="text-base md:text-lg text-[#4a4a4a] leading-relaxed">
                Wichtigste Fragen für den Umstieg.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqItems.map((faq) => (
                <div key={faq.q} className="p-5 md:p-6 rounded-xl border border-[#e5e5e5] bg-white shadow-sm space-y-2">
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
              AdCreative.ai ist dir zu flach? Probier AdRuby.
            </h2>
            <p className="text-base md:text-lg text-white/90">
              Meta Ads Strategie, Setup und Creatives in einem Tool – ohne Agentur-Overhead.
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

export default AdCreativeAiAlternative;
