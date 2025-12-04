import React from "react";

const MadgicxAlternative = () => {
  return (
    <main className="min-h-screen bg-black text-slate-50">
      <section className="px-4 py-16 md:px-8 lg:px-16 max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400/80 mb-3">
          Meta Ads Tool
        </p>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
          Madgicx Alternative für klare, fokussierte Meta Ads Strategien
        </h1>
        <p className="text-base md:text-lg text-slate-200/90 max-w-2xl">
          Madgicx ist mächtig – aber oft komplex und überladen. AdRuby
          konzentriert sich auf das, was deine Meta Ads wirklich skalierbar
          macht: Strategie, Creatives, Setup und Testing – ohne Feature-Overkill.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/40 hover:from-rose-500 hover:to-red-400 transition">
            AdRuby kostenlos testen
          </button>
          <button className="inline-flex items-center justify-center rounded-full border border-slate-600/80 px-5 py-2.5 text-sm font-medium text-slate-100 hover:border-slate-300/90 hover:text-white transition">
            Strategie-Beispiel ansehen
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          7 Tage kostenlos testen · Monatlich kündbar · Keine versteckten
          Gebühren
        </p>
      </section>

      <section className="px-4 pb-12 md:px-8 lg:px-16 max-w-5xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold">
              Madgicx ist stark – aber oft zu viel des Guten
            </h2>
            <p className="text-sm text-slate-200/90">
              Viele Performance-Marketer lieben Madgicx für seine Tiefe – aber
              genau das führt oft zu Problemen im Alltag.
            </p>
            <div className="space-y-3 text-sm text-slate-200/90">
              <div className="rounded-xl border border-slate-700/80 bg-slate-900/40 p-3">
                <p className="font-medium mb-1">Komplexes Interface</p>
                <p className="text-xs text-slate-300/90">
                  Unzählige Einstellungen, Dashboards und Optionen. Gut für
                  Power-User, aber schwer im Team zu standardisieren.
                </p>
              </div>
              <div className="rounded-xl border border-slate-700/80 bg-slate-900/40 p-3">
                <p className="font-medium mb-1">Steile Lernkurve</p>
                <p className="text-xs text-slate-300/90">
                  Neue Teammitglieder brauchen lange, bis sie wirklich sicher mit
                  dem Tool arbeiten können.
                </p>
              </div>
              <div className="rounded-xl border border-slate-700/80 bg-slate-900/40 p-3">
                <p className="font-medium mb-1">Feature-Overkill</p>
                <p className="text-xs text-slate-300/90">
                  Viele Funktionen bleiben ungenutzt – du zahlst für Komplexität,
                  die du im Alltag nicht brauchst.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold">
              AdRuby: Fokus statt Overkill
            </h2>
            <p className="text-sm text-slate-200/90">
              AdRuby ist dein fokussiertes Meta Ads OS: Klarer Aufbau, konkrete
              Strategien, umsetzbare Empfehlungen – alles auf Meta Ads
              zugeschnitten.
            </p>
            <div className="overflow-hidden rounded-2xl border border-rose-600/40 bg-gradient-to-br from-rose-950/80 via-slate-950 to-black p-4 text-xs text-slate-50 shadow-lg shadow-rose-900/40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-[0.15em] text-rose-300/80">
                  Vergleich
                </span>
                <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] text-slate-100">
                  Madgicx vs. AdRuby
                </span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    label: "Komplexität",
                    left: "Sehr hoch, viele Module",
                    right: "Fokussiert auf Meta Ads Strategie"
                  },
                  {
                    label: "Fokus",
                    left: "Multi-Channel & Deep-Features",
                    right: "Meta Ads Strategien, Creatives & Setups"
                  },
                  {
                    label: "Einstieg",
                    left: "Erfordert Einarbeitung & Schulung",
                    right: "Schnell startklar, klare Schritte"
                  },
                  {
                    label: "Team-Nutzung",
                    left: "Gut für Power-Nutzer",
                    right: "Ideal für kleine Teams & Inhaber:innen"
                  }
                ].map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-3 gap-2 items-start"
                  >
                    <div className="text-[11px] text-slate-300/90">
                      {row.label}
                    </div>
                    <div className="text-[11px] text-slate-400/90">
                      {row.left}
                    </div>
                    <div className="text-[11px] text-slate-100 font-medium">
                      {row.right}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 lg:px-16 max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          Core Features von AdRuby für Ex-Madgicx-Nutzer:innen
        </h2>
        <p className="text-sm text-slate-200/90 mb-4">
          Wenn du Madgicx bereits genutzt hast, kennst du die Power – aber
          wahrscheinlich auch die Komplexität. AdRuby nimmt den Druck raus.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-4">
            <p className="font-medium mb-1 text-sm">
              KI-gestützter Strategie-Generator
            </p>
            <p className="text-xs text-slate-300/90">
              Auf Basis deiner Ziele, Budgets und Zielgruppen erzeugt AdRuby
              vollständige Meta Ads Strategien, die du direkt umsetzen kannst.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-4">
            <p className="font-medium mb-1 text-sm">
              Ad Copy, Hooks & Creative-Ideen
            </p>
            <p className="text-xs text-slate-300/90">
              Du bekommst Headline-Varianten, Hooks und Copy-Ideen, die direkt
              auf deine Zielgruppe und dein Angebot zugeschnitten sind.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-4">
            <p className="font-medium mb-1 text-sm">
              Meta Setup Empfehlungen
            </p>
            <p className="text-xs text-slate-300/90">
              Strukturvorschläge für Kampagnen, Anzeigengruppen und Ads – inklusive
              Testing-Struktur und Skalierungsplan.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-4">
            <p className="font-medium mb-1 text-sm">
              Strategien pro Kampagne speichern
            </p>
            <p className="text-xs text-slate-300/90">
              Jede Strategie lässt sich deinem Ad-Setup zuordnen, damit du später
              genau siehst, welche Strategie zu welcher Performance geführt hat.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 lg:px-16 max-w-5xl mx-auto border-t border-slate-800/80">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          FAQ zur Madgicx Alternative
        </h2>
        <div className="space-y-4 text-sm text-slate-200/90">
          <div>
            <p className="font-medium">
              Kann AdRuby Madgicx komplett ersetzen?
            </p>
            <p className="text-xs text-slate-300/90 mt-1">
              Wenn dein Fokus hauptsächlich auf Meta Ads liegt, ja. AdRuby deckt
              Strategie, Creatives und Setups ab – ohne Multi-Channel-Overkill.
            </p>
          </div>
          <div>
            <p className="font-medium">
              Brauche ich viel Vorerfahrung, um AdRuby zu nutzen?
            </p>
            <p className="text-xs text-slate-300/90 mt-1">
              Nein. AdRuby führt dich Schritt für Schritt durch Fragen zu Ziel,
              Budget und Funnel – und erzeugt darauf basierend Strategien, die du
              direkt umsetzen kannst.
            </p>
          </div>
          <div>
            <p className="font-medium">
              Kann ich AdRuby parallel zu Madgicx verwenden?
            </p>
            <p className="text-xs text-slate-300/90 mt-1">
              Ja. Viele nutzen AdRuby als Strategie- und Creative-Engine und
              setzen das Setup anschließend in ihrem gewohnten Tool um.
            </p>
          </div>
          <div>
            <p className="font-medium">
              Für welche Budgets lohnt sich AdRuby?
            </p>
            <p className="text-xs text-slate-300/90 mt-1">
              Typischerweise ab ca. 30–50 € Tagesbudget aufwärts – überall dort,
              wo Testing und Skalierung einen echten Unterschied machen.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-8 lg:px-16 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-rose-600/40 bg-gradient-to-r from-rose-900/70 via-black to-black px-6 py-8 md:px-8 md:py-10 text-center shadow-lg shadow-rose-900/40">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            Madgicx ist dir zu komplex? Probier AdRuby.
          </h2>
          <p className="text-sm text-slate-200/90 mb-6 max-w-2xl mx-auto">
            Reduziere Komplexität, gewinne Klarheit in deinen Meta Ads Strategien
            und teste mehr, ohne dein Team zu überfordern.
          </p>
          <button className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-red-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/40 hover:from-rose-500 hover:to-red-400 transition">
            AdRuby jetzt 7 Tage kostenlos testen
          </button>
        </div>
      </section>
    </main>
  );
};

export default MadgicxAlternative;
