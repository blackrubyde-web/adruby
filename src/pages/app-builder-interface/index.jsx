import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import AdBuilderStepper from "../../components/AdBuilderStepper";
import ProductInputStage from "../../components/stages/ProductInputStage";
import MarketAnalysisStage from "../../components/stages/MarketAnalysisStage";
import AdGenerationStage from "../../components/stages/AdGenerationStage";

const HighConversionAdBuilder = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#050509] dark:text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <AdBuilderStepper currentStep={currentStep} onStepChange={setCurrentStep} />

        <AnimatePresence mode="wait" initial={false}>
          {currentStep === 0 && <ProductInputStage key="stage0" />}
          {currentStep === 1 && <MarketAnalysisStage key="stage1" />}
          {currentStep === 2 && <AdGenerationStage key="stage2" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HighConversionAdBuilder;
