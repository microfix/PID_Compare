'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export function useSearchAndSort(initialItems, defaultSort = 'newest') {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState(defaultSort);

    // Filter logic
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
                return smartSort(valB, valA);
            case 'oldest':
                if (dateA && dateB && dateA !== dateB) return dateA - dateB;
                return smartSort(valA, valB);
            default: return 0;
        }
    });

    return { searchTerm, setSearchTerm, sortOption, setSortOption, filteredItems };
}

export default function SearchFilterBar({ searchTerm, setSearchTerm, sortOption, setSortOption, placeholder = "Search Reports..." }) {
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
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 w-full border-b border-[#1f1f1f] pb-8">
            {/* Search Bar */}
            <div className="flex-1 w-full lg:max-w-2xl">
                <label className="block text-[#4B5320] text-xs font-bold uppercase tracking-[0.2em] mb-2 font-heading">
                    Identification Query
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-[#4B3D21] group-focus-within:text-[#4B5320] transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        className="block w-full bg-[#0a0a0a] border border-[#222] text-[#e2e2e2] py-4 pl-12 pr-12 
                                 focus:outline-none focus:border-[#4B5320] focus:ring-1 focus:ring-[#4B5320]/50 
                                 transition-all duration-300 font-mono text-sm tracking-wide placeholder-[#444]"
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#4B3D21] hover:text-[#e2e2e2] transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}
                    {/* Corner decorative accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#4B5320] opacity-50 group-focus-within:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#4B5320] opacity-50 group-focus-within:opacity-100 transition-opacity"></div>
                </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                <div className="relative">
                    <label className="block text-[#4B3D21] text-xs font-bold uppercase tracking-[0.2em] mb-2 font-heading text-right">
                        Sort Sequence
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="flex items-center justify-between gap-6 bg-[#0a0a0a] border border-[#222] hover:border-[#4B5320] 
                                 text-[#e2e2e2] h-[54px] px-6 transition-all min-w-[200px] group"
                    >
                        <span className="text-sm font-bold uppercase tracking-wider font-heading">
                            {sortLabels[sortOption]}
                        </span>
                        <ChevronDown
                            size={16}
                            className={`text-[#4B5320] transition-transform duration-300 ${showSortMenu ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {showSortMenu && (
                        <div className="absolute right-0 top-full mt-2 w-full bg-[#0a0a0a] border border-[#333] z-50 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                            {Object.entries(sortLabels).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`
                                        w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] transition-all flex items-center justify-between group
                                        ${sortOption === key
                                            ? 'bg-[#4B5320]/10 text-[#4B5320] border-l-2 border-[#4B5320]'
                                            : 'text-[#666] hover:text-[#e2e2e2] hover:bg-[#111] border-l-2 border-transparent'
                                        }
                                    `}
                                    onClick={() => { setSortOption(key); setShowSortMenu(false); }}
                                >
                                    <span className="font-heading">{label}</span>
                                    {sortOption === key && <Check size={14} className="text-[#4B5320]" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
