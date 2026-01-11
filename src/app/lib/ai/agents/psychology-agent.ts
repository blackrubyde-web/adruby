import { getOpenAIService } from '../services/openai-service';

/**
 * PSYCHOLOGY AGENT
 * Psychographic profiling using OCEAN (Big 5) personality model
 * + Cialdini's persuasion principles + cognitive biases
 * 
 * Purpose: Deep audience understanding → Personalized messaging
 */

export interface PsychologyInput {
    productName: string;
    productDescription: string;
    productType?: string;
    targetAudience?: string;
    tone: string;
    brandPersonality?: string;
}

export interface OCEANProfile {
    openness: number; // 0-1: Creativity, novelty-seeking
    conscientiousness: number; // 0-1: Organization, reliability
    extraversion: number; // 0-1: Sociability, assertiveness
    agreeableness: number; // 0-1: Cooperation, empathy
    neuroticism: number; // 0-1: Emotional instability, anxiety
}

export interface PersuasionProfile {
    primaryPrinciple: CialdiniPrinciple;
    secondaryPrinciple: CialdiniPrinciple;
    effectiveness: Record<CialdiniPrinciple, number>; // 0-100
}

export type CialdiniPrinciple =
    | 'reciprocity' // Give → Get back
    | 'scarcity' // Limited availability
    | 'authority' // Expert credibility
    | 'consistency' // Align with commitments
    | 'liking' // Build rapport
    | 'social_proof'; // Others are doing it

export interface CognitiveBiasProfile {
    primaryBias: CognitiveBias;
    effectiveness: Record<CognitiveBias, number>; // 0-100
    applications: string[];
}

export type CognitiveBias =
    | 'anchoring' // First number sets perception
    | 'bandwagon' // Follow the crowd
    | 'loss_aversion' // Avoid losing > gain
    | 'endowment' // Value what you own
    | 'decoy' // Third option influences choice
    | 'framing' // Presentation matters
    | 'availability' // Recent/memorable = likely
    | 'confirmation' // Seek confirming evidence
    | 'sunk_cost' // Continue due to past investment
    | 'status_quo'; // Prefer no change

export interface EmotionalProfile {
    primaryEmotions: string[]; // Top 3-5
    emotionalArc: 'negative_positive' | 'curiosity_revelation' | 'fear_relief';
    triggers: string[];
    avoidances: string[];
}

export interface MessagingRecommendations {
    headlines: string[];
    toneAdjustments: string[];
    visualSuggestions: string[];
    ctaRecommendations: string[];
}

export interface PsychologyAgentResult {
    ocean: OCEANProfile;
    persuasion: PersuasionProfile;
    cognitiveBiases: CognitiveBiasProfile;
    emotional: EmotionalProfile;
    recommendations: MessagingRecommendations;
    confidence: number; // 0-1
}

/**
 * Analyze audience psychology and generate targeting insights
 */
export async function analyzePsychology(
    input: PsychologyInput
): Promise<PsychologyAgentResult> {
    const openai = getOpenAIService();

    // Build comprehensive psychology analysis prompt
    const prompt = buildPsychologyPrompt(input);

    try {
        const result = await openai.generateAdCopy({
            productName: input.productName,
            productDescription: prompt,
            tone: 'professional',
            goal: 'analysis',
            language: 'English',
            format: 'json',
            temperature: 0.4 // Balanced: not too creative, but thoughtful
        });

        // Parse AI response
        const analysis = parsePsychologyResponse(result.content.description);

        return {
            ...analysis,
            confidence: 0.82
        };

    } catch (error) {
        console.warn('Psychology analysis failed, using heuristics:', error);
        return generateHeuristicProfile(input);
    }
}

/**
 * Build detailed psychology analysis prompt
 */
