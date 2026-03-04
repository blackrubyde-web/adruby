// Centralized routing constants for the application

export type PageType =
    | 'landing'
    | 'features'
    | 'feature-ai-generator'
    | 'feature-creative-library'
    | 'feature-campaign-builder'
    | 'feature-analytics'
    | 'feature-ai-analysis'
    | 'pricing'
    | 'login'
    | 'register'
    | 'auth-processing'
    | 'payment-verification'
    | 'payment-success'
    | 'payment-cancelled'
    | 'dashboard'
    | 'analytics'
    | 'library'
    | 'campaigns'
    | 'campaign-builder'
    | 'aianalysis'
    | 'settings'
    | 'affiliate'
    | 'profile'
    | 'help'
    | 'studio'
    | 'aibuilder'
    | 'admin'
    | 'campaign-canvas'
    | 'impressum'
    | 'agb'
    | 'datenschutz'
    | 'widerruf';

export const PAGE_PATHS: Record<PageType, string> = {
    landing: '/',
    features: '/features',
    'feature-ai-generator': '/features/ai-generator',
    'feature-creative-library': '/features/creative-library',
    'feature-campaign-builder': '/features/campaign-builder',
    'feature-analytics': '/features/analytics',
    'feature-ai-analysis': '/features/ai-analysis',
    pricing: '/pricing',
    login: '/login',
    register: '/register',
    'auth-processing': '/auth/callback',
    'payment-verification': '/payment-verification',
    'payment-success': '/payment-success',
    'payment-cancelled': '/payment-cancelled',
    dashboard: '/dashboard',
    analytics: '/analytics',
    library: '/library',
    campaigns: '/campaigns',
    'campaign-builder': '/campaign-builder',
    aianalysis: '/aianalysis',
    settings: '/settings',
    affiliate: '/affiliate',
    profile: '/profile',
    help: '/help',
    studio: '/studio',
    aibuilder: '/aibuilder',
    admin: '/admin',
    'campaign-canvas': '/campaign-canvas',
    impressum: '/impressum',
    agb: '/agb',
    datenschutz: '/datenschutz',
    widerruf: '/widerruf',
};

export const PUBLIC_PAGES = new Set<PageType>([
    'landing',
    'features',
    'feature-ai-generator',
    'feature-creative-library',
    'feature-campaign-builder',
    'feature-analytics',
    'feature-ai-analysis',
    'pricing',
    'login',
    'register',
    'auth-processing',
    'payment-verification',
    'payment-success',
    'payment-cancelled',
    'affiliate',
    'impressum',
    'agb',
    'datenschutz',
    'widerruf',
]);

const REDIRECT_GUARD_KEY = 'adruby_last_redirect';
const REDIRECT_COOLDOWN_MS = 1500;
export const AUTH_HOLD_KEY = 'adruby_hold_auth_redirect';

function normalizePathname(pathname: string) {
    if (!pathname) return '/';
    if (pathname === '/') return '/';
    return pathname.replace(/\/+$/, '');
}

export function pageFromPathname(pathname: string): PageType {
    if (pathname === '/adbuilder') pathname = '/studio';
    const normalized = normalizePathname(pathname);
    const match = (Object.entries(PAGE_PATHS) as Array<[PageType, string]>).find(
        ([, p]) => p === normalized
    );
    return match?.[0] ?? 'landing';
}

export function safeRedirectPath(raw: string | null) {
    if (!raw) return null;
    try {
        const decoded = decodeURIComponent(raw);
        if (!decoded.startsWith('/')) return null;
        return decoded;
    } catch {
        return null;
    }
}

export function allowRedirect(pathname: string) {
    try {
        const raw = sessionStorage.getItem(REDIRECT_GUARD_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.path === pathname && Date.now() - parsed?.ts < REDIRECT_COOLDOWN_MS) {
                return false;
            }
        }
        sessionStorage.setItem(
            REDIRECT_GUARD_KEY,
            JSON.stringify({ path: pathname, ts: Date.now() })
        );
    } catch {
        return true;
    }
    return true;
}
