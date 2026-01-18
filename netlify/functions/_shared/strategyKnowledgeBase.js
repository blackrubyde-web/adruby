// netlify/functions/_shared/strategyKnowledgeBase.js
// Strukturiertes Strategie-Wissen für AI-Integration

/**
 * Industry-specific strategy knowledge base
 * Basierend auf professionellen Marketing-Blueprints
 */

export const STRATEGY_KNOWLEDGE = {
    // ============================================
    // E-COMMERCE D2C
    // ============================================
    'ecom_d2c': {
        name: 'E-Commerce D2C Brand',
        description: 'Direct-to-Consumer Premium Brands (Beauty, Lifestyle, Home, Apparel)',

        // Performance Benchmarks
        benchmarks: {
            roas: { excellent: 4.0, good: 3.0, acceptable: 2.0, poor: 1.5 },
            ctr: { excellent: 3.0, good: 2.0, acceptable: 1.0, poor: 0.5 },
            cpc: { excellent: 0.3, good: 0.5, acceptable: 0.8, poor: 1.2 },
            frequency: { optimal: 2.0, max: 3.5 },
        },

        // 6 Buyer Personas
        buyerPersonas: [
            {
                name: 'Aesthetic Optimizer',
                description: 'Stark visuell orientiert, reagiert auf hochwertige Creatives',
                painPoints: ['Produkte sehen günstig aus', 'Fehlende Konsistenz im Design', 'Kein Premium-Gefühl'],
                desires: ['Produkte die instant besser wirken', 'Hochwertigkeit ohne Luxuspreis', 'Zeitloses Design'],
                triggers: ['Ästhetische Harmonie', 'Premium Packaging', 'Vorher-Nachher Transformation', 'ASMR Close-Ups'],
                creativeNeeds: ['Ultra-clean Aesthetic Ads', 'Macro-Shots', 'Mood B-Roll', 'Soft Light', 'Slow Motion'],
                hooks: ['Was, wenn dein Zuhause sich sofort hochwertiger anfühlt?', 'Das Upgrade, das du jeden Tag siehst.'],
            },
            {
                name: 'Self-Improver',
                description: 'Performance-Driven, liebt Transformationen, sucht Verbesserung',
                painPoints: ['Komplexe Produkte die nicht funktionieren', 'Keine sichtbaren Ergebnisse', 'Fake-Promises'],
                desires: ['Sichtbare Verbesserung', 'Weniger Aufwand, mehr Wirkung', 'Verlässliche Routinen'],
                triggers: ['Outcome-Framing', 'Data-Driven Messaging', 'Progression Stories', 'Creator-Demos'],
                creativeNeeds: ['Tutorials', 'Before/After', 'How it Works Step-by-Step', 'Lifestyle-Demos'],
                hooks: ['Mach deinen Alltag messbar besser — in weniger als 7 Tagen.', 'Wie du in einer Minute pro Tag X verbesserst.'],
            },
            {
                name: 'Functional Buyer',
                description: 'Kauft rational, will Effizienz, Langlebigkeit, Zuverlässigkeit',
                painPoints: ['Schlechte Qualität', 'Kurzlebige Produkte', 'Unklare Nutzen', 'Marken übertreiben'],
                desires: ['Produkte die einfach funktionieren', 'Lange Haltbarkeit', 'Transparente Herstellung'],
                triggers: ['Garantien', 'Technische Detailtiefe', 'Stabilitätsbeweise', 'Echte Kundenbewertungen'],
                creativeNeeds: ['Material-Tests', 'Unboxing + QC-Demos', 'Stress-Tests'],
                hooks: ['Die letzte Version, die du jemals kaufen musst.', 'Warum wir nicht billig sind — aber langfristig günstiger.'],
            },
            {
                name: 'Community-Seeker',
                description: 'Definiert sich über Werte, Ästhetik, Lifestyle - will dazugehören',
                painPoints: ['Marken ohne Identität', 'Produkte ohne Story', 'Keine Community'],
                desires: ['Teil einer Bewegung sein', 'Authentizität', 'Creator die sie mögen'],
                triggers: ['Community-Building', 'Creator-Stories', 'Behind-the-Brand', 'Limited Editions'],
                creativeNeeds: ['Creator-driven UGC', 'Brand Founder Stories', 'Live Testimonials'],
                hooks: ['Warum 100.000+ Menschen uns folgen.', 'Was unsere Community einzigartig macht.'],
            },
            {
                name: 'Trend-Adopter',
                description: 'High-Speed-Käufer, extrem impulsiv, reagiert auf virale Trends',
                painPoints: ['Keine neuen Ideen', 'FOMO', 'Schlechte Trend-Produkt Qualität'],
                desires: ['Neuheit', 'Social Virality', 'Wow-Faktor'],
                triggers: ['Trending Sounds', 'Super Short-Form', '2-Sekunden-Hooks'],
                creativeNeeds: ['Native TikTok/Reels Ads', 'Trend-basierte Loops', 'POV-Content', 'Meme-Formate'],
                hooks: ['I found this brand before it blows up', 'POV: Du entdeckst das nächste große Ding'],
            },
            {
                name: 'Value-Maximizer',
                description: 'High-AOV aber rational, sucht besten Value',
                painPoints: ['Überteuerte Luxe-Produkte', 'Unklare Value Proposition'],
                desires: ['Mehr Wert als bezahlt', 'Bundles', 'Premium ohne Premium-Preis'],
                triggers: ['Vergleichsmatrizen', 'Bundle-Angebote', 'Value-Stacking'],
                creativeNeeds: ['Comparison Ads', 'Bundle Showcases', 'Value Breakdown'],
                hooks: ['Warum du für X nicht €200 zahlen musst.', 'Das Premium-Bundle zum Smart-Preis.'],
            },
        ],

        // Messaging Angles
        messagingAngles: [
            { name: 'Feel the Upgrade', description: 'Emotionaler USP: Du fühlst die Veränderung sofort' },
            { name: 'Engineered for People Who Care', description: 'Premium, wissenschaftlich, fundiert' },
            { name: 'Made to Outperform', description: 'Performance-Sicht, Effizienz' },
            { name: 'Beauty Without Compromise', description: 'Luxusgefühl ohne Luxuspreis' },
            { name: 'Authentic Stories', description: 'Creator-first, echte Menschen, echte Ergebnisse' },
        ],

        // Recommended Rules
        automationRules: [
            { condition: 'roas < 1.5', timeframe: '3d', action: 'pause', priority: 'high', reason: 'ROAS unter Break-even für D2C' },
            { condition: 'roas > 3.5', timeframe: '7d', action: 'increase_budget', value: 25, priority: 'high', reason: 'Top Performer für Skalierung' },
            { condition: 'frequency > 3.5', timeframe: '7d', action: 'alert', priority: 'medium', reason: 'Ad Fatigue Risiko' },
            { condition: 'ctr < 0.8', timeframe: '48h', action: 'alert', priority: 'medium', reason: 'Schwacher Hook/Creative' },
        ],

        // Fatigue Indicators
        fatigueIndicators: [
            'CTR sinkt um >15% in 7 Tagen',
            'Frequency > 3.5',
            'ROAS Decline bei konstantem Spend',
            'CPM steigt bei gleichem Audience',
        ],
    },

    // ============================================
    // SAAS / SOFTWARE / TECH TOOLS
    // ============================================
    'saas': {
        name: 'SaaS / Software / Tech Tools',
        description: 'B2B/B2C Software, AI Tools, Marketing Tools, Productivity, CRM, Analytics',

        benchmarks: {
            cpl: { excellent: 15, good: 30, acceptable: 50, poor: 80 },
            trialConversion: { excellent: 15, good: 10, acceptable: 5, poor: 2 },
            ctr: { excellent: 2.0, good: 1.2, acceptable: 0.8, poor: 0.4 },
            cac: { excellent: 100, good: 200, acceptable: 400, poor: 600 },
        },

        buyerPersonas: [
            {
                name: 'Solopreneur / Creator',
                description: 'Einzelpersonen mit 1-3 Personen, brauchen Zeit-Ersparnis',
                painPoints: ['Hoher Zeitverlust durch manuelle Arbeit', 'Fehlende Struktur', 'Zu viele Tools'],
                desires: ['Tägliche Arbeitslast reduzieren', 'Lead-Prozesse stabilisieren', 'Weniger Tools nutzen'],
                triggers: ['Einfachheit', 'Klarheit', 'Soforteffekt', '1 Tool ersetzt 5 andere'],
                creativeNeeds: ['Zielorientierte Visualisierungen', 'Use Cases', 'klare UI-Screenshots'],
                hooks: ['Automatisiere die Arbeit, die deine Zeit frisst.', 'Ein Tool statt fünf.'],
            },
            {
                name: 'KMU Growth Team',
                description: 'Teams 5-50 Mitarbeiter, brauchen Standardisierung',
                painPoints: ['Informationssilos', 'Doppelte Arbeit', 'Keine Prozessklarheit'],
                desires: ['Prozesse standardisieren', 'Datenqualität verbessern', 'Echtzeit-Reporting'],
                triggers: ['Team-Alignment', 'Reporting-Sicherheit', 'Skalierbarkeit'],
                creativeNeeds: ['Teamstorys', 'Workflow-Diagramme', 'Multi-User Screens'],
                hooks: ['Weniger Abstimmung — mehr Umsetzung.', 'Ein zentrales System für deine Teams.'],
            },
            {
                name: 'Enterprise Buyer',
                description: 'C-Level, IT-Leads, Security-Officer',
                painPoints: ['Compliance', 'Datenschutz', 'Legacy Systems', 'IT-Komplexität'],
                desires: ['Technische Stabilität', 'Sicherheit', 'Enterprise-Reporting'],
                triggers: ['Enterprise-ready', 'ISO / SOC2', 'DSGVO-konform', 'Zero-Error Workflows'],
                creativeNeeds: ['Architekturdiagramme', 'Case Studies mit großen Marken', 'Security Screens'],
                hooks: ['Skalierbare Software, die mit Ihrer Organisation wächst.', 'Enterprise-grade Sicherheit.'],
            },
            {
                name: 'Technical User / Developer',
                description: 'Implementiert, erweitert oder integriert Software',
                painPoints: ['Schlechte API', 'Mangelhafte Dokumentation', 'Instabile Webhooks'],
                desires: ['Zuverlässige Integrationen', 'API-Stabilität', 'Developer Experience'],
                triggers: ['Technische Eleganz', 'Schnelligkeit', 'Open API'],
                creativeNeeds: ['Code-Beispiele', 'API Requests', 'Logs'],
                hooks: ['Die API, die du dir immer gewünscht hast.', 'Entwickler-first. Schnell. Stabil.'],
            },
            {
                name: 'Marketing / Growth Manager',
                description: 'Performance Marketer, CMOs, Funnel Builder',
                painPoints: ['Unklare Daten', 'Manuelles Reporting', 'Kein einheitliches Dashboard'],
                desires: ['Klare KPIs', 'Zentrale Datenquelle', 'Marketing-Automation'],
                triggers: ['Visualisierte Daten', 'Zeitersparnis', 'Performance-Steigerung'],
                creativeNeeds: ['KPI-Diagramme', 'Datenübersichten', 'Vorher/Nachher Reporting'],
                hooks: ['Die Daten, die du brauchst — ohne Overhead.', 'Ein Dashboard für alle Kampagnen.'],
            },
        ],

        messagingAngles: [
            { name: 'Effizienz & Automatisierung', description: 'Wiederkehrende Arbeit erledigt sich von selbst' },
            { name: 'Klarheit & Datenkontrolle', description: 'Lerne dein Business in Echtzeit kennen' },
            { name: 'Fehlerreduktion & Sicherheit', description: 'Eliminiere Fehler, sichere deine Daten' },
            { name: 'Skalierbarkeit', description: 'Wachstum ohne Personalaufbau' },
            { name: 'Integration', description: 'Fügt sich in bestehende Infrastruktur ein' },
        ],

        automationRules: [
            { condition: 'cpl > 60', timeframe: '7d', action: 'alert', priority: 'high', reason: 'CPL zu hoch für SaaS' },
            { condition: 'ctr < 0.6', timeframe: '3d', action: 'pause', priority: 'medium', reason: 'Schwaches Creative für Tech-Audience' },
            { condition: 'trial_signups = 0', timeframe: '48h', action: 'alert', priority: 'critical', reason: 'Keine Trial-Signups' },
        ],
    },

    // ============================================
    // COACHING / HIGH-TICKET
    // ============================================
    'coaching': {
        name: 'Coaching / Education / High-Ticket',
        description: 'Business Coaching, Fitness Coaching, Mindset, Consulting, Trading',

        benchmarks: {
            cpl: { excellent: 20, good: 40, acceptable: 70, poor: 100 },
            showUpRate: { excellent: 80, good: 60, acceptable: 40, poor: 25 },
            closeRate: { excellent: 30, good: 20, acceptable: 10, poor: 5 },
            cac: { excellent: 300, good: 600, acceptable: 1000, poor: 1500 },
        },

        buyerPersonas: [
            {
                name: 'Ambitionierter Starter',
                description: 'Hohes Potenzial, Motivation, aber ohne Struktur',
                painPoints: ['Überforderung durch Informationsflut', 'Kein klarer Plan', 'Angst vor Fehlentscheidungen'],
                desires: ['Klare Positionierung', 'Erstes validiertes Angebot', 'Schneller Fortschritt'],
                triggers: ['Führung', 'Struktur', 'Kleine klare Schritte', 'Roadmap'],
                creativeNeeds: ['Vorgehensmodelle', 'Case Studies von Anfängern', 'Prozess-Visualisierung'],
                hooks: ['Du brauchst keinen Zufall – du brauchst Struktur.', 'Mit einem klaren System erreichst du in Wochen, was du seit Jahren vor dir herschiebst.'],
            },
            {
                name: 'Erfahrener Umsetzer',
                description: 'Bereits gute Ergebnisse, aber Plateau erreicht',
                painPoints: ['Stagnierende Umsätze', 'Fehlende Skalierungsstrategie', 'Ineffiziente Prozesse'],
                desires: ['Bessere Kunden', 'Höhere Preise', 'Professionalisierung'],
                triggers: ['Prozessvisualisierung', 'Case Studies die denselben Engpass lösen', 'Beweise statt Versprechen'],
                creativeNeeds: ['Zahlen', 'Diagramme', 'Systemmodelle', 'Benchmarks'],
                hooks: ['Wenn du 5k erreichst, kannst du 20k erreichen – aber nicht mit denselben Methoden.', 'Struktur ersetzt Chaos.'],
            },
            {
                name: 'High-Performer',
                description: 'Hohe Leistungsfähigkeit, gute Umsätze – aber keine Balance',
                painPoints: ['Überlastung', 'Keine Freizeit', 'Ständiges Feuerlöschen'],
                desires: ['Klare Systeme', 'Teamaufbau', 'Entlastung'],
                triggers: ['Seniorität', 'Autoritatives Auftreten', 'Zeitersparnis'],
                creativeNeeds: ['Professionelle Präsentation', 'Methodische Tiefe', 'Fallstudien von High-Performern'],
                hooks: ['High Performance ohne Burnout.', 'Systeme, die dich entlasten.'],
            },
            {
                name: 'Suchender',
                description: 'Unklarer Fokus, aber hoher Leidensdruck',
                painPoints: ['Fehlende Vision', 'Orientierungslosigkeit', 'Selbstzweifel'],
                desires: ['Klarheit', 'Fokus', 'Emotionale Stabilität'],
                triggers: ['Sicherheit', 'Führung', 'Ruhe', 'Stabilität'],
                creativeNeeds: ['Ruhige Erklärungen', 'Empathische Ansprache'],
                hooks: ['Klarheit durch Struktur.', 'Fokus durch professionelle Führung.'],
            },
            {
                name: 'Ergebniskäufer',
                description: 'Ressourcen, Wille, Kaufkraft – alles vorhanden',
                painPoints: ['Fehlende strategische Klarheit', 'Ineffiziente Systeme'],
                desires: ['Konkretes Ergebnis', 'Planbare Pipeline', 'Hochwertige Kunden'],
                triggers: ['Autorität', 'Souveränität', 'Zahlen & Daten', 'Maßgeschneiderte Lösungen'],
                creativeNeeds: ['Whitepapers', 'High-End Präsentationen'],
                hooks: ['Professionelle Struktur statt Bauchgefühl.', 'Strategie schlägt Motivation.'],
            },
        ],

        messagingAngles: [
            { name: 'Struktur & Führung', description: 'Ein klarer, geführter Prozess mit messbaren Fortschritten' },
            { name: 'Transformationsbeweis', description: 'Nachvollziehbare Ergebnisse statt Motivationssprüche' },
            { name: 'Experten-Positionierung', description: 'Erfahrung, Kompetenz, präzises Fachsystem' },
            { name: 'Risiko-Reduktion', description: 'Professionelle Führung, die Unsicherheit eliminiert' },
            { name: 'Effizienz', description: 'Ergebnisorientierte Umsetzung in Wochen, nicht Jahren' },
        ],

        automationRules: [
            { condition: 'cpl > 80', timeframe: '7d', action: 'alert', priority: 'high', reason: 'CPL zu hoch für High-Ticket' },
            { condition: 'show_up_rate < 40', timeframe: '7d', action: 'alert', priority: 'critical', reason: 'Niedrige Show-Up Rate' },
            { condition: 'booked_calls = 0', timeframe: '3d', action: 'alert', priority: 'critical', reason: 'Keine Calls gebucht' },
        ],
    },

    // ============================================
    // E-COMMERCE DROPSHIPPING
    // ============================================
    'dropshipping': {
        name: 'E-Commerce Dropshipping',
        description: 'Testing-Modell, schnelle Produkt-Tests, Volume-basiert',

        benchmarks: {
            roas: { excellent: 2.5, good: 2.0, acceptable: 1.5, poor: 1.0 },
            ctr: { excellent: 3.5, good: 2.5, acceptable: 1.5, poor: 0.8 },
            cpc: { excellent: 0.2, good: 0.4, acceptable: 0.6, poor: 0.9 },
            aov: { excellent: 45, good: 35, acceptable: 25, poor: 15 },
        },

        automationRules: [
            { condition: 'roas < 1.3', timeframe: '48h', action: 'pause', priority: 'high', reason: 'Zu niedrig für Dropshipping Margen' },
            { condition: 'spend > 50 AND purchases = 0', timeframe: '24h', action: 'pause', priority: 'critical', reason: 'Kein Sale nach €50 Spend' },
            { condition: 'cpc > 0.8', timeframe: '24h', action: 'alert', priority: 'medium', reason: 'CPC zu hoch für Volumen-Testing' },
        ],
    },

    // ============================================
    // B2B DIENSTLEISTUNGEN
    // ============================================
    'b2b_services': {
        name: 'B2B Dienstleistungen',
        description: 'Agenturen, Consulting, Freelancer für Unternehmen',

        benchmarks: {
            cpl: { excellent: 30, good: 60, acceptable: 100, poor: 150 },
            ctr: { excellent: 1.5, good: 1.0, acceptable: 0.6, poor: 0.3 },
            meetingRate: { excellent: 40, good: 25, acceptable: 15, poor: 5 },
        },

        automationRules: [
            { condition: 'cpl > 120', timeframe: '7d', action: 'alert', priority: 'high', reason: 'CPL über B2B Benchmark' },
            { condition: 'meetings = 0', timeframe: '7d', action: 'alert', priority: 'critical', reason: 'Keine Meetings generiert' },
        ],
    },

    // ============================================
    // LOKALE DIENSTLEISTUNGEN / HANDWERK
    // ============================================
    'local_services': {
        name: 'Handwerk / Lokale Dienstleistungen',
        description: 'Handwerker, lokale Services, regionale Unternehmen',

        benchmarks: {
            cpl: { excellent: 10, good: 20, acceptable: 35, poor: 50 },
            ctr: { excellent: 2.5, good: 1.5, acceptable: 1.0, poor: 0.5 },
            callRate: { excellent: 30, good: 20, acceptable: 10, poor: 5 },
        },

        automationRules: [
            { condition: 'cpl > 40', timeframe: '7d', action: 'decrease_budget', value: 20, priority: 'medium', reason: 'CPL über lokal üblich' },
            { condition: 'reach < 1000', timeframe: '7d', action: 'alert', priority: 'low', reason: 'Lokale Reichweite zu gering' },
        ],
    },
};

