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
    },
    // --- TRUST & BADGES ---
    {
        id: 'badge_guarantee',
        label: 'Money Back Guarantee',
        category: 'cta',
        preview: 'bg-yellow-400 text-black rounded-full border border-black p-1',
        tags: ['trust', 'guarantee', 'badge'],
        layerDetails: { type: 'cta', text: '30 DAY MONEY BACK', width: 220, height: 220, bgColor: '#facc15', color: '#000000', radius: 110, fontSize: 18, fontWeight: 800, borderColor: '#000000', borderWidth: 2 }
    },
    {
        id: 'badge_shipping',
        label: 'Fast Shipping',
        category: 'cta',
        preview: 'bg-black text-white rounded p-1',
        tags: ['shipping', 'delivery', 'fast'],
        layerDetails: { type: 'cta', text: '✈️ FAST SHIPPING', width: 240, height: 50, bgColor: '#000000', color: '#FFFFFF', radius: 4, fontSize: 16, fontWeight: 700 }
    },
    // --- FRAMES (Simulated with CTA/Text) ---
    {
        id: 'frame_testimonial',
        label: 'Testimonial Card',
        category: 'text',
        preview: 'bg-white shadow-lg text-black rounded-xl p-1',
        tags: ['testimonial', 'review', 'card'],
        layerDetails: { type: 'text', text: '⭐⭐⭐⭐⭐\n"This product changed my life! Highly recommended."\n- Sarah J.', width: 500, fontSize: 24, fontWeight: 500, fontFamily: 'Inter', color: '#1f2937', align: 'center', lineHeight: 1.4 }
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
                { id: 'bg', type: 'background', name: 'Workshop', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1581447100595-3a81355978ac?q=80&w=2940&auto=format&fit=crop', opacity: 0.6, rotation: 0, fit: 'cover' },
                { id: 'title', type: 'text', name: 'Headline', x: 90, y: 150, width: 900, height: 200, visible: true, locked: false, zIndex: 10, text: 'ECHTES HANDWERK.\nZEITLOSES DESIGN.', fontSize: 80, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.1, letterSpacing: -2 },
                { id: 'badge', type: 'cta', name: 'Master Badge', x: 90, y: 380, width: 300, height: 50, visible: true, locked: false, zIndex: 20, text: 'MEISTERBETRIEB', fontSize: 18, fontWeight: 900, fontFamily: 'Inter', color: '#f59e0b', bgColor: '#451a03', radius: 4, rotation: 0, opacity: 1, lineHeight: 1.2 }
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
                { id: 'grad', type: 'background', name: 'Gradient', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2864&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'title', type: 'text', name: 'Headline', x: 100, y: 750, width: 880, height: 100, visible: true, locked: false, zIndex: 10, text: 'Automate Everything.', fontSize: 72, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.1, letterSpacing: -3 },
                { id: 'cta', type: 'cta', name: 'Button', x: 390, y: 900, width: 300, height: 70, visible: true, locked: false, zIndex: 20, text: 'Try it Free', fontSize: 24, fontWeight: 700, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#2563eb', radius: 12, rotation: 0, opacity: 1, lineHeight: 1.2 }
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
                { id: 'bg', type: 'background', name: 'Property', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2940&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'overlay', type: 'overlay', name: 'Dark Overlay', x: 0, y: 700, width: 1080, height: 380, visible: true, locked: true, zIndex: 5, src: '', opacity: 0.9, rotation: 0, fit: 'cover' },
                { id: 'price', type: 'cta', name: 'Price Tag', x: 60, y: 750, width: 280, height: 80, visible: true, locked: false, zIndex: 10, text: '€ 1.250.000', fontSize: 32, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#f59e0b', radius: 8, rotation: 0, opacity: 1, lineHeight: 1.2 },
                { id: 'features', type: 'text', name: 'Features', x: 60, y: 860, width: 600, height: 50, visible: true, locked: false, zIndex: 10, text: '🛏 5 Beds  •  🚿 3 Baths  •  📐 320m²', fontSize: 22, fontWeight: 600, fontFamily: 'Inter', color: '#94a3b8', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.2, letterSpacing: 0 },
                { id: 'cta', type: 'cta', name: 'CTA', x: 60, y: 960, width: 280, height: 60, visible: true, locked: false, zIndex: 20, text: 'BOOK VIEWING →', fontSize: 16, fontWeight: 800, fontFamily: 'Inter', color: '#000000', bgColor: '#FFFFFF', radius: 30, rotation: 0, opacity: 1, lineHeight: 1.2 }
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
                { id: 'bg', type: 'background', name: 'Background Scene', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2940&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'product', type: 'product', name: 'Product Image', x: 140, y: 140, width: 800, height: 600, visible: true, locked: false, zIndex: 5, src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2799&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'contain' },
                { id: 'badge', type: 'cta', name: 'Special Badge', x: 60, y: 60, width: 200, height: 50, visible: true, locked: false, zIndex: 10, text: "TODAY'S SPECIAL", fontSize: 14, fontWeight: 900, fontFamily: 'Inter', color: '#fde047', bgColor: '#b91c1c', radius: 25, rotation: 0, opacity: 1, lineHeight: 1.2 },
                { id: 'title', type: 'text', name: 'Dish Name', x: 60, y: 800, width: 800, height: 120, visible: true, locked: false, zIndex: 10, text: 'Signature\nPasta Carbonara', fontSize: 60, fontWeight: 900, fontFamily: 'Playfair Display', color: '#FFFFFF', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.0, letterSpacing: -1 },
                { id: 'cta', type: 'cta', name: 'Order CTA', x: 60, y: 960, width: 260, height: 60, visible: true, locked: false, zIndex: 20, text: '🍕 ORDER NOW', fontSize: 18, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#22c55e', radius: 12, rotation: 0, opacity: 1, lineHeight: 1.2 }
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
                { id: 'bg', type: 'background', name: 'Gym Photo', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2940&auto=format&fit=crop', opacity: 0.7, rotation: 0, fit: 'cover' },
                { id: 'title', type: 'text', name: 'Headline', x: 60, y: 200, width: 960, height: 200, visible: true, locked: false, zIndex: 10, text: 'TRANSFORM\nYOUR BODY', fontSize: 100, fontWeight: 900, fontFamily: 'Oswald', color: '#FFFFFF', align: 'left', rotation: 0, opacity: 1, lineHeight: 0.95, letterSpacing: -2 },
                { id: 'offer', type: 'cta', name: 'Free Trial', x: 60, y: 450, width: 240, height: 60, visible: true, locked: false, zIndex: 15, text: '7 DAYS FREE', fontSize: 22, fontWeight: 900, fontFamily: 'Inter', color: '#a3e635', bgColor: '#000000', radius: 6, rotation: 0, opacity: 1, lineHeight: 1.2 },
                { id: 'cta', type: 'cta', name: 'Start CTA', x: 60, y: 900, width: 340, height: 75, visible: true, locked: false, zIndex: 20, text: 'START YOUR JOURNEY', fontSize: 20, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#f97316', radius: 12, rotation: 0, opacity: 1, lineHeight: 1.2 }
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
                { id: 'bg', type: 'background', name: 'Party BG', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2940&auto=format&fit=crop', opacity: 0.5, rotation: 0, fit: 'cover' },
                { id: 'title', type: 'text', name: 'Event Title', x: 90, y: 300, width: 900, height: 300, visible: true, locked: false, zIndex: 10, text: "NEW YEAR'S\nEVE BASH", fontSize: 100, fontWeight: 900, fontFamily: 'Oswald', color: '#ec4899', align: 'center', rotation: 0, opacity: 1, lineHeight: 0.9, letterSpacing: 0 },
                { id: 'date', type: 'cta', name: 'Date Badge', x: 400, y: 650, width: 280, height: 70, visible: true, locked: false, zIndex: 15, text: 'DEC 31 • 10PM', fontSize: 24, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#9333ea', radius: 16, rotation: 0, opacity: 1, lineHeight: 1.2 },
                { id: 'cta', type: 'cta', name: 'Tickets', x: 365, y: 900, width: 350, height: 80, visible: true, locked: false, zIndex: 20, text: '🎟 GET TICKETS', fontSize: 26, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#ec4899', radius: 40, rotation: 0, opacity: 1, lineHeight: 1.2 }
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
                { id: 'bg', type: 'background', name: 'Background Scene', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2940&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'overlay', type: 'overlay', name: 'White Overlay', x: 140, y: 140, width: 800, height: 800, visible: true, locked: false, zIndex: 5, src: '', opacity: 0.9, rotation: 0, fit: 'cover' },
                { id: 'product', type: 'product', name: 'Product Image', x: 240, y: 200, width: 600, height: 500, visible: true, locked: false, zIndex: 6, src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2940&auto=format&fit=contain', opacity: 1, rotation: 0, fit: 'contain' },
                { id: 'title', type: 'text', name: 'Sale Title', x: 190, y: 300, width: 700, height: 200, visible: true, locked: false, zIndex: 10, text: 'SUMMER\nSALE', fontSize: 90, fontWeight: 900, fontFamily: 'Playfair Display', color: '#000000', align: 'center', rotation: 0, opacity: 1, lineHeight: 0.9, letterSpacing: -2 },
                { id: 'badge', type: 'cta', name: 'Discount', x: 415, y: 520, width: 250, height: 60, visible: true, locked: false, zIndex: 15, text: 'UP TO 50% OFF', fontSize: 20, fontWeight: 800, fontFamily: 'Inter', color: '#ffffff', bgColor: '#ef4444', radius: 50, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'cta', type: 'cta', name: 'Shop CTA', x: 390, y: 700, width: 300, height: 70, visible: true, locked: false, zIndex: 20, text: 'SHOP NOW', fontSize: 18, fontWeight: 700, fontFamily: 'Inter', color: '#000000', bgColor: '#FFFFFF', borderColor: '#000000', borderWidth: 2, radius: 0, rotation: 0, opacity: 1, lineHeight: 1 }
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
                { id: 'bg', type: 'background', name: 'Portrait', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2776&auto=format&fit=crop', opacity: 0.8, rotation: 0, fit: 'cover' },
                { id: 'title', type: 'text', name: 'Headline', x: 60, y: 650, width: 900, height: 200, visible: true, locked: false, zIndex: 10, text: 'Master Your\nMindset.', fontSize: 80, fontWeight: 400, fontFamily: 'Playfair Display', fontStyle: 'italic', color: '#FFFFFF', align: 'left', rotation: 0, opacity: 1, lineHeight: 0.9, letterSpacing: -1, shadowColor: '#000000', shadowBlur: 20 },
                { id: 'badge', type: 'cta', name: 'Live Badge', x: 60, y: 580, width: 180, height: 40, visible: true, locked: false, zIndex: 15, text: '🔴 LIVE WEBINAR', fontSize: 14, fontWeight: 700, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#db2777', radius: 20, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'cta', type: 'cta', name: 'Sign Up', x: 60, y: 900, width: 320, height: 70, visible: true, locked: false, zIndex: 20, text: 'SAVE YOUR SEAT', fontSize: 18, fontWeight: 800, fontFamily: 'Inter', color: '#000000', bgColor: '#FFFFFF', radius: 4, rotation: 0, opacity: 1, lineHeight: 1 }
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
                { id: 'bg', type: 'background', name: 'Office', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2940&auto=format&fit=crop', opacity: 0.3, rotation: 0, fit: 'cover' },
                { id: 'title', type: 'text', name: 'Headline', x: 90, y: 200, width: 900, height: 200, visible: true, locked: false, zIndex: 10, text: 'WE ARE\nHIRING', fontSize: 110, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', align: 'center', rotation: 0, opacity: 1, lineHeight: 0.85, letterSpacing: -4 },
                { id: 'role', type: 'text', name: 'Roles', x: 240, y: 500, width: 600, height: 200, visible: true, locked: false, zIndex: 10, text: '• Senior Designer\n• Frontend Dev\n• Product Manager', fontSize: 32, fontWeight: 600, fontFamily: 'Inter', color: '#9ca3af', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.6, letterSpacing: 0 },
                { id: 'cta', type: 'cta', name: 'Apply', x: 390, y: 850, width: 300, height: 75, visible: true, locked: false, zIndex: 20, text: 'APPLY NOW', fontSize: 20, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#16a34a', radius: 50, rotation: 0, opacity: 1, lineHeight: 1 }
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
                { id: 'accent', type: 'overlay', name: 'Blue Accent', x: 0, y: 0, width: 400, height: 1080, visible: true, locked: true, zIndex: 0, src: '', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'title', type: 'text', name: 'Headline', x: 450, y: 300, width: 580, height: 200, visible: true, locked: false, zIndex: 10, text: 'Secure Your\nFinancial Future.', fontSize: 64, fontWeight: 800, fontFamily: 'Inter', color: '#0f172a', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.1, letterSpacing: -2 },
                { id: 'trust', type: 'cta', name: 'Trust Badge', x: 450, y: 560, width: 220, height: 45, visible: true, locked: false, zIndex: 15, text: '✓ TRUSTED', fontSize: 14, fontWeight: 700, fontFamily: 'Inter', color: '#34d399', bgColor: '#1e293b', radius: 6, rotation: 0, opacity: 1, lineHeight: 1.2 },
                { id: 'cta', type: 'cta', name: 'Consultation', x: 450, y: 700, width: 320, height: 70, visible: true, locked: false, zIndex: 20, text: 'FREE CONSULTATION', fontSize: 18, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#1e3a8a', radius: 8, rotation: 0, opacity: 1, lineHeight: 1.2 }
            ]
        }
    },
    // --- COMMERCE / DROPSHIPPING ---
    {
        id: 'tpl_dropship_01',
        name: 'Viral Gadget',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#000000',
            layers: [
                { id: 'bg', type: 'background', name: 'Background Scene', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2940&auto=format&fit=crop', opacity: 0.4, rotation: 0, fit: 'cover' },
                { id: 'product', type: 'product', name: 'Product Image', x: 140, y: 200, width: 800, height: 600, visible: true, locked: false, zIndex: 5, src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2940&auto=format&fit=contain', opacity: 1, rotation: 0, fit: 'contain' },
                { id: 'overlay', type: 'overlay', name: 'Gradient', x: 0, y: 700, width: 1080, height: 380, visible: true, locked: true, zIndex: 5, src: '', opacity: 0.9, rotation: 0, fit: 'cover' },
                { id: 'headline', type: 'text', name: 'Headline', x: 60, y: 80, width: 960, height: 150, visible: true, locked: false, zIndex: 10, text: 'PROBLEM?\nSOLVED.', fontSize: 100, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', align: 'left', rotation: 0, opacity: 1, lineHeight: 0.9, letterSpacing: -4, shadowColor: '#000000', shadowBlur: 20 },
                { id: 'badge', type: 'cta', name: 'Viral Badge', x: 60, y: 300, width: 300, height: 60, visible: true, locked: false, zIndex: 15, text: '⭐ #1 BESTSELLER', fontSize: 20, fontWeight: 800, fontFamily: 'Inter', color: '#000000', bgColor: '#facc15', radius: 4, rotation: -3, opacity: 1, lineHeight: 1 },
                { id: 'feature1', type: 'cta', name: 'Feature 1', x: 60, y: 750, width: 280, height: 50, visible: true, locked: false, zIndex: 20, text: '✅ Instant Setup', fontSize: 16, fontWeight: 700, fontFamily: 'Inter', color: '#FFFFFF', bgColor: 'rgba(255,255,255,0.1)', radius: 30, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'feature2', type: 'cta', name: 'Feature 2', x: 360, y: 750, width: 280, height: 50, visible: true, locked: false, zIndex: 20, text: '🔋 24h Battery', fontSize: 16, fontWeight: 700, fontFamily: 'Inter', color: '#FFFFFF', bgColor: 'rgba(255,255,255,0.1)', radius: 30, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'cta', type: 'cta', name: 'Shop CTA', x: 60, y: 880, width: 960, height: 100, visible: true, locked: false, zIndex: 25, text: 'GET 50% OFF TODAY 👉', fontSize: 36, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#ef4444', radius: 16, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },
    {
        id: 'tpl_dropship_02',
        name: 'Before & After',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#ffffff',
            layers: [
                { id: 'bg_before', type: 'background', name: 'Before Image', x: 0, y: 0, width: 540, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?q=80&w=2752&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'bg_after', type: 'background', name: 'After Image', x: 540, y: 0, width: 540, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=2779&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'overlay_b', type: 'overlay', name: 'Darken Before', x: 0, y: 800, width: 540, height: 280, visible: true, locked: false, zIndex: 5, src: '', opacity: 0.6, rotation: 0, fit: 'cover' },
                { id: 'overlay_a', type: 'overlay', name: 'Darken After', x: 540, y: 800, width: 540, height: 280, visible: true, locked: false, zIndex: 5, src: '', opacity: 0.6, rotation: 0, fit: 'cover' },
                { id: 'lbl_before', type: 'cta', name: 'Before Label', x: 120, y: 900, width: 300, height: 60, visible: true, locked: false, zIndex: 10, text: '❌ BEFORE', fontSize: 32, fontWeight: 800, fontFamily: 'Inter', color: '#ef4444', bgColor: '#FFFFFF', radius: 8, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'lbl_after', type: 'cta', name: 'After Label', x: 660, y: 900, width: 300, height: 60, visible: true, locked: false, zIndex: 10, text: '✅ AFTER', fontSize: 32, fontWeight: 800, fontFamily: 'Inter', color: '#22c55e', bgColor: '#FFFFFF', radius: 8, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'divider', type: 'overlay', name: 'Divider', x: 535, y: 0, width: 10, height: 1080, visible: true, locked: true, zIndex: 20, src: '', opacity: 1, rotation: 0, fit: 'cover' }
            ]
        }
    },
    // --- GASTRONOMY ---
    {
        id: 'tpl_food_02',
        name: 'Burger Deal',
        niche: 'food',
        document: {
            backgroundColor: '#121212',
            layers: [
                { id: 'bg', type: 'background', name: 'Burger', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2799&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'price_circle', type: 'cta', name: 'Price Badge', x: 750, y: 80, width: 250, height: 250, visible: true, locked: false, zIndex: 15, text: 'ONLY\n$9.99', fontSize: 48, fontWeight: 900, fontFamily: 'Rubik', color: '#000000', bgColor: '#fbbf24', radius: 125, rotation: 10, opacity: 1, lineHeight: 0.9 },
                { id: 'title', type: 'text', name: 'Headline', x: 60, y: 800, width: 900, height: 150, visible: true, locked: false, zIndex: 10, text: 'ULTIMATE\nCHEESEBURGER', fontSize: 80, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', align: 'left', rotation: 0, opacity: 1, lineHeight: 0.9, letterSpacing: -2, shadowColor: '#000000', shadowBlur: 10 },
                { id: 'cta', type: 'cta', name: 'Order Button', x: 60, y: 960, width: 300, height: 70, visible: true, locked: false, zIndex: 20, text: 'ORDER NOW', fontSize: 24, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#dc2626', radius: 50, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },
    // --- SAAS B2B ---
    {
        id: 'tpl_saas_02',
        name: 'B2B Dashboard',
        niche: 'saas',
        document: {
            backgroundColor: '#0f172a',
            layers: [
                { id: 'bg', type: 'background', name: 'Abstract Tech', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2924&auto=format&fit=crop', opacity: 0.2, rotation: 0, fit: 'cover' },
                { id: 'dashboard', type: 'background', name: 'App Screenshot', x: 140, y: 300, width: 800, height: 500, visible: true, locked: false, zIndex: 5, src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'contain' }, // Simulate dashboard
                { id: 'title', type: 'text', name: 'Headline', x: 0, y: 80, width: 1080, height: 150, visible: true, locked: false, zIndex: 10, text: 'Scale Your Business\nWith AI Analytics', fontSize: 72, fontWeight: 700, fontFamily: 'Inter', color: '#FFFFFF', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.1, letterSpacing: -2 },
                { id: 'cta', type: 'cta', name: 'Demo CTA', x: 390, y: 880, width: 300, height: 70, visible: true, locked: false, zIndex: 20, text: 'Book Demo', fontSize: 20, fontWeight: 600, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#3b82f6', radius: 8, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },
    // --- COACHING ---
    {
        id: 'tpl_coach_02',
        name: 'Masterclass Invite',
        niche: 'coach',
        document: {
            backgroundColor: '#fffbeb',
            layers: [
                { id: 'bg', type: 'background', name: 'Speaker', x: 500, y: 200, width: 800, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2787&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'box', type: 'overlay', name: 'Text Box', x: 60, y: 150, width: 600, height: 600, visible: true, locked: false, zIndex: 5, src: '', opacity: 0.9, rotation: 0, fit: 'cover' },
                { id: 'eyebrow', type: 'text', name: 'Eyebrow', x: 80, y: 200, width: 500, height: 50, visible: true, locked: false, zIndex: 10, text: 'FREE MASTERCLASS', fontSize: 20, fontWeight: 800, fontFamily: 'Inter', color: '#b45309', align: 'left', rotation: 0, opacity: 1, lineHeight: 1, letterSpacing: 2 },
                { id: 'title', type: 'text', name: 'Headline', x: 80, y: 270, width: 550, height: 300, visible: true, locked: false, zIndex: 10, text: 'How To Build\nA 6-Figure\nCoaching Biz', fontSize: 72, fontWeight: 900, fontFamily: 'Inter', color: '#1e293b', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.0, letterSpacing: -2 },
                { id: 'cta', type: 'cta', name: 'Register CTA', x: 80, y: 600, width: 350, height: 75, visible: true, locked: false, zIndex: 20, text: 'REGISTER FOR FREE', fontSize: 20, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#b45309', radius: 0, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // ========================================
    // PREMIUM TEMPLATES - FACEBOOK AD LIBRARY INSPIRED
    // ========================================

    // --- UGC TESTIMONIAL STYLE ---
    {
        id: 'tpl_ugc_01',
        name: 'UGC Testimonial',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#f8fafc',
            layers: [
                { id: 'bg', type: 'background', name: 'Customer Photo', x: 0, y: 0, width: 1080, height: 700, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'quote_box', type: 'overlay', name: 'Quote Background', x: 0, y: 650, width: 1080, height: 430, visible: true, locked: true, zIndex: 5, src: '', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'stars', type: 'text', name: 'Star Rating', x: 60, y: 700, width: 400, height: 50, visible: true, locked: false, zIndex: 10, text: '⭐⭐⭐⭐⭐', fontSize: 36, fontWeight: 400, fontFamily: 'Inter', color: '#facc15', align: 'left', rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'quote', type: 'text', name: 'Testimonial', x: 60, y: 760, width: 960, height: 200, visible: true, locked: false, zIndex: 10, text: '"This completely changed my routine. I can\'t imagine life without it anymore!"', fontSize: 36, fontWeight: 500, fontFamily: 'Inter', fontStyle: 'italic', color: '#1e293b', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.3 },
                { id: 'name', type: 'text', name: 'Customer Name', x: 60, y: 950, width: 400, height: 40, visible: true, locked: false, zIndex: 10, text: '— Sarah M., verified buyer', fontSize: 20, fontWeight: 600, fontFamily: 'Inter', color: '#64748b', align: 'left', rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'cta', type: 'cta', name: 'Shop CTA', x: 700, y: 950, width: 320, height: 70, visible: true, locked: false, zIndex: 20, text: 'SHOP NOW →', fontSize: 20, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#0f172a', radius: 8, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // --- PROBLEM-SOLUTION STYLE ---
    {
        id: 'tpl_problem_solution',
        name: 'Problem → Solution',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#ffffff',
            layers: [
                { id: 'problem_side', type: 'overlay', name: 'Problem Side', x: 0, y: 0, width: 540, height: 1080, visible: true, locked: true, zIndex: 0, src: '', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'solution_side', type: 'overlay', name: 'Solution Side', x: 540, y: 0, width: 540, height: 1080, visible: true, locked: true, zIndex: 0, src: '', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'problem_icon', type: 'text', name: 'Problem Emoji', x: 150, y: 250, width: 240, height: 200, visible: true, locked: false, zIndex: 10, text: '😫', fontSize: 150, fontWeight: 400, fontFamily: 'Inter', color: '#000000', align: 'center', rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'solution_icon', type: 'text', name: 'Solution Emoji', x: 690, y: 250, width: 240, height: 200, visible: true, locked: false, zIndex: 10, text: '🥳', fontSize: 150, fontWeight: 400, fontFamily: 'Inter', color: '#000000', align: 'center', rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'problem_text', type: 'text', name: 'Problem Text', x: 40, y: 480, width: 460, height: 300, visible: true, locked: false, zIndex: 10, text: 'Tired of\nwasting money\non products\nthat don\'t work?', fontSize: 40, fontWeight: 700, fontFamily: 'Inter', color: '#dc2626', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.2 },
                { id: 'solution_text', type: 'text', name: 'Solution Text', x: 580, y: 480, width: 460, height: 300, visible: true, locked: false, zIndex: 10, text: 'Finally,\na solution\nthat actually\nworks.', fontSize: 40, fontWeight: 700, fontFamily: 'Inter', color: '#16a34a', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.2 },
                { id: 'cta', type: 'cta', name: 'CTA', x: 290, y: 900, width: 500, height: 100, visible: true, locked: false, zIndex: 20, text: 'TRY IT RISK-FREE', fontSize: 32, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#16a34a', radius: 16, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // --- FEATURE SPOTLIGHT STYLE ---
    {
        id: 'tpl_feature_spotlight',
        name: 'Feature Spotlight',
        niche: 'saas',
        document: {
            backgroundColor: '#0f172a',
            layers: [
                { id: 'product', type: 'background', name: 'Product Image', x: 290, y: 100, width: 500, height: 500, visible: true, locked: false, zIndex: 5, src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2940&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'contain' },
                { id: 'feature1', type: 'cta', name: 'Feature 1', x: 60, y: 650, width: 300, height: 80, visible: true, locked: false, zIndex: 10, text: '🚀 10x Faster', fontSize: 24, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: 'rgba(59,130,246,0.3)', radius: 16, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'feature2', type: 'cta', name: 'Feature 2', x: 390, y: 650, width: 300, height: 80, visible: true, locked: false, zIndex: 10, text: '✨ AI-Powered', fontSize: 24, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: 'rgba(147,51,234,0.3)', radius: 16, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'feature3', type: 'cta', name: 'Feature 3', x: 720, y: 650, width: 300, height: 80, visible: true, locked: false, zIndex: 10, text: '🔒 Enterprise', fontSize: 24, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: 'rgba(16,185,129,0.3)', radius: 16, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'headline', type: 'text', name: 'Headline', x: 60, y: 780, width: 960, height: 120, visible: true, locked: false, zIndex: 10, text: 'The Future of\nProductivity', fontSize: 72, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.0, letterSpacing: -3 },
                { id: 'cta', type: 'cta', name: 'CTA', x: 340, y: 940, width: 400, height: 80, visible: true, locked: false, zIndex: 20, text: 'Start Free Trial', fontSize: 26, fontWeight: 700, fontFamily: 'Inter', color: '#0f172a', bgColor: '#FFFFFF', radius: 12, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // --- BOLD HEADLINE STYLE (Magic Spoon inspired) ---
    {
        id: 'tpl_bold_headline',
        name: 'Bold Statement',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#fef3c7',
            layers: [
                { id: 'product', type: 'background', name: 'Product', x: 200, y: 350, width: 680, height: 680, visible: true, locked: false, zIndex: 5, src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2940&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'contain' },
                { id: 'line1', type: 'text', name: 'Line 1', x: 60, y: 80, width: 960, height: 80, visible: true, locked: false, zIndex: 10, text: 'LESS SUGAR.', fontSize: 72, fontWeight: 900, fontFamily: 'Inter', color: '#0f172a', align: 'center', rotation: 0, opacity: 1, lineHeight: 1, letterSpacing: -2 },
                { id: 'line2', type: 'text', name: 'Line 2', x: 60, y: 160, width: 960, height: 80, visible: true, locked: false, zIndex: 10, text: 'MORE FLAVOR.', fontSize: 72, fontWeight: 900, fontFamily: 'Inter', color: '#dc2626', align: 'center', rotation: 0, opacity: 1, lineHeight: 1, letterSpacing: -2 },
                { id: 'line3', type: 'text', name: 'Line 3', x: 60, y: 240, width: 960, height: 80, visible: true, locked: false, zIndex: 10, text: 'ALL THE FUN.', fontSize: 72, fontWeight: 900, fontFamily: 'Inter', color: '#2563eb', align: 'center', rotation: 0, opacity: 1, lineHeight: 1, letterSpacing: -2 },
                { id: 'cta', type: 'cta', name: 'CTA', x: 340, y: 950, width: 400, height: 80, visible: true, locked: false, zIndex: 20, text: 'GET YOURS NOW', fontSize: 24, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#0f172a', radius: 50, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // --- SOCIAL PROOF / TRUST STYLE ---
    {
        id: 'tpl_social_proof',
        name: 'Social Proof',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#f0fdf4',
            layers: [
                { id: 'product', type: 'background', name: 'Product', x: 290, y: 200, width: 500, height: 500, visible: true, locked: false, zIndex: 5, src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2940&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'contain' },
                { id: 'badge', type: 'cta', name: 'Bestseller Badge', x: 365, y: 60, width: 350, height: 70, visible: true, locked: false, zIndex: 15, text: '⭐ #1 BESTSELLER', fontSize: 28, fontWeight: 900, fontFamily: 'Inter', color: '#000000', bgColor: '#fde047', radius: 50, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'reviews', type: 'text', name: 'Reviews', x: 200, y: 720, width: 680, height: 80, visible: true, locked: false, zIndex: 10, text: '⭐⭐⭐⭐⭐ 4.9 • 12,847 Reviews', fontSize: 32, fontWeight: 700, fontFamily: 'Inter', color: '#16a34a', align: 'center', rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'trust1', type: 'cta', name: 'Trust Badge 1', x: 80, y: 820, width: 280, height: 50, visible: true, locked: false, zIndex: 10, text: '✅ Free Shipping', fontSize: 18, fontWeight: 700, fontFamily: 'Inter', color: '#16a34a', bgColor: '#dcfce7', radius: 25, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'trust2', type: 'cta', name: 'Trust Badge 2', x: 400, y: 820, width: 280, height: 50, visible: true, locked: false, zIndex: 10, text: '✅ 30-Day Returns', fontSize: 18, fontWeight: 700, fontFamily: 'Inter', color: '#16a34a', bgColor: '#dcfce7', radius: 25, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'trust3', type: 'cta', name: 'Trust Badge 3', x: 720, y: 820, width: 280, height: 50, visible: true, locked: false, zIndex: 10, text: '✅ Secure Payment', fontSize: 18, fontWeight: 700, fontFamily: 'Inter', color: '#16a34a', bgColor: '#dcfce7', radius: 25, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'cta', type: 'cta', name: 'CTA', x: 290, y: 920, width: 500, height: 90, visible: true, locked: false, zIndex: 20, text: 'CLAIM 50% OFF →', fontSize: 28, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#16a34a', radius: 16, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // --- LIMITED TIME OFFER STYLE ---
    {
        id: 'tpl_limited_offer',
        name: 'Flash Sale',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#dc2626',
            layers: [
                { id: 'timer_badge', type: 'cta', name: 'Timer', x: 290, y: 60, width: 500, height: 70, visible: true, locked: false, zIndex: 15, text: '⏰ ENDS IN 2 HOURS', fontSize: 28, fontWeight: 900, fontFamily: 'Inter', color: '#dc2626', bgColor: '#FFFFFF', radius: 50, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'discount', type: 'text', name: 'Discount', x: 60, y: 300, width: 960, height: 300, visible: true, locked: false, zIndex: 10, text: '70%\nOFF', fontSize: 200, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', align: 'center', rotation: 0, opacity: 1, lineHeight: 0.85, letterSpacing: -10 },
                { id: 'subtitle', type: 'text', name: 'Subtitle', x: 140, y: 680, width: 800, height: 60, visible: true, locked: false, zIndex: 10, text: 'Our biggest sale ever. Don\'t miss out.', fontSize: 32, fontWeight: 500, fontFamily: 'Inter', color: '#fecaca', align: 'center', rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'code', type: 'cta', name: 'Code', x: 290, y: 780, width: 500, height: 80, visible: true, locked: false, zIndex: 15, text: 'USE CODE: FLASH70', fontSize: 28, fontWeight: 800, fontFamily: 'Inter', color: '#0f172a', bgColor: '#fde047', radius: 8, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'cta', type: 'cta', name: 'CTA', x: 240, y: 910, width: 600, height: 100, visible: true, locked: false, zIndex: 20, text: 'SHOP NOW', fontSize: 40, fontWeight: 900, fontFamily: 'Inter', color: '#dc2626', bgColor: '#FFFFFF', radius: 16, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // ========================================
    // 🔥 META PERFORMANCE TEMPLATES 2024/2025
    // Based on proven conversion data
    // ========================================

    // 1. UGC TESTIMONIAL  (4x CTR, 50% lower CPC)
    {
        id: 'meta_ugc_testimonial_v1',
        name: '⭐ UGC Testimonial',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#f8fafc',
            layers: [
                { id: 'customer', type: 'background', name: 'Customer Photo', role: 'bg_image', x: 0, y: 0, width: 1080, height: 650, visible: true, locked: false, zIndex: 0, src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2940&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'rating', type: 'text', name: 'Star Rating', role: 'social_proof', x: 60, y: 700, width: 400, height: 60, visible: true, locked: false, zIndex: 10, text: '⭐⭐⭐⭐⭐', fontSize: 48, fontWeight: 400, fontFamily: 'Inter', color: '#facc15', align: 'left', rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'quote', type: 'text', name: 'Testimonial', role: 'description', x: 60, y: 780, width: 960, height: 160, visible: true, locked: false, zIndex: 10, text: '"I was skeptical but this actually works! My skin has never looked better."', fontSize: 34, fontWeight: 500, fontFamily: 'Inter', fontStyle: 'italic', color: '#1e293b', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.3 },
                { id: 'verified', type: 'cta', name: 'Verified Badge', x: 60, y: 975, width: 260, height: 50, visible: true, locked: false, zIndex: 15, text: '✓ Verified Buyer', fontSize: 18, fontWeight: 700, fontFamily: 'Inter', color: '#16a34a', bgColor: '#dcfce7', radius: 25, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'cta', type: 'cta', name: 'CTA', role: 'cta', x: 700, y: 965, width: 320, height: 70, visible: true, locked: false, zIndex: 20, text: 'TRY IT NOW →', fontSize: 20, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#0f172a', radius: 8, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // 2. HOOK + PROBLEM-AGITATE-SOLVE
    {
        id: 'meta_hook_pas_v1',
        name: '🎯 Hook + PAS',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#0f172a',
            layers: [
                { id: 'hook', type: 'text', name: 'Hook', role: 'headline', x: 60, y: 100, width: 960, height: 180, visible: true, locked: false, zIndex: 10, text: 'STOP\nSCROLLING', fontSize: 110, fontWeight: 900, fontFamily: 'Inter', color: '#fbbf24', align: 'center', rotation: 0, opacity: 1, lineHeight: 0.9, letterSpacing: -4 },
                { id: 'problem', type: 'text', name: 'Problem', role: 'subheadline', x: 90, y: 350, width: 900, height: 120, visible: true, locked: false, zIndex: 10, text: 'Tired of products that promise results but never deliver?', fontSize: 40, fontWeight: 700, fontFamily: 'Inter', color: '#ef4444', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.2 },
                { id: 'agitate', type: 'text', name: 'Agitate', role: 'description', x: 90, y: 500, width: 900, height: 160, visible: true, locked: false, zIndex: 10, text: 'You\'ve wasted hundreds on "miracle" solutions. Each one disappoints.', fontSize: 32, fontWeight: 500, fontFamily: 'Inter', color: '#94a3b8', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.4 },
                { id: 'solution', type: 'text', name: 'Solution', role: 'social_proof', x: 90, y: 700, width: 900, height: 100, visible: true, locked: false, zIndex: 10, text: 'This actually works. 12,847 5-star reviews prove it.', fontSize: 34, fontWeight: 700, fontFamily: 'Inter', color: '#22c55e', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.3 },
                { id: 'cta', type: 'cta', name: 'CTA', role: 'cta', x: 290, y: 880, width: 500, height: 90, visible: true, locked: false, zIndex: 20, text: 'CLAIM 60% OFF', fontSize: 32, fontWeight: 900, fontFamily: 'Inter', color: '#0f172a', bgColor: '#fbbf24', radius: 16, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // 3. "UGLY AD" POST-IT STYLE (Pattern Interrupt)
    {
        id: 'meta_ugly_postit_v1',
        name: '📝 Ugly Ad Post-it',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#fef3c7',
            layers: [
                { id: 'postit_bg', type: 'overlay', name: 'Post-it Background', x: 90, y: 150, width: 900, height: 700, visible: true, locked: false, zIndex: 5, src: '', opacity: 1, rotation: -2, fit: 'cover' },
                { id: 'handwritten', type: 'text', name: 'Handwritten Text', x: 140, y: 220, width: 800, height: 500, visible: true, locked: false, zIndex: 10, text: 'Seriously\ntry this!!\n\nChanged my life\n\n12k+ ⭐⭐⭐⭐⭐', fontSize: 64, fontWeight: 400, fontFamily: 'Caveat', color: '#0f172a', align: 'center', rotation: -1, opacity: 1, lineHeight: 1.3, letterSpacing: 0 },
                { id: 'arrow', type: 'text', name: 'Arrow', x: 750, y: 650, width: 200, height: 100, visible: true, locked: false, zIndex: 15, text: '↓', fontSize: 120, fontWeight: 400, fontFamily: 'Inter', color: '#dc2626', align: 'center', rotation: 15, opacity: 1, lineHeight: 1 },
                { id: 'cta', type: 'cta', name: 'CTA', x: 290, y: 900, width: 500, height: 80, visible: true, locked: false, zIndex: 20, text: 'SHOP NOW', fontSize: 28, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#000000', radius: 50, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // 4. BEFORE/AFTER SPLIT SCREEN
    {
        id: 'meta_before_after_v1',
        name: '↔️ Before/After',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#ffffff',
            layers: [
                { id: 'before_img', type: 'background', name: 'Before', role: 'bg_image', x: 0, y: 0, width: 540, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?q=80&w=2752&auto=format&fit=crop', opacity: 0.7, rotation: 0, fit: 'cover' },
                { id: 'after_img', type: 'background', name: 'After', role: 'product_image', x: 540, y: 0, width: 540, height: 1080, visible: true, locked: true, zIndex: 0, src: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=2779&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'before_label', type: 'cta', name: 'Before Label', x: 120, y: 100, width: 300, height: 80, visible: true, locked: false, zIndex: 10, text: '❌ BEFORE', fontSize: 36, fontWeight: 900, fontFamily: 'Inter', color: '#ef4444', bgColor: '#FFFFFF', radius: 12, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'after_label', type: 'cta', name: 'After Label', x: 660, y: 100, width: 300, height: 80, visible: true, locked: false, zIndex: 10, text: '✅ AFTER', fontSize: 36, fontWeight: 900, fontFamily: 'Inter', color: '#22c55e', bgColor: '#FFFFFF', radius: 12, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'stats', type: 'text', name: 'Social Proof', role: 'social_proof', x: 200, y: 900, width: 680, height: 70, visible: true, locked: false, zIndex: 10, text: '47,291 transformations in 2024', fontSize: 32, fontWeight: 700, fontFamily: 'Inter', color: '#FFFFFF', align: 'center', rotation: 0, opacity: 1, lineHeight: 1, shadowColor: '#000000', shadowBlur: 20 },
                { id: 'cta', type: 'cta', name: 'CTA', role: 'cta', x: 290, y: 990, width: 500, height: 70, visible: true, locked: false, zIndex: 20, text: 'GET RESULTS →', fontSize: 24, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#16a34a', radius: 50, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // 5. SOCIAL PROOF OVERLOAD
    {
        id: 'meta_social_proof_v1',
        name: '🏆 Social Proof Max',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#f0fdf4',
            layers: [
                { id: 'product', type: 'background', name: 'Product', role: 'product_image', x: 290, y: 200, width: 500, height: 500, visible: true, locked: false, zIndex: 5, src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2940&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'contain' },
                { id: 'bestseller', type: 'cta', name: 'Bestseller', x: 340, y: 60, width: 400, height: 80, visible: true, locked: false, zIndex: 15, text: '⭐ #1 BESTSELLER', fontSize: 32, fontWeight: 900, fontFamily: 'Inter', color: '#000000', bgColor: '#fde047', radius: 50, rotation: -3, opacity: 1, lineHeight: 1 },
                { id: 'reviews', type: 'text', name: 'Reviews', role: 'social_proof', x: 180, y: 720, width: 720, height: 70, visible: true, locked: false, zIndex: 10, text: '⭐⭐⭐⭐⭐ 4.9/5 • 18,394 Reviews', fontSize: 36, fontWeight: 800, fontFamily: 'Inter', color: '#16a34a', align: 'center', rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'trust1', type: 'cta', name: 'Trust 1', x: 60, y: 820, width: 300, height: 55, visible: true, locked: false, zIndex: 10, text: '✅ Free Shipping', fontSize: 20, fontWeight: 700, fontFamily: 'Inter', color: '#16a34a', bgColor: '#dcfce7', radius: 30, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'trust2', type: 'cta', name: 'Trust 2', x: 390, y: 820, width: 300, height: 55, visible: true, locked: false, zIndex: 10, text: '✅ 30-Day Returns', fontSize: 20, fontWeight: 700, fontFamily: 'Inter', color: '#16a34a', bgColor: '#dcfce7', radius: 30, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'trust3', type: 'cta', name: 'Trust 3', x: 720, y: 820, width: 300, height: 55, visible: true, locked: false, zIndex: 10, text: '✅ 24/7 Support', fontSize: 20, fontWeight: 700, fontFamily: 'Inter', color: '#16a34a', bgColor: '#dcfce7', radius: 30, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'urgency', type: 'text', name: 'Urgency', role: 'description', x: 240, y: 900, width: 600, height: 50, visible: true, locked: false, zIndex: 10, text: '🔥 2,847 sold in the last 24 hours', fontSize: 22, fontWeight: 700, fontFamily: 'Inter', color: '#dc2626', align: 'center', rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'cta', type: 'cta', name: 'CTA', role: 'cta', x: 240, y: 970, width: 600, height: 90, visible: true, locked: false, zIndex: 20, text: 'CLAIM 50% OFF NOW →', fontSize: 28, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#16a34a', radius: 16, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // 6. FEATURE SPOTLIGHT GRID
    {
        id: 'meta_feature_grid_v1',
        name: '✨ Feature Spotlight',
        niche: 'saas',
        document: {
            backgroundColor: '#0f172a',
            layers: [
                { id: 'product', type: 'background', name: 'Product', x: 240, y: 150, width: 600, height: 500, visible: true, locked: false, zIndex: 5, src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'contain' },
                { id: 'feature1', type: 'cta', name: 'Feature 1', x: 60, y: 680, width: 300, height: 80, visible: true, locked: false, zIndex: 10, text: '🚀 10x Faster', fontSize: 26, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: 'rgba(59,130,246,0.3)', radius: 16, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'feature2', type: 'cta', name: 'Feature 2', x: 390, y: 680, width: 300, height: 80, visible: true, locked: false, zIndex: 10, text: '✨ AI-Powered', fontSize: 26, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: 'rgba(147,51,234,0.3)', radius: 16, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'feature3', type: 'cta', name: 'Feature 3', x: 720, y: 680, width: 300, height: 80, visible: true, locked: false, zIndex: 10, text: '🔒 Secure', fontSize: 26, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: 'rgba(16,185,129,0.3)', radius: 16, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'headline', type: 'text', name: 'Headline', x: 90, y: 800, width: 900, height: 120, visible: true, locked: false, zIndex: 10, text: 'Work Smarter,\nNot Harder', fontSize: 72, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.0, letterSpacing: -3 },
                { id: 'cta', type: 'cta', name: 'CTA', x: 340, y: 960, width: 400, height: 80, visible: true, locked: false, zIndex: 20, text: 'Start Free', fontSize: 28, fontWeight: 700, fontFamily: 'Inter', color: '#0f172a', bgColor: '#FFFFFF', radius: 12, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // 7. FOMO SCARCITY
    {
        id: 'meta_fomo_scarcity_v1',
        name: '⏰ FOMO Scarcity',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#dc2626',
            layers: [
                { id: 'timer', type: 'cta', name: 'Timer', x: 240, y: 60, width: 600, height: 80, visible: true, locked: false, zIndex: 15, text: '⏰ SALE ENDS IN 2:47:18', fontSize: 32, fontWeight: 900, fontFamily: 'Inter', color: '#dc2626', bgColor: '#FFFFFF', radius: 50, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'discount', type: 'text', name: 'Discount', x: 90, y: 280, width: 900, height: 320, visible: true, locked: false, zIndex: 10, text: '70%\nOFF', fontSize: 220, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', align: 'center', rotation: 0, opacity: 1, lineHeight: 0.85, letterSpacing: -10 },
                { id: 'stock', type: 'text', name: 'Stock Counter', x: 240, y: 650, width: 600, height: 70, visible: true, locked: false, zIndex: 10, text: '⚠️ Only 7 left in stock', fontSize: 36, fontWeight: 700, fontFamily: 'Inter', color: '#fecaca', align: 'center', rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'subtitle', type: 'text', name: 'Subtitle', x: 140, y: 750, width: 800, height: 60, visible: true, locked: false, zIndex: 10, text: 'Biggest sale ever. Don\'t miss out.', fontSize: 32, fontWeight: 500, fontFamily: 'Inter', color: '#fee2e2', align: 'center', rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'code', type: 'cta', name: 'Code', x: 290, y: 840, width: 500, height: 80, visible: true, locked: false, zIndex: 15, text: 'CODE: FLASH70', fontSize: 32, fontWeight: 800, fontFamily: 'Inter', color: '#0f172a', bgColor: '#fde047', radius: 8, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'cta', type: 'cta', name: 'CTA', x: 240, y: 960, width: 600, height: 100, visible: true, locked: false, zIndex: 20, text: 'SHOP NOW', fontSize: 42, fontWeight: 900, fontFamily: 'Inter', color: '#dc2626', bgColor: '#FFFFFF', radius: 16, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // 8. QUESTION HOOK
    {
        id: 'meta_question_hook_v1',
        name: '❓ Question Hook',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#1e293b',
            layers: [
                { id: 'question', type: 'text', name: 'Hook Question', x: 90, y: 150, width: 900, height: 300, visible: true, locked: false, zIndex: 10, text: 'Still wasting\nmoney on\nproducts that\ndon\'t work?', fontSize: 80, fontWeight: 900, fontFamily: 'Inter', color: '#fbbf24', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.1, letterSpacing: -3 },
                { id: 'answer', type: 'text', name: 'Answer', x: 140, y: 520, width: 800, height: 180, visible: true, locked: false, zIndex: 10, text: 'This is different. 94% of users see results in 7 days.', fontSize: 42, fontWeight: 600, fontFamily: 'Inter', color: '#FFFFFF', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.3 },
                { id: 'proof', type: 'text', name: 'Social Proof', x: 240, y: 740, width: 600, height: 80, visible: true, locked: false, zIndex: 10, text: '⭐⭐⭐⭐⭐ 4.9 (14.2k reviews)', fontSize: 32, fontWeight: 700, fontFamily: 'Inter', color: '#22c55e', align: 'center', rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'cta', type: 'cta', name: 'CTA', x: 240, y: 880, width: 600, height: 100, visible: true, locked: false, zIndex: 20, text: 'TRY RISK-FREE', fontSize: 36, fontWeight: 900, fontFamily: 'Inter', color: '#1e293b', bgColor: '#fbbf24', radius: 16, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // 9. BENEFIT STACK
    {
        id: 'meta_benefit_stack_v1',
        name: '✅ Benefit Stack',
        niche: 'saas',
        document: {
            backgroundColor: '#f8fafc',
            layers: [
                { id: 'headline', type: 'text', name: 'Headline', x: 90, y: 100, width: 900, height: 140, visible: true, locked: false, zIndex: 10, text: 'Everything You\nNeed. Nothing You Don\'t.', fontSize: 62, fontWeight: 900, fontFamily: 'Inter', color: '#0f172a', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.1, letterSpacing: -2 },
                { id: 'benefits', type: 'text', name: 'Benefits List', x: 140, y: 300, width: 800, height: 480, visible: true, locked: false, zIndex: 10, text: '✅ Unlimited projects & exports\n✅ AI-powered automation\n✅ Real-time collaboration\n✅ Advanced analytics dashboard\n✅ Priority support 24/7\n✅ 99.9% uptime guarantee\n✅ No hidden fees ever', fontSize: 34, fontWeight: 600, fontFamily: 'Inter', color: '#1e293b', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.8, letterSpacing: 0 },
                { id: 'guarantee', type: 'cta', name: 'Guarantee', x: 290, y: 820, width: 500, height: 60, visible: true, locked: false, zIndex: 15, text: '💰 30-Day Money-Back Guarantee', fontSize: 20, fontWeight: 700, fontFamily: 'Inter', color: '#16a34a', bgColor: '#dcfce7', radius: 30, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'cta', type: 'cta', name: 'CTA', x: 240, y: 920, width: 600, height: 90, visible: true, locked: false, zIndex: 20, text: 'START FREE TRIAL', fontSize: 32, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#2563eb', radius: 12, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // 10. INFLUENCER/CREATOR UGC
    {
        id: 'meta_influencer_ugc_v1',
        name: '🎥 Creator UGC',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#000000',
            layers: [
                { id: 'creator', type: 'background', name: 'Creator Photo', role: 'bg_image', x: 0, y: 0, width: 1080, height: 1080, visible: true, locked: false, zIndex: 0, src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2864&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'cover' },
                { id: 'hook', type: 'cta', name: 'Hook Overlay', role: 'headline', x: 60, y: 80, width: 700, height: 90, visible: true, locked: false, zIndex: 10, text: 'POV: You finally found it 👀', fontSize: 36, fontWeight: 800, fontFamily: 'Inter', color: '#FFFFFF', bgColor: 'rgba(0,0,0,0.7)', radius: 16, rotation: 0, opacity: 1, lineHeight: 1.2 },
                { id: 'caption', type: 'text', name: 'Caption', role: 'description', x: 60, y: 850, width: 960, height: 180, visible: true, locked: false, zIndex: 10, text: 'Been using this for 3 weeks and I\'m obsessed. Link in bio ⬇️', fontSize: 38, fontWeight: 600, fontFamily: 'Inter', color: '#FFFFFF', align: 'left', rotation: 0, opacity: 1, lineHeight: 1.3, shadowColor: '#000000', shadowBlur: 30 },
                { id: 'cta', type: 'cta', name: 'CTA', role: 'cta', x: 720, y: 970, width: 300, height: 70, visible: true, locked: false, zIndex: 20, text: 'SHOP NOW', fontSize: 22, fontWeight: 800, fontFamily: 'Inter', color: '#000000', bgColor: '#FFFFFF', radius: 50, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // 11. PAIN POINT CALLOUT
    {
        id: 'meta_pain_point_v1',
        name: '😰 Pain Point',
        niche: 'saas',
        document: {
            backgroundColor: '#fef3c7',
            layers: [
                { id: 'pain', type: 'text', name: 'Pain Point', role: 'headline', x: 90, y: 180, width: 900, height: 280, visible: true, locked: false, zIndex: 10, text: 'Spending 10 hours\na week on tasks\nthat could be\nautomated?', fontSize: 68, fontWeight: 900, fontFamily: 'Inter', color: '#dc2626', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.15, letterSpacing: -2 },
                { id: 'scenario', type: 'text', name: 'Scenario', role: 'subheadline', x: 140, y: 520, width: 800, height: 160, visible: true, locked: false, zIndex: 10, text: 'You\'re burning out doing repetitive work while competitors automate everything.', fontSize: 36, fontWeight: 600, fontFamily: 'Inter', color: '#78350f', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.4 },
                { id: 'solution', type: 'text', name: 'Solution', role: 'description', x: 140, y: 730, width: 800, height: 100, visible: true, locked: false, zIndex: 10, text: 'Get back 40+ hours/month with automation.', fontSize: 38, fontWeight: 700, fontFamily: 'Inter', color: '#000000', align: 'center', rotation: 0, opacity: 1, lineHeight: 1.3 },
                { id: 'proof', type: 'cta', name: 'Social Proof', role: 'social_proof', x: 340, y: 860, width: 400, height: 60, visible: true, locked: false, zIndex: 15, text: '✓ Trusted by 12,000+ teams', fontSize: 22, fontWeight: 700, fontFamily: 'Inter', color: '#16a34a', bgColor: '#dcfce7', radius: 30, rotation: 0, opacity: 1, lineHeight: 1 },
                { id: 'cta', type: 'cta', name: 'CTA', role: 'cta', x: 290, y: 960, width: 500, height: 90, visible: true, locked: false, zIndex: 20, text: 'AUTOMATE NOW', fontSize: 32, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', bgColor: '#000000', radius: 12, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    },

    // 12. BOLD HEADLINE STATEMENT
    {
        id: 'meta_bold_statement_v1',
        name: '🔥 Bold Statement',
        niche: 'ecommerce',
        document: {
            backgroundColor: '#000000',
            layers: [
                { id: 'product', type: 'background', name: 'Product', role: 'product_image', x: 140, y: 400, width: 800, height: 600, visible: true, locked: false, zIndex: 5, src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2940&auto=format&fit=crop', opacity: 1, rotation: 0, fit: 'contain' },
                { id: 'line1', type: 'text', name: 'Line 1', role: 'headline', x: 90, y: 80, width: 900, height: 90, visible: true, locked: false, zIndex: 10, text: 'BETTER RESULTS.', fontSize: 76, fontWeight: 900, fontFamily: 'Inter', color: '#FFFFFF', align: 'center', rotation: 0, opacity: 1, lineHeight: 1, letterSpacing: -2 },
                { id: 'line2', type: 'text', name: 'Line 2', role: 'subheadline', x: 90, y: 180, width: 900, height: 90, visible: true, locked: false, zIndex: 10, text: 'LESS EFFORT.', fontSize: 76, fontWeight: 900, fontFamily: 'Inter', color: '#22c55e', align: 'center', rotation: 0, opacity: 1, lineHeight: 1, letterSpacing: -2 },
                { id: 'line3', type: 'text', name: 'Line 3', role: 'description', x: 90, y: 280, width: 900, height: 90, visible: true, locked: false, zIndex: 10, text: 'GUARANTEED.', fontSize: 76, fontWeight: 900, fontFamily: 'Inter', color: '#fbbf24', align: 'center', rotation: 0, opacity: 1, lineHeight: 1, letterSpacing: -2 },
                { id: 'cta', type: 'cta', name: 'CTA', role: 'cta', x: 290, y: 970, width: 500, height: 90, visible: true, locked: false, zIndex: 20, text: 'GET STARTED', fontSize: 36, fontWeight: 900, fontFamily: 'Inter', color: '#000000', bgColor: '#FFFFFF', radius: 50, rotation: 0, opacity: 1, lineHeight: 1 }
            ]
        }
    }
];
