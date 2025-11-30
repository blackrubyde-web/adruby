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
    <div className="relative h-12 w-full overflow-hidden rounded-xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-white/10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/40 via-white/10 to-white/5 dark:from-white/10 dark:via-white/5" />
      <div className="relative flex h-full items-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <motion.button
              key={step.label}
              type="button"
              onClick={() => onStepChange(index)}
              className="group relative flex h-full flex-1 items-center gap-2 px-3 text-left sm:px-4"
              initial={{ opacity: 0.85 }}
              animate={{ opacity: isActive ? 1 : 0.85 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex h-8 w-8 items-center justify-center rounded-2xl border transition ${
                  isActive
                    ? "border-[#C80000]/70 bg-[#C80000]/10 text-[#C80000]"
                    : "border-white/30 bg-white/60 text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                }`}
              >
                <Icon />
              </motion.div>
              <div className="flex flex-col leading-tight">
                <span
                  className={`text-[13px] font-semibold transition ${
                    isActive
                      ? "text-[#C80000]"
                      : "text-zinc-700 dark:text-zinc-200"
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[11px] text-zinc-500 transition dark:text-zinc-400">
                  {step.description}
                </span>
              </div>
              {isCompleted && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#C80000] shadow-[0_0_0_4px_rgba(200,0,0,0.12)]" />
              )}
            </motion.button>
          );
        })}

        <div className="pointer-events-none absolute inset-x-2 bottom-1 h-[3px] rounded-full bg-white/40 dark:bg-white/10">
          <motion.div
            className="absolute inset-y-0 rounded-full bg-gradient-to-r from-[#C80000] via-red-500 to-orange-400 shadow-[0_6px_18px_rgba(200,0,0,0.28)]"
            style={{ width: stepWidth }}
            animate={{ left: indicatorLeft }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdBuilderStepper;
