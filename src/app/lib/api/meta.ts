import { apiClient } from "../../utils/apiClient";

export type MetaConnection = {
  id: string;
  user_id: string;
  facebook_user_id?: string | null;
  full_name?: string | null;
  profile_picture?: string | null;
  ad_account_id?: string | null;
  page_id?: string | null;
  is_active?: boolean | null;
  connected_at?: string | null;
  last_sync_at?: string | null;
  meta?: unknown;
};

export async function getMetaStatus() {
  return apiClient.get<{ connected: boolean; connection: MetaConnection | null }>(
    "/api/meta-status"
  );
}

export async function getMetaAuthUrl() {
  return apiClient.get<{ url: string }>("/api/meta-auth-url");
}

export async function connectMeta(params?: { accessToken?: string; adAccountId?: string; pageId?: string }) {
  return apiClient.post<{ connected: boolean; connection: MetaConnection }>(
    "/api/meta-connect",
    params || {}
  );
}

export async function disconnectMeta() {
  return apiClient.post<{ connected: boolean }>("/api/meta-disconnect");
}

export async function syncMeta(range: "7d" | "30d" | "90d" = "30d") {
  return apiClient.post<{ ok: boolean; campaigns: number; daily: number }>(
    "/api/meta-sync",
    { range }
  );
}

export async function fetchMetaCampaigns() {
  return apiClient.get<{
    campaigns: Array<{
      id: string;
      name: string;
      status: string;
      strategyId?: string | null;
      spend: number;
      revenue: number;
      roas: number;
      ctr: number;
      conversions: number;
      impressions: number;
      clicks: number;
    }>;
  }>("/api/meta-campaigns");
}

export type MetaApplyAction =
  | "pause"
  | "resume"
  | "delete"
  | "duplicate"
  | "increase"
  | "decrease";

export async function applyMetaAction(params: {
  campaignId: string;
  action: MetaApplyAction;
  scalePct?: number;
}) {
  return apiClient.post<{
    ok: boolean;
    action: MetaApplyAction;
    campaignId: string;
    budgetField?: string;
    previous?: number;
    next?: number;
    resultId?: string | null;
    success?: boolean;
  }>("/api/meta-apply-action", params);
}
