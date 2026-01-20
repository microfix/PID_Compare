import { NextResponse } from 'next/server';
import { progressStore } from '@/lib/progress';

export async function POST(request) {
    try {
        const body = await request.json();
        const { id, progress } = body;

        if (id) {
            progressStore.set(id, progress);
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const progress = progressStore.get(id) || 0;

    return NextResponse.json({ progress });
}
