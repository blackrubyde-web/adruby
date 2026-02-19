import { useMemo } from 'react';

interface Particle {
    left: number;
    top: number;
    delay: number;
    duration: number;
    size: number;
}

/**
 * Generates stable random particle positions for ambient floating effects.
 * Positions are memoized to prevent re-renders.
 */
export function useParticles(count: number = 16): Particle[] {
    return useMemo(() => {
        return Array.from({ length: count }, () => ({
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 10,
            duration: 12 + Math.random() * 10,
            size: 1 + Math.random() * 2,
        }));
    }, [count]);
}
