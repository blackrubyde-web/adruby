/**
 * ERROR CATEGORIZER
 * 
 * Categorizes errors for better user-facing messages and debugging.
 */

// Error categories with user-friendly messages
const ERROR_CATEGORIES = {
    RATE_LIMITED: {
        code: 'RATE_LIMITED',
        userMessage: 'Zu viele Anfragen. Bitte warte einen Moment und versuche es erneut.',
        userMessageEn: 'Too many requests. Please wait a moment and try again.',
        recoverable: true
    },
    INSUFFICIENT_CREDITS: {
        code: 'INSUFFICIENT_CREDITS',
        userMessage: 'Nicht genügend Credits. Bitte kaufe mehr Credits um fortzufahren.',
        userMessageEn: 'Insufficient credits. Please purchase more credits to continue.',
        recoverable: true
    },
    AI_GENERATION_FAILED: {
        code: 'AI_GENERATION_FAILED',
        userMessage: 'Die KI-Generierung ist fehlgeschlagen. Bitte versuche es erneut.',
        userMessageEn: 'AI generation failed. Please try again.',
        recoverable: true
    },
    IMAGE_UPLOAD_FAILED: {
        code: 'IMAGE_UPLOAD_FAILED',
        userMessage: 'Das Bild konnte nicht hochgeladen werden. Bitte versuche es erneut.',
        userMessageEn: 'Image upload failed. Please try again.',
        recoverable: true
    },
    INVALID_INPUT: {
        code: 'INVALID_INPUT',
        userMessage: 'Ungültige Eingabe. Bitte überprüfe deine Angaben.',
        userMessageEn: 'Invalid input. Please check your data.',
        recoverable: true
    },
    PRODUCT_IMAGE_INVALID: {
        code: 'PRODUCT_IMAGE_INVALID',
        userMessage: 'Das Produktbild konnte nicht verarbeitet werden. Bitte verwende ein anderes Bild.',
        userMessageEn: 'Product image could not be processed. Please use a different image.',
        recoverable: true
    },
    OPENAI_ERROR: {
        code: 'OPENAI_ERROR',
        userMessage: 'Der KI-Dienst ist vorübergehend nicht verfügbar. Bitte versuche es später erneut.',
        userMessageEn: 'AI service is temporarily unavailable. Please try again later.',
        recoverable: true
    },
    TIMEOUT: {
        code: 'TIMEOUT',
        userMessage: 'Die Anfrage hat zu lange gedauert. Bitte versuche es erneut.',
        userMessageEn: 'Request timed out. Please try again.',
        recoverable: true
    },
    DATABASE_ERROR: {
        code: 'DATABASE_ERROR',
        userMessage: 'Ein Datenbankfehler ist aufgetreten. Bitte versuche es später erneut.',
        userMessageEn: 'A database error occurred. Please try again later.',
        recoverable: false
    },
    UNKNOWN: {
        code: 'UNKNOWN',
        userMessage: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.',
        userMessageEn: 'An unexpected error occurred. Please try again.',
        recoverable: false
    }
};

/**
 * Categorize an error based on its message and type
 * @param {Error} error - The error to categorize
 * @returns {Object} Categorized error info
 */
export function categorizeError(error) {
    const message = error?.message?.toLowerCase() || '';
    const name = error?.name?.toLowerCase() || '';

    // Rate limiting
    if (message.includes('rate limit') || message.includes('too many requests') || error.status === 429) {
        return { ...ERROR_CATEGORIES.RATE_LIMITED, originalMessage: error.message };
    }

    // Credits
    if (message.includes('insufficient credits') || message.includes('credit')) {
        return { ...ERROR_CATEGORIES.INSUFFICIENT_CREDITS, originalMessage: error.message };
    }

    // OpenAI specific
    if (message.includes('openai') || message.includes('gpt') || message.includes('dall-e')) {
        return { ...ERROR_CATEGORIES.OPENAI_ERROR, originalMessage: error.message };
    }

    // Image upload
    if (message.includes('upload') || message.includes('storage')) {
        return { ...ERROR_CATEGORIES.IMAGE_UPLOAD_FAILED, originalMessage: error.message };
    }

    // Image processing
    if (message.includes('image') && (message.includes('invalid') || message.includes('corrupt'))) {
        return { ...ERROR_CATEGORIES.PRODUCT_IMAGE_INVALID, originalMessage: error.message };
    }

    // Database
    if (message.includes('database') || message.includes('supabase') || message.includes('postgres')) {
        return { ...ERROR_CATEGORIES.DATABASE_ERROR, originalMessage: error.message };
    }

    // Timeout
    if (message.includes('timeout') || message.includes('timed out') || name.includes('timeout')) {
        return { ...ERROR_CATEGORIES.TIMEOUT, originalMessage: error.message };
    }

    // Validation
    if (message.includes('invalid') || message.includes('validation') || message.includes('required')) {
        return { ...ERROR_CATEGORIES.INVALID_INPUT, originalMessage: error.message };
    }

    // AI Generation
    if (message.includes('generation') || message.includes('creative') || message.includes('ad')) {
        return { ...ERROR_CATEGORIES.AI_GENERATION_FAILED, originalMessage: error.message };
    }

    // Unknown
    return { ...ERROR_CATEGORIES.UNKNOWN, originalMessage: error.message };
}

/**
 * Get user-friendly message for a categorized error
 * @param {Object} categorizedError - Categorized error object
 * @param {string} language - 'de' or 'en'
 * @returns {string} User-friendly error message
 */
export function getUserMessage(categorizedError, language = 'de') {
    return language === 'en'
        ? categorizedError.userMessageEn
        : categorizedError.userMessage;
}

export default {
    categorizeError,
    getUserMessage,
    ERROR_CATEGORIES
};
