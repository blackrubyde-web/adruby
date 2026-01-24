/**
 * PREMIUM PROMPT BUILDER
 * 
 * Generates 1000+ word designer-level prompts for Gemini
 * Based on synthesized Foreplay patterns
 * 
 * Uses designer vocabulary:
 * - Composition rules (rule of thirds, focal points)
 * - Color theory (complementary, analogous, triadic)
 * - Typography hierarchy (optical sizing, kerning)
 * - Visual weight and balance
 * - Negative space utilization
 */

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

/**
 * Build premium background prompt from design specs
 */
export function buildBackgroundPrompt(designSpecs, productAnalysis, accentColor) {
    const layout = designSpecs.layout || {};
    const colors = designSpecs.colors || {};
    const effects = designSpecs.effects || {};
    const composition = designSpecs.composition || {};
    const mood = designSpecs.mood || {};

    // Calculate product clearance zone
    const productZone = {
        x: layout.productPlacement?.xPercent || 0.5,
        y: layout.productPlacement?.yPercent || 0.45,
        width: layout.productPlacement?.scalePercent || 0.55,
        height: (layout.productPlacement?.scalePercent || 0.55) * 0.7
    };

    const prompt = `
=== ELITE CREATIVE DIRECTOR BRIEF ===

You are a world-class creative director at a top-tier advertising agency. Create an EMPTY premium background scene that will serve as the foundation for a high-converting advertisement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 TECHNICAL SPECIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Canvas Dimensions: ${CANVAS_WIDTH}x${CANVAS_HEIGHT} pixels (1:1 square format)
Output: High-resolution background scene ONLY

⛔ CRITICAL RESTRICTIONS:
- NO products, devices, screens, or objects
- NO text, logos, buttons, or UI elements  
- NO human figures or faces
- This is PURELY an environmental/atmospheric background

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 COLOR PALETTE & ATMOSPHERE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIMARY BACKGROUND: ${colors.backgroundPrimary || '#0A0A1A'}
- Deep, rich foundation color
- Sets the dominant mood

SECONDARY GRADIENT: ${colors.backgroundSecondary || '#1A1A3A'}
- Creates depth and dimension
- Gradient Direction: ${colors.gradientDirection || 'radial'} gradient
  ${colors.gradientDirection === 'radial' ? '• Radiates from focal point (x:' + Math.round(composition.focalPoint?.xPercent * 100) + '%, y:' + Math.round(composition.focalPoint?.yPercent * 100) + '%)' : ''}
  ${colors.gradientDirection === 'linear_vertical' ? '• Flows from top to bottom' : ''}
  ${colors.gradientDirection === 'linear_diagonal' ? '• 45-degree angle, top-left to bottom-right' : ''}

ACCENT COLOR: ${accentColor}
- Used for glows, highlights, and atmospheric elements
- Should appear subtle, never overwhelming
- Creates visual interest and brand recognition

COLOR HARMONY: Use ${mood.primary === 'premium' ? 'sophisticated, muted tones' : 'vibrant, energetic tones'}
- Maintain ${composition.contrast || 'high'} contrast between elements
- ${mood.trust === 'luxury' ? 'Add subtle gold/champagne undertones for luxury feel' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ ATMOSPHERIC EFFECTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${effects.backgroundEffects?.hasBokeh ? `
BOKEH CIRCLES:
- Number: ${effects.backgroundEffects?.bokehCount || 4} soft, out-of-focus light circles
- Size Range: 50-120px diameter
- Opacity: 3-8% (very subtle)
- Color: ${accentColor} with slight variation
- Placement: Distributed in rule-of-thirds intersections
- Blur Level: Gaussian blur 15-25px for authentic depth-of-field effect
` : ''}

${effects.backgroundEffects?.hasParticles ? `
FLOATING PARTICLES:
- Density: Sparse (15-25 particles)
- Size: 2-6px dots
- Opacity: 5-15%
- Animation State: Static but implying gentle drift
- Placement: Concentrated near light sources
` : ''}

${effects.backgroundEffects?.hasNoiseTexture ? `
FILM GRAIN/NOISE:
- Type: Monochromatic noise texture
- Opacity: ${Math.round((effects.backgroundEffects?.noiseOpacity || 0.02) * 100)}%
- Purpose: Adds analog warmth, reduces digital flatness
- Grain Size: Fine (1-2px)
` : ''}

${colors.hasVignette ? `
VIGNETTE EFFECT:
- Style: Subtle darkening toward edges
- Intensity: 15-25% darker at corners
- Shape: Elliptical, following canvas aspect
- Purpose: Draws focus to center
` : ''}

CENTRAL GLOW/LIGHT SOURCE:
- Position: Near focal point (x:${Math.round((composition.focalPoint?.xPercent || 0.5) * 100)}%, y:${Math.round((composition.focalPoint?.yPercent || 0.45) * 100)}%)
- Color: ${accentColor}
- Opacity: ${Math.round((effects.screenGlow?.intensity || 0.1) * 100)}%
- Size: 300-450px radius, soft-edged
- Purpose: Creates visual anchor for product placement

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📏 COMPOSITION & SPATIAL DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GRID SYSTEM: ${layout.gridType || 'centered'}
${layout.gridType === 'rule_of_thirds' ? `
- Divide canvas into 9 equal sections (3x3 grid)
- Place visual interest at grid intersections
- Create dynamic, professional composition
` : ''}
${layout.gridType === 'centered' ? `
- Radial composition from center point
- Symmetrical balance with subtle asymmetric details
- Focus converges to canvas center
` : ''}
${layout.gridType === 'asymmetric' ? `
- Off-center focal point for dynamic tension
- Visual weight distributed 60/40
- Creates contemporary, editorial feel
` : ''}

PRODUCT CLEARANCE ZONE:
⚠️ KEEP THIS AREA COMPLETELY CLEAR - NO ELEMENTS HERE:
- Center: x:${Math.round(productZone.x * 100)}%, y:${Math.round(productZone.y * 100)}%
- Width: ${Math.round(productZone.width * 100)}% of canvas
- Height: ${Math.round(productZone.height * 100)}% of canvas
- This area will contain the product overlay

HEADLINE ZONE (Top):
- Y Position: 0-${Math.round((designSpecs.typography?.headline?.yPercent || 0.15) * 100)}%
- Keep darker/cleaner for text legibility

CTA ZONE (Bottom):
- Y Position: ${Math.round((designSpecs.typography?.cta?.yPercent || 0.85) * 100)}-100%
- Ensure sufficient contrast for button visibility

VISUAL FLOW: ${composition.visualFlow || 'top_to_bottom'}
- Guide viewer's eye naturally through the composition
- Use gradient direction to reinforce flow
- Light elements should lead to focal point

WHITESPACE: ${composition.whitespaceBalance || 'balanced'}
- ${composition.whitespaceBalance === 'generous' ? 'Embrace negative space for premium feel' : ''}
- ${composition.whitespaceBalance === 'minimal' ? 'Rich visual density with careful organization' : ''}
- ${composition.whitespaceBalance === 'balanced' ? 'Harmonious mix of content and breathing room' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 MOOD & STYLE DIRECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIMARY MOOD: ${mood.primary?.toUpperCase() || 'PREMIUM'}
${mood.primary === 'premium' ? `
- Sophisticated, refined aesthetic
- Subtle gradients over harsh contrasts
- Implies quality and exclusivity
- Similar to: Apple, Porsche, Rolex advertising
` : ''}
${mood.primary === 'playful' ? `
- Energetic, approachable aesthetic
- Vibrant color pops
- Dynamic, organic shapes
- Similar to: Spotify, Slack, Notion advertising
` : ''}
${mood.primary === 'minimal' ? `
- Clean, distraction-free aesthetic
- Maximum negative space
- Essential elements only
- Similar to: Google, Muji, Aesop advertising
` : ''}

ENERGY LEVEL: ${mood.energy?.toUpperCase() || 'DYNAMIC'}
${mood.energy === 'calm' ? '- Serene, peaceful atmosphere' : ''}
${mood.energy === 'dynamic' ? '- Subtle movement implied in gradients' : ''}
${mood.energy === 'intense' ? '- Bold, high-impact visual presence' : ''}

TRUST SIGNAL: ${mood.trust?.toUpperCase() || 'LUXURY'}
${mood.trust === 'luxury' ? '- Premium materials implied through lighting' : ''}
${mood.trust === 'corporate' ? '- Professional, reliable aesthetic' : ''}
${mood.trust === 'friendly' ? '- Warm, inviting atmosphere' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 PRODUCTION QUALITY STANDARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This background should meet the quality standards of:
- Award-winning advertising campaigns
- Fortune 500 brand guidelines
- Top-tier design agency output

TECHNICAL QUALITY:
- Clean gradient transitions (no banding)
- Proper color space management
- Sharp where needed, soft where intentional
- No artifacts or compression issues

INDUSTRY REFERENCE: ${productAnalysis?.productType || 'Technology'}
- Match the visual language of premium ${productAnalysis?.productType || 'tech'} brands
- Contemporary aesthetic appropriate for ${new Date().getFullYear()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 FINAL CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Empty background - no products or text
✓ ${CANVAS_WIDTH}x${CANVAS_HEIGHT}px square format
✓ Product zone kept clear
✓ Appropriate atmospheric effects
✓ Correct color palette applied
✓ Professional composition
✓ Agency-quality production value

=== END BRIEF ===
`.trim();

    return prompt;
}

