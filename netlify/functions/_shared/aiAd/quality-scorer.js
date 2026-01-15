/**
 * AI Ad Builder - Quality Scorer
 * Validates and scores generated ad content
 */

/**
 * Score ad quality on a scale of 1-10
 * @param {Object} adContent - Generated ad content
 * @returns {Object} Quality score and issues
 */
export function scoreAdQuality(adContent) {
    const { headline, slogan, description, cta, imagePrompt } = adContent;

    let score = 10;
    const issues = [];

    // Check headline
    if (!headline || headline.length === 0) {
        score -= 3;
        issues.push('Missing headline');
    } else if (headline.length > 60) {
        score -= 1;
        issues.push('Headline too long (>60 chars)');
    } else if (headline.length < 10) {
        score -= 1;
        issues.push('Headline too short (<10 chars)');
    }

    // Check for all caps (looks spammy)
    if (headline === headline.toUpperCase() && headline.length > 5) {
        score -= 0.5;
        issues.push('Headline is all caps');
    }

    // Check slogan
    if (!slogan || slogan.length === 0) {
        score -= 2;
        issues.push('Missing slogan');
    } else if (slogan.length > 40) {
        score -= 1;
        issues.push('Slogan too long (>40 chars)');
    }

    // Check description
    if (!description || description.length === 0) {
        score -= 2;
        issues.push('Missing description');
    } else if (description.length > 200) {
        score -= 1;
        issues.push('Description too long (>200 chars)');
    } else if (description.length < 20) {
        score -= 1;
        issues.push('Description too short (<20 chars)');
    }

    // Check CTA
    if (!cta || cta.length === 0) {
        score -= 2;
        issues.push('Missing CTA');
    } else if (cta.length > 30) {
        score -= 0.5;
        issues.push('CTA too long (>30 chars)');
    }

    // Check image prompt
    if (!imagePrompt || imagePrompt.length === 0) {
        score -= 1;
        issues.push('Missing image prompt');
    } else if (imagePrompt.length < 20) {
        score -= 1;
        issues.push('Image prompt too vague (<20 chars)');
    }

    // Check for repetition between fields
    if (headline && slogan && headline.toLowerCase() === slogan.toLowerCase()) {
        score -= 1;
        issues.push('Headline and slogan are identical');
    }

    // Check for keyword stuffing (same word repeated 3+ times)
    const checkKeywordStuffing = (text) => {
        if (!text) return false;
        const words = text.toLowerCase().split(/\s+/);
        const wordCounts = {};
        for (const word of words) {
            if (word.length > 3) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
                if (wordCounts[word] >= 3) return true;
            }
        }
        return false;
    };

    if (checkKeywordStuffing(headline) || checkKeywordStuffing(description)) {
        score -= 1;
        issues.push('Keyword stuffing detected');
    }

    // Ensure score is within bounds
    score = Math.max(1, Math.min(10, score));

    return {
        score: Math.round(score * 10) / 10, // Round to 1 decimal
        issues,
        passed: score >= 7, // Quality threshold
    };
}

/**
 * Validate ad content structure
 */
export function validateAdContent(adContent) {
    const requiredFields = ['headline', 'slogan', 'description', 'cta', 'imagePrompt'];
    const missing = requiredFields.filter(field => !adContent[field]);

    if (missing.length > 0) {
        throw new Error(`Invalid ad content: missing fields ${missing.join(', ')}`);
    }

    // Check types
    for (const field of requiredFields) {
        if (typeof adContent[field] !== 'string') {
            throw new Error(`Invalid ad content: ${field} must be a string`);
        }
    }

    return true;
}

/**
 * Calculate engagement prediction score
 */
export function predictEngagement(adContent, targetAudience) {
    let score = 5.0; // Base score

    // Headline factors
    if (adContent.headline) {
        // Question marks increase engagement
        if (adContent.headline.includes('?')) score += 0.3;

        // Numbers increase credibility
        if (/\d+/.test(adContent.headline)) score += 0.2;

        // Urgency words
        const urgencyWords = ['jetzt', 'now', 'heute', 'today', 'limited', 'begrenzt'];
        if (urgencyWords.some(word => adContent.headline.toLowerCase().includes(word))) {
            score += 0.3;
        }
    }

    // Description factors
    if (adContent.description) {
        // Benefit-focused language
        const benefitWords = ['sparen', 'save', 'kostenlos', 'free', 'garantie', 'guarantee'];
        if (benefitWords.some(word => adContent.description.toLowerCase().includes(word))) {
            score += 0.2;
        }
    }

    // CTA factors
    if (adContent.cta) {
        // Action verbs increase click-through
        const actionVerbs = ['start', 'get', 'buy', 'try', 'discover', 'kaufen', 'testen'];
        if (actionVerbs.some(verb => adContent.cta.toLowerCase().includes(verb))) {
            score += 0.2;
        }
    }

    return Math.min(10, Math.max(1, score));
}
