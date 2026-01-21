import { getFileText } from '@/lib/drive';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TripleViewer from './TripleViewer';

export const dynamic = 'force-dynamic';

export default async function ViewPage({ params, searchParams }) {
    const { id } = await params; // HTML File ID
    const { left, right } = await searchParams; // PDF IDs

    let htmlContent = '';
    let error = null;

    try {
        if (!id) throw new Error("Missing HTML File ID");
        if (!left || !right) throw new Error("Missing PDF IDs for comparison");

        // Fetch HTML content directly
        htmlContent = await getFileText(id);

    } catch (e) {
        console.error("Failed to load viewer content", e);
        error = e.message || "Failed to load comparison.";
    }

    if (error) {
        return (
            <div className="container">
                <div className="card" style={{ borderColor: 'var(--status-critical)' }}>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <Link href="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <header className="flex-between" style={{ padding: '0.5rem 2rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Comparison Viewer</h2>
                </div>
                <div>
                    {/* Optional actions */}
                </div>
            </header>

            <TripleViewer htmlContent={htmlContent} leftPdfId={left} rightPdfId={right} />
        </div>
    );
}
