import React from 'react';
import { CodeNode, GraphData } from '../types';
import { X, Copy, Check } from 'lucide-react';
import { vscode } from '../utils/vscode';

interface NodeDetailsProps {
    node: CodeNode | null;
    data: GraphData | null;
    onClose: () => void;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({ node, data, onClose }) => {
    const [copied, setCopied] = React.useState(false);

    if (!node) return null;

    const handleCopyContext = () => {
        if (!data) return;

        // Find related nodes (dependencies and usages)
        const imports = data.edges
            .filter(e => e.source === node.id && e.type === 'import')
            .map(e => data.nodes.find(n => n.id === e.target))
            .filter(Boolean);

        const usedBy = data.edges
            .filter(e => e.target === node.id && (e.type === 'usage' || e.type === 'import'))
            .map(e => data.nodes.find(n => n.id === e.source))
            .filter(Boolean);

        // Build comprehensive AI-readable context
        const context: any = {
            node: {
                id: node.id,
                type: node.type,
                name: node.label,
                file: node.filePath,
                line: node.line || 1,
                exported: node.isExported || false
            },
            metadata: {
                complexity: node.complexity,
                loc: node.loc,
                signature: node.typeSignature
            }
        };

        // Add React-specific data if component
        if (node.type === 'component') {
            context.react = {
                props: node.props || [],
                state: node.state || [],
                hooks: node.hooks || [],
                providesContext: node.providesContext || [],
                consumesContext: node.consumesContext || [],
                usesComponents: node.usesComponents || []
            };
        }

        // Add relationships
        context.relationships = {
            imports: imports.map(n => ({
                name: n?.label,
                type: n?.type,
                from: n?.filePath
            })),
            importedBy: usedBy.map(n => ({
                name: n?.label,
                type: n?.type,
                from: n?.filePath
            })),
            calls: node.calls || [],
            calledBy: node.calledBy || []
        };

        // Add code preview
        context.code = {
            preview: node.code,
            fullPath: node.filePath
        };

        // Generate markdown summary
        const markdown = `
# ${node.label} (${node.type})

**File**: \`${node.filePath}:${node.line || 1}\`  
**Exported**: ${node.isExported ? 'Yes' : 'No'}  
**Complexity**: ${node.complexity || 'N/A'}  
**Lines of Code**: ${node.loc || 'N/A'}

${node.typeSignature ? `## Signature\n\`\`\`typescript\n${node.typeSignature}\n\`\`\`` : ''}

${node.typeParameters && node.typeParameters.length > 0 ? `## Generic Parameters\n${node.typeParameters.map(p => `- \`${p}\``).join('\n')}` : ''}

${node.isAsync || node.isGenerator || node.isHOC || node.isMemoized || node.isLazy || node.usesForwardRef ? `
## Function Attributes
${node.isAsync ? '- ⚡ **Async Function**' : ''}
${node.isGenerator ? '- 🔄 **Generator Function**' : ''}
${node.isHOC ? '- 🎭 **Higher-Order Component** (wraps: \`${node.wrapsComponent || 'unknown'}\`)' : ''
    }
${ node.isMemoized ? '- 📦 **React.memo** (optimized)' : '' }
${ node.isLazy ? '- 💤 **React.lazy** (code-split)' : '' }
${ node.usesForwardRef ? '- 🔗 **forwardRef** (ref forwarding)' : '' }
    ` : ''}

${node.type === 'component' || node.type === 'custom-hook' ? `
## React Details
- **Type**: ${node.type === 'custom-hook' ? 'Custom Hook' : 'Component'}
- **Props**: ${node.props?.join(', ') || 'None'}
- **State**: ${node.state?.join(', ') || 'None'}
- **Built-in Hooks**: ${node.hooks?.filter(h => !node.customHooks?.includes(h)).join(', ') || 'None'}
- **Custom Hooks**: ${node.customHooks?.join(', ') || 'None'}
- **Uses Components**: ${node.usesComponents?.join(', ') || 'None'}
- **Consumes Context**: ${node.consumesContext?.join(', ') || 'None'}
- **Provides Context**: ${node.providesContext?.join(', ') || 'None'}
` : ''}

## Dependencies
${imports.length > 0 ? imports.map(n => `- ${n?.label} (${n?.type}) from \`${n?.filePath}\``).join('\n') : '- None'}

## Used By
${usedBy.length > 0 ? usedBy.map(n => `- ${n?.label} (${n?.type}) from \`${n?.filePath}\``).join('\n') : '- None'}

