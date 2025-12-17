import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { UI } from '../../../components/ui/uiPrimitives';
import HintCallout from '../components/HintCallout';

const StepBriefing = ({
  searchUrl,
  setSearchUrl,
  product,
  setProduct,
  goal,
  setGoal,
  market,
  setMarket,
  language,
  setLanguage,
  onUseSample,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      <div className={`${UI.card} bg-card/60 border border-border/60 rounded-2xl p-6 space-y-4`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Ads Library URL</label>
            <input
              className="w-full rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="https://facebook.com/ads/library/..."
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Benötigt für den Market Scan. Bitte eine gültige Ads-Library-URL eintragen.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Produkt</label>
            <input
              className="w-full rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="z.B. Fitness Tracker"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Ziel</label>
            <input
              className="w-full rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Leads, Sales, Trial..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {showAdvanced ? 'Advanced einklappen' : 'Advanced öffnen'}
          </button>
        </div>
        {showAdvanced && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Zielgruppe / Markt</label>
              <input
                className="w-full rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="DACH, E-Com, B2B SaaS..."
                value={market}
                onChange={(e) => setMarket(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Sprache</label>
              <select
                className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="de">Deutsch</option>
                <option value="en">Englisch</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className={`${UI.card} bg-card/60 border border-border/60 rounded-2xl p-6 space-y-3`}>
        <p className="text-xs font-medium text-muted-foreground">Schnell-Presets</p>
        <div className="flex flex-wrap gap-2">
          {['E-Com', 'SaaS', 'Local'].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setGoal(preset === 'E-Com' ? 'Sales' : preset === 'SaaS' ? 'Trials' : 'Leads');
                setMarket(preset === 'Local' ? 'Regionale Dienstleistung' : preset);
              }}
              className="px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground text-xs hover:bg-accent/40"
            >
              {preset}
            </button>
          ))}
          <button
            onClick={() => {
              setGoal('Awareness');
              setMarket('Global');
              setLanguage('en');
            }}
            className="px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground text-xs hover:bg-accent/40"
          >
            Global Brand
          </button>
          <Button variant="secondary" size="sm" onClick={onUseSample} className="text-xs">
            Sample Ergebnisse
          </Button>
        </div>
      </div>

      <div>
        <HintCallout text="Je klarer das Produktversprechen, desto besser die Hook-Qualität." />
      </div>
    </div>
  );
};

export default StepBriefing;
