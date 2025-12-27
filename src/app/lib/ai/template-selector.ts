import { AD_TEMPLATES } from '../../components/studio/presets';
import type { StrategicProfile } from './strategic-analyzer';

/**
 * STAGE 2: TEMPLATE SELECTOR
 * Intelligently picks best template from 12 Meta templates
 */

export function selectTemplate(profile: StrategicProfile, tone: string): any {
    console.log('🎨 Stage 2: Template Selection...');

    // Get recommended template
    const templateId = profile.recommendedTemplate;

    // Map to actual template IDs from presets.ts
    const templateMap: Record<string, string> = {
        'ugc_testimonial': 'meta_ugc_testimonial_v1',
        'hook_pas': 'meta_hook_pas_v1',
        'ugly_postit': 'meta_ugly_postit_v1',
        'before_after': 'meta_before_after_v1',
        'social_proof_max': 'meta_social_proof_v1',
        'feature_spotlight': 'meta_feature_grid_v1',
        'fomo_scarcity': 'meta_fomo_scarcity_v1',
        'question_hook': 'meta_question_hook_v1',
        'benefit_stack': 'meta_benefit_stack_v1',
        'influencer_ugc': 'meta_influencer_ugc_v1',
        'pain_point': 'meta_pain_point_v1',
        'bold_statement': 'meta_bold_statement_v1'
    };

    const actualTemplateId = templateMap[templateId] || 'meta_hook_pas_v1';

    // Find template in AD_TEMPLATES array
    const template = AD_TEMPLATES.find(t => t.id === actualTemplateId);

    if (!template) {
        console.warn(`Template ${actualTemplateId} not found, using hook_pas`);
        return AD_TEMPLATES.find(t => t.id === 'meta_hook_pas_v1');
    }

    console.log('✅ Selected template:', template.name);
    return template;
}
