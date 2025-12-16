import React from 'react';
import SeoLandingTemplate from '../../components/seo/SeoLandingTemplate';

const MetaAdsToolCoaches = () => {
  const sections = [
    {
      id: 'problems',
      heading: 'Typische Probleme von Coaches mit Meta Ads',
      description: 'Hooks unklar, Angebote schwanken, Funnel inkonsistent.',
      content: (
        <ul className="space-y-2 text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
          {[
            'Unklar, welche Hooks und Angebote funktionieren.',
            'Lead-Kosten schwanken, Funnel bricht nach dem Opt-in ab.',
            'Keine Struktur, wann du welche Kampagnen fährst (Lead-Magnet, Webinar, Call).'
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    },
    {
      id: 'support',
      heading: 'Wie AdRuby deine Funnel-Strategie unterstützt',
      description: 'Geführter Fragen-Flow, der dir klare Funnel- und Kampagnen-Strukturen liefert.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Hook & Offer Klarheit',
              desc: 'Hook- und Copy-Varianten passend zu deinem Angebot und Zielgruppe.'
            },
            {
              title: 'Funnel-Plan',
              desc: 'Sequenzen für Kalte, Warm und Hot Audiences – abgestimmt auf dein Budget.'
            },
            {
              title: 'Testing-Pläne',
              desc: 'Geplante Creative- und Copy-Tests mit klaren KPIs (ROAS/CPA).'
            },
            {
              title: 'Setup-Empfehlungen',
              desc: 'Exportierbare Kampagnen-, AdSet- und Ad-Strukturen für Meta Ads.'
            }
          ].map((card) => (
            <div key={card.title} className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'examples',
      heading: 'Beispiele für Kampagnen',
      description: 'Lead-Magnet, Webinar, Direct-to-Call – AdRuby liefert die passenden Bausteine.',
      content: (
        <ul className="space-y-3 text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
          {[
            'Lead-Magnet: Hooks, Copy und Retargeting-Sequenzen für den ersten Opt-in.',
            'Webinar: Warm-Up-Ads, Reminder, Post-Webinar-Conversion-Ads.',
            'Direct-to-Call: Qualifizierte Leads mit Proof-basierten Hooks und Zielgruppen.'
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    },
    {
      id: 'faq',
      heading: 'FAQ für Coaches',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              q: 'Brauche ich Marketing-Erfahrung?',
              a: 'Ein Basisverständnis hilft. AdRuby führt dich mit Fragen zu einem klaren Setup.'
            },
            {
              q: 'Welche Angebote funktionieren am besten?',
              a: 'AdRuby liefert Hooks und Copy für Lead-Magnet, Webinar oder Direct Call – angepasst an dein Ziel.'
            },
            {
              q: 'Wie lange dauert es, bis ich starten kann?',
              a: 'In Minuten hast du Strategie, Copy und Setup-Vorschläge – danach setzt du direkt in Meta um.'
            },
            {
              q: 'Kann ich auch High-Ticket-Angebote bewerben?',
              a: 'Ja, AdRuby bietet Storytelling-Hooks und Sequenzen für High-Ticket Funnels.'
            }
          ].map((faq) => (
            <div key={faq.q} className="p-5 md:p-6 rounded-xl border border-border bg-white shadow-sm space-y-2">
              <h3 className="font-semibold text-foreground">{faq.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <SeoLandingTemplate
      eyebrow="Meta Ads für Coaches & Kurse"
      title="Meta Ads Tool für Coaches & Online-Kurse"
      subtitle="AdRuby bringt Struktur in deine Meta Ads, damit du nicht mehr rätst, welche Hooks, Angebote und Funnels funktionieren."
      primaryCtaLabel="AdRuby kostenlos testen"
      primaryCtaHref="/ad-ruby-registration"
      secondaryCtaLabel="Strategie-Beispiel ansehen"
      secondaryCtaHref="/ad-ruby-registration"
      breadcrumb={[
        { label: 'Startseite', href: '/' },
        { label: 'Meta Ads Tool für Coaches' }
      ]}
      sections={sections}
    />
  );
};

export default MetaAdsToolCoaches;