${node.calls && node.calls.length > 0 ? `\n## Calls\n${node.calls.join('\n- ')}` : ''}
${node.calledBy && node.calledBy.length > 0 ? `\n## Called By\n${node.calledBy.join('\n- ')}` : ''}

${node.code ? `\n## Code Preview\n\`\`\`typescript\n${node.code}\n\`\`\`` : ''}
`.trim();

    // Combine JSON + Markdown
    const output = `${JSON.stringify(context, null, 2)}\n\n---\n\n${markdown}`;

    navigator.clipboard.writeText(output).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        console.log("Enhanced AI context copied to clipboard");
    });
};

const handleOpenFile = () => {
    if (node.filePath) {
        vscode.postMessage({
            command: 'openFile',
            file: node.filePath,
            line: node.line || 1
        });
    }
};

return (
    <div className="absolute right-6 top-24 bottom-6 w-96 bg-geist-surface/90 backdrop-blur-2xl border border-geist-accents-2 rounded-2xl p-6 overflow-hidden flex flex-col z-10 text-geist-accents-8 shadow-2xl transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{node.label}</h2>
                <p className="text-xs text-geist-accents-5 font-mono mt-1 break-all">{node.id}</p>
            </div>
            <button onClick={onClose} className="text-geist-accents-5 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* AI Context Button */}
        <button
            onClick={handleCopyContext}
            className="mb-6 w-full flex items-center justify-center gap-2 py-2 rounded-md bg-geist-accents-2 hover:bg-geist-accents-3 text-white font-medium text-xs transition-colors border border-geist-accents-3"
        >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? "Copied to Clipboard" : "Copy AI Context"}
        </button>

        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-geist-accents-1 border border-geist-accents-2 p-3 rounded-md">
                    <p className="text-xs text-geist-accents-5 uppercase tracking-wider mb-1">Type</p>
                    <p className="text-sm font-medium text-white">{node.type}</p>
                </div>
                {node.loc !== undefined && (
                    <div className="bg-geist-accents-1 border border-geist-accents-2 p-3 rounded-md">
                        <p className="text-xs text-geist-accents-5 uppercase tracking-wider mb-1">LOC</p>
                        <p className="text-sm font-medium text-white">{node.loc}</p>
                    </div>
                )}
                {node.complexity !== undefined && (
                    <div className="bg-geist-accents-1 border border-geist-accents-2 p-3 rounded-md">
                        <p className="text-xs text-geist-accents-5 uppercase tracking-wider mb-1">Complexity</p>
                        <p className="text-sm font-medium text-white">{node.complexity}</p>
                    </div>
                )}
                <div className="bg-geist-accents-1 border border-geist-accents-2 p-3 rounded-md">
                    <p className="text-xs text-geist-accents-5 uppercase tracking-wider mb-1">Language</p>
                    <p className="text-sm font-medium text-white">{node.language || 'Unknown'}</p>
                </div>
            </div>

            {/* File Info */}
            <div>
                <h3 className="text-xs text-geist-accents-5 uppercase tracking-wider mb-2">Location</h3>
                <div
                    onClick={handleOpenFile}
                    className="bg-geist-accents-1 border border-geist-accents-2 p-3 rounded-md font-mono text-xs text-geist-accents-6 break-all cursor-pointer hover:bg-geist-accents-2 hover:text-white transition-colors flex items-center gap-2 group"
                    title="Open in Editor"
                >
                    <svg className="w-4 h-4 text-geist-accents-4 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {node.filePath}:{node.line}
                </div>
            </div>

            {/* Type Signature */}
            {node.typeSignature && (
                <div>
                    <h3 className="text-xs text-geist-accents-5 uppercase tracking-wider mb-2">Signature</h3>
                    <div className="bg-geist-accents-1 border border-geist-accents-2 p-3 rounded-md overflow-x-auto">
                        <pre className="text-xs font-mono text-blue-400">
                            {node.typeSignature}
                        </pre>
                    </div>
                </div>
            )}

            {/* Code Preview */}
            {node.code && (
                <div>
                    <h3 className="text-xs text-geist-accents-5 uppercase tracking-wider mb-2">Preview</h3>
                    <div className="bg-geist-accents-1 border border-geist-accents-2 p-3 rounded-md overflow-x-auto">
                        <pre className="text-xs font-mono text-geist-accents-6">
                            <code>{node.code}</code>
                        </pre>
                    </div>
                </div>
            )}
        </div>
    </div>
);
};

export default NodeDetails;

