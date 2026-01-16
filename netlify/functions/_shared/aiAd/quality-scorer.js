/**
 * AI Ad Builder - Premium Quality Scorer
 * Enterprise-grade validation with auto-fix suggestions and comprehensive scoring
 */

/**
 * Comprehensive ad quality scoring (1-10)
 * Returns score, issues, suggestions, and whether it passes the threshold
 */
export function scoreAdQuality(adContent) {
    const { headline, slogan, description, cta, imagePrompt } = adContent;

    let score = 10;
    const issues = [];
    const suggestions = [];
    const metrics = {};

    // ═══════════════════════════════════════════════════════════════
    // HEADLINE SCORING (max -4 points)
    // ═══════════════════════════════════════════════════════════════
    metrics.headline = { length: headline?.length || 0 };

    if (!headline || headline.length === 0) {
        score -= 4;
        issues.push('Missing headline');
    } else {
        // Length checks
        if (headline.length > 60) {
            score -= 1.5;
            issues.push('Headline too long (>60 chars)');
            suggestions.push('Shorten headline to under 60 characters for better readability');
        } else if (headline.length < 10) {
            score -= 1;
            issues.push('Headline too short (<10 chars)');
            suggestions.push('Expand headline to at least 10 characters');
        }

        // All caps check (spammy)
        if (headline === headline.toUpperCase() && headline.length > 5) {
            score -= 0.5;
            issues.push('Headline is all caps (looks spammy)');
            suggestions.push('Use sentence case or title case instead of all caps');
        }

        // Generic headline detection
        const genericPhrases = [
            'das beste', 'the best', 'für sie', 'for you',
            'jetzt kaufen', 'buy now', 'klicken sie', 'click here',
            'amazing', 'incredible', 'unglaublich'
        ];
        if (genericPhrases.some(phrase => headline.toLowerCase().includes(phrase))) {
            score -= 0.5;
            issues.push('Headline contains generic phrases');
            suggestions.push('Replace generic phrases with specific benefits');
        }

        // Number/statistic bonus (increases credibility)
        if (/\d+/.test(headline)) {
            score += 0.3;
            metrics.headline.hasNumber = true;
        }

        // Question mark bonus (increases engagement)
        if (headline.includes('?')) {
            score += 0.2;
            metrics.headline.hasQuestion = true;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // SLOGAN SCORING (max -2 points)
    // ═══════════════════════════════════════════════════════════════
    metrics.slogan = { length: slogan?.length || 0 };

    if (!slogan || slogan.length === 0) {
        score -= 2;
        issues.push('Missing slogan');
    } else {
        if (slogan.length > 40) {
            score -= 1;
            issues.push('Slogan too long (>40 chars)');
            suggestions.push('Condense slogan to under 40 characters for memorability');
        }

        if (slogan.length < 5) {
            score -= 0.5;
            issues.push('Slogan too short');
        }

        // Duplicate check
        if (headline && slogan.toLowerCase() === headline.toLowerCase()) {
            score -= 1;
            issues.push('Slogan is identical to headline');
            suggestions.push('Create a unique, memorable slogan that complements the headline');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // DESCRIPTION SCORING (max -3 points)
    // ═══════════════════════════════════════════════════════════════
    metrics.description = { length: description?.length || 0 };

    if (!description || description.length === 0) {
        score -= 3;
        issues.push('Missing description');
    } else {
        // Length checks
        if (description.length > 200) {
            score -= 1;
            issues.push('Description too long (>200 chars)');
            suggestions.push('Trim description to under 200 characters');
        } else if (description.length < 30) {
            score -= 1;
            issues.push('Description too short (<30 chars)');
            suggestions.push('Expand description with benefits and social proof');
        }

        // Social proof detection (numbers, percentages, testimonial indicators)
        const hasSocialProof = /\d+/.test(description) ||
            description.includes('%') ||
            description.includes('Kunden') ||
            description.includes('customers') ||
            description.includes('users') ||
            description.includes('Nutzer');

        if (hasSocialProof) {
            score += 0.3;
            metrics.description.hasSocialProof = true;
        } else {
            score -= 0.5;
            issues.push('Description lacks social proof');
            suggestions.push('Add numbers, percentages, or customer counts for credibility');
        }

        // Keyword stuffing check
        if (checkKeywordStuffing(description)) {
            score -= 1;
            issues.push('Keyword stuffing detected in description');
            suggestions.push('Vary your word choice to avoid repetition');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // CTA SCORING (max -2 points)
    // ═══════════════════════════════════════════════════════════════
    metrics.cta = { length: cta?.length || 0 };

    if (!cta || cta.length === 0) {
        score -= 2;
        issues.push('Missing CTA');
    } else {
        if (cta.length > 30) {
            score -= 0.5;
            issues.push('CTA too long (>30 chars)');
            suggestions.push('Shorten CTA to under 30 characters');
        }

        // Action verb check
        const actionVerbs = [
            'jetzt', 'start', 'entdecke', 'discover', 'get', 'claim',
            'try', 'teste', 'kaufe', 'buy', 'sichere', 'save', 'grab',
            'unlock', 'join', 'download', 'book', 'buche', 'erhalte'
        ];
        const hasActionVerb = actionVerbs.some(verb =>
            cta.toLowerCase().includes(verb)
        );

        if (hasActionVerb) {
            score += 0.2;
            metrics.cta.hasActionVerb = true;
        } else {
            score -= 0.5;
            issues.push('CTA lacks action verb');
            suggestions.push('Start CTA with an action verb like "Jetzt", "Teste", "Entdecke"');
        }

        // Value indicator check (bonus, free, discount)
        const valueWords = ['gratis', 'free', 'rabatt', 'discount', 'bonus', 'sparen', 'save', '%'];
        const hasValue = valueWords.some(word => cta.toLowerCase().includes(word));
        if (hasValue) {
            score += 0.2;
            metrics.cta.hasValue = true;
        }

        // Generic CTA check
        const genericCTAs = ['hier klicken', 'click here', 'mehr erfahren', 'learn more', 'submit', 'absenden'];
        if (genericCTAs.some(g => cta.toLowerCase().includes(g))) {
            score -= 0.3;
            issues.push('CTA is too generic');
            suggestions.push('Use a specific, value-driven CTA instead of generic phrases');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // IMAGE PROMPT SCORING (max -2 points)
    // ═══════════════════════════════════════════════════════════════
    metrics.imagePrompt = { length: imagePrompt?.length || 0 };

    if (!imagePrompt || imagePrompt.length === 0) {
        score -= 2;
        issues.push('Missing image prompt');
    } else {
        // Length check (needs to be detailed for good images)
        if (imagePrompt.length < 50) {
            score -= 1;
            issues.push('Image prompt too vague (<50 chars)');
            suggestions.push('Expand image prompt with lighting, composition, style details');
        } else if (imagePrompt.length >= 100) {
            score += 0.3;
            metrics.imagePrompt.isDetailed = true;
        }

        // Quality keywords check
        const qualityTerms = ['professional', 'high quality', '4k', 'photorealistic', 'commercial', 'advertising'];
        const hasQualityTerms = qualityTerms.some(term =>
            imagePrompt.toLowerCase().includes(term)
        );
        if (!hasQualityTerms) {
            score -= 0.3;
            issues.push('Image prompt lacks quality descriptors');
            suggestions.push('Add "professional", "commercial quality", or "photorealistic" to image prompt');
        }

        // No-text check (critical for ad images)
        const noTextIndicators = ['no text', 'no logo', 'no watermark', 'without text'];
        const hasNoTextDirective = noTextIndicators.some(ind =>
            imagePrompt.toLowerCase().includes(ind)
        );
        if (!hasNoTextDirective) {
            score -= 0.3;
            issues.push('Image prompt should specify "no text in image"');
            suggestions.push('Add "no text, no logos, no watermarks" to prevent unwanted text in generated image');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // CROSS-FIELD CHECKS
    // ═══════════════════════════════════════════════════════════════

    // Check for excessive repetition across fields
    if (headline && description &&
        headline.toLowerCase().split(' ').some(word =>
            word.length > 4 && description.toLowerCase().split(' ').filter(w => w === word).length > 2
        )) {
        score -= 0.3;
        issues.push('Excessive word repetition between headline and description');
    }

    // Ensure score stays within bounds
    score = Math.max(1, Math.min(10, score));
    const roundedScore = Math.round(score * 10) / 10;

    return {
        score: roundedScore,
        issues,
        suggestions,
        metrics,
        passed: roundedScore >= 7,
        grade: getGrade(roundedScore)
    };
}

/**
 * Get letter grade from score
 */
function getGrade(score) {
    if (score >= 9) return 'A+';
    if (score >= 8.5) return 'A';
    if (score >= 8) return 'A-';
    if (score >= 7.5) return 'B+';
    if (score >= 7) return 'B';
    if (score >= 6.5) return 'B-';
    if (score >= 6) return 'C+';
    if (score >= 5) return 'C';
    return 'D';
}

/**
 * Check for keyword stuffing
 */
function checkKeywordStuffing(text) {
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
}

/**
 * Validate ad content structure (throws on invalid)
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
 * Advanced engagement prediction score
 * Uses multiple signals to predict ad performance
 */
export function predictEngagement(adContent, targetAudience) {
    let score = 5.0; // Base score
    const factors = [];

    // ═══════════════════════════════════════════════════════════════
    // HEADLINE ENGAGEMENT FACTORS
    // ═══════════════════════════════════════════════════════════════
    if (adContent.headline) {
        const hl = adContent.headline.toLowerCase();

        // Question marks increase engagement (+8% CTR on average)
        if (adContent.headline.includes('?')) {
            score += 0.4;
            factors.push('Question in headline (+)');
        }

        // Numbers increase credibility (+36% higher engagement)
        if (/\d+/.test(adContent.headline)) {
            score += 0.4;
            factors.push('Numbers in headline (+)');
        }

        // Urgency triggers
        const urgencyWords = ['jetzt', 'now', 'heute', 'today', 'limited', 'begrenzt', 'letzte', 'last', 'nur noch'];
        if (urgencyWords.some(word => hl.includes(word))) {
            score += 0.3;
            factors.push('Urgency trigger (+)');
        }

        // Curiosity triggers
        const curiosityWords = ['geheimnis', 'secret', 'warum', 'why', 'wie', 'how', 'entdecke', 'discover'];
        if (curiosityWords.some(word => hl.includes(word))) {
            score += 0.3;
            factors.push('Curiosity trigger (+)');
        }

        // Length optimization (40-60 chars optimal)
        if (adContent.headline.length >= 40 && adContent.headline.length <= 60) {
            score += 0.2;
            factors.push('Optimal headline length (+)');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // DESCRIPTION ENGAGEMENT FACTORS
    // ═══════════════════════════════════════════════════════════════
    if (adContent.description) {
        const desc = adContent.description.toLowerCase();

        // Benefit-focused language
        const benefitWords = ['sparen', 'save', 'kostenlos', 'free', 'garantie', 'guarantee', 'gratis', 'bonus'];
        if (benefitWords.some(word => desc.includes(word))) {
            score += 0.3;
            factors.push('Benefit language (+)');
        }

        // Social proof
        if (/\d+.*kunden|\d+.*customer|\d+.*user|\d+.*nutzer/i.test(desc)) {
            score += 0.4;
            factors.push('Social proof with numbers (+)');
        }

        // Percentage claims
        if (desc.includes('%')) {
            score += 0.2;
            factors.push('Percentage claim (+)');
        }

        // Trust signals
        const trustWords = ['getestet', 'tested', 'zertifiziert', 'certified', 'award', 'preis', 'garantie'];
        if (trustWords.some(word => desc.includes(word))) {
            score += 0.2;
            factors.push('Trust signal (+)');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // CTA ENGAGEMENT FACTORS
    // ═══════════════════════════════════════════════════════════════
    if (adContent.cta) {
        const ctaLower = adContent.cta.toLowerCase();

        // Action verbs (first-person)
        const strongActions = ['start', 'get', 'try', 'discover', 'claim', 'unlock', 'grab', 'sichere', 'teste', 'entdecke'];
        if (strongActions.some(verb => ctaLower.includes(verb))) {
            score += 0.3;
            factors.push('Strong action verb (+)');
        }

        // Value proposition in CTA
        const valueIndicators = ['free', 'gratis', 'kostenlos', '%', 'rabatt', 'discount', 'bonus', 'sparen'];
        if (valueIndicators.some(ind => ctaLower.includes(ind))) {
            score += 0.3;
            factors.push('Value in CTA (+)');
        }

        // Short, punchy CTA (under 20 chars = +15% CTR)
        if (adContent.cta.length <= 20) {
            score += 0.2;
            factors.push('Concise CTA (+)');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // AUDIENCE ALIGNMENT (if provided)
    // ═══════════════════════════════════════════════════════════════
    if (targetAudience) {
        // Basic audience consideration
        score += 0.1;
        factors.push('Target audience specified (+)');
    }

    // Clamp score
    score = Math.min(10, Math.max(1, score));

    return {
        score: Math.round(score * 10) / 10,
        factors,
        prediction: score >= 7 ? 'High' : score >= 5 ? 'Medium' : 'Low'
    };
}

/**
 * Auto-fix common issues in ad content
 * Returns improved version with changes logged
 */
export function autoFixAdContent(adContent) {
    const fixed = { ...adContent };
    const changes = [];

    // Fix headline caps
    if (fixed.headline && fixed.headline === fixed.headline.toUpperCase() && fixed.headline.length > 5) {
        fixed.headline = fixed.headline.charAt(0).toUpperCase() + fixed.headline.slice(1).toLowerCase();
        changes.push('Converted headline from all-caps to sentence case');
    }

    // Trim excessive length
    if (fixed.headline && fixed.headline.length > 70) {
        fixed.headline = fixed.headline.substring(0, 67) + '...';
        changes.push('Truncated headline to 70 characters');
    }

    if (fixed.description && fixed.description.length > 220) {
        fixed.description = fixed.description.substring(0, 197) + '...';
        changes.push('Truncated description to 200 characters');
    }

    // Add no-text directive to image prompt if missing
    if (fixed.imagePrompt && !fixed.imagePrompt.toLowerCase().includes('no text')) {
        fixed.imagePrompt = fixed.imagePrompt + '. No text, no logos, no watermarks in image.';
        changes.push('Added no-text directive to image prompt');
    }

    return { content: fixed, changes };
}
