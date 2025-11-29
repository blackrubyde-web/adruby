import React from "react";
import { motion } from "framer-motion";

const ProductIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
  >
    <path
      d="M5 8.5 12 4l7 4.5M5 8.5v7L12 20l7-4.5v-7M5 8.5 12 13l7-4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AnalysisIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
  >
    <path
      d="M5 15.5 9 11l3 2 4-6 3 3.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="5" cy="15.5" r="1.2" fill="currentColor" />
    <circle cx="9" cy="11" r="1.2" fill="currentColor" />
    <circle cx="12" cy="13" r="1.2" fill="currentColor" />
    <circle cx="16" cy="7" r="1.2" fill="currentColor" />
    <circle cx="19" cy="10.5" r="1.2" fill="currentColor" />
  </svg>
);

const MegaphoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
  >
    <path
      d="M5 11v3.5a2.5 2.5 0 0 0 3.3 2.36l.7-.23"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M12 6.5 6 9v5l6 2.5 6.5 2V4.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 8.5c1 .5 1.5 1.4 1.5 2.5s-.5 2-1.5 2.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const steps = [
  { label: "Produkteingabe", description: "Produktdetails definieren", icon: ProductIcon },
  { label: "Marktanalyse", description: "Zielgruppe & Insights", icon: AnalysisIcon },
  { label: "Ad-Generierung", description: "Kampagnen erstellen", icon: MegaphoneIcon },
];

const AdBuilderStepper = ({ currentStep = 0, onStepChange = () => {} }) => {
  const stepWidth = `${100 / steps.length}%`;
  const indicatorLeft = `${(100 / steps.length) * currentStep}%`;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/30 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl transition dark:border-white/10 dark:bg-white/5">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-blue-500/5 dark:from-red-500/10 dark:to-blue-500/10" />
      <div className="relative flex items-stretch justify-between divide-x divide-zinc-200/50 dark:divide-white/5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <motion.button
              key={step.label}
              type="button"
              onClick={() => onStepChange(index)}
              className="group relative flex flex-1 flex-col items-start gap-2 px-4 py-5 text-left sm:px-6"
              initial={{ opacity: 0.85, scale: 0.98 }}
              animate={{
                opacity: isActive ? 1 : 0.85,
                scale: isActive ? 1.01 : 0.98,
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <motion.div
                whileHover={{ scale: 1.07, rotate: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                  isActive
                    ? "border-red-500/60 bg-gradient-to-br from-red-500/20 via-white/40 to-red-300/20 text-red-600 shadow-[0_12px_40px_rgba(200,0,0,0.25)] dark:via-white/10"
                    : "border-zinc-200/70 bg-white/60 text-zinc-500 shadow-[0_10px_35px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                }`}
              >
                <Icon />
              </motion.div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-semibold tracking-tight transition ${
                    isActive
                      ? "text-red-700 dark:text-red-400"
                      : "text-zinc-700 dark:text-zinc-200"
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-xs text-zinc-500 transition dark:text-zinc-400">
                  {step.description}
                </span>
              </div>
              {isCompleted && (
                <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_0_6px_rgba(200,0,0,0.15)]" />
              )}
            </motion.button>
          );
        })}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/15 to-blue-500/10 opacity-80" />
          <motion.div
            className="absolute h-full rounded-full bg-gradient-to-r from-red-500 via-red-400 to-orange-400 shadow-[0_10px_30px_rgba(200,0,0,0.35)]"
            style={{ width: stepWidth }}
            animate={{ left: indicatorLeft }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdBuilderStepper;
