/**
 * Platform Optimization Engine
 * Platform-specific best practices for Meta, Instagram, Stories, Reels
 * Adapts ads for maximum performance on each platform
 */

/**
 * Platform Specifications and Best Practices
 */
export const PLATFORMS = {
    // ========================================
    // INSTAGRAM FEED
    // ========================================
    instagram_feed: {
        id: 'instagram_feed',
        name: 'Instagram Feed',

        technical: {
            aspectRatios: ['1:1', '4:5'],
            recommendedRatio: '1:1',
            resolution: { width: 1080, height: 1080 },
            maxFileSize: '30MB',
            formats: ['JPG', 'PNG'],
        },

        creative: {
            textOnImage: {
                limit: '20% of image',
                placement: 'Top or bottom, clear of face height',
                size: 'Large enough to read on mobile (min 24pt equivalent)',
            },
            colorBrightness: 'Vibrant colors perform +30%',
            facePresence: 'Human faces increase engagement by 38%',
            productVisibility: 'Product should be 40-60% of frame',
        },

        copy: {
            primaryTextLimit: 125, // Before "...more"
            primaryTextMax: 2200,
            headlineLimit: 40,
            captionStyle: 'Conversational, emoji-friendly',
            hashtagCount: '3-5 relevant hashtags',
        },

        bestPractices: [
            'Lead with the hook in first 3 words',
            'Use emojis strategically (2-3 per caption)',
            'Include clear CTA in image and caption',
            'Bright, high-contrast images outperform',
            'Show product in lifestyle context',
        ],

        avoid: [
            'Too much text on image (reduces reach)',
            'Dark/low-contrast images',
            'Generic stock photos',
            'Clickbait that doesn\'t deliver',
        ],

        promptEnhancement: `INSTAGRAM FEED OPTIMIZATION:
- 1:1 square format, mobile-optimized
- Vibrant, high-contrast colors (Instagram rewards engagement)
- Product clearly visible (40-60% of frame)
- Minimal text overlay (under 20% of image)
- Scroll-stopping in first 0.5 seconds
- Lifestyle context with aspirational feel`,
    },

    // ========================================
    // INSTAGRAM STORIES
    // ========================================
    instagram_stories: {
        id: 'instagram_stories',
        name: 'Instagram Stories',

        technical: {
            aspectRatios: ['9:16'],
            recommendedRatio: '9:16',
            resolution: { width: 1080, height: 1920 },
            maxDuration: '15s per story',
            safeZone: 'Avoid top 150px and bottom 250px for UI elements',
        },

        creative: {
            textOnImage: {
                limit: 'Less is more',
                placement: 'Center-middle safe zone',
                size: 'Bold, readable in 1 second',
            },
            motion: 'Static or subtle motion preferred',
            cta: 'Swipe up/Link sticker must be prominent',
            branding: 'Logo in first 2 seconds',
        },

        copy: {
            textOnScreen: '5-7 words max',
            style: 'Punchy, immediate, urgent',
        },

        bestPractices: [
            'Hook in first 0.5 seconds',
            'Sound-off design (most watch muted)',
            'Use native Instagram stickers for authenticity',
            'Create sense of urgency',
            'Make swipe-up compellingly clear',
        ],

        avoid: [
            'Walls of text',
            'Slow reveals',
            'Audio-dependent content',
            'Text in top/bottom UI zones',
        ],

        promptEnhancement: `INSTAGRAM STORIES OPTIMIZATION:
- Vertical 9:16 format
- Content centered in middle 60% (safe zone)
- Avoid top 150px and bottom 250px
- Bold, minimal text (5-7 words max)
- Immediate hook - no build-up
- Designed to be viewed for 2-3 seconds`,
    },

    // ========================================
    // FACEBOOK FEED
    // ========================================
    facebook_feed: {
        id: 'facebook_feed',
        name: 'Facebook Feed',

        technical: {
            aspectRatios: ['1:1', '4:5', '16:9'],
            recommendedRatio: '4:5',
            resolution: { width: 1080, height: 1350 },
            maxFileSize: '30MB',
        },

        creative: {
            textOnImage: {
                limit: 'Minimal (algorithm penalizes heavy text)',
                placement: 'Clear, centered',
            },
            trustSignals: 'Reviews, ratings, badges perform well',
            demographic: 'Older audience - clarity over trendiness',
        },

        copy: {
            primaryTextLimit: 125,
            headlineLimit: 40,
            descriptionLimit: 30,
            captionStyle: 'Informative, benefits-focused',
        },

        bestPractices: [
            'Clear value proposition in headline',
            'Social proof (reviews, numbers)',
            'Benefit-focused messaging',
            'Clear, unambiguous CTA',
            'Trust signals for conversion',
        ],

        avoid: [
            'Youth slang/trends (older demo)',
            'Excessive emojis',
            'Vague messaging',
            'Missing social proof',
        ],

        promptEnhancement: `FACEBOOK FEED OPTIMIZATION:
- 4:5 vertical format preferred
- Clear, benefit-focused messaging
- Include trust signals (ratings, reviews, badges)
- Professional, polished aesthetic
- Minimal text overlay
- Strong CTA visibility`,
    },

    // ========================================
    // FACEBOOK/INSTAGRAM REELS
    // ========================================
    reels: {
        id: 'reels',
        name: 'Reels (FB/IG)',

        technical: {
            aspectRatios: ['9:16'],
            recommendedRatio: '9:16',
            resolution: { width: 1080, height: 1920 },
            maxDuration: '90s',
            optimalDuration: '15-30s',
        },

        creative: {
            hooks: 'First 3 seconds critical',
            style: 'Native, UGC-feel outperforms polished',
            transitions: 'Jump cuts, trend-aware',
            sound: 'Trending audio boosts reach',
        },

        copy: {
            textOnScreen: 'Short captions, trend-aware',
            captionStyle: 'Hook + payoff in text',
        },

        bestPractices: [
            'UGC/authentic feel outperforms polished',
            'Use trending sounds/effects',
            'Front-load the hook (0-3 seconds)',
            'Keep it fast-paced',
            'Native feel > ad feel',
        ],

        avoid: [
            'Obviously polished ads',
            'Slow pacing',
            'No hook opening',
            'Ignoring trends',
        ],

        promptEnhancement: `REELS OPTIMIZATION:
- Vertical 9:16 format
- UGC authentic aesthetic (NOT polished ad)
- Hook immediately (first frame matters)
- Fast-paced, trend-aware
- Sound-on designed but works silent too`,
    },

    // ========================================
    // CAROUSEL ADS
    // ========================================
    carousel: {
        id: 'carousel',
        name: 'Carousel',

        technical: {
            aspectRatios: ['1:1'],
            recommendedRatio: '1:1',
            resolution: { width: 1080, height: 1080 },
            cardCount: '2-10 cards',
            optimalCards: '3-5',
        },

        creative: {
            firstCard: 'Hook + CTA (standalone power)',
            middleCards: 'Benefits/features one-by-one',
            lastCard: 'Strong CTA + urgency',
            consistency: 'Visual cohesion across cards',
        },

        copy: {
            headlinePerCard: 40,
            style: 'Progressive story or distinct benefits',
        },

        bestPractices: [
            'First card must work as standalone',
            'Create swipe curiosity',
            'One benefit per card',
            'Visual consistency (colors, style)',
            'Strong CTA on last card',
        ],

        avoid: [
            'Weak first card',
            'Random card ordering',
            'Visual inconsistency',
            'No final CTA',
        ],

        promptEnhancement: `CAROUSEL CARD OPTIMIZATION:
- 1:1 square format
- This is CARD [X] of a carousel
- Visual consistency with other cards
- Clear singular message per card
- If FIRST card: maximum hook power
- If LAST card: strong CTA`,
    },
};

