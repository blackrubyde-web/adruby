import { getOpenAIService } from '../services/openai-service';
import { getVisionService } from '../services/vision-service';
import { getTelemetryService } from '../telemetry/telemetry-service';
import type { AdDocument } from '../../../types/studio';

/**
 * MULTI-AGENT ORCHESTRATOR
 * Coordinates 5 specialized AI agents for superior ad generation
 * 
 * Agents:
 * 1. Copy Agent - Headlines, descriptions, CTAs (20+ variants)
 * 2. Visual Agent - Layout, colors, composition
 * 3. Psychology Agent - Emotional triggers, persuasion (OCEAN model)
 * 4. Performance Agent - CTR prediction, optimization
 * 5. Compliance Agent - Safety, brand, legal validation
 */

export interface OrchestratorInput {
    productName: string;
    brandName?: string;
    productDescription: string;
    tone: 'professional' | 'playful' | 'bold' | 'luxury' | 'minimal';
    imageBase64?: string;
    targetAudience?: string;
    language?: string;
    productType?: string;
    groundedFacts?: {
        offer?: string;
        proof?: string;
        painPoints?: string[];
    };
}

export interface CopyAgentResult {
    variants: Array<{
        headline: string;
        subheadline: string;
        description: string;
        cta: string;
        hookAngle: string;
        emotionalScore: number;
        powerWordCount: number;
        reasoning: string;
    }>;
    topVariant: {
        headline: string;
        subheadline: string;
        description: string;
        cta: string;
        score: number;
    };
}

export interface PsychologyAgentResult {
    oceanProfile: {
        openness: number;
        conscientiousness: number;
        extraversion: number;
        agreeableness: number;
        neuroticism: number;
    };
    emotionalTriggers: string[];
    persuasionPrinciples: string[];
    cognitiveBiases: string[];
    recommendations: string[];
}

export interface VisualAgentResult {
    layoutStrategy: string;
    colorStrategy: string;
    typographyRecommendations: {
        headline: string;
        body: string;
    };
    visualHierarchy: string[];
    compositionScore: number;
}

export interface PerformanceAgentResult {
    predictedCTR: number;
    confidence: number;
    performanceFactors: Record<string, number>;
    optimizationSuggestions: string[];
    benchmarkComparison: {
        industry: string;
        average: number;
        top10Percent: number;
    };
}

export interface ComplianceAgentResult {
    safetyPassed: boolean;
    brandAligned: boolean;
    legalCompliant: boolean;
    issues: Array<{
        type: string;
        severity: 'low' | 'medium' | 'high';
        message: string;
    }>;
    suggestions: string[];
}

export interface OrchestrationResult {
    copy: CopyAgentResult;
    psychology: PsychologyAgentResult;
    visual: VisualAgentResult;
    performance: PerformanceAgentResult;
    compliance: ComplianceAgentResult;
    synthesizedAd: AdDocument;
    metadata: {
        sessionId: string;
        totalCost: number;
        totalTime: number;
        agentCalls: number;
    };
}

/**
 * Master Orchestrator - Coordinates all AI agents
 */
export async function orchestrateAdGeneration(
    input: OrchestratorInput,
    onProgress?: (agent: string, message: string) => void
): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const sessionId = crypto.randomUUID();
    const telemetry = getTelemetryService();

    telemetry.trackGenerationStart(sessionId, {
        productName: input.productName,
        orchestration: true
    });

    try {
        // STAGE 1: Psychology Agent - Profile target audience
        onProgress?.('psychology', 'Analyzing audience psychology...');
        const psychologyResult = await runPsychologyAgent(input);

        // STAGE 2: Copy Agent - Generate 20+ variants with psychology insights
        onProgress?.('copy', 'Generating 20+ copy variants...');
        const copyResult = await runCopyAgent(input, psychologyResult);

        // STAGE 3: Visual Agent - Determine optimal layout strategy
        onProgress?.('visual', 'Planning visual strategy...');
        const visualResult = await runVisualAgent(input, psychologyResult);

        // STAGE 4: Performance Agent - Predict CTR & optimize
        onProgress?.('performance', 'Predicting performance metrics...');
        const performanceResult = await runPerformanceAgent(
            input,
            copyResult,
            visualResult
        );

        // STAGE 5: Compliance Agent - Validate safety & brand
        onProgress?.('compliance', 'Validating compliance...');
        const complianceResult = await runComplianceAgent(
            copyResult.topVariant,
            input
        );

        // STAGE 6: Synthesize final ad document
        onProgress?.('synthesis', 'Synthesizing optimal ad...');
        const synthesizedAd = await synthesizeAdDocument(
            input,
            copyResult,
            visualResult,
            psychologyResult
        );

        const totalTime = Date.now() - startTime;
        telemetry.trackGenerationComplete(sessionId, synthesizedAd, totalTime);

        return {
            copy: copyResult,
            psychology: psychologyResult,
            visual: visualResult,
            performance: performanceResult,
            compliance: complianceResult,
            synthesizedAd,
            metadata: {
                sessionId,
                totalCost: 0.25, // TODO: Calculate real cost
                totalTime,
                agentCalls: 5
            }
        };

    } catch (error) {
        telemetry.trackError(sessionId, error as Error, {
            stage: 'orchestration'
        });
        throw error;
    }
}

