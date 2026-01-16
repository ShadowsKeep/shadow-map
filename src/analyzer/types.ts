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
  // React Metadata
  props?: string[];
  state?: string[];
  hooks?: string[];
  // Component Composition
  usesComponents?: string[]; // IDs of child components this component uses
  // Context API
  providesContext?: string[]; // Context names this component provides
  consumesContext?: string[]; // Context names this component consumes
  // Call Graph
  calls?: string[]; // IDs of functions/methods this node calls
  calledBy?: string[]; // IDs of functions/methods that call this node
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
