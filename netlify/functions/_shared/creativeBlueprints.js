
export const BLUEPRINTS = [
    {
        id: "native_ugc",
        label: "Native UGC",
        description: "Authentic, 'shot on phone' look. Best for building trust.",
        best_for: ["cold", "retargeting", "service", "d2c"],
        visual: {
            intent: "Photo of product in real life setting, slightly imperfect lighting to look like User Generated Content (UGC). Shot on iPhone.",
            negative_prompt: ["text", "studio lighting", "professional", "bokeh", "blur"],
        },
        copy_structure: "Hook (Pattern Interrupt) -> Relatable Problem -> Product as Solution -> Soft CTA",
        on_screen_text_guidance: "Minimal or none. Maybe a simple 'Review' star sticker."
    },
    {
        id: "headline_hero",
        label: "Headline Hero",
        description: "High quality product shot with clear negative space for a headline.",
        best_for: ["awareness", "branding", "launch"],
        visual: {
            intent: "Cinematic product shot, 40% negative space at top or bottom specifically for text overlay. High contrast.",
            negative_prompt: ["text", "cluttered", "busy"],
        },
        copy_structure: "Hook (Big Benefit) -> Feature -> Proof -> Direct CTA",
        on_screen_text_guidance: "Short punchy headline in the negative space. e.g. '50% OFF'."
    },
    {
        id: "split_problem_solution",
        label: "Split Problem/Solution",
        description: "Visual contrast between problem and solution idea.",
        best_for: ["problem_aware", "cold"],
        visual: {
            intent: "Split composition. One side moody/darker (representing the problem), other side bright/clean (representing solution with product).",
            negative_prompt: ["text"],
        },
        copy_structure: "Hook (Question) -> Agitate Problem -> Introduce Solution -> CTA",
        on_screen_text_guidance: "Labels like 'Before / After' or 'Others / Us'."
    },
    {
        id: "premium_composition",
        label: "Premium Studio Composition",
        description: "Multi-layered high-fidelity composition with complex lighting and structured overlays.",
        best_for: ["awareness", "luxury", "direct"],
        render_mode: "premium",
        visual: {
            intent: "High-end studio product photography, clean background, deliberate shadow play, and complex lighting.",
            negative_prompt: ["clutter", "textual hallucinations", "blurry", "low quality"],
        },
        copy_structure: "Premium Hooks -> Structured Layers -> Polish",
        on_screen_text_guidance: "Delivered via Premium JSON layers including typography, effects, and branding."
    },
    {
        id: "premium_ecom_hero",
        label: "Premium E-Com Hero",
        description: "Optimized for product-focused e-commerce ads with clean backgrounds and soft glows.",
        best_for: ["ecommerce", "gadgets", "home"],
        render_mode: "premium",
        visual: {
            intent: "Clean studio product hero, soft radial glow, feature cards, and high-impact headline.",
            negative_prompt: ["messy room", "distracting backgrounds"],
        },
        copy_structure: "Headline -> 3 Key Features -> Resolved CTA",
        on_screen_text_guidance: "Template P01: Focus on headline and 3 bullet points."
    },
    {
        id: "premium_beauty_editorial",
        label: "Premium Beauty Editorial",
        description: "Magazine-style clean layout for skincare and cosmetics.",
        best_for: ["beauty", "skincare", "cosmetics"],
        render_mode: "premium",
        visual: {
            intent: "Minimalist, luxury editorial feel, high-contrast typography, and soft neutral backgrounds.",
            negative_prompt: ["busy gradients", "neon colors"],
        },
        copy_structure: "Luxury Branding -> Minimalist Headline -> Tagline",
        on_screen_text_guidance: "Template P03: Focus on brand identity and editorial spacing."
    },
    {
        id: "premium_food_drop",
        label: "Premium Restaurant Menu",
        description: "Bold typography and high-appetite dish focus.",
        best_for: ["restaurant", "cafe", "food"],
        render_mode: "premium",
        visual: {
            intent: "Bold dark background, high-contrast dish photography, and clear price/detail cards.",
            negative_prompt: ["blurry food", "unappetizing lighting"],
        },
        copy_structure: "Bold Headline -> Dish Name -> Price & Details",
        on_screen_text_guidance: "Template P04: Focus on large dish image and clear typography."
    },
    {
        id: "premium_sale_comparison",
        label: "Premium Sale & Comparison",
        description: "High-conversion layout with discount badges and key feature points.",
        best_for: ["ecommerce", "fashion", "electronics"],
        render_mode: "premium",
        visual: {
            intent: "Modern dark UI, vibrant accent gradients, clear discount badge, and product side-by-side or large focus.",
            negative_prompt: ["cluttered text", "washed out colors"],
        },
        copy_structure: "Discount Badge -> Headline -> 3 Value Points",
        on_screen_text_guidance: "Template P02: Focus on the discount and quick-scan benefits."
    },
    {
        id: "premium_luxe_realestate",
        label: "Premium Luxe Real Estate",
        description: "Minimalist, gold-accented layout for high-end properties and services.",
        best_for: ["realestate", "luxury", "services"],
        render_mode: "premium",
        visual: {
            intent: "Full-bleed hero image with elegant glassmorphism overlays and gold accents.",
            negative_prompt: ["low resolution images", "cheap looking fonts"],
        },
        copy_structure: "Title -> Location -> Luxury Metrics (Price, Size, etc.)",
        on_screen_text_guidance: "Template P05: Focus on stunning visuals and minimalist typography."
    },
    {
        id: "premium_saas_dashboard",
        label: "Premium SaaS Dashboard",
        description: "Tech-focused layout featuring UI mockups and KPI metrics.",
        best_for: ["saas", "b2b", "apps"],
        render_mode: "premium",
        visual: {
            intent: "Futuristic dark mode dashboard, glowing accents, and clear metric callouts.",
            negative_prompt: ["generic stock photos", "non-standard UI elements"],
        },
        copy_structure: "Headline -> Subhead -> 3 Key KPIs",
        on_screen_text_guidance: "Template P06: Focus on software screenshot and performance data."
    },
    {
        id: "premium_fashion_minimal",
        label: "Premium Fashion Minimal",
        description: "Elegant magazine-style layout for high-end apparel.",
        best_for: ["fashion", "luxury", "apparel"],
        render_mode: "premium",
        visual: {
            intent: "Minimalist fashion editorial, clean white space, thin borders, and elegant typography.",
            negative_prompt: ["cluttered backgrounds", "neon colors"],
        },
        copy_structure: "Brand Name -> Collection Title -> Season Tag",
        on_screen_text_guidance: "Template P07: Focus on editorial spacing and high-end branding."
    },
    {
        id: "premium_fitness_dynamic",
        label: "Premium Fitness Dynamic",
        description: "High-energy layout with slanted shapes and bold typography.",
        best_for: ["fitness", "gym", "health"],
        render_mode: "premium",
        visual: {
            intent: "High-contrast action shot, glowing neon yellow accents, slanted overlays, and heavy impact fonts.",
            negative_prompt: ["soft colors", "static poses"],
        },
        copy_structure: "Power Hook -> Key Statistic -> Action CTA",
        on_screen_text_guidance: "Template P08: Focus on energy, motion, and bold callouts."
    },
    {
        id: "premium_travel_vista",
        label: "Premium Travel Vista",
        description: "Full-bleed scenic layout with immersive glassmorphism cards.",
        best_for: ["travel", "tourism", "hospitality"],
        render_mode: "premium",
        visual: {
            intent: "Stunning landscape or destination shot, soft vignette, and a floating semi-transparent info card.",
            negative_prompt: ["flat backgrounds", "cluttered foregrounds"],
        },
        copy_structure: "Destination -> Starting Price -> Explore CTA",
        on_screen_text_guidance: "Template P09: Focus on immersive visuals and clean glass cards."
    },
    {
        id: "premium_auto_tech",
        label: "Premium Auto Tech",
        description: "Sleek, high-tech spec sheet for automotive and engineering.",
        best_for: ["automotive", "luxury", "cars"],
        render_mode: "premium",
        visual: {
            intent: "Dark studio car photography, glowing tech lines, and specific feature spec callouts.",
            negative_prompt: ["outdoor day shots", "messy backgrounds"],
        },
        copy_structure: "Model Name -> Speed Spec -> Range Spec",
        on_screen_text_guidance: "Template P10: Focus on technical precision and sleek lighting."
    },
    {
        id: "premium_edu_coach",
        label: "Premium Edu Coach",
        description: "Dual-panel professional layout for courses and coaching.",
        best_for: ["education", "coaching", "learning"],
        render_mode: "premium",
        visual: {
            intent: "Clean professional studio portrait of a person, paired with a structured info card and live session badges.",
            negative_prompt: ["unprofessional settings", "cluttered backgrounds"],
        },
        copy_structure: "Course Title -> Coach Name -> Start Date",
        on_screen_text_guidance: "Template P11: Focus on trust, authority, and clear scheduling info."
    },
    {
        id: "premium_web_portfolio",
        label: "Premium Web Portfolio",
        description: "Modern tech layout for web designers and agencies.",
        best_for: ["service", "webdesign", "agency"],
        render_mode: "premium",
        visual: {
            intent: "Sleek dark mode digital workspace, glowing UI mockups, and professional service badges.",
            negative_prompt: ["messy offices", "non-digital elements"],
        },
        copy_structure: "Service Name -> Slogan -> 2 Key Features",
        on_screen_text_guidance: "Template P12: Focus on portfolio quality and tech-savviness."
    },
    {
        id: "premium_craft_showcase",
        label: "Premium Craft Showcase",
        description: "Warm, natural layout for carpentry and interior design.",
        best_for: ["craft", "interior", "carpentry"],
        render_mode: "premium",
        visual: {
            intent: "Washing natural light on wooden textures, high-quality furniture shots, and detailed close-ups of craftsmanship.",
            negative_prompt: ["industrial factories", "cheap materials"],
        },
        copy_structure: "Product Name -> Philosophy -> Craft Detail",
        on_screen_text_guidance: "Template P13: Focus on natural materials and high-end craftsmanship."
    },
    {
        id: "premium_gastro_recruitment",
        label: "Premium Gastro Jobs",
        description: "Energetic recruitment layout for gastronomy.",
        best_for: ["restaurant", "jobs", "gastronomy"],
        render_mode: "premium",
        visual: {
            intent: "Dynamic team action shot, vibrant orange background, slanted energetic overlays, and bold job title.",
            negative_prompt: ["empty restaurants", "boring static shots"],
        },
        copy_structure: "Job Role -> 3 Team Benefits -> Brand Name",
        on_screen_text_guidance: "Template P14: Focus on team vibe and fast application."
    },
    {
        id: "premium_ecom_bento",
        label: "Premium Bento Grid",
        description: "Trend-driven multi-feature layout for e-commerce products.",
        best_for: ["ecommerce", "gadgets", "product"],
        render_mode: "premium",
        visual: {
            intent: "Professional bento-style grid with multiple product angles, price callouts, and clean tech aesthetics.",
            negative_prompt: ["cluttered layouts", "low contrast modules"],
        },
        copy_structure: "Product Name -> Short Desc -> Price Focus",
        on_screen_text_guidance: "Template P15: Focus on multiple product highlights in one view."
    },
    {
        id: "premium_sale_flash",
        label: "Premium Flash Sale",
        description: "High-urgency sale layout with countdown vibe.",
        best_for: ["ecommerce", "fashion", "electronics"],
        render_mode: "premium",
        visual: {
            intent: "High-contrast red/yellow palette, big discount badges, and urgency-driven typography.",
            negative_prompt: ["calm colors", "soft lighting"],
        },
        copy_structure: "Discount % -> Headline -> Time Limit",
        on_screen_text_guidance: "Template P16: Focus on massive urgency and clear CTA."
    },
    {
        id: "premium_drop_solver",
        label: "Premium Dropshipping Solver",
        description: "Classic dropshipping problem-solution layout.",
        best_for: ["dropshipping", "gadgets"],
        render_mode: "premium",
        visual: {
            intent: "Vertical video-style still, dark overlays, and a high-impact solution card at the bottom.",
            negative_prompt: ["landscape shots", "blurred product"],
        },
        copy_structure: "Mental Hook -> Problem Agitation -> Solution",
        on_screen_text_guidance: "Template P19: Focus on the 'wow' factor of the product."
    },
    {
        id: "premium_coach_webinar",
        label: "Premium Coach Webinar",
        description: "Authority-building layout for webinar registrations.",
        best_for: ["coaching", "business", "consulting"],
        render_mode: "premium",
        visual: {
            intent: "Professional coach portrait, modern digital gradient overlays, and clear webinar details.",
            negative_prompt: ["low quality photos", "cluttered text"],
        },
        copy_structure: "Training Hook -> Webinar Topic -> Date/Time",
        on_screen_text_guidance: "Template P24: Focus on authority and the primary benefit of the training."
    }
];

export function selectBlueprint(brief) {
    // 1. Try to find a blueprint that matches the brief's industry/niche
    // The brief might have 'industry', 'niche', or 'category' fields.
    const industry = (brief.industry || brief.niche || brief.category || "").toLowerCase();

    if (industry) {
        // Find blueprints where 'best_for' includes the industry
        const industryMatches = BLUEPRINTS.filter(bp =>
            bp.best_for && bp.best_for.some(tag => industry.includes(tag.toLowerCase()))
        );

        if (industryMatches.length > 0) {
            // Return a random match from the valid industry blueprints
            return industryMatches[Math.floor(Math.random() * industryMatches.length)];
        }
    }

    // 2. Fallback to Funnel Stage logic if no industry match
    const funnel = brief.funnel_stage || "cold";

    if (funnel === "cold") {
        return Math.random() > 0.5 ? BLUEPRINTS[2] : BLUEPRINTS[1];
    }

    if (funnel === "retargeting" || funnel === "hot") {
        return BLUEPRINTS[0]; // UGC works well for retargeting
    }

    // 3. Default random fallback
    return BLUEPRINTS[Math.floor(Math.random() * BLUEPRINTS.length)];
}
