export const PREMIUM_AD_TEMPLATES = [
    {
        templateId: "P01_ECOM_PRODUCT_HERO",
        name: "E-Com Product Hero (Clean + Glow)",
        industry: ["ecommerce", "gadgets", "home"],
        format: {
            platform: "meta",
            aspectRatio: "4:5",
            size: { w: 1080, h: 1350 },
            safeArea: { padTop: 90, padRight: 72, padBottom: 140, padLeft: 72 }
        },
        tokens: {
            colors: { bg: "#0B1220", surface: "rgba(255,255,255,0.08)", text: "#FFFFFF", muted: "rgba(255,255,255,0.78)", accent: "#FF7A18", success: "#22C55E" },
            radius: { card: 28, button: 18, pill: 999 },
            shadow: { soft: { x: 0, y: 18, blur: 50, color: "rgba(0,0,0,0.35)" }, card: { x: 0, y: 14, blur: 40, color: "rgba(0,0,0,0.28)" } },
            type: {
                fontFamily: "Inter",
                h1: { size: 86, lh: 0.95, weight: 900, tracking: -1.4 },
                body: { size: 34, lh: 1.18, weight: 650, tracking: -0.2 },
                small: { size: 26, lh: 1.2, weight: 600, tracking: 0 }
            }
        },
        bindings: {
            BRAND: "{{BRAND}}",
            HEADLINE: "{{HEADLINE}}",
            SUBHEAD: "{{SUBHEAD}}",
            FEATURES: "{{FEATURES_3}}",
            PRODUCT_IMAGE: "{{PRODUCT_IMAGE_URL}}",
            CTA: "{{CTA_TEXT}}"
        },
        layers: [
            { id: "bg", type: "background", fill: { type: "gradient", kind: "radial", center: { x: 0.68, y: 0.22 }, stops: [{ pos: 0, color: "rgba(255,122,24,0.22)" }, { pos: 0.5, color: "#0B1220" }, { pos: 1, color: "#0B1220" }] }, noise: { opacity: 0.06 } },
            { id: "headline", type: "text", content: "{{HEADLINE}}", style: "type.h1", color: "colors.text", position: { anchor: "topLeft", x: 72, y: 96 }, maxWidth: 860 },
            { id: "sub", type: "text", content: "{{SUBHEAD}}", style: "type.small", color: "colors.muted", position: { anchor: "topLeft", x: 72, y: 300 }, maxWidth: 900 },
            {
                id: "featureCard",
                type: "card",
                position: { anchor: "topLeft", x: 72, y: 370 },
                size: { w: 936, h: 280 },
                fill: "colors.surface",
                radius: "radius.card",
                shadow: "shadow.card",
                stroke: { color: "rgba(255,255,255,0.10)", width: 1 },
                children: [
                    { id: "b1", type: "bullet", icon: { name: "check_circle", color: "colors.success", size: 40 }, text: "{{FEATURES[0]}}", textStyle: "type.body", textColor: "colors.text", position: { x: 32, y: 34 } },
                    { id: "b2", type: "bullet", icon: { name: "check_circle", color: "colors.success", size: 40 }, text: "{{FEATURES[1]}}", textStyle: "type.body", textColor: "colors.text", position: { x: 32, y: 112 } },
                    { id: "b3", type: "bullet", icon: { name: "check_circle", color: "colors.success", size: 40 }, text: "{{FEATURES[2]}}", textStyle: "type.body", textColor: "colors.text", position: { x: 32, y: 190 } }
                ]
            },
            {
                id: "productStage",
                type: "group",
                position: { anchor: "bottomCenter", x: 540, y: 1040 },
                children: [
                    { id: "glow", type: "shape", shape: "ellipse", size: { w: 820, h: 220 }, fill: "rgba(255,122,24,0.20)", blur: 28 },
                    { id: "product", type: "image", src: "{{PRODUCT_IMAGE}}", fit: "contain", size: { w: 980, h: 520 }, effects: [{ type: "shadow", ref: "shadow.soft" }] }
                ]
            },
            {
                id: "cta",
                type: "button",
                position: { anchor: "bottomCenter", x: 540, y: 1245 },
                size: { w: 520, h: 78 },
                radius: "radius.button",
                fill: { type: "solid", color: "colors.accent" },
                shadow: { x: 0, y: 10, blur: 24, color: "rgba(255,122,24,0.28)" },
                border: { color: "rgba(255,255,255,0.12)", width: 1 },
                text: { content: "{{CTA}}", style: { size: 34, weight: 850, tracking: -0.2 }, color: "#0B1220" }
            },
            { id: "brand", type: "text", content: "{{BRAND}}", style: "type.small", color: "rgba(255,255,255,0.55)", position: { anchor: "bottomLeft", x: 72, y: 1290 } }
        ]
    },
    {
        templateId: "P02_SALE_BADGE_COMPARISON",
        name: "Sale + Badge + Comparison (High-Conversion)",
        industry: ["ecommerce", "fashion", "beauty", "electronics"],
        format: { platform: "meta", aspectRatio: "1:1", size: { w: 1080, h: 1080 }, safeArea: { padTop: 80, padRight: 70, padBottom: 120, padLeft: 70 } },
        tokens: {
            colors: { bg: "#0A0A0F", surface: "rgba(255,255,255,0.06)", text: "#FFFFFF", muted: "rgba(255,255,255,0.75)", accent: "#38BDF8", accent2: "#A78BFA" },
            radius: { card: 26, button: 16, pill: 999 },
            type: { fontFamily: "Inter", h1: { size: 78, lh: 0.95, weight: 900, tracking: -1.2 }, body: { size: 30, lh: 1.15, weight: 650, tracking: -0.1 }, small: { size: 24, lh: 1.2, weight: 650, tracking: 0 } }
        },
        bindings: {
            BRAND: "{{BRAND}}",
            HEADLINE: "{{HEADLINE}}",
            PERCENT: "{{DISCOUNT_PERCENT}}",
            VALIDITY: "{{VALIDITY_TEXT}}",
            PRODUCT_IMAGE: "{{PRODUCT_IMAGE_URL}}",
            CTA: "{{CTA_TEXT}}",
            POINTS: "{{POINTS_3}}"
        },
        layers: [
            { id: "bg", type: "background", fill: { type: "gradient", kind: "linear", angle: 35, stops: [{ pos: 0, color: "#0A0A0F" }, { pos: 1, color: "rgba(56,189,248,0.16)" }] }, noise: { opacity: 0.05 } },
            {
                id: "badge",
                type: "badge",
                position: { anchor: "topLeft", x: 70, y: 86 },
                padding: { x: 18, y: 10 },
                radius: "radius.pill",
                fill: { type: "gradient", kind: "linear", angle: 10, stops: [{ pos: 0, color: "colors.accent" }, { pos: 1, color: "colors.accent2" }] },
                text: { content: "SAVE {{PERCENT}}", style: { size: 26, weight: 900 }, color: "#081018" }
            },
            { id: "headline", type: "text", content: "{{HEADLINE}}", style: "type.h1", color: "colors.text", position: { anchor: "topLeft", x: 70, y: 160 }, maxWidth: 720 },
            { id: "valid", type: "text", content: "{{VALIDITY}}", style: "type.small", color: "colors.muted", position: { anchor: "topLeft", x: 70, y: 330 } },
            {
                id: "card",
                type: "card",
                position: { anchor: "bottomLeft", x: 70, y: 680 },
                size: { w: 560, h: 280 },
                fill: "colors.surface",
                radius: "radius.card",
                stroke: { color: "rgba(255,255,255,0.10)", width: 1 },
                children: [
                    { id: "p1", type: "text", content: "✓ {{POINTS[0]}}", style: "type.body", color: "colors.text", position: { x: 28, y: 38 } },
                    { id: "p2", type: "text", content: "✓ {{POINTS[1]}}", style: "type.body", color: "colors.text", position: { x: 28, y: 112 } },
                    { id: "p3", type: "text", content: "✓ {{POINTS[2]}}", style: "type.body", color: "colors.text", position: { x: 28, y: 186 } }
                ]
            },
            { id: "product", type: "image", src: "{{PRODUCT_IMAGE}}", fit: "contain", position: { anchor: "bottomRight", x: 1030, y: 860 }, size: { w: 520, h: 520 }, effects: [{ type: "shadow", x: 0, y: 18, blur: 46, color: "rgba(0,0,0,0.35)" }] },
            {
                id: "cta",
                type: "button",
                position: { anchor: "bottomLeft", x: 70, y: 980 },
                size: { w: 360, h: 70 },
                radius: "radius.button",
                fill: { type: "solid", color: "rgba(255,255,255,0.10)" },
                border: { color: "rgba(255,255,255,0.22)", width: 1 },
                text: { content: "{{CTA}}", style: { size: 28, weight: 900 }, color: "colors.text" }
            },
            { id: "brand", type: "text", content: "{{BRAND}}", style: "type.small", color: "rgba(255,255,255,0.55)", position: { anchor: "topRight", x: 1010, y: 92 }, align: "right" }
        ]
    },
    {
        templateId: "P03_BEAUTY_EDITORIAL",
        name: "Beauty Editorial (Magazine Clean)",
        industry: ["beauty", "skincare", "cosmetics"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 }, safeArea: { padTop: 90, padRight: 72, padBottom: 140, padLeft: 72 } },
        tokens: {
            colors: { bg: "#F7F3EE", ink: "#111111", muted: "rgba(11,11,11,0.72)", accent: "#E11D48", surface: "rgba(11,11,11,0.04)" },
            radius: { card: 24, button: 16, pill: 999 },
            type: {
                fontFamily: "Inter",
                h1: { size: 84, lh: 0.95, weight: 900, tracking: -1.4 },
                h2: { size: 44, lh: 1.05, weight: 800, tracking: -0.6 },
                body: { size: 30, lh: 1.22, weight: 650, tracking: -0.1 },
                small: { size: 24, lh: 1.2, weight: 650, tracking: 0 }
            }
        },
        bindings: { BRAND: "{{BRAND}}", HEADLINE: "{{HEADLINE}}", TAGLINE: "{{TAGLINE}}", PRODUCT_IMAGE: "{{PRODUCT_IMAGE_URL}}", CTA: "{{CTA_TEXT}}", BADGE: "{{BADGE_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" }, noise: { opacity: 0.03 } },
            { id: "brand", type: "text", content: "{{BRAND}}", style: "type.small", color: "colors.muted", position: { anchor: "topLeft", x: 72, y: 92 } },
            { id: "headline", type: "text", content: "{{HEADLINE}}", style: "type.h1", color: "colors.ink", position: { anchor: "topLeft", x: 72, y: 150 }, maxWidth: 860 },
            { id: "tagline", type: "text", content: "{{TAGLINE}}", style: "type.body", color: "colors.muted", position: { anchor: "topLeft", x: 72, y: 360 }, maxWidth: 860 },
            {
                id: "badge",
                type: "badge",
                position: { anchor: "topRight", x: 1008, y: 150 },
                padding: { x: 16, y: 10 },
                radius: "radius.pill",
                fill: { type: "solid", color: "colors.accent" },
                text: { content: "{{BADGE}}", style: { size: 24, weight: 900 }, color: "#FFFFFF" }
            },
            {
                id: "divider",
                type: "shape",
                shape: "rect",
                position: { anchor: "topLeft", x: 72, y: 460 },
                size: { w: 936, h: 2 },
                fill: "rgba(11,11,11,0.10)"
            },
            {
                id: "productCard",
                type: "card",
                position: { anchor: "bottomCenter", x: 540, y: 1030 },
                size: { w: 940, h: 620 },
                fill: "colors.surface",
                radius: "radius.card",
                stroke: { color: "rgba(11,11,11,0.08)", width: 1 },
                children: [
                    { id: "product", type: "image", src: "{{PRODUCT_IMAGE}}", fit: "contain", position: { anchor: "center", x: 470, y: 290 }, size: { w: 760, h: 420 } },
                    {
                        id: "cta",
                        type: "button",
                        position: { anchor: "bottomCenter", x: 470, y: 560 },
                        size: { w: 420, h: 68 },
                        radius: "radius.button",
                        fill: { type: "solid", color: "#111111" },
                        text: { content: "{{CTA}}", style: { size: 28, weight: 900 }, color: "#F7F3EE" }
                    }
                ]
            }
        ]
    },
    {
        templateId: "P04_RESTAURANT_MENU_DROP",
        name: "Restaurant / Café Drop (Bold Typo + Dish)",
        industry: ["restaurant", "cafe", "food"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 }, safeArea: { padTop: 90, padRight: 72, padBottom: 140, padLeft: 72 } },
        tokens: {
            colors: { bg: "#0B0B0B", paper: "#F5F1E8", ink: "#101010", accent: "#F59E0B", accent2: "#22C55E" },
            radius: { card: 30, button: 16, pill: 999 },
            type: { fontFamily: "Inter", h1: { size: 92, lh: 0.92, weight: 950, tracking: -1.6 }, body: { size: 32, lh: 1.2, weight: 700, tracking: -0.2 }, small: { size: 24, lh: 1.2, weight: 650, tracking: 0 } }
        },
        bindings: { BRAND: "{{BRAND}}", HEADLINE: "{{HEADLINE}}", ITEM: "{{ITEM_NAME}}", PRICE: "{{PRICE}}", DETAILS: "{{DETAILS_LINE}}", FOOD_IMAGE: "{{IMAGE_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" }, noise: { opacity: 0.05 } },
            {
                id: "paperCard",
                type: "card",
                position: { anchor: "center", x: 540, y: 650 },
                size: { w: 980, h: 1160 },
                fill: "colors.paper",
                radius: "radius.card",
                shadow: { x: 0, y: 22, blur: 60, color: "rgba(0,0,0,0.40)" },
                children: [
                    { id: "brand", type: "text", content: "{{BRAND}}", style: "type.small", color: "rgba(16,16,16,0.70)", position: { anchor: "topLeft", x: 56, y: 54 } },
                    { id: "headline", type: "text", content: "{{HEADLINE}}", style: "type.h1", color: "colors.ink", position: { anchor: "topLeft", x: 56, y: 120 }, maxWidth: 860 },
                    {
                        id: "dish",
                        type: "image",
                        src: "{{FOOD_IMAGE}}",
                        fit: "cover",
                        position: { anchor: "topLeft", x: 56, y: 360 },
                        size: { w: 868, h: 520 },
                        radius: 22
                    },
                    { id: "item", type: "text", content: "{{ITEM}}", style: { size: 44, lh: 1.05, weight: 900, tracking: -0.6 }, color: "colors.ink", position: { anchor: "topLeft", x: 56, y: 910 }, maxWidth: 640 },
                    { id: "price", type: "text", content: "{{PRICE}}", style: { size: 44, lh: 1.0, weight: 950, tracking: -0.6 }, color: "colors.accent", position: { anchor: "topRight", x: 924, y: 910 }, align: "right" },
                    { id: "details", type: "text", content: "{{DETAILS}}", style: "type.body", color: "rgba(16,16,16,0.70)", position: { anchor: "topLeft", x: 56, y: 980 }, maxWidth: 860 },
                    {
                        id: "cta",
                        type: "button",
                        position: { anchor: "bottomLeft", x: 56, y: 1100 },
                        size: { w: 360, h: 68 },
                        radius: "radius.button",
                        fill: { type: "solid", color: "colors.ink" },
                        text: { content: "{{CTA}}", style: { size: 28, weight: 900 }, color: "colors.paper" }
                    }
                ]
            }
        ]
    },
    {
        templateId: "P05_REAL_ESTATE_LUXE",
        name: "Real Estate Luxe (Minimal + Trust)",
        industry: ["realestate", "luxury", "services"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 }, safeArea: { padTop: 90, padRight: 72, padBottom: 140, padLeft: 72 } },
        tokens: {
            colors: { bg: "#0A0A0A", glass: "rgba(255,255,255,0.07)", text: "#FFFFFF", muted: "rgba(255,255,255,0.74)", gold: "#D4AF37" },
            radius: { card: 28, button: 16, pill: 999 },
            type: { fontFamily: "Inter", h1: { size: 76, lh: 0.98, weight: 900, tracking: -1.1 }, body: { size: 30, lh: 1.22, weight: 650, tracking: -0.1 }, small: { size: 24, lh: 1.2, weight: 650, tracking: 0 } }
        },
        bindings: { BRAND: "{{BRAND}}", LISTING: "{{LISTING_TITLE}}", LOCATION: "{{LOCATION}}", PRICE: "{{PRICE}}", HERO_IMAGE: "{{IMAGE_URL}}", CTA: "{{CTA_TEXT}}", METRICS: "{{METRICS_3}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "image", src: "{{HERO_IMAGE}}", fit: "cover" }, overlay: { type: "gradient", kind: "linear", angle: 90, stops: [{ pos: 0, color: "rgba(0,0,0,0.15)" }, { pos: 1, color: "rgba(0,0,0,0.75)" }] } },
            {
                id: "topBar",
                type: "group",
                position: { anchor: "topLeft", x: 72, y: 92 },
                children: [
                    { id: "brand", type: "text", content: "{{BRAND}}", style: "type.small", color: "colors.muted" },
                    {
                        id: "goldLine",
                        type: "shape",
                        shape: "rect",
                        position: { anchor: "topLeft", x: 0, y: 44 },
                        size: { w: 220, h: 3 },
                        fill: "colors.gold"
                    }
                ]
            },
            { id: "title", "type": "text", content: "{{LISTING}}", style: "type.h1", color: "colors.text", position: { anchor: "topLeft", x: 72, y: 170 }, maxWidth: 940 },
            { id: "loc", "type": "text", content: "{{LOCATION}}", style: "type.body", color: "colors.muted", position: { anchor: "topLeft", x: 72, y: 330 }, maxWidth: 900 },
            {
                id: "glassCard",
                type: "card",
                position: { anchor: "bottomCenter", x: 540, y: 1120 },
                size: { w: 936, h: 360 },
                fill: "colors.glass",
                radius: "radius.card",
                stroke: { color: "rgba(255,255,255,0.14)", width: 1 },
                children: [
                    { id: "price", type: "text", content: "{{PRICE}}", style: { size: 52, lh: 1.0, weight: 950, tracking: -0.8 }, color: "colors.gold", position: { anchor: "topLeft", x: 34, y: 34 } },
                    { id: "m1", type: "text", content: "{{METRICS[0]}}", style: "type.body", color: "colors.text", position: { x: 34, y: 122 } },
                    { id: "m2", type: "text", content: "{{METRICS[1]}}", style: "type.body", color: "colors.text", position: { x: 34, y: 190 } },
                    { id: "m3", type: "text", content: "{{METRICS[2]}}", style: "type.body", color: "colors.text", position: { x: 34, y: 258 } },
                    {
                        id: "cta",
                        type: "button",
                        position: { anchor: "topRight", x: 902, y: 250 },
                        size: { w: 300, h: 66 },
                        radius: "radius.button",
                        fill: { type: "solid", color: "rgba(212,175,55,0.14)" },
                        border: { color: "rgba(212,175,55,0.55)", width: 1 },
                        text: { content: "{{CTA}}", style: { size: 26, weight: 900 }, color: "colors.gold" }
                    }
                ]
            }
        ]
    },
    {
        templateId: "P06_SAAS_DASHBOARD",
        name: "SaaS Dashboard (Tech + Trust + Stats)",
        industry: ["saas", "b2b", "apps"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 }, safeArea: { padTop: 90, padRight: 72, padBottom: 140, padLeft: 72 } },
        tokens: {
            colors: { bg: "#070A12", panel: "rgba(255,255,255,0.06)", text: "#FFFFFF", muted: "rgba(255,255,255,0.72)", accent: "#34D399", accent2: "#60A5FA" },
            radius: { card: 26, button: 16 },
            type: { fontFamily: "Inter", h1: { size: 78, lh: 0.98, weight: 950, tracking: -1.2 }, body: { size: 30, lh: 1.2, weight: 650, tracking: -0.1 }, small: { size: 24, lh: 1.2, weight: 650, tracking: 0 } }
        },
        bindings: { BRAND: "{{BRAND}}", HEADLINE: "{{HEADLINE}}", SUBHEAD: "{{SUBHEAD}}", SCREENSHOT: "{{UI_IMAGE_URL}}", CTA: "{{CTA_TEXT}}", KPI: "{{KPI_3}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "gradient", kind: "radial", center: { x: 0.55, y: 0.18 }, stops: [{ pos: 0, color: "rgba(96,165,250,0.22)" }, { pos: 0.45, color: "#070A12" }, { pos: 1, color: "#070A12" }] }, noise: { opacity: 0.05 } },
            { id: "brand", type: "text", content: "{{BRAND}}", style: "type.small", color: "colors.muted", position: { anchor: "topLeft", x: 72, y: 92 } },
            { id: "headline", type: "text", content: "{{HEADLINE}}", style: "type.h1", color: "colors.text", position: { anchor: "topLeft", x: 72, y: 150 }, maxWidth: 960 },
            { id: "sub", type: "text", content: "{{SUBHEAD}}", style: "type.body", color: "colors.muted", position: { anchor: "topLeft", x: 72, y: 320 }, maxWidth: 900 },
            {
                id: "uiCard",
                type: "card",
                position: { anchor: "topLeft", x: 72, y: 420 },
                size: { w: 936, h: 560 },
                fill: "colors.panel",
                radius: "radius.card",
                stroke: { color: "rgba(255,255,255,0.10)", width: 1 },
                children: [
                    { id: "ui", type: "image", src: "{{SCREENSHOT}}", fit: "cover", position: { anchor: "topLeft", x: 22, y: 22 }, size: { w: 892, h: 380 }, radius: 18 },
                    { id: "k1", type: "text", content: "{{KPI[0]}}", style: { size: 30, lh: 1.1, weight: 900, tracking: -0.2 }, color: "colors.accent", position: { x: 22, y: 428 } },
                    { id: "k2", type: "text", content: "{{KPI[1]}}", style: { size: 30, lh: 1.1, weight: 900, tracking: -0.2 }, color: "colors.accent2", position: { x: 330, y: 428 } },
                    { id: "k3", type: "text", content: "{{KPI[2]}}", style: { size: 30, lh: 1.1, weight: 900, tracking: -0.2 }, color: "colors.text", position: { x: 640, y: 428 } }
                ]
            },
            {
                id: "cta",
                type: "button",
                position: { anchor: "bottomLeft", x: 72, y: 1245 },
                size: { w: 440, h: 72 },
                radius: "radius.button",
                fill: { type: "gradient", kind: "linear", angle: 8, stops: [{ pos: 0, color: "colors.accent" }, { pos: 1, color: "colors.accent2" }] },
                text: { content: "{{CTA}}", style: { size: 28, weight: 950 }, color: "#071018" }
            }
        ]
    },
    {
        templateId: "P07_FASHION_EDITORIAL_ZINE",
        name: "Fashion Editorial Zine",
        industry: ["fashion", "luxury", "apparel"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 }, safeArea: { padTop: 100, padRight: 80, padBottom: 150, padLeft: 80 } },
        tokens: {
            colors: { bg: "#FFFFFF", text: "#000000", accent: "#E11D48", line: "rgba(0,0,0,0.15)" },
            radius: { card: 0, button: 0 },
            type: {
                fontFamily: "Playfair Display",
                h1: { size: 110, lh: 0.85, weight: 900, tracking: -3 },
                body: { size: 32, lh: 1.4, weight: 400, tracking: 0.5 },
                small: { size: 22, lh: 1.2, weight: 700, tracking: 2 }
            }
        },
        bindings: { BRAND: "{{BRAND}}", COLLECTION: "{{COLLECTION_NAME}}", MODEL_IMAGE: "{{IMAGE_URL}}", LINK: "{{CTA_TEXT}}", TAG: "{{SEASON_TAG}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "border", type: "shape", shape: "rect", position: { x: 40, y: 40 }, size: { w: 1000, h: 1270 }, stroke: { color: "colors.line", width: 1 }, fill: "transparent" },
            { id: "fashionImage", type: "image", src: "{{MODEL_IMAGE}}", fit: "cover", position: { x: 80, y: 80 }, size: { w: 920, h: 700 } },
            { id: "brand", type: "text", content: "{{BRAND}}", style: "type.small", color: "colors.text", position: { anchor: "topCenter", x: 540, y: 820 } },
            { id: "headline", type: "text", content: "{{COLLECTION}}", style: "type.h1", color: "colors.text", position: { anchor: "topCenter", x: 540, y: 880 }, align: "center", maxWidth: 900 },
            { id: "tagline", type: "text", content: "— {{TAG}} —", style: "type.small", color: "colors.accent", position: { anchor: "topCenter", x: 540, y: 1100 } },
            { id: "cta", type: "button", position: { anchor: "bottomCenter", x: 540, y: 1240 }, size: { w: 400, h: 60 }, border: { color: "#000000", width: 2 }, text: { content: "{{LINK}}", style: { size: 24, weight: 800 }, color: "#000000" } }
        ]
    },
    {
        templateId: "P08_FITNESS_DYNAMICS",
        name: "Fitness Dynamics (Energy + Bold)",
        industry: ["fitness", "gym", "health"],
        format: { platform: "meta", aspectRatio: "9:16", size: { w: 1080, h: 1920 }, safeArea: { padTop: 120, padRight: 90, padBottom: 180, padLeft: 90 } },
        tokens: {
            colors: { bg: "#000000", accent: "#CCFF00", text: "#FFFFFF", shadow: "rgba(204,255,0,0.3)" },
            type: { fontFamily: "Oswald", h1: { size: 140, lh: 0.9, weight: 900, tracking: -2 }, body: { size: 40, lh: 1.1, weight: 700 } }
        },
        bindings: { HEADLINE: "{{HEADLINE}}", ACTION: "{{CTA}}", TRAINER_IMAGE: "{{IMAGE_URL}}", STAT: "{{BENEFIT_STAT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "#050505" } },
            { id: "accentSwoosh", type: "shape", shape: "rect", position: { x: -200, y: 800 }, size: { w: 1500, h: 400 }, fill: "colors.accent", rotation: -12, opacity: 0.8 },
            { id: "trainer", type: "image", src: "{{TRAINER_IMAGE}}", fit: "cover", position: { x: 0, y: 200 }, size: { w: 1080, h: 1200 } },
            { id: "headline", type: "text", content: "{{HEADLINE}}", style: "type.h1", color: "colors.text", position: { x: 90, y: 1100 }, maxWidth: 900, shadow: { x: 10, y: 10, blur: 0, color: "#CCFF00" } },
            { id: "statBadge", type: "badge", position: { x: 90, y: 1450 }, padding: { x: 30, y: 15 }, fill: "colors.text", text: { content: "{{STAT}}", color: "#000000", style: { size: 36, weight: 900 } } },
            { id: "cta", type: "button", position: { anchor: "bottomCenter", x: 540, y: 1750 }, size: { w: 900, h: 120 }, fill: "colors.accent", text: { content: "{{ACTION}}", color: "#000000", style: { size: 48, weight: 900 } } }
        ]
    },
    {
        templateId: "P09_TRAVEL_IMMERSIVE",
        name: "Travel Immersive (Vista + Card)",
        industry: ["travel", "tourism", "hotels"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 } },
        tokens: {
            colors: { bg: "#000000", glass: "rgba(255,255,255,0.15)", text: "#FFFFFF", accent: "#00E0FF" },
            radius: { card: 40 }
        },
        bindings: { DESTINATION: "{{DESTINATION}}", PRICE: "{{STARTING_PRICE}}", SCENIC_IMAGE: "{{IMAGE_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "image", src: "{{SCENIC_IMAGE}}", fit: "cover" } },
            { id: "vignette", type: "shape", shape: "rect", size: { w: 1080, h: 1350 }, fill: { type: "gradient", kind: "linear", angle: 0, stops: [{ pos: 0, color: "rgba(0,0,0,0.7)" }, { pos: 0.4, color: "transparent" }] } },
            {
                id: "infoCard",
                type: "card",
                position: { anchor: "bottomCenter", x: 540, y: 1280 },
                size: { w: 960, h: 320 },
                fill: "colors.glass",
                blur: 30,
                radius: "radius.card",
                stroke: { color: "rgba(255,255,255,0.2)", width: 1 },
                children: [
                    { id: "loc", type: "text", content: "{{DESTINATION}}", style: { size: 64, weight: 900 }, color: "colors.text", position: { x: 50, y: 60 } },
                    { id: "priceTag", type: "text", content: "Starts from {{PRICE}}", style: { size: 32, weight: 600 }, color: "colors.accent", position: { x: 50, y: 140 } },
                    { id: "cta", type: "button", position: { x: 50, y: 210 }, size: { w: 320, h: 70 }, fill: "colors.text", text: { content: "{{CTA}}", color: "#000000", style: { size: 28, weight: 800 } } }
                ]
            }
        ]
    },
    {
        templateId: "P10_AUTO_SPEC_SHEET",
        name: "Automotive Spec Sheet (Sleek High-Tech)",
        industry: ["automotive", "luxury", "cars"],
        format: { platform: "meta", aspectRatio: "1:1", size: { w: 1080, h: 1080 } },
        tokens: {
            colors: { bg: "#050505", accent: "#3B82F6", text: "#FFFFFF", lines: "rgba(59,130,246,0.3)" },
            type: { fontFamily: "Inter", h1: { size: 72, weight: 900 }, body: { size: 28, weight: 600 } }
        },
        bindings: { MODEL: "{{CAR_MODEL}}", SPEC1: "{{SPEC_SPEED}}", SPEC2: "{{SPEC_RANGE}}", CAR_IMAGE: "{{IMAGE_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "glow", type: "shape", shape: "ellipse", position: { x: 540, y: 540 }, size: { w: 800, h: 800 }, fill: "rgba(59,130,246,0.1)", blur: 100 },
            { id: "car", type: "image", src: "{{CAR_IMAGE}}", fit: "contain", position: { x: 40, y: 200 }, size: { w: 1000, h: 600 } },
            { id: "line1", type: "shape", shape: "rect", position: { x: 200, y: 500 }, size: { w: 150, h: 2 }, fill: "colors.lines", rotation: -45 },
            { id: "spec1", type: "text", content: "{{SPEC1}}", style: "type.body", color: "colors.accent", position: { x: 360, y: 380 } },
            { id: "line2", type: "shape", shape: "rect", position: { x: 700, y: 550 }, size: { w: 150, h: 2 }, fill: "colors.lines", rotation: 45 },
            { id: "spec2", type: "text", content: "{{SPEC2}}", style: "type.body", color: "colors.accent", position: { x: 550, y: 700 } },
            { id: "model", type: "text", content: "{{MODEL}}", style: "type.h1", color: "colors.text", position: { anchor: "bottomLeft", x: 60, y: 1020 } },
            { id: "cta", type: "button", position: { anchor: "bottomRight", x: 1020, y: 1020 }, size: { w: 300, h: 60 }, fill: "colors.accent", text: { content: "{{CTA}}", color: "#FFFFFF", style: { size: 24, weight: 900 } } }
        ]
    },
    {
        templateId: "P11_EDU_MASTERCLASS",
        name: "Edu Masterclass (Professional + Trust)",
        industry: ["education", "coaching", "learning"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 } },
        tokens: {
            colors: { bg: "#F0F4F8", surface: "#FFFFFF", primary: "#1A365D", secondary: "#2B6CB0", accent: "#ED8936" },
            radius: { card: 20 }
        },
        bindings: { COURSE: "{{COURSE_TITLE}}", COACH: "{{COACH_NAME}}", DATE: "{{START_DATE}}", COACH_IMAGE: "{{IMAGE_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "sidePanel", type: "shape", shape: "rect", position: { x: 600, y: 0 }, size: { w: 480, h: 1350 }, fill: "colors.primary" },
            { id: "coach", type: "image", src: "{{COACH_IMAGE}}", fit: "cover", position: { x: 550, y: 100 }, size: { w: 530, h: 1250 } },
            {
                id: "mainCard",
                type: "card",
                position: { x: 60, y: 300 },
                size: { w: 600, h: 700 },
                fill: "colors.surface",
                radius: "radius.card",
                shadow: { x: 0, y: 20, blur: 40, color: "rgba(0,0,0,0.1)" },
                children: [
                    { id: "badge", type: "badge", position: { x: 40, y: 40 }, padding: { x: 20, y: 10 }, radius: 99, fill: "colors.accent", text: { content: "LIVE SESSION", color: "#FFFFFF", style: { size: 20, weight: 900 } } },
                    { id: "title", type: "text", content: "{{COURSE}}", style: { size: 68, weight: 900 }, color: "colors.primary", position: { x: 40, y: 120 }, maxWidth: 520 },
                    { id: "coachName", type: "text", content: "with {{COACH}}", style: { size: 32, weight: 600 }, color: "colors.secondary", position: { x: 40, y: 400 } },
                    { id: "date", type: "text", content: "Begins {{DATE}}", style: { size: 28, weight: 400 }, color: "#666666", position: { x: 40, y: 460 } },
                    { id: "cta", type: "button", position: { x: 40, y: 550 }, size: { w: 520, h: 80 }, fill: "colors.primary", text: { content: "{{CTA}}", color: "#FFFFFF", style: { size: 30, weight: 800 } } }
                ]
            }
        ]
    },
    {
        templateId: "P12_SERVICE_PORTFOLIO_WEB",
        name: "Web Design Portfolio (Luxe + Tech)",
        industry: ["service", "webdesign", "agency"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 } },
        tokens: {
            colors: { bg: "#0F172A", text: "#F8FAFC", accent: "#38BDF8", surface: "rgba(30,41,59,0.7)" },
            radius: { card: 24, button: 12 }
        },
        bindings: { SERVICE: "{{SERVICE_NAME}}", SLOGAN: "{{SLOGAN}}", SPEC1: "{{KEY_FEATURE_1}}", SPEC2: "{{KEY_FEATURE_2}}", MOCKUP_IMAGE: "{{IMAGE_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "glow", type: "shape", shape: "ellipse", position: { x: 900, y: 100 }, size: { w: 600, h: 600 }, fill: "rgba(56,189,248,0.1)", blur: 80 },
            { id: "title", type: "text", content: "{{SERVICE}}", style: { size: 82, weight: 900 }, color: "colors.text", position: { x: 72, y: 120 }, maxWidth: 900 },
            { id: "desc", type: "text", content: "{{SLOGAN}}", style: { size: 34, weight: 500 }, color: "colors.accent", position: { x: 72, y: 240 } },
            {
                id: "mockupGroup",
                type: "group",
                position: { x: 72, y: 340 },
                children: [
                    { id: "frame", type: "card", size: { w: 936, h: 560 }, fill: "colors.surface", radius: "radius.card", stroke: { color: "rgba(255,255,255,0.1)", width: 1 } },
                    { id: "img", type: "image", src: "{{MOCKUP_IMAGE}}", fit: "cover", position: { x: 20, y: 20 }, size: { w: 896, h: 520 }, radius: 12 }
                ]
            },
            { id: "tag1", type: "badge", position: { x: 72, y: 940 }, padding: { x: 24, y: 12 }, radius: 99, fill: "rgba(56,189,248,0.1)", text: { content: "{{SPEC1}}", color: "colors.accent", style: { size: 24, weight: 700 } } },
            { id: "tag2", type: "badge", position: { x: 350, y: 940 }, padding: { x: 24, y: 12 }, radius: 99, fill: "rgba(56,189,248,0.1)", text: { content: "{{SPEC2}}", color: "colors.accent", style: { size: 24, weight: 700 } } },
            { id: "cta", type: "button", position: { anchor: "bottomCenter", x: 540, y: 1240 }, size: { w: 936, h: 80 }, fill: "colors.accent", text: { content: "{{CTA}}", color: "#0F172A", style: { size: 32, weight: 900 } } }
        ]
    },
    {
        templateId: "P13_CRAFT_INTERIOR_SHOWCASE",
        name: "Craftsmanship & Interior (Natural + Earth)",
        industry: ["craft", "interior", "carpentry"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 } },
        tokens: {
            colors: { bg: "#FDFCFB", text: "#2D241E", accent: "#8B5E3C", muted: "rgba(45,36,30,0.6)" },
            type: { fontFamily: "Playfair Display" }
        },
        bindings: { PRODUCT: "{{PRODUCT_NAME}}", PHILOSOPHY: "{{PHILOSOPHY_TEXT}}", CRAFT_IMAGE: "{{IMAGE_URL}}", DETAIL_IMAGE: "{{DETAIL_IMAGE_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "mainImg", type: "image", src: "{{CRAFT_IMAGE}}", fit: "cover", position: { x: 60, y: 60 }, size: { w: 960, h: 640 }, radius: 4 },
            { id: "detailImg", type: "image", src: "{{DETAIL_IMAGE}}", fit: "cover", position: { x: 700, y: 560 }, size: { w: 320, h: 320 }, radius: 4, stroke: { color: "#FFFFFF", width: 8 } },
            { id: "headline", type: "text", content: "{{PRODUCT}}", style: { size: 74, weight: 900 }, color: "colors.text", position: { x: 60, y: 780 } },
            { id: "desc", type: "text", content: "{{PHILOSOPHY}}", style: { size: 32, weight: 400 }, color: "colors.muted", position: { x: 60, y: 920 }, maxWidth: 600, lineHeight: 1.4 },
            { id: "line", type: "shape", shape: "rect", position: { x: 60, y: 880 }, size: { w: 120, h: 4 }, fill: "colors.accent" },
            { id: "cta", type: "button", position: { anchor: "bottomLeft", x: 60, y: 1240 }, size: { w: 400, h: 70 }, fill: "colors.text", text: { content: "{{CTA}}", color: "#FFFFFF", style: { size: 26, weight: 700 } } }
        ]
    },
    {
        templateId: "P14_GASTRO_JOBS",
        name: "Gastro Recruitment (Dynamic + Team)",
        industry: ["restaurant", "jobs", "gastronomy"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 } },
        tokens: {
            colors: { bg: "#FF4D00", surface: "#FFFFFF", text: "#000000", accent: "#FFDD00" },
            radius: { card: 30 }
        },
        bindings: { ROLE: "{{JOB_ROLE}}", PERKS: "{{PERKS_LIST}}", TEAM_IMAGE: "{{IMAGE_URL}}", CTA: "{{CTA_TEXT}}", BRAND: "{{BRAND_NAME}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "team", type: "image", src: "{{TEAM_IMAGE}}", fit: "cover", position: { x: 0, y: 0 }, size: { w: 1080, h: 700 } },
            { id: "slant", type: "shape", shape: "rect", position: { x: -100, y: 600 }, size: { w: 1400, h: 200 }, fill: "colors.bg", rotation: -5 },
            { id: "headline", type: "text", content: "WIR SUCHEN\n{{ROLE}}", style: { size: 86, weight: 950 }, color: "colors.surface", position: { x: 60, y: 720 }, maxWidth: 960 },
            {
                id: "perksCard",
                type: "card",
                position: { x: 60, y: 960 },
                size: { w: 960, h: 260 },
                fill: "colors.surface",
                radius: "radius.card",
                children: [
                    { id: "p1", type: "text", content: "⚡ {{PERKS[0]}}", style: { size: 32, weight: 800 }, color: "colors.text", position: { x: 40, y: 50 } },
                    { id: "p2", type: "text", content: "⚡ {{PERKS[1]}}", style: { size: 32, weight: 800 }, color: "colors.text", position: { x: 40, y: 120 } },
                    { id: "p3", type: "text", content: "⚡ {{PERKS[2]}}", style: { size: 32, weight: 800 }, color: "colors.text", position: { x: 40, y: 190 } },
                    { id: "badge", type: "badge", position: { x: 740, y: 40 }, padding: { x: 20, y: 30 }, radius: 99, fill: "colors.accent", text: { content: "BEWIRB DICH!", color: "#000000", style: { size: 24, weight: 900 }, rotation: 10 } }
                ]
            },
            { id: "brand", type: "text", content: "{{BRAND}}", style: { size: 28, weight: 600 }, color: "rgba(255,255,255,0.8)", position: { anchor: "bottomLeft", x: 60, y: 1300 } }
        ]
    },
    {
        templateId: "P15_ECOM_BENTO_GRID",
        name: "E-Com Bento Grid (Modern + Multi-Feature)",
        industry: ["ecommerce", "gadgets", "product"],
        format: { platform: "meta", aspectRatio: "1:1", size: { w: 1080, h: 1080 } },
        tokens: {
            colors: { bg: "#000000", card: "#111111", text: "#FFFFFF", accent: "#3B82F6" },
            radius: { card: 24 }
        },
        bindings: { PRODUCT: "{{PRODUCT_NAME}}", DESC: "{{SHORT_DESC}}", IMG1: "{{IMAGE_1}}", IMG2: "{{IMAGE_2}}", PRICE: "{{PRICE}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            {
                id: "grid",
                type: "group",
                position: { x: 40, y: 40 },
                children: [
                    {
                        id: "c1", type: "card", position: { x: 0, y: 0 }, size: { w: 600, h: 600 }, fill: "colors.card", radius: "radius.card", children: [
                            { id: "img1", type: "image", src: "{{IMG1}}", fit: "contain", position: { x: 40, y: 40 }, size: { w: 520, h: 520 } }
                        ]
                    },
                    {
                        id: "c2", type: "card", position: { x: 620, y: 0 }, size: { w: 380, h: 380 }, fill: "colors.card", radius: "radius.card", children: [
                            { id: "img2", type: "image", src: "{{IMG2}}", fit: "contain", position: { x: 30, y: 30 }, size: { w: 320, h: 320 } }
                        ]
                    },
                    {
                        id: "c3", type: "card", position: { x: 620, y: 400 }, size: { w: 380, h: 580 }, fill: "colors.accent", radius: "radius.card", children: [
                            { id: "p", type: "text", content: "{{PRICE}}", style: { size: 82, weight: 950 }, color: "#FFFFFF", position: { x: 40, y: 60 } },
                            { id: "btn", type: "button", position: { x: 40, y: 460 }, size: { w: 300, h: 80 }, fill: "#FFFFFF", text: { content: "{{CTA}}", color: "colors.accent", style: { size: 28, weight: 900 } } }
                        ]
                    },
                    {
                        id: "c4", type: "card", position: { x: 0, y: 620 }, size: { w: 600, h: 360 }, fill: "colors.card", radius: "radius.card", children: [
                            { id: "t", type: "text", content: "{{PRODUCT}}", style: { size: 54, weight: 900 }, color: "#FFFFFF", position: { x: 40, y: 60 } },
                            { id: "d", type: "text", content: "{{DESC}}", style: { size: 28, weight: 500 }, color: "rgba(255,255,255,0.6)", position: { x: 40, y: 150 }, maxWidth: 520 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        templateId: "P16_SALE_FLASH_URGENCY",
        name: "Flash Sale (Urgency + High Impact)",
        industry: ["ecommerce", "fashion", "electronics"],
        format: { platform: "meta", aspectRatio: "1:1", size: { w: 1080, h: 1080 } },
        tokens: {
            colors: { bg: "#FF0000", text: "#FFFFFF", accent: "#FFFF00", card: "rgba(0,0,0,0.2)" },
            radius: { card: 0, button: 0 }
        },
        bindings: { HEADLINE: "{{HEADLINE}}", PERCENT: "{{DISCOUNT}}", TIMER: "{{TIME_LEFT}}", IMAGE: "{{IMAGE_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "img", type: "image", src: "{{IMAGE}}", fit: "cover", position: { x: 50, y: 50 }, size: { w: 980, h: 600 } },
            { id: "badge", type: "badge", position: { x: 50, y: 50 }, padding: { x: 40, y: 20 }, fill: "colors.accent", text: { content: "-{{PERCENT}}", color: "#000000", style: { size: 60, weight: 950 } } },
            { id: "h", type: "text", content: "{{HEADLINE}}", style: { size: 82, weight: 950 }, color: "colors.text", position: { x: 50, y: 680 }, maxWidth: 980 },
            { id: "timer", type: "text", content: "Ends in: {{TIMER}}", style: { size: 32, weight: 700 }, color: "colors.accent", position: { x: 50, y: 880 } },
            { id: "cta", type: "button", position: { anchor: "bottomCenter", x: 540, y: 1040 }, size: { w: 980, h: 100 }, fill: "colors.text", text: { content: "{{CTA}}", color: "colors.bg", style: { size: 40, weight: 900 } } }
        ]
    },
    {
        templateId: "P17_SALE_LIFESTYLE_ELEGANCE",
        name: "Lifestyle Sale (Elegant + Soft)",
        industry: ["fashion", "home", "beauty"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 } },
        tokens: {
            colors: { bg: "#F4F1EA", text: "#1A1A1A", accent: "#8B5E3C" }
        },
        bindings: { HEADLINE: "{{HEADLINE}}", SUB: "{{SUBTEXT}}", IMAGE: "{{IMAGE_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "img", type: "image", src: "{{IMAGE}}", fit: "cover", position: { x: 80, y: 80 }, size: { w: 920, h: 900 }, radius: 10 },
            { id: "h", type: "text", content: "{{HEADLINE}}", style: { size: 72, weight: 900 }, color: "colors.text", position: { x: 80, y: 1020 } },
            { id: "s", type: "text", content: "{{SUB}}", style: { size: 32, weight: 400 }, color: "colors.text", position: { x: 80, y: 1120 }, opacity: 0.7 },
            { id: "cta", type: "button", position: { anchor: "bottomRight", x: 1000, y: 1270 }, size: { w: 300, h: 60 }, fill: "colors.text", text: { content: "{{CTA}}", color: "#FFFFFF", style: { size: 24, weight: 800 } } }
        ]
    },
    {
        templateId: "P18_SALE_RETAIL_GRID",
        name: "Retail Multi-Sale (Grid Style)",
        industry: ["ecommerce", "retail", "supermarket"],
        format: { platform: "meta", aspectRatio: "1:1", size: { w: 1080, h: 1080 } },
        tokens: {
            colors: { bg: "#FFFFFF", accent: "#E11D48", text: "#000000" }
        },
        bindings: { TITLE: "{{SALE_TITLE}}", ITEMS: "{{ITEMS_ARRAY_3}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "h", type: "text", content: "{{TITLE}}", style: { size: 64, weight: 950 }, color: "colors.accent", position: { x: 50, y: 80 } },
            {
                id: "grid", type: "group", position: { x: 50, y: 200 }, children: [
                    { id: "i1", type: "image", src: "{{ITEMS[0].img}}", size: { w: 310, h: 310 }, position: { x: 0, y: 0 }, radius: 10 },
                    { id: "i2", type: "image", src: "{{ITEMS[1].img}}", size: { w: 310, h: 310 }, position: { x: 335, y: 0 }, radius: 10 },
                    { id: "i3", type: "image", src: "{{ITEMS[2].img}}", size: { w: 310, h: 310 }, position: { x: 670, y: 0 }, radius: 10 }
                ]
            },
            { id: "cta", type: "button", position: { x: 50, y: 950 }, size: { w: 980, h: 80 }, fill: "colors.accent", text: { content: "{{CTA}}", color: "#FFFFFF", style: { size: 32, weight: 900 } } }
        ]
    },
    {
        templateId: "P19_DROP_PROBLEM_SOLVER",
        name: "Dropshipping: Problem Solver",
        industry: ["dropshipping", "gadgets", "home"],
        format: { platform: "meta", aspectRatio: "9:16", size: { w: 1080, h: 1920 } },
        tokens: {
            colors: { bg: "#000000", text: "#FFFFFF", accent: "#00FF00" }
        },
        bindings: { PROBLEM: "{{PROBLEM_HOOK}}", SOLUTION: "{{SOLUTION_TEXT}}", VIDEO_STILL: "{{IMAGE_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "media", type: "image", src: "{{VIDEO_STILL}}", fit: "cover", size: { w: 1080, h: 1300 }, position: { x: 0, y: 0 } },
            { id: "overlay", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { w: 1080, h: 250 }, fill: "rgba(0,0,0,0.6)" },
            { id: "hook", type: "text", content: "{{PROBLEM}}", style: { size: 54, weight: 950 }, color: "colors.text", position: { x: 60, y: 80 }, align: "center", maxWidth: 960 },
            {
                id: "card", type: "card", position: { x: 60, y: 1350 }, size: { w: 960, h: 400 }, fill: "#FFFFFF", radius: 20, children: [
                    { id: "sol", type: "text", content: "{{SOLUTION}}", style: { size: 42, weight: 800 }, color: "#000000", position: { x: 40, y: 60 }, maxWidth: 880 },
                    { id: "cta", type: "button", position: { x: 40, y: 260 }, size: { w: 880, h: 100 }, fill: "colors.bg", text: { content: "{{CTA}}", color: "#FFFFFF", style: { size: 36, weight: 900 } } }
                ]
            }
        ]
    },
    {
        templateId: "P20_DROP_VIRAL_HOOK",
        name: "Dropshipping: Viral Feature",
        industry: ["dropshipping", "gadgets"],
        format: { platform: "meta", aspectRatio: "1:1", size: { w: 1080, h: 1080 } },
        tokens: {
            colors: { bg: "#FFFFFF", accent: "#FFD700", text: "#000000" }
        },
        bindings: { FEATURE: "{{MAIN_FEATURE}}", PRODUCT_IMG: "{{IMAGE_URL}}", BADGE: "{{BADGE_TEXT}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "prod", type: "image", src: "{{PRODUCT_IMG}}", fit: "contain", size: { w: 800, h: 800 }, position: { x: 140, y: 100 } },
            { id: "fBadge", type: "badge", position: { x: 40, y: 40 }, padding: { x: 30, y: 15 }, fill: "colors.accent", text: { content: "{{BADGE}}", color: "#000000", style: { size: 32, weight: 900 } } },
            {
                id: "footer", type: "card", position: { x: 0, y: 900 }, size: { w: 1080, h: 180 }, fill: "#000000", children: [
                    { id: "txt", type: "text", content: "{{FEATURE}}", style: { size: 48, weight: 900 }, color: "#FFFFFF", position: { x: 40, y: 65 } },
                    { id: "cta", type: "button", position: { x: 740, y: 45 }, size: { w: 300, h: 90 }, fill: "colors.accent", text: { content: "{{CTA}}", color: "#000000", style: { size: 28, weight: 900 } } }
                ]
            }
        ]
    },
    {
        templateId: "P20_B_DROP_VIRAL_COMPOSED",
        name: "Dropshipping: Viral Feature (Dark Mode + Composed)",
        industry: ["dropshipping", "gadgets", "tech"],
        format: { platform: "meta", aspectRatio: "1:1", size: { w: 1080, h: 1080 } },
        tokens: {
            colors: { bg: "#0F0F0F", accent: "#00E0FF", text: "#FFFFFF", platform: "rgba(255,255,255,0.05)" }
        },
        bindings: { FEATURE: "{{MAIN_FEATURE}}", PRODUCT_IMG: "{{IMAGE_URL}}", BADGE: "{{BADGE_TEXT}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "gradient", kind: "radial", center: { x: 0.5, y: 0.5 }, stops: [{ pos: 0, color: "#1a1a1a" }, { pos: 1, color: "#000000" }] } },
            { id: "grid", type: "shape", shape: "rect", size: { w: 1080, h: 1080 }, fill: "transparent", border: { color: "rgba(0, 224, 255, 0.1)", width: 1 } },
            { id: "platform", type: "shape", shape: "ellipse", size: { w: 900, h: 300 }, position: { x: 90, y: 700 }, fill: "colors.platform", blur: 40 },
            { id: "prod", type: "image", src: "{{PRODUCT_IMG}}", fit: "contain", size: { w: 900, h: 800 }, position: { x: 90, y: 100 }, effects: [{ type: "shadow", color: "rgba(0,224,255,0.2)", blur: 60, y: 20 }] },
            { id: "fBadge", type: "badge", position: { x: 50, y: 50 }, padding: { x: 30, y: 15 }, fill: "transparent", border: { color: "colors.accent", width: 2 }, text: { content: "{{BADGE}}", color: "colors.accent", style: { size: 32, weight: 900 } } },
            {
                id: "footer", type: "card", position: { x: 50, y: 880 }, size: { w: 980, h: 150 }, fill: "rgba(0,0,0,0.6)", border: { color: "rgba(255,255,255,0.1)", width: 1 }, radius: 24, children: [
                    { id: "txt", type: "text", content: "{{FEATURE}}", style: { size: 48, weight: 900 }, color: "#FFFFFF", position: { x: 40, y: 55 } },
                    { id: "cta", type: "button", position: { x: 640, y: 30 }, size: { w: 300, h: 90 }, fill: "colors.accent", text: { content: "{{CTA}}", color: "#000000", style: { size: 28, weight: 900 } } }
                ]
            }
        ]
    },
    {
        templateId: "P20_C_SMART_CUTOUT_DEMO",
        name: "Dropshipping: Smart Cutout (Auto-Extract)",
        industry: ["dropshipping", "gadgets", "tech"],
        format: { platform: "meta", aspectRatio: "1:1", size: { w: 1080, h: 1080 } },
        tokens: {
            colors: { bg: "#0F0F0F", accent: "#00FF99", text: "#FFFFFF", platform: "rgba(255,255,255,0.05)" }
        },
        bindings: { FEATURE: "{{MAIN_FEATURE}}", PRODUCT_IMG: "{{IMAGE_URL}}", BADGE: "{{BADGE_TEXT}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "gradient", kind: "radial", center: { x: 0.5, y: 0.5 }, stops: [{ pos: 0, color: "#1a1a1a" }, { pos: 1, color: "#000000" }] } },
            { id: "grid", type: "shape", shape: "rect", size: { w: 1080, h: 1080 }, fill: "transparent", border: { color: "rgba(0, 255, 153, 0.1)", width: 1 } },
            { id: "platform", type: "shape", shape: "ellipse", size: { w: 900, h: 300 }, position: { x: 90, y: 700 }, fill: "colors.platform", blur: 40 },
            {
                id: "prod",
                type: "image",
                src: "{{PRODUCT_IMG}}",
                fit: "contain",
                size: { w: 900, h: 800 },
                position: { x: 90, y: 100 },
                effects: [
                    { type: "remove_background" }, // <--- THE KEY INSTRUCTION
                    { type: "shadow", color: "rgba(0,255,153,0.2)", blur: 60, y: 20 }
                ]
            },
            { id: "fBadge", type: "badge", position: { x: 50, y: 50 }, padding: { x: 30, y: 15 }, fill: "transparent", border: { color: "colors.accent", width: 2 }, text: { content: "{{BADGE}}", color: "colors.accent", style: { size: 32, weight: 900 } } },
            {
                id: "footer", type: "card", position: { x: 50, y: 880 }, size: { w: 980, h: 150 }, fill: "rgba(0,0,0,0.6)", border: { color: "rgba(255,255,255,0.1)", width: 1 }, radius: 24, children: [
                    { id: "txt", type: "text", content: "{{FEATURE}}", style: { size: 48, weight: 900 }, color: "#FFFFFF", position: { x: 40, y: 55 } },
                    { id: "cta", type: "button", position: { x: 640, y: 30 }, size: { w: 300, h: 90 }, fill: "colors.accent", text: { content: "{{CTA}}", color: "#000000", style: { size: 28, weight: 900 } } }
                ]
            }
        ]
    },
    {
        templateId: "P21_DROP_TRUST_SOCIAL",
        name: "Dropshipping: Trust & Social Proof",
        industry: ["dropshipping", "ecommerce"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 } },
        tokens: {
            colors: { bg: "#F0F2F5", text: "#1C1E21", points: "#42B72A" }
        },
        bindings: { STARS: "{{RATING}}", REVIEW: "{{REVIEW_TEXT}}", NAME: "{{USER_NAME}}", IMG: "{{PRODUCT_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "prod", type: "image", src: "{{IMG}}", fit: "cover", size: { w: 1080, h: 800 }, position: { x: 0, y: 0 } },
            {
                id: "revCard", type: "card", position: { x: 40, y: 840 }, size: { w: 1000, h: 470 }, fill: "#FFFFFF", radius: 20, shadow: { x: 0, y: 10, blur: 30, color: "rgba(0,0,0,0.1)" }, children: [
                    { id: "stars", type: "text", content: "⭐⭐⭐⭐⭐", style: { size: 40 }, position: { x: 40, y: 40 } },
                    { id: "txt", type: "text", content: "\"{{REVIEW}}\"", style: { size: 36, weight: 600 }, color: "colors.text", position: { x: 40, y: 120 }, maxWidth: 920 },
                    { id: "user", type: "text", content: "- {{NAME}}", style: { size: 28, weight: 400 }, color: "rgba(0,0,0,0.5)", position: { x: 40, y: 320 } },
                    { id: "cta", type: "button", position: { x: 40, y: 380 }, size: { w: 920, h: 60 }, fill: "#000000", text: { content: "{{CTA}}", color: "#FFFFFF", style: { size: 24, weight: 800 } } }
                ]
            }
        ]
    },
    {
        templateId: "P21_DROP_TRUST_SOCIAL",
        name: "Dropshipping: Trust & Social Proof",
        industry: ["dropshipping", "ecommerce"],
        format: { platform: "meta", aspectRatio: "1:1", size: { w: 1080, h: 1080 } },
        tokens: {
            colors: { bg: "#F5F5F5", accent: "#333333", text: "#000000" }
        },
        bindings: { HEADLINE: "{{HEADLINE}}", PRODUCT_IMG: "{{IMAGE_URL}}", REVIEW: "{{REVIEW_TEXT}}", AUTHOR: "{{AUTHOR_NAME}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "prod", type: "image", src: "{{PRODUCT_IMG}}", fit: "contain", size: { w: 600, h: 600 }, position: { x: 240, y: 150 } },
            {
                id: "reviewCard", type: "card", position: { x: 90, y: 800 }, size: { w: 900, h: 220 }, fill: "#FFFFFF", shadow: "0px 10px 30px rgba(0,0,0,0.1)", radius: 16, children: [
                    { id: "stars", type: "text", content: "★★★★★", style: { size: 36, weight: 900 }, color: "#FFD700", position: { x: 40, y: 30 } },
                    { id: "rev", type: "text", content: "{{REVIEW}}", style: { size: 32, weight: 400 }, color: "#333333", position: { x: 40, y: 80 }, maxWidth: 820 },
                    { id: "auth", type: "text", content: "- {{AUTHOR}}", style: { size: 24, weight: 700 }, color: "#999999", position: { x: 40, y: 170 } }
                ]
            }
        ]
    },
    {
        templateId: "P30_SAFETY_BLUR_FRAME",
        name: "Universal: Safety Frame (For Low Res/Bad Ratio)",
        industry: ["universal", "fallback"],
        format: { platform: "meta", aspectRatio: "1:1", size: { w: 1080, h: 1080 } },
        tokens: {
            colors: { bg: "#000000", frame: "#FFFFFF", text: "#FFFFFF" }
        },
        bindings: { HEADLINE: "{{HEADLINE}}", PRODUCT_IMG: "{{IMAGE_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            // Layer 1: Blurred version of the image as background (Hides bad quality)
            { id: "bg_blur", type: "image", src: "{{PRODUCT_IMG}}", fit: "cover", size: { w: 1080, h: 1080 }, position: { x: 0, y: 0 }, effects: [{ type: "blur", amount: 40 }, { type: "opacity", value: 0.6 }] },
            // Layer 2: Dark Overlay to ensure text pops
            { id: "overlay", type: "shape", shape: "rect", size: { w: 1080, h: 1080 }, fill: "rgba(0,0,0,0.4)" },
            // Layer 3: Crisp Frame for the actual image
            {
                id: "safe_frame", type: "card", position: { x: 140, y: 140 }, size: { w: 800, h: 500 }, fill: "#FFFFFF", shadow: "0px 20px 50px rgba(0,0,0,0.5)", radius: 4, children: [
                    { id: "prod_safe", type: "image", src: "{{PRODUCT_IMG}}", fit: "contain", size: { w: 760, h: 460 }, position: { x: 20, y: 20 } }
                ]
            },
            // Layer 4: Text Content Below
            {
                id: "txt_grp", type: "group", position: { x: 140, y: 700 }, children: [
                    { id: "head", type: "text", content: "{{HEADLINE}}", style: { size: 60, weight: 900 }, color: "#FFFFFF", maxWidth: 800, align: "center" },
                    { id: "cta", type: "button", position: { x: 200, y: 150 }, size: { w: 400, h: 100 }, fill: "#FFFFFF", text: { content: "{{CTA}}", color: "#000000", style: { size: 32, weight: 900 } } }
                ]
            }
        ]
    },
    {
        templateId: "P31_SPLIT_TYPO_BOLD",
        name: "Universal: Bold Split (Text Heavy)",
        industry: ["universal", "fallback"],
        format: { platform: "meta", aspectRatio: "1:1", size: { w: 1080, h: 1080 } },
        tokens: {
            colors: { bg: "#111111", accent: "#E5FF00", text: "#FFFFFF" }
        },
        bindings: { HEADLINE: "{{HEADLINE}}", PRODUCT_IMG: "{{IMAGE_URL}}", SUBHEAD: "{{SUBHEAD}}" },
        layers: [
            // Top Half: Image
            { id: "top_bg", type: "shape", shape: "rect", size: { w: 1080, h: 540 }, position: { x: 0, y: 0 }, fill: "#F0F0F0" },
            { id: "prod_half", type: "image", src: "{{PRODUCT_IMG}}", fit: "cover", size: { w: 1080, h: 540 }, position: { x: 0, y: 0 } },
            // Bottom Half: Typography
            { id: "bot_bg", type: "shape", shape: "rect", size: { w: 1080, h: 540 }, position: { x: 0, y: 540 }, fill: "colors.bg" },
            { id: "div", type: "shape", shape: "rect", size: { w: 1080, h: 10 }, position: { x: 0, y: 535 }, fill: "colors.accent" },
            { id: "main_txt", type: "text", content: "{{HEADLINE}}", style: { size: 80, weight: 900, transform: "uppercase" }, color: "colors.text", position: { x: 50, y: 600 }, maxWidth: 980 },
            { id: "sub_txt", type: "text", content: "{{SUBHEAD}}", style: { size: 32, weight: 400 }, color: "#CCCCCC", position: { x: 50, y: 850 }, maxWidth: 980 }
        ]
    },
    {
        templateId: "P22_DROP_SPLIT_BENEFIT",
        name: "Dropshipping: Split Benefit",
        industry: ["dropshipping", "tools"],
        format: { platform: "meta", aspectRatio: "1:1", size: { w: 1080, h: 1080 } },
        tokens: {
            colors: { bg1: "#FFFFFF", bg2: "#111111", accent: "#3B82F6" }
        },
        bindings: { LABEL1: "{{BEFORE}}", LABEL2: "{{AFTER}}", IMG1: "{{OLD_WAY_URL}}", IMG2: "{{NEW_WAY_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg1", type: "shape", shape: "rect", size: { w: 540, h: 1080 }, position: { x: 0, y: 0 }, fill: "colors.bg1" },
            { id: "bg2", type: "shape", shape: "rect", size: { w: 540, h: 1080 }, position: { x: 540, y: 0 }, fill: "colors.bg2" },
            { id: "i1", type: "image", src: "{{IMG1}}", position: { x: 40, y: 200 }, size: { w: 460, h: 600 }, fit: "cover" },
            { id: "i2", type: "image", src: "{{IMG2}}", position: { x: 580, y: 200 }, size: { w: 460, h: 600 }, fit: "cover" },
            { id: "l1", type: "badge", position: { x: 40, y: 820 }, fill: "#FF0000", text: { content: "{{LABEL1}}", color: "#FFFFFF" } },
            { id: "l2", type: "badge", position: { x: 580, y: 820 }, fill: "#00FF00", text: { content: "{{LABEL2}}", color: "#000000" } },
            { id: "cta", type: "button", position: { x: 290, y: 950 }, size: { w: 500, h: 80 }, fill: "colors.accent", text: { content: "{{CTA}}", color: "#FFFFFF" } }
        ]
    },
    {
        templateId: "P23_DROP_BOGO_OFFER",
        name: "Dropshipping: BOGO / Multi-Buy",
        industry: ["dropshipping", "fashion"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 } },
        tokens: {
            colors: { bg: "#000000", text: "#FFFFFF", accent: "#FF00FF" }
        },
        bindings: { OFFER: "{{OFFER_TEXT}}", PRODUCT: "{{IMAGE_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "prod", type: "image", src: "{{PRODUCT}}", fit: "contain", size: { w: 1080, h: 1000 }, position: { x: 0, y: 0 } },
            { id: "glow", type: "shape", shape: "ellipse", position: { x: 540, y: 1100 }, size: { w: 1200, h: 400 }, fill: "rgba(255,0,255,0.2)", blur: 100 },
            { id: "offer", type: "text", content: "{{OFFER}}", style: { size: 100, weight: 950 }, color: "colors.accent", position: { x: 60, y: 1050 }, align: "center", maxWidth: 960 },
            { id: "cta", type: "button", position: { anchor: "bottomCenter", x: 540, y: 1280 }, size: { w: 900, h: 100 }, fill: "colors.text", text: { content: "{{CTA}}", color: "#000000", style: { size: 36, weight: 900 } } }
        ]
    },
    {
        templateId: "P24_COACH_WEBINAR_PRO",
        name: "Coach: Webinar Invite (Authority)",
        industry: ["coaching", "business", "education"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 } },
        tokens: {
            colors: { bg: "#111827", text: "#FFFFFF", accent: "#6366F1" },
            radius: { card: 30 }
        },
        bindings: { TOPIC: "{{WEBINAR_TOPIC}}", COACH: "{{COACH_NAME}}", TIME: "{{DATE_TIME}}", IMAGE: "{{COACH_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "grad", type: "shape", shape: "rect", size: { w: 540, h: 1350 }, position: { x: 0, y: 0 }, fill: { type: "gradient", kind: "linear", angle: 90, stops: [{ pos: 0, color: "colors.accent" }, { pos: 1, color: "colors.bg" }] }, opacity: 0.3 },
            { id: "coach", type: "image", src: "{{IMAGE}}", fit: "cover", size: { w: 600, h: 1350 }, position: { x: 480, y: 0 } },
            { id: "h1", type: "text", content: "FREE\nTRAINING", style: { size: 48, weight: 900 }, color: "colors.accent", position: { x: 60, y: 120 } },
            { id: "topic", type: "text", content: "{{TOPIC}}", style: { size: 84, weight: 950 }, color: "colors.text", position: { x: 60, y: 240 }, maxWidth: 500 },
            { id: "time", type: "badge", position: { x: 60, y: 800 }, fill: "rgba(255,255,255,0.1)", text: { content: "{{TIME}}", color: "#FFFFFF" } },
            { id: "cta", type: "button", position: { x: 60, y: 1200 }, size: { w: 400, h: 90 }, fill: "colors.accent", text: { content: "{{CTA}}", color: "#FFFFFF", style: { size: 32, weight: 900 } } }
        ]
    },
    {
        templateId: "P25_COACH_SUCCESS_PATH",
        name: "Coach: Success Roadmap",
        industry: ["coaching", "courses"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 } },
        tokens: {
            colors: { bg: "#FFFFFF", text: "#111827", accent: "#10B981" }
        },
        bindings: { STEPS: "{{STEPS_3}}", TITLE: "{{METHOD_TITLE}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "h", type: "text", content: "{{TITLE}}", style: { size: 72, weight: 900 }, color: "colors.text", position: { x: 60, y: 120 } },
            {
                id: "step1", type: "card", position: { x: 60, y: 300 }, size: { w: 960, h: 200 }, fill: "rgba(16,185,129,0.05)", radius: 20, children: [
                    { id: "n", type: "text", content: "01", style: { size: 100, weight: 950 }, color: "colors.accent", position: { x: 40, y: 50 }, opacity: 0.2 },
                    { id: "t", type: "text", content: "{{STEPS[0]}}", style: { size: 40, weight: 800 }, color: "#000000", position: { x: 180, y: 80 } }
                ]
            },
            {
                id: "step2", type: "card", position: { x: 60, y: 540 }, size: { w: 960, h: 200 }, fill: "rgba(16,185,129,0.05)", radius: 20, children: [
                    { id: "n", type: "text", content: "02", style: { size: 100, weight: 950 }, color: "colors.accent", position: { x: 40, y: 50 }, opacity: 0.2 },
                    { id: "t", type: "text", content: "{{STEPS[1]}}", style: { size: 40, weight: 800 }, color: "#000000", position: { x: 180, y: 80 } }
                ]
            },
            {
                id: "step3", type: "card", position: { x: 60, y: 780 }, size: { w: 960, h: 200 }, fill: "rgba(16,185,129,0.05)", radius: 20, children: [
                    { id: "n", type: "text", content: "03", style: { size: 100, weight: 950 }, color: "colors.accent", position: { x: 40, y: 50 }, opacity: 0.2 },
                    { id: "t", type: "text", content: "{{STEPS[2]}}", style: { size: 40, weight: 800 }, color: "#000000", position: { x: 180, y: 80 } }
                ]
            },
            { id: "cta", type: "button", position: { x: 60, y: 1100 }, size: { w: 960, h: 100 }, fill: "colors.accent", text: { content: "{{CTA}}", color: "#FFFFFF", style: { size: 36, weight: 900 } } }
        ]
    },
    {
        templateId: "P26_COACH_SCREEN_OVERLAY",
        name: "Coach: Course Dashboard (Clean UI)",
        industry: ["courses", "education"],
        format: { platform: "meta", aspectRatio: "1:1", size: { w: 1080, h: 1080 } },
        tokens: {
            colors: { bg: "#F9FAFB", text: "#111827", accent: "#7C3AED" }
        },
        bindings: { TITLE: "{{COURSE_NAME}}", UI_IMG: "{{DASHBOARD_URL}}", BADGE: "{{NEW_BADGE}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "ui", type: "image", src: "{{UI_IMG}}", fit: "cover", position: { x: 100, y: 150 }, size: { w: 1200, h: 800 }, rotation: -5, radius: 20, shadow: { x: 0, y: 30, blur: 60, color: "rgba(0,0,0,0.15)" } },
            { id: "overlay", type: "shape", shape: "rect", position: { x: 0, y: 0 }, size: { w: 1080, h: 1080 }, fill: { type: "gradient", kind: "linear", angle: 0, stops: [{ pos: 0, color: "rgba(255,255,255,0.95)" }, { pos: 0.5, color: "transparent" }] } },
            { id: "h", type: "text", content: "{{TITLE}}", style: { size: 82, weight: 950 }, color: "colors.text", position: { x: 60, y: 700 }, maxWidth: 960 },
            { id: "badge", type: "badge", position: { x: 60, y: 820 }, fill: "colors.accent", text: { content: "{{BADGE}}", color: "#FFFFFF" } },
            { id: "cta", type: "button", position: { x: 60, y: 920 }, size: { w: 400, h: 80 }, fill: "#000000", text: { content: "{{CTA}}", color: "#FFFFFF" } }
        ]
    },
    {
        templateId: "P27_COACH_TESTIMONIAL_WALL",
        name: "Coach: Result & Testimonial",
        industry: ["coaching", "fitness", "finance"],
        format: { platform: "meta", aspectRatio: "4:5", size: { w: 1080, h: 1350 } },
        tokens: {
            colors: { bg: "#FFFFFF", text: "#111827", accent: "#2563EB" }
        },
        bindings: { RESULT: "{{RESULT_TEXT}}", REVIEW: "{{TESTIMONIAL}}", AUTHOR: "{{NAME}}", IMG: "{{IMAGE_URL}}", CTA: "{{CTA_TEXT}}" },
        layers: [
            { id: "bg", type: "background", fill: { type: "solid", color: "colors.bg" } },
            { id: "p", type: "image", src: "{{IMG}}", fit: "cover", size: { w: 1080, h: 600 }, position: { x: 0, y: 0 } },
            { id: "badge", type: "badge", position: { x: 40, y: 550 }, padding: { x: 30, y: 40 }, fill: "colors.accent", text: { content: "{{RESULT}}", color: "#FFFFFF", style: { size: 40, weight: 950 } } },
            { id: "quote", type: "text", content: "“{{REVIEW}}”", style: { size: 42, weight: 700, fontStyle: "italic" }, color: "colors.text", position: { x: 60, y: 750 }, maxWidth: 960 },
            { id: "author", type: "text", content: "- {{AUTHOR}}", style: { size: 32, weight: 400 }, color: "rgba(0,0,0,0.5)", position: { x: 60, y: 1100 } },
            { id: "cta", type: "button", position: { anchor: "bottomCenter", x: 540, y: 1280 }, size: { w: 960, h: 100 }, fill: "#000000", text: { content: "{{CTA}}", color: "#FFFFFF", style: { size: 36, weight: 900 } } }
        ]
    }
];



