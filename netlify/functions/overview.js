import {
  ok,
  serverError,
  methodNotAllowed,
  withCors,
} from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { supabaseAdmin } from "./_shared/clients.js";
import { formatDate } from "./_shared/meta.js";

function parseRange(range) {
  if (range === "today") return 1;
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  return 7;
}

function safeNumber(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function calcDelta(current, previous) {
  if (!previous || previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

function isMissingRelation(error, relation) {
  const msg = error?.message || "";
  return msg.includes("relation") && msg.includes(relation);
}

function emptyOverview() {
  return {
    kpis: {
      spend: 0,
      revenue: 0,
      roas: 0,
      activeCampaigns: 0,
      spendChangePct: undefined,
      revenueChangePct: undefined,
      roasChangePct: undefined,
    },
    timeseries: [],
    topCampaign: {
      id: "campaign-0",
      name: "No campaigns yet",
      roas: 0,
      spend: 0,
      revenue: 0,
    },
    bestCreative: {
      id: "creative-0",
      name: "Meta connection required",
      aiScore: 0,
      ctr: 0,
      conversions: 0,
    },
    onboarding: {
      completedSteps: 0,
      totalSteps: 4,
      steps: [
        {
          id: "connect-meta",
          title: "Connect Meta Ads account",
          description: "Link your Facebook Business account to import campaigns",
          completed: false,
          actionLabel: "Connect",
        },
        {
          id: "create-campaign",
          title: "Create your first campaign",
          description: "Launch a campaign to start getting results",
          completed: false,
          actionLabel: "Create",
        },
        {
          id: "generate-creatives",
          title: "Generate AI ad creatives",
          description: "Use AI to create high-performing ad variations",
          completed: false,
          actionLabel: "Generate",
        },
        {
          id: "enable-optimization",
          title: "Enable AI optimization rules",
          description: "Let AI automatically optimize your campaigns",
          completed: false,
          actionLabel: "Enable",
        },
      ],
    },
  };
}

const OVERVIEW_CACHE = new Map();
const OVERVIEW_CACHE_TTL_MS = 1000 * 30;

function getCachedOverview(key) {
  const hit = OVERVIEW_CACHE.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > OVERVIEW_CACHE_TTL_MS) {
    OVERVIEW_CACHE.delete(key);
    return null;
  }
  return hit.data;
}

function setCachedOverview(key, data) {
  OVERVIEW_CACHE.set(key, { ts: Date.now(), data });
}

function okCached(data) {
  return withCors({
    statusCode: 200,
    headers: { "Cache-Control": "private, max-age=30" },
    body: JSON.stringify(data),
  });
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });
  if (event.httpMethod !== "GET") return methodNotAllowed("GET,OPTIONS");

  initTelemetry();

  const auth = await requireUserId(event);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  const range = event.queryStringParameters?.range || "7d";
  const channel = event.queryStringParameters?.channel || "meta";
  const days = parseRange(range);
  const today = new Date();
  const since = new Date();
  since.setDate(today.getDate() - (days - 1));

  const cacheKey = `${userId}:${range}:${channel}`;
  const cached = getCachedOverview(cacheKey);
  if (cached) return okCached(cached);

  try {
    const prevEnd = new Date(since);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevEnd.getDate() - (days - 1));

    const dailyPromise = supabaseAdmin
      .from("meta_insights_daily")
      .select("date,spend,revenue,roas,impressions,clicks,conversions")
      .eq("user_id", userId)
      .gte("date", formatDate(since))
      .lte("date", formatDate(today))
      .order("date", { ascending: true });

    const prevPromise = supabaseAdmin
      .from("meta_insights_daily")
      .select("spend,revenue,roas")
      .eq("user_id", userId)
      .gte("date", formatDate(prevStart))
      .lte("date", formatDate(prevEnd));

    const campaignPromise = supabaseAdmin
      .from("meta_campaigns")
      .select("id,facebook_campaign_id,name,roas,spend,revenue,conversions")
      .eq("user_id", userId)
      .order("roas", { ascending: false })
      .limit(1);

    const countPromise = supabaseAdmin
      .from("meta_campaigns")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    const connectionPromise = supabaseAdmin
      .from("facebook_connections")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    const creativePromise = supabaseAdmin
      .from("generated_creatives")
      .select("id,outputs,score,created_at,inputs")
      .eq("user_id", userId)
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1);

    const [
      { data: daily, error: dailyError },
      { data: prevDaily, error: prevError },
      { data: campaignStats, error: campaignError },
      { count: campaignCount, error: countError },
      { data: connection, error: connectionError },
      { data: creativeRows, error: creativeError },
    ] = await Promise.all([
      dailyPromise,
      prevPromise,
      campaignPromise,
      countPromise,
      connectionPromise,
      creativePromise,
    ]);

    if (dailyError) {
      if (isMissingRelation(dailyError, "meta_insights_daily")) {
        const payload = { ...emptyOverview(), warning: "meta_insights_daily_missing" };
        setCachedOverview(cacheKey, payload);
        return okCached(payload);
      }
      return serverError(`Failed to load overview data: ${dailyError.message}`);
    }

    if (prevError) captureException(prevError, { function: "overview", stage: "prev" });
    if (campaignError) captureException(campaignError, { function: "overview", stage: "campaign" });
    if (countError) captureException(countError, { function: "overview", stage: "campaign_count" });
    if (connectionError) captureException(connectionError, { function: "overview", stage: "connection" });
    if (creativeError) captureException(creativeError, { function: "overview", stage: "best_creative" });

    const points =
      (daily || []).map((row) => {
        const spendValue = safeNumber(row.spend);
        const revenueValue = safeNumber(row.revenue);
        return {
          ts: row.date,
          spend: spendValue,
          revenue: revenueValue,
          roas: safeNumber(row.roas) || (spendValue > 0 ? revenueValue / spendValue : 0),
        };
      }) || [];

    const spend = points.reduce((acc, p) => acc + p.spend, 0);
    const revenue = points.reduce((acc, p) => acc + p.revenue, 0);
    const roas = spend > 0 ? revenue / spend : 0;

    const prevSpend =
      (prevDaily || []).reduce((acc, row) => acc + safeNumber(row.spend), 0) || 0;
    const prevRevenue =
      (prevDaily || []).reduce((acc, row) => acc + safeNumber(row.revenue), 0) || 0;
    const prevRoas = prevSpend > 0 ? prevRevenue / prevSpend : 0;

    const topCampaign = campaignStats?.[0];
    const bestCreativeRow = creativeRows?.[0] || null;

    const bestCreative = (() => {
      if (!bestCreativeRow) {
        return {
          id: "creative-0",
          name: "No creatives yet",
          aiScore: 0,
          ctr: 0,
          conversions: 0,
        };
      }
      const outputs = bestCreativeRow.outputs || {};
      const inputs = bestCreativeRow.inputs || {};
      const brief =
        outputs?.brief ||
        inputs?.brief ||
        null;
      const creative =
        Array.isArray(outputs?.creatives) && outputs.creatives.length
          ? outputs.creatives[0]
          : Array.isArray(outputs?.variants) && outputs.variants.length
            ? outputs.variants[0]
            : null;
      const name =
        creative?.copy?.hook ||
        brief?.product?.name ||
        "Creative";
      const aiScore =
        typeof bestCreativeRow.score === "number" && Number.isFinite(bestCreativeRow.score)
          ? bestCreativeRow.score
          : 0;

      return {
        id: bestCreativeRow.id,
        name,
        aiScore,
        ctr: 0,
        conversions: 0,
      };
    })();

    const onboardingSteps = [
      {
        id: "connect-meta",
        title: "Connect Meta Ads account",
        description: "Link your Facebook Business account to import campaigns",
        completed: Boolean(connection),
        actionLabel: "Connect",
      },
      {
        id: "create-campaign",
        title: "Create your first campaign",
        description: "Launch a campaign to start getting results",
        completed: Boolean((campaignCount || 0) > 0),
        actionLabel: "Create",
      },
      {
        id: "generate-creatives",
        title: "Generate AI ad creatives",
        description: "Use AI to create high-performing ad variations",
        completed: Boolean(bestCreativeRow),
        actionLabel: "Generate",
      },
      {
        id: "enable-optimization",
        title: "Enable AI optimization rules",
        description: "Let AI automatically optimize your campaigns",
        completed: false,
        actionLabel: "Enable",
      },
    ];

    const completedSteps = onboardingSteps.filter((s) => s.completed).length;

    const warning = !connection
      ? "meta_not_connected"
      : points.length === 0
        ? "meta_no_data"
        : null;

    const payload = {
      kpis: {
        spend,
        revenue,
        roas: Number(roas.toFixed(2)),
        activeCampaigns: campaignCount || 0,
        spendChangePct: calcDelta(spend, prevSpend),
        revenueChangePct: calcDelta(revenue, prevRevenue),
        roasChangePct: calcDelta(roas, prevRoas),
      },
      timeseries: points,
      topCampaign: topCampaign
        ? {
            id: topCampaign.facebook_campaign_id || topCampaign.id,
            name: topCampaign.name,
            roas: safeNumber(topCampaign.roas),
            spend: safeNumber(topCampaign.spend),
            revenue: safeNumber(topCampaign.revenue),
          }
        : {
            id: "campaign-0",
            name: "No campaigns yet",
            roas: 0,
            spend: 0,
            revenue: 0,
          },
      bestCreative,
      onboarding: {
        completedSteps,
        totalSteps: onboardingSteps.length,
        steps: onboardingSteps,
      },
      warning,
    };

    setCachedOverview(cacheKey, payload);
    return okCached(payload);
  } catch (err) {
    captureException(err, { function: "overview" });
    return serverError(err?.message || "Failed to load overview");
  }
}
