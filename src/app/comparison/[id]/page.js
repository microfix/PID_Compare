import { getFolderDetails, getFileText } from '@/lib/drive';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Viewer from './viewer'; // Client component for split view

export const dynamic = 'force-dynamic';

export default async function ComparisonPage({ params }) {
    const { id } = params;
    let files = [];
    let error = null;
    let htmlContent = '';
    let pdfs = [];

    try {
        files = await getFolderDetails(id);

        // identify files
        const htmlFile = files.find(f => f.mimeType === 'text/html' || f.name.endsWith('.html'));
        pdfs = files.filter(f => f.mimeType === 'application/pdf' || f.name.endsWith('.pdf'));

        if (htmlFile) {
            let rawHtml = await getFileText(htmlFile.id);

            // 1. First Pass: Check for escaped HTML entities which is common in wrappers
            if (rawHtml.includes('&lt;!DOCTYPE html')) {
                // Simple entity decoder
                rawHtml = rawHtml
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&amp;/g, '&');
            }

            // 2. Smart Extraction: Find <!DOCTYPE html> ... </html>
            // Case insensitive search for the start
            const startRegex = /<!DOCTYPE html>/i;
            const startMatch = rawHtml.match(startRegex);
            const endMarker = '</html>';

            if (startMatch) {
                const startIndex = startMatch.index;
                const endIndex = rawHtml.lastIndexOf(endMarker);

                if (endIndex !== -1 && endIndex > startIndex) {
                    // Extract strictly
                    htmlContent = rawHtml.substring(startIndex, endIndex + endMarker.length);
                } else {
                    // Fallback: Take everything from start marker
                    htmlContent = rawHtml.substring(startIndex);
                }
            } else {
                console.error("HTML Extraction Failed: Could not find <!DOCTYPE html> marker");
                console.error("Raw Content Preview (First 500 chars):", rawHtml.substring(0, 500));

                // Fallback: Try to render as is, but it's likely broken wrapped content
                htmlContent = rawHtml;
            }
        }

    } catch (e) {
        console.error(e);
        error = "Failed to load comparison details.";
    }

    if (error) {
        return (
            <div className="container">
                <div className="card" style={{ borderColor: 'var(--status-critical)' }}>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <Link href="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Back to Archive</Link>
                </div>
            </div>
        );
    }

    // Sort PDFs by name to try and guess v1 vs v2 (or use Date)
    pdfs.sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="comparison-layout" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <header className="flex-between" style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Comparison Review</h2>
                </div>
                <div>
                    {/* Add actions if needed */}
                </div>
            </header>

            <Viewer htmlContent={htmlContent} pdfs={pdfs} />
        </div>
    );
}
