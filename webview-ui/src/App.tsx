import React, { useState } from 'react';
import Graph from './components/Graph';
import NodeDetails from './components/NodeDetails';
import { useGraphData } from './hooks/useGraphData';
import { CodeNode } from './types';

function App() {
    const { data, loading, error } = useGraphData();
    const [selectedNode, setSelectedNode] = useState<CodeNode | null>(null);
    const [viewMode, setViewMode] = useState<'dependency' | 'navigation'>('dependency');

    if (loading && !data) return <div className="flex items-center justify-center h-screen text-geist-accents-5">Loading...</div>;
    if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>;
    if (!data) return null;

    // Filter data based on view mode
    const filteredNodes = data.nodes.filter(n => {
        if (viewMode === 'navigation') return n.type === 'screen';
        return n.type !== 'screen';
    });

    const filteredEdges = data.edges.filter(e => {
        if (viewMode === 'navigation') return e.type === 'navigation';
        return e.type !== 'navigation';
    });

    const displayData = { nodes: filteredNodes, edges: filteredEdges };

    return (
        <div className="h-screen w-screen relative flex flex-col bg-geist-background text-geist-foreground">
            {/* Floating Glass Header */}
            <div className="absolute top-4 left-4 right-4 h-16 rounded-2xl bg-geist-surface/80 backdrop-blur-xl border border-geist-accents-2 z-20 flex items-center px-6 justify-between shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-geist-accents-4">Shadow Map</h1>
                        <div className="flex items-center gap-2 text-xs text-geist-accents-5 font-mono">
                            <span>{displayData.nodes.length} NODES</span>
                            <span className="text-geist-accents-6">•</span>
                            <span>{displayData.edges.length} EDGES</span>
                        </div>
                    </div>
                </div>

                {/* View Switcher */}
                <div className="flex bg-geist-surface border border-geist-accents-2 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('dependency')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${viewMode === 'dependency' ? 'bg-indigo-600 text-white shadow-sm' : 'text-geist-accents-5 hover:text-white'}`}
                    >
                        Dependency
                    </button>
                    <button
                        onClick={() => setViewMode('navigation')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${viewMode === 'navigation' ? 'bg-indigo-600 text-white shadow-sm' : 'text-geist-accents-5 hover:text-white'}`}
                    >
                        Navigation
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const context = JSON.stringify({
                                summary: `Shadow Map Context (${viewMode})`,
                                stats: {
                                    nodes: displayData.nodes.length,
                                    edges: displayData.edges.length
                                },
                                structure: displayData.nodes.map(n => ({
                                    id: n.id,
                                    type: n.type,
                                    label: n.label,
                                    filePath: n.filePath
                                })),
                                relations: displayData.edges.map(e => ({
                                    from: e.source,
                                    to: e.target,
                                    type: e.type
                                }))
                            }, null, 2);

                            navigator.clipboard.writeText(context);
                        }}
                        className="h-8 px-3 rounded-md bg-geist-surface border border-geist-accents-2 text-xs font-medium text-geist-accents-5 hover:text-white hover:border-white transition-colors flex items-center gap-2"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy Context
                    </button>
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        <span className="text-[10px] text-green-500 font-bold tracking-wider">ACTIVE</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative">
                <Graph
                    data={displayData}
                    onNodeClick={setSelectedNode}
                    layoutDirection={viewMode === 'navigation' ? 'LR' : 'TB'}
                />
                <NodeDetails node={selectedNode} data={data} onClose={() => setSelectedNode(null)} />
            </div>
        </div>
    );
}

export default App;
