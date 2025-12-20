import {
  ok,
  badRequest,
  serverError,
  methodNotAllowed,
  withCors,
} from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { supabaseAdmin } from "./_shared/clients.js";
import { formatDate } from "./_shared/meta.js";

function parseRange(range) {
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  if (range === "90d") return 90;
  return 30;
}

function safeNumber(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function computeSummary(rows) {
  const totals = rows.reduce(
    (acc, row) => {
      acc.impressions += safeNumber(row.impressions);
      acc.clicks += safeNumber(row.clicks);
      acc.spend += safeNumber(row.spend);
      acc.revenue += safeNumber(row.revenue);
      acc.conversions += safeNumber(row.conversions);
      return acc;
    },
    { impressions: 0, clicks: 0, spend: 0, revenue: 0, conversions: 0 }
  );

  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;
  const cpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;

  return {
    ...totals,
    ctr: Number(ctr.toFixed(2)),
    roas: Number(roas.toFixed(2)),
    cpa: Number(cpa.toFixed(2)),
  };
}

function calcDelta(current, previous) {
  if (!previous || previous === 0) return undefined;
  return (current - previous) / previous;
}

function isMissingRelation(error, relation) {
  const msg = error?.message || "";
  return msg.includes("relation") && msg.includes(relation);
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });
  if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
    return methodNotAllowed("GET,POST,OPTIONS");
  }

  initTelemetry();

  const auth = await requireUserId(event);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  if (event.httpMethod === "POST") {
    let payload = {};
    try {
      payload = event.body ? JSON.parse(event.body) : {};
    } catch (err) {
      return badRequest("Invalid JSON body");
    }

    const name = payload?.name;
    if (!name) {
      return badRequest("Missing event name");
    }

    try {
      const { error } = await supabaseAdmin.from("analytics_events").insert({
        user_id: userId,
        event_name: name,
        properties: payload?.properties || null,
      });

      if (error) {
        return serverError(`Failed to store event: ${error.message}`);
      }

      return ok({ received: true });
    } catch (err) {
      captureException(err, { function: "analytics", stage: "insert" });
      return serverError(err?.message || "Failed to store event");
    }
  }

  const range = event.queryStringParameters?.range || "30d";
  const compare = event.queryStringParameters?.compare === "1";
  const days = parseRange(range);

  const today = new Date();
  const currentStart = new Date();
  currentStart.setDate(today.getDate() - (days - 1));

  const prevEnd = new Date(currentStart);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - (days - 1));

  try {
    const { data: currentRows, error: currentError } = await supabaseAdmin
      .from("meta_insights_daily")
      .select("date,impressions,clicks,spend,revenue,conversions,ctr,roas,cpa")
      .eq("user_id", userId)
      .gte("date", formatDate(currentStart))
      .lte("date", formatDate(today))
      .order("date", { ascending: true });

    if (currentError) {
      if (isMissingRelation(currentError, "meta_insights_daily")) {
        return ok({
          range,
          compare,
          granularity: "day",
          summary: {
            impressions: 0,
            clicks: 0,
            spend: 0,
            revenue: 0,
            conversions: 0,
            ctr: 0,
            roas: 0,
            cpa: 0,
          },
          timeseries: { current: [], previous: compare ? [] : undefined },
          campaigns: [],
          warning: "meta_insights_daily_missing",
        });
      }
      return serverError(`Failed to load analytics: ${currentError.message}`);
    }

    let previousRows = [];
    if (compare) {
      const { data: prevData, error: prevError } = await supabaseAdmin
        .from("meta_insights_daily")
        .select("date,impressions,clicks,spend,revenue,conversions,ctr,roas,cpa")
        .eq("user_id", userId)
        .gte("date", formatDate(prevStart))
        .lte("date", formatDate(prevEnd))
        .order("date", { ascending: true });

      if (prevError) {
        return serverError(`Failed to load comparison data: ${prevError.message}`);
      }
      previousRows = prevData || [];
    }

    const summary = computeSummary(currentRows || []);
    const summaryPrev = compare ? computeSummary(previousRows || []) : null;
    const deltas = summaryPrev
      ? {
          impressions: calcDelta(summary.impressions, summaryPrev.impressions),
          clicks: calcDelta(summary.clicks, summaryPrev.clicks),
          spend: calcDelta(summary.spend, summaryPrev.spend),
          revenue: calcDelta(summary.revenue, summaryPrev.revenue),
          conversions: calcDelta(summary.conversions, summaryPrev.conversions),
          ctr: calcDelta(summary.ctr, summaryPrev.ctr),
          roas: calcDelta(summary.roas, summaryPrev.roas),
          cpa: calcDelta(summary.cpa, summaryPrev.cpa),
        }
      : undefined;

    const timeseries = {
      current: (currentRows || []).map((row) => {
        const spend = safeNumber(row.spend);
        const revenue = safeNumber(row.revenue);
        const conversions = safeNumber(row.conversions);
        return {
          ts: row.date,
          impressions: safeNumber(row.impressions),
          clicks: safeNumber(row.clicks),
          spend,
          revenue,
          conversions,
          ctr: safeNumber(row.ctr),
          roas: safeNumber(row.roas) || (spend > 0 ? revenue / spend : 0),
          cpa: safeNumber(row.cpa) || (conversions > 0 ? spend / conversions : 0),
        };
      }),
      previous: compare
        ? (previousRows || []).map((row) => {
            const spend = safeNumber(row.spend);
            const revenue = safeNumber(row.revenue);
            const conversions = safeNumber(row.conversions);
            return {
              ts: row.date,
              impressions: safeNumber(row.impressions),
              clicks: safeNumber(row.clicks),
              spend,
              revenue,
              conversions,
              ctr: safeNumber(row.ctr),
              roas: safeNumber(row.roas) || (spend > 0 ? revenue / spend : 0),
              cpa: safeNumber(row.cpa) || (conversions > 0 ? spend / conversions : 0),
            };
          })
        : undefined,
    };

    const { data: campaignsData } = await supabaseAdmin
      .from("meta_campaigns")
      .select("facebook_campaign_id,name,status,spend,revenue,roas,ctr,conversions,impressions,clicks")
      .eq("user_id", userId)
      .order("spend", { ascending: false })
      .limit(50);

    const campaigns = (campaignsData || []).map((row) => ({
      id: row.facebook_campaign_id,
      name: row.name,
      status: row.status || "active",
      spend: safeNumber(row.spend),
      revenue: safeNumber(row.revenue),
      roas: safeNumber(row.roas),
      ctr: safeNumber(row.ctr),
      conversions: safeNumber(row.conversions),
      impressions: safeNumber(row.impressions),
      clicks: safeNumber(row.clicks),
    }));

    return ok({
      range,
      compare,
      granularity: "day",
      summary: { ...summary, deltas },
      timeseries,
      campaigns,
    });
  } catch (err) {
    captureException(err, { function: "analytics" });
    return serverError(err?.message || "Failed to load analytics");
  }
}