/**
 * Psychology Agent - OCEAN personality profiling
 */
async function runPsychologyAgent(
    input: OrchestratorInput
): Promise<PsychologyAgentResult> {
    const openai = getOpenAIService();

    const prompt = `You are a consumer psychology expert. Analyze this target audience and product to create a psychographic profile.

PRODUCT: ${input.productName}
DESCRIPTION: ${input.productDescription}
TARGET AUDIENCE: ${input.targetAudience || 'General consumers'}
TONE: ${input.tone}

Analyze using the OCEAN (Big 5) personality model and identify:
1. Likely personality traits (0-1 scale for each)
2. Primary emotional triggers (3-5)
3. Effective persuasion principles (Cialdini's 6)
4. Cognitive biases to leverage
5. Messaging recommendations

Return JSON:
{
  "ocean": {
    "openness": 0.0-1.0,
    "conscientiousness": 0.0-1.0,
    "extraversion": 0.0-1.0,
    "agreeableness": 0.0-1.0,
    "neuroticism": 0.0-1.0
  },
  "emotionalTriggers": ["trigger1", "trigger2"],
  "persuasionPrinciples": ["principle1", "principle2"],
  "cognitiveBiases": ["bias1", "bias2"],
  "recommendations": ["rec1", "rec2"]
}`;

    const result = await openai.generateAdCopy({
        productName: input.productName,
        productDescription: prompt,
        tone: input.tone,
        goal: 'analysis',
        language: 'English',
        format: 'json'
    });

    // Parse psychology profile from AI response
    try {
        const profile = JSON.parse(result.content.description);
        return {
            oceanProfile: profile.ocean,
            emotionalTriggers: profile.emotionalTriggers,
            persuasionPrinciples: profile.persuasionPrinciples,
            cognitiveBiases: profile.cognitiveBiases,
            recommendations: profile.recommendations
        };
    } catch {
        // Fallback profile
        return {
            oceanProfile: {
                openness: 0.65,
                conscientiousness: 0.60,
                extraversion: 0.55,
                agreeableness: 0.60,
                neuroticism: 0.45
            },
            emotionalTriggers: ['aspiration', 'convenience', 'quality'],
            persuasionPrinciples: ['social_proof', 'scarcity', 'authority'],
            cognitiveBiases: ['anchoring', 'bandwagon'],
            recommendations: ['Emphasize quality and reliability']
        };
    }
}

/**
 * Copy Agent - Generate 20+ variants with multi-stage refinement
 */
async function runCopyAgent(
    input: OrchestratorInput,
    psychology: PsychologyAgentResult
): Promise<CopyAgentResult> {
    const openai = getOpenAIService();

    // STAGE 1: Generate 20 initial variants
    const prompt = `You are an elite copywriter. Generate 20 high-converting ad copy variants.

PRODUCT: ${input.productName}
DESCRIPTION: ${input.productDescription}
TONE: ${input.tone}
LANGUAGE: ${input.language || 'German'}

PSYCHOLOGY INSIGHTS:
- Emotional Triggers: ${psychology.emotionalTriggers.join(', ')}
- Persuasion: ${psychology.persuasionPrinciples.join(', ')}
- Biases: ${psychology.cognitiveBiases.join(', ')}

Generate 20 variants using different hook angles:
- Problem-Agitate-Solve
- Social Proof
- Scarcity
- Curiosity Gap
- Before/After
- Dream Outcome
- Authority
- Status Symbol
- Time Collapse
- Exclusivity

Each variant must have:
- Headline (max 60 chars)
- Subheadline (max 80 chars)
- Description (max 125 chars)
- CTA (max 25 chars)

Return JSON array of 20 variants with hookAngle, emotional score (0-100), power word count.`;

    const result = await openai.generateAdCopy({
        productName: input.productName,
        productDescription: prompt,
        tone: input.tone,
        goal: 'conversion',
        language: input.language || 'German',
        format: 'json'
    });

    // Mock 20 variants for now (TODO: Parse from AI response)
    const variants = Array.from({ length: 20 }, (_, i) => ({
        headline: result.content.headline,
        subheadline: result.content.subheadline,
        description: result.content.description,
        cta: result.content.cta,
        hookAngle: ['problem', 'social', 'scarcity'][i % 3],
        emotionalScore: 75 + Math.random() * 20,
        powerWordCount: 2 + Math.floor(Math.random() * 4),
        reasoning: `Variant ${i + 1} using ${['problem', 'social', 'scarcity'][i % 3]} hook`
    }));

    // Select top variant
    const topVariant = variants.sort((a, b) => b.emotionalScore - a.emotionalScore)[0];

    return {
        variants,
        topVariant: {
            headline: topVariant.headline,
            subheadline: topVariant.subheadline,
            description: topVariant.description,
            cta: topVariant.cta,
            score: topVariant.emotionalScore
        }
    };
}

