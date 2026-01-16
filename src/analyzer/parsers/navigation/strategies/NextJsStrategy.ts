
import { NavigationStrategy } from "../NavigationStrategy";
import { SourceFile, SyntaxKind, Node } from "ts-morph";
import { CodeNode, CodeEdge } from "../../../types";
import * as path from 'path';

export class NextJsStrategy implements NavigationStrategy {
    getName(): string {
        return "Next.js";
    }

    detect(sourceFiles: SourceFile[]): boolean {
        return sourceFiles.some(f => {
            const path = f.getFilePath();
            return path.includes("/pages/") || path.includes("/app/");
        });
    }

    analyze(sourceFiles: SourceFile[], rootPath: string, nodes: CodeNode[], edges: CodeEdge[]): void {
        // 1. Identify Screens
        sourceFiles.forEach(file => {
            const filePath = path.relative(rootPath, file.getFilePath());
            let route = '';

            // App Router
            if (filePath.match(/app[\\\/](.*)[\\\/]page\.(tsx|jsx)/)) {
                route = '/' + RegExp.$1.replace(/\\/g, '/');
            }
            // Pages Router
            else if (filePath.match(/pages[\\\/](.*)\.(tsx|jsx)/)) {
                route = '/' + RegExp.$1.replace(/\\/g, '/');
                if (route.endsWith('/index')) route = route.replace('/index', '');
            }

            if (route) {
                const id = `screen:${route}`;
                if (!nodes.find(n => n.id === id)) {
                    nodes.push({
                        id,
                        type: 'screen',
                        label: route,
                        filePath,
                        line: 1
                    });
                }
            }
        });

        // 2. Identify Edges
        sourceFiles.forEach(file => {
            const filePath = path.relative(rootPath, file.getFilePath());
            const fileId = `file:${filePath}`;

            // Find router.push() or <Link href>
            // Simplified version of original logic
            file.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
                const text = call.getText();
                if (text.includes('router.push') || text.includes('navigation.navigate')) {
                    const args = call.getArguments();
                    if (args.length > 0) {
                        let targetRoute = args[0].getText().replace(/['"`]/g, '');
                        this.addEdge(fileId, targetRoute, edges, nodes);
                    }
                }
            });

            file.getDescendantsOfKind(SyntaxKind.JsxAttribute).forEach(attr => {
                if (attr.getNameNode().getText() === 'href') {
                    const init = attr.getInitializer();
                    if (init && Node.isStringLiteral(init)) {
                        let targetRoute = init.getLiteralValue();
                        this.addEdge(fileId, targetRoute, edges, nodes);
                    }
                }
            });
        });
    }

    private addEdge(sourceId: string, targetRoute: string, edges: CodeEdge[], nodes: CodeNode[]) {
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
