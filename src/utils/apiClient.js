import { emitToast } from './toastBus';
import { logger } from './logger';

const RETRY_STATUSES = [502, 503];
const DEFAULT_TIMEOUT = 15000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    timeoutMs = DEFAULT_TIMEOUT,
    retries = 2,
    retryDelayMs = 300
  } = options;

  if (!path.startsWith('/')) {
    throw new Error('apiRequest path must start with "/"');
  }

  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timer);

      let data = null;
      let text = '';

      try {
        text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || text || 'Request failed';
        const error = new Error(errorMessage);
        error.status = response.status;

        if (RETRY_STATUSES.includes(response.status) && attempt < retries) {
          await sleep(retryDelayMs * (attempt + 1));
          attempt += 1;
          lastError = error;
          continue;
        }

        emitToast({
          type: 'error',
          title: 'Aktion fehlgeschlagen',
          description: errorMessage
        });

        throw error;
      }

      return data;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;

      const isAbort = err?.name === 'AbortError';
      const shouldRetry =
        !isAbort &&
        (RETRY_STATUSES.includes(err?.status) || err?.status === undefined) &&
        attempt < retries;

      if (shouldRetry) {
        await sleep(retryDelayMs * (attempt + 1));
        attempt += 1;
        continue;
      }

      if (import.meta?.env?.DEV && isAbort) {
        logger.warn('[apiClient] request aborted', { path, method });
      }

      throw err;
    }
  }

  throw lastError || new Error('Request failed');
}

export const apiClient = {
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => apiRequest(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' })
};

export default apiClient;
