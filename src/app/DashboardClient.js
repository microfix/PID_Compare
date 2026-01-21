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
                <div className="bg-[#111] border border-[#333] p-6 rounded-sm">
                    <p className="text-zinc-400">{searchTerm ? `Ingen resultater fundet for '${searchTerm}'` : "No comparisons found in archive."}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((folder) => {
                        const status = getStatus(folder);
                        return (
                            <Link href={`/plant/${folder.id}`} key={folder.id} className="block group">
                                <div className="bg-[#111] border border-[#333] p-6 transition-all duration-200 group-hover:border-[#4B5320] relative h-full flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`
                                            px-2 py-1 text-xs font-bold font-mono tracking-wider uppercase
                                            ${status === 'critical' ? 'bg-[#8b0000] text-white' : 'bg-[#4B5320] text-white'}
                                        `}>
                                            {status === 'critical' ? 'Critical' : 'Safe'}
                                        </div>
                                        <span className="text-[#666] text-xs flex items-center font-mono group-hover:text-[#888] transition-colors">
                                            <Clock size={12} className="mr-1.5" />
                                            {new Date(folder.createdTime).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-auto tracking-tight">
                                        {folder.name.replace(/\.[^/.]+$/, "")}
                                    </h3>
                                    <div className="mt-6 text-sm text-[#4B3D21] font-bold group-hover:text-[#4B5320] transition-colors flex items-center">
                                        View Comparison Report <span className="ml-1 text-lg leading-none">&rarr;</span>
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
