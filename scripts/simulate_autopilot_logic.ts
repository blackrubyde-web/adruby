
// Simulation Script for AdRuby Autopilot Logic
// Run with: npx ts-node scripts/simulate_autopilot_logic.ts

type Campaign = {
    id: string;
    name: string;
    metrics: {
        roas: number;
        spend: number;
        ctr: number;
        cpa?: number;
        purchases: number;
        impressions: number;
        frequency: number;
        daily_budget: number;
    };
};

type Config = {
    enabled: boolean;
    target_roas: number;
    pause_threshold_roas: number;
    scale_threshold_roas: number;
    max_budget_increase_pct: number;
    max_daily_budget: number;
};

// ------------------------------------------
// 🧠 The "Brain" (Exact Logic from Edge Function)
// ------------------------------------------
const RULES = {
    MIN_IMPRESSIONS_LEARNING: 500,
    FATIGUE_FREQUENCY_THRESHOLD: 2.2,
    FATIGUE_CTR_DROP_THRESHOLD: 0.8, // 0.8% CTR
    SURF_ROAS_MULTIPLIER: 1.3,
    SOFT_KILL_MULTIPLIER: 1.5,
};

function evaluateCampaign(camp: Campaign, config: Config) {
    const metrics = camp.metrics;
    const actions: string[] = [];

    // Rule 0: Learning
    if (metrics.impressions < RULES.MIN_IMPRESSIONS_LEARNING) {
        return { action: "IGNORE", reason: `Learning Phase (${metrics.impressions} imps)` };
    }

    // Rule 1: Soft Kill
    const assumedAOV = 50;
    const impliedTargetCPA = assumedAOV / config.target_roas;
    const killSpendThreshold = impliedTargetCPA * RULES.SOFT_KILL_MULTIPLIER;

    if (metrics.purchases === 0 && metrics.spend > killSpendThreshold) {
        return { action: "PAUSE", reason: `SOFT KILL: Spent ${metrics.spend} (> ${killSpendThreshold.toFixed(2)}) with 0 Sales` };
    }

    // Rule 2: Hard Stop
    if (metrics.purchases > 0 && metrics.roas < config.pause_threshold_roas) {
        return { action: "PAUSE", reason: `HARD STOP: ROAS ${metrics.roas} < ${config.pause_threshold_roas}` };
    }

    // Rule 3: Fatigue
    if (metrics.frequency > RULES.FATIGUE_FREQUENCY_THRESHOLD && metrics.ctr < RULES.FATIGUE_CTR_DROP_THRESHOLD) {
        const newBudget = Math.round(metrics.daily_budget * 0.8);
        return { action: "DECREASE_BUDGET", reason: `FATIGUE: Freq ${metrics.frequency}, CTR ${metrics.ctr}%`, newVal: newBudget };
    }

    // Rule 4: Surf
    const surfThreshold = config.target_roas * RULES.SURF_ROAS_MULTIPLIER;
    if (metrics.roas > surfThreshold && metrics.spend > (metrics.daily_budget * 0.5)) {
        const newBudget = Math.round(metrics.daily_budget * (1 + config.max_budget_increase_pct));
        if (newBudget <= config.max_daily_budget) {
            return { action: "INCREASE_BUDGET", reason: `SURF: ROAS ${metrics.roas} > ${surfThreshold.toFixed(2)}`, newVal: newBudget };
        } else {
            return { action: "IGNORE", reason: "Max Budget Cap Hit" };
        }
    }

    return { action: "KEEP", reason: "Within Key Performance Indicators" };
}

// ------------------------------------------
// 🧪 The Test Suite
// ------------------------------------------
const mockConfig: Config = {
    enabled: true,
    target_roas: 2.0,
    pause_threshold_roas: 1.5,
    scale_threshold_roas: 2.5,
    max_budget_increase_pct: 0.2, // 20%
    max_daily_budget: 1000
};

const scenarios: Campaign[] = [
    {
        id: "1", name: "🏆 The Winner (Surfing)",
        metrics: { roas: 3.5, spend: 80, daily_budget: 100, ctr: 2.0, purchases: 10, impressions: 5000, frequency: 1.2 }
    },
    {
        id: "2", name: "🩸 The Bleeder (Hard Stop)",
        metrics: { roas: 1.1, spend: 200, daily_budget: 100, ctr: 0.5, purchases: 4, impressions: 8000, frequency: 1.5 }
    },
    {
        id: "3", name: "🛡️ The Soft Kill (Zero Sales)",
        metrics: { roas: 0, spend: 45, daily_budget: 50, ctr: 0.8, purchases: 0, impressions: 2000, frequency: 1.1 }
        // Target CPA = 50 / 2.0 = 25. Threshold = 25 * 1.5 = 37.5. Spend 45 > 37.5. Should Kill.
    },
    {
        id: "4", name: "📉 The Fatigued (Burnout)",
        metrics: { roas: 1.8, spend: 90, daily_budget: 100, ctr: 0.5, purchases: 5, impressions: 15000, frequency: 2.8 }
    },
    {
        id: "5", name: "🎓 The Learner (Too Early)",
        metrics: { roas: 0.5, spend: 10, daily_budget: 50, ctr: 1.5, purchases: 0, impressions: 300, frequency: 1.0 }
    }
];

console.log("# 🤖 Autopilot Simulation Report\n");
console.log(`| Campaign | Metrics | Decision | Reason |`);
console.log(`|---|---|---|---|`);

scenarios.forEach(camp => {
    const result = evaluateCampaign(camp, mockConfig);
    const metricsStr = `ROAS:${camp.metrics.roas}, Spend:€${camp.metrics.spend}`;

    // Output Markdown Row
    console.log(`| **${camp.name}** | ${metricsStr} | **${result.action}** ${result.newVal ? '-> €' + result.newVal : ''} | ${result.reason} |`);
});
