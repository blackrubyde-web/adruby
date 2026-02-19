/**
 * Design System Tokens — Single source of truth for spatial and visual constants.
 *
 * Import these tokens instead of hard-coding Tailwind values. This ensures
 * consistency across the dashboard and makes future design changes trivial.
 */

// ─── Spacing Scale ──────────────────────────────────────
/** Standard gap/padding values mapped to semantic names */
export const space = {
    /** 4px  — micro gaps (icon-to-text) */
    xs: '1',
    /** 8px  — tight gaps (badge padding) */
    sm: '2',
    /** 12px — compact padding */
    md: '3',
    /** 16px — default section padding */
    lg: '4',
    /** 20px — card inner padding */
    xl: '5',
    /** 24px — section margin */
    '2xl': '6',
    /** 32px — page section gaps */
    '3xl': '8',
    /** 48px — large section gaps */
    '4xl': '12',
} as const;

// ─── Border Radius ──────────────────────────────────────
export const radius = {
    /** 6px  — pills, small badges */
    sm: 'rounded-md',
    /** 8px  — buttons, inputs */
    md: 'rounded-lg',
    /** 12px — cards */
    lg: 'rounded-xl',
    /** 16px — modals, large cards */
    xl: 'rounded-2xl',
    /** full — avatars, circles */
    full: 'rounded-full',
} as const;

// ─── Shadows ────────────────────────────────────────────
export const shadow = {
    /** Subtle card elevation */
    card: 'shadow-sm',
    /** Elevated card (hover state) */
    cardHover: 'shadow-lg shadow-primary/5',
    /** Modal / overlay */
    modal: 'shadow-2xl',
    /** Glow accent */
    glow: 'shadow-lg shadow-primary/10',
    /** Input focus */
    focus: 'shadow-[0_0_0_3px_rgba(var(--primary),0.15)]',
} as const;

// ─── Transitions ────────────────────────────────────────
export const transition = {
    /** Quick micro-interactions */
    fast: 'transition-all duration-150 ease-out',
    /** Default hover/state changes */
    base: 'transition-all duration-200 ease-out',
    /** Smooth reveals, page elements */
    smooth: 'transition-all duration-300 ease-out',
    /** Slow, deliberate animations */
    slow: 'transition-all duration-500 ease-out',
} as const;

// ─── Card Patterns ──────────────────────────────────────
/** Reusable class strings for card styles */
export const card = {
    /** Default glass card */
    base: `${radius.lg} border border-border/60 bg-card/50 backdrop-blur-sm`,
    /** Hoverable card with lift effect */
    hover: `hover:-translate-y-0.5 ${shadow.cardHover} ${transition.smooth}`,
    /** Interactive card (clickable) */
    interactive: `cursor-pointer hover:-translate-y-1 hover:border-primary/20 ${shadow.cardHover} ${transition.smooth}`,
} as const;

// ─── Typography Presets ─────────────────────────────────
export const text = {
    /** Section headings */
    sectionTitle: 'text-lg font-bold tracking-tight text-foreground',
    /** Section subtitles */
    sectionSub: 'text-sm text-muted-foreground',
    /** KPI value */
    metric: 'text-2xl font-bold text-foreground tabular-nums',
    /** Small label */
    label: 'text-xs font-medium text-muted-foreground uppercase tracking-wider',
    /** Body text */
    body: 'text-sm text-muted-foreground leading-relaxed',
} as const;
