'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

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
    const sortLabels = {
        'newest': 'Newest',
        'oldest': 'Oldest',
        'a-z': 'A-Z',
        'z-a': 'Z-A'
    };

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 pt-4 border-b border-[#333]/50 mb-8">
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

            {/* Sort Controls - Horizontal List */}
            <div className="flex items-center gap-6">
                <span className="text-xs uppercase tracking-widest font-black text-[#4B3D21] hidden md:block">Sort By</span>
                <div className="flex items-center gap-4">
                    {Object.entries(sortLabels).map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setSortOption(key)}
                            className={`
                                text-sm font-bold uppercase tracking-wide transition-all duration-200 pb-1
                                ${sortOption === key
                                    ? 'text-[#4B5320] border-b-2 border-[#4B5320]'
                                    : 'text-[#4B3D21] hover:text-white border-b-2 border-transparent'
                                }
                            `}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
