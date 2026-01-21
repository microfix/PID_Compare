import { getComparisons } from '@/lib/drive';
import Link from 'next/link';
import { ArrowLeft, FileText, FileDiff } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SystemPage({ params }) {
    const { id } = await params;
    let comparisons = [];
    let error = null;

    try {
        const data = await getComparisons(id);
        comparisons = data.comparisons;
    } catch (e) {
        console.error("Failed to fetch system details", e);
        error = "Could not load comparisons.";
    }

    return (
        <main className="container">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* We don't easily know the parent ID to go back to Plant, 
                so using router.back() client-side is often better, 
                or just back to root "/" for now since we don't track breadcrumbs. 
                Improvement: Pass plantId in query param or use History.
            */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={24} />
                        <span style={{ marginLeft: '0.5rem' }}>Back to Root</span>
                    </Link>
                    <h1 className="title" style={{ marginBottom: 0 }}>Select Comparison</h1>
                </div>
            </div>

            {error ? (
                <div className="card" style={{ borderColor: 'var(--status-critical)' }}>
                    <h3 style={{ color: 'var(--status-critical)' }}>Error</h3>
                    <p>{error}</p>
                </div>
            ) : comparisons.length === 0 ? (
                <div className="card">
                    <p>No valid comparisons found in this system.</p>
                </div>
            ) : (
                <div className="grid">
                    {comparisons.map((comp) => {
                        const isValid = comp.pdfA && comp.pdfB;
                        return (
                            <Link
                                href={isValid ? `/view/${comp.id}?left=${comp.pdfA.id}&right=${comp.pdfB.id}` : '#'}
                                key={comp.id}
                                className={`card-link ${!isValid ? 'disabled' : ''}`}
                                style={!isValid ? { pointerEvents: 'none', opacity: 0.6 } : {}}
                            >
                                <div className="card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <FileDiff size={24} style={{ color: 'var(--accent-green)' }} />
                                        <h3>{comp.revA} ↔ {comp.revB}</h3>
                                    </div>
                                    <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                        {comp.name}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        {isValid ? 'Ready to view' : 'Missing PDFs'}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
