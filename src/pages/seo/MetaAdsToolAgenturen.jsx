import React from 'react';
import SeoLandingTemplate from '../../components/seo/SeoLandingTemplate';

const MetaAdsToolAgenturen = () => {
  const sections = [
    {
      id: 'problems',
      heading: 'Deine aktuellen Probleme als Agentur',
      description: 'Viel Zeit für Strategiedokumente, Copy und Briefings – wenig Zeit für Skalierung.',
      content: (
        <ul className="space-y-2 text-sm md:text-base text-[#2c2c2c] max-w-3xl mx-auto">
          {[
            'Strategie-Docs dauern, jede Branche braucht andere Templates.',
            'Creative-Briefs und Copy-Blöcke kosten Kapazität.',
            'Wenig Zeit für Testing und Skalierung, weil Abstimmungen bremsen.'
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
      id: 'how-it-works',
      heading: 'Wie AdRuby für Agenturen funktioniert',
      description: 'Strategien je Kunde speichern, Templates für Branchen nutzen, mehr Tests fahren.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Strategien je Kunde speichern',
              desc: 'Funnel-Logik, Budget-Splits und Testing-Pläne pro Mandant ablegen.'
            },
            {
              title: 'Branchen-Templates',
              desc: 'Vorlagen für E-Com, SaaS, Local – schnell anpassbar auf neue Kunden.'
            },
            {
              title: 'Mehr Tests pro Woche',
              desc: 'Hooks, Copy, Creatives in Minuten – weniger Wartezeit, mehr Varianten.'
            },
            {
              title: 'Saubere Kommunikation',
              desc: 'Strategie-Overlay als klare Story für Kunden-Calls und Freigaben.'
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
      id: 'benefits',
      heading: 'Nutzen für dich und deine Kunden',
      description: 'Bessere Ergebnisse, klarere Kommunikation, weniger manuelle Last.',
      content: (
        <ul className="space-y-3 text-sm md:text-base text-[#2c2c2c] max-w-3xl mx-auto">
          {[
            'Bessere Ergebnisse durch schnellere Tests und klaren Funnel-Fit.',
            'Transparente Strategie-Overlays für Kunden-Updates.',
            'Mehr Mandanten betreuen, ohne mehr Hiring.'
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
      heading: 'FAQ für Agenturen',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              q: 'Kann ich mehrere Kunden-Workspaces anlegen?',
              a: 'Ja, du kannst pro Kunde Strategien, Hooks, Copy und Setups speichern.'
            },
            {
              q: 'Wie hilft AdRuby im Onboarding?',
              a: 'Fragebogen-Flow sammelt Ziele, Budgets, Audiences und generiert ein erstes Setup.'
            },
            {
              q: 'Kann ich Strategien exportieren?',
              a: 'Ja, du kannst Setups und Strategien exportieren und im Meta Ads Manager umsetzen.'
            },
            {
              q: 'Wie integriere ich AdRuby in bestehende Prozesse?',
              a: 'Nutze AdRuby als Strategie- und Creative-Briefing-Layer, Umsetzung bleibt in deinem Workflow.'
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
      eyebrow="Meta Ads für Agenturen"
      title="Meta Ads Tool für Performance-Agenturen"
      subtitle="AdRuby hilft dir, mehr Kunden mit weniger manuellem Aufwand zu betreuen – mit KI-gestützten Strategien, Ad Copy und Meta Setups."
      primaryCtaLabel="AdRuby kostenlos testen"
      primaryCtaHref="/ad-ruby-registration"
      secondaryCtaLabel="Strategie-Beispiel ansehen"
      secondaryCtaHref="/ad-ruby-registration"
      breadcrumb={[
        { label: 'Startseite', href: '/' },
        { label: 'Meta Ads Tool für Agenturen' }
      ]}
      sections={sections}
    />
  );
};

export default MetaAdsToolAgenturen;
