import { getComparisons } from '@/lib/drive';
import Link from 'next/link';
import { ArrowLeft, Folder } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PlantPage({ params }) {
    const { id } = await params;
    let folders = [];
    let error = null;

    try {
        const data = await getComparisons(id);
        folders = data.folders;
    } catch (e) {
        console.error("Failed to fetch plant details", e);
        error = "Could not load plant details.";
    }

    return (
        <main className="container">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="title" style={{ marginBottom: 0 }}>Select Document System</h1>
                </div>
            </div>

            {error ? (
                <div className="card" style={{ borderColor: 'var(--status-critical)' }}>
                    <h3 style={{ color: 'var(--status-critical)' }}>Error</h3>
                    <p>{error}</p>
                </div>
            ) : folders.length === 0 ? (
                <div className="card">
                    <p>No document folders found.</p>
                </div>
            ) : (
                <div className="grid">
                    {folders.map((folder) => (
                        <Link href={`/system/${folder.id}`} key={folder.id} className="card-link">
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <Folder size={24} style={{ color: 'var(--accent-blue)' }} />
                                    <h3>{folder.name}</h3>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    View Comparisons &rarr;
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
