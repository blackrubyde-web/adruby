import type { StudioLayer, AdDocument } from '../../types/studio';

export interface ModulePreset {
    id: string;
    label: string;
    category: 'cta' | 'text' | 'badge' | 'ecommerce' | 'social' | 'saas' | 'coach' | 'craft' | 'job' | 'realestate' | 'food' | 'fitness' | 'event' | 'finance';
    preview: string;
    tags: string[];
    layerDetails: Partial<StudioLayer>;
}

export interface AdTemplate {
    id: string;
    name: string;
    niche: 'saas' | 'coach' | 'craft' | 'job' | 'ecommerce' | 'realestate' | 'food' | 'fitness' | 'event' | 'finance';
    previewImg?: string;
    document: Partial<AdDocument>;
}

export const MODULE_PRESETS: ModulePreset[] = [
    // --- E-COMMERCE / RETAIL ---
    {
        id: 'cta_buy_now_glass',
        label: 'Buy Now Glass',
        category: 'ecommerce',
        preview: 'bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full px-2',
        tags: ['premium', 'glass', 'buy'],
        layerDetails: { type: 'cta', text: 'BUY NOW', width: 280, height: 70, bgColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', radius: 40, fontSize: 22, fontWeight: 800 }
    },
    {
        id: 'ecom_discount_badge',
        label: 'Discount Badge',
        category: 'ecommerce',
        preview: 'bg-red-600 text-white font-black rounded-full px-2',
        tags: ['sale', 'discount', 'offer'],
        layerDetails: { type: 'cta', text: '-50% OFF', width: 150, height: 150, bgColor: '#dc2626', color: '#FFFFFF', radius: 100, fontSize: 28, fontWeight: 900 }
    },
    // --- CRAFTSMEN / SCHREINER ---
    {
        id: 'craft_badge_quality',
        label: 'Quality Handcrafted',
        category: 'craft',
        preview: 'bg-amber-900 border-2 border-amber-500 text-amber-500 rounded-lg p-1',
        tags: ['wood', 'quality', 'master'],
        layerDetails: { type: 'cta', text: 'MEISTERQUALITÄT', width: 320, height: 60, bgColor: '#451a03', borderColor: '#f59e0b', borderWidth: 2, color: '#f59e0b', radius: 4, fontSize: 18, fontWeight: 900 }
    },
    {
        id: 'craft_headline_bold',
        label: 'Industrial Headline',
        category: 'craft',
        preview: 'text-zinc-100 font-black',
        tags: ['bold', 'industrial'],
        layerDetails: { type: 'text', text: 'MASSIVE HOLZDESIGNER', width: 800, fontSize: 72, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', align: 'center' }
    },
    // --- SAAS / TECH ---
    {
        id: 'saas_feature_list',
        label: 'Feature Checklist',
        category: 'saas',
        preview: 'bg-blue-600/10 border-l-4 border-blue-500 text-blue-400 p-1',
        tags: ['saas', 'check', 'features'],
        layerDetails: { type: 'text', text: '✓ Unlimited Projects\n✓ AI Generation\n✓ Auto Export', width: 400, fontSize: 24, fontWeight: 600, fontFamily: 'Inter', color: '#3b82f6', align: 'left', lineHeight: 1.5 }
    },
    {
        id: 'saas_cta_modern',
        label: 'Cyber SaaS CTA',
        category: 'saas',
        preview: 'bg-blue-600 shadow-lg shadow-blue-500/50 text-white rounded-xl px-2',
        tags: ['modern', 'blue', 'app'],
        layerDetails: { type: 'cta', text: 'START FREE TRIAL', width: 300, height: 75, bgColor: '#2563eb', color: '#FFFFFF', radius: 12, fontSize: 20, fontWeight: 800 }
    },
    // --- COACHING ---
    {
        id: 'coach_quote_box',
        label: 'Inspiring Quote',
        category: 'coach',
        preview: 'border-l-4 border-indigo-500 italic p-1',
        tags: ['quote', 'inspiration', 'coach'],
        layerDetails: { type: 'text', text: '"Success is not the key to happiness. Happiness is the key to success."', width: 600, fontSize: 32, fontWeight: 400, fontStyle: 'italic', fontFamily: 'Playfair Display', color: '#1e293b', align: 'center' }
    },
    {
        id: 'coach_cta_join',
        label: 'Join Program',
        category: 'coach',
        preview: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-2',
        tags: ['join', 'enroll', 'program'],
        layerDetails: { type: 'cta', text: 'JOIN THE PROGRAM', width: 320, height: 70, bgColor: '#8b5cf6', color: '#FFFFFF', radius: 16, fontSize: 20, fontWeight: 800 }
    },
    // --- JOB / RECRUITMENT ---
    {
        id: 'job_hiring_badge',
        label: 'We Are Hiring',
        category: 'job',
        preview: 'bg-green-600 text-white font-bold rounded p-1',
        tags: ['hiring', 'jobs', 'team'],
        layerDetails: { type: 'cta', text: 'WE ARE HIRING!', width: 250, height: 50, bgColor: '#16a34a', color: '#FFFFFF', radius: 8, fontSize: 18, fontWeight: 900 }
    },
    {
        id: 'job_benefits',
        label: 'Benefits List',
        category: 'job',
        preview: 'text-emerald-400 font-semibold',
        tags: ['benefits', 'perks'],
        layerDetails: { type: 'text', text: '💰 Competitive Salary\n🏠 Remote Work\n📈 Career Growth\n🎯 Equity Options', width: 400, fontSize: 22, fontWeight: 600, fontFamily: 'Inter', color: '#10b981', align: 'left', lineHeight: 1.6 }
    },
    // --- REAL ESTATE ---
    {
        id: 'realestate_price_tag',
        label: 'Property Price',
        category: 'realestate',
        preview: 'bg-slate-900 text-white font-black rounded-lg px-2',
        tags: ['price', 'property', 'house'],
        layerDetails: { type: 'cta', text: '€ 450.000', width: 280, height: 80, bgColor: '#0f172a', color: '#FFFFFF', radius: 8, fontSize: 36, fontWeight: 900 }
    },
    {
        id: 'realestate_features',
        label: 'Property Features',
        category: 'realestate',
        preview: 'text-slate-600 font-medium',
        tags: ['rooms', 'sqm', 'features'],
        layerDetails: { type: 'text', text: '🛏 4 Bedrooms  •  🚿 2 Baths  •  📐 180m²', width: 600, fontSize: 24, fontWeight: 600, fontFamily: 'Inter', color: '#475569', align: 'center' }
    },
    {
        id: 'realestate_cta',
        label: 'Book Viewing',
        category: 'realestate',
        preview: 'bg-amber-500 text-black font-bold rounded-lg px-2',
        tags: ['viewing', 'schedule', 'tour'],
        layerDetails: { type: 'cta', text: 'SCHEDULE A VIEWING', width: 320, height: 65, bgColor: '#f59e0b', color: '#000000', radius: 8, fontSize: 18, fontWeight: 800 }
    },
    // --- RESTAURANT / FOOD ---
    {
        id: 'food_special_badge',
        label: 'Today\'s Special',
        category: 'food',
        preview: 'bg-red-700 text-yellow-300 font-black rounded-full px-2',
        tags: ['special', 'menu', 'daily'],
        layerDetails: { type: 'cta', text: "TODAY'S SPECIAL", width: 260, height: 60, bgColor: '#b91c1c', color: '#fde047', radius: 30, fontSize: 18, fontWeight: 900 }
    },
    {
        id: 'food_order_cta',
        label: 'Order Now',
        category: 'food',
        preview: 'bg-green-500 text-white font-bold rounded-xl px-2',
        tags: ['order', 'delivery', 'food'],
        layerDetails: { type: 'cta', text: '🍕 ORDER NOW', width: 280, height: 70, bgColor: '#22c55e', color: '#FFFFFF', radius: 16, fontSize: 22, fontWeight: 800 }
    },
    {
        id: 'food_rating',
        label: 'Star Rating',
        category: 'food',
        preview: 'text-yellow-400 font-bold',
        tags: ['rating', 'stars', 'review'],
        layerDetails: { type: 'text', text: '⭐⭐⭐⭐⭐ 4.9 (2.4k Reviews)', width: 400, fontSize: 22, fontWeight: 700, fontFamily: 'Inter', color: '#facc15', align: 'center' }
    },
    // --- FITNESS / GYM ---
    {
        id: 'fitness_cta_start',
        label: 'Start Training',
        category: 'fitness',
        preview: 'bg-orange-500 text-white font-black rounded-xl px-2',
        tags: ['gym', 'train', 'workout'],
        layerDetails: { type: 'cta', text: 'START YOUR JOURNEY', width: 340, height: 75, bgColor: '#f97316', color: '#FFFFFF', radius: 12, fontSize: 22, fontWeight: 900 }
    },
    {
        id: 'fitness_offer',
        label: 'Free Trial Offer',
        category: 'fitness',
        preview: 'bg-black text-lime-400 font-black rounded px-2',
        tags: ['trial', 'free', 'offer'],
        layerDetails: { type: 'cta', text: '7 DAYS FREE', width: 240, height: 60, bgColor: '#000000', color: '#a3e635', radius: 6, fontSize: 24, fontWeight: 900 }
    },
    {
        id: 'fitness_stats',
        label: 'Transformation Stats',
        category: 'fitness',
        preview: 'text-white font-bold',
        tags: ['results', 'stats', 'transform'],
        layerDetails: { type: 'text', text: '🔥 -15kg in 90 Days\n💪 +40% Strength\n❤️ 98% Success Rate', width: 400, fontSize: 24, fontWeight: 700, fontFamily: 'Inter', color: '#FFFFFF', align: 'left', lineHeight: 1.5 }
    },
    // --- EVENT / PARTY ---
    {
        id: 'event_date_badge',
        label: 'Event Date',
        category: 'event',
        preview: 'bg-purple-600 text-white font-black rounded-xl px-2',
        tags: ['date', 'when', 'schedule'],
        layerDetails: { type: 'cta', text: 'DEC 31 • 10PM', width: 280, height: 70, bgColor: '#9333ea', color: '#FFFFFF', radius: 16, fontSize: 24, fontWeight: 900 }
    },
    {
        id: 'event_tickets_cta',
        label: 'Get Tickets',
        category: 'event',
        preview: 'bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold rounded-full px-2',
        tags: ['tickets', 'buy', 'event'],
        layerDetails: { type: 'cta', text: '🎟 GET TICKETS', width: 300, height: 70, bgColor: '#ec4899', color: '#FFFFFF', radius: 40, fontSize: 22, fontWeight: 800 }
    },
    {
        id: 'event_headline',
        label: 'Party Headline',
        category: 'event',
        preview: 'text-pink-500 font-black uppercase',
        tags: ['party', 'headline', 'neon'],
        layerDetails: { type: 'text', text: 'NEW YEAR\'S EVE\nBASH 2025', width: 700, fontSize: 80, fontWeight: 900, fontFamily: 'Oswald', color: '#ec4899', align: 'center', lineHeight: 1.0 }
    },
    // --- FINANCE / LEGAL ---
    {
        id: 'finance_trust_badge',
        label: 'Trust Badge',
        category: 'finance',
        preview: 'bg-slate-800 border border-emerald-500 text-emerald-400 rounded-lg px-2',
        tags: ['trust', 'secure', 'verified'],
        layerDetails: { type: 'cta', text: '✓ TRUSTED & SECURE', width: 280, height: 55, bgColor: '#1e293b', color: '#34d399', radius: 8, fontSize: 16, fontWeight: 700 }
    },
    {
        id: 'finance_cta_consult',
        label: 'Free Consultation',
        category: 'finance',
        preview: 'bg-blue-900 text-white font-bold rounded-lg px-2',
        tags: ['consult', 'call', 'book'],
        layerDetails: { type: 'cta', text: 'FREE CONSULTATION', width: 300, height: 65, bgColor: '#1e3a8a', color: '#FFFFFF', radius: 8, fontSize: 18, fontWeight: 800 }
    },
    {
        id: 'finance_headline',
        label: 'Professional Headline',
        category: 'finance',
        preview: 'text-slate-900 font-bold',
        tags: ['finance', 'legal', 'professional'],
        layerDetails: { type: 'text', text: 'Secure Your\nFinancial Future.', width: 600, fontSize: 56, fontWeight: 800, fontFamily: 'Inter', color: '#0f172a', align: 'left', lineHeight: 1.1 }
    }
];

export const AD_TEMPLATES: AdTemplate[] = [
    // --- CRAFT ---
    {
        id: 'tpl_schreiner_01',
        name: 'Classic Carpentry',
        niche: 'craft',
        document: {
            backgroundColor: '#1c1917',
            layers: [
                { id: 'bg', type: 'background', name: 'Workshop', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1581447100595-3a81355978ac?q=80&w=2940&auto=format&fit=crop', opacity: 0.6, rotation: 0, fit: 'cover' } as any,
                { id: 'title', type: 'text', name: 'Headline', x: 90, y: 150, width: 900, height: 200, visible: true, locked: false, zIndex: 10, text: 'ECHTES HANDWERK.\nZEITLOSES DESIGN.', fontSize: 80, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.1, letterSpacing: -2 } as any,
                { id: 'badge', type: 'cta', name: 'Master Badge', x: 90, y: 380, width: 300, height: 50, visible: true, locked: false, zIndex: 20, text: 'MEISTERBETRIEB', fontSize: 18, fontWeight: 900, fontFamily: 'Inter', color: '#f59e0b', bgColor: '#451a03', radius: 4, rotation: 0, opacity: 1, lineHeight: 1.2 } as any
            ]
        }
    },
    // --- SAAS ---
    {
        id: 'tpl_saas_01',
        name: 'SaaS Launch Dark',
        niche: 'saas',
        document: {
            backgroundColor: '#000000',
            layers: [
                { id: 'grad', type: 'background', name: 'Gradient', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2864&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' } as any,
                { id: 'title', type: 'text', name: 'Headline', x: 100, y: 750, width: 880, height: 100, visible: true, locked: false, zIndex: 10, text: 'Automate Everything.', fontSize: 72, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.1, letterSpacing: -3 } as any,
                { id: 'cta', type: 'cta', name: 'Button', x: 390, y: 900, width: 300, height: 70, visible: true, locked: false, zIndex: 20, text: 'Try it Free', fontSize: 24, fontWeight: 700, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#2563eb', radius: 12, rotation: 0, opacity: 1, lineHeight: 1.2 } as any
            ]
        }
    },
    // --- REAL ESTATE ---
    {
        id: 'tpl_realestate_01',
        name: 'Luxury Property',
        niche: 'realestate',
        document: {
            backgroundColor: '#0f172a',
            layers: [
                { id: 'bg', type: 'background', name: 'Property', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2940&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' } as any,
                { id: 'overlay', type: 'overlay', name: 'Dark Overlay', x: 0, y: 700, width: 1080, height: 380, visible: true, locked: true, zIndex: 5, src: '', opacity: 0.9, rotation: 0, fit: 'cover' } as any,
                { id: 'price', type: 'cta', name: 'Price Tag', x: 60, y: 750, width: 280, height: 80, visible: true, locked: false, zIndex: 10, text: '€ 1.250.000', fontSize: 32, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#f59e0b', radius: 8, rotation: 0, opacity: 1, lineHeight: 1.2 } as any,
                { id: 'features', type: 'text', name: 'Features', x: 60, y: 860, width: 600, height: 50, visible: true, locked: false, zIndex: 10, text: '🛏 5 Beds  •  🚿 3 Baths  •  📐 320m²', fontSize: 22, fontWeight: 600, fontFamily: 'Inter', color: '#94a3b8', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.2, letterSpacing: 0 } as any,
                { id: 'cta', type: 'cta', name: 'CTA', x: 60, y: 960, width: 280, height: 60, visible: true, locked: false, zIndex: 20, text: 'BOOK VIEWING →', fontSize: 16, fontWeight: 800, fontFamily: 'Inter', color: '#000000', bgColor: '#FFFFFF', radius: 30, rotation: 0, opacity: 1, lineHeight: 1.2 } as any
            ]
        }
    },
    // --- RESTAURANT ---
    {
        id: 'tpl_food_01',
        name: 'Restaurant Promo',
        niche: 'food',
        document: {
            backgroundColor: '#1a1a1a',
            layers: [
                { id: 'bg', type: 'background', name: 'Food Photo', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2940&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' } as any,
                { id: 'badge', type: 'cta', name: 'Special Badge', x: 60, y: 60, width: 200, height: 50, visible: true, locked: false, zIndex: 10, text: "TODAY'S SPECIAL", fontSize: 14, fontWeight: 900, fontFamily: 'Inter', color: '#fde047', bgColor: '#b91c1c', radius: 25, rotation: 0, opacity: 1, lineHeight: 1.2 } as any,
                { id: 'title', type: 'text', name: 'Dish Name', x: 60, y: 800, width: 800, height: 120, visible: true, locked: false, zIndex: 10, text: 'Signature\nPasta Carbonara', fontSize: 60, fontWeight: 900, fontFamily: 'Playfair Display', color: '#FFFFFF', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.0, letterSpacing: -1 } as any,
                { id: 'cta', type: 'cta', name: 'Order CTA', x: 60, y: 960, width: 260, height: 60, visible: true, locked: false, zIndex: 20, text: '🍕 ORDER NOW', fontSize: 18, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#22c55e', radius: 12, rotation: 0, opacity: 1, lineHeight: 1.2 } as any
            ]
        }
    },
    // --- FITNESS ---
    {
        id: 'tpl_fitness_01',
        name: 'Gym Promo Dark',
        niche: 'fitness',
        document: {
            backgroundColor: '#000000',
            layers: [
                { id: 'bg', type: 'background', name: 'Gym Photo', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2940&auto=format&fit=crop', opacity: 0.7, rotation: 0, fit: 'cover' } as any,
                { id: 'title', type: 'text', name: 'Headline', x: 60, y: 200, width: 960, height: 200, visible: true, locked: false, zIndex: 10, text: 'TRANSFORM\nYOUR BODY', fontSize: 100, fontWeight: 900, fontFamily: 'Oswald', color: '#FFFFFF', align: 'left', rotation: 0, opacity: 1, lineHeight: 0.95, letterSpacing: -2 } as any,
                { id: 'offer', type: 'cta', name: 'Free Trial', x: 60, y: 450, width: 240, height: 60, visible: true, locked: false, zIndex: 15, text: '7 DAYS FREE', fontSize: 22, fontWeight: 900, fontFamily: 'Inter', color: '#a3e635', bgColor: '#000000', radius: 6, rotation: 0, opacity: 1, lineHeight: 1.2 } as any,
                { id: 'cta', type: 'cta', name: 'Start CTA', x: 60, y: 900, width: 340, height: 75, visible: true, locked: false, zIndex: 20, text: 'START YOUR JOURNEY', fontSize: 20, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#f97316', radius: 12, rotation: 0, opacity: 1, lineHeight: 1.2 } as any
            ]
        }
    },
    // --- EVENT ---
    {
        id: 'tpl_event_01',
        name: 'NYE Party',
        niche: 'event',
        document: {
            backgroundColor: '#0a0a0a',
            layers: [
                { id: 'bg', type: 'background', name: 'Party BG', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2940&auto=format&fit=crop', opacity: 0.5, rotation: 0, fit: 'cover' } as any,
                { id: 'title', type: 'text', name: 'Event Title', x: 90, y: 300, width: 900, height: 300, visible: true, locked: false, zIndex: 10, text: "NEW YEAR'S\nEVE BASH", fontSize: 100, fontWeight: 900, fontFamily: 'Oswald', color: '#ec4899', align: 'center', rotation: 0, opacity: 1, lineHeight: 0.9, letterSpacing: 0 } as any,
                { id: 'date', type: 'cta', name: 'Date Badge', x: 400, y: 650, width: 280, height: 70, visible: true, locked: false, zIndex: 15, text: 'DEC 31 • 10PM', fontSize: 24, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#9333ea', radius: 16, rotation: 0, opacity: 1, lineHeight: 1.2 } as any,
                { id: 'cta', type: 'cta', name: 'Tickets', x: 365, y: 900, width: 350, height: 80, visible: true, locked: false, zIndex: 20, text: '🎟 GET TICKETS', fontSize: 26, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#ec4899', radius: 40, rotation: 0, opacity: 1, lineHeight: 1.2 } as any
            ]
        }
    },
    // --- COMMERCE ---
    {
        id: 'tpl_ecom_01',
        name: 'Summer Sale',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#ffffff',
            layers: [
                { id: 'bg', type: 'background', name: 'Product BG', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2940&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' } as any,
                { id: 'overlay', type: 'overlay', name: 'White Overlay', x: 140, y: 140, width: 800, height: 800, visible: true, locked: false, zIndex: 5, src: '', opacity: 0.9, rotation: 0, fit: 'cover' } as any, // White box using empty src + opacity? tricky, or maybe just a shape. studio mostly supports images/text/cta. 
                // Let's assume overlay type works or just use text/cta for now.
                { id: 'title', type: 'text', name: 'Sale Title', x: 190, y: 300, width: 700, height: 200, visible: true, locked: false, zIndex: 10, text: 'SUMMER\nSALE', fontSize: 90, fontWeight: 900, fontFamily: 'Playfair Display', color: '#000000', align: 'center', rotation: 0, opacity: 1, lineHeight: 0.9, letterSpacing: -2 } as any,
                { id: 'badge', type: 'cta', name: 'Discount', x: 415, y: 520, width: 250, height: 60, visible: true, locked: false, zIndex: 15, text: 'UP TO 50% OFF', fontSize: 20, fontWeight: 800, fontFamily: 'Inter', color: '#ffffff', bgColor: '#ef4444', radius: 50, rotation: 0, opacity: 1, lineHeight: 1 } as any,
                { id: 'cta', type: 'cta', name: 'Shop CTA', x: 390, y: 700, width: 300, height: 70, visible: true, locked: false, zIndex: 20, text: 'SHOP NOW', fontSize: 18, fontWeight: 700, fontFamily: 'Inter', color: '#000000', bgColor: '#FFFFFF', borderColor: '#000000', borderWidth: 2, radius: 0, rotation: 0, opacity: 1, lineHeight: 1 } as any
            ]
        }
    },
    // --- COACHING ---
    {
        id: 'tpl_coach_01',
        name: 'Webinar Invite',
        niche: 'coach',
        document: {
            backgroundColor: '#fdf4ff',
            layers: [
                { id: 'bg', type: 'background', name: 'Portrait', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2776&auto=format&fit=crop', opacity: 0.8, rotation: 0, fit: 'cover' } as any,
                { id: 'title', type: 'text', name: 'Headline', x: 60, y: 650, width: 900, height: 200, visible: true, locked: false, zIndex: 10, text: 'Master Your\nMindset.', fontSize: 80, fontWeight: 400, fontFamily: 'Playfair Display', fontStyle: 'italic', color: '#FFFFFF', align: 'left', rotation: 0, opacity: 1, lineHeight: 0.9, letterSpacing: -1, shadowColor: '#000000', shadowBlur: 20 } as any,
                { id: 'badge', type: 'cta', name: 'Live Badge', x: 60, y: 580, width: 180, height: 40, visible: true, locked: false, zIndex: 15, text: '🔴 LIVE WEBINAR', fontSize: 14, fontWeight: 700, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#db2777', radius: 20, rotation: 0, opacity: 1, lineHeight: 1 } as any,
                { id: 'cta', type: 'cta', name: 'Sign Up', x: 60, y: 900, width: 320, height: 70, visible: true, locked: false, zIndex: 20, text: 'SAVE YOUR SEAT', fontSize: 18, fontWeight: 800, fontFamily: 'Inter', color: '#000000', bgColor: '#FFFFFF', radius: 4, rotation: 0, opacity: 1, lineHeight: 1 } as any
            ]
        }
    },
    // --- JOB ---
    {
        id: 'tpl_job_01',
        name: 'Hiring Ad',
        niche: 'job',
        document: {
            backgroundColor: '#111827',
            layers: [
                { id: 'bg', type: 'background', name: 'Office', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2940&auto=format&fit=crop', opacity: 0.3, rotation: 0, fit: 'cover' } as any,
                { id: 'title', type: 'text', name: 'Headline', x: 90, y: 200, width: 900, height: 200, visible: true, locked: false, zIndex: 10, text: 'WE ARE\nHIRING', fontSize: 110, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', align: 'center', rotation: 0, opacity: 1, lineHeight: 0.85, letterSpacing: -4 } as any,
                { id: 'role', type: 'text', name: 'Roles', x: 240, y: 500, width: 600, height: 200, visible: true, locked: false, zIndex: 10, text: '• Senior Designer\n• Frontend Dev\n• Product Manager', fontSize: 32, fontWeight: 600, fontFamily: 'Inter', color: '#9ca3af', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.6, letterSpacing: 0 } as any,
                { id: 'cta', type: 'cta', name: 'Apply', x: 390, y: 850, width: 300, height: 75, visible: true, locked: false, zIndex: 20, text: 'APPLY NOW', fontSize: 20, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#16a34a', radius: 50, rotation: 0, opacity: 1, lineHeight: 1 } as any
            ]
        }
    },
    // --- FINANCE ---
    {
        id: 'tpl_finance_01',
        name: 'Financial Advisor',
        niche: 'finance',
        document: {
            backgroundColor: '#f8fafc',
            layers: [
                { id: 'accent', type: 'overlay', name: 'Blue Accent', x: 0, y: 0, width: 400, height: 1080, visible: true, locked: true, zIndex: 0, src: '', opacity: 1, rotation: 0, fit: 'cover' } as any,
                { id: 'title', type: 'text', name: 'Headline', x: 450, y: 300, width: 580, height: 200, visible: true, locked: false, zIndex: 10, text: 'Secure Your\nFinancial Future.', fontSize: 64, fontWeight: 800, fontFamily: 'Inter', color: '#0f172a', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.1, letterSpacing: -2 } as any,
                { id: 'trust', type: 'cta', name: 'Trust Badge', x: 450, y: 560, width: 220, height: 45, visible: true, locked: false, zIndex: 15, text: '✓ TRUSTED', fontSize: 14, fontWeight: 700, fontFamily: 'Inter', color: '#34d399', bgColor: '#1e293b', radius: 6, rotation: 0, opacity: 1, lineHeight: 1.2 } as any,
                { id: 'cta', type: 'cta', name: 'Consultation', x: 450, y: 700, width: 320, height: 70, visible: true, locked: false, zIndex: 20, text: 'FREE CONSULTATION', fontSize: 18, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#1e3a8a', radius: 8, rotation: 0, opacity: 1, lineHeight: 1.2 } as any
            ]
        }
    }
];
