import { supabase } from '../lib/supabaseClient';

const RETRY_STATUSES = [502, 503];
const DEFAULT_TIMEOUT = 15000;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Track whether a session refresh is already in-flight (dedup) */
let refreshInFlight: Promise<string | null> | null = null;

async function getBearerToken() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? `Bearer ${token}` : null;
}

/** Refresh the Supabase session and return the new token (or null). */
async function refreshSession(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session?.access_token) return null;
      return `Bearer ${data.session.access_token}`;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    timeoutMs?: number;
    retries?: number;
    retryDelayMs?: number;
    auth?: boolean;
    /** Internal flag — prevents infinite 401 refresh loops */
    _isRetryAfterRefresh?: boolean;
  } = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeoutMs = DEFAULT_TIMEOUT,
    retries = 2,
    retryDelayMs = 300,
    auth = true,
    _isRetryAfterRefresh = false
  } = options;

  if (!path.startsWith('/')) {
    throw new Error('apiRequest path must start with "/"');
  }

  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const authHeader = auth ? await getBearerToken() : null;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
          ...headers
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timer);

      const text = await response.text();
      const data = text ? (JSON.parse(text) as unknown) : null;

      if (!response.ok) {
        const payload = data && typeof data === 'object'
          ? (data as { error?: string; message?: string })
          : null;
        const errorMessage =
          payload?.error || payload?.message || text || 'Request failed';
        const error = new Error(errorMessage) as Error & { status?: number };
        error.status = response.status;

        // ── 401: try refreshing the session once ──────────
        if (response.status === 401 && auth && !_isRetryAfterRefresh) {
          const newToken = await refreshSession();
          if (newToken) {
            // Retry with fresh token
            return apiRequest<T>(path, {
              ...options,
              _isRetryAfterRefresh: true,
            });
          }
          // Refresh failed — throw without extra retries
          throw error;
        }

        if (RETRY_STATUSES.includes(response.status) && attempt < retries) {
          await sleep(retryDelayMs * (attempt + 1));
          attempt += 1;
          lastError = error;
          continue;
        }

        throw error;
      }

      return data as T;
    } catch (err: unknown) {
      clearTimeout(timer);
      lastError = err;

      const typedErr = err as { name?: string; status?: number };
      const isAbort = typedErr?.name === 'AbortError';
      const shouldRetry =
        !isAbort &&
        (RETRY_STATUSES.includes(typedErr?.status ?? 0) || typedErr?.status === undefined) &&
        attempt < retries;

      if (shouldRetry) {
        await sleep(retryDelayMs * (attempt + 1));
        attempt += 1;
        continue;
      }

      throw err;
    }
  }

  throw lastError || new Error('Request failed');
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<Parameters<typeof apiRequest<T>>[1], 'method'>) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<Parameters<typeof apiRequest<T>>[1], 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<Parameters<typeof apiRequest<T>>[1], 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<Parameters<typeof apiRequest<T>>[1], 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Omit<Parameters<typeof apiRequest<T>>[1], 'method'>) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' })
};
