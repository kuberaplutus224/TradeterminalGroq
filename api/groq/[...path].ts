import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Extract the path after /api/groq (e.g., chat/completions)
    const path = req.url?.replace(/^\/api\/groq\/?/, '') || '';
    const groqApiUrl = `https://api.groq.com/openai/v1/${path}`;

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: 'GROQ_API_KEY is not configured in Vercel environment variables.'
        });
    }

    try {
        // Forward the request to Groq API
        const response = await fetch(groqApiUrl, {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Vercel Proxy Error:', error);
        return res.status(500).json({ error: 'Failed to proxy request to Groq' });
    }
}
