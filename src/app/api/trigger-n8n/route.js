import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { folderId, folderName, timestamp } = body;

        const webhookUrl = 'https://n8n.microfix.dk/webhook/774b9b23-c779-46cf-afa0-50c2744c2af1';

        // Log trigger (server side)
        console.log(`Triggering n8n webhook for folder: ${folderId}`);

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                folderId,
                folderName,
                timestamp: timestamp || new Date().toISOString()
            })
        });

        if (!response.ok) {
            console.error(`n8n webhook failed with status: ${response.status}`);
            return NextResponse.json({ error: 'Failed to contact n8n' }, { status: response.status });
        }

        const data = await response.text(); // n8n might return text or json
        return NextResponse.json({ success: true, n8nResponse: data });

    } catch (e) {
        console.error('Proxy Error /api/trigger-n8n:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