/**
 * Get strategy context for a specific industry
 */
export function getStrategyContext(industryKey) {
    return STRATEGY_KNOWLEDGE[industryKey] || null;
}

/**
 * Get all available industries
 */
export function getAvailableIndustries() {
    return Object.entries(STRATEGY_KNOWLEDGE).map(([key, value]) => ({
        key,
        name: value.name,
        description: value.description,
    }));
}

/**
 * Get recommended automation rules for an industry
 */
export function getRecommendedRules(industryKey) {
    const strategy = STRATEGY_KNOWLEDGE[industryKey];
    return strategy?.automationRules || [];
}

/**
 * Get buyer personas for an industry
 */
export function getBuyerPersonas(industryKey) {
    const strategy = STRATEGY_KNOWLEDGE[industryKey];
    return strategy?.buyerPersonas || [];
}

/**
 * Get messaging angles for an industry
 */
export function getMessagingAngles(industryKey) {
    const strategy = STRATEGY_KNOWLEDGE[industryKey];
    return strategy?.messagingAngles || [];
}

/**
 * Evaluate campaign performance against industry benchmarks
 */
export function evaluatePerformance(industryKey, metrics) {
    const strategy = STRATEGY_KNOWLEDGE[industryKey];
    if (!strategy || !strategy.benchmarks) return null;

    const evaluation = {};
    const benchmarks = strategy.benchmarks;

    for (const [metric, value] of Object.entries(metrics)) {
        const benchmark = benchmarks[metric];
        if (!benchmark) continue;

        let rating;
        if (metric === 'roas' || metric === 'ctr' || metric === 'trialConversion' || metric === 'showUpRate' || metric === 'closeRate') {
            // Higher is better
            if (value >= benchmark.excellent) rating = 'excellent';
            else if (value >= benchmark.good) rating = 'good';
            else if (value >= benchmark.acceptable) rating = 'acceptable';
            else rating = 'poor';
        } else {
            // Lower is better (cpl, cpc, cac)
            if (value <= benchmark.excellent) rating = 'excellent';
            else if (value <= benchmark.good) rating = 'good';
            else if (value <= benchmark.acceptable) rating = 'acceptable';
            else rating = 'poor';
        }

        evaluation[metric] = { value, rating, benchmark };
    }

    return evaluation;
}

