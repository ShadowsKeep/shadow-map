import { BaseParser, ParserOptions } from '../BaseParser';
import { GraphData, CodeNode, CodeEdge } from '../../types';
import { Project, SyntaxKind, Node, FunctionDeclaration, ClassDeclaration, MethodDeclaration, VariableDeclaration, ArrowFunction, FunctionExpression } from 'ts-morph';
import path from 'path';
import fs from 'fs';
import { Logger } from '../../../utilities/Logger';
import { NavigationParser } from '../NavigationParser';

/**
 * Enhanced TypeScript Parser with:
 * - Component detection
 * - Function call graph tracking
 * - Inheritance tracking
 * - Context API detection
 * - Export tracking
 */
export class EnhancedTypeScriptParser extends BaseParser {
    private nodeMap: Map<string, CodeNode> = new Map();
    private callGraph: Map<string, Set<string>> = new Map();
    private componentUsage: Map<string, Set<string>> = new Map();

    canParse(filePath: string): boolean {
        return filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx');
    }

    async parse(rootPath: string, options?: ParserOptions): Promise<GraphData> {
        Logger.info(`[V2] Initializing Enhanced TypeScript project for: ${rootPath}`);

        const project = new Project({
            tsConfigFilePath: path.join(rootPath, 'tsconfig.json'),
            skipAddingFilesFromTsConfig: false,
        });

        // If no tsconfig, add source files manually
        if (!fs.existsSync(path.join(rootPath, 'tsconfig.json'))) {
            Logger.info("No tsconfig.json found, adding source files manually...");
            project.addSourceFilesAtPaths([
                path.join(rootPath, '**/*.{ts,tsx,js,jsx}'),
                '!**/node_modules/**'
            ]);
        }

        const nodes: CodeNode[] = [];
        const edges: CodeEdge[] = [];

        const sourceFiles = project.getSourceFiles();
        Logger.info(`Found ${sourceFiles.length} source files to analyze.`);

        // First pass: Create all nodes
        let processed = 0;
        for (const sourceFile of sourceFiles) {
            if (sourceFile.getFilePath().includes('node_modules')) continue;

            processed++;
            if (processed % 10 === 0) Logger.info(`[Pass 1] Processed ${processed}/${sourceFiles.length} files...`);

            const filePath = path.relative(rootPath, sourceFile.getFilePath());
            const fileId = `file:${filePath}`;

            // File Node
            const fileNode: CodeNode = {
                id: fileId,
                type: 'file',
                label: path.basename(filePath),
                filePath: filePath,
                language: 'typescript',
                loc: sourceFile.getEndLineNumber()
            };
            nodes.push(fileNode);
            this.nodeMap.set(fileId, fileNode);

            // Imports
            const imports = sourceFile.getImportDeclarations();
            for (const imp of imports) {
                const moduleSpecifier = imp.getModuleSpecifierValue();
                let targetId = '';

                const sourceFileRef = imp.getModuleSpecifierSourceFile();
                if (sourceFileRef && !sourceFileRef.getFilePath().includes('node_modules')) {
                    const targetPath = path.relative(rootPath, sourceFileRef.getFilePath());
                    targetId = `file:${targetPath}`;
                } else {
                    // External module
                    targetId = `external:${moduleSpecifier}`;
                    if (!this.nodeMap.has(targetId)) {
                        const extNode: CodeNode = {
                            id: targetId,
                            type: 'variable',
                            label: moduleSpecifier,
                            filePath: 'node_modules',
                            language: 'n/a'
                        };
                        nodes.push(extNode);
                        this.nodeMap.set(targetId, extNode);
                    }
                }

                edges.push({
                    id: `edge:${fileId}-${targetId}`,
                    source: fileId,
                    target: targetId,
                    type: 'import'
                });
            }

            // Extract exports (both named and default)
            const exportedDeclarations = sourceFile.getExportedDeclarations();
            const defaultExport = sourceFile.getDefaultExportSymbol();

            // Functions, Classes, Variables, TypeScript Definitions
            const functions = sourceFile.getFunctions();
            const classes = sourceFile.getClasses();
            const variables = sourceFile.getVariableDeclarations();
            const interfaces = sourceFile.getInterfaces();
            const typeAliases = sourceFile.getTypeAliases();
            const enums = sourceFile.getEnums();

            // Process Functions
            functions.forEach((f: FunctionDeclaration) => {
                const name = f.getName();
                if (name) {
                    const isExported = exportedDeclarations.has(name) || (defaultExport?.getName() === name) || false;
                    this.processFunction(name, f, fileId, filePath, isExported, nodes, edges);
                }
            });

            // Process Classes
            classes.forEach((c: ClassDeclaration) => {
                const name = c.getName();
                if (name) {
                    const isExported = exportedDeclarations.has(name) || (defaultExport?.getName() === name) || false;
                    const classId = this.processClass(name, c, fileId, filePath, isExported, nodes, edges);

                    // Process Methods
                    c.getMethods().forEach((m: MethodDeclaration) => {
                        const mName = m.getName();
                        this.processFunction(mName, m, classId, filePath, false, nodes, edges);
                    });

                    // Track inheritance
                    const extendsClause = c.getExtends();
                    if (extendsClause) {
                        const baseClassName = extendsClause.getText();
                        const baseClassId = this.resolveSymbolId(extendsClause.getExpression(), rootPath);
                        if (baseClassId) {
                            edges.push({
                                id: `edge:${classId}-extends-${baseClassId}`,
                                source: classId,
                                target: baseClassId,
                                type: 'inheritance',
                                label: 'extends'
                            });
                        }
                    }

                    // Track implements
                    c.getImplements().forEach(impl => {
                        const interfaceName = impl.getText();
                        const interfaceId = this.resolveSymbolId(impl.getExpression(), rootPath);
                        if (interfaceId) {
                            edges.push({
                                id: `edge:${classId}-implements-${interfaceId}`,
                                source: classId,
                                target: interfaceId,
                                type: 'inheritance',
                                label: 'implements'
                            });
                        }
                    });
                }
            });

            // Process Variables (potential components)
            variables.forEach((v: VariableDeclaration) => {
                const name = v.getName();
                if (v.getParent()?.getParent()?.getKind() === SyntaxKind.SourceFile) {
                    const isExported = exportedDeclarations.has(name) || (defaultExport?.getName() === name) || false;
                    this.processVariable(name, v, fileId, filePath, isExported, nodes, edges);
                }
            });

            // Process TypeScript Interfaces
            interfaces.forEach((iface) => {
                const name = iface.getName();
                const isExported = exportedDeclarations.has(name);
                this.processInterface(name, iface, fileId, filePath, isExported, nodes, edges);
            });

            // Process Type Aliases
            typeAliases.forEach((typeAlias) => {
                const name = typeAlias.getName();
                const isExported = exportedDeclarations.has(name);
                this.processTypeAlias(name, typeAlias, fileId, filePath, isExported, nodes, edges);
            });

            // Process Enums
            enums.forEach((enumDecl) => {
                const name = enumDecl.getName();
                const isExported = exportedDeclarations.has(name);
                this.processEnum(name, enumDecl, fileId, filePath, isExported, nodes, edges);
            });
        }

        Logger.info(`[Pass 1] Created ${nodes.length} nodes`);

        // Second pass: Analyze call graphs and component usage
        Logger.info(`[Pass 2] Analyzing call graphs and relationships...`);
        this.buildCallGraphs(project, rootPath);

        // Apply call graph data to nodes
        this.nodeMap.forEach((node, nodeId) => {
            const calls = this.callGraph.get(nodeId);
            if (calls && calls.size > 0) {
                node.calls = Array.from(calls);
            }

            const components = this.componentUsage.get(nodeId);
            if (components && components.size > 0) {
                node.usesComponents = Array.from(components);
            }
        });

        // Build reverse call graph (calledBy)
        this.callGraph.forEach((calleeIds, callerId) => {
            calleeIds.forEach(calleeId => {
                const calleeNode = this.nodeMap.get(calleeId);
                if (calleeNode) {
                    if (!calleeNode.calledBy) calleeNode.calledBy = [];
                    if (!calleeNode.calledBy.includes(callerId)) {
                        calleeNode.calledBy.push(callerId);
                    }
                }
            });
        });

        Logger.info(`[Pass 2] Call graph complete. ${this.callGraph.size} nodes have outgoing calls.`);

        // Navigation Analysis
        try {
            const navParser = new NavigationParser();
            const navGraph = navParser.analyze(sourceFiles, rootPath, { nodes, edges });
            return navGraph;
        } catch (e) {
            Logger.error(`Navigation analysis failed: ${e}`);
            return { nodes, edges };
        }
    }

