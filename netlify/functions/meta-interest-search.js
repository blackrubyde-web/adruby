/**
 * meta-interest-search.js — Proxy for Meta's Interest Search API
 *
 * Searches Meta's adinterest taxonomy so the frontend can offer autocomplete
 * with real interest IDs (required for Meta targeting).
 *
 * GET /api/meta-interest-search?q=fitness
 * Returns: { results: [{ id: "6003...", name: "Fitness and wellness", ... }] }
 */

import { ok, badRequest, serverError, methodNotAllowed, withCors } from "./utils/response.js";
import { initTelemetry } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { fetchGraph, resolveMetaAccessToken } from "./_shared/meta.js";

export async function handler(event) {
    if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 204, body: "" });
    if (event.httpMethod !== "GET") return methodNotAllowed("GET,OPTIONS");

    initTelemetry();

    const auth = await requireUserId(event);
    if (!auth.ok) return auth.response;

    const query = event.queryStringParameters?.q?.trim();
    if (!query || query.length < 2) {
        return badRequest("Query parameter 'q' must be at least 2 characters");
    }

    try {
        const { token } = await resolveMetaAccessToken(auth.userId);
        if (!token) {
            return badRequest("Meta nicht verbunden. Bitte zuerst Meta verbinden.");
        }

        const response = await fetchGraph("/search", token, {
            type: "adinterest",
            q: query,
            limit: "15",
        });

        const results = (response?.data || []).map(item => ({
            id: item.id,
            name: item.name,
            audienceSize: item.audience_size || null,
            path: item.path || [],
            description: item.description || null,
            topic: item.topic || null,
        }));

        return ok({ results });
    } catch (err) {
        console.error("[InterestSearch] Error:", err?.message || err);
        return serverError(err?.message || "Interest search failed");
    }
}
