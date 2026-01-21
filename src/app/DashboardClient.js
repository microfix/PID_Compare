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
                <div className="border border-dashed border-[#333] p-12 rounded-sm text-center">
                    <p className="text-[#666] font-mono uppercase tracking-widest text-sm">
                        {searchTerm ? `No Intelligence Found for '${searchTerm}'` : "Archive Empty"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredItems.map((folder) => {
                        const status = getStatus(folder);
                        const isCritical = status === 'critical';

                        return (
                            <Link href={`/plant/${folder.id}`} key={folder.id} className="block group relative">
                                <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-0 transition-all duration-300 group-hover:border-[#4B5320] h-full flex flex-col relative overflow-hidden">

                                    {/* Top Status Bar */}
                                    <div className={`h-1 w-full ${isCritical ? 'bg-[#8b0000]' : 'bg-[#4B5320]'} opacity-50 group-hover:opacity-100 transition-opacity`}></div>

                                    <div className="p-6 flex flex-col h-full relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`
                                                px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] border
                                                ${isCritical
                                                    ? 'border-[#8b0000] text-[#8b0000] bg-[#8b0000]/5'
                                                    : 'border-[#4B5320] text-[#4B5320] bg-[#4B5320]/5'}
                                            `}>
                                                {isCritical ? 'CRITICAL' : 'SECURE'}
                                            </div>
                                            <span className="text-[#444] text-[10px] font-mono flex items-center group-hover:text-[#666] transition-colors uppercase tracking-wider">
                                                <Clock size={10} className="mr-2" />
                                                {new Date(folder.createdTime).toLocaleDateString('en-GB')}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl text-[#e2e2e2] mb-auto font-heading leading-tight group-hover:text-white transition-colors">
                                            {folder.name.replace(/\.[^/.]+$/, "")}
                                        </h3>

                                        <div className="mt-8 pt-4 border-t border-[#1f1f1f] flex justify-between items-center group-hover:border-[#4B5320]/30 transition-colors">
                                            <span className="text-[10px] text-[#444] uppercase tracking-[0.15em] font-bold group-hover:text-[#4B5320] transition-colors">
                                                Access Report
                                            </span>
                                            <div className="w-6 h-6 flex items-center justify-center border border-[#333] group-hover:border-[#4B5320] group-hover:bg-[#4B5320] transition-all">
                                                <FileText size={12} className="text-[#666] group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decorative Background Grid */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(10,10,10,0)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,10,0)_1px,transparent_1px)] bg-[size:20px_20px] [background-position:center] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
