
import { supabase } from '../supabaseClient';

interface OpenAIProxyError {
    message: string;
    details?: unknown;
}

/** OpenAI API Response */
interface OpenAIResponse<T = unknown> {
    data: T | null;
    error: OpenAIProxyError | null;
}

/** OpenAI Proxy Payload */
interface OpenAIProxyPayload {
    endpoint?: string;
    processParams?: {
        imageUrl: string;
        productName?: string;
    };
    [key: string]: unknown;
}

interface InvokeOptions {
    signal?: AbortSignal;
}

/**
 * Helper to invoke the local Netlify OpenAI Proxy function
 * Replaces supabase.functions.invoke('openai-proxy')
 */
export async function invokeOpenAIProxy<T = unknown>(
    payload: OpenAIProxyPayload,
    options?: InvokeOptions
): Promise<OpenAIResponse<T>> {
    try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch('/api/openai-proxy', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal: options?.signal
        });

        // Handle non-JSON responses (e.g. 500 html pages) safely
        const text = await response.text();
        let data: unknown;
        try {
            data = JSON.parse(text);
        } catch (_e) {
            // If parse fails, use text as error message or body
            data = { error: text || response.statusText };
        }

        if (!response.ok) {
            const errorData = data as Record<string, unknown>;
            return {
                data: null,
                error: {
                    message: (errorData.error as string) || (errorData.message as string) || `Server error: ${response.status}`,
                    details: data
                }
            };
        }

        return { data: data as T, error: null };

    } catch (e) {
        const error = e as Error;
        return {
            data: null,
            error: { message: error.message || 'Network request failed' }
        };
    }
}
