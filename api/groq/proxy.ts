import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Extract the path from the URL
    // Handling both /api/groq/path and the query parameter fallback
    const urlPath = req.url?.split('?')[0] || '';
    const path = urlPath.replace(/^\/api\/groq\/?/, '') || '';

    // Construct the target URL for Groq API
    const groqApiUrl = `https://api.groq.com/${path}`;

    console.log(`[Vercel Proxy] Forwarding ${req.method} ${urlPath} to ${groqApiUrl}`);

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: 'GROQ_API_KEY is not configured in Vercel environment variables.'
        });
    }

    try {
        // Collect headers from original request that might be useful
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        };

        // Forward the request to Groq API
        const response = await fetch(groqApiUrl, {
            method: req.method,
            headers: headers,
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Vercel Proxy Error:', error);
        return res.status(500).json({
            error: 'Failed to proxy request to Groq',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
