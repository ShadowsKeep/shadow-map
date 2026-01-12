
import { NavigationStrategy } from "../NavigationStrategy";
import { SourceFile, SyntaxKind, Node } from "ts-morph";
import { CodeNode, CodeEdge } from "../../../types";
import * as path from 'path';

export class ReactRouterStrategy implements NavigationStrategy {
    getName(): string {
        return "React Router";
    }

    detect(sourceFiles: SourceFile[]): boolean {
        // Look for imports from react-router-dom
        return sourceFiles.some(f => {
            return f.getImportDeclarations().some(i =>
                i.getModuleSpecifierValue() === 'react-router-dom' ||
                i.getModuleSpecifierValue() === 'react-router'
            );
        });
    }

    analyze(sourceFiles: SourceFile[], rootPath: string, nodes: CodeNode[], edges: CodeEdge[]): void {
        // 1. Identify Routes from <Route path="..." element={...} />
        sourceFiles.forEach(file => {
            file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).forEach(jsx => {
                if (jsx.getTagNameNode().getText() === 'Route') {
                    let pathProp = '';
                    let elementProp = '';

                    jsx.getAttributes().forEach(attr => {
                        if (Node.isJsxAttribute(attr)) {
                            const name = attr.getNameNode().getText();
                            if (name === 'path') {
                                const init = attr.getInitializer();
                                if (init && Node.isStringLiteral(init)) {
                                    pathProp = init.getLiteralValue();
                                }
                            }
                            // Identifying the component is harder without context, but we can try
                        }
                    });

                    if (pathProp) {
                        const id = `screen:${pathProp}`;
                        if (!nodes.find(n => n.id === id)) {
                            nodes.push({
                                id,
                                type: 'screen',
                                label: pathProp,
                                filePath: path.relative(rootPath, file.getFilePath()), // Defined in this file
                                framework: 'other', // Should maybe have 'react-router'
                                line: jsx.getStartLineNumber()
                            });
                        }
                    }
                }
            });
        });

        // 2. Identify Navigation (useNavigate, <Link>)
        sourceFiles.forEach(file => {
            const filePath = path.relative(rootPath, file.getFilePath());
            const fileId = `file:${filePath}`;

            // navigate('/path')
            file.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
                const expr = call.getExpression();
                if (expr.getText().includes('navigate')) { // heuristic for useNavigate hook result
                    const args = call.getArguments();
                    if (args.length > 0 && Node.isStringLiteral(args[0])) {
                        const targetRoute = args[0].getLiteralValue();
                        this.addEdge(fileId, targetRoute, edges, nodes);
                    }
                }
            });

            // <Link to="/path">
            file.getDescendantsOfKind(SyntaxKind.JsxElement).forEach(el => {
                this.checkLink(el.getOpeningElement(), fileId, edges, nodes);
            });
            file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).forEach(el => {
                this.checkLink(el, fileId, edges, nodes);
            });
        });
    }

    private checkLink(el: any, sourceId: string, edges: CodeEdge[], nodes: CodeNode[]) {
        if (el.getTagNameNode().getText() === 'Link') {
            el.getAttributes().forEach((attr: any) => {
                if (Node.isJsxAttribute(attr) && attr.getNameNode().getText() === 'to') {
                    const init = attr.getInitializer();
                    if (init && Node.isStringLiteral(init)) {
                        this.addEdge(sourceId, init.getLiteralValue(), edges, nodes);
                    }
                }
            });
        }
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