function buildPsychologyPrompt(input: PsychologyInput): string {
    return `You are a consumer psychology PhD and marketing strategist. Analyze this audience deeply.

PRODUCT: ${input.productName}
DESCRIPTION: ${input.productDescription}
TYPE: ${input.productType || 'General'}
AUDIENCE: ${input.targetAudience || 'General consumers'}
TONE: ${input.tone}
${input.brandPersonality ? `BRAND PERSONALITY: ${input.brandPersonality}` : ''}

Provide COMPREHENSIVE psychographic analysis:

1. **OCEAN PERSONALITY PROFILE** (Big 5)
   - Openness (0-1): Creativity, trying new things
   - Conscientiousness (0-1): Organization, planning
   - Extraversion (0-1): Social, outgoing
   - Agreeableness (0-1): Cooperative, trusting
   - Neuroticism (0-1): Anxious, sensitive

2. **CIALDINI'S PERSUASION PRINCIPLES**
   Rank effectiveness (0-100) for:
   - Reciprocity, Scarcity, Authority, Consistency, Liking, Social Proof

3. **COGNITIVE BIASES TO LEVERAGE**
   Identify top 3 applicable biases from:
   - Anchoring, Bandwagon, Loss Aversion, Framing, Decoy, etc.
   
4. **EMOTIONAL PROFILE**
   - Primary emotions (3-5): aspiration, fear, joy, etc.
   - Emotional arc: How to take them on a journey
   - Key triggers: What resonates
   - Avoidances: What to avoid

5. **MESSAGING RECOMMENDATIONS**
   - 3 headline strategies
   - Tone adjustments needed
   - Visual style suggestions
   - CTA phrasing recommendations

Return ONLY JSON:
{
  "ocean": {
    "openness": 0.0-1.0,
    "conscientiousness": 0.0-1.0,
    "extraversion": 0.0-1.0,
    "agreeableness": 0.0-1.0,
    "neuroticism": 0.0-1.0
  },
  "persuasion": {
    "primary": "principle_name",
    "secondary": "principle_name",
    "scores": {
      "reciprocity": 0-100,
      "scarcity": 0-100,
      "authority": 0-100,
      "consistency": 0-100,
      "liking": 0-100,
      "social_proof": 0-100
    }
  },
  "biases": {
    "primary": "bias_name",
    "scores": {
      "anchoring": 0-100,
      "bandwagon": 0-100,
      "loss_aversion": 0-100,
      "framing": 0-100
    },
    "applications": ["how to use bias 1", "how to use bias 2"]
  },
  "emotional": {
    "primary": ["emotion1", "emotion2", "emotion3"],
    "arc": "negative_positive",
    "triggers": ["trigger1", "trigger2"],
    "avoidances": ["avoid1", "avoid2"]
  },
  "recommendations": {
    "headlines": ["strategy1", "strategy2", "strategy3"],
    "tone": ["adjustment1", "adjustment2"],
    "visual": ["suggestion1", "suggestion2"],
    "ctas": ["recommendation1", "recommendation2"]
  }
}`;
}

/**
 * Parse AI response into structured psychology profile
 */
function parsePsychologyResponse(response: string): Omit<PsychologyAgentResult, 'confidence'> {
    try {
        const data = JSON.parse(response);

        return {
            ocean: {
                openness: data.ocean?.openness || 0.65,
                conscientiousness: data.ocean?.conscientiousness || 0.60,
                extraversion: data.ocean?.extraversion || 0.55,
                agreeableness: data.ocean?.agreeableness || 0.60,
                neuroticism: data.ocean?.neuroticism || 0.45
            },
            persuasion: {
                primaryPrinciple: data.persuasion?.primary || 'social_proof',
                secondaryPrinciple: data.persuasion?.secondary || 'scarcity',
                effectiveness: data.persuasion?.scores || {
                    reciprocity: 60,
                    scarcity: 75,
                    authority: 70,
                    consistency: 55,
                    liking: 65,
                    social_proof: 80
                }
            },
            cognitiveBiases: {
                primaryBias: data.biases?.primary || 'anchoring',
                effectiveness: data.biases?.scores || {
                    anchoring: 75,
                    bandwagon: 80,
                    loss_aversion: 70,
                    endowment: 50,
                    decoy: 60,
                    framing: 65,
                    availability: 55,
                    confirmation: 60,
                    sunk_cost: 45,
                    status_quo: 50
                },
                applications: data.biases?.applications || [
                    'Use price anchoring',
                    'Show social proof numbers',
                    'Frame as loss prevention'
                ]
            },
            emotional: {
                primaryEmotions: data.emotional?.primary || ['aspiration', 'convenience', 'quality'],
                emotionalArc: data.emotional?.arc || 'negative_positive',
                triggers: data.emotional?.triggers || ['innovation', 'status', 'efficiency'],
                avoidances: data.emotional?.avoidances || ['complexity', 'risk']
            },
            recommendations: {
                headlines: data.recommendations?.headlines || [
                    'Lead with benefit',
                    'Use social proof',
                    'Create urgency'
                ],
                toneAdjustments: data.recommendations?.tone || [
                    'Stay professional yet approachable',
                    'Emphasize reliability'
                ],
                visualSuggestions: data.recommendations?.visual || [
                    'Use clean, modern design',
                    'Show product in use'
                ],
                ctaRecommendations: data.recommendations?.ctas || [
                    'Strong action verbs',
                    'Emphasize ease'
                ]
            }
        };
    } catch {
        throw new Error('Failed to parse psychology response');
    }
}

/**
 * Generate heuristic-based profile as fallback
 */