/**
 * Get platform by ID
 */
export function getPlatform(platformId) {
    return PLATFORMS[platformId] || PLATFORMS.instagram_feed;
}

/**
 * Get all platforms
 */
export function getAllPlatforms() {
    return Object.values(PLATFORMS);
}

/**
 * Recommend platform based on product and goal
 */
export function recommendPlatform(options) {
    const { targetAgeRange, industry, goal, hasVideo } = options;

    // Younger audience = Stories/Reels
    if (targetAgeRange && (targetAgeRange.includes('16') || targetAgeRange.includes('18-24'))) {
        return hasVideo ? PLATFORMS.reels : PLATFORMS.instagram_stories;
    }

    // Older audience = Facebook
    if (targetAgeRange && (targetAgeRange.includes('45') || targetAgeRange.includes('55+'))) {
        return PLATFORMS.facebook_feed;
    }

    // Default to Instagram Feed (highest engagement)
    return PLATFORMS.instagram_feed;
}

/**
 * Build platform-optimized prompt section
 */
export function buildPlatformPrompt(platformId) {
    const platform = getPlatform(platformId);
    return platform.promptEnhancement + `

TECHNICAL REQUIREMENTS:
- Aspect Ratio: ${platform.technical.recommendedRatio}
- Resolution: ${platform.technical.resolution.width}x${platform.technical.resolution.height}
- Best Practices: ${platform.bestPractices.slice(0, 3).join(', ')}
`;
}

/**
 * Get safe zones for platform
 */
export function getSafeZones(platformId) {
    const platform = getPlatform(platformId);

    if (platformId === 'instagram_stories' || platformId === 'reels') {
        return {
            topUnsafe: 150,
            bottomUnsafe: 250,
            safeArea: 'Center 60% of vertical space',
        };
    }

    return {
        topUnsafe: 0,
        bottomUnsafe: 0,
        safeArea: 'Full frame usable',
    };
}
