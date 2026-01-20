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
            const rawHtml = await getFileText(htmlFile.id);
            // Clean up n8n metadata wrapper if present
            // We search for the standard HTML5 doctype and the closing html tag.
            const startMarker = '<!DOCTYPE html>';
            const endMarker = '</html>';

            const startIndex = rawHtml.indexOf(startMarker);
            const endIndex = rawHtml.lastIndexOf(endMarker);

            if (startIndex !== -1) {
                if (endIndex !== -1 && endIndex > startIndex) {
                    // Extract strictly from DOCTYPE to </html>
                    htmlContent = rawHtml.substring(startIndex, endIndex + endMarker.length);
                } else {
                    // Fallback: If no closing tag, take everything from start marker
                    htmlContent = rawHtml.substring(startIndex);
                }
            } else {
                // If no doctype found, use as is (or handle as error if strict)
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
