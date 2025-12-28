
/**
 * Helper to invoke the local Netlify OpenAI Proxy function
 * Replaces supabase.functions.invoke('openai-proxy')
 */
export async function invokeOpenAIProxy(payload: any): Promise<{ data: any; error: any }> {
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
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            // If parse fails, use text as error message or body
            data = { error: text || response.statusText };
        }

        if (!response.ok) {
            return {
                data: null,
                error: {
                    message: data.error || data.message || `Server error: ${response.status}`,
                    details: data
                }
            };
        }

        return { data, error: null };

    } catch (e: any) {
        return {
            data: null,
            error: { message: e.message || 'Network request failed' }
        };
    }
}
