'use client';

import { useState } from 'react';
import { Search, ArrowUpDown, X } from 'lucide-react';

export function useSearchAndSort(initialItems, defaultSort = 'newest') {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState(defaultSort);

    // Filter logic remains the same (smart numeric sort)
    const filteredItems = initialItems.filter(item => { // Quick filter for memo check, actual memo in real app
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return (
            (item.name && item.name.toLowerCase().includes(lowerTerm)) ||
            (item.revA && item.revA.toLowerCase().includes(lowerTerm)) ||
            (item.revB && item.revB.toLowerCase().includes(lowerTerm))
        );
    }).sort((a, b) => {
        const cleanName = (str) => str ? str.replace(/\.[^/.]+$/, "") : '';
        let valA = cleanName(a.name);
        let valB = cleanName(b.name);

        // Smart numeric sort helper
        const smartSort = (strA, strB) => {
            return strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
        };

        const dateA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
        const dateB = b.createdTime ? new Date(b.createdTime).getTime() : 0;

        switch (sortOption) {
            case 'a-z': return smartSort(valA, valB);
            case 'z-a': return smartSort(valB, valA);
            case 'newest':
                if (dateA && dateB && dateA !== dateB) return dateB - dateA;
                return smartSort(valB, valA); // Numeric Desc
            case 'oldest':
                if (dateA && dateB && dateA !== dateB) return dateA - dateB;
                return smartSort(valA, valB); // Numeric Asc
            default: return 0;
        }
    });

    return { searchTerm, setSearchTerm, sortOption, setSortOption, filteredItems };
}

export default function SearchFilterBar({ searchTerm, setSearchTerm, sortOption, setSortOption, placeholder = "Search..." }) {
    const [showSortMenu, setShowSortMenu] = useState(false);

    const sortLabels = {
        'newest': 'Newest',
        'oldest': 'Oldest',
        'a-z': 'Name (A-Z)',
        'z-a': 'Name (Z-A)'
    };

    return (
        <div className="search-filter-container-v2 flex items-end justify-between gap-6 pb-6 pt-4 border-b border-[#333]/50 mb-8">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-lg group">
                <Search
                    className="absolute left-0 bottom-3 text-[#4B3D21] transition-colors"
                    size={22}
                    strokeWidth={2.5}
                />
                <input
                    type="text"
                    className="appearance-none w-full bg-transparent border-b-2 border-[#4B5320]/40 py-2 pl-8 pr-10 text-white font-bold text-lg placeholder-zinc-600 focus:outline-none focus:border-[#4B5320] transition-all duration-200"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-0 bottom-3 text-[#4B3D21] hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Sort Controls */}
            <div className="relative flex-shrink-0">
                <button
                    type="button"
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-3 group focus:outline-none"
                >
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] uppercase tracking-widest font-black text-[#4B3D21] mb-0.5">Sort By</span>
                        <span className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-zinc-300 transition-colors">
                            {sortLabels[sortOption]}
                        </span>
                    </div>
                    {/* Icon Container */}
                    <div className="h-10 w-10 flex items-center justify-center border border-transparent rounded bg-transparent group-hover:bg-[#111] transition-colors">
                        <ArrowUpDown className="text-[#4B5320]" size={20} strokeWidth={2} />
                    </div>
                </button>

                {/* Dropdown Menu */}
                {showSortMenu && (
                    <>
                        <div className="fixed inset-0 z-20 cursor-default" onClick={() => setShowSortMenu(false)}></div>
                        <div className="absolute right-0 mt-2 w-56 bg-[#0a0a0a] border border-[#333] shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-30 flex flex-col p-1 rounded-sm service-dropdown">
                            {Object.keys(sortLabels).map(key => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`w-full text-right px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all
                                        ${sortOption === key
                                            ? 'text-[#4B5320] underline decoration-2 underline-offset-4'
                                            : 'text-zinc-500 hover:text-white hover:bg-[#111]'
                                        }`}
                                    onClick={() => { setSortOption(key); setShowSortMenu(false); }}
                                >
                                    {sortLabels[key]}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
