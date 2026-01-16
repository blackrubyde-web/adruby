/**
 * Seasonal & Trend Intelligence
 * Holidays, events, seasons, and current design trends
 * Adapts ad creative to timely context
 */

/**
 * Seasonal Calendar - Key dates for advertising
 */
export const SEASONAL_CALENDAR = {
    // Q1
    new_year: {
        id: 'new_year',
        name: 'New Year / New Beginnings',
        dateRange: { start: '01-01', end: '01-15' },
        themes: ['fresh start', 'resolution', 'transformation', 'goals'],
        colors: ['#FFD700', '#FFFFFF', '#1A1A1A'],
        headlines: [
            'New Year, New You',
            'Start [Year] right',
            'Your best year starts now',
        ],
        industries: ['fitness', 'health', 'education', 'saas'],
    },
    valentines: {
        id: 'valentines',
        name: 'Valentine\'s Day',
        dateRange: { start: '02-01', end: '02-14' },
        themes: ['love', 'romance', 'gifts', 'self-love'],
        colors: ['#FF6B6B', '#FF69B4', '#FFD700', '#FFFFFF'],
        headlines: [
            'Perfect gift for your love',
            'Treat yourself',
            'Show them you care',
        ],
        industries: ['beauty', 'jewelry', 'fashion', 'flowers', 'food'],
    },

    // Q2
    spring: {
        id: 'spring',
        name: 'Spring / Easter',
        dateRange: { start: '03-15', end: '04-30' },
        themes: ['renewal', 'fresh', 'outdoor', 'cleaning'],
        colors: ['#98FB98', '#FFB6C1', '#87CEEB', '#FFFACD'],
        headlines: [
            'Spring into action',
            'Fresh start this season',
            'Refresh your [X]',
        ],
        industries: ['home', 'garden', 'fashion', 'health'],
    },
    mothers_day: {
        id: 'mothers_day',
        name: 'Mother\'s Day',
        dateRange: { start: '05-01', end: '05-12' },
        themes: ['appreciation', 'love', 'care', 'pampering'],
        colors: ['#FFB6C1', '#FF69B4', '#FFD700'],
        headlines: [
            'For the mom who deserves everything',
            'Thank you, Mom',
            'She\'ll love it',
        ],
        industries: ['beauty', 'jewelry', 'home', 'flowers', 'wellness'],
    },

    // Q3
    summer: {
        id: 'summer',
        name: 'Summer',
        dateRange: { start: '06-01', end: '08-31' },
        themes: ['fun', 'outdoor', 'vacation', 'energy'],
        colors: ['#FFD700', '#FF6347', '#00CED1', '#32CD32'],
        headlines: [
            'Summer essentials',
            'Made for summer',
            'Hot days, cool [product]',
        ],
        industries: ['travel', 'fashion', 'food', 'fitness', 'outdoor'],
    },
    back_to_school: {
        id: 'back_to_school',
        name: 'Back to School',
        dateRange: { start: '08-01', end: '09-15' },
        themes: ['preparation', 'fresh start', 'organization', 'learning'],
        colors: ['#FF6347', '#4169E1', '#FFD700'],
        headlines: [
            'Ready for school',
            'Start the year prepared',
            'Level up this semester',
        ],
        industries: ['education', 'tech', 'fashion', 'supplies'],
    },

    // Q4
    fall: {
        id: 'fall',
        name: 'Fall / Autumn',
        dateRange: { start: '09-15', end: '11-15' },
        themes: ['cozy', 'warm', 'harvest', 'gratitude'],
        colors: ['#FF8C00', '#8B4513', '#DAA520', '#800000'],
        headlines: [
            'Fall favorites',
            'Cozy season is here',
            'Embrace the season',
        ],
        industries: ['home', 'fashion', 'food', 'beauty'],
    },
    black_friday: {
        id: 'black_friday',
        name: 'Black Friday / Cyber Monday',
        dateRange: { start: '11-20', end: '12-02' },
        themes: ['deals', 'savings', 'biggest sale', 'limited'],
        colors: ['#1A1A1A', '#FF0000', '#FFD700', '#FFFFFF'],
        headlines: [
            'Biggest sale of the year',
            'Black Friday: Up to [X]% off',
            'Don\'t miss out',
        ],
        industries: ['all'],
        urgency: 'extreme',
    },
    christmas: {
        id: 'christmas',
        name: 'Christmas / Holidays',
        dateRange: { start: '12-01', end: '12-25' },
        themes: ['giving', 'joy', 'family', 'magic'],
        colors: ['#FF0000', '#00FF00', '#FFD700', '#FFFFFF'],
        headlines: [
            'The perfect gift',
            'Make their holiday',
            'Spread the joy',
        ],
        industries: ['all'],
    },
    end_of_year: {
        id: 'end_of_year',
        name: 'End of Year Sale',
        dateRange: { start: '12-26', end: '12-31' },
        themes: ['clearance', 'last chance', 'new year prep'],
        colors: ['#1A1A1A', '#FF0000', '#FFD700'],
        headlines: [
            'End of year clearance',
            'Last chance this year',
            'Start fresh next year',
        ],
        industries: ['all'],
    },
};

/**
 * Design Trends - Current and emerging styles
 */
