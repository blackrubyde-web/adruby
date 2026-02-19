import type { Variants, Transition } from 'motion/react';

// ─── Ease Curves ───────────────────────────────────────
export const ease = {
    /** Apple-style decelerate curve */
    out: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    /** Smooth entrance */
    spring: { type: 'spring' as const, stiffness: 350, damping: 30 },
    /** Quick snap */
    snap: { type: 'spring' as const, stiffness: 400, damping: 17 },
};

// ─── Container Variants (orchestrate children) ────────
export const stagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

export const staggerFast: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};

export const staggerSlow: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
};

// ─── Item Variants ────────────────────────────────────
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.out } },
};

export const fadeDown: Variants = {
    hidden: { opacity: 0, y: -16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.out } },
};

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: ease.out } },
};

export const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: ease.out } },
};

export const slideInRight: Variants = {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: ease.out } },
};

// ─── Page Transition ──────────────────────────────────
export const pageTransition: Variants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};

export const pageTransitionConfig: Transition = {
    duration: 0.3,
    ease: [0.25, 0.46, 0.45, 0.94],
};

// ─── whileInView defaults ─────────────────────────────
export const viewportOnce = { once: true, margin: '-60px' as const };
export const viewport = viewportOnce;
