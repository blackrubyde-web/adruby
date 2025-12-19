import { supabaseAdmin } from "./clients.js";

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

function cleanParams(params) {
  const next = {};
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    next[key] = value;
  });
  return next;
}

export function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

export async function fetchGraph(path, accessToken, params = {}) {
  if (!accessToken) throw new Error("Missing Meta access token");
  const url = new URL(`${GRAPH_API_BASE}${path}`);
  const clean = cleanParams(params);
  Object.entries(clean).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  const json = await res.json();
  if (!res.ok) {
    const msg =
      json?.error?.message ||
      json?.error?.error_user_msg ||
      "Meta API request failed";
    const err = new Error(msg);
    err.data = json;
    throw err;
  }
  return json;
}

export async function postGraph(path, accessToken, params = {}) {
  if (!accessToken) throw new Error("Missing Meta access token");
  const url = new URL(`${GRAPH_API_BASE}${path}`);
  const body = new URLSearchParams();
  const clean = cleanParams(params);

  Object.entries(clean).forEach(([key, value]) => {
    body.set(key, String(value));
  });
  body.set("access_token", accessToken);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const json = await res.json();
  if (!res.ok) {
    const msg =
      json?.error?.message ||
      json?.error?.error_user_msg ||
      "Meta API request failed";
    const err = new Error(msg);
    err.data = json;
    throw err;
  }
  return json;
}

export async function getActiveMetaConnection(userId) {
  const { data, error } = await supabaseAdmin
    .from("facebook_connections")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

async function getTokenForConnection(connection) {
  if (!connection?.id) return null;

  try {
    const { data: tokenRow, error } = await supabaseAdmin
      .from("meta_tokens")
      .select("access_token")
      .eq("connection_id", connection.id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (tokenRow?.access_token) return tokenRow.access_token;
  } catch {
    if (connection.access_token) return connection.access_token;
  }

  if (connection.access_token) {
    await supabaseAdmin
      .from("meta_tokens")
      .upsert(
        {
          connection_id: connection.id,
          user_id: connection.user_id,
          access_token: connection.access_token,
          token_expires_at: connection.token_expires_at || null,
        },
        { onConflict: "connection_id" }
      );

    await supabaseAdmin
      .from("facebook_connections")
      .update({ access_token: null, updated_at: new Date().toISOString() })
      .eq("id", connection.id);

    return connection.access_token;
  }

  return null;
}

export async function resolveMetaAccessToken(userId) {
  let connection = null;
  try {
    connection = await getActiveMetaConnection(userId);
  } catch {
    connection = null;
  }

  let token = null;
  if (connection) {
    try {
      token = await getTokenForConnection(connection);
    } catch {
      token = null;
    }
  }

  if (!token) {
    token = process.env.META_ACCESS_TOKEN || null;
  }

  return { token, connection };
}

export function pickPrimaryAdAccount(adAccounts, preferredId) {
  if (!Array.isArray(adAccounts)) return null;
  if (preferredId) {
    const match = adAccounts.find((acc) => acc.id === preferredId || acc.account_id === preferredId);
    if (match) return match;
  }
  return adAccounts.find((acc) => String(acc.account_status) === "1") || adAccounts[0] || null;
}
