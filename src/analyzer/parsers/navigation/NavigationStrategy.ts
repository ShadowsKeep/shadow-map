
import { SourceFile } from "ts-morph";
import { GraphData, CodeNode, CodeEdge } from "../../types";

export interface NavigationStrategy {
    getName(): string;
    detect(sourceFiles: SourceFile[]): boolean;
    analyze(sourceFiles: SourceFile[], rootPath: string, nodes: CodeNode[], edges: CodeEdge[]): void;
}
