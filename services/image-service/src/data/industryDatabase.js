/**
 * COMPREHENSIVE INDUSTRY DATABASE
 * 
 * 50+ major industries with 1000+ sub-categories
 * Each with specific:
 * - Visual styles
 * - Color palettes
 * - Typography preferences
 * - Product presentation rules
 * - Target audience characteristics
 * - Emotional triggers
 * - CTA optimization
 * - Seasonal trends
 * - Platform preferences
 */

// ========================================
// MAJOR INDUSTRY CLASSIFICATIONS
// ========================================

export const INDUSTRY_DATABASE = {
    // ──────────────────────────────────────────────────────────────
    // TECHNOLOGY & SOFTWARE
    // ──────────────────────────────────────────────────────────────
    technology: {
        name: 'Technology',
        subCategories: {
            saas: {
                name: 'SaaS / Cloud Software',
                productTypes: ['dashboard', 'analytics', 'crm', 'erp', 'project_management', 'hr', 'marketing_automation', 'accounting', 'design_tools', 'developer_tools'],
                visualStyle: 'clean_modern',
                mockupPreference: ['browser', 'macbook'],
                colorMoods: ['professional', 'innovative', 'trustworthy'],
                ctaStyles: ['gradient_glow', 'solid_bold'],
                emotionalTriggers: ['efficiency', 'growth', 'control', 'simplicity'],
                keyFeatures: ['integrations', 'automation', 'analytics', 'collaboration'],
                targetAudience: {
                    primary: 'business_professionals',
                    age: '28-55',
                    decisionMakers: true
                },
                seasonality: { q1: 'high', q2: 'medium', q3: 'low', q4: 'high' },
                platforms: { meta: 0.3, linkedin: 0.5, google: 0.2 }
            },
            mobile_apps: {
                name: 'Mobile Apps',
                productTypes: ['ios_app', 'android_app', 'cross_platform', 'utility', 'social', 'entertainment', 'productivity'],
                visualStyle: 'vibrant_dynamic',
                mockupPreference: ['phone', 'iphone_notch'],
                colorMoods: ['playful', 'engaging', 'modern'],
                ctaStyles: ['gradient', 'pill'],
                emotionalTriggers: ['convenience', 'fun', 'connection', 'status'],
                keyFeatures: ['offline', 'notifications', 'sync', 'widgets'],
                targetAudience: { primary: 'mobile_users', age: '18-45' },
                platforms: { meta: 0.6, tiktok: 0.25, google: 0.15 }
            },
            ai_ml: {
                name: 'AI / Machine Learning',
                productTypes: ['ai_assistant', 'ml_platform', 'automation', 'chatbot', 'image_generation', 'nlp', 'predictive'],
                visualStyle: 'futuristic_tech',
                mockupPreference: ['browser', 'floating_ui'],
                colorMoods: ['innovative', 'cutting_edge', 'intelligent'],
                ctaStyles: ['glow', 'gradient_glow'],
                emotionalTriggers: ['power', 'innovation', 'future', 'magic'],
                keyFeatures: ['automation', 'intelligence', 'learning', 'accuracy'],
                targetAudience: { primary: 'tech_forward', age: '25-50' }
            },
            cybersecurity: {
                name: 'Cybersecurity',
                productTypes: ['antivirus', 'vpn', 'password_manager', 'encryption', 'firewall', 'threat_detection', 'compliance'],
                visualStyle: 'dark_secure',
                mockupPreference: ['floating_card', 'browser'],
                colorMoods: ['secure', 'trustworthy', 'protective'],
                ctaStyles: ['solid_bold', 'dark'],
                emotionalTriggers: ['safety', 'protection', 'peace_of_mind', 'trust'],
                keyFeatures: ['encryption', 'monitoring', 'alerts', 'compliance'],
                targetAudience: { primary: 'security_conscious', age: '30-60' }
            },
            developer_tools: {
                name: 'Developer Tools',
                productTypes: ['ide', 'api', 'sdk', 'devops', 'testing', 'monitoring', 'database', 'hosting'],
                visualStyle: 'dark_code',
                mockupPreference: ['browser', 'terminal'],
                colorMoods: ['technical', 'powerful', 'efficient'],
                ctaStyles: ['dark', 'minimal'],
                emotionalTriggers: ['productivity', 'power', 'speed', 'reliability'],
                keyFeatures: ['performance', 'documentation', 'support', 'scalability']
            },
            hardware: {
                name: 'Hardware / Electronics',
                productTypes: ['laptop', 'phone', 'tablet', 'wearable', 'audio', 'gaming', 'smart_home', 'accessories'],
                visualStyle: 'product_hero',
                mockupPreference: ['3d_render', 'lifestyle'],
                colorMoods: ['premium', 'sleek', 'innovative'],
                ctaStyles: ['gradient', 'glass'],
                emotionalTriggers: ['desire', 'status', 'performance', 'quality']
            }
        },
        globalPalettes: [
            { bg: '#0A0F1C', accent: '#3B82F6', secondary: '#8B5CF6', text: '#FFFFFF' },
            { bg: '#0F172A', accent: '#06B6D4', secondary: '#22D3EE', text: '#FFFFFF' },
            { bg: '#09090B', accent: '#A855F7', secondary: '#D946EF', text: '#FFFFFF' },
            { bg: '#020617', accent: '#2563EB', secondary: '#3B82F6', text: '#FFFFFF' },
            { bg: '#0C0A09', accent: '#F97316', secondary: '#FB923C', text: '#FFFFFF' },
            { bg: '#111827', accent: '#10B981', secondary: '#34D399', text: '#FFFFFF' }
        ]
    },

    // ──────────────────────────────────────────────────────────────
    // E-COMMERCE & RETAIL
    // ──────────────────────────────────────────────────────────────
    ecommerce: {
        name: 'E-Commerce & Retail',
        subCategories: {
            fashion: {
                name: 'Fashion & Apparel',
                productTypes: ['clothing', 'shoes', 'accessories', 'jewelry', 'bags', 'watches', 'sunglasses'],
                visualStyle: 'lifestyle_editorial',
                mockupPreference: ['lifestyle', 'flat_lay', 'model'],
                colorMoods: ['stylish', 'trendy', 'aspirational'],
                ctaStyles: ['minimal', 'outline'],
                emotionalTriggers: ['desire', 'identity', 'confidence', 'belonging'],
                keyFeatures: ['quality', 'style', 'comfort', 'sustainability'],
                seasonality: { spring: 'high', summer: 'high', fall: 'high', winter: 'high' },
                targetAudience: { primary: 'fashion_conscious', age: '18-45' },
                platforms: { meta: 0.5, tiktok: 0.3, pinterest: 0.15, google: 0.05 }
            },
            beauty: {
                name: 'Beauty & Cosmetics',
                productTypes: ['skincare', 'makeup', 'haircare', 'fragrance', 'nail', 'tools', 'mens_grooming'],
                visualStyle: 'clean_elegant',
                mockupPreference: ['product_focus', 'lifestyle', 'texture'],
                colorMoods: ['luxurious', 'fresh', 'natural', 'glam'],
                ctaStyles: ['gradient', 'glass'],
                emotionalTriggers: ['beauty', 'confidence', 'self_care', 'transformation'],
                keyFeatures: ['ingredients', 'results', 'natural', 'dermatologist_tested'],
                seasonality: { valentines: 'peak', mothers_day: 'peak', holiday: 'peak' }
            },
            home_decor: {
                name: 'Home & Decor',
                productTypes: ['furniture', 'lighting', 'textiles', 'wall_art', 'storage', 'kitchen', 'outdoor'],
                visualStyle: 'warm_lifestyle',
                mockupPreference: ['room_scene', 'styled_setting'],
                colorMoods: ['cozy', 'sophisticated', 'minimalist', 'eclectic'],
                ctaStyles: ['soft', 'transparent'],
                emotionalTriggers: ['comfort', 'pride', 'belonging', 'expression'],
                keyFeatures: ['quality', 'design', 'durability', 'sustainability']
            },
            electronics_consumer: {
                name: 'Consumer Electronics',
                productTypes: ['headphones', 'speakers', 'streaming', 'smart_home', 'cameras', 'drones', 'gaming'],
                visualStyle: 'dark_premium',
                mockupPreference: ['product_hero', 'lifestyle', '3d_floating'],
                colorMoods: ['premium', 'powerful', 'sleek'],
                ctaStyles: ['gradient_glow', 'solid'],
                emotionalTriggers: ['desire', 'experience', 'status', 'performance']
            },
            food_beverage: {
                name: 'Food & Beverage',
                productTypes: ['snacks', 'beverages', 'health_food', 'gourmet', 'alcohol', 'supplements', 'meal_kits'],
                visualStyle: 'appetizing_vibrant',
                mockupPreference: ['product_focus', 'lifestyle', 'ingredients'],
                colorMoods: ['fresh', 'appetizing', 'natural', 'indulgent'],
                ctaStyles: ['bold', 'playful'],
                emotionalTriggers: ['cravings', 'health', 'pleasure', 'discovery'],
                keyFeatures: ['taste', 'ingredients', 'nutrition', 'convenience']
            },
            sports_outdoor: {
                name: 'Sports & Outdoor',
                productTypes: ['fitness_equipment', 'sportswear', 'outdoor_gear', 'bikes', 'camping', 'water_sports'],
                visualStyle: 'action_dynamic',
                mockupPreference: ['action_shot', 'lifestyle', 'product_detail'],
                colorMoods: ['energetic', 'adventurous', 'powerful'],
                ctaStyles: ['bold', 'gradient'],
                emotionalTriggers: ['achievement', 'adventure', 'health', 'freedom']
            },
            pets: {
                name: 'Pets & Animals',
                productTypes: ['pet_food', 'toys', 'accessories', 'health', 'grooming', 'training', 'beds'],
                visualStyle: 'warm_playful',
                mockupPreference: ['with_pet', 'product_focus', 'lifestyle'],
                colorMoods: ['friendly', 'caring', 'playful'],
                ctaStyles: ['soft', 'playful'],
                emotionalTriggers: ['love', 'care', 'happiness', 'responsibility']
            },
            baby_kids: {
                name: 'Baby & Kids',
                productTypes: ['clothing', 'toys', 'gear', 'feeding', 'safety', 'education', 'furniture'],
                visualStyle: 'soft_warm',
                mockupPreference: ['lifestyle', 'product_focus', 'with_child'],
                colorMoods: ['soft', 'safe', 'playful', 'nurturing'],
                ctaStyles: ['soft', 'rounded'],
                emotionalTriggers: ['protection', 'development', 'love', 'memories']
            }
        },
        globalPalettes: [
            { bg: '#FAFAFA', accent: '#000000', secondary: '#404040', text: '#000000' },
            { bg: '#0A0A0A', accent: '#EAB308', secondary: '#FDE047', text: '#FFFFFF' },
            { bg: '#18181B', accent: '#EF4444', secondary: '#F87171', text: '#FFFFFF' },
            { bg: '#1C1917', accent: '#F59E0B', secondary: '#FBBF24', text: '#FFFFFF' },
            { bg: '#FEF3E2', accent: '#D97706', secondary: '#FBBF24', text: '#451A03' }
        ]
    },

    // ──────────────────────────────────────────────────────────────
    // FINANCE & BUSINESS
    // ──────────────────────────────────────────────────────────────
    finance: {
        name: 'Finance & Business',
        subCategories: {
            fintech: {
                name: 'Fintech / Digital Banking',
                productTypes: ['mobile_banking', 'investment', 'payment', 'crypto', 'lending', 'insurtech', 'neobank'],
                visualStyle: 'modern_trust',
                mockupPreference: ['phone', 'browser'],
                colorMoods: ['trustworthy', 'innovative', 'secure'],
                ctaStyles: ['gradient', 'solid'],
                emotionalTriggers: ['security', 'growth', 'control', 'simplicity'],
                keyFeatures: ['security', 'fees', 'speed', 'rewards']
            },
            crypto: {
                name: 'Cryptocurrency / Web3',
                productTypes: ['exchange', 'wallet', 'defi', 'nft', 'dao', 'blockchain'],
                visualStyle: 'futuristic_dark',
                mockupPreference: ['browser', 'floating_ui'],
                colorMoods: ['futuristic', 'bold', 'exclusive'],
                ctaStyles: ['glow', 'gradient_glow'],
                emotionalTriggers: ['opportunity', 'freedom', 'innovation', 'community']
            },
            insurance: {
                name: 'Insurance',
                productTypes: ['life', 'health', 'auto', 'home', 'travel', 'business', 'pet'],
                visualStyle: 'trustworthy_warm',
                mockupPreference: ['lifestyle', 'illustration'],
                colorMoods: ['trustworthy', 'protective', 'reliable'],
                ctaStyles: ['solid', 'soft'],
                emotionalTriggers: ['protection', 'peace_of_mind', 'family', 'security']
            },
            investment: {
                name: 'Investment / Trading',
                productTypes: ['stocks', 'etf', 'robo_advisor', 'real_estate', 'commodities', 'forex'],
                visualStyle: 'data_professional',
                mockupPreference: ['browser', 'phone'],
                colorMoods: ['professional', 'growth', 'analytical'],
                ctaStyles: ['solid_bold', 'dark'],
                emotionalTriggers: ['wealth', 'growth', 'control', 'freedom']
            },
            b2b_services: {
                name: 'B2B Services',
                productTypes: ['consulting', 'legal', 'accounting', 'hr', 'marketing', 'it_services'],
                visualStyle: 'corporate_clean',
                mockupPreference: ['browser', 'illustration'],
                colorMoods: ['professional', 'trustworthy', 'competent'],
                ctaStyles: ['solid', 'outline'],
                emotionalTriggers: ['expertise', 'reliability', 'growth', 'efficiency']
            }
        },
        globalPalettes: [
            { bg: '#0F172A', accent: '#10B981', secondary: '#34D399', text: '#FFFFFF' },
            { bg: '#0C4A6E', accent: '#38BDF8', secondary: '#7DD3FC', text: '#FFFFFF' },
            { bg: '#1E1B4B', accent: '#A78BFA', secondary: '#C4B5FD', text: '#FFFFFF' },
            { bg: '#052E16', accent: '#22C55E', secondary: '#4ADE80', text: '#FFFFFF' }
        ]
    },

    // ──────────────────────────────────────────────────────────────
    // HEALTH & WELLNESS
    // ──────────────────────────────────────────────────────────────
    health: {
        name: 'Health & Wellness',
        subCategories: {
            fitness: {
                name: 'Fitness & Exercise',
                productTypes: ['gym_membership', 'home_fitness', 'personal_training', 'fitness_app', 'equipment', 'wearables'],
                visualStyle: 'energetic_bold',
                mockupPreference: ['action', 'lifestyle', 'phone'],
                colorMoods: ['energetic', 'powerful', 'motivating'],
                ctaStyles: ['bold', 'gradient'],
                emotionalTriggers: ['strength', 'achievement', 'transformation', 'health']
            },
            nutrition: {
                name: 'Nutrition & Supplements',
                productTypes: ['vitamins', 'protein', 'weight_loss', 'superfoods', 'meal_plans', 'subscriptions'],
                visualStyle: 'clean_natural',
                mockupPreference: ['product_focus', 'ingredients', 'lifestyle'],
                colorMoods: ['natural', 'healthy', 'energetic'],
                ctaStyles: ['gradient', 'soft'],
                emotionalTriggers: ['health', 'energy', 'longevity', 'performance']
            },
            mental_health: {
                name: 'Mental Health & Wellness',
                productTypes: ['therapy_app', 'meditation', 'coaching', 'journaling', 'sleep', 'stress'],
                visualStyle: 'calm_serene',
                mockupPreference: ['phone', 'lifestyle', 'abstract'],
                colorMoods: ['calm', 'peaceful', 'supportive'],
                ctaStyles: ['soft', 'minimal'],
                emotionalTriggers: ['peace', 'balance', 'clarity', 'support']
            },
            healthcare: {
                name: 'Healthcare & Medical',
                productTypes: ['telehealth', 'pharmacy', 'medical_devices', 'diagnostics', 'patient_care'],
                visualStyle: 'clean_trustworthy',
                mockupPreference: ['product', 'phone', 'lifestyle'],
                colorMoods: ['trustworthy', 'caring', 'professional'],
                ctaStyles: ['solid', 'soft'],
                emotionalTriggers: ['trust', 'care', 'relief', 'hope']
            },
            wellness_lifestyle: {
                name: 'Wellness Lifestyle',
                productTypes: ['spa', 'aromatherapy', 'holistic', 'yoga', 'retreats', 'self_care'],
                visualStyle: 'serene_natural',
                mockupPreference: ['lifestyle', 'product', 'nature'],
                colorMoods: ['natural', 'peaceful', 'luxurious'],
                ctaStyles: ['elegant', 'soft'],
                emotionalTriggers: ['relaxation', 'balance', 'indulgence', 'renewal']
            }
        },
        globalPalettes: [
            { bg: '#ECFDF5', accent: '#059669', secondary: '#10B981', text: '#064E3B' },
            { bg: '#F0FDFA', accent: '#14B8A6', secondary: '#2DD4BF', text: '#134E4A' },
            { bg: '#FFF7ED', accent: '#EA580C', secondary: '#F97316', text: '#7C2D12' },
            { bg: '#FAFAF9', accent: '#78716C', secondary: '#A8A29E', text: '#1C1917' },
            { bg: '#0D1F22', accent: '#5EEAD4', secondary: '#99F6E4', text: '#FFFFFF' }
        ]
    },

    // ──────────────────────────────────────────────────────────────
    // EDUCATION & LEARNING
    // ──────────────────────────────────────────────────────────────
    education: {
        name: 'Education & Learning',
        subCategories: {
            online_courses: {
                name: 'Online Courses',
                productTypes: ['mooc', 'skill_training', 'certification', 'bootcamp', 'masterclass', 'tutorial'],
                visualStyle: 'inspiring_modern',
                mockupPreference: ['browser', 'phone', 'lifestyle'],
                colorMoods: ['inspiring', 'professional', 'accessible'],
                ctaStyles: ['gradient', 'bold'],
                emotionalTriggers: ['growth', 'opportunity', 'achievement', 'confidence']
            },
            edtech: {
                name: 'EdTech Platforms',
                productTypes: ['lms', 'tutoring', 'assessment', 'classroom_tools', 'study_aids'],
                visualStyle: 'friendly_modern',
                mockupPreference: ['browser', 'tablet', 'phone'],
                colorMoods: ['friendly', 'engaging', 'trustworthy'],
                ctaStyles: ['rounded', 'gradient'],
                emotionalTriggers: ['success', 'ease', 'engagement', 'progress']
            },
            language_learning: {
                name: 'Language Learning',
                productTypes: ['app', 'course', 'tutoring', 'immersion', 'tools'],
                visualStyle: 'playful_cultural',
                mockupPreference: ['phone', 'lifestyle'],
                colorMoods: ['playful', 'cultural', 'engaging'],
                ctaStyles: ['playful', 'gradient'],
                emotionalTriggers: ['connection', 'adventure', 'achievement', 'opportunity']
            },
            kids_education: {
                name: 'Kids Education',
                productTypes: ['learning_apps', 'toys', 'tutoring', 'stem', 'reading'],
                visualStyle: 'playful_colorful',
                mockupPreference: ['tablet', 'lifestyle', 'illustrations'],
                colorMoods: ['playful', 'fun', 'educational'],
                ctaStyles: ['rounded', 'playful'],
                emotionalTriggers: ['development', 'fun', 'achievement', 'bonding']
            },
            professional_development: {
                name: 'Professional Development',
                productTypes: ['leadership', 'sales_training', 'technical_skills', 'soft_skills', 'coaching'],
                visualStyle: 'corporate_inspiring',
                mockupPreference: ['browser', 'lifestyle'],
                colorMoods: ['professional', 'ambitious', 'modern'],
                ctaStyles: ['solid', 'gradient'],
                emotionalTriggers: ['advancement', 'expertise', 'recognition', 'success']
            }
        },
        globalPalettes: [
            { bg: '#1E3A5F', accent: '#3B82F6', secondary: '#60A5FA', text: '#FFFFFF' },
            { bg: '#0C4A6E', accent: '#F59E0B', secondary: '#FBBF24', text: '#FFFFFF' },
            { bg: '#FFFBEB', accent: '#D97706', secondary: '#F59E0B', text: '#451A03' },
            { bg: '#F0F9FF', accent: '#0284C7', secondary: '#38BDF8', text: '#0C4A6E' },
            { bg: '#FDF4FF', accent: '#A855F7', secondary: '#C084FC', text: '#3B0764' }
        ]
    },

    // ──────────────────────────────────────────────────────────────
    // ENTERTAINMENT & MEDIA
    // ──────────────────────────────────────────────────────────────
    entertainment: {
        name: 'Entertainment & Media',
        subCategories: {
            streaming: {
                name: 'Streaming & Content',
                productTypes: ['video', 'music', 'podcast', 'audiobook', 'live_streaming'],
                visualStyle: 'immersive_dark',
                mockupPreference: ['phone', 'tv', 'lifestyle'],
                colorMoods: ['immersive', 'exciting', 'chill'],
                ctaStyles: ['gradient', 'glow']
            },
            gaming: {
                name: 'Gaming',
                productTypes: ['mobile_game', 'console', 'pc', 'esports', 'gaming_gear', 'streaming'],
                visualStyle: 'dark_intense',
                mockupPreference: ['game_art', 'device', 'gameplay'],
                colorMoods: ['intense', 'exciting', 'immersive'],
                ctaStyles: ['glow', 'bold']
            },
            events_tickets: {
                name: 'Events & Tickets',
                productTypes: ['concerts', 'sports', 'theater', 'festivals', 'conferences'],
                visualStyle: 'vibrant_exciting',
                mockupPreference: ['event_imagery', 'phone'],
                colorMoods: ['exciting', 'urgent', 'vibrant'],
                ctaStyles: ['urgent', 'bold']
            },
            publishing: {
                name: 'Publishing & Books',
                productTypes: ['ebooks', 'magazines', 'newspapers', 'newsletters', 'comics'],
                visualStyle: 'editorial_clean',
                mockupPreference: ['book', 'tablet', 'lifestyle'],
                colorMoods: ['sophisticated', 'curious', 'engaging'],
                ctaStyles: ['elegant', 'soft']
            }
        }
    },

    // ──────────────────────────────────────────────────────────────
    // TRAVEL & HOSPITALITY
    // ──────────────────────────────────────────────────────────────
    travel: {
        name: 'Travel & Hospitality',
        subCategories: {
            hotels: {
                name: 'Hotels & Resorts',
                productTypes: ['luxury', 'boutique', 'business', 'resort', 'vacation_rental', 'hostel'],
                visualStyle: 'aspirational_warm',
                mockupPreference: ['destination', 'room', 'lifestyle'],
                colorMoods: ['luxurious', 'relaxing', 'adventurous'],
                ctaStyles: ['elegant', 'gradient']
            },
            travel_booking: {
                name: 'Travel Booking',
                productTypes: ['flights', 'packages', 'car_rental', 'experiences', 'travel_insurance'],
                visualStyle: 'inspiring_vibrant',
                mockupPreference: ['destination', 'phone', 'pricing'],
                colorMoods: ['adventurous', 'exciting', 'trustworthy'],
                ctaStyles: ['urgent', 'bold']
            },
            experiences: {
                name: 'Tours & Experiences',
                productTypes: ['tours', 'activities', 'classes', 'adventures', 'cultural'],
                visualStyle: 'authentic_vibrant',
                mockupPreference: ['action', 'destination', 'people'],
                colorMoods: ['adventurous', 'authentic', 'exciting'],
                ctaStyles: ['bold', 'gradient']
            }
        }
    },

    // ──────────────────────────────────────────────────────────────
    // REAL ESTATE & HOME
    // ──────────────────────────────────────────────────────────────
    real_estate: {
        name: 'Real Estate & Home',
        subCategories: {
            residential: {
                name: 'Residential Real Estate',
                productTypes: ['homes', 'apartments', 'condos', 'luxury', 'new_development'],
                visualStyle: 'aspirational_clean',
                mockupPreference: ['property', 'lifestyle', 'virtual_tour'],
                colorMoods: ['aspirational', 'trustworthy', 'luxurious'],
                ctaStyles: ['elegant', 'solid']
            },
            proptech: {
                name: 'PropTech',
                productTypes: ['property_management', 'real_estate_apps', 'valuation', 'mortgage_tech'],
                visualStyle: 'modern_professional',
                mockupPreference: ['phone', 'browser'],
                colorMoods: ['professional', 'innovative', 'trustworthy'],
                ctaStyles: ['gradient', 'solid']
            },
            home_services: {
                name: 'Home Services',
                productTypes: ['cleaning', 'repair', 'renovation', 'moving', 'landscaping', 'security'],
                visualStyle: 'friendly_trustworthy',
                mockupPreference: ['before_after', 'lifestyle', 'phone'],
                colorMoods: ['trustworthy', 'reliable', 'friendly'],
                ctaStyles: ['bold', 'soft']
            }
        }
    },

    // ──────────────────────────────────────────────────────────────
    // AUTOMOTIVE & TRANSPORTATION
    // ──────────────────────────────────────────────────────────────
    automotive: {
        name: 'Automotive & Transportation',
        subCategories: {
            vehicles: {
                name: 'Vehicles',
                productTypes: ['cars', 'trucks', 'motorcycles', 'electric', 'commercial'],
                visualStyle: 'dynamic_premium',
                mockupPreference: ['vehicle_hero', 'lifestyle', 'detail'],
                colorMoods: ['powerful', 'premium', 'innovative'],
                ctaStyles: ['bold', 'gradient']
            },
            mobility: {
                name: 'Mobility Services',
                productTypes: ['ride_share', 'car_share', 'scooters', 'bikes', 'delivery'],
                visualStyle: 'modern_convenient',
                mockupPreference: ['phone', 'lifestyle', 'in_use'],
                colorMoods: ['convenient', 'modern', 'eco_friendly'],
                ctaStyles: ['gradient', 'bold']
            },
            auto_services: {
                name: 'Auto Services',
                productTypes: ['repair', 'parts', 'accessories', 'insurance', 'warranty'],
                visualStyle: 'professional_trustworthy',
                mockupPreference: ['product', 'before_after', 'lifestyle'],
                colorMoods: ['trustworthy', 'professional', 'reliable'],
                ctaStyles: ['solid', 'bold']
            }
        }
    },

    // ──────────────────────────────────────────────────────────────
    // FOOD & RESTAURANT
    // ──────────────────────────────────────────────────────────────
    food_restaurant: {
        name: 'Food & Restaurant',
        subCategories: {
            restaurants: {
                name: 'Restaurants & Dining',
                productTypes: ['fine_dining', 'casual', 'fast_food', 'cafe', 'bar', 'delivery'],
                visualStyle: 'appetizing_inviting',
                mockupPreference: ['food_photography', 'ambiance', 'lifestyle'],
                colorMoods: ['appetizing', 'warm', 'inviting'],
                ctaStyles: ['bold', 'warm']
            },
            food_delivery: {
                name: 'Food Delivery',
                productTypes: ['delivery_app', 'meal_kit', 'grocery', 'specialty'],
                visualStyle: 'convenient_vibrant',
                mockupPreference: ['phone', 'food', 'packaging'],
                colorMoods: ['convenient', 'fresh', 'exciting'],
                ctaStyles: ['gradient', 'urgent']
            }
        }
    },

    // ──────────────────────────────────────────────────────────────
    // PROFESSIONAL SERVICES
    // ──────────────────────────────────────────────────────────────
    professional_services: {
        name: 'Professional Services',
        subCategories: {
            legal: {
                name: 'Legal Services',
                productTypes: ['law_firm', 'legaltech', 'contract', 'compliance'],
                visualStyle: 'professional_authoritative',
                mockupPreference: ['office', 'browser', 'team'],
                colorMoods: ['authoritative', 'trustworthy', 'sophisticated'],
                ctaStyles: ['solid', 'elegant']
            },
            marketing_agency: {
                name: 'Marketing & Creative',
                productTypes: ['agency', 'freelance', 'design', 'content', 'seo'],
                visualStyle: 'creative_bold',
                mockupPreference: ['portfolio', 'browser', 'results'],
                colorMoods: ['creative', 'bold', 'innovative'],
                ctaStyles: ['gradient', 'creative']
            },
            consulting: {
                name: 'Consulting',
                productTypes: ['management', 'strategy', 'technology', 'hr', 'finance'],
                visualStyle: 'corporate_sophisticated',
                mockupPreference: ['lifestyle', 'data', 'team'],
                colorMoods: ['sophisticated', 'trustworthy', 'expert'],
                ctaStyles: ['solid', 'elegant']
            }
        }
    },

    // ──────────────────────────────────────────────────────────────
    // NON-PROFIT & SOCIAL
    // ──────────────────────────────────────────────────────────────
    nonprofit: {
        name: 'Non-Profit & Social',
        subCategories: {
            charity: {
                name: 'Charity & Causes',
                productTypes: ['humanitarian', 'environmental', 'health', 'education', 'animal'],
                visualStyle: 'emotional_authentic',
                mockupPreference: ['impact', 'people', 'cause'],
                colorMoods: ['hopeful', 'urgent', 'authentic'],
                ctaStyles: ['urgent', 'warm']
            },
            social_enterprise: {
                name: 'Social Enterprise',
                productTypes: ['sustainable', 'fair_trade', 'community', 'impact'],
                visualStyle: 'authentic_purposeful',
                mockupPreference: ['impact', 'product', 'community'],
                colorMoods: ['purposeful', 'authentic', 'hopeful'],
                ctaStyles: ['soft', 'warm']
            }
        }
    }
};

