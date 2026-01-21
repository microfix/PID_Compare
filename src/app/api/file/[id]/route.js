import { getFileStream, getDriveClient } from '@/lib/drive';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    // Await params for Next.js 15+ compatibility
    const { id } = await params;

    // TODO: Integrate Firebase Auth check here.
    // Verify 'Authorization' header contains valid Firebase ID Token before serving file.
    // const authHeader = request.headers.get('Authorization');
    // if (!authHeader) return new NextResponse("Unauthorized", { status: 401 });

    try {
        console.log(`Streaming file ID: ${id}`);

        // 1. Get File Metadata to confirm it exists and gets MIME type (Optional but good)
        // For speed, we just assume PDF if usage is strict, but let's try to be safe.
        // const meta = await drive.files.get({ fileId: id, fields: 'mimeType, size' });

        // 2. Get the stream
        const stream = await getFileStream(id);

        // 3. Return as stream with PDF headers
        // Using standard Response (Node/Web) which Next.js supports for streaming
        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline', // Opens in browser/iframe instead of download
                'Cache-Control': 'public, max-age=3600'
            }
        });

    } catch (e) {
        console.error("PDF Stream Error:", e.message);
        return new NextResponse("File not found or inaccessible", { status: 404 });
    }
}
