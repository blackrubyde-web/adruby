/**
 * Creative Format Validation
 * Enforces platform-specific constraints for ad creatives
 */

export interface FormatConstraints {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    aspectRatio: {
        min: number;  // e.g., 0.8 for 4:5
        max: number;  // e.g., 1.91 for 1.91:1
    };
    recommendedAspectRatio?: number; // Ideal ratio
    maxFileSize?: number; // in MB
    supportedFormats?: string[]; // ['jpg', 'png', 'mp4']
    textLimit?: {
        headline: number;
        primaryText: number;
        description: number;
    };
}

export interface PlacementConstraints {
    [key: string]: FormatConstraints;
}

/**
 * Meta (Facebook/Instagram) Placement Constraints
 * https://www.facebook.com/business/help/103816146375741
 */
export const META_CONSTRAINTS: PlacementConstraints = {
    feed: {
        minWidth: 600,
        maxWidth: 1936,
        minHeight: 600,
        maxHeight: 1936,
        aspectRatio: { min: 0.8, max: 1.91 }, // 4:5 to 1.91:1
        recommendedAspectRatio: 1.0, // 1:1
        maxFileSize: 30,
        supportedFormats: ['jpg', 'png'],
        textLimit: {
            headline: 40,
            primaryText: 125,
            description: 30
        }
    },
    stories: {
        minWidth: 500,
        maxWidth: 1080,
        minHeight: 889,
        maxHeight: 1920,
        aspectRatio: { min: 0.5625, max: 0.5625 }, // 9:16 only
        recommendedAspectRatio: 0.5625,
        maxFileSize: 30,
        supportedFormats: ['jpg', 'png', 'mp4'],
        textLimit: {
            headline: 0, // No headline in stories
            primaryText: 0, // Text overlay only
            description: 0
        }
    },
    reels: {
        minWidth: 500,
        maxWidth: 1080,
        minHeight: 889,
        maxHeight: 1920,
        aspectRatio: { min: 0.5625, max: 0.5625 }, // 9:16 only
        recommendedAspectRatio: 0.5625,
        maxFileSize: 250, // Video
        supportedFormats: ['mp4'],
        textLimit: {
            headline: 0,
            primaryText: 125,
            description: 0
        }
    },
    explore: {
        minWidth: 600,
        maxWidth: 1936,
        minHeight: 600,
        maxHeight: 1936,
        aspectRatio: { min: 1.0, max: 1.0 }, // 1:1 only
        recommendedAspectRatio: 1.0,
        maxFileSize: 30,
        supportedFormats: ['jpg', 'png'],
        textLimit: {
            headline: 40,
            primaryText: 125,
            description: 30
        }
    }
};

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validate creative dimensions against placement constraints
 */
export function validateDimensions(
    width: number,
    height: number,
    placement: keyof PlacementConstraints,
    constraints: PlacementConstraints = META_CONSTRAINTS
): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    const rules = constraints[placement];
    if (!rules) {
        result.errors.push(`Unknown placement: ${placement}`);
        result.isValid = false;
        return result;
    }

    // Check dimensions
    if (width < rules.minWidth) {
        result.errors.push(`Width ${width}px is below minimum ${rules.minWidth}px for ${placement}`);
        result.isValid = false;
    }
    if (width > rules.maxWidth) {
        result.errors.push(`Width ${width}px exceeds maximum ${rules.maxWidth}px for ${placement}`);
        result.isValid = false;
    }
    if (height < rules.minHeight) {
        result.errors.push(`Height ${height}px is below minimum ${rules.minHeight}px for ${placement}`);
        result.isValid = false;
    }
    if (height > rules.maxHeight) {
        result.errors.push(`Height ${height}px exceeds maximum ${rules.maxHeight}px for ${placement}`);
        result.isValid = false;
    }

    // Check aspect ratio
    const aspectRatio = width / height;
    if (aspectRatio < rules.aspectRatio.min || aspectRatio > rules.aspectRatio.max) {
        result.errors.push(
            `Aspect ratio ${aspectRatio.toFixed(2)} is outside allowed range ${rules.aspectRatio.min}-${rules.aspectRatio.max} for ${placement}`
        );
        result.isValid = false;
    }

    // Warnings for non-recommended ratios
    if (rules.recommendedAspectRatio && Math.abs(aspectRatio - rules.recommendedAspectRatio) > 0.05) {
        result.warnings.push(
            `Recommended aspect ratio for ${placement} is ${rules.recommendedAspectRatio.toFixed(2)} (yours: ${aspectRatio.toFixed(2)})`
        );
    }

    return result;
}

