'use client';

import Link from 'next/link';
import { ArrowLeft, FileDiff } from 'lucide-react';
import SearchFilterBar, { useSearchAndSort } from '@/app/components/SearchFilterBar';

export default function SystemClient({ comparisons }) {
    // Default sort 'newest' (numeric desc)
    const { searchTerm, setSearchTerm, sortOption, setSortOption, filteredItems } = useSearchAndSort(comparisons, 'newest');

    return (
        <main className="container">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={24} />
                        <span style={{ marginLeft: '0.5rem' }}>Back to Root</span>
                    </Link>
                    <h1 className="title" style={{ marginBottom: 0 }}>Select Comparison</h1>
                </div>
            </div>

            <SearchFilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortOption={sortOption}
                setSortOption={setSortOption}
                placeholder="Search comparisons..."
            />

            {filteredItems.length === 0 ? (
                <div className="card">
                    <p>{searchTerm ? `Ingen resultater fundet for '${searchTerm}'` : "No valid comparisons found in this system."}</p>
                </div>
            ) : (
                <div className="grid">
                    {filteredItems.map((comp) => {
                        const isValid = comp.pdfA && comp.pdfB;
                        // Strip extension for display
                        const revA = comp.revA.replace(/\.[^/.]+$/, "");
                        const revB = comp.revB.replace(/\.[^/.]+$/, "");

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
                                        <h3>{revA} ↔ {revB}</h3>
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