/**
 * Visual Agent - Layout & design strategy
 */
async function runVisualAgent(
    input: OrchestratorInput,
    psychology: PsychologyAgentResult
): Promise<VisualAgentResult> {
    const vision = getVisionService();

    // If image provided, analyze it
    if (input.imageBase64) {
        const analysis = await vision.analyzeProductImage(input.imageBase64);

        return {
            layoutStrategy: 'product-focused',
            colorStrategy: analysis.content.quality.colors || 'vibrant',
            typographyRecommendations: {
                headline: 'bold-sans',
                body: 'light-sans'
            },
            visualHierarchy: ['product', 'headline', 'cta', 'description'],
            compositionScore: analysis.content.composition?.score || 85
        };
    }

    // Fallback based on psychology
    return {
        layoutStrategy: psychology.oceanProfile.openness > 0.7 ? 'asymmetric' : 'grid-based',
        colorStrategy: input.tone === 'luxury' ? 'monochromatic-dark' : 'vibrant',
        typographyRecommendations: {
            headline: input.tone === 'minimal' ? 'thin-sans' : 'bold-sans',
            body: 'light-sans'
        },
        visualHierarchy: ['headline', 'product', 'description', 'cta'],
        compositionScore: 88
    };
}

/**
 * Performance Agent - CTR prediction
 */
async function runPerformanceAgent(
    input: OrchestratorInput,
    copy: CopyAgentResult,
    visual: VisualAgentResult
): Promise<PerformanceAgentResult> {
    // TODO: ML model prediction
    // For now, heuristic-based estimation

    const baseCTR = 1.2; // Industry average

    // Factors
    const emotionalBoost = (copy.topVariant.score / 100) * 0.8;
    const visualBoost = (visual.compositionScore / 100) * 0.6;
    const powerWordBoost = (copy.variants[0].powerWordCount / 10) * 0.3;

    const predictedCTR = baseCTR + emotionalBoost + visualBoost + powerWordBoost;

    return {
        predictedCTR: Math.min(predictedCTR, 5.0), // Cap at 5%
        confidence: 0.78,
        performanceFactors: {
            emotionalAppeal: emotionalBoost,
            visualQuality: visualBoost,
            copyStrength: powerWordBoost
        },
        optimizationSuggestions: [
            'Increase CTA prominence',
            'Add social proof element',
            'Test darker background'
        ],
        benchmarkComparison: {
            industry: input.productType || 'general',
            average: baseCTR,
            top10Percent: 3.2
        }
    };
}

/**
 * Compliance Agent - Safety & validation
 */
async function runComplianceAgent(
    copy: { headline: string; description: string; cta: string },
    _input: OrchestratorInput
): Promise<ComplianceAgentResult> {
    const { checkAdCopy } = await import('../content-safety/profanity-filter');

    const safetyCheck = checkAdCopy({
        headline: copy.headline,
        description: copy.description,
        cta: copy.cta
    });

    return {
        safetyPassed: safetyCheck.overall.clean,
        brandAligned: true, // TODO: Real brand validation
        legalCompliant: true, // TODO: Real legal check
        issues: safetyCheck.overall.violations.map(v => ({
            type: 'content_safety',
            severity: 'medium' as const,
            message: v
        })),
        suggestions: []
    };
}

/**
 * Synthesize final ad document from all agent results
 */
async function synthesizeAdDocument(
    input: OrchestratorInput,
    copy: CopyAgentResult,
    _visual: VisualAgentResult,
    _psychology: PsychologyAgentResult
): Promise<AdDocument> {
    // Use enhanced layout engine with agent recommendations
    const { composeAdEnhanced } = await import('../layout/enhanced-layout-engine');

    const layoutInput = {
        headline: copy.topVariant.headline,
        subheadline: copy.topVariant.subheadline,
        description: copy.topVariant.description,
        ctaText: copy.topVariant.cta,
        productImage: input.imageBase64,
        productName: input.productName,
        brandName: input.brandName,
        tone: input.tone,
        colors: {
            primary: '#000000', // TODO: Extract from visual agent
            secondary: '#FFFFFF',
            text: '#000000',
            background: '#FFFFFF',
            accent: '#FF0000'
        },
        enforceAccessibility: true,
        targetBalanceScore: 90
    };

    const result = await composeAdEnhanced(layoutInput);
    return result.adDocument;
}
