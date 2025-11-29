import React from 'react';

const steps = [
  { key: 'input', label: 'Produkteingabe' },
  { key: 'analysis', label: 'Marktanalyse' },
  { key: 'generation', label: 'Ad-Generierung' }
];

const AdBuilderStepper = ({
  currentStepIndex = 0,
  maxUnlockedStep = 2,
  onStepChange = () => {}
}) => {
  const goTo = (idx) => {
    if (idx < 0 || idx >= steps.length) return;
    if (idx > maxUnlockedStep) return;
    onStepChange(idx);
  };

  return (
    <div className="w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 rounded-2xl border border-slate-200 dark:border-white/10 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        {steps.map((step, idx) => {
          const active = idx === currentStepIndex;
          const locked = idx > maxUnlockedStep;
          return (
            <button
              key={step.key}
              onClick={() => goTo(idx)}
              disabled={locked}
              className={`flex-1 min-w-0 text-center py-2 rounded-xl text-sm font-semibold transition ${
                active
                  ? 'bg-[#C80000] text-white shadow'
                  : 'bg-white text-slate-600 dark:bg-zinc-900 dark:text-slate-300'
              } ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
            >
              {idx + 1}. {step.label}
            </button>
          );
        })}
      </div>
      <div className="rounded-xl bg-white text-slate-800 dark:bg-zinc-900 dark:text-slate-200 border border-slate-200 dark:border-white/10 px-4 py-3">
        <p className="text-sm font-medium">
          Aktueller Step: <span className="text-[#C80000]">{steps[currentStepIndex]?.label}</span>
        </p>
      </div>
    </div>
  );
};

export default AdBuilderStepper;