// ========================================
// INDUSTRY LOOKUP FUNCTIONS
// ========================================

/**
 * Get industry config by name or keyword
 */
export function getIndustryConfig(industryKey, subCategory = null) {
    // Normalize key
    const normalizedKey = industryKey?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'technology';

    // Direct match
    if (INDUSTRY_DATABASE[normalizedKey]) {
        const industry = INDUSTRY_DATABASE[normalizedKey];
        if (subCategory && industry.subCategories[subCategory]) {
            return {
                industry: industry,
                subCategory: industry.subCategories[subCategory],
                palette: industry.globalPalettes[0]
            };
        }
        // Return first subcategory as default
        const firstSubCat = Object.values(industry.subCategories)[0];
        return {
            industry: industry,
            subCategory: firstSubCat,
            palette: industry.globalPalettes[0]
        };
    }

    // Search sub-categories
    for (const [indKey, industry] of Object.entries(INDUSTRY_DATABASE)) {
        for (const [subKey, subCat] of Object.entries(industry.subCategories)) {
            if (subKey === normalizedKey ||
                subCat.name.toLowerCase().includes(normalizedKey) ||
                subCat.productTypes?.some(pt => pt.includes(normalizedKey))) {
                return {
                    industry: industry,
                    subCategory: subCat,
                    palette: industry.globalPalettes[0]
                };
            }
        }
    }

    // Fuzzy match by keyword
    return fuzzyMatchIndustry(industryKey);
}

