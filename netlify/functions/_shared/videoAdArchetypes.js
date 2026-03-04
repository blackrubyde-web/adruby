/**
 * VIDEO AD ARCHETYPES — 5 Tier-1 Formats + 12 Hook Library
 * 
 * PRODUCTION-QUALITY CINEMATIC DIRECTION
 * 
 * Each archetype contains:
 *   - Veo prompt templates with EXACT cinematic direction per act
 *     (environment, materials, lens, lighting rig, motion physics, depth)
 *   - Compatible hooks from 12-hook library
 *   - Camera, lighting, and audio presets with technical specificity
 *   - Negative prompt additions
 * 
 * Based on Meta's highest-performing video ad formats 2025/2026.
 * Written as a real film director's shot list, not social media templates.
 */

// ============================================================
// HOOK LIBRARY — 12 Scroll-Stopper Patterns
// ============================================================

export const HOOK_LIBRARY = {
    statistik_shock: {
        id: 'statistik_shock',
        name: { de: 'Statistik-Shock', en: 'Statistic Shock' },
        example: { de: '97% der Kunden kaufen nochmal', en: '97% of customers reorder' },
        promptPrefix: 'A massive, bold number fills the entire frame — white text on pure black, cinematic zoom reveals it character by character. The number impacts like a title card in a Christopher Nolan film.',
        visualCue: 'zoom-in on bold number, dramatic lighting shift',
        bestFor: ['social_proof', 'product_reveal'],
    },
    frage: {
        id: 'frage',
        name: { de: 'Frage', en: 'Question' },
        example: { de: 'Warum zahlst du noch so viel für X?', en: 'Why are you still overpaying for X?' },
        promptPrefix: 'Words appear one by one in sharp white sans-serif on a dark surface, each word landing with weight and precision — kinetic typography that demands attention. The question hangs in the air.',
        visualCue: 'kinetic typography, words appearing sequentially with impact',
        bestFor: ['before_after', 'lifestyle_scene'],
    },
    problem_erkennung: {
        id: 'problem_erkennung',
        name: { de: 'Problem-Erkennung', en: 'Problem Recognition' },
        example: { de: 'Kennst du das? Dein X macht schon wieder...', en: 'Sound familiar? Your X is failing again...' },
        promptPrefix: 'A close-up, handheld shot of a common frustrating moment — shallow depth of field isolates the problem against a blurred background. Cool-toned, slightly desaturated color grade. The lighting is flat and unflattering. Everything feels wrong.',
        visualCue: 'frustrated expression, messy/broken item, desaturated colors',
        bestFor: ['before_after', 'dynamic_showcase'],
    },
    before_after: {
        id: 'before_after',
        name: { de: 'Vorher/Nachher', en: 'Before/After' },
        example: { de: 'Vorher ➝ Nachher', en: 'Before ➝ After' },
        promptPrefix: 'A fluid wipe transition sweeps across the frame — left side is desaturated, lifeless, problematic. As the wipe moves right, colors bloom into vibrant life. The transformation is dramatic and satisfying, like a before-after in a high-end documentary.',
        visualCue: 'wipe transition, color shift from dull to vibrant',
        bestFor: ['before_after'],
    },
    fomo: {
        id: 'fomo',
        name: { de: 'FOMO', en: 'FOMO' },
        example: { de: 'Nur noch heute -50%', en: 'Today only -50%' },
        promptPrefix: 'Bold red and orange typography pulses rhythmically against a dark background. A countdown timer ticks down in the corner. The energy is urgent — fast cuts, dynamic scale changes on the text. Every frame screams "now or never".',
        visualCue: 'timer, red accents, pulsing urgency',
        bestFor: ['social_proof', 'product_reveal'],
    },
    kontroverser_claim: {
        id: 'kontroverser_claim',
        name: { de: 'Kontroverser Claim', en: 'Controversial Claim' },
        example: { de: 'Vergiss alles was du über X weißt', en: 'Forget everything you know about X' },
        promptPrefix: 'Impact text slams onto the screen with a heavy bassline hit — massive bold letters fill the entire frame against total black. The camera simultaneously does a slow dolly zoom (Hitchcock vertigo effect). The statement is confrontational and impossible to ignore.',
        visualCue: 'impactful text animation, dramatic dolly zoom',
        bestFor: ['product_reveal', 'dynamic_showcase'],
    },
    social_proof: {
        id: 'social_proof',
        name: { de: 'Social Proof', en: 'Social Proof' },
        example: { de: '10.000+ zufriedene Kunden', en: '10,000+ happy customers' },
        promptPrefix: 'Five golden stars materialize one by one across the frame, each with a crystalline sparkle effect. A customer count rapidly ticks upward like a stock ticker. Small review cards with star ratings drift from the edges into frame. The cumulative effect is overwhelming trust.',
        visualCue: 'stars filling up, numbers counting, testimonial cards',
        bestFor: ['social_proof'],
    },
    demo_teaser: {
        id: 'demo_teaser',
        name: { de: 'Demo-Teaser', en: 'Demo Teaser' },
        example: { de: 'Schau was passiert...', en: 'Watch what happens...' },
        promptPrefix: 'An extreme macro close-up of the product in action — a 100mm macro lens captures every texture and detail. The action happens in slow motion, revealing a satisfying mechanical or physical process. The depth of field is razor-thin, creating creamy out-of-focus backgrounds.',
        visualCue: 'close-up, product demo, macro details, slow motion',
        bestFor: ['dynamic_showcase', 'product_reveal'],
    },
    identitaets_hook: {
        id: 'identitaets_hook',
        name: { de: 'Identitäts-Hook', en: 'Identity Hook' },
        example: { de: 'Für alle die X lieben...', en: 'For everyone who loves X...' },
        promptPrefix: 'A wide establishing shot of the specific lifestyle context — shot through a doorframe or window to create depth layers. Natural light pours in. The viewer immediately recognizes their own world. Warm color grading, film grain, the aesthetic of an indie film.',
        visualCue: 'lifestyle context, specific audience representation, cinematic framing',
        bestFor: ['lifestyle_scene'],
    },
    unerwartetes: {
        id: 'unerwartetes',
        name: { de: 'Unerwartetes', en: 'Unexpected' },
        example: { de: 'Das hättest du nicht erwartet...', en: "You didn't expect this..." },
        promptPrefix: 'A completely unexpected visual juxtaposition — the product appears in a context that breaks all expectations. The framing is precise and deliberate. A brief moment of visual confusion resolves into an "aha" moment. Shot with wide-angle distortion for added surrealism.',
        visualCue: 'surprise element, unusual juxtaposition, deliberate framing',
        bestFor: ['product_reveal', 'dynamic_showcase'],
    },
    vergleich: {
        id: 'vergleich',
        name: { de: 'Vergleich', en: 'Comparison' },
        example: { de: 'Links: 50€ Produkt. Rechts: unseres für 19€', en: 'Left: $50 product. Right: ours for $19' },
        promptPrefix: 'A perfectly symmetrical split-screen composition — left and right halves mirror each other in framing but diverge in quality. The dividing line runs through the center vertically, clean and precise. Each side tells its own story through lighting: the competitor side is flat and clinical, our side is warm and premium.',
        visualCue: 'split screen, competitive positioning, symmetrical composition',
        bestFor: ['before_after', 'social_proof'],
    },
    asmr_satisfying: {
        id: 'asmr_satisfying',
        name: { de: 'ASMR / Satisfying', en: 'ASMR / Satisfying' },
        example: { de: 'Unboxing...', en: 'Unboxing...' },
        promptPrefix: 'An extreme close-up at 120fps slow motion — hands carefully peeling back premium packaging. Every texture is hyper-detailed: the grain of paper, the sheen of plastic, the matte finish of the product. The audio is amplified: crisp unwrapping sounds, soft thuds of product placement, the satisfying click of a closure. The depth of field is millimeters thin.',
        visualCue: 'macro shot, slow-mo, texture focus, tactile ASMR',
        bestFor: ['product_reveal', 'dynamic_showcase'],
    },
};

