/**
 * Premium Design System - 10/10 Agency-Level Visuals
 * 
 * Creates stunning, scroll-stopping ads that look like $100k productions
 */

/**
 * Premium Background Prompts - 2025 Agency Level
 */
export const PREMIUM_BACKGROUNDS = {
    // =============================================
    // DARK PREMIUM - For any product, always works
    // =============================================
    dark_premium: {
        id: 'dark_premium',
        name: 'Dark Premium',
        prompt: `
Create a STUNNING premium advertisement background. NO PRODUCT - leave center 50% empty.

STYLE: Ultra-premium, Apple keynote level, $100,000 agency production

BACKGROUND COMPOSITION:
- Base: Deep gradient from #0A0A12 (near black) to #1A1A2E (dark navy)
- Subtle concentric light rings emanating from center (very low opacity 5-10%)
- Ambient purple/blue glow spots floating in background (soft, blurred)
- Micro-texture: subtle noise grain for premium feel
- Subtle depth through layered gradients

LIGHTING:
- Soft ambient light source from top-center
- Creates gentle highlight zone where product will sit
- Volumetric light rays (barely visible, 3-5% opacity)
- Rim light effect at edges

ATMOSPHERE:
- Clean, spacious, premium
- Feels like a luxury product reveal
- Magazine-quality, not stock photo
- Think: Apple, Tesla, Porsche ad quality

CENTER 50% MUST BE COMPLETELY EMPTY - product composited later.

Technical: 1024x1024, photorealistic lighting, ultra-high quality render.`,
    },

    // =============================================
    // GAMING RGB - Neon aesthetics
    // =============================================
    gaming_rgb: {
        id: 'gaming_rgb',
        name: 'Gaming RGB',
        prompt: `
Create an EPIC gaming-style advertisement background. NO PRODUCT - leave center empty.

STYLE: Premium gaming/eSports, Razer/ASUS ROG level quality

BACKGROUND COMPOSITION:
- Base: Ultra-dark #050508 to #0A0A15 gradient
- RGB neon accents: Cyan (#00FFFF), Magenta (#FF00FF), Electric blue (#0080FF)
- Subtle hexagonal grid pattern (10% opacity) receding into depth
- Floating geometric shapes with neon edges
- Light streaks/particles suggesting motion and energy

NEON EFFECTS:
- Glowing edge lines in corners (not overwhelming)
- Soft neon ambient glow from edges
- Subtle scanline effect (retro-futuristic)
- Light bloom on bright elements

LIGHTING:
- Dramatic side lighting creating depth
- RGB color mixing where lights overlap
- Center spot slightly brighter for product placement

ATMOSPHERE:
- High-tech, futuristic, exciting
- Premium gaming, NOT cheap gamer aesthetic
- Think: Cyberpunk 2077 UI meets Apple design philosophy

CENTER 50% EMPTY for product. 1024x1024, ultra quality.`,
    },

    // =============================================
    // WARM LIFESTYLE - Cozy, inviting
    // =============================================
    warm_lifestyle: {
        id: 'warm_lifestyle',
        name: 'Warm Lifestyle',
        prompt: `
Create a WARM, INVITING advertisement background. NO PRODUCT - leave center empty.

STYLE: Cozy lifestyle, hygge vibes, premium home aesthetic

BACKGROUND COMPOSITION:
- Base: Warm gradient from #1A1510 to #2A2018
- Soft golden/amber light spots (bokeh effect)
- Subtle wood texture grain (barely visible)
- Warm color temperature throughout

LIGHTING:
- Golden hour lighting feel
- Soft, diffused light from upper left
- Gentle shadows creating depth
- Warm spot light on center area

ATMOSPHERE:
- Cozy, welcoming, comfortable
- Premium but approachable
- Think: Luxury hotel lobby, high-end coffee shop
- Evokes feelings of comfort and quality

OPTIONAL ELEMENTS (subtle):
- Very soft out-of-focus warm lights in background
- Subtle fabric texture
- Gentle vignette at edges

CENTER EMPTY for product. Lifestyle/home product focus.`,
    },

    // =============================================
    // CLEAN WHITE - Minimalist premium
    // =============================================
    clean_minimal: {
        id: 'clean_minimal',
        name: 'Clean Minimal',
        prompt: `
Create an ULTRA-CLEAN minimalist advertisement background. NO PRODUCT - leave center empty.

STYLE: Apple-level minimal, premium white space, museum gallery feel

BACKGROUND COMPOSITION:
- Base: Clean gradient from #F8F8FA to #EAEAEF
- Subtle shadow suggesting infinite white space
- Minimal design elements - less is more
- Perfect lighting, no harsh shadows

LIGHTING:
- Soft, even studio lighting
- Gentle gradient from top (brighter) to bottom (slightly shadowed)
- No harsh shadows, all soft edges
- Professional product photography lighting setup

ATMOSPHERE:
- Premium, luxurious, high-end
- Gallery exhibition quality
- Think: Apple Store display, Scandinavian design
- Clean enough that product becomes the star

SUBTLE ELEMENTS:
- Very soft drop shadow where product will sit (suggesting surface)
- Minimal vignette
- Perfect exposure

This is for light-on-light compositions. Product pops against clean background.`,
    },

    // =============================================
    // GRADIENT MESH - Modern, vibrant
    // =============================================
    gradient_mesh: {
        id: 'gradient_mesh',
        name: 'Gradient Mesh',
        prompt: `
Create a VIBRANT gradient mesh advertisement background. NO PRODUCT - leave center empty.

STYLE: Modern 2025, Spotify/Instagram vibes, attention-grabbing

BACKGROUND COMPOSITION:
- Flowing gradient mesh with 4-5 color nodes
- Colors: Deep purple (#6B21A8) → Hot pink (#EC4899) → Orange (#F97316) → Coral
- Smooth transitions, no harsh edges
- Organic, flowing shapes
- Slight blur/diffusion on color boundaries

LIGHTING:
- Colors create their own luminosity
- Brighter in center fading to edges
- No artificial light sources needed
- Colors should glow subtly

ATMOSPHERE:
- Energetic, youthful, exciting
- Social media optimized (scroll-stopping)
- Modern, trendy, NOW
- Think: Spotify Wrapped, Apple Music vibes

TEXTURE:
- Subtle grain overlay for texture
- Not flat - has depth through gradients
- Premium feel despite vibrant colors

CENTER lighter/more neutral for product visibility.`,
    },

    // =============================================
    // NATURE BLEND - Organic, eco
    // =============================================
    nature_organic: {
        id: 'nature_organic',
        name: 'Nature Organic',
        prompt: `
Create an ORGANIC, nature-inspired advertisement background. NO PRODUCT - leave center empty.

STYLE: Eco-premium, natural luxury, sustainable brand aesthetic

BACKGROUND COMPOSITION:
- Base: Soft sage green (#A3B18A) to deep forest (#344E41) gradient
- Subtle leaf shadows/patterns (15% opacity)
- Natural texture - paper, linen, or organic material feel
- Earthy, grounded, authentic

LIGHTING:
- Soft natural daylight feel
- Dappled light effect (as if through leaves)
- Warm undertones
- Golden hour tint

ATMOSPHERE:
- Fresh, clean, natural
- Sustainability without being preachy
- Premium eco - not cheap green
- Think: Luxury organic skincare, premium health brand

ELEMENTS:
- Very subtle botanical silhouettes in background
- Natural texture overlay
- Soft vignette

For natural/eco products. Center empty for product.`,
    },
};

