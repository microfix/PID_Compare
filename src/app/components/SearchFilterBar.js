'use client';

import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, X } from 'lucide-react';

export function useSearchAndSort(initialItems, defaultSort = 'newest') {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState(defaultSort);

    const filteredItems = useMemo(() => {
        let result = [...initialItems];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(item => {
                const nameMatch = item.name && item.name.toLowerCase().includes(lowerTerm);
                const revAMatch = item.revA && item.revA.toLowerCase().includes(lowerTerm);
                const revBMatch = item.revB && item.revB.toLowerCase().includes(lowerTerm);
                return nameMatch || revAMatch || revBMatch;
            });
        }

        result.sort((a, b) => {
            // Strip extension for sorting to match display
            const cleanName = (str) => str ? str.replace(/\.[^/.]+$/, "") : '';
            let valA = cleanName(a.name);
            let valB = cleanName(b.name);

            let dateA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
            let dateB = b.createdTime ? new Date(b.createdTime).getTime() : 0;

            const smartSort = (strA, strB) => {
                return strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
            };

            switch (sortOption) {
                case 'a-z':
                    return smartSort(valA, valB);
                case 'z-a':
                    return smartSort(valB, valA);
                case 'newest':
                    if (dateA && dateB && dateA !== dateB) return dateB - dateA;
                    // Fallback to numeric desc for revisions (e.g. 005 before 004)
                    return smartSort(valB, valA);
                case 'oldest':
                    if (dateA && dateB && dateA !== dateB) return dateA - dateB;
                    return smartSort(valA, valB);
                default:
                    return 0;
            }
        });

        return result;
    }, [initialItems, searchTerm, sortOption]);

    return {
        searchTerm,
        setSearchTerm,
        sortOption,
        setSortOption,
        filteredItems
    };
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
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 pt-2 pb-2">
            {/* Search Bar - Minimalist Underline */}
            <div className="relative flex-1 w-full sm:max-w-md group">
                <Search
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 text-[#4B3D21] transition-colors"
                    size={20}
                />
                <input
                    type="text"
                    className="w-full bg-transparent border-b-2 border-[#4B5320]/40 py-2 pl-8 pr-8 text-white font-bold placeholder-zinc-600 focus:outline-none focus:border-[#4B5320] transition-all duration-300"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 text-[#4B3D21] hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Sort Menu - Sleek Text Trigger */}
            <div className="relative ml-auto sm:ml-0">
                <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-3 text-right hover:opacity-80 transition-opacity"
                >
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B3D21]">Sort By</span>
                        <span className="text-sm font-bold text-white uppercase tracking-wide">{sortLabels[sortOption]}</span>
                    </div>
                    <div className="h-8 w-8 flex items-center justify-center bg-transparent">
                        <ArrowUpDown className="text-[#4B5320]" size={20} />
                    </div>
                </button>

                {showSortMenu && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)}></div>
                        <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-[#333] shadow-2xl z-20">
                            {Object.keys(sortLabels).map(key => (
                                <button
                                    key={key}
                                    className={`w-full text-right px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all
                                        ${sortOption === key
                                            ? 'text-[#4B5320] underline decoration-2 underline-offset-4'
                                            : 'text-zinc-500 hover:text-white hover:bg-[#1a1a1a]'
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
