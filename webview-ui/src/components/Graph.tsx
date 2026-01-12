import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    MiniMap,
    Background,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    OnNodesChange,
    OnEdgesChange,
    addEdge,
    Connection,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GraphData, CodeNode } from '../types';
import { getLayoutedElements, transformDataToFlow } from '../utils/layout';

interface GraphProps {
    data: GraphData;
    onNodeClick: (node: CodeNode) => void;
    layoutDirection?: 'TB' | 'LR';
}

const GlassControls = () => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    return (
        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 p-1 rounded-lg bg-geist-surface/50 backdrop-blur-md border border-geist-accents-2 shadow-xl">
            <button onClick={() => zoomIn()} className="p-2 text-geist-accents-5 hover:text-white hover:bg-geist-accents-2 rounded-md transition-colors" title="Zoom In">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </button>
            <button onClick={() => zoomOut()} className="p-2 text-geist-accents-5 hover:text-white hover:bg-geist-accents-2 rounded-md transition-colors" title="Zoom Out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </button>
            <button onClick={() => fitView()} className="p-2 text-geist-accents-5 hover:text-white hover:bg-geist-accents-2 rounded-md transition-colors" title="Fit View">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            </button>
        </div>
    );
};

const Graph: React.FC<GraphProps> = ({ data, onNodeClick, layoutDirection = 'LR' }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (data) {
            const { flowNodes, flowEdges } = transformDataToFlow(data);
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges, layoutDirection);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        }
    }, [data, setNodes, setEdges, layoutDirection]);

    const handleNodeClick = (_: React.MouseEvent, node: Node) => {
        if (node.data.original) {
            onNodeClick(node.data.original);

            // Focus Mode: Dim all other nodes
            setNodes((nds) => nds.map((n) => {
                const isConnected = edges.some(e =>
                    (e.source === node.id && e.target === n.id) ||
                    (e.target === node.id && e.source === n.id)
                );

                const baseColor = n.data.color || '#333';

                if (n.id === node.id) {
                    // Selected: Bright border, full opacity, glow
                    n.style = {
                        ...n.style,
                        opacity: 1,
                        border: `1px solid ${baseColor}`,
                        boxShadow: `0 0 15px ${baseColor}60`
                    };
                } else if (isConnected) {
                    // Connected: Normal opacity, original color
                    n.style = {
                        ...n.style,
                        opacity: 1,
                        border: `1px solid ${baseColor}`,
                        boxShadow: `0 0 5px ${baseColor}20`
                    };
                } else {
                    // Unrelated: Dimmed
                    n.style = {
                        ...n.style,
                        opacity: 0.1,
                        border: `1px solid ${baseColor}`,
                        boxShadow: 'none'
                    };
                }
                return n;
            }));

            // Highlight edges
            setEdges((eds) => eds.map((e) => {
                const isConnected = e.source === node.id || e.target === node.id;
                e.style = { ...e.style, stroke: isConnected ? '#fff' : '#333', opacity: isConnected ? 1 : 0.1 };
                e.animated = isConnected;
                return e;
            }));
        }
    };

    // Reset when clicking background
    const onPaneClick = () => {
        onNodeClick(null as any);
        setNodes((nds) => nds.map((n) => {
            const baseColor = n.data.color || '#333';
            n.style = {
                ...n.style,
                opacity: 1,
                border: `1px solid ${baseColor}`,
                boxShadow: `0 0 10px ${baseColor}20`
            };
            return n;
        }));
        setEdges((eds) => eds.map((e) => {
            e.style = { ...e.style, stroke: '#666', opacity: 1 };
            e.animated = false;
            return e;
        }));
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                onPaneClick={onPaneClick}
                fitView
                className="bg-geist-background" // Ensure dark background
            >
                <GlassControls />
                <MiniMap
                    className="!bg-geist-surface/50 !backdrop-blur-md !border !border-geist-accents-2 !rounded-lg"
                    nodeColor={(n) => {
                        return n.data?.color || '#333';
                    }}
                    maskColor="rgba(0, 0, 0, 0.6)"
                />
                <Background gap={12} size={1} color="#333" />
            </ReactFlow>
        </div>
    );
};

export default Graph;
