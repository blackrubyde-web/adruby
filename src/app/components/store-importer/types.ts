// src/app/components/store-importer/types.ts
// Type definitions for Store Importer

export interface ScrapedProduct {
    id: string;
    handle: string;
    title: string;
    description: string;
    descriptionHtml: string;
    vendor: string;
    productType: string;
    tags: string[];
    images: Array<{
        id: string;
        src: string;
        alt: string;
        width?: number;
        height?: number;
    }>;
    variants: Array<{
        id: string;
        title: string;
        price: string;
        compareAtPrice: string | null;
        sku: string;
        available: boolean;
    }>;
    price: string;
    compareAtPrice: string | null;
    available: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface StoreInfo {
    name: string;
    description: string;
    logo: string | null;
}

export interface ScrapeResult {
    success: boolean;
    store: StoreInfo;
    products: ScrapedProduct[];
    source: 'json' | 'scraperapi';
    scrapedAt: string;
}

export interface ProductCopy {
    productId: string;
    productTitle: string;
    hooks: string[];
    headlines: string[];
    ctas: string[];
    primaryText: string;
}

export interface CarouselSlide {
    id: string;
    productId: string;
    image: string;
    headline: string;
    description: string;
    cta: string;
    price: string;
}

export interface CarouselAd {
    id: string;
    type: 'carousel';
    title: string;
    slides: CarouselSlide[];
    aspectRatio: '1:1' | '9:16' | '4:5';
    createdAt: string;
}
