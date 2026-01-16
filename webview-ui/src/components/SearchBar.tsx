import React from 'react';
import { CodeNode } from '../types';

interface SearchBarProps {
    nodes: CodeNode[];
    onFilterChange: (filtered: CodeNode[]) => void;
}

export default function SearchBar({ nodes, onFilterChange }: SearchBarProps) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [typeFilter, setTypeFilter] = React.useState<string[]>([]);
    const [minComplexity, setMinComplexity] = React.useState<number>(0);
    const [maxComplexity, setMaxComplexity] = React.useState<number>(100);
    const [showExportedOnly, setShowExportedOnly] = React.useState(false);

    const nodeTypes = ['file', 'component', 'function', 'class', 'variable', 'screen'];

    React.useEffect(() => {
        let filtered = nodes;

        // Text search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(n =>
                n.label.toLowerCase().includes(query) ||
                n.filePath.toLowerCase().includes(query) ||
                n.id.toLowerCase().includes(query)
            );
        }

        // Type filter
        if (typeFilter.length > 0) {
            filtered = filtered.filter(n => typeFilter.includes(n.type));
        }

        // Complexity filter
        filtered = filtered.filter(n => {
            const complexity = n.complexity || 0;
            return complexity >= minComplexity && complexity <= maxComplexity;
        });

        // Exported only
        if (showExportedOnly) {
            filtered = filtered.filter(n => n.isExported === true);
        }

        onFilterChange(filtered);
    }, [searchQuery, typeFilter, minComplexity, maxComplexity, showExportedOnly, nodes, onFilterChange]);

    const toggleTypeFilter = (type: string) => {
        if (typeFilter.includes(type)) {
            setTypeFilter(typeFilter.filter(t => t !== type));
        } else {
            setTypeFilter([...typeFilter, type]);
        }
    };

    return (
        <div className="absolute top-24 left-4 right-4 z-10 bg-geist-surface/90 backdrop-blur-xl border border-geist-accents-2 rounded-2xl p-4 shadow-2xl">
            {/* Search Input */}
            <div className="flex items-center gap-2 mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-geist-accents-5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search nodes by name, file, or ID..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-geist-accents-5"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="text-geist-accents-5 hover:text-white transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap gap-2 mb-3">
                {nodeTypes.map(type => (
                    <button
                        key={type}
                        onClick={() => toggleTypeFilter(type)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${typeFilter.includes(type)
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-geist-surface border border-geist-accents-2 text-geist-accents-5 hover:text-white'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Complexity & Export Filters */}
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-geist-accents-5">Complexity:</span>
                    <input
                        type="number"
                        value={minComplexity}
                        onChange={(e) => setMinComplexity(Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-geist-surface border border-geist-accents-2 rounded text-white"
                        min="0"
                    />
                    <span className="text-geist-accents-5">to</span>
                    <input
                        type="number"
                        value={maxComplexity}
                        onChange={(e) => setMaxComplexity(Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-geist-surface border border-geist-accents-2 rounded text-white"
                        min="0"
                    />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showExportedOnly}
                        onChange={(e) => setShowExportedOnly(e.target.checked)}
                        className="w-4 h-4 rounded bg-geist-surface border-geist-accents-2"
                    />
                    <span className="text-geist-accents-5">Exported Only</span>
                </label>
            </div>
        </div>
    );
}