    private processFunction(
        name: string,
        node: FunctionDeclaration | MethodDeclaration | ArrowFunction | FunctionExpression,
        parentId: string,
        filePath: string,
        isExported: boolean,
        nodes: CodeNode[],
        edges: CodeEdge[]
    ): string {
        const id = `${parentId}:${name}`;
        const text = node.getText();
        const loc = node.getEndLineNumber() - node.getStartLineNumber() + 1;

        let signature = '';
        if (Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node)) {
            try {
                signature = node.getSignature().getDeclaration().getText().split('{')[0].trim();
            } catch (e) {
                signature = node.getText().split('{')[0].trim();
            }
        }

        // Basic complexity
        const complexity = (text.match(/(if|else|for|while|switch|case|catch|&&|\|\||\?)/g) || []).length + 1;

        // Check if this is a React Component
        const isComponent = this.isReactComponent(node);

        // React Metadata
        const props: string[] = [];
        const hooks: string[] = [];
        const state: string[] = [];
        const providesContext: string[] = [];
        const consumesContext: string[] = [];

        // Extract hooks and context
        this.extractReactMetadata(node, hooks, state, providesContext, consumesContext);

        // Extract props
        this.extractProps(node, props);

        const nodeData: CodeNode = {
            id,
            type: isComponent ? 'component' : 'function',
            label: name,
            filePath: filePath,
            line: node.getStartLineNumber(),
            code: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
            loc,
            complexity,
            typeSignature: signature,
            isExported,
            props: props.length ? props : undefined,
            state: state.length ? state : undefined,
            hooks: hooks.length ? hooks : undefined,
            providesContext: providesContext.length ? providesContext : undefined,
            consumesContext: consumesContext.length ? consumesContext : undefined
        };

