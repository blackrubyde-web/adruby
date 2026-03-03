/**
 * Ad Archetypes v1.0 — 72 Archetypes in 9 Categories
 * Each archetype is a self-contained creative direction for Gemini.
 */

// ═══════════════════════════════════════════════════════════════
// CATEGORY 1: PRODUCT FOCUS (10)
// ═══════════════════════════════════════════════════════════════
const CAT_PRODUCT = [
    {
        key: 'product_hero', name: 'Product Hero', category: 'product',
        briefDirection: 'Dramatic, stunning product showcase. Studio-quality lighting, the product is the absolute star. Think: Apple product launch, hero shot with dramatic shadows and reflections. Every texture visible, every detail celebrated.',
        bestIndustries: ['ecommerce', 'tech', 'luxury', 'fashion', 'beauty'],
        funnelStages: ['tof', 'mof'],
        preferredLayouts: ['minimal_product_hero', 'full_bleed', 'geometric_frame'],
        hookAffinity: ['bold_claim', 'curiosity_gap', 'pattern_break'],
    },
    {
        key: 'feature_callout', name: 'Feature Callout', category: 'product',
        briefDirection: 'Product centered with 3-5 curved bezier arrows pointing FROM feature labels TO specific product parts. Each label has a small circle origin point (○). Arrows are smooth curves NOT straight lines. Feature text is short (2-3 words per label). Educational ad showing exactly what makes the product special.',
        bestIndustries: ['tech', 'saas', 'fitness', 'beauty', 'health'],
        funnelStages: ['mof'],
        preferredLayouts: ['full_bleed', 'geometric_frame', 'magazine_editorial'],
        hookAffinity: ['curiosity_gap', 'number_stat', 'authority'],
    },
    {
        key: 'product_in_action', name: 'Product in Action', category: 'product',
        briefDirection: 'Product being ACTIVELY USED — hands gripping it, person in motion with it, mid-action freeze frame. Show the product doing what it does best. Dynamic, energetic, real usage. Not posed, not static. Think: GoPro-style action capture.',
        bestIndustries: ['fitness', 'food', 'beauty', 'tech', 'sport'],
        funnelStages: ['tof', 'mof'],
        preferredLayouts: ['full_bleed', 'split_diagonal', 'bold_typographic'],
        hookAffinity: ['identity_belong', 'transformation', 'story_micro'],
    },
    {
        key: '360_product_view', name: '360° Product View', category: 'product',
        briefDirection: 'Multiple angles/views of the product in one image — collage-style grid showing front, side, back, detail. Each view in its own panel. Professional product photography from every angle. Think: product listing hero image.',
        bestIndustries: ['fashion', 'tech', 'luxury', 'ecommerce'],
        funnelStages: ['mof', 'bof'],
        preferredLayouts: ['collage_mood', 'frames_windows', 'geometric_frame'],
        hookAffinity: ['curiosity_gap', 'bold_claim'],
    },
    {
        key: 'flatlay_aesthetic', name: 'Flatlay Aesthetic', category: 'product',
        briefDirection: 'Perfect top-down flatlay: product centered, surrounded by complementary lifestyle props. Curated, Instagram-worthy arrangement on a textured surface. Color-coordinated accessories, natural shadows. Think: Pinterest-perfect styling.',
        bestIndustries: ['fashion', 'beauty', 'food', 'lifestyle', 'ecommerce'],
        funnelStages: ['tof'],
        preferredLayouts: ['full_bleed', 'geometric_frame', 'minimal_product_hero'],
        hookAffinity: ['identity_belong', 'pattern_break'],
    },
    {
        key: 'macro_detail', name: 'Macro Detail', category: 'product',
        briefDirection: 'EXTREME close-up of the product\'s most impressive texture, material, or detail. Fill the entire frame with one stunning detail. Show craftsmanship, quality, premium materials. Think: watch mechanism, fabric weave, food texture at macro lens.',
        bestIndustries: ['luxury', 'beauty', 'food', 'fashion', 'tech'],
        funnelStages: ['mof'],
        preferredLayouts: ['full_bleed', 'split_panel', 'minimal_product_hero'],
        hookAffinity: ['curiosity_gap', 'bold_claim', 'authority'],
    },
    {
        key: 'packaging_showcase', name: 'Packaging Showcase', category: 'product',
        briefDirection: 'Premium packaging as visual trigger. Show the unboxing moment — hands lifting lid, tissue paper, branded box. Confetti, light rays, or sparkle effects. The packaging sells the experience before the product. Think: luxury gift, Apple unboxing.',
        bestIndustries: ['ecommerce', 'luxury', 'beauty', 'food'],
        funnelStages: ['tof', 'mof'],
        preferredLayouts: ['full_bleed', 'split_panel', 'floating_particles'],
        hookAffinity: ['curiosity_gap', 'pattern_break', 'story_micro'],
    },
    {
        key: 'ingredient_spotlight', name: 'Ingredient Spotlight', category: 'product',
        briefDirection: 'Key ingredients or materials VISIBLE next to the product. Raw ingredients arranged artfully (fresh herbs, pure minerals, organic cotton). Scientific/natural look. Labels pointing to each ingredient with benefit. Think: skincare ingredient breakdown.',
        bestIndustries: ['food', 'beauty', 'health', 'supplements'],
        funnelStages: ['mof'],
        preferredLayouts: ['split_panel', 'magazine_editorial', 'full_bleed'],
        hookAffinity: ['number_stat', 'authority', 'curiosity_gap'],
    },
    {
        key: 'size_comparison', name: 'Size Comparison', category: 'product',
        briefDirection: 'Product placed NEXT TO everyday objects for scale reference. iPhone next to it, hand holding it, coins beside it. Instantly communicates size. Clean background, clear comparison. Think: Kickstarter size comparison photos.',
        bestIndustries: ['tech', 'gadgets', 'ecommerce'],
        funnelStages: ['mof', 'bof'],
        preferredLayouts: ['minimal_product_hero', 'split_panel'],
        hookAffinity: ['curiosity_gap', 'number_stat'],
    },
    {
        key: 'product_ecosystem', name: 'Product Ecosystem', category: 'product',
        briefDirection: 'Multiple products from the same brand/line arranged together — showing the complete system/set/collection. Each product labeled or highlighted. "Works together" feeling. Think: skincare routine set, tech ecosystem, fitness equipment bundle.',
        bestIndustries: ['tech', 'beauty', 'fitness', 'ecommerce'],
        funnelStages: ['bof'],
        preferredLayouts: ['collage_mood', 'frames_windows', 'geometric_frame'],
        hookAffinity: ['number_stat', 'authority', 'contrast'],
    },
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 2: SOCIAL PROOF & TRUST (10)
// ═══════════════════════════════════════════════════════════════
const CAT_SOCIAL_PROOF = [
    {
        key: 'customer_review_card', name: 'Customer Review Card', category: 'social_proof',
        briefDirection: 'Large customer quote in elegant „..." quotation marks. Customer name + title below. 5 gold stars ⭐⭐⭐⭐⭐ prominently displayed. Product on one side, quote card on the other. Trust, credibility, social proof. Think: Amazon 5-star review meets premium design.',
        bestIndustries: ['ecommerce', 'beauty', 'health', 'saas', 'fitness'],
        funnelStages: ['mof', 'bof'],
        preferredLayouts: ['split_panel', 'review_showcase', 'magazine_editorial'],
        hookAffinity: ['social_proof_hook', 'story_micro', 'authority'],
    },
    {
        key: 'ugc_selfie', name: 'UGC Selfie Style', category: 'social_proof',
        briefDirection: 'Looks like a REAL Instagram post, NOT a studio ad. Natural lighting, slightly imperfect framing. Real person showing product. Instagram UI: @username, likes, comments. Authentic, relatable. This is NOT an ad — it\'s a real recommendation from a real person.',
        bestIndustries: ['beauty', 'fashion', 'fitness', 'food', 'ecommerce'],
        funnelStages: ['tof', 'mof'],
        preferredLayouts: ['ugc_authentic', 'full_bleed'],
        hookAffinity: ['social_proof_hook', 'story_micro', 'confession'],
    },
    {
        key: 'social_numbers', name: 'Social Numbers', category: 'social_proof',
        briefDirection: '"10.000+ zufriedene Kunden" or "4.9/5 Sterne" as HERO number element. Massive, bold number dominates the image. Supporting context below. Product alongside. Data-driven trust, herd mentality. Think: "Join 50.000+ happy customers".',
        bestIndustries: ['saas', 'ecommerce', 'health', 'education', 'agency'],
        funnelStages: ['mof', 'bof'],
        preferredLayouts: ['bold_typographic', 'split_panel', 'geometric_abstract'],
        hookAffinity: ['number_stat', 'social_proof_hook', 'authority'],
    },
    {
        key: 'press_media_mention', name: 'Press / Media Mention', category: 'social_proof',
        briefDirection: '"Bekannt aus:" followed by media logos (Spiegel, Forbes, TechCrunch style). Or "Testsieger" badge prominently displayed. Product centered with media credibility badges around it. Authority through association.',
        bestIndustries: ['tech', 'saas', 'health', 'luxury', 'ecommerce'],
        funnelStages: ['mof'],
        preferredLayouts: ['split_panel', 'magazine_editorial', 'minimal_product_hero'],
        hookAffinity: ['authority', 'social_proof_hook', 'bold_claim'],
    },
    {
        key: 'expert_endorsement', name: 'Expert Endorsement', category: 'social_proof',
        briefDirection: 'Doctor, trainer, chef, or industry expert recommending the product. Professional setting, white coat or uniform. Expert photo + quote + credentials. "Empfohlen von Dr. [Name]" with verification badge. Think: doctor-approved label.',
        bestIndustries: ['health', 'beauty', 'fitness', 'supplements', 'tech'],
        funnelStages: ['mof', 'bof'],
        preferredLayouts: ['split_panel', 'expert_endorsed', 'review_showcase'],
        hookAffinity: ['authority', 'social_proof_hook', 'number_stat'],
    },
    {
        key: 'community_wall', name: 'Community Wall', category: 'social_proof',
        briefDirection: 'Grid of many small user photos — 9, 12, or 16 squares showing different real people with the product. "Alle nutzen es" collective feeling. Each photo slightly different, authentic. Community, belonging, FOMO.',
        bestIndustries: ['fitness', 'fashion', 'saas', 'education', 'ecommerce'],
        funnelStages: ['tof', 'mof'],
        preferredLayouts: ['collage_mood', 'frames_windows'],
        hookAffinity: ['social_proof_hook', 'identity_belong', 'number_stat'],
    },
    {
        key: 'award_certification', name: 'Award / Certification', category: 'social_proof',
        briefDirection: 'Official seal, certification badge, or award trophy prominently displayed. "Testsieger 2024", "ISO Certified", "Best in Class". Gold/silver seal design. Product next to prestigious award. Think: wine label medal, software certification.',
        bestIndustries: ['tech', 'health', 'luxury', 'food', 'ecommerce'],
        funnelStages: ['mof', 'bof'],
        preferredLayouts: ['minimal_product_hero', 'split_panel', 'geometric_frame'],
        hookAffinity: ['authority', 'bold_claim', 'social_proof_hook'],
    },
    {
        key: 'screenshot_testimonial', name: 'Screenshot Testimonial', category: 'social_proof',
        briefDirection: 'WhatsApp/iMessage chat screenshot or social media comment as authentic proof. Chat bubble style, realistic UI, emoji reactions. Raw, unfiltered, believable. "Omg das Produkt ist SO gut 😍" style. Think: screenshot shared between friends.',
        bestIndustries: ['ecommerce', 'education', 'beauty', 'fitness'],
        funnelStages: ['mof'],
        preferredLayouts: ['full_bleed', 'ugc_authentic', 'split_panel'],
        hookAffinity: ['social_proof_hook', 'confession', 'humor_meme'],
    },
    {
        key: 'influencer_collab', name: 'Influencer Collab', category: 'social_proof',
        briefDirection: 'Influencer/creator holding or using the product. Split between their personal brand aesthetic and the product. Username visible, follower count implied. "Collab with @creator" badge. Think: paid partnership post, but designed.',
        bestIndustries: ['beauty', 'fashion', 'fitness', 'food', 'lifestyle'],
        funnelStages: ['tof', 'mof'],
        preferredLayouts: ['full_bleed', 'split_panel', 'ugc_authentic'],
        hookAffinity: ['social_proof_hook', 'authority', 'story_micro'],
    },
    {
        key: 'user_gallery', name: 'User Gallery', category: 'social_proof',
        briefDirection: 'Curated gallery of user-submitted photos in elegant grid or carousel preview. "Unsere Community zeigt..." header. Mix of diverse users with product. Hashtag call-out. Think: brand Instagram gallery, community showcase.',
        bestIndustries: ['fashion', 'beauty', 'fitness', 'food', 'lifestyle'],
        funnelStages: ['tof'],
        preferredLayouts: ['collage_mood', 'frames_windows', 'geometric_frame'],
        hookAffinity: ['social_proof_hook', 'identity_belong'],
    },
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 3: COMPARISON & TRANSFORMATION (8)
// ═══════════════════════════════════════════════════════════════
const CAT_COMPARISON = [
    {
        key: 'before_after_split', name: 'Before / After Split', category: 'comparison',
        briefDirection: 'Perfect 50/50 split: LEFT = BEFORE (problem, muted/gray, negative), RIGHT = AFTER (product result, vibrant, positive). Labels "Vorher"/"Nachher" or "Ohne"/"Mit". Dramatic contrast instantly understandable. Think: transformation reveal.',
        bestIndustries: ['beauty', 'fitness', 'health', 'home', 'education'],
        funnelStages: ['mof', 'bof'],
        preferredLayouts: ['split_panel', 'split_diagonal'],
        hookAffinity: ['transformation', 'contrast', 'pain_agitate'],
    },
    {
        key: 'us_vs_them_grid', name: 'Us vs. Them', category: 'comparison',
        briefDirection: 'LEFT = Our product (bright, positive, green ✅). RIGHT = competitor/old way (muted, negative, red ❌). 3-4 comparison points stacked vertically. Clear visual hierarchy — we WIN every point. Think: comparison chart meets visual ad.',
        bestIndustries: ['tech', 'saas', 'ecommerce', 'agency'],
        funnelStages: ['mof', 'bof'],
        preferredLayouts: ['split_panel', 'myth_vs_fact', 'bold_typographic'],
        hookAffinity: ['contrast', 'bold_claim', 'number_stat'],
    },
    {
        key: 'price_comparison', name: 'Price Comparison', category: 'comparison',
        briefDirection: '"Competitor: €199 | Wir: €49" — price table as visual design element. Strike-through on competitor price. Our price highlighted bold and large. Savings prominently shown. Think: pricing page meets ad.',
        bestIndustries: ['saas', 'ecommerce', 'tech', 'education'],
        funnelStages: ['bof'],
        preferredLayouts: ['split_panel', 'bold_typographic', 'geometric_frame'],
        hookAffinity: ['number_stat', 'urgency_fomo', 'contrast'],
    },
    {
        key: 'old_way_new_way', name: 'Old Way vs. New Way', category: 'comparison',
        briefDirection: 'Traditional method shown CROSSED OUT (red X, strikethrough) → modern product as the better alternative. "Der alte Weg" vs "Der neue Weg". Progress narrative, innovation story. Think: evolution of a process.',
        bestIndustries: ['tech', 'saas', 'health', 'education'],
        funnelStages: ['mof'],
        preferredLayouts: ['split_panel', 'split_diagonal', 'bold_typographic'],
        hookAffinity: ['contrast', 'bold_claim', 'curiosity_gap'],
    },
    {
        key: 'transformation_timeline', name: 'Transformation Timeline', category: 'comparison',
        briefDirection: 'Left → Middle → Right timeline: START → 30 DAYS → RESULT. Arrows connecting stages. Visual progression from problem to solution. Each stage as a distinct panel. Think: fitness journey, learning curve, business growth.',
        bestIndustries: ['fitness', 'beauty', 'education', 'health', 'saas'],
        funnelStages: ['mof', 'bof'],
        preferredLayouts: ['how_to_use', 'split_panel', 'frames_windows'],
        hookAffinity: ['transformation', 'number_stat', 'story_micro'],
    },
    {
        key: 'myth_vs_fact', name: 'Myth vs. Fact', category: 'comparison',
        briefDirection: '"Mythos: XYZ ❌" / "Fakt: XYZ ✅" formatted cards. Debunk common misconceptions, position product as the truth. Educational authority. 2-3 myth/fact pairs. Think: medical myth-buster, industry truth-teller.',
        bestIndustries: ['health', 'supplements', 'beauty', 'fitness', 'tech'],
        funnelStages: ['tof', 'mof'],
        preferredLayouts: ['myth_vs_fact', 'split_panel', 'bold_typographic'],
        hookAffinity: ['curiosity_gap', 'authority', 'question_hook'],
    },
    {
        key: 'expectation_vs_reality', name: 'Erwartung vs. Realität', category: 'comparison',
        briefDirection: 'LEFT = what you expect (generic, underwhelming). RIGHT = reality with our product (even BETTER than expected). Positive surprise twist. The product overdelivers. Think: "expectation: good. reality: AMAZING" meme format.',
        bestIndustries: ['ecommerce', 'food', 'beauty', 'fashion'],
        funnelStages: ['tof'],
        preferredLayouts: ['split_panel', 'split_diagonal'],
        hookAffinity: ['pattern_break', 'humor_meme', 'curiosity_gap'],
    },
    {
        key: 'feature_matrix', name: 'Feature Matrix', category: 'comparison',
        briefDirection: 'Clean comparison grid/table: rows = features, columns = our product vs 2-3 alternatives. Green checks ✅ dominate our column, mostly ❌ in others. Professional, data-driven. Think: G2 comparison table meets design.',
        bestIndustries: ['saas', 'tech', 'agency', 'education'],
        funnelStages: ['bof'],
        preferredLayouts: ['split_panel', 'geometric_frame', 'magazine_editorial'],
        hookAffinity: ['number_stat', 'authority', 'contrast'],
    },
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 4: EMOTIONAL & LIFESTYLE (9)
// ═══════════════════════════════════════════════════════════════
const CAT_EMOTIONAL = [
    {
        key: 'aspirational_lifestyle', name: 'Aspirational Lifestyle', category: 'emotional',
        briefDirection: 'Person living the DREAM LIFE this product enables. Aspirational setting, golden light, freedom, success. The product is the gateway to this lifestyle. Think: luxury travel, penthouse view, beach freedom.',
        bestIndustries: ['fashion', 'luxury', 'travel', 'lifestyle', 'fitness'], funnelStages: ['tof'],
        preferredLayouts: ['full_bleed', 'split_diagonal', 'bold_typographic'], hookAffinity: ['identity_belong', 'story_micro', 'pattern_break']
    },
    {
        key: 'emotional_moment', name: 'Emotional Moment', category: 'emotional',
        briefDirection: 'Capture the EXACT moment of joy, relief, surprise, or love that the product creates. A person\'s face showing genuine emotion. Tears of happiness, wide smile, relief sigh. The product caused this feeling.',
        bestIndustries: ['gifts', 'family', 'pets', 'beauty', 'health'], funnelStages: ['tof', 'mof'],
        preferredLayouts: ['full_bleed', 'split_panel'], hookAffinity: ['story_micro', 'pain_agitate', 'confession']
    },
    {
        key: 'identity_statement', name: 'Identity Statement', category: 'emotional',
        briefDirection: '"Für alle die..." — the product defines WHO YOU ARE. Bold statement about the kind of person who uses this. Belonging, tribe, identity. "Nicht für jeden. Für dich." Exclusive but welcoming.',
        bestIndustries: ['fashion', 'lifestyle', 'fitness', 'luxury'], funnelStages: ['tof'],
        preferredLayouts: ['bold_typographic', 'full_bleed', 'geometric_abstract'], hookAffinity: ['identity_belong', 'bold_claim', 'pattern_break']
    },
    {
        key: 'mood_board_aesthetic', name: 'Mood Board', category: 'emotional',
        briefDirection: 'Pinterest-style mood board collage: product + color swatches + textures + lifestyle images + typography. Curated aesthetic, visual storytelling without words. The VIBE sells. Think: interior design mood board, fashion lookbook.',
        bestIndustries: ['fashion', 'interior', 'food', 'beauty', 'lifestyle'], funnelStages: ['tof'],
        preferredLayouts: ['collage_mood', 'frames_windows'], hookAffinity: ['identity_belong', 'pattern_break']
    },
    {
        key: 'pov_first_person', name: 'POV First Person', category: 'emotional',
        briefDirection: '"POV: Du benutzt endlich..." — first-person perspective, viewer IS the user. Hands visible, product in use from viewer\'s eyes. Immersive, personal, "this could be you". Think: GoPro POV, first-person gaming.',
        bestIndustries: ['tech', 'fitness', 'food', 'beauty', 'lifestyle'], funnelStages: ['tof', 'mof'],
        preferredLayouts: ['full_bleed', 'bold_typographic'], hookAffinity: ['curiosity_gap', 'identity_belong', 'story_micro']
    },
    {
        key: 'day_in_the_life', name: 'Day in the Life', category: 'emotional',
        briefDirection: 'Product integrated into daily routine — morning coffee with it, commute with it, evening relaxation with it. Multiple mini-moments showing how it fits naturally into everyday life. Relatable, authentic.',
        bestIndustries: ['lifestyle', 'tech', 'food', 'beauty', 'fitness'], funnelStages: ['tof', 'mof'],
        preferredLayouts: ['collage_mood', 'frames_windows', 'how_to_use'], hookAffinity: ['story_micro', 'identity_belong', 'confession']
    },
    {
        key: 'seasonal_moment', name: 'Seasonal Moment', category: 'emotional',
        briefDirection: 'Seasonal relevance: Christmas warmth, summer freshness, back-to-school energy, spring renewal. Product perfectly tied to the season\'s emotion. Seasonal colors, props, atmosphere. Timely, relevant.',
        bestIndustries: ['ecommerce', 'fashion', 'food', 'gifts', 'beauty'], funnelStages: ['tof'],
        preferredLayouts: ['full_bleed', 'split_panel', 'floating_particles'], hookAffinity: ['urgency_fomo', 'identity_belong', 'pattern_break']
    },
    {
        key: 'nostalgia_throwback', name: 'Nostalgia Throwback', category: 'emotional',
        briefDirection: 'Retro/vintage aesthetic triggering nostalgia. Product presented in old-school styling — film grain, polaroid borders, 90s colors, vintage typography. "Remember when..." feeling. Warm, comforting, familiar.',
        bestIndustries: ['fashion', 'food', 'lifestyle', 'beauty'], funnelStages: ['tof'],
        preferredLayouts: ['retro_vintage', 'full_bleed', 'collage_mood'], hookAffinity: ['story_micro', 'pattern_break', 'identity_belong']
    },
    {
        key: 'dream_scenario', name: 'Dream Scenario', category: 'emotional',
        briefDirection: 'Fantasy/dream visualization of the ideal outcome with this product. Surreal, slightly magical, aspirational beyond reality. Ethereal lighting, impossible beauty, perfect world. The product makes dreams tangible.',
        bestIndustries: ['luxury', 'beauty', 'travel', 'fashion', 'tech'], funnelStages: ['tof'],
        preferredLayouts: ['full_bleed', 'floating_particles', 'watercolor_artistic'], hookAffinity: ['curiosity_gap', 'bold_claim', 'pattern_break']
    },
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 5: URGENCY & ACTION (8)
// ═══════════════════════════════════════════════════════════════
const CAT_URGENCY = [
    {
        key: 'flash_sale_explosion', name: 'Flash Sale', category: 'urgency',
        briefDirection: 'MASSIVE discount in starburst/explosion shape. Product centered dramatically. Old price struck through, new price BOLD and oversized. "NUR HEUTE" or "-50%" as hero element. Maximum FOMO, urgency, ACT NOW energy.',
        bestIndustries: ['ecommerce', 'fashion', 'tech', 'beauty'], funnelStages: ['bof'],
        preferredLayouts: ['flash_sale_timer', 'bold_typographic', 'full_bleed'], hookAffinity: ['urgency_fomo', 'number_stat', 'bold_claim']
    },
    {
        key: 'countdown_timer', name: 'Countdown Timer', category: 'urgency',
        briefDirection: 'Visual countdown: "Noch 3h 42min" in digital clock style or flip-counter. Product + urgency. The time is RUNNING OUT. Dark dramatic background + bright timer numbers. Think: launch countdown.',
        bestIndustries: ['ecommerce', 'events', 'education', 'saas'], funnelStages: ['bof'],
        preferredLayouts: ['flash_sale_timer', 'bold_typographic', 'neon_cyberpunk'], hookAffinity: ['urgency_fomo', 'number_stat']
    },
    {
        key: 'limited_edition', name: 'Limited Edition', category: 'urgency',
        briefDirection: '"Nur 100 Stück" badge, exclusivity, collector\'s feeling. Special packaging, numbered edition, premium materials. Scarcity creates desire. Gold foil, special finish, "Limited" stamp. Think: luxury drop, sneaker release.',
        bestIndustries: ['fashion', 'luxury', 'art', 'tech', 'beauty'], funnelStages: ['mof', 'bof'],
        preferredLayouts: ['minimal_product_hero', 'geometric_frame', 'floating_particles'], hookAffinity: ['urgency_fomo', 'bold_claim', 'pattern_break']
    },
    {
        key: 'bundle_value_stack', name: 'Bundle / Value Stack', category: 'urgency',
        briefDirection: '"Alles im Set für nur €X" — multiple products stacked/arranged showing incredible value. Individual prices listed + total savings. "Spare €87" badge. Think: value pack, complete kit, starter bundle.',
        bestIndustries: ['ecommerce', 'beauty', 'fitness', 'tech', 'food'], funnelStages: ['bof'],
        preferredLayouts: ['split_panel', 'collage_mood', 'geometric_frame'], hookAffinity: ['number_stat', 'urgency_fomo', 'contrast']
    },
    {
        key: 'free_shipping_gift', name: 'Free Shipping / Gift', category: 'urgency',
        briefDirection: '"GRATIS Versand" or "+ Geschenk bei jeder Bestellung" prominently displayed. Gift box, ribbon, surprise element. The bonus removes the last purchase barrier. Think: free gift with purchase.',
        bestIndustries: ['ecommerce', 'beauty', 'fashion', 'food'], funnelStages: ['bof'],
        preferredLayouts: ['split_panel', 'bold_typographic', 'floating_particles'], hookAffinity: ['urgency_fomo', 'number_stat', 'social_proof_hook']
    },
    {
        key: 'last_chance', name: 'Last Chance', category: 'urgency',
        briefDirection: 'Dark, dramatic atmosphere. "Letzte Chance" as bold crisis text. Product fading out or disappearing. Urgent, now-or-never energy. Warning colors (red/orange accents). Think: final sale, last day.',
        bestIndustries: ['ecommerce', 'fashion', 'tech', 'education'], funnelStages: ['bof'],
        preferredLayouts: ['bold_typographic', 'full_bleed', 'neon_cyberpunk'], hookAffinity: ['urgency_fomo', 'pain_agitate', 'bold_claim']
    },
    {
        key: 'early_bird', name: 'Early Bird', category: 'urgency',
        briefDirection: '"Frühbucher-Rabatt: -30%" or "Erste 50 Besteller: Gratis Upgrade". Sunrise/early morning aesthetic, fresh energy. Rewarding early action. Exclusive pricing for fast movers.',
        bestIndustries: ['events', 'education', 'saas', 'ecommerce'], funnelStages: ['bof'],
        preferredLayouts: ['split_panel', 'bold_typographic', 'geometric_frame'], hookAffinity: ['urgency_fomo', 'number_stat', 'curiosity_gap']
    },
    {
        key: 'members_only', name: 'Members Only', category: 'urgency',
        briefDirection: 'Exclusive access visual — velvet rope, VIP badge, locked/unlocked metaphor. "Nur für Mitglieder" or "Exklusiver Zugang". Premium, gated, special. Think: club membership, insider access.',
        bestIndustries: ['luxury', 'fashion', 'fitness', 'saas', 'education'], funnelStages: ['mof', 'bof'],
        preferredLayouts: ['minimal_product_hero', 'geometric_abstract', 'bold_typographic'], hookAffinity: ['identity_belong', 'urgency_fomo', 'bold_claim']
    },
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 6: EDUCATIONAL & INFO (8)
// ═══════════════════════════════════════════════════════════════
const CAT_EDUCATIONAL = [
    {
        key: 'step_by_step_guide', name: 'Step-by-Step', category: 'educational',
        briefDirection: '"Schritt 1 → 2 → 3" with numbered circles and forward arrows. Each step: number + short label + mini visual. Last step shows the RESULT. Clear progression flow. Educational, friction-removing.',
        bestIndustries: ['saas', 'beauty', 'fitness', 'health', 'education'], funnelStages: ['mof'],
        preferredLayouts: ['how_to_use', 'split_panel', 'frames_windows'], hookAffinity: ['curiosity_gap', 'question_hook', 'authority']
    },
    {
        key: 'infographic_stat', name: 'Infographic Stat', category: 'educational',
        briefDirection: 'MASSIVE BOLD NUMBER as hero element: "73%", "2.340+", "3x". Supporting context below. Product shown alongside. Data-driven trust, evidence-based. The number is the first thing eyes see.',
        bestIndustries: ['saas', 'health', 'finance', 'tech', 'agency'], funnelStages: ['mof', 'bof'],
        preferredLayouts: ['bold_typographic', 'split_panel', 'geometric_abstract'], hookAffinity: ['number_stat', 'authority', 'social_proof_hook']
    },
    {
        key: 'benefit_checklist', name: 'Benefit Checklist', category: 'educational',
        briefDirection: '4-5 benefits listed with green ✅ checkmarks. Clean, scannable, benefit-driven. Product image on one side, checklist on the other. Each benefit = one clear sentence. Think: feature/benefit card.',
        bestIndustries: ['saas', 'ecommerce', 'health', 'fitness', 'education'], funnelStages: ['mof', 'bof'],
        preferredLayouts: ['split_panel', 'magazine_editorial', 'review_showcase'], hookAffinity: ['number_stat', 'authority', 'contrast']
    },
    {
        key: 'faq_answer', name: 'FAQ Answer', category: 'educational',
        briefDirection: '"Wird oft gefragt: [Question]" → Answer with product as solution. Question in bold, answer in clean text below. Product shown. Objection handling through Q&A. Think: FAQ page meets ad.',
        bestIndustries: ['saas', 'health', 'education', 'ecommerce', 'tech'], funnelStages: ['mof', 'bof'],
        preferredLayouts: ['split_panel', 'magazine_editorial', 'bold_typographic'], hookAffinity: ['question_hook', 'authority', 'social_proof_hook']
    },
    {
        key: 'did_you_know', name: 'Did You Know?', category: 'educational',
        briefDirection: '"Wusstest du? ..." — surprising fact that creates an info gap. The product is the solution to the new awareness. Educational shock, then product bridge. Think: myth-buster, fun fact.',
        bestIndustries: ['health', 'tech', 'supplements', 'food', 'beauty'], funnelStages: ['tof'],
        preferredLayouts: ['bold_typographic', 'split_panel', 'geometric_frame'], hookAffinity: ['curiosity_gap', 'question_hook', 'number_stat']
    },
    {
        key: 'how_it_works', name: 'How It Works', category: 'educational',
        briefDirection: 'Simple technical diagram showing the mechanism/science behind the product. Clean visualization, arrows showing flow, labeled components. Make the complex simple. Think: patent drawing meets infographic.',
        bestIndustries: ['tech', 'saas', 'health', 'beauty', 'fitness'], funnelStages: ['mof'],
        preferredLayouts: ['how_to_use', 'split_panel', 'geometric_frame'], hookAffinity: ['curiosity_gap', 'authority', 'number_stat']
    },
    {
        key: 'tip_of_the_day', name: 'Tip of the Day', category: 'educational',
        briefDirection: '"Tipp: ..." — useful advice that naturally includes the product. Friendly, helpful tone. Lightbulb icon 💡 or tip badge. Value-first, product-second. Think: expert tip card, life hack.',
        bestIndustries: ['beauty', 'health', 'fitness', 'food', 'tech'], funnelStages: ['tof'],
        preferredLayouts: ['magazine_editorial', 'split_panel', 'bold_typographic'], hookAffinity: ['curiosity_gap', 'authority', 'question_hook']
    },
    {
        key: 'ingredient_science', name: 'Ingredient Science', category: 'educational',
        briefDirection: 'Scientific breakdown of key ingredient/technology. Molecular structure, lab imagery, clinical study reference. "Klinisch getestet" badge. Science-backed credibility. Think: cosmetics science, supplement research.',
        bestIndustries: ['health', 'beauty', 'supplements', 'food', 'tech'], funnelStages: ['mof'],
        preferredLayouts: ['split_panel', 'magazine_editorial', 'geometric_frame'], hookAffinity: ['authority', 'number_stat', 'curiosity_gap']
    },
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 7: RECRUITING & B2B (7)
// ═══════════════════════════════════════════════════════════════
const CAT_RECRUITING = [
    {
        key: 'job_posting', name: 'Job Posting', category: 'recruiting',
        briefDirection: '"Wir suchen dich!" + benefits ✅ + location 📍 + salary hint. Bold headline, team photo background. Professional but approachable. Think: modern startup job ad, LinkedIn visual.',
        bestIndustries: ['recruiting', 'agency', 'tech', 'saas'], funnelStages: ['tof', 'mof'],
        preferredLayouts: ['split_panel', 'bold_typographic', 'magazine_editorial'], hookAffinity: ['identity_belong', 'curiosity_gap', 'bold_claim']
    },
    {
        key: 'team_culture', name: 'Team Culture', category: 'recruiting',
        briefDirection: 'Authentic team photo, office environment, team activity. "So arbeiten wir" or "Meet the Team" vibe. Real people, real workspace, candid moments. Culture sells. Think: employer branding.',
        bestIndustries: ['recruiting', 'agency', 'tech', 'saas'], funnelStages: ['tof'],
        preferredLayouts: ['full_bleed', 'collage_mood', 'frames_windows'], hookAffinity: ['identity_belong', 'story_micro', 'social_proof_hook']
    },
    {
        key: 'open_positions_grid', name: 'Open Positions', category: 'recruiting',
        briefDirection: 'Multiple job cards in grid: "Frontend Dev", "Sales Manager", "Designer". Each card = role + location + type (remote/hybrid). "15+ offene Stellen" as hero text. Think: careers page meets Instagram.',
        bestIndustries: ['recruiting', 'agency', 'tech'], funnelStages: ['tof', 'mof'],
        preferredLayouts: ['frames_windows', 'collage_mood', 'geometric_frame'], hookAffinity: ['number_stat', 'curiosity_gap', 'identity_belong']
    },
    {
        key: 'saas_dashboard', name: 'SaaS Dashboard', category: 'recruiting',
        briefDirection: 'Software screenshot with feature callout arrows. Clean UI, impressive dashboard, data visualization. "Alles auf einen Blick" hero text. Think: product screenshot for a SaaS landing page.',
        bestIndustries: ['saas', 'tech', 'agency'], funnelStages: ['mof', 'bof'],
        preferredLayouts: ['full_bleed', 'geometric_frame', 'split_panel'], hookAffinity: ['curiosity_gap', 'number_stat', 'bold_claim']
    },
    {
        key: 'case_study_result', name: 'Case Study Result', category: 'recruiting',
        briefDirection: '"Kunde X: +340% ROAS in 30 Tagen" with growth graph + client logo. Data-driven proof of results. Before/after metrics. Specific numbers, specific timeframe. Think: agency case study, B2B proof of work.',
        bestIndustries: ['agency', 'saas', 'tech', 'education'], funnelStages: ['mof', 'bof'],
        preferredLayouts: ['split_panel', 'magazine_editorial', 'bold_typographic'], hookAffinity: ['number_stat', 'authority', 'social_proof_hook']
    },
    {
        key: 'employer_perks', name: 'Employer Perks', category: 'recruiting',
        briefDirection: 'Benefits/perks as visual icons grid: 🏠 Remote, 🏖️ 30 Urlaubstage, 💪 Gym, 🍕 Team Lunch, 📈 Weiterbildung. Each perk in its own bubble/card. Colorful, attractive. Think: benefits infographic.',
        bestIndustries: ['recruiting', 'agency', 'tech', 'saas'], funnelStages: ['mof'],
        preferredLayouts: ['frames_windows', 'geometric_frame', 'collage_mood'], hookAffinity: ['identity_belong', 'number_stat', 'curiosity_gap']
    },
    {
        key: 'company_values', name: 'Company Values', category: 'recruiting',
        briefDirection: '3-5 core values as bold statements with icons: 🚀 Innovation, 🤝 Teamwork, 🌍 Impact. Each value = word + icon + short tagline. Clean, authentic. Think: about-us page meets visual ad.',
        bestIndustries: ['recruiting', 'agency', 'tech'], funnelStages: ['tof'],
        preferredLayouts: ['geometric_frame', 'split_panel', 'bold_typographic'], hookAffinity: ['identity_belong', 'bold_claim', 'story_micro']
    },
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 8: VIRAL & TRENDING (8)
// ═══════════════════════════════════════════════════════════════
const CAT_VIRAL = [
    {
        key: 'meme_remix', name: 'Meme Remix', category: 'viral',
        briefDirection: 'Known meme format with product twist. Relatable humor, share-worthy. Text-heavy in meme style. The product is the punchline or solution. Think: Drake meme, distracted boyfriend, wojak — but branded.',
        bestIndustries: ['ecommerce', 'fashion', 'food', 'lifestyle'], funnelStages: ['tof'],
        preferredLayouts: ['split_panel', 'bold_typographic', 'full_bleed'], hookAffinity: ['humor_meme', 'pattern_break', 'identity_belong']
    },
    {
        key: 'chat_bubble', name: 'Chat Bubble', category: 'viral',
        briefDirection: 'WhatsApp/iMessage chat conversation as visual. 2-3 message bubbles showing product recommendation between friends. Read receipts, typing indicator, emoji reactions. Authentic digital social proof.',
        bestIndustries: ['ecommerce', 'beauty', 'tech', 'education'], funnelStages: ['tof', 'mof'],
        preferredLayouts: ['full_bleed', 'ugc_authentic'], hookAffinity: ['social_proof_hook', 'humor_meme', 'confession']
    },
    {
        key: 'starter_pack', name: 'Starter Pack', category: 'viral',
        briefDirection: '"[Identity] Starter Pack" 4-panel grid: product + 3 lifestyle items/traits. Self-deprecating humor, relatable targeting. Each panel = one visual. Think: meme starter pack format.',
        bestIndustries: ['fashion', 'lifestyle', 'food', 'fitness'], funnelStages: ['tof'],
        preferredLayouts: ['frames_windows', 'collage_mood'], hookAffinity: ['humor_meme', 'identity_belong', 'pattern_break']
    },
    {
        key: 'this_or_that', name: 'This or That', category: 'viral',
        briefDirection: 'Two options side by side — our product clearly superior. "Das?" (boring) vs "Oder DAS?" (our product, glowing). Interactive feel, engagement bait. Think: Instagram poll aesthetic.',
        bestIndustries: ['ecommerce', 'fashion', 'food', 'beauty'], funnelStages: ['tof'],
        preferredLayouts: ['split_panel', 'split_diagonal'], hookAffinity: ['curiosity_gap', 'contrast', 'humor_meme']
    },
    {
        key: 'bold_claim', name: 'Hot Take / Bold Claim', category: 'viral',
        briefDirection: 'Polarizing statement in MASSIVE text. Product as proof. "Das beste [X]. Punkt." or "Unpopular Opinion: ..." Attention-grabbing, debate-starting. Think: thought leader post, viral tweet.',
        bestIndustries: ['ecommerce', 'tech', 'fitness', 'food', 'agency'], funnelStages: ['tof'],
        preferredLayouts: ['bold_typographic', 'full_bleed', 'geometric_abstract'], hookAffinity: ['bold_claim', 'pattern_break', 'identity_belong']
    },
    {
        key: 'aesthetic_gradient', name: 'Aesthetic Gradient', category: 'viral',
        briefDirection: 'Minimal text on gorgeous, vibrant gradient background. Apple-style modern. Product floating cleanly in space. Maximum aesthetic, minimal information. The beauty stops the scroll. Think: iOS wallpaper meets product ad.',
        bestIndustries: ['tech', 'saas', 'luxury', 'beauty'], funnelStages: ['tof'],
        preferredLayouts: ['minimal_product_hero', 'geometric_abstract', 'floating_particles'], hookAffinity: ['pattern_break', 'bold_claim', 'curiosity_gap']
    },
    {
        key: 'hot_take', name: 'Hot Take', category: 'viral',
        briefDirection: 'Controversial opinion about the industry + product as the proof. Red/fire colors, exclamation points, urgent energy. "Alle reden über X. Niemand redet über Y." Viral through controversy.',
        bestIndustries: ['tech', 'fitness', 'health', 'agency', 'education'], funnelStages: ['tof'],
        preferredLayouts: ['bold_typographic', 'neon_cyberpunk', 'full_bleed'], hookAffinity: ['bold_claim', 'pattern_break', 'question_hook']
    },
    {
        key: 'trend_hook', name: 'Trend Hook', category: 'viral',
        briefDirection: 'Riding a current trend, meme, or cultural moment. "POV:", "Nobody:", "Me when..." format. Current, timely, culturally relevant. Product woven into the trending format. Think: TikTok trend adapted for static ad.',
        bestIndustries: ['fashion', 'food', 'beauty', 'lifestyle', 'ecommerce'], funnelStages: ['tof'],
        preferredLayouts: ['bold_typographic', 'full_bleed', 'ugc_authentic'], hookAffinity: ['humor_meme', 'pattern_break', 'identity_belong']
    },
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 9: FORMAT-SPECIFIC (4)
// ═══════════════════════════════════════════════════════════════
const CAT_FORMAT = [
    {
        key: 'story_poll', name: 'Story Poll', category: 'format_specific',
        briefDirection: 'Instagram Story format with interactive poll visual: "Was sagst du?" + two options. Engaging, interactive feel. Product tied to the voting. Vertical composition optimized for 9:16.',
        bestIndustries: ['ecommerce', 'fashion', 'food', 'beauty'], funnelStages: ['tof'],
        preferredLayouts: ['full_bleed', 'bold_typographic'], hookAffinity: ['question_hook', 'curiosity_gap', 'humor_meme']
    },
    {
        key: 'carousel_teaser', name: 'Carousel Teaser', category: 'format_specific',
        briefDirection: 'First slide of carousel: "Swipe für..." or "5 Gründe warum..." with arrow pointing right. Teaser that demands swiping. Incomplete info on slide 1 = curiosity to continue. Think: carousel hook.',
        bestIndustries: ['education', 'saas', 'health', 'fitness', 'ecommerce'], funnelStages: ['tof', 'mof'],
        preferredLayouts: ['bold_typographic', 'split_panel'], hookAffinity: ['curiosity_gap', 'number_stat', 'question_hook']
    },
    {
        key: 'reel_thumbnail', name: 'Reel Thumbnail', category: 'format_specific',
        briefDirection: 'Eye-catching Reel/TikTok cover image with bold text overlay. Action pause frame, dramatic moment. Play button implied. "Schau dir das an..." text. Think: clickworthy video thumbnail.',
        bestIndustries: ['fitness', 'beauty', 'food', 'tech', 'fashion'], funnelStages: ['tof'],
        preferredLayouts: ['full_bleed', 'bold_typographic'], hookAffinity: ['pattern_break', 'curiosity_gap', 'bold_claim']
    },
    {
        key: 'feed_square_classic', name: 'Feed Square Classic', category: 'format_specific',
        briefDirection: 'Classic Instagram feed post: clean 1:1 square, product centered, minimal text, consistent with feed aesthetic. Perfect grid-worthy composition. Brand colors, clean margins. Think: curated Instagram grid.',
        bestIndustries: ['fashion', 'beauty', 'food', 'lifestyle', 'luxury'], funnelStages: ['tof', 'mof'],
        preferredLayouts: ['minimal_product_hero', 'geometric_frame', 'full_bleed'], hookAffinity: ['identity_belong', 'pattern_break']
    },
];

export const CATEGORIES = {
    product: 'Product Focus',
    social_proof: 'Social Proof & Trust',
    comparison: 'Comparison & Transformation',
    emotional: 'Emotional & Lifestyle',
    urgency: 'Urgency & Action',
    educational: 'Educational & Info',
    recruiting: 'Recruiting & B2B',
    viral: 'Viral & Trending',
    format_specific: 'Format-Specific',
};

export const AD_ARCHETYPES = [
    ...CAT_PRODUCT,
    ...CAT_SOCIAL_PROOF,
    ...CAT_COMPARISON,
    ...CAT_EMOTIONAL,
    ...CAT_URGENCY,
    ...CAT_EDUCATIONAL,
    ...CAT_RECRUITING,
    ...CAT_VIRAL,
    ...CAT_FORMAT,
];

export const ARCHETYPE_BY_KEY = Object.fromEntries(AD_ARCHETYPES.map(a => [a.key, a]));

export const ARCHETYPES_BY_CATEGORY = Object.fromEntries(
    Object.keys(CATEGORIES).map(cat => [cat, AD_ARCHETYPES.filter(a => a.category === cat)])
);

export default { AD_ARCHETYPES, ARCHETYPE_BY_KEY, ARCHETYPES_BY_CATEGORY, CATEGORIES };