/**
 * Validate text length against placement constraints
 */
export function validateText(
    text: { headline?: string; primaryText?: string; description?: string },
    placement: keyof PlacementConstraints,
    constraints: PlacementConstraints = META_CONSTRAINTS
): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    const rules = constraints[placement];
    if (!rules || !rules.textLimit) {
        return result;
    }

    // Headline
    if (text.headline && rules.textLimit.headline > 0) {
        const len = text.headline.length;
        if (len > rules.textLimit.headline) {
            result.errors.push(`Headline (${len} chars) exceeds limit of ${rules.textLimit.headline} for ${placement}`);
            result.isValid = false;
        } else if (len > rules.textLimit.headline * 0.85) {
            result.warnings.push(`Headline is close to limit (${len}/${rules.textLimit.headline})`);
        }
    }

    // Primary Text
    if (text.primaryText && rules.textLimit.primaryText > 0) {
        const len = text.primaryText.length;
        if (len > rules.textLimit.primaryText) {
            result.errors.push(`Primary text (${len} chars) exceeds limit of ${rules.textLimit.primaryText} for ${placement}`);
            result.isValid = false;
        } else if (len > rules.textLimit.primaryText * 0.85) {
            result.warnings.push(`Primary text is close to limit (${len}/${rules.textLimit.primaryText})`);
        }
    }

    // Description
    if (text.description && rules.textLimit.description > 0) {
        const len = text.description.length;
        if (len > rules.textLimit.description) {
            result.errors.push(`Description (${len} chars) exceeds limit of ${rules.textLimit.description} for ${placement}`);
            result.isValid = false;
        }
    }

    return result;
}

/**
 * Validate creative for multiple placements
 */
export function validateForPlacements(
    width: number,
    height: number,
    text: { headline?: string; primaryText?: string; description?: string },
    placements: string[]
): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    for (const placement of placements) {
        const dimResult = validateDimensions(width, height, placement as keyof PlacementConstraints);
        const textResult = validateText(text, placement as keyof PlacementConstraints);

        results[placement] = {
            isValid: dimResult.isValid && textResult.isValid,
            errors: [...dimResult.errors, ...textResult.errors],
            warnings: [...dimResult.warnings, ...textResult.warnings]
        };
    }

    return results;
}

/**
 * Get recommended dimensions for a placement
 */
export function getRecommendedDimensions(placement: keyof PlacementConstraints): { width: number; height: number } {
    const rules = META_CONSTRAINTS[placement];

    if (!rules) {
        return { width: 1080, height: 1080 }; // Default 1:1
    }

    const ratio = rules.recommendedAspectRatio || rules.aspectRatio.min;

    // Standard dimensions based on placement
    if (placement === 'stories' || placement === 'reels') {
        return { width: 1080, height: 1920 }; // 9:16
    } else if (placement === 'feed') {
        if (ratio === 1.0) return { width: 1080, height: 1080 }; // 1:1
        if (ratio === 0.8) return { width: 1080, height: 1350 }; // 4:5
        return { width: 1200, height: 628 }; // 1.91:1
    } else if (placement === 'explore') {
        return { width: 1080, height: 1080 }; // 1:1
    }

    return { width: 1080, height: 1080 };
}