/**
 * Premium SVG Design Elements
 */
export function createPremiumOverlaySVG(config) {
    const {
        width = 1024,
        height = 1024,
        headline,
        subheadline,
        features = [],
        cta,
        badge,
        layout = 'feature_callout',
        colorScheme = 'dark', // 'dark', 'light', 'gaming', 'vibrant'
    } = config;

    // Premium color schemes
    const schemes = {
        dark: {
            headline: '#FFFFFF',
            headlineGlow: 'rgba(255,255,255,0.3)',
            subtext: 'rgba(255,255,255,0.8)',
            accent: '#FF4444',
            accentGlow: 'rgba(255,68,68,0.4)',
            featureBg: 'rgba(255,255,255,0.06)',
            featureBorder: 'rgba(255,255,255,0.1)',
            featureText: '#FFFFFF',
            checkmark: '#00E676',
            checkmarkGlow: 'rgba(0,230,118,0.4)',
            ctaGradient1: '#FF4444',
            ctaGradient2: '#FF6666',
            ctaText: '#FFFFFF',
            badgeBg: 'rgba(255,68,68,0.95)',
            badgeText: '#FFFFFF',
        },
        gaming: {
            headline: '#FFFFFF',
            headlineGlow: 'rgba(0,255,255,0.3)',
            subtext: 'rgba(255,255,255,0.8)',
            accent: '#00FFFF',
            accentGlow: 'rgba(0,255,255,0.4)',
            featureBg: 'rgba(0,255,255,0.08)',
            featureBorder: 'rgba(0,255,255,0.3)',
            featureText: '#FFFFFF',
            checkmark: '#00FFFF',
            checkmarkGlow: 'rgba(0,255,255,0.5)',
            ctaGradient1: '#FF00FF',
            ctaGradient2: '#00FFFF',
            ctaText: '#FFFFFF',
            badgeBg: 'rgba(255,0,255,0.9)',
            badgeText: '#FFFFFF',
        },
        vibrant: {
            headline: '#FFFFFF',
            headlineGlow: 'rgba(236,72,153,0.3)',
            subtext: 'rgba(255,255,255,0.85)',
            accent: '#EC4899',
            accentGlow: 'rgba(236,72,153,0.4)',
            featureBg: 'rgba(255,255,255,0.1)',
            featureBorder: 'rgba(255,255,255,0.2)',
            featureText: '#FFFFFF',
            checkmark: '#34D399',
            checkmarkGlow: 'rgba(52,211,153,0.4)',
            ctaGradient1: '#EC4899',
            ctaGradient2: '#8B5CF6',
            ctaText: '#FFFFFF',
            badgeBg: 'rgba(139,92,246,0.95)',
            badgeText: '#FFFFFF',
        },
        light: {
            headline: '#1A1A2E',
            headlineGlow: 'rgba(0,0,0,0.1)',
            subtext: 'rgba(0,0,0,0.7)',
            accent: '#FF4444',
            accentGlow: 'rgba(255,68,68,0.2)',
            featureBg: 'rgba(0,0,0,0.04)',
            featureBorder: 'rgba(0,0,0,0.08)',
            featureText: '#1A1A2E',
            checkmark: '#10B981',
            checkmarkGlow: 'rgba(16,185,129,0.2)',
            ctaGradient1: '#1A1A2E',
            ctaGradient2: '#2D2D44',
            ctaText: '#FFFFFF',
            badgeBg: 'rgba(255,68,68,0.95)',
            badgeText: '#FFFFFF',
        },
    };

    const s = schemes[colorScheme] || schemes.dark;

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <!-- Premium Shadows -->
        <filter id="premium-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
        <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
            <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
        <filter id="neon-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        
        <!-- Premium Gradients -->
        <linearGradient id="cta-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${s.ctaGradient1}"/>
            <stop offset="100%" style="stop-color:${s.ctaGradient2}"/>
        </linearGradient>
        <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(255,255,255,0.15)"/>
            <stop offset="100%" style="stop-color:rgba(255,255,255,0.05)"/>
        </linearGradient>
        
        <!-- Glassmorphism effect -->
        <filter id="glassmorphism" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow"/>
            <feBlend in="SourceGraphic" in2="glow" mode="normal"/>
        </filter>
    </defs>`;

    // BADGE - Premium pill with glow
    if (badge) {
        const badgeX = width - 150;
        const badgeY = 25;
        const badgeW = 130;
        const badgeH = 36;
        svg += `
    <!-- Premium Badge -->
    <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="18" 
          fill="${s.badgeBg}" filter="url(#soft-shadow)"/>
    <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH / 2}" rx="18" 
          fill="rgba(255,255,255,0.1)"/>
    <text x="${badgeX + badgeW / 2}" y="${badgeY + 24}" 
          font-family="Inter, -apple-system, Arial, sans-serif" font-size="13" font-weight="700" 
          fill="${s.badgeText}" text-anchor="middle" letter-spacing="1.5">${escapeXml(badge.toUpperCase())}</text>`;
    }

    // HEADLINE - With subtle glow
    if (headline) {
        const headlineY = 85;
        const fontSize = headline.length > 25 ? 38 : headline.length > 18 ? 44 : 52;
        svg += `
    <!-- Premium Headline with Glow -->
    <text x="${width / 2}" y="${headlineY}" 
          font-family="Inter, -apple-system, Arial, sans-serif" font-size="${fontSize}" font-weight="800" 
          fill="${s.headlineGlow}" text-anchor="middle" filter="url(#text-glow)">${escapeXml(headline)}</text>
    <text x="${width / 2}" y="${headlineY}" 
          font-family="Inter, -apple-system, Arial, sans-serif" font-size="${fontSize}" font-weight="800" 
          fill="${s.headline}" text-anchor="middle">${escapeXml(headline)}</text>`;
    }

    // SUBHEADLINE
    if (subheadline) {
        svg += `
    <text x="${width / 2}" y="125" 
          font-family="Inter, -apple-system, Arial, sans-serif" font-size="18" font-weight="400" 
          fill="${s.subtext}" text-anchor="middle">${escapeXml(subheadline)}</text>`;
    }

    // FEATURES - Premium glassmorphism cards
    if (features.length > 0) {
        const featureStartY = 200;
        const featureSpacing = 70;
        const featureX = width - 300;
        const featureW = 280;
        const featureH = 56;

        features.slice(0, 4).forEach((feature, i) => {
            const y = featureStartY + (i * featureSpacing);

            svg += `
    <!-- Premium Feature Card ${i + 1} -->
    <rect x="${featureX}" y="${y}" width="${featureW}" height="${featureH}" rx="16" 
          fill="${s.featureBg}" stroke="${s.featureBorder}" stroke-width="1"/>
    <rect x="${featureX}" y="${y}" width="${featureW}" height="${featureH / 2}" rx="16" 
          fill="rgba(255,255,255,0.03)"/>
    <!-- Checkmark with glow -->
    <circle cx="${featureX + 32}" cy="${y + featureH / 2}" r="14" fill="${s.checkmark}" opacity="0.15"/>
    <text x="${featureX + 32}" y="${y + featureH / 2 + 6}" 
          font-family="Inter, Arial, sans-serif" font-size="18" fill="${s.checkmark}" 
          text-anchor="middle" filter="url(#neon-glow)">✓</text>
    <!-- Feature text -->
    <text x="${featureX + 60}" y="${y + featureH / 2 + 6}" 
          font-family="Inter, -apple-system, Arial, sans-serif" font-size="16" font-weight="500" 
          fill="${s.featureText}">${escapeXml(feature)}</text>`;
        });
    }

    // CTA BUTTON - Premium with gradient and shadow
    if (cta) {
        const ctaW = Math.max(cta.length * 14 + 80, 220);
        const ctaH = 56;
        const ctaX = (width - ctaW) / 2;
        const ctaY = height - 110;

        svg += `
    <!-- Premium CTA Button -->
    <rect x="${ctaX}" y="${ctaY}" width="${ctaW}" height="${ctaH}" rx="${ctaH / 2}" 
          fill="url(#cta-gradient)" filter="url(#premium-shadow)"/>
    <!-- Highlight on top -->
    <ellipse cx="${ctaX + ctaW / 2}" cy="${ctaY + 12}" rx="${ctaW * 0.35}" ry="8" 
             fill="rgba(255,255,255,0.2)"/>
    <!-- CTA Text -->
    <text x="${ctaX + ctaW / 2}" y="${ctaY + ctaH / 2 + 7}" 
          font-family="Inter, -apple-system, Arial, sans-serif" font-size="18" font-weight="700" 
          fill="${s.ctaText}" text-anchor="middle" letter-spacing="0.5">${escapeXml(cta)}</text>`;
    }

    svg += `\n</svg>`;

    return svg;
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Get background prompt by style
 */
export function getPremiumBackgroundPrompt(style, options = {}) {
    const bg = PREMIUM_BACKGROUNDS[style] || PREMIUM_BACKGROUNDS.dark_premium;
    let prompt = bg.prompt;

    // Add product zone specification based on layout
    if (options.productZone) {
        const pz = options.productZone;
        prompt += `\n\nPRODUCT ZONE: The area from ${Math.round(pz.x * 100)}% to ${Math.round((pz.x + pz.width) * 100)}% horizontally and ${Math.round(pz.y * 100)}% to ${Math.round((pz.y + pz.height) * 100)}% vertically should have subtle highlights and be ready for product placement.`;
    }

    return prompt;
}

/**
 * Detect best background style for product
 */
export function detectBestBackgroundStyle(options) {
    const { industry, tone, isGaming, isNatural, isMinimal, isVibrant } = options;

    if (isGaming || industry === 'gaming' || industry === 'tech') {
        return 'gaming_rgb';
    }

    if (isNatural || industry === 'organic' || industry === 'eco') {
        return 'nature_organic';
    }

    if (isMinimal || tone === 'minimal') {
        return 'clean_minimal';
    }

    if (isVibrant || tone === 'playful') {
        return 'gradient_mesh';
    }

    // Default: premium dark works for everything
    return 'dark_premium';
}

/**
 * Get color scheme for overlay based on background
 */
export function getColorSchemeForBackground(backgroundStyle) {
    const mapping = {
        'dark_premium': 'dark',
        'gaming_rgb': 'gaming',
        'warm_lifestyle': 'dark',
        'clean_minimal': 'light',
        'gradient_mesh': 'vibrant',
        'nature_organic': 'dark',
    };

    return mapping[backgroundStyle] || 'dark';
}

export default {
    PREMIUM_BACKGROUNDS,
    createPremiumOverlaySVG,
    getPremiumBackgroundPrompt,
    detectBestBackgroundStyle,
    getColorSchemeForBackground,
};
