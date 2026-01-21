'use client';

import Link from 'next/link';
import { ArrowLeft, Folder } from 'lucide-react';
import SearchFilterBar, { useSearchAndSort } from '@/app/components/SearchFilterBar';

export default function PlantClient({ folders }) {
    const { searchTerm, setSearchTerm, sortOption, setSortOption, filteredItems } = useSearchAndSort(folders, 'a-z'); // Default sort A-Z for documents? Or Newest? User said Default Newest for "Comparisons".

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

            <SearchFilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortOption={sortOption}
                setSortOption={setSortOption}
                placeholder="Search documents..."
            />

            {filteredItems.length === 0 ? (
                <div className="card">
                    <p>{searchTerm ? `Ingen resultater fundet for '${searchTerm}'` : "No document folders found."}</p>
                </div>
            ) : (
                <div className="grid">
                    {filteredItems.map((folder) => (
                        <Link href={`/system/${folder.id}`} key={folder.id} className="card-link">
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <Folder size={24} style={{ color: 'var(--accent-blue)' }} />
                                    <h3>{folder.name.replace(/\.[^/.]+$/, "")}</h3>
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