/**
 * Build prompt for typography and CTA overlay
 * (Used as reference for SVG generation, not for Gemini)
 */
export function buildTypographySpecs(designSpecs) {
    const typography = designSpecs.typography || {};

    return {
        headline: {
            yPercent: typography.headline?.yPercent || 0.1,
            alignment: typography.headline?.alignment || 'center',
            sizePx: typography.headline?.sizePx || 56,
            weight: typography.headline?.weight || 800,
            letterSpacing: typography.headline?.letterSpacing === 'tight' ? -1 :
                typography.headline?.letterSpacing === 'wide' ? 2 : 0,
            color: typography.headline?.color || '#FFFFFF',
            hasShadow: typography.headline?.hasShadow !== false,
            shadowBlur: typography.headline?.shadowBlur || 10,
            maxWidth: 0.9 // 90% of canvas
        },
        tagline: {
            show: typography.tagline?.show !== false,
            yPercent: typography.tagline?.yPercent || 0.18,
            sizePx: typography.tagline?.sizePx || 24,
            weight: typography.tagline?.weight || 400,
            color: typography.tagline?.color || 'rgba(255,255,255,0.8)'
        },
        cta: {
            yPercent: typography.cta?.yPercent || 0.88,
            style: typography.cta?.style || 'pill',
            widthPx: typography.cta?.widthPx || 280,
            heightPx: typography.cta?.heightPx || 56,
            borderRadius: typography.cta?.borderRadius || 28,
            hasGradient: typography.cta?.hasGradient !== false,
            hasGlow: typography.cta?.hasGlow !== false,
            glowIntensity: typography.cta?.glowIntensity || 0.4,
            textSizePx: typography.cta?.textSizePx || 20,
            textWeight: typography.cta?.textWeight || 700
        }
    };
}

