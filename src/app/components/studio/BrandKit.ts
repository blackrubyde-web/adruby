// Brand Kit - Store and apply brand identity
// Includes logo, colors, fonts
import type { AdDocument, StudioLayer, TextLayer, CtaLayer } from '../../types/studio';

export interface BrandKit {
    id: string;
    name: string;
    logoUrl?: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    fonts: {
        heading: string;
        body: string;
    };
    createdAt: string;
}

// Default brand kits for demo
export const DEFAULT_BRAND_KITS: BrandKit[] = [
    {
        id: 'brand_modern_dark',
        name: 'Modern Dark',
        colors: {
            primary: '#3b82f6',
            secondary: '#8b5cf6',
            accent: '#22d3ee',
            background: '#0a0a0a',
            text: '#ffffff'
        },
        fonts: {
            heading: 'Inter',
            body: 'Inter'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'brand_classic_light',
        name: 'Classic Light',
        colors: {
            primary: '#1e3a8a',
            secondary: '#1e40af',
            accent: '#059669',
            background: '#ffffff',
            text: '#0f172a'
        },
        fonts: {
            heading: 'Playfair Display',
            body: 'Inter'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'brand_bold_energy',
        name: 'Bold Energy',
        colors: {
            primary: '#ef4444',
            secondary: '#f97316',
            accent: '#facc15',
            background: '#18181b',
            text: '#ffffff'
        },
        fonts: {
            heading: 'Oswald',
            body: 'Inter'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'brand_nature_calm',
        name: 'Nature Calm',
        colors: {
            primary: '#22c55e',
            secondary: '#14b8a6',
            accent: '#84cc16',
            background: '#f0fdf4',
            text: '#14532d'
        },
        fonts: {
            heading: 'Outfit',
            body: 'Inter'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'brand_luxury_gold',
        name: 'Luxury Gold',
        colors: {
            primary: '#d4af37',
            secondary: '#b8860b',
            accent: '#ffd700',
            background: '#1a1a1a',
            text: '#ffffff'
        },
        fonts: {
            heading: 'Playfair Display',
            body: 'Inter'
        },
        createdAt: new Date().toISOString()
    }
];

// Apply brand kit to an AdDocument
export function applyBrandToDocument(
    doc: AdDocument,
    brand: BrandKit
): AdDocument {
    return {
        ...doc,
        backgroundColor: brand.colors.background,
        layers: doc.layers.map((layer: StudioLayer) => {
            const newLayer = { ...layer };

            if (layer.type === 'text') {
                (newLayer as TextLayer).color = brand.colors.text;
                (newLayer as TextLayer).fontFamily = brand.fonts.heading;
            }

            if (layer.type === 'cta') {
                (newLayer as CtaLayer).bgColor = brand.colors.primary;
                (newLayer as CtaLayer).color = brand.colors.background === '#ffffff' || brand.colors.background === '#f0fdf4' ? '#ffffff' : '#ffffff';
                (newLayer as CtaLayer).fontFamily = brand.fonts.body;
            }

            return newLayer;
        })
    };
}

// Save brand kit to localStorage
export function saveBrandKit(brand: BrandKit): void {
    const existing = loadBrandKits();
    const updated = [...existing.filter(b => b.id !== brand.id), brand];
    localStorage.setItem('adruby_brand_kits', JSON.stringify(updated));
}

// Load brand kits from localStorage
export function loadBrandKits(): BrandKit[] {
    try {
        const stored = localStorage.getItem('adruby_brand_kits');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load brand kits:', e);
    }
    return [];
}

// Get all brand kits (defaults + saved)
export function getAllBrandKits(): BrandKit[] {
    const saved = loadBrandKits();
    const defaultIds = DEFAULT_BRAND_KITS.map(b => b.id);
    // Return defaults + any custom saved ones
    return [
        ...DEFAULT_BRAND_KITS,
        ...saved.filter(b => !defaultIds.includes(b.id))
    ];
}
