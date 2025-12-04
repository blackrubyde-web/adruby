import React from "react";

const AdCreativeAiAlternative = () => {
  return (
    <main className="min-h-screen bg-black text-slate-50">
      <section className="px-4 py-16 md:px-8 lg:px-16 max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/80 mb-3">
          Ad Creative Tool
        </p>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
          AdCreative.ai Alternative für klare, steuerbare Meta Ads Creatives
        </h1>
        <p className="text-base md:text-lg text-slate-200/90 max-w-2xl">
          AdCreative.ai kann viele Varianten generieren – aber oft fehlt der
          strategische Kontext. AdRuby verbindet Strategie, Funnel-Logik und
          Creatives zu einem System, das du wirklich skalieren kannst.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:from-emerald-400 hover:to-cyan-300 transition">
            AdRuby kostenlos testen
          </button>
          <button className="inline-flex items-center justify-center rounded-full border border-slate-600/80 px-5 py-2.5 text-sm font-medium text-slate-100 hover:border-slate-300/90 hover:text-white transition">
            Beispiel-Ad & Strategie ansehen
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
              Wo AdCreative.ai stark ist – und wo es oft hapert
            </h2>
            <p className="text-sm text-slate-200/90">
              Viele Marketer lieben AdCreative.ai für die Menge an Creatives.
              Doch Volumen allein skaliert keine Kampagnen.
            </p>
            <div className="space-y-3 text-sm text-slate-200/90">
              <div className="rounded-xl border border-slate-700/80 bg-slate-900/40 p-3">
                <p className="font-medium mb-1">Variante statt Strategie</p>
                <p className="text-xs text-slate-300/90">
                  Viele Varianten, aber oft ohne klares Ora, Funnel-Logik oder
                  saubere Testing-Strategie dahinter.
                </p>
              </div>
              <div className="rounded-xl border border-slate-700/80 bg-slate-900/40 p-3">
                <p className="font-medium mb-1">Generischer Output</p>
                <p className="text-xs text-slate-300/90">
                  Creatives wirken häufig generisch – ohne tiefes Verständnis
                  für dein Angebot, deine Positionierung und deinen Funnel.
                </p>
              </div>
              <div className="rounded-xl border border-slate-700/80 bg-slate-900/40 p-3">
                <p className="font-medium mb-1">
                  Kein echter Link zu deinen Kampagnen
                </p>
                <p className="text-xs text-slate-300/90">
                  Oft fehlen klare Empfehlungen, wie Creatives konkret im
                  Meta Ads Setup eingesetzt werden sollen.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold">
              AdRuby: Strategie + Creatives + Setup
            </h2>
            <p className="text-sm text-slate-200/90">
              AdRuby denkt Creatives nicht isoliert, sondern als Teil einer
              vollständigen Meta Ads Strategie – inklusive Setup und
              Skalierung.
            </p>
            <div className="overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/80 via-slate-950 to-black p-4 text-xs text-slate-50 shadow-lg shadow-emerald-900/40">
              <div className="flex items.center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-[0.15em] text-emerald-300/80">
                  Vergleich
                </span>
                <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] text-slate-100">
                  AdCreative.ai vs. AdRuby
                </span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    label: "Output",
                    left: "Viele Varianten pro Motiv",
                    right: "Strategisch geführte Creatives je Funnelphase"
                  },
                  {
                    label: "Kontext",
                    left: "Creatives ohne Setup-Kontext",
                    right: "Verknüpfung mit Strategie + Kampagnenstruktur"
                  },
                  {
                    label: "Testing",
                    left: "Einfach viel testen",
                    right: "Strukturiertes Testing-Framework"
                  },
                  {
                    label: "Verwendung",
                    left: "Export & manuelles Zuordnen",
                    right: "Direkte Zuordnung zu deinen Ad-Strategien"
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
          Wie AdRuby dir bei Creatives wirklich hilft
        </h2>
        <p className="text-sm text-slate-200/90 mb-4">
          Statt dir einfach nur Varianten auszugeben, hilft AdRuby dir dabei,
          Creatives als System zu verstehen und gezielt zu testen.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-4">
            <p className="font-medium mb-1 text-sm">
              Klarer Creative-Briefing-Input
            </p>
            <p className="text-xs text-slate-300/90">
              Du definierst Produkt, Ziel, Zielgruppe und Funnel-Phase – AdRuby
              baut darauf auf und respektiert deinen Kontext.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-4">
            <p className="font-medium mb-1 text-sm">
              Hooks, Angles & Ad Copy
            </p>
            <p className="text-xs text-slate-300/90">
              Strategisch aufgebaute Hooks, Angles und Copy-Lines, die auf
              deinen Funnel und deine Positionierung einzahlen.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-4">
            <p className="font-medium mb-1 text-sm">
              Vorschläge für Visuals & UGC
            </p>
            <p className="text-xs text-slate-300/90">
              Konkrete Ideen, welche Art von Bild- oder Video-Material du
              testen solltest (Produkt-Shots, UGC, Before/After etc.).
            </p>
          </div>
          <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-4">
            <p className="font-medium mb-1 text-sm">
              Creative-Testing-Plan
            </p>
            <p className="text-xs text-slate-300/90">
              Vorschläge, wie viele Variationen du pro Anzeigengruppe fährst,
              in welcher Reihenfolge und mit welchen KPIs du bewertest.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 lg:px-16 max-w-5xl mx.auto border-t border-slate-800/80">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          Beispiel: Eine Ad aus AdRuby im Vergleich
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 text-xs">
            <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400 mb-2">
              Typische generische Ad
            </p>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-slate-800/80" />
              <p className="font-semibold text-slate-100">
                "Mehr Umsatz mit deinen Ads!"
              </p>
              <p className="text-slate-300/90">
                "Starte jetzt mit unserem Tool und verbessere deine Performance."
              </p>
              <button className="mt-2 inline-flex items-center rounded-full border border-slate-600/80 px-4 py-1.5 text-[11px] text-slate-100">
                Mehr erfahren
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/90 p-4 text-xs shadow-lg shadow-emerald-900/40">
            <p className="text-[11px] uppercase tracking-[0.15em] text-emerald-300 mb-2">
              Strategie-geführte Ad aus AdRuby
            </p>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-gradient-to-br from-emerald-500/30 via-cyan-500/20 to-slate-900" />
              <p className="font-semibold text-slate-50">
                "Du boostest dein Ad-Spend, aber nicht deinen ROAS?"
              </p>
              <p className="text-slate-200/90">
                AdRuby baut dir komplette Meta Ads Strategien – inklusive
                Hook-Ideen, Creatives und Skalierungsplan. Weniger Raten,
                mehr System.
              </p>
              <button className="mt-2 inline-flex items-center rounded-full bg-emerald-400 px-4 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-300 transition">
                AdRuby testen
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 lg:px-16 max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          FAQ zur AdCreative.ai Alternative
        </h2>
        <div className="space-y-4 text-sm text-slate-200/90">
          <div>
            <p className="font-medium">
              Ersetzt AdRuby AdCreative.ai komplett?
            </p>
            <p className="text-xs text-slate-300/90 mt-1">
              Wenn du Creatives im Kontext deiner Meta Ads Strategie sehen
              willst, ja. AdRuby liefert dir Strategie + Creative-Ideen +
              Setup-Empfehlungen. Du kannst aber auch beides parallel nutzen.
            </p>
          </div>
          <div>
            <p className="font-medium">
              Wie viel Zeit spare ich mit AdRuby wirklich?
            </p>
            <p className="text-xs text-slate-300/90 mt-1">
              Kunden berichten, dass sie statt Stunden nur noch Minuten
              brauchen, um von Creative-Briefing zu testbaren Ads zu kommen –
              inklusive Strategie-Backbone.
            </p>
          </div>
          <div>
            <p className="font-medium">
              Funktioniert AdRuby nur für E-Commerce?
            </p>
            <p className="text-xs text-slate-300/90 mt-1">
              Nein. AdRuby ist auf Meta Ads spezialisiert, nicht auf eine
              einzelne Branche. E-Com, Info-Produkte, Coaches, SaaS – wichtig
              ist, dass du ernsthaft testen und skalieren willst.
            </p>
          </div>
          <div>
            <p className="font-medium">
              Was ist, wenn ich noch wenig Creatives habe?
            </p>
            <p className="text-xs text-slate-300/90 mt-1">
              Gerade dann hilft AdRuby: Du bekommst klare Vorschläge, welche
              Creatives du zuerst bauen solltest und welche Hooks und Angles
              du priorisieren kannst.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-8 lg:px-16 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-900/70 via-black to-black px-6 py-8 md:px-8 md:py-10 text-center shadow-lg shadow-emerald-900/40">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            Creatives mit System statt Zufall
          </h2>
          <p className="text-sm text-slate-200/90 mb-6 max-w-2xl mx-auto">
            Wenn du genug von generischem Creative-Output hast, der nicht zur
            Strategie passt, ist AdRuby dein nächster Schritt: KI-gestützte
            Strategien, Creatives und Setups aus einem Guss.
          </p>
          <button className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:from-emerald-400 hover:to-cyan-300 transition">
            AdRuby jetzt 7 Tage kostenlos testen
          </button>
        </div>
      </section>
    </main>
  );
};

export default AdCreativeAiAlternative;
