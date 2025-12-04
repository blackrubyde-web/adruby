import React from 'react';
import SeoLandingTemplate from '../../components/seo/SeoLandingTemplate';

const MetaAdsToolEcommerce = () => {
  const sections = [
    {
      id: 'problems',
      heading: 'Die typischen E-Com Meta Ads Probleme',
      description: 'ROAS schwankt, Creatives brennen aus, Skalierung bricht – jeden Monat dieselben Fragen.',
      content: (
        <ul className="space-y-2 text-sm md:text-base text-[#2c2c2c] max-w-3xl mx-auto">
          {[
            'ROAS schwankt, sobald ein Creative ausbrennt.',
            'Neue Creatives dauern zu lange, Tests laufen zu langsam.',
            'Skalierung bricht ab, sobald du Budgets erhöhst.'
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#C80000]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    },
    {
      id: 'benefits',
      heading: 'Wie AdRuby E-Commerce Brands hilft',
      description: 'Meta Ads Strategien, Creatives und Setups, die du sofort testen kannst.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Prospecting & Retargeting Strategien',
              desc: 'Funnel-Logik mit klaren Audience-Splits und Budget-Clustern.'
            },
            {
              title: 'UGC vs. Produktads',
              desc: 'Hook- und Copy-Varianten für UGC, DPA und statische Produktads.'
            },
            {
              title: 'Creative-Testing',
              desc: 'Testing-Pläne mit klaren KPIs (ROAS/CPA) und Iterationsvorschlägen.'
            },
            {
              title: 'Funnel-Logik',
              desc: 'Vom ersten Touchpoint bis zum Kauf – sauber abgedeckte Stufen.'
            }
          ].map((card) => (
            <div key={card.title} className="p-6 rounded-xl border border-[#e5e5e5] bg-[#fafafa] shadow-sm">
              <h3 className="text-lg font-semibold text-[#0b0b0b] mb-2">{card.title}</h3>
              <p className="text-sm text-[#4a4a4a] leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'use-cases',
      heading: 'Konkrete Use-Cases',
      description: 'Typische E-Com Szenarien, bei denen AdRuby den Unterschied macht.',
      content: (
        <ul className="space-y-3 text-sm md:text-base text-[#2c2c2c] max-w-3xl mx-auto">
          {[
            'Launch neuer Produkte: Hooks, Copy, Creatives und Setup in Minuten.',
            'Skalierung einer Gewinner-Kampagne: Budget-Clustering und frische Varianten.',
            'Black-Friday-Strategien: Sequenzen für Vorverkauf, Peak und Post-Sale.'
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#C80000]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    },
    {
      id: 'faq',
      heading: 'FAQ für E-Commerce',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              q: 'Ab welchem Budget lohnt sich AdRuby?',
              a: 'Sobald du ernsthaft in Meta Ads investierst – ab niedrigen vierstelligen Monatsbudgets.'
            },
            {
              q: 'Welche Shopsysteme werden unterstützt?',
              a: 'AdRuby ist tool-agnostisch. Strategien und Setups exportierst du in den Meta Ads Manager.'
            },
            {
              q: 'Wie oft sollte ich neue Creatives testen?',
              a: 'AdRuby schlägt wöchentliche Iterationen vor, angepasst an Spend und Risiko-Level.'
            },
            {
              q: 'Kann ich bestehende Kampagnen übernehmen?',
              a: 'Ja, du nutzt deine Ziele, Audiences und Produkte als Input und bekommst passende Strategien.'
            }
          ].map((faq) => (
            <div key={faq.q} className="p-5 md:p-6 rounded-xl border border-[#e5e5e5] bg-white shadow-sm space-y-2">
              <h3 className="font-semibold text-[#0b0b0b]">{faq.q}</h3>
              <p className="text-sm text-[#4a4a4a] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <SeoLandingTemplate
      eyebrow="Meta Ads für E-Commerce"
      title="Meta Ads Tool für E-Commerce & D2C Brands"
      subtitle={`AdRuby hilft dir, profitabel zu skalieren, neue Creatives laufend zu testen und klare Strategien für deine Meta Ads zu fahren – ohne dass du eine ganze Inhouse-Unit brauchst.`}
      primaryCtaLabel="AdRuby kostenlos testen"
      primaryCtaHref="/ad-ruby-registration"
      secondaryCtaLabel="Strategie-Beispiel ansehen"
      secondaryCtaHref="/ad-ruby-registration"
      breadcrumb={[
        { label: 'Startseite', href: '/' },
        { label: 'Meta Ads Tool für E-Commerce' }
      ]}
      sections={sections}
    />
  );
};

export default MetaAdsToolEcommerce;
