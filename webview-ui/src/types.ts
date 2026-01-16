export interface CodeNode {
  id: string;
  type: 'file' | 'function' | 'class' | 'variable' | 'interface' | 'screen' | 'component';
  label: string;
  filePath: string;
  line?: number;
  code?: string;
  // Metadata
  language?: string;
  loc?: number;
  complexity?: number;
  typeSignature?: string;
  framework?: 'nextjs' | 'react-native' | 'expo' | 'other';
  isExported?: boolean;
  props?: string[];
  state?: string[];
  hooks?: string[];
  usesComponents?: string[];
  providesContext?: string[];
  consumesContext?: string[];
  calls?: string[];
  calledBy?: string[];
}

export interface CodeEdge {
  id: string;
  source: string;
  target: string;
  type: 'import' | 'call' | 'usage' | 'inheritance' | 'navigation';
  label?: string;
}

export interface GraphData {
  nodes: CodeNode[];
  edges: CodeEdge[];
}