// ============================================================
// CTA LIBRARY — Call-to-Action Patterns
// ============================================================

export const CTA_PATTERNS = {
    de: [
        'Jetzt entdecken', 'Jetzt shoppen', 'Mehr erfahren', 'Jetzt sichern',
        'Zum Shop', 'Jetzt bestellen', 'Gratis testen', 'Jetzt starten',
    ],
    en: [
        'Shop Now', 'Discover More', 'Learn More', 'Get Yours',
        'Buy Now', 'Try Free', 'Get Started', 'Claim Offer',
    ],
};

// ============================================================
// 5 TIER-1 ARCHETYPES — Production-Quality Cinematic Direction
// ============================================================

export const VIDEO_ARCHETYPES = {
    product_reveal: {
        id: 'product_reveal',
        name: { de: 'Product Reveal', en: 'Product Reveal' },
        description: {
            de: 'Cinematic product reveal — Studioproduktion, dramatische Beleuchtung, 360° Hero Shot',
            en: 'Cinematic product reveal — studio production, dramatic lighting, 360° hero shot',
        },
        icon: '✨',
        tier: 1,
        idealDuration: 8,
        hookStyle: 'visual_wow',
        compatibleHooks: ['statistik_shock', 'kontroverser_claim', 'demo_teaser', 'asmr_satisfying', 'unerwartetes'],

        promptTemplate: {
            act1_hook: (product, hook) =>
                `Opening in total darkness. A single tungsten spotlight fades up from directly above, creating a tight pool of warm light on a polished obsidian surface. ` +
                `Volumetric haze drifts through the beam, each particle catching the light like gold dust. ` +
                `The silhouette of ${product} is barely visible at the edge of the light pool, teasing the reveal. ` +
                `${hook}. Shot on 85mm f/1.4, low angle, the camera is steady on a slider, slowly creeping forward. ` +
                `The anticipation is palpable — every frame builds tension.`,
            act2_problem: (product, context) =>
                `A jarring cut to a handheld, slightly overexposed shot of ${context} — deliberately ugly, ` +
                `desaturated to near-monochrome. The framing is cramped and uncomfortable. Flat fluorescent lighting. ` +
                `The contrast between this and the opening's beauty creates visceral motivation. ` +
                `The camera is slightly unsteady — 35mm wide angle, too close. Everything feels wrong.`,
            act3_solution: (product, usp) =>
                `Dramatic reveal: the camera tracks smoothly forward on a motorized slider as ${product} glides into the spotlight from the darkness. ` +
                `Golden hour-colored rim light wraps around the product's edges from behind. A secondary blue fill light from the left creates dimension. ` +
                `The product begins a slow, controlled 180° rotation on a motorized turntable — each surface catches light differently. ` +
                `Micro-particles float through the volumetric haze. The depth of field is razor-thin at f/1.4, creating ` +
                `silky bokeh circles in the background. ${usp} — the key feature catches a dedicated spotlight that subtly brightens. ` +
                `Shot on 100mm macro transitioning to 50mm, the footage feels like a perfume commercial meets Apple product photography.`,
            act4_proof: (proof) =>
                `Text elegantly fades in: "${proof}" — rendered in a clean, premium sans-serif typeface (weight 600), ` +
                `positioned using the golden ratio at the lower third. The typography casts a subtle shadow on the surface below. ` +
                `Five golden star icons illuminate one by one with a crystalline sparkle. The product continues its rotation in the background, ` +
                `slightly out of focus now, creating a living backdrop. The lighting shifts subtly warmer — the trust moment.`,
            act5_cta: (product, cta) =>
                `Final hero composition: the product is centered, perfectly lit by the three-point rig. ` +
                `The camera performs a slow, 5-degree dolly zoom (the Hitchcock effect) that makes the product feel like it's expanding. ` +
                `CTA text materializes in the lower third: "${cta}" — white text on a semi-transparent dark pill shape, ` +
                `the same clean typography. The volumetric haze intensifies slightly, creating a dream-like quality. ` +
                `The final frame holds for a beat, then the light slowly fades to black, creating a seamless loop back to the opening darkness.`,
        },

        cameraPreset: 'Motorized slider dolly-in, 85mm f/1.4 → 100mm macro → 50mm, low angle hero perspective, 180° turntable orbit, Hitchcock dolly zoom finale',
        lightingPreset: 'Three-point studio rig: tungsten key spotlight from above, golden rim light from behind-right, cool blue fill from left. Volumetric haze machine for atmospheric depth. Practical motivation from product surface reflections.',
        audioPreset: 'Deep sub-bass rumble building (30Hz), single percussive hit on reveal, crystalline high-frequency shimmer on product rotation, ambient reverb tail, subtle heartbeat rhythm underlying the tension, satisfying metallic "ting" on star rating appearance',
        negativePrompt: 'blurry, low quality, distorted text, watermark, shaky camera, overexposed, cartoon style, flat lighting, handheld, amateur, phone-quality, CapCut style, template look, generic stock footage',
    },

    before_after: {
        id: 'before_after',
        name: { de: 'Vorher/Nachher', en: 'Before/After' },
        description: {
            de: 'Cinematic transformation — professionelle Farbkorrektur, emotionale Kamerabewegung',
            en: 'Cinematic transformation — professional color grading, emotional camera movement',
        },
        icon: '🔄',
        tier: 1,
        idealDuration: 8,
        hookStyle: 'problem_solution',
        compatibleHooks: ['problem_erkennung', 'before_after', 'frage', 'vergleich'],

        promptTemplate: {
            act1_hook: (product, hook) =>
                `Opening on a carefully composed "before" scene. ${hook}. ` +
                `The color grade is deliberately suppressed — lifted blacks, desaturated highlights, a blue-green tint that makes everything feel cold and lifeless. ` +
                `Shot on 35mm with a slight Dutch angle to create visual unease. ` +
                `Flat, unflattering overhead fluorescent lighting casts hard shadows. ` +
                `The environment is real and relatable — the viewer sees their own frustration reflected. ` +
                `Camera holds steady, almost uncomfortably static, forcing the viewer to sit with the problem.`,
            act2_problem: (product, context) =>
                `The camera slowly pushes in on the specific pain point: ${context}. ` +
                `A 50mm lens at f/2.8 isolates the problem with shallow focus. The background blurs into an unflattering mess. ` +
                `The color temperature drops even cooler — 4000K, harsh and clinical. ` +
                `Details emerge that make the viewer cringe: wear, mess, inefficiency, frustration. ` +
                `A slight camera drift suggests instability — nothing feels settled or comfortable.`,
            act3_solution: (product, usp) =>
                `THE TRANSFORMATION: A fluid wipe transition sweeps across the frame from left to right. ` +
                `As it passes, the color grade shifts dramatically — blacks deepen, colors bloom into rich, saturated warmth. ` +
                `The lighting transforms from cold fluorescent to golden hour warmth (5600K → 3200K). ` +
                `${product} is revealed in the center of the transformed scene, perfectly lit by a warm key light from camera-right. ` +
                `The Dutch angle corrects to level — everything feels balanced now. The depth of field opens up, ` +
                `revealing a beautiful, organized, aspirational background. ${usp} is demonstrated through the transformation itself. ` +
                `The camera smoothly tracks forward on a slider, drawn to the product like a magnet.`,
            act4_proof: (proof) =>
                `A cinematic split-screen composition: the frame divides vertically down the center. ` +
                `Left half holds the "before" state — desaturated, cold, problematic. ` +
                `Right half shows the "after" — vibrant, warm, resolved. ` +
                `The product sits on the dividing line, bridging both worlds. ` +
                `Text overlay materializes in clean white typography against the dark left panel: "${proof}". ` +
                `The contrast is undeniable. Each side is lit independently to maximize the visual gap.`,
            act5_cta: (cta) =>
                `The "after" world fills the entire frame in its full glory — warm, beautiful, resolved. ` +
                `The product is hero-positioned using the rule of thirds, perfectly lit by golden rim light. ` +
                `CTA text slides in from the bottom with elegant easing: "${cta}". ` +
                `The camera holds on this aspirational final frame for a full beat before gently fading, ` +
                `designed to loop back seamlessly to the cold "before" opening.`,
        },

        cameraPreset: 'Locked-off 35mm for "before" (static, uncomfortable), motorized slider forward for transformation, 85mm close-up for problem detail, level correction on solution reveal',
        lightingPreset: 'Before: flat overhead fluorescent, 4000K, hard shadows. After: golden key from camera-right (3200K), soft fill from left, rim light from behind. Transition is a literal lighting transformation.',
        audioPreset: 'Before: low-frequency tension drone, uncomfortable room tone. Transition: satisfying ascending whoosh. After: warm musical swell (strings or piano), satisfying "ding" on proof reveal, ambient warmth',
        negativePrompt: 'blurry, low quality, distorted text, watermark, inconsistent lighting between halves, flat transformation, abrupt cuts, no visual contrast between states, amateur editing, jump cuts',
    },

    dynamic_showcase: {
        id: 'dynamic_showcase',
        name: { de: 'Dynamischer Showcase', en: 'Dynamic Showcase' },
        description: {
            de: 'Premium-Produkt in Bewegung — 360° Orbit, Rack Focus, rhythmische Schnitte',
            en: 'Premium product in motion — 360° orbit, rack focus, rhythmic cuts',
        },
        icon: '🎥',
        tier: 1,
        idealDuration: 6,
        hookStyle: 'fast_cuts',
        compatibleHooks: ['demo_teaser', 'kontroverser_claim', 'asmr_satisfying', 'unerwartetes'],

        promptTemplate: {
            act1_hook: (product, hook) =>
                `Opening with kinetic energy: ${hook}. Three rapid shots of ${product} in 1.5 seconds — ` +
                `Shot 1: extreme close-up of a surface detail at 100mm macro, f/2.0, the texture fills the frame. ` +
                `Shot 2: low-angle hero shot at 24mm looking up, the product towers against a clean gradient backdrop. ` +
                `Shot 3: top-down bird's-eye view at 35mm showing the full product form. ` +
                `Each cut is perfectly synchronized to a rhythmic beat. The cuts are precise, not chaotic — editorial, not CapCut.`,
            act2_problem: (product, context) =>
                `A brief 1.5-second context shot: ${context}. Shot in a contrasting visual style — ` +
                `handheld, slightly wider, the real world versus the studio perfection. ` +
                `A fast wipe or whip pan transitions us back to the controlled studio environment. ` +
                `The contrast between real-world context and studio quality makes the product feel premium.`,
            act3_solution: (product, usp) =>
                `The hero sequence: ${product} sits on a seamless infinity cove (matte white or dark gradient). ` +
                `A motorized turntable rotates the product smoothly through a full 360° orbit. ` +
                `The camera tracks the rotation on a counter-orbital dolly at 85mm f/2.0, maintaining a consistent 45° angle. ` +
                `Three dedicated spotlights create moving specular highlights across the product surface as it rotates. ` +
                `At the 180° mark, a rack focus shifts from the product's front to a key feature detail — ${usp}. ` +
                `A subtle animated callout or glow draws the eye to this feature without being cheesy or template-like.`,
            act4_proof: (proof) =>
                `Three feature text overlays appear in rapid succession, each timed to a beat: ` +
                `The text is clean, upper-case, tracked-out sans-serif — each line appears with a ` +
                `precise scale-up animation from 95% to 100% (not a bounce — a confident, controlled reveal). ` +
                `"${proof}" is the final, largest overlay. The product continues rotating behind the text, ` +
                `creating a parallax depth effect. Each text line has a thin accent line that extends from the edge.`,
            act5_cta: (cta) =>
                `Final beauty frame: the camera pulls back to a wide establishing shot via a slow reverse dolly. ` +
                `${product} is centered, perfectly lit, the rotation slows to a stop at its most photogenic angle. ` +
                `CTA text materializes in the lower third with a horizontal accent line extending left and right: "${cta}". ` +
                `The frame holds for one clean beat — designed as a perfect thumbnail and loop point.`,
        },

        cameraPreset: '100mm macro → 24mm wide-angle → 35mm top-down (opening montage), 85mm f/2.0 orbital tracking on dolly (hero orbit), rack focus at 180°, reverse dolly pull-out for finale',
        lightingPreset: 'Controlled studio lighting: clean infinity cove, three movable spots creating traveling specular highlights during rotation, fill from soft overhead panel, product is lit independently from background',
        audioPreset: 'Tight rhythmic electronic beat synced to cuts (120BPM), percussive impact on each montage cut, smooth ambient tone during orbit, ascending filtered sweep on feature reveals, bass hit on CTA',
        negativePrompt: 'blurry, low quality, distorted text, watermark, slow movement, static camera, random cuts, unsynchronized editing, shaky handheld during studio shots, uneven rotation, phone-quality footage',
    },

    lifestyle_scene: {
        id: 'lifestyle_scene',
        name: { de: 'Lifestyle Szene', en: 'Lifestyle Scene' },
        description: {
            de: 'Cinematic Lifestyle — wie ein Indie-Film, natürliches Licht, Filmlook',
            en: 'Cinematic lifestyle — indie film aesthetic, natural light, film look',
        },
        icon: '🏡',
        tier: 1,
        idealDuration: 8,
        hookStyle: 'relatability',
        compatibleHooks: ['identitaets_hook', 'frage', 'problem_erkennung', 'demo_teaser'],

        promptTemplate: {
            act1_hook: (product, hook) =>
                `Opening on a wide establishing shot through a window or doorframe — the frame within a frame creates immediate cinematic depth. ` +
                `${hook}. Natural golden hour sunlight pours through from camera-left, casting long, warm shadows across a lived-in space. ` +
                `Dust particles float lazily in the light beams. The environment is aspirational but authentic — not a catalog, but a real home styled for film. ` +
                `Shot on 35mm with subtle film grain (ISO 800), the depth of field renders the window frame as a soft foreground element. ` +
                `The camera drifts gently — not handheld chaos, but a controlled float on a gimbal, like breathing.`,
            act2_problem: (product, context) =>
                `The scene narrows to the everyday challenge: ${context}. ` +
                `Shot in a single continuous take — the camera follows the action with a gimbal tracking shot, 50mm f/1.8. ` +
                `The lighting hasn't changed but the framing emphasizes the frustration: tighter, more constrained. ` +
                `The subject's interaction with the problem is specific and relatable — not acted, but observed. ` +
                `Shallow focus keeps everything except the pain point blurred. The warmth of the scene makes the frustration feel intimate, personal.`,
            act3_solution: (product, usp) =>
                `A moment of discovery: ${product} enters the scene naturally — picked up, unwrapped, or simply placed into the composition. ` +
                `The camera performs a slow push-in as the product is integrated into the lifestyle. ` +
                `The golden hour light catches the product surface, creating a natural highlight that draws the eye without any artificial glow. ` +
                `${usp} is demonstrated through natural use — not a demonstration, but an organic moment of "this just works." ` +
                `The depth of field shifts to isolate the product, the background becoming a warm, bokeh-filled canvas. ` +
                `The color grade warms slightly — from "beautiful day" to "perfect moment." 85mm f/1.4 creates intimate framing.`,
            act4_proof: (proof) =>
                `A moment of genuine satisfaction: the result of using ${product} is visible in the environment or on the subject's expression. ` +
                `The camera pulls back slightly on the gimbal, revealing more of the transformed space. ` +
                `Text overlay appears with gentle opacity: "${proof}" — positioned in the negative space of the composition, ` +
                `never obscuring the scene. The typography is elegant, thin-weight, letterspaced — understated premium. ` +
                `The golden hour light reaches its peak, the entire scene glows.`,
            act5_cta: (product, cta) =>
                `Wide final frame: the complete lifestyle scene with ${product} perfectly integrated, ` +
                `shot through the original doorframe/window to bookend the opening. ` +
                `CTA text appears in the same elegant typography: "${cta}" — lower third, subtle, not shouting. ` +
                `The camera holds steady for a beat, then begins a barely perceptible slow zoom-out, ` +
                `expanding the world, making it feel endless and aspirational. ` +
                `The light dims naturally as the golden hour fades, creating an organic loop transition.`,
        },

        cameraPreset: '35mm f/2.0 with subtle film grain for establishing, gimbal float for tracking shots, 50mm f/1.8 for problem isolation, 85mm f/1.4 for intimate product moments, bookend framing through practical foreground elements',
        lightingPreset: 'Available natural light only — golden hour from camera-left as primary key. No artificial lighting visible. Practical motivations (table lamps, window light) for fill. The lighting should feel like a Terrence Malick film — organic, breathing, alive.',
        audioPreset: 'Rich ambient room tone (not silence), natural environmental sounds (fabric rustling, gentle footsteps, a distant bird), subtle fingerpicked acoustic guitar or piano entering mid-scene, no compressed pop music — the audio should feel like a film score, not a playlist',
        negativePrompt: 'blurry, low quality, distorted text, watermark, studio lighting, artificial-looking, posed, green screen, influencer style, ring light, selfie perspective, overprocessed, generic stock footage, flat colors',
    },

    social_proof: {
        id: 'social_proof',
        name: { de: 'Social Proof', en: 'Social Proof / Testimonial' },
        description: {
            de: 'Premium Trust-Building — Zahlen und Bewertungen als cinematic motion graphics',
            en: 'Premium trust-building — numbers and reviews as cinematic motion graphics',
        },
        icon: '⭐',
        tier: 1,
        idealDuration: 6,
        hookStyle: 'statistik_shock',
        compatibleHooks: ['statistik_shock', 'social_proof', 'fomo', 'vergleich'],

        promptTemplate: {
            act1_hook: (product, hook) =>
                `Opening on black: ${hook}. A single massive number — customer count, percentage, or rating — ` +
                `is rendered in bold, clean white typography (Helvetica Neue or similar, weight 700) against total black. ` +
                `The number counter animates rapidly from zero, the digits blur with speed before landing with weight on the final figure. ` +
                `A subtle camera push-in adds depth to what is essentially a 2D graphic — shot with real parallax, ` +
                `the number floating in 3D space with a slight depth-of-field blur on the edges. ` +
                `The scale is monumental — this number fills 60% of the frame.`,
            act2_problem: (product, context) =>
                `Individual review cards drift into frame from the edges — each card is a frosted glass rectangle ` +
                `with a customer quote, star rating, and avatar. They float in 3D space with subtle parallax as the camera drifts. ` +
                `${context}. The cards overlap at different depths, creating layers. ` +
                `Shot with a shallow depth of field that puts the nearest card in sharp focus while deeper ones blur beautifully. ` +
                `Warm, trustworthy lighting — soft and diffused, nothing harsh.`,
            act3_solution: (product, usp) =>
                `The review cards gently part like curtains, revealing ${product} in the center of the frame. ` +
                `The product sits on a clean surface with controlled studio lighting — a warm key from above-right, ` +
                `cool fill from the left. The review cards continue floating at the edges, creating a halo of social proof. ` +
                `A subtle golden glow emanates from behind the product, suggesting importance. ` +
                `${usp} is reinforced by a small trust badge or certification icon that materializes beside the product. ` +
                `The camera performs a slow 15° arc, adding dimension.`,
            act4_proof: (proof) =>
                `The definitive trust moment: "${proof}" renders in large, bold typography across the center of the frame. ` +
                `Below it, five star icons illuminate one at a time from left to right, each with a precise golden sparkle effect. ` +
                `The number counter from the opening reappears smaller in the corner, slowly ticking up. ` +
                `The product remains visible behind the text with subtle rack focus — text sharp, product soft. ` +
                `The overall composition follows a strict grid layout — nothing feels random or template-like.`,
            act5_cta: (cta) =>
                `Clean final composition: ${product} hero shot, centered, immaculately lit. ` +
                `The social proof elements (stars, count, badges) are arranged precisely around the product ` +
                `in a balanced composition — not cluttered, but curated. ` +
                `CTA text materializes in the lower third: "${cta}" — the same clean typography throughout. ` +
                `A thin line extends left and right from the CTA text, grounding it. ` +
                `The frame holds, breathing confidence. Every element feels intentional and premium.`,
        },

        cameraPreset: 'Subtle push-in for opening number (adds 3D depth to typography), slow drift for review card sequence, 15° orbital arc for product reveal, steady lock-off for final composition',
        lightingPreset: 'Clean, trustworthy lighting: soft diffused key from above-right (5600K), cool fill from left, controlled background — gradient from dark to medium grey. Nothing harsh. The lighting says "you can trust this."',
        audioPreset: 'Subtle notification chime sequence (ascending pitch: C, E, G), each star gets a crystalline "ting", the counting number has a soft rapid-fire click, ambient pad underneath for warmth, a confident low piano note on CTA reveal',
        negativePrompt: 'blurry, low quality, distorted text, watermark, dark moody lighting, illegible text, cluttered composition, cheap graphics, template look, CapCut text effects, bouncy animations, random colors',
    },
};

