import React, { useState } from 'react';
import { UI } from '../../../components/ui/uiPrimitives';
import AdVariantCard from '../components/AdVariantCard';
import MetaAdPreview from '../components/MetaAdPreview';
import ResultsToolbar from '../components/ResultsToolbar';

const StepResults = ({ ads }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [variants, setVariants] = useState(ads || []);
  const active = variants?.[activeIndex] || {};

  const handleCopy = (ad) => {
    const text = `${ad.headline || ''}\n${ad.primaryText || ''}\nCTA: ${ad.cta || ''}`;
    navigator?.clipboard?.writeText?.(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <p className={UI.meta}>Varianten</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {variants.map((ad, idx) => (
            <AdVariantCard
              key={idx}
              ad={ad}
              index={idx}
              active={activeIndex === idx}
              onSelect={() => setActiveIndex(idx)}
              onDuplicate={() => setVariants((prev) => [...prev, { ...ad, headline: `${ad.headline || 'Headline'} (Copy)` }])}
              onCopy={() => handleCopy(ad)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <MetaAdPreview ad={active} />
        <ResultsToolbar
          onCopy={() => handleCopy(active)}
          onSave={() => {}}
          onShare={() => {}}
          onExport={() => {}}
        />
      </div>
    </div>
  );
};

export default StepResults;
