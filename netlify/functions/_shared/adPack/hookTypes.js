/**
 * Hook Types v1.0 — 15 Hook Types with Funnel Mapping
 * Each hook type has a promptInjection that gets added to the creative brief.
 */

export const HOOK_TYPES = [
    {
        key: 'curiosity_gap',
        name: 'Curiosity Gap',
        funnelStages: ['tof'],
        promptInjection: 'The headline/hook must create an INFORMATION GAP — the viewer NEEDS to know more. Use "Was 97% falsch machen...", "Das Geheimnis hinter...", or "Warum niemand davon spricht...". The viewer must feel compelled to stop scrolling because they NEED the answer.',
        exampleDE: 'Was 97% falsch machen...',
        exampleEN: 'What 97% get wrong...',
    },
    {
        key: 'pain_agitate',
        name: 'Pain → Agitate',
        funnelStages: ['mof'],
        promptInjection: 'Start with the viewer\'s PAIN POINT. Name the frustration, the daily struggle, the thing that keeps them up at night. Agitate it — make them FEEL the problem. Then position the product as the obvious relief. "Müde von [Problem]? Es gibt einen besseren Weg."',
        exampleDE: 'Müde von [Problem]?',
        exampleEN: 'Tired of [Problem]?',
    },
    {
        key: 'social_proof_hook',
        name: 'Social Proof',
        funnelStages: ['mof'],
        promptInjection: 'Lead with SOCIAL VALIDATION — numbers, community, authority. "10.000+ zufriedene Kunden", "4.9/5 Sterne", "#1 in [Kategorie]". The viewer should feel they\'re missing out on what everyone else already has. Herd mentality, trust through numbers.',
        exampleDE: '10.000+ zufriedene Kunden',
        exampleEN: '10,000+ happy customers',
    },
    {
        key: 'identity_belong',
        name: 'Identity / Belonging',
        funnelStages: ['tof'],
        promptInjection: 'Make the viewer feel SEEN. "Für alle, die mehr wollen." "Nicht für jeden. Für dich." The product defines a tribe, a lifestyle, an identity. The hook creates belonging and exclusivity simultaneously. The viewer should think: "Das bin ICH."',
        exampleDE: 'Für alle, die mehr wollen.',
        exampleEN: 'For those who want more.',
    },
    {
        key: 'transformation',
        name: 'Transformation',
        funnelStages: ['mof', 'bof'],
        promptInjection: 'Promise a TRANSFORMATION — from current state to desired state. "In 30 Tagen zum Ergebnis." Show the journey, the promise of change. Before→After energy. The product is the vehicle of transformation. Concrete timeframe + concrete result.',
        exampleDE: 'In 30 Tagen zum Ergebnis.',
        exampleEN: 'Results in 30 days.',
    },
    {
        key: 'number_stat',
        name: 'Number / Statistic',
        funnelStages: ['mof', 'bof'],
        promptInjection: 'Lead with a POWERFUL NUMBER or statistic. "73% bessere Performance", "2.340+ verkauft", "3x schneller". Numbers create instant credibility. The stat must be specific, impressive, and directly tied to the product\'s benefit. Data = trust.',
        exampleDE: '73% bessere Performance.',
        exampleEN: '73% better performance.',
    },
    {
        key: 'urgency_fomo',
        name: 'Urgency / FOMO',
        funnelStages: ['bof'],
        promptInjection: 'Create IMMEDIATE URGENCY — "Nur noch heute", "Letzte 12 Stück", "Angebot endet in 3h". Fear of missing out. The deal is disappearing. Act NOW or regret later. Red/orange urgency colors, countdown energy, limited-time language.',
        exampleDE: 'Nur noch heute: -50%',
        exampleEN: 'Today only: -50%',
    },
    {
        key: 'question_hook',
        name: 'Question Hook',
        funnelStages: ['tof'],
        promptInjection: 'Open with a PROVOCATIVE QUESTION that the viewer can\'t ignore. "Warum zahlen alle mehr?" "Kennst du den Unterschied?" The question must be relevant to the viewer\'s situation and answerable ONLY by engaging with the ad. Rhetorical power.',
        exampleDE: 'Warum zahlen alle mehr?',
        exampleEN: 'Why does everyone pay more?',
    },
    {
        key: 'bold_claim',
        name: 'Bold Claim',
        funnelStages: ['tof'],
        promptInjection: 'Make a BOLD, attention-demanding statement. "Das beste Produkt. Punkt." "Revolutioniert die Branche." Confident, unapologetic, polarizing. The claim is so strong it stops the scroll. Product must back it up visually.',
        exampleDE: 'Das beste Produkt. Punkt.',
        exampleEN: 'The best product. Period.',
    },
    {
        key: 'pattern_break',
        name: 'Pattern Break',
        funnelStages: ['tof'],
        promptInjection: 'Break the visual PATTERN of expected content. Something unexpected — wrong colors, unusual composition, surreal element, "wait what?" moment. The ad should feel "off" in a way that forces attention. Pattern interrupt = scroll stop.',
        exampleDE: 'STOP. Lies das.',
        exampleEN: 'STOP. Read this.',
    },
    {
        key: 'story_micro',
        name: 'Micro Story',
        funnelStages: ['mof'],
        promptInjection: 'Tell a MINI STORY in the ad. "Vor 3 Jahren hatte ich dasselbe Problem..." Personal, emotional, relatable. A journey in 2-3 sentences. The product is the turning point. Narrative arc: problem → discovery → solution. Emotional connection.',
        exampleDE: 'Vor 3 Jahren hatte ich...',
        exampleEN: '3 years ago I had...',
    },
    {
        key: 'humor_meme',
        name: 'Humor / Meme',
        funnelStages: ['tof'],
        promptInjection: 'Use HUMOR — relatable situation, insider joke, meme energy. The viewer laughs, shares, remembers. Self-deprecating or observational humor. Product is the punchline or the solution to a funny problem. Shareability > salesiness.',
        exampleDE: 'Wenn du immer noch [altes Produkt] benutzt... 😬',
        exampleEN: 'When you\'re still using [old product]... 😬',
    },
    {
        key: 'authority',
        name: 'Authority / Expert',
        funnelStages: ['mof'],
        promptInjection: 'Position through AUTHORITY — "Empfohlen von 500+ Experten", "Klinisch getestet", "Von Profis entwickelt". Expert language, professional credibility, scientific backing. The product is endorsed by those who know best.',
        exampleDE: 'Empfohlen von 500+ Experten',
        exampleEN: 'Recommended by 500+ experts',
    },
    {
        key: 'contrast',
        name: 'Direct Contrast',
        funnelStages: ['mof'],
        promptInjection: 'Create a SHARP CONTRAST between the old/wrong way and the new/right way. "Andere: langweilig. Wir: aufregend." Direct comparison that makes the alternative look inferior. Our product shines next to the competition.',
        exampleDE: 'Andere: X. Wir: Y.',
        exampleEN: 'Others: X. Us: Y.',
    },
    {
        key: 'confession',
        name: 'Confession / Honesty',
        funnelStages: ['tof'],
        promptInjection: 'Start with a CONFESSION — "Ich gebe zu: Ich war skeptisch...", "Ehrlich gesagt..." Vulnerability creates trust. Authentic, self-aware, relatable. The confession leads to genuine product endorsement. Think: honest review energy.',
        exampleDE: 'Ich gebe zu: Ich war skeptisch...',
        exampleEN: 'I admit: I was skeptical...',
    },
];

export const HOOK_BY_KEY = Object.fromEntries(HOOK_TYPES.map(h => [h.key, h]));

export const HOOKS_BY_FUNNEL = {
    tof: HOOK_TYPES.filter(h => h.funnelStages.includes('tof')),
    mof: HOOK_TYPES.filter(h => h.funnelStages.includes('mof')),
    bof: HOOK_TYPES.filter(h => h.funnelStages.includes('bof')),
};

export default { HOOK_TYPES, HOOK_BY_KEY, HOOKS_BY_FUNNEL };