// ============================================================
// ARCHETYPE HELPERS
// ============================================================

/**
 * Get an archetype by ID
 */
export function getArchetype(archetypeId) {
    return VIDEO_ARCHETYPES[archetypeId] || null;
}

/**
 * Get all Tier-1 archetypes as array
 */
export function getAllArchetypes() {
    return Object.values(VIDEO_ARCHETYPES);
}

/**
 * Get compatible hooks for an archetype
 */
export function getCompatibleHooks(archetypeId) {
    const archetype = VIDEO_ARCHETYPES[archetypeId];
    if (!archetype) return [];
    return archetype.compatibleHooks.map(hookId => HOOK_LIBRARY[hookId]).filter(Boolean);
}

/**
 * Select the best hook for an archetype + audience combination
 * Returns the first compatible hook (AI selection in scriptEngine overrides this)
 */
export function getDefaultHook(archetypeId) {
    const archetype = VIDEO_ARCHETYPES[archetypeId];
    if (!archetype || !archetype.compatibleHooks.length) return HOOK_LIBRARY.demo_teaser;
    return HOOK_LIBRARY[archetype.compatibleHooks[0]];
}

/**
 * Get a random CTA for the given language
 */
export function getRandomCta(language = 'de') {
    const ctas = CTA_PATTERNS[language] || CTA_PATTERNS.de;
    return ctas[Math.floor(Math.random() * ctas.length)];
}

