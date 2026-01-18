import { CampaignBuilderProvider, useCampaignBuilder } from './campaign-builder/CampaignBuilderContext';
import { CampaignWizardShell } from './campaign-builder/CampaignWizardShell';
import { Step1_Setup, Step2_Creative, Step3_Targeting, Step4_Strategy, Step5_Review } from './campaign-builder/steps';

/**
 * Campaign Builder 2026 - Meta Ads Campaign Wizard
 * 
 * 5-Step Flow:
 * 1. Setup - Campaign name, objective, budget, bid strategy
 * 2. Creatives - Select ads from Creative Library
 * 3. Targeting - Locations, demographics, interests, audiences
 * 4. Strategy - Strategy blueprints, ROAS target, risk/scale settings
 * 5. Review - Preview and publish to Meta
 */

function CampaignBuilderContent() {
  const { currentStep } = useCampaignBuilder();

  return (
    <CampaignWizardShell>
      {currentStep === 1 && <Step1_Setup />}
      {currentStep === 2 && <Step2_Creative />}
      {currentStep === 3 && <Step3_Targeting />}
      {currentStep === 4 && <Step4_Strategy />}
      {currentStep === 5 && <Step5_Review />}
    </CampaignWizardShell>
  );
}

export function CampaignBuilderPage() {
  return (
    <CampaignBuilderProvider>
      <CampaignBuilderContent />
    </CampaignBuilderProvider>
  );
}

export default CampaignBuilderPage;
