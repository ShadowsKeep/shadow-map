import { Project, Node, SyntaxKind, CallExpression, JsxAttribute, SourceFile } from 'ts-morph';
import { GraphData, CodeNode, CodeEdge } from '../types';
import { Logger } from '../../utilities/Logger';
import * as path from 'path';
import { NavigationStrategy } from './navigation/NavigationStrategy';
import { NextJsStrategy } from './navigation/strategies/NextJsStrategy';
import { ReactRouterStrategy } from './navigation/strategies/ReactRouterStrategy';

export class NavigationParser {

    private strategies: NavigationStrategy[] = [
        new NextJsStrategy(),
        new ReactRouterStrategy()
    ];

    /**
     * Enhances an existing graph with navigation nodes and edges.
     * Use this after the main TypeScript parsing.
     */
    public analyze(sourceFiles: SourceFile[], rootPath: string, existingGraph: GraphData): GraphData {
        Logger.info("Starting Navigation Analysis...");

        const nodes = [...existingGraph.nodes];
        const edges = [...existingGraph.edges];

        for (const strategy of this.strategies) {
            if (strategy.detect(sourceFiles)) {
                Logger.info(`Detected framework: ${strategy.getName()}`);
                strategy.analyze(sourceFiles, rootPath, nodes, edges);
                // We could allow multiple strategies or break after first detection.
                // For now, allow multiple (e.g. Next.js might use React Router features? Unlikely but safe).
            }
        }

        return { nodes, edges };
    }
}
