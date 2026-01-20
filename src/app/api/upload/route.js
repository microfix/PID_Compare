import { uploadFileToInput } from '@/lib/drive';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files');

        if (files.length !== 2) {
            return NextResponse.json({ error: 'Please upload exactly two PDF files.' }, { status: 400 });
        }

        const savedFiles = [];

        // Upload both files to Drive Input Folder
        for (const file of files) {
            // Convert Blob to Buffer
            const buffer = Buffer.from(await file.arrayBuffer());
            const driveFile = await uploadFileToInput({
                name: file.name,
                buffer: buffer,
                type: file.type || 'application/pdf'
            });
            savedFiles.push(driveFile);
        }

        // Generate a Job ID for tracking
        const jobId = crypto.randomUUID();

        // Trigger n8n Webhook
        const n8nUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nUrl) {
            try {
                // Fire and forget (or await if n8n is fast)
                // We assume n8n starts the process.
                fetch(n8nUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobId: jobId,
                        files: savedFiles,
                        timestamp: new Date().toISOString()
                    })
                }).catch(err => console.error("N8N Webhook trigger error", err));
            } catch (err) {
                console.error("N8N Webhook setup error", err);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Files uploaded and analysis triggered.',
            jobId: jobId,
            files: savedFiles
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Upload failed', details: e.message }, { status: 500 });
    }
}