function generateHeuristicProfile(input: PsychologyInput): PsychologyAgentResult {
    // Basic heuristics based on product type and tone
    const isLuxury = input.tone === 'luxury';
    const isTech = /tech|electronic|digital|software/i.test(input.productDescription);
    const isYoung = /young|millennial|gen-z/i.test(input.targetAudience || '');

    return {
        ocean: {
            openness: isTech ? 0.75 : 0.60,
            conscientiousness: isLuxury ? 0.70 : 0.55,
            extraversion: isYoung ? 0.70 : 0.50,
            agreeableness: 0.60,
            neuroticism: 0.45
        },
        persuasion: {
            primaryPrinciple: isLuxury ? 'authority' : 'social_proof',
            secondaryPrinciple: isYoung ? 'scarcity' : 'consistency',
            effectiveness: {
                reciprocity: 60,
                scarcity: isYoung ? 85 : 65,
                authority: isLuxury ? 85 : 65,
                consistency: 60,
                liking: 70,
                social_proof: isYoung ? 85 : 75
            }
        },
        cognitiveBiases: {
            primaryBias: 'anchoring',
            effectiveness: {
                anchoring: 75,
                bandwagon: 80,
                loss_aversion: 70,
                endowment: 50,
                decoy: 60,
                framing: 65,
                availability: 55,
                confirmation: 60,
                sunk_cost: 45,
                status_quo: 50
            },
            applications: [
                'Use price anchoring with original price',
                'Show number of users/customers',
                'Frame as preventing loss/missing out'
            ]
        },
        emotional: {
            primaryEmotions: isLuxury
                ? ['aspiration', 'prestige', 'exclusivity']
                : ['convenience', 'value', 'trust'],
            emotionalArc: 'negative_positive',
            triggers: isTech
                ? ['innovation', 'efficiency', 'status']
                : ['quality', 'reliability', 'value'],
            avoidances: ['complexity', 'risk', 'low-quality']
        },
        recommendations: {
            headlines: [
                isLuxury ? 'Emphasize exclusivity and craftsmanship' : 'Lead with clear benefit',
                'Use specific numbers and proof',
                'Create sense of urgency'
            ],
            toneAdjustments: [
                isLuxury ? 'Sophisticated and aspirational' : 'Professional yet approachable',
                'Build trust through specificity'
            ],
            visualSuggestions: [
                isLuxury ? 'Elegant, minimalist design' : 'Clean, modern aesthetic',
                'Show product in context of use'
            ],
            ctaRecommendations: [
                'Use strong action verbs',
                isLuxury ? 'Emphasize exclusivity' : 'Emphasize ease and value'
            ]
        },
        confidence: 0.65 // Lower confidence for heuristic
    };
}

/**
 * Get messaging suggestions based on OCEAN profile
 */
export function getMessagingSuggestions(ocean: OCEANProfile): string[] {
    const suggestions: string[] = [];

    if (ocean.openness > 0.7) {
        suggestions.push('Emphasize innovation and uniqueness');
        suggestions.push('Use creative, unconventional messaging');
    }

    if (ocean.conscientiousness > 0.7) {
        suggestions.push('Highlight reliability and quality');
        suggestions.push('Provide detailed information and guarantees');
    }

    if (ocean.extraversion > 0.7) {
        suggestions.push('Use energetic, social proof messaging');
        suggestions.push('Show community and shared experiences');
    }

    if (ocean.agreeableness > 0.7) {
        suggestions.push('Build trust through transparency');
        suggestions.push('Emphasize harmony and positive outcomes');
    }

    if (ocean.neuroticism > 0.6) {
        suggestions.push('Address concerns and provide reassurance');
        suggestions.push('Emphasize safety and security');
    }

    return suggestions.length > 0 ? suggestions : [
        'Use balanced, versatile messaging',
        'Focus on clear benefits and proof'
    ];
}

/**
 * Adapt copy variant to psychology profile
 */
export function adaptCopyToPsychology(
    copy: { headline: string; description: string; cta: string },
    psychology: PsychologyAgentResult
): { headline: string; description: string; cta: string } {
    // This would use AI in production, for now returns adjusted copy
    // Based on psychology insights

    let adjustedCopy = { ...copy };

    // Apply emotional triggers
    const trigger = psychology.emotional.triggers[0];
    if (trigger && !copy.headline.toLowerCase().includes(trigger.toLowerCase())) {
        // Suggest adding trigger word to headline
        console.log(`💡 Suggestion: Add "${trigger}" to headline`);
    }

    // Apply persuasion principle
    const principle = psychology.persuasion.primaryPrinciple;
    if (principle === 'social_proof' && !/\d+/.test(copy.description)) {
        console.log('💡 Suggestion: Add social proof numbers');
    }

    return adjustedCopy;
}