/**
 * Build product compositing specifications
 */
export function buildProductSpecs(designSpecs) {
    const layout = designSpecs.layout || {};
    const effects = designSpecs.effects || {};

    return {
        position: {
            xPercent: layout.productPlacement?.xPercent || 0.5,
            yPercent: layout.productPlacement?.yPercent || 0.45
        },
        scale: layout.productPlacement?.scalePercent || 0.55,
        rotation: layout.productPlacement?.rotation || 0,
        device: {
            hasFrame: layout.productPlacement?.hasDeviceFrame !== false,
            type: layout.productPlacement?.deviceType || 'macbook'
        },
        shadow: {
            show: effects.productShadow?.show !== false,
            type: effects.productShadow?.type || 'drop',
            blur: effects.productShadow?.blur || 25,
            opacity: effects.productShadow?.opacity || 0.5,
            offsetY: effects.productShadow?.offsetY || 15
        },
        reflection: {
            show: effects.productReflection?.show || false,
            opacity: effects.productReflection?.opacity || 0.1
        },
        screenGlow: {
            show: effects.screenGlow?.show || false,
            intensity: effects.screenGlow?.intensity || 0.08
        }
    };
}

/**
 * Generate quality check prompt for GPT-4V verification
 */
export function buildQualityCheckPrompt(designSpecs) {
    const mood = designSpecs.mood || {};

    return `
You are an elite creative director reviewing a generated advertisement.

Evaluate this ad against these criteria (score 1-10 for each):

1. COMPOSITION (20%): Is the layout balanced? Does it follow professional grid systems?
2. COLOR HARMONY (15%): Do colors work together? Is the accent used effectively?
3. TYPOGRAPHY (20%): Is text legible? Is hierarchy clear? Is CTA prominent?
4. VISUAL QUALITY (15%): Are effects professional? No artifacts or banding?
5. MOOD ALIGNMENT (15%): Does it feel ${mood.primary || 'premium'}? Is energy ${mood.energy || 'dynamic'}?
6. CONVERSION POTENTIAL (15%): Would this ad perform well? Is CTA compelling?

Return JSON:
{
    "overall_score": 8,
    "scores": {
        "composition": 8,
        "color_harmony": 9,
        "typography": 7,
        "visual_quality": 8,
        "mood_alignment": 8,
        "conversion_potential": 7
    },
    "strengths": ["Clear hierarchy", "Premium feel"],
    "improvements": ["CTA could be larger", "More contrast in headline"],
    "passes_threshold": true
}

Threshold for approval: 7.5+
`.trim();
}

export default {
    buildBackgroundPrompt,
    buildTypographySpecs,
    buildProductSpecs,
    buildQualityCheckPrompt
};
