import React from 'react';
import { UI } from '../../../components/ui/uiPrimitives';
import { Sparkles } from 'lucide-react';
import HintCallout from '../components/HintCallout';

const tones = [
  { key: 'balanced', label: 'Balanced' },
  { key: 'ugc', label: 'UGC' },
  { key: 'direct', label: 'Direct Response' },
];

const StepCreativeDNA = ({ tone, onChangeTone }) => {
  return (
    <div className={`${UI.card} ${UI.cardHover} p-6 space-y-4`}>
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-foreground" />
        <div>
          <p className={UI.meta}>Creative DNA</p>
          <p className={UI.h2}>Ton & Stil</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {tones.map((t) => (
          <button
            key={t.key}
            onClick={() => onChangeTone(t.key)}
            className={`rounded-full px-3 py-1 text-sm border ${
              tone === t.key ? 'bg-accent text-foreground border-border' : 'bg-card text-muted-foreground border-border hover:bg-accent/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-2">
        <HintCallout text="UGC + Problem/Solution performt oft stabil bei kalten Audiences." />
      </div>
    </div>
  );
};

export default StepCreativeDNA;