        nodes.push(nodeData);
        this.nodeMap.set(id, nodeData);

        edges.push({
            id: `edge:${parentId}-${id}`,
            source: parentId,
            target: id,
            type: 'usage'
        });

        return id;
    }

    private processClass(
        name: string,
        node: ClassDeclaration,
        parentId: string,
        filePath: string,
        isExported: boolean,
        nodes: CodeNode[],
        edges: CodeEdge[]
    ): string {
        const id = `${parentId}:${name}`;
        const text = node.getText();
        const loc = node.getEndLineNumber() - node.getStartLineNumber() + 1;
        const complexity = (text.match(/(if|else|for|while|switch|case|catch|&&|\|\||\?)/g) || []).length + 1;

        const nodeData: CodeNode = {
            id,
            type: 'class',
            label: name,
            filePath: filePath,
            line: node.getStartLineNumber(),
            code: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
            loc,
            complexity,
            isExported
        };

        nodes.push(nodeData);
        this.nodeMap.set(id, nodeData);

        edges.push({
            id: `edge:${parentId}-${id}`,
            source: parentId,
            target: id,
            type: 'usage'
        });

        return id;
    }

    private processVariable(
        name: string,
        node: VariableDeclaration,
        parentId: string,
        filePath: string,
        isExported: boolean,
        nodes: CodeNode[],
        edges: CodeEdge[]
    ): string {
        const id = `${parentId}:${name}`;
        const text = node.getText();
        const loc = node.getEndLineNumber() - node.getStartLineNumber() + 1;

        const init = node.getInitializer();
        let isComponent = false;
        let signature = node.getType().getText();

        // Check if variable is a component (arrow function returning JSX)
        if (init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init))) {
            isComponent = this.isReactComponent(init);

            if (isComponent) {
                return this.processFunction(name, init, parentId, filePath, isExported, nodes, edges);
            }
        }

        const complexity = (text.match(/(if|else|for|while|switch|case|catch|&&|\|\||\?)/g) || []).length + 1;

        const nodeData: CodeNode = {
            id,
            type: 'variable',
            label: name,
            filePath: filePath,
            line: node.getStartLineNumber(),
            code: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
            loc,
            complexity,
            typeSignature: signature,
            isExported
        };

        nodes.push(nodeData);
        this.nodeMap.set(id, nodeData);

        edges.push({
            id: `edge:${parentId}-${id}`,
            source: parentId,
            target: id,
            type: 'usage'
        });

        return id;
    }

    private processInterface(
        name: string,
        node: any,
        parentId: string,
        filePath: string,
        isExported: boolean,
        nodes: CodeNode[],
        edges: CodeEdge[]
    ): string {
        const id = `${parentId}:${name}`;
        const text = node.getText();
        const loc = node.getEndLineNumber() - node.getStartLineNumber() + 1;

        // Extract interface properties
        const properties = node.getProperties();
        const propNames = properties.map((p: any) => p.getName());

        const nodeData: CodeNode = {
            id,
            type: 'interface',
            label: name,
            filePath: filePath,
            line: node.getStartLineNumber(),
            code: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
            loc,
            isExported,
            typeSignature: `interface ${name} { ${propNames.join(', ')} }`
        };

        nodes.push(nodeData);
        this.nodeMap.set(id, nodeData);

        edges.push({
            id: `edge:${parentId}-${id}`,
            source: parentId,
            target: id,
            type: 'usage'
        });

        return id;
    }

    private processTypeAlias(
        name: string,
        node: any,
        parentId: string,
        filePath: string,
        isExported: boolean,
        nodes: CodeNode[],
        edges: CodeEdge[]
    ): string {
        const id = `${parentId}:${name}`;
        const text = node.getText();
        const loc = node.getEndLineNumber() - node.getStartLineNumber() + 1;
        const typeText = node.getType().getText();

        const nodeData: CodeNode = {
            id,
            type: 'interface', // Use 'interface' type for type aliases too
            label: name,
            filePath: filePath,
            line: node.getStartLineNumber(),
            code: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
            loc,
            isExported,
            typeSignature: `type ${name} = ${typeText}`
        };

        nodes.push(nodeData);
        this.nodeMap.set(id, nodeData);

        edges.push({
            id: `edge:${parentId}-${id}`,
            source: parentId,
            target: id,
            type: 'usage'
        });

        return id;
    }

    private processEnum(
        name: string,
        node: any,
        parentId: string,
        filePath: string,
        isExported: boolean,
        nodes: CodeNode[],
        edges: CodeEdge[]
    ): string {
        const id = `${parentId}:${name}`;
        const text = node.getText();
        const loc = node.getEndLineNumber() - node.getStartLineNumber() + 1;

        // Get enum members
        const members = node.getMembers();
        const memberNames = members.map((m: any) => m.getName());

        const nodeData: CodeNode = {
            id,
            type: 'variable', // Use 'variable' for enums
            label: name,
            filePath: filePath,
            line: node.getStartLineNumber(),
            code: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
            loc,
            isExported,
            typeSignature: `enum ${name} { ${memberNames.join(', ')} }`
        };

        nodes.push(nodeData);
        this.nodeMap.set(id, nodeData);

        edges.push({
            id: `edge:${parentId}-${id}`,
            source: parentId,
            target: id,
            type: 'usage'
        });

        return id;
    }

    /**
     * Detects if a function/arrow function is a React component
     */
    private isReactComponent(node: Node): boolean {
        // Check for explicit return statements with JSX
        const returnStatements = node.getDescendantsOfKind(SyntaxKind.ReturnStatement);
        const hasJsxReturn = returnStatements.some(r => {
            const expr = r.getExpression();
            return expr && (Node.isJsxElement(expr) || Node.isJsxSelfClosingElement(expr) || Node.isJsxFragment(expr));
        });

        if (hasJsxReturn) return true;

        // Check for implicit JSX return in arrow functions: const Foo = () => <div/>
        if (Node.isArrowFunction(node)) {
            const body = node.getBody();
            if (Node.isJsxElement(body) || Node.isJsxSelfClosingElement(body) || Node.isJsxFragment(body)) {
                return true;
            }

            // Check parenthesized expressions: const Foo = () => (<div/>)
            if (Node.isParenthesizedExpression(body)) {
                const inner = body.getExpression();
                if (Node.isJsxElement(inner) || Node.isJsxSelfClosingElement(inner) || Node.isJsxFragment(inner)) {
                    return true;
                }
            }
        }

        // Check if function body contains ANY JSX elements (more general check)
        const hasJsxElements = node.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
            node.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0 ||
            node.getDescendantsOfKind(SyntaxKind.JsxFragment).length > 0;

        return hasJsxElements;
    }

    /**
     * Extract React hooks, state, and context usage
     */
    private extractReactMetadata(
        node: Node,
        hooks: string[],
        state: string[],
        providesContext: string[],
        consumesContext: string[]
    ): void {
        // Hook & State Detection
        node.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
            const expr = call.getExpression();
            let name = expr.getText();

            if (Node.isPropertyAccessExpression(expr)) {
                name = expr.getName();
            }

            // Track hooks
            if (name.startsWith('use')) {
                if (!hooks.includes(name)) hooks.push(name);

                // useState
                if (name === 'useState' || name.endsWith('.useState')) {
                    let parent = call.getParent();
                    while (parent && !Node.isVariableDeclaration(parent) && !Node.isExpressionStatement(parent)) {
                        parent = parent.getParent();
                    }

                    if (Node.isVariableDeclaration(parent)) {
                        const nameNode = parent.getNameNode();
                        if (Node.isArrayBindingPattern(nameNode)) {
                            const elements = nameNode.getElements();
                            if (elements.length > 0) state.push(elements[0].getText());
                        } else if (Node.isIdentifier(nameNode)) {
                            state.push(nameNode.getText());
                        }
                    }
                }

                // useContext
                if (name === 'useContext' || name.endsWith('.useContext')) {
                    const args = call.getArguments();
                    if (args.length > 0) {
                        const contextName = args[0].getText().replace(/Context$/, '');
                        if (!consumesContext.includes(contextName)) {
                            consumesContext.push(contextName);
                        }
                    }
                }
            }

            // createContext
            if (name === 'createContext' || name.endsWith('.createContext')) {
                let parent = call.getParent();
                while (parent && !Node.isVariableDeclaration(parent)) {
                    parent = parent.getParent();
                }

                if (Node.isVariableDeclaration(parent)) {
                    const contextName = parent.getName().replace(/Context$/, '');
                    if (!providesContext.includes(contextName)) {
                        providesContext.push(contextName);
                    }
                }
            }
        });
    }

    /**
     * Extract component props
     */
    private extractProps(node: Node, props: string[]): void {
        let functionNode: any = node;

        if (Node.isVariableDeclaration(node)) {
            const init = node.getInitializer();
            if (init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init))) {
                functionNode = init;
            } else {
                return;
            }
        }

        if (functionNode && functionNode.getParameters) {
            const params = functionNode.getParameters();
            if (params.length > 0) {
                const firstParam = params[0];
                const nameNode = firstParam.getNameNode();

                if (Node.isObjectBindingPattern(nameNode)) {
                    nameNode.getElements().forEach(el => {
                        props.push(el.getText());
                    });
                } else {
                    const typeNode = firstParam.getTypeNode();
                    if (typeNode) {
                        props.push(typeNode.getText());
                    } else {
                        props.push(firstParam.getName());
                    }
                }
            }
        }
    }

    /**
     * Build call graphs by analyzing all function calls
     */
    private buildCallGraphs(project: Project, rootPath: string): void {
        this.nodeMap.forEach((node, nodeId) => {
            if (node.type === 'function' || node.type === 'component' || node.type === 'class') {
                const sourceFile = project.getSourceFile(path.join(rootPath, node.filePath));
                if (!sourceFile) return;

                // Find the actual AST node
                const astNode = this.findNodeByLine(sourceFile, node.line || 1);
                if (!astNode) return;

                // Analyze calls
                const calls = new Set<string>();
                const componentUsages = new Set<string>();

                astNode.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
                    const expr = call.getExpression();
                    const targetId = this.resolveSymbolId(expr, rootPath);
                    if (targetId && targetId !== nodeId) {
                        calls.add(targetId);
                    }
                });

                // Track JSX component usage
                astNode.getDescendantsOfKind(SyntaxKind.JsxOpeningElement).forEach(jsx => {
                    const tagName = jsx.getTagNameNode();
                    const componentName = tagName.getText();

                    // Only track capitalized components (React convention)
                    if (componentName[0] === componentName[0].toUpperCase()) {
                        const targetId = this.resolveSymbolId(tagName, rootPath);
                        if (targetId && targetId !== nodeId) {
                            componentUsages.add(targetId);
                        }
                    }
                });

                // Also check self-closing JSX
                astNode.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).forEach(jsx => {
                    const tagName = jsx.getTagNameNode();
                    const componentName = tagName.getText();

                    if (componentName[0] === componentName[0].toUpperCase()) {
                        const targetId = this.resolveSymbolId(tagName, rootPath);
                        if (targetId && targetId !== nodeId) {
                            componentUsages.add(targetId);
                        }
                    }
                });

                if (calls.size > 0) {
                    this.callGraph.set(nodeId, calls);
                }

                if (componentUsages.size > 0) {
                    this.componentUsage.set(nodeId, componentUsages);
                }
            }
        });
    }

    /**
     * Find AST node by line number
     */
    private findNodeByLine(sourceFile: any, lineNumber: number): Node | undefined {
        const allNodes = sourceFile.getDescendants();
        return allNodes.find((n: Node) => n.getStartLineNumber() === lineNumber);
    }

    /**
     * Resolve a symbol to a node ID
     */
    private resolveSymbolId(expr: Node, rootPath: string): string | undefined {
        try {
            const symbol = expr.getSymbol();
            if (!symbol) return undefined;

            const declarations = symbol.getDeclarations();
            if (declarations.length === 0) return undefined;

            const decl = declarations[0];
            const sourceFile = decl.getSourceFile();
            const filePath = path.relative(rootPath, sourceFile.getFilePath());

            if (filePath.includes('node_modules')) return undefined;

            const fileId = `file:${filePath}`;
            let name = symbol.getName();

            // Try to find in our node map
            const possibleId = `${fileId}:${name}`;
            if (this.nodeMap.has(possibleId)) {
                return possibleId;
            }

            return undefined;
        } catch (e) {
            return undefined;
        }
    }
}
