export interface CodeNode {
  id: string;
  type: 'file' | 'function' | 'class' | 'variable' | 'interface';
  label: string;
  filePath: string;
  line?: number;
  code?: string;
  // Metadata
  language?: string;
  loc?: number;
  complexity?: number;
  typeSignature?: string;
}

export interface CodeEdge {
  id: string;
  source: string;
  target: string;
  type: 'import' | 'call' | 'usage' | 'inheritance';
  label?: string;
}

export interface GraphData {
  nodes: CodeNode[];
  edges: CodeEdge[];
}
