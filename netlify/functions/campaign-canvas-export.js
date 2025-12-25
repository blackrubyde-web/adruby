const { ok, badRequest, serverError, unauthorized } = require('./utils/response');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return badRequest('Method not allowed');
    }

    try {
        const { campaigns } = JSON.parse(event.body || '{}');

        if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
            return badRequest('Missing campaigns array');
        }

        // TODO: Integrate with Meta Marketing API
        // For now, return a mock success with the transformed payload

        const metaPayload = campaigns.map(c => ({
            campaign: {
                name: c.campaign?.name || 'Campaign',
                objective: mapObjectiveToMeta(c.campaign?.objective),
                special_ad_categories: [],
                status: 'PAUSED', // Start paused for safety
                daily_budget: c.campaign?.daily_budget ? c.campaign.daily_budget * 100 : 5000, // Convert to cents
                bid_strategy: mapBidStrategy(c.campaign?.bid_strategy),
            },
            adsets: (c.ad_sets || []).map(as => ({
                name: as.name || 'Ad Set',
                optimization_goal: as.optimization_goal || 'CONVERSIONS',
                billing_event: 'IMPRESSIONS',
                targeting: {
                    geo_locations: {
                        countries: as.targeting?.locations || ['DE'],
                    },
                    age_min: as.targeting?.ageMin || 18,
                    age_max: as.targeting?.ageMax || 65,
                    genders: mapGender(as.targeting?.gender),
                    publisher_platforms: mapPlacements(as.targeting?.placements),
                },
                ads: (as.ads || []).map(ad => ({
                    name: ad.name || 'Ad',
                    creative: {
                        title: ad.headline || '',
                        body: ad.primary_text || '',
                        call_to_action_type: mapCTA(ad.cta),
                        // image_hash would come from creative upload
                    },
                })),
            })),
        }));

        // In production, this would call Meta API
        // const response = await fetch(`https://graph.facebook.com/v18.0/act_${adAccountId}/campaigns`, {...});

        return ok({
            success: true,
            message: 'Campaign export prepared successfully',
            preview: metaPayload,
            note: 'Meta API integration requires connected ad account. Campaign saved as draft.',
        });
    } catch (err) {
        console.error('[campaign-canvas-export] Error:', err);
        return serverError(err.message);
    }
};

function mapObjectiveToMeta(objective) {
    const map = {
        'CONVERSIONS': 'OUTCOME_SALES',
        'TRAFFIC': 'OUTCOME_TRAFFIC',
        'AWARENESS': 'OUTCOME_AWARENESS',
        'ENGAGEMENT': 'OUTCOME_ENGAGEMENT',
        'LEADS': 'OUTCOME_LEADS',
        'APP_INSTALLS': 'OUTCOME_APP_PROMOTION',
    };
    return map[objective] || 'OUTCOME_SALES';
}

function mapBidStrategy(strategy) {
    const map = {
        'LOWEST_COST': 'LOWEST_COST_WITHOUT_CAP',
        'COST_CAP': 'COST_CAP',
        'BID_CAP': 'LOWEST_COST_WITH_BID_CAP',
        'MINIMUM_ROAS': 'LOWEST_COST_WITH_MIN_ROAS',
    };
    return map[strategy] || 'LOWEST_COST_WITHOUT_CAP';
}

function mapGender(gender) {
    if (gender === 'male') return [1];
    if (gender === 'female') return [2];
    return [1, 2]; // all
}

function mapPlacements(placements) {
    if (!placements || placements.length === 0) return ['facebook', 'instagram'];
    const map = {
        'feed': 'facebook',
        'stories': 'instagram',
        'reels': 'instagram',
        'explore': 'instagram',
        'audience_network': 'audience_network',
    };
    return [...new Set(placements.map(p => map[p] || 'facebook'))];
}

function mapCTA(cta) {
    const map = {
        'Learn More': 'LEARN_MORE',
        'Shop Now': 'SHOP_NOW',
        'Sign Up': 'SIGN_UP',
        'Get Offer': 'GET_OFFER',
        'Book Now': 'BOOK_NOW',
        'Contact Us': 'CONTACT_US',
    };
    return map[cta] || 'LEARN_MORE';
}