export const DESIGN_TRENDS = {
    glassmorphism: {
        id: 'glassmorphism',
        name: 'Glassmorphism',
        description: 'Frosted glass effect with blur and transparency',
        currentRelevance: 'high',
        promptEnhancement: 'frosted glass effect elements, subtle blur, transparent overlays, modern tech aesthetic',
        industries: ['tech', 'saas', 'finance', 'apps'],
    },
    neomorphism: {
        id: 'neomorphism',
        name: 'Neomorphism',
        description: 'Soft UI with subtle shadows creating 3D effect',
        currentRelevance: 'medium',
        promptEnhancement: 'soft shadows, subtle 3D depth, extruded or inset elements, minimal color palette',
        industries: ['tech', 'apps', 'minimal'],
    },
    brutalism: {
        id: 'brutalism',
        name: 'Brutalism',
        description: 'Raw, bold, intentionally unpolished design',
        currentRelevance: 'emerging',
        promptEnhancement: 'bold raw typography, high contrast, intentionally rough aesthetic, anti-design elements',
        industries: ['fashion', 'creative', 'music', 'youth'],
    },
    maximalism: {
        id: 'maximalism',
        name: 'Maximalism',
        description: 'More is more - rich textures, patterns, colors',
        currentRelevance: 'medium',
        promptEnhancement: 'rich patterns, bold colors, layered textures, eclectic mix of elements',
        industries: ['fashion', 'lifestyle', 'home', 'creative'],
    },
    organic_shapes: {
        id: 'organic_shapes',
        name: 'Organic Shapes',
        description: 'Blob shapes, natural curves, flowing forms',
        currentRelevance: 'high',
        promptEnhancement: 'organic blob shapes, flowing curves, natural asymmetry, soft edges',
        industries: ['wellness', 'beauty', 'eco', 'lifestyle'],
    },
    anti_design: {
        id: 'anti_design',
        name: 'Anti-Design',
        description: 'Intentionally breaking design rules',
        currentRelevance: 'emerging',
        promptEnhancement: 'intentionally chaotic layout, mixed fonts, overlapping elements, rule-breaking aesthetic',
        industries: ['creative', 'music', 'youth', 'streetwear'],
    },
    y2k_revival: {
        id: 'y2k_revival',
        name: 'Y2K Revival',
        description: 'Early 2000s aesthetic - chrome, gradients, tech optimism',
        currentRelevance: 'high',
        promptEnhancement: 'chrome metallic elements, holographic effects, early 2000s futurism, bubble shapes',
        industries: ['fashion', 'beauty', 'youth', 'tech'],
    },
    ai_art_style: {
        id: 'ai_art_style',
        name: 'AI-Generated Art Style',
        description: 'Dreamy, surreal, digitally-enhanced aesthetic',
        currentRelevance: 'high',
        promptEnhancement: 'surreal dreamy aesthetic, digitally enhanced, hyper-detailed, otherworldly quality',
        industries: ['creative', 'tech', 'luxury', 'conceptual'],
    },
};

/**
 * Get current season
 */
export function getCurrentSeason() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const currentDate = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    for (const [id, season] of Object.entries(SEASONAL_CALENDAR)) {
        const { start, end } = season.dateRange;

        // Handle year wraparound (e.g., Christmas to New Year)
        if (start > end) {
            if (currentDate >= start || currentDate <= end) {
                return season;
            }
        } else {
            if (currentDate >= start && currentDate <= end) {
                return season;
            }
        }
    }

    // Default seasons by month
    if (month >= 3 && month <= 5) return SEASONAL_CALENDAR.spring;
    if (month >= 6 && month <= 8) return SEASONAL_CALENDAR.summer;
    if (month >= 9 && month <= 11) return SEASONAL_CALENDAR.fall;
    return SEASONAL_CALENDAR.christmas; // Winter default
}

/**
 * Get upcoming seasons (next 30 days)
 */
export function getUpcomingSeasons() {
    const now = new Date();
    const upcoming = [];

    for (let i = 0; i <= 30; i++) {
        const checkDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        const month = checkDate.getMonth() + 1;
        const day = checkDate.getDate();
        const dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        for (const [id, season] of Object.entries(SEASONAL_CALENDAR)) {
            if (season.dateRange.start === dateStr) {
                upcoming.push({
                    ...season,
                    daysUntil: i,
                });
            }
        }
    }

    return upcoming;
}

/**
 * Recommend design trends for industry
 */
export function recommendTrends(industry) {
    const trends = [];

    for (const [id, trend] of Object.entries(DESIGN_TRENDS)) {
        if (trend.industries.includes(industry) && trend.currentRelevance !== 'low') {
            trends.push(trend);
        }
    }

    // Sort by relevance
    const relevanceOrder = { high: 0, medium: 1, emerging: 2, low: 3 };
    trends.sort((a, b) => relevanceOrder[a.currentRelevance] - relevanceOrder[b.currentRelevance]);

    return trends;
}

/**
 * Build seasonal prompt enhancement
 */
export function buildSeasonalPrompt(seasonId) {
    const season = SEASONAL_CALENDAR[seasonId] || getCurrentSeason();

    return `
SEASONAL CONTEXT:
- Season: ${season.name}
- Themes: ${season.themes.join(', ')}
- Suggested Colors: ${season.colors.join(', ')}
- Suggested Headlines: ${season.headlines.slice(0, 2).join(' | ')}
- Apply subtle seasonal elements without overwhelming product focus
`;
}

/**
 * Build trend prompt enhancement
 */
export function buildTrendPrompt(trendId) {
    const trend = DESIGN_TRENDS[trendId];
    if (!trend) return '';

    return `
DESIGN TREND: ${trend.name}
${trend.promptEnhancement}
`;
}