/**
 * Generate AI prompt context for a specific industry
 */
export function generateAIContext(industryKey) {
    const strategy = STRATEGY_KNOWLEDGE[industryKey];
    if (!strategy) return '';

    let context = `
## INDUSTRIE: ${strategy.name}
${strategy.description}

## PERFORMANCE BENCHMARKS:
${Object.entries(strategy.benchmarks || {}).map(([metric, values]) =>
        `- ${metric.toUpperCase()}: Excellent=${values.excellent}, Good=${values.good}, Acceptable=${values.acceptable}, Poor=${values.poor}`
    ).join('\n')}

## BUYER PERSONAS:
${(strategy.buyerPersonas || []).map(persona =>
        `### ${persona.name}
  - Beschreibung: ${persona.description}
  - Pain Points: ${persona.painPoints.join(', ')}
  - Desires: ${persona.desires.join(', ')}
  - Trigger: ${persona.triggers.join(', ')}
  - Creative Needs: ${persona.creativeNeeds.join(', ')}`
    ).join('\n\n')}

## MESSAGING ANGLES:
${(strategy.messagingAngles || []).map(angle =>
        `- ${angle.name}: ${angle.description}`
    ).join('\n')}

## AUTOMATISCHE REGELN (EMPFOHLEN):
${(strategy.automationRules || []).map(rule =>
        `- IF ${rule.condition} FOR ${rule.timeframe} THEN ${rule.action}${rule.value ? ` ${rule.value}%` : ''} (${rule.priority}) - ${rule.reason}`
    ).join('\n')}
`;

    return context;
}
