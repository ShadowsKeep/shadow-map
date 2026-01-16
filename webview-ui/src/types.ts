export interface CodeNode {
  id: string;
  type: 'file' | 'function' | 'class' | 'variable' | 'interface' | 'screen' | 'component' | 'custom-hook';
  label: string;
  filePath: string;
  language?: string;
  line?: number;
  loc?: number;
  complexity?: number;
  code?: string;
  typeSignature?: string;
  isExported?: boolean;

  // Advanced patterns
  isHOC?: boolean;
  wrapsComponent?: string;
  isMemoized?: boolean;
  isLazy?: boolean;
  usesForwardRef?: boolean;
  typeParameters?: string[];
  isAsync?: boolean;
  isGenerator?: boolean;

  // Component/Function metadata
  props?: string[];
  state?: string[];
  hooks?: string[];
  customHooks?: string[];
  usesComponents?: string[];
  providesContext?: string[];
  consumesContext?: string[];

  // Call graph
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
