
/** OpenAI API Response */
interface OpenAIResponse {
    data: unknown;
    error: unknown;
}

/** OpenAI Proxy Payload */
interface OpenAIProxyPayload {
    endpoint: string;
    [key: string]: unknown;
}

/**
 * Helper to invoke the local Netlify OpenAI Proxy function
 * Replaces supabase.functions.invoke('openai-proxy')
 */
export async function invokeOpenAIProxy(payload: OpenAIProxyPayload): Promise<OpenAIResponse> {
    try {
        const response = await fetch('/api/openai-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
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

        return { data, error: null };

    } catch (e) {
        const error = e as Error;
        return {
            data: null,
            error: { message: error.message || 'Network request failed' }
        };
    }
}