/**
 * Build the complete negative prompt for an archetype
 */
export function buildNegativePrompt(archetypeId) {
    const archetype = VIDEO_ARCHETYPES[archetypeId];
    const base = 'blurry, low quality, distorted text, watermark, shaky camera, amateur, overexposed, underexposed, phone-quality, CapCut style, template look, cheap transitions, bouncy text animations, iMovie effects, stock footage aesthetic, flat lighting, ring light, selfie perspective';
    if (!archetype) return base;
    return `${base}, ${archetype.negativePrompt}`;
}

/**
 * Get industry-specific scene context for lifestyle/before-after archetypes
 */
export function getIndustryContext(industry) {
    const INDUSTRY_CONTEXTS = {
        skincare: {
            scene: 'A marble-topped bathroom vanity with brass fixtures, soft diffused morning light from a frosted window, eucalyptus sprigs in a ceramic vase, the mirror reflecting warm tones',
            problem: 'dull, tired-looking skin with visible texture under harsh bathroom light — the mirror shows every imperfection',
            color: 'soft blush pink, cream white, sage green',
        },
        fitness: {
            scene: 'A concrete-floored gym with industrial steel and exposed brick, dramatic directional light from high windows casting geometric shadows, chalk dust floating in the air',
            problem: 'exhaustion, plateaued progress, equipment that fails mid-workout — sweat on a brow, frustration in the eyes',
            color: 'energetic orange, charcoal black, gunmetal grey',
        },
        food: {
            scene: 'A sun-drenched kitchen with white marble countertops and copper cookware, fresh herbs in terracotta pots on the windowsill, morning light streaming through linen curtains',
            problem: 'another uninspiring meal prep — sad leftovers in a plastic container, a sigh of resignation',
            color: 'warm terracotta, olive green, butter yellow',
        },
        tech: {
            scene: 'A minimal desk setup with a walnut surface and matte-black accessories, a single monitor casting a soft glow, a concrete planter with a small succulent, cable management is perfect',
            problem: 'a frozen screen, spinning wheel, tangled cables, multiple apps crashing — the frustration of technology failing you',
            color: 'cool sapphire blue, dark graphite, silver aluminum',
        },
        fashion: {
            scene: 'A curated walk-in wardrobe with warm Edison-bulb lighting, wooden hangers on brass rails, a full-length mirror reflecting an editorial composition, fresh flowers on a shelf',
            problem: 'staring at a closet full of clothes with nothing to wear — pulling things off hangers, nothing matches',
            color: 'ivory cream, warm camel, deep burgundy',
        },
        home: {
            scene: 'A Scandinavian-inspired living room with linen sofas, oak floors warmed by golden hour light, a woven throw draped artfully, candles lit on a coffee table',
            problem: 'a cluttered counter, things without homes, visual chaos that creates mental noise',
            color: 'warm oak, linen white, forest green',
        },
        beauty: {
            scene: 'An elegant marble vanity with brass-framed mirror, warm globe lights on either side, luxury products arranged with editorial precision, a fresh peony in a slim vase',
            problem: 'a rushed, chaotic beauty routine — products scattered, running late, the wrong shade, the wrong finish',
            color: 'rose gold, cream, soft mauve',
        },
        pet: {
            scene: 'A bright, plant-filled apartment with a happy pet on a linen-covered sofa, natural window light, toy basket, and a cozy nook — the space is designed around both human and pet comfort',
            problem: 'a worried pet owner — fur on the couch, health concern at the vet, a pet that seems low-energy',
            color: 'warm terracotta, forest green, natural brown',
        },
        supplements: {
            scene: 'A bright morning kitchen: sunlight hitting a glass of water with a dissolving supplement, fresh fruit arranged on a wooden board, an open journal, running shoes by the door',
            problem: 'afternoon energy crash — collapsed on the sofa, brain fog, reaching for a third coffee that won\'t help',
            color: 'vibrant green, clean white, sunrise orange',
        },
        ecommerce: {
            scene: 'A premium product photography setup: seamless dark gradient backdrop, product on a reflective black surface, three-point studio lighting creating precise highlights and shadows',
            problem: 'endless scrolling through mediocre options — everything looks the same, nothing stands out, decision fatigue',
            color: 'deep matte black, warm gold accent, crisp white',
        },
        ecommerce_general: {
            scene: 'A premium product photography setup: seamless dark gradient backdrop, product on a reflective black surface, three-point studio lighting creating precise highlights and shadows',
            problem: 'endless scrolling through mediocre options — everything looks the same, nothing stands out, decision fatigue',
            color: 'deep matte black, warm gold accent, crisp white',
        },
    };
    return INDUSTRY_CONTEXTS[industry] || INDUSTRY_CONTEXTS.ecommerce;
}

export default {
    HOOK_LIBRARY,
    CTA_PATTERNS,
    VIDEO_ARCHETYPES,
    getArchetype,
    getAllArchetypes,
    getCompatibleHooks,
    getDefaultHook,
    getRandomCta,
    buildNegativePrompt,
    getIndustryContext,
};
