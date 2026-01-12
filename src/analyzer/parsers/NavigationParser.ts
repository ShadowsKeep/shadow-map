import { Project, Node, SyntaxKind, CallExpression, JsxAttribute, SourceFile } from 'ts-morph';
import { GraphData, CodeNode, CodeEdge } from '../types';
import { Logger } from '../../utilities/Logger';
import * as path from 'path';

export class NavigationParser {
    
    /**
     * Enhances an existing graph with navigation nodes and edges.
     * Use this after the main TypeScript parsing.
     */
    public analyze(sourceFiles: SourceFile[], rootPath: string, existingGraph: GraphData): GraphData {
        Logger.info("Starting Navigation Analysis...");
        
        const nodes = [...existingGraph.nodes];
        const edges = [...existingGraph.edges];
        
        // 1. Identify Screens (Next.js Pages)
        // Next.js (Pages Router): pages/**/*.tsx
        // Next.js (App Router): app/**/page.tsx
        sourceFiles.forEach(file => {
            const filePath = path.relative(rootPath, file.getFilePath());
            const framework = this.detectFramework(filePath);
            
            if (framework === 'nextjs') {
                this.analyzeNextJsFile(file, filePath, nodes);
            } else if (framework === 'react-native') {
                // React Native detection often depends on seeing 'navigation' props or 'Stack.Screen'
                // This is harder to do purely by filename unless in 'app/' (expo router)
            }
        });

        // 2. Identify Edges (Transitions)
        sourceFiles.forEach(file => {
            const sourcePath = path.relative(rootPath, file.getFilePath());
            const sourceNode = nodes.find(n => n.filePath === sourcePath && n.type === 'screen');
            // Even if not a 'screen', a component can navigate. But edges naturally go from the component to the destination screen.

            if (sourceNode) {
                this.analyzeTransitions(file, sourceNode.id, nodes, edges);
            } else {
                // If it's a component navigating, maybe link from the file node?
                // For now, let's focus on Page -> Page transitions if possible, or Component -> Page.
                const fileNode = nodes.find(n => n.filePath === sourcePath && n.type === 'file');
                if (fileNode) {
                    this.analyzeTransitions(file, fileNode.id, nodes, edges);
                }
            }
        });

        return { nodes, edges };
    }

    private detectFramework(filePath: string): 'nextjs' | 'react-native' | 'other' {
        if (filePath.includes('pages/') || filePath.includes('app/')) return 'nextjs';
        // Basic heuristic. Can be improved.
        return 'other';
    }

    private analyzeNextJsFile(file: SourceFile, filePath: string, nodes: CodeNode[]) {
        // App Router: app/login/page.tsx -> /login
        // Pages Router: pages/login.tsx -> /login
        
        let route = '';
        if (filePath.match(/app[\\\/](.*)[\\\/]page\.(tsx|jsx)/)) {
            route = '/' + RegExp.$1.replace(/\\/g, '/');
        } else if (filePath.match(/pages[\\\/](.*)\.(tsx|jsx)/)) {
             route = '/' + RegExp.$1.replace(/\\/g, '/');
             if (route.endsWith('/index')) route = route.replace('/index', '');
        }

        if (route) {
            // Check if node exists (it might be a file node already)
            // We want to "upgrade" it to a screen node or create a parallel one.
            // Let's create a specialized 'screen' node.
            const id = `screen:${route}`;
            if (!nodes.find(n => n.id === id)) {
                nodes.push({
                    id,
                    type: 'screen',
                    label: route,
                    filePath,
                    framework: 'nextjs',
                    line: 1
                });
            }
        }
    }

    private analyzeTransitions(file: SourceFile, sourceId: string, nodes: CodeNode[], edges: CodeEdge[]) {
        // 1. router.push('/path')
        // 2. <Link href="/path">
        
        // Find CallExpressions: router.push(...)
        file.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
            const text = call.getText();
            if (text.includes('router.push') || text.includes('navigation.navigate')) {
                const args = call.getArguments();
                if (args.length > 0) {
                    let targetRoute = args[0].getText().replace(/['"`]/g, ''); // Naive unquote
                    this.addEdge(sourceId, targetRoute, edges, nodes);
                }
            }
        });

        // Find JSX Attributes: href="..."
        file.getDescendantsOfKind(SyntaxKind.JsxAttribute).forEach(attr => {
            if (attr.getNameNode().getText() === 'href') {
                const init = attr.getInitializer();
                if (init && Node.isStringLiteral(init)) {
                    let targetRoute = init.getLiteralValue();
                    this.addEdge(sourceId, targetRoute, edges, nodes);
                }
            }
        });
    }

    private addEdge(sourceId: string, targetRoute: string, edges: CodeEdge[], nodes: CodeNode[]) {
        // Resolve targetRoute to a screen node ID
        // Simplified: assuming targetRoute matches the 'label' or route derived from file.
        // We look for a node with type='screen' and label that matches.
        
        const targetNode = nodes.find(n => n.type === 'screen' && n.label === targetRoute);
        
        if (targetNode) {
            const id = `nav:${sourceId}-${targetNode.id}`;
            if (!edges.find(e => e.id === id)) {
                edges.push({
                    id,
                    source: sourceId,
                    target: targetNode.id,
                    type: 'navigation',
                    label: 'navigates to'
                });
            }
        }
    }
}
