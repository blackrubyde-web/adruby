import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';
import { buildPresetRange } from '../utils/dateUtils';

const fallbackSeries = () => {
  const base = buildPresetRange('30d', 'Europe/Berlin');
  const points = [];
  for (let i = 0; i < 12; i++) {
    points.push({
      date: format(new Date(base.start.getTime() + i * 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      spend: 120 + Math.random() * 120,
      revenue: 360 + Math.random() * 320,
      roas: 3 + Math.random(),
      cpa: 10 + Math.random() * 5,
      ctr: 1.4 + Math.random() * 1.2
    });
  }
  return points;
};

const buildFallbackResponse = () => ({
  kpis: {
    adsGenerated: 0,
    strategiesCreated: 0,
    analysesRun: 0,
    creditsUsed: 0
  },
  performanceSeries: fallbackSeries(),
  creativeInsights: {
    topHooks: [],
    winningAngles: [],
    fatigueAlerts: [],
    sessionsByDevice: [
      { name: 'Mobile', value: 12450 },
      { name: 'Desktop', value: 8450 },
      { name: 'Tablet', value: 2200 }
    ]
  },
  recentStrategies: [],
  recentAds: [],
  activityFeed: [],
  table: {
    rows: [],
    page: 1,
    pageSize: 10,
    total: 0
  }
});

export async function getOverviewDashboard({ userId, range, timezone }) {
  // range: { start: Date, end: Date }
  const startIso = range.start.toISOString();
  const endIso = range.end.toISOString();
  const useRemote = import.meta.env.VITE_OVERVIEW_USE_REMOTE === 'true';

  if (!useRemote) {
    return buildFallbackResponse();
  }

  try {
    const [{ count: adsGenerated = 0 }, { count: strategiesCreated = 0 }, { count: analysesRun = 0 }] = await Promise.all([
      supabase
        .from('generated_ads')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startIso)
        .lte('created_at', endIso),
      supabase
        .from('ad_strategies')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startIso)
        .lte('created_at', endIso),
      supabase
        .from('ad_research_jobs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startIso)
        .lte('created_at', endIso)
    ]);

    const { data: recentStrategiesData } = await supabase
      .from('ad_strategies')
      .select('id,title,created_at,goal,industry')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentAdsData } = await supabase
      .from('generated_ads')
      .select('id,headline,hook,created_at,status')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: hookSamples } = await supabase
      .from('generated_ads')
      .select('id,hook,created_at')
      .gte('created_at', startIso)
      .lte('created_at', endIso)
      .limit(120);

    const hookCounts = {};
    (hookSamples || []).forEach((item) => {
      const normalized = (item.hook || '').toLowerCase().replace(/[^a-z0-9\\s]/g, '').trim();
      if (!normalized) return;
      hookCounts[normalized] = (hookCounts[normalized] || 0) + 1;
    });

    const topHooks = Object.entries(hookCounts)
      .map(([hook, usageCount]) => {
        const score = Math.min(100, usageCount * 12) - Math.max(0, (usageCount - 10) * 8);
        return { hook, usageCount, score: Math.max(0, Math.round(score)) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const fatigueAlerts = topHooks
      .filter((h) => h.usageCount >= 8)
      .map((h) => ({ creativeName: h.hook, reason: `Hook reused ${h.usageCount}x in range` }));

    const activityFeed = [
      ...(recentStrategiesData || []).map((s) => ({
        id: s.id,
        type: 'strategy',
        title: s.title || 'Strategy created',
        created_at: s.created_at,
        meta: { goal: s.goal }
      })),
      ...(recentAdsData || []).map((a) => ({
        id: a.id,
        type: 'ad',
        title: a.headline || 'Ad generated',
        created_at: a.created_at,
        meta: { status: a.status }
      }))
    ].slice(0, 8);

    const tableRows = [
      ...(recentAdsData || []).map((a) => ({
        id: a.id,
        created_at: a.created_at,
        type: 'ad',
        name: a.headline || 'Ad',
        status: a.status || 'draft',
        tags: a.hook ? [a.hook] : []
      })),
      ...(recentStrategiesData || []).map((s) => ({
        id: s.id,
        created_at: s.created_at,
        type: 'strategy',
        name: s.title || 'Strategy',
        status: 'completed',
        tags: s.industry ? [s.industry] : []
      }))
    ];

    return {
      kpis: {
        adsGenerated,
        strategiesCreated,
        analysesRun,
        creditsUsed: adsGenerated + strategiesCreated + analysesRun
      },
      performanceSeries: fallbackSeries(),
      creativeInsights: {
        topHooks: topHooks.length ? topHooks : [{ hook: 'Stop scrolling if...', score: 92, usageCount: 14 }],
        winningAngles: [{ angle: 'Social proof', liftPct: 32 }],
        fatigueAlerts: fatigueAlerts.length ? fatigueAlerts : [{ creativeName: 'Carousel_1', reason: 'Repeated 12x this week' }],
        sessionsByDevice: [
          { name: 'Mobile', value: 12450 },
          { name: 'Desktop', value: 8450 },
          { name: 'Tablet', value: 2200 }
        ]
      },
      recentStrategies: recentStrategiesData || [],
      recentAds: recentAdsData || [],
      activityFeed,
      table: {
        rows: tableRows,
        page: 1,
        pageSize: 10,
        total: tableRows.length
      }
    };
  } catch (err) {
    return buildFallbackResponse();
  }
}
