import { getComparisons } from '@/lib/drive';
import SystemClient from './SystemClient';

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

    if (error) {
        return (
            <main className="container">
                <div className="card" style={{ borderColor: 'var(--status-critical)' }}>
                    <h3 style={{ color: 'var(--status-critical)' }}>Error</h3>
                    <p>{error}</p>
                </div>
            </main>
        );
    }

    return <SystemClient comparisons={comparisons} />;
}