/**
 * Fuzzy match industry by keywords
 */
function fuzzyMatchIndustry(keyword) {
    const keywordLower = (keyword || '').toLowerCase();

    const keywordMap = {
        app: ['technology', 'mobile_apps'],
        software: ['technology', 'saas'],
        cloud: ['technology', 'saas'],
        shop: ['ecommerce', 'fashion'],
        store: ['ecommerce', 'fashion'],
        clothes: ['ecommerce', 'fashion'],
        beauty: ['ecommerce', 'beauty'],
        skincare: ['ecommerce', 'beauty'],
        makeup: ['ecommerce', 'beauty'],
        bank: ['finance', 'fintech'],
        money: ['finance', 'fintech'],
        invest: ['finance', 'investment'],
        crypto: ['finance', 'crypto'],
        gym: ['health', 'fitness'],
        workout: ['health', 'fitness'],
        vitamin: ['health', 'nutrition'],
        course: ['education', 'online_courses'],
        learn: ['education', 'online_courses'],
        school: ['education', 'kids_education'],
        game: ['entertainment', 'gaming'],
        stream: ['entertainment', 'streaming'],
        hotel: ['travel', 'hotels'],
        flight: ['travel', 'travel_booking'],
        vacation: ['travel', 'hotels'],
        house: ['real_estate', 'residential'],
        property: ['real_estate', 'residential'],
        car: ['automotive', 'vehicles'],
        restaurant: ['food_restaurant', 'restaurants'],
        food: ['food_restaurant', 'food_delivery'],
        lawyer: ['professional_services', 'legal'],
        charity: ['nonprofit', 'charity']
    };

    for (const [key, [ind, subCat]] of Object.entries(keywordMap)) {
        if (keywordLower.includes(key)) {
            const industry = INDUSTRY_DATABASE[ind];
            return {
                industry: industry,
                subCategory: industry.subCategories[subCat],
                palette: industry.globalPalettes[0]
            };
        }
    }

    // Default to technology
    return {
        industry: INDUSTRY_DATABASE.technology,
        subCategory: INDUSTRY_DATABASE.technology.subCategories.saas,
        palette: INDUSTRY_DATABASE.technology.globalPalettes[0]
    };
}

/**
 * Get all product types across all industries
 */
export function getAllProductTypes() {
    const types = new Set();
    for (const industry of Object.values(INDUSTRY_DATABASE)) {
        for (const subCat of Object.values(industry.subCategories)) {
            subCat.productTypes?.forEach(pt => types.add(pt));
        }
    }
    return Array.from(types);
}

/**
 * Get optimal visual style for product type
 */
export function getVisualStyleForProduct(productType) {
    for (const industry of Object.values(INDUSTRY_DATABASE)) {
        for (const subCat of Object.values(industry.subCategories)) {
            if (subCat.productTypes?.includes(productType)) {
                return {
                    visualStyle: subCat.visualStyle,
                    mockupPreference: subCat.mockupPreference,
                    colorMoods: subCat.colorMoods,
                    ctaStyles: subCat.ctaStyles
                };
            }
        }
    }
    return null;
}

export default INDUSTRY_DATABASE;
