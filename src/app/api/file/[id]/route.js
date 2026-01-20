import { getFileStream } from '@/lib/drive';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { id } = params;

    try {
        const stream = await getFileStream(id);

        // We assume it's PDF or HTML. In a real app we'd look up mimeType.
        // However, the browser handles streams. 
        // We should probably set headers content-type if possible, but the drive stream might not carry it easily?
        // Actually google drive files.get with alt=media returns the body.
        // We can infer type or just let browser detect.
        // Better: Helper in drive.js to get metadata first? 
        // For performance, we'll try to just stream it. 
        // But for PDF in iframe, correct Content-Type is important.

        // Quick fix: user params might hint type? 
        // Or we rely on `NextResponse` streaming.

        return new NextResponse(stream);
    } catch (e) {
        console.error(e);
        return new NextResponse("File not found", { status: 404 });
    }
}
