'use client';

import Link from 'next/link';
import { FileText, Upload, Clock } from 'lucide-react';
import NewComparisonButton from '@/app/components/NewComparisonButton';
import SearchFilterBar, { useSearchAndSort } from '@/app/components/SearchFilterBar';

export default function DashboardClient({ folders }) {
    const { searchTerm, setSearchTerm, sortOption, setSortOption, filteredItems } = useSearchAndSort(folders, 'newest');

    const getStatus = (folder) => {
        if (folder.name.toUpperCase().includes('CRITICAL')) return 'critical';
        return 'safe';
    };

    return (
        <main className="container">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <h1 className="title" style={{ marginBottom: 0 }}>Archive</h1>
                <NewComparisonButton />
            </div>

            <SearchFilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortOption={sortOption}
                setSortOption={setSortOption}
                placeholder="Search plants..."
            />

            {filteredItems.length === 0 ? (
                <div className="card">
                    <p>{searchTerm ? `Ingen resultater fundet for '${searchTerm}'` : "No comparisons found in archive."}</p>
                </div>
            ) : (
                <div className="grid">
                    {filteredItems.map((folder) => {
                        const status = getStatus(folder);
                        return (
                            <Link href={`/plant/${folder.id}`} key={folder.id} className="card-link">
                                <div className="card">
                                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                        <div className={`status-badge ${status === 'critical' ? 'status-critical' : 'status-safe'}`}>
                                            {status === 'critical' ? 'Critical' : 'Safe'}
                                        </div>
                                        <span className="text-muted" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                                            <Clock size={14} style={{ marginRight: '4px' }} />
                                            {new Date(folder.createdTime).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3>{folder.name.replace(/\.[^/.]+$/, "")}</h3>
                                    <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        View Comparison Report &rarr;
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
