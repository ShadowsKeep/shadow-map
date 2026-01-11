import React, { useState } from 'react';
import Graph from './components/Graph';
import NodeDetails from './components/NodeDetails';
import { useGraphData } from './hooks/useGraphData';
import { CodeNode } from './types';

function App() {
    const { data, loading, error } = useGraphData();
    const [selectedNode, setSelectedNode] = useState<CodeNode | null>(null);

    if (loading && !data) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>;
    if (!data) return null;

    return (
        <div className="h-screen w-screen relative flex flex-col">
            {/* Floating Glass Header */}
            <div className="absolute top-4 left-4 right-4 h-16 rounded-2xl bg-geist-surface/80 backdrop-blur-xl border border-geist-accents-2 z-20 flex items-center px-6 justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">Shadows Map</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-geist-accents-5 font-mono">{data.nodes.length} NODES</span>
                            <span className="text-xs text-geist-accents-6">•</span>
                            <span className="text-xs text-geist-accents-5 font-mono">{data.edges.length} EDGES</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const context = JSON.stringify({
                                summary: "Codebase Graph Context",
                                stats: {
                                    nodes: data.nodes.length,
                                    edges: data.edges.length
                                },
                                structure: data.nodes.map(n => ({
                                    id: n.id,
                                    type: n.type,
                                    label: n.label,
                                    filePath: n.filePath,
                                    signature: n.typeSignature,
                                    complexity: n.complexity
                                })),
                                relations: data.edges.map(e => ({
                                    from: e.source,
                                    to: e.target,
                                    type: e.type
                                }))
                            }, null, 2);

                            navigator.clipboard.writeText(context).then(() => {
                                // Simple visual feedback could be added here
                                console.log("Context copied to clipboard");
                            });
                        }}
                        className="h-8 px-3 rounded-md bg-geist-surface border border-geist-accents-2 text-xs font-medium text-geist-accents-5 hover:text-white hover:border-white transition-colors flex items-center gap-2"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy Context
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        <span className="text-xs text-geist-accents-5 uppercase tracking-wider font-medium">Active</span>
                    </div>
                </div>
            </div>
            <div className="flex-1 relative">
                <Graph data={data} onNodeClick={setSelectedNode} />
                <NodeDetails node={selectedNode} data={data} onClose={() => setSelectedNode(null)} />
            </div>
        </div>
    );
}

export default App;
