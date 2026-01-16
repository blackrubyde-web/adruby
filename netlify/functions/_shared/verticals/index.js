/**
 * Verticals Index - Central export for all vertical modules
 */

// Core Vertical Modules
export * from './ecommerceIntelligence.js';
export * from './saasIntelligence.js';
export * from './insuranceFinanceIntelligence.js';
export * from './coachingIntelligence.js';
export * from './courseSellerIntelligence.js';
export * from './dropshippingIntelligence.js';
export * from './agencyIntelligence.js';

// Additional Verticals
export * from './additionalVerticals1.js';
export * from './additionalVerticals2.js';

// Psychology & Strategy Modules
export * from './pricePsychology.js';
export * from './objectionHandler.js';
export * from './retargetingIntelligence.js';

// Master Integration
export * from './ultimateMasterEngine.js';

/**
 * Quick reference of all available verticals
 */
export const AVAILABLE_VERTICALS = [
    // E-Commerce & Retail
    { id: 'ecommerce', name: 'E-Commerce', categories: ['fashion', 'beauty', 'electronics', 'home', 'food_dtc', 'supplements'] },
    { id: 'dropshipping', name: 'Dropshipping', categories: ['gadgets', 'fashion', 'home', 'pet', 'beauty'] },
    { id: 'subscription', name: 'Subscription Box', categories: ['beauty', 'food', 'lifestyle', 'niche'] },

    // Digital Products & Services
    { id: 'saas', name: 'SaaS & Software', models: ['freemium', 'free_trial', 'demo_request', 'direct_purchase'] },
    { id: 'course', name: 'Course Seller', types: ['signature_course', 'mini_course', 'membership', 'certification', 'digital_product'] },
    { id: 'app', name: 'App Download', types: ['utility', 'social', 'gaming', 'productivity'] },
    { id: 'leadmagnet', name: 'Lead Magnet', types: ['ebook', 'checklist', 'template', 'quiz', 'minicourse'] },
    { id: 'webinar', name: 'Webinar/VSL', types: ['educational', 'reveal', 'case_study'] },

    // Professional Services
    { id: 'coaching', name: 'Coaching', niches: ['business_coach', 'life_coach', 'fitness_coach', 'career_coach', 'relationship_coach'] },
    { id: 'agency', name: 'Web Design/Agency', services: ['web_design', 'branding', 'marketing', 'ecommerce', 'seo'] },
    { id: 'insurance', name: 'Insurance/Finance', products: ['life_insurance', 'health_insurance', 'auto_insurance', 'business_insurance', 'investment', 'loans'] },
    { id: 'healthcare', name: 'Healthcare', types: ['dental', 'medical', 'wellness', 'aesthetic'] },

    // Local & Physical
    { id: 'realestate', name: 'Real Estate', types: ['residential', 'investment', 'luxury', 'agent_branding'] },
    { id: 'local', name: 'Local Business', types: ['restaurant', 'service', 'retail', 'fitness'] },
    { id: 'event', name: 'Events/Tickets', types: ['conference', 'concert', 'workshop', 'virtual'] },

    // B2B
    { id: 'b2b', name: 'B2B Enterprise', stages: ['awareness', 'consideration', 'decision'], personas: ['executive', 'manager', 'technical'] },
];

/**
 * Quick reference of all strategy modules
 */
export const STRATEGY_MODULES = [
    { id: 'pricePsychology', name: 'Price Psychology', tactics: 7 },
    { id: 'objectionHandler', name: 'Objection Handler', objections: 6, guarantees: 5 },
    { id: 'retargeting', name: 'Retargeting', segments: 6 },
];

/**
 * System statistics
 */
export const SYSTEM_STATS = {
    totalVerticals: 16,
    totalCategories: 50,
    totalFrameworks: 7,
    totalPersonas: 8,
    totalLayouts: 30,
    totalIndustries: 15,
    totalArchetypes: 8,
    totalPlatforms: 5,
    totalPricingTactics: 7,
    totalObjectionHandlers: 6,
    totalRetargetingSegments: 6,
    totalModules: 28,
    linesOfCode: '10,000+',
};

console.log('[Verticals] All modules loaded. System stats:', SYSTEM_STATS);
