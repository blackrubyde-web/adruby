import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const steps = [
  { key: 'input', label: 'Produkteingabe' },
  { key: 'analysis', label: 'Marktanalyse' },
  { key: 'generation', label: 'Ad-Generierung' }
];

const indicatorTransition = { type: 'spring', stiffness: 300, damping: 30 };

const contentVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
    scale: 0.98
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 24 }
  },
  exit: (direction) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.15, ease: 'easeInOut' }
  })
};

const AdBuilderStepper = ({
  currentStepIndex = 0,
  maxUnlockedStep = 0,
  onStepChange = () => {},
  renderContent
}) => {
  const [direction, setDirection] = useState(0);
  const [prevIndex, setPrevIndex] = useState(currentStepIndex);

  useEffect(() => {
    if (currentStepIndex === prevIndex) return;
    setDirection(currentStepIndex > prevIndex ? 1 : -1);
    setPrevIndex(currentStepIndex);
  }, [currentStepIndex, prevIndex]);

  const activeStep = useMemo(() => steps[currentStepIndex] || steps[0], [currentStepIndex]);
  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < Math.min(maxUnlockedStep, steps.length - 1);

  const goToStep = (index) => {
    if (index < 0 || index >= steps.length) return;
    if (index > maxUnlockedStep) return;
    onStepChange(index, steps[index]);
  };

  const nextStep = () => {
    if (!canGoForward) return;
    goToStep(currentStepIndex + 1);
  };

  const prevStep = () => {
    if (!canGoBack) return;
    goToStep(currentStepIndex - 1);
  };

  return (
    <div className="w-full">
      {/* Step Header */}
      <div className="relative flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 dark:bg-[#0b0b10] dark:border-white/10">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isUnlocked = index <= maxUnlockedStep;
          return (
            <button
              key={step.key}
              onClick={() => goToStep(index)}
              disabled={!isUnlocked}
              className={`
                relative flex-1 min-w-0 text-center py-2 rounded-xl transition
                ${isActive ? 'text-[#C80000] font-semibold' : 'text-slate-600 dark:text-slate-400'}
                ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-white/5'}
              `}
            >
              <span className="text-sm sm:text-base truncate">{step.label}</span>
              {isActive && (
                <motion.div
                  layoutId="adbuilder-step-indicator"
                  className="absolute left-2 right-2 -bottom-1 h-1 rounded-full bg-[#C80000]"
                  transition={indicatorTransition}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="mt-4 relative">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={activeStep.key}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0f0f13]"
          >
            {renderContent ? renderContent(activeStep) : (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Aktueller Schritt: <strong>{activeStep.label}</strong>
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={prevStep}
          disabled={!canGoBack}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
        >
          Zurück
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          Schritt {currentStepIndex + 1} / {steps.length}
        </div>
        <button
          onClick={nextStep}
          disabled={!canGoForward}
          className="px-4 py-2 rounded-lg bg-[#C80000] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#a50000] transition"
        >
          Weiter
        </button>
      </div>
    </div>
  );
};

export default AdBuilderStepper;
