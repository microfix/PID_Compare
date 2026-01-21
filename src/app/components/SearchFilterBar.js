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
        'newest': 'Newest / Numeric Desc',
        'oldest': 'Oldest / Numeric Asc',
        'a-z': 'Name (A-Z)',
        'z-a': 'Name (Z-A)'
    };

    return (
        <div className="sticky top-0 z-10 bg-black pt-4 pb-4 mb-4 border-b border-gray-800" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-color)' }}>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 pl-10 pr-10 text-white focus:outline-none focus:border-green-700"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--foreground)' }}
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="h-full px-4 bg-gray-900 border border-gray-700 rounded-md text-gray-300 hover:text-white flex items-center gap-2"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--foreground)' }}
                    >
                        <ArrowUpDown size={18} />
                        <span className="hidden sm:inline">{sortLabels[sortOption] || 'Sort'}</span>
                    </button>

                    {showSortMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)}></div>
                            <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-md shadow-xl z-20 overflow-hidden"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                {Object.keys(sortLabels).map(key => (
                                    <button
                                        key={key}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 ${sortOption === key ? 'text-green-500 font-bold' : 'text-gray-300'}`}
                                        style={{ color: sortOption === key ? 'var(--accent-green)' : 'var(--text-muted)' }}
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
        </div>
    );
}
