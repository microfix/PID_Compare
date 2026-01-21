'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react'; // Added Check for active state in dropdown

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 w-full">
            {/* Search Bar Container */}
            <div className="flex-1 w-full max-w-2xl">
                <div className="flex items-center w-full border border-[#4B5320] bg-black/40 h-12 px-4 rounded-sm transition-colors focus-within:border-[#6B7530]">
                    <Search className="text-[#4B3D21] shrink-0 mr-3" size={20} strokeWidth={2.5} />
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none text-white placeholder-neutral-600 focus:ring-0 focus:outline-none h-full w-full font-medium"
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center justify-end gap-3 min-w-fit" ref={dropdownRef}>
                <span className="text-white font-bold tracking-wide text-sm whitespace-nowrap hidden sm:inline-block">
                    Sort By:
                </span>

                <div className="relative">
                    {/* Custom Trigger Button - Army Green Background */}
                    <button
                        type="button"
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="flex items-center justify-between gap-3 bg-[#4B5320] hover:bg-[#3d441b] text-white h-10 px-4 rounded-sm transition-all shadow-lg min-w-[140px]"
                    >
                        <span className="text-sm font-bold uppercase tracking-wider">
                            {sortLabels[sortOption]}
                        </span>
                        <ChevronDown
                            size={16}
                            strokeWidth={3}
                            className={`transition-transform duration-200 ${showSortMenu ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {showSortMenu && (
                        <div className="absolute right-0 top-full mt-2 w-full min-w-[160px] bg-[#0F0F0F] border border-[#333] shadow-2xl z-50 flex flex-col py-1">
                            {Object.entries(sortLabels).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`
                                        w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-between
                                        ${sortOption === key
                                            ? 'bg-[#4B5320] text-white'
                                            : 'text-[#4B3D21] hover:bg-[#1a1a1a] hover:text-white'
                                        }
                                    `}
                                    onClick={() => { setSortOption(key); setShowSortMenu(false); }}
                                >
                                    {label}
                                    {sortOption === key && <Check size={14} strokeWidth={3} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
