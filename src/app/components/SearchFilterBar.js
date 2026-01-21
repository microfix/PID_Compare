'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

export function useSearchAndSort(initialItems, defaultSort = 'newest') {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState(defaultSort);

    // Filter logic remains the same (smart numeric sort)
    const filteredItems = initialItems.filter(item => {
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

export default function SearchFilterBar({ searchTerm, setSearchTerm, sortOption, setSortOption, placeholder = "Search plants..." }) {
    const [showSortMenu, setShowSortMenu] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSortMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const sortLabels = {
        'newest': 'Newest',
        'oldest': 'Oldest',
        'a-z': 'A-Z',
        'z-a': 'Z-A'
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 pt-4 mb-2">
            {/* Search Bar - Military Style */}
            <div className="relative flex-1 max-w-xl group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-zinc-400" size={20} strokeWidth={2} />
                </div>
                <input
                    type="text"
                    className="block w-full bg-transparent border border-[#4B5320] rounded-md py-3 pl-12 pr-10 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#4B5320] focus:border-[#4B5320] transition-all duration-200 text-lg"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#4B3D21] hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Sort Controls - Custom Dropdown */}
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                <span className="text-zinc-400 text-lg">Sort By:</span>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white px-4 py-2 rounded-md transition-colors min-w-[160px] justify-between group"
                    >
                        <span className="font-medium bg-[#4B5320] px-2 py-0.5 rounded text-sm text-white shadow-sm flex-1 text-center">
                            {sortLabels[sortOption]}
                        </span>
                        <ChevronDown
                            size={16}
                            className={`text-zinc-400 transition-transform duration-200 ${showSortMenu ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {showSortMenu && (
                        <div className="absolute right-0 mt-2 w-full min-w-[160px] bg-[#0a0a0a] border border-[#333] shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-30 flex flex-col rounded-md overflow-hidden">
                            {Object.entries(sortLabels).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors
                                        ${sortOption === key
                                            ? 'bg-[#4B5320]/20 text-[#4B5320]'
                                            : 'text-zinc-400 hover:bg-[#4B5320] hover:text-white'
                                        }`}
                                    onClick={() => { setSortOption(key); setShowSortMenu(false); }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
