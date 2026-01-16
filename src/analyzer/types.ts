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
  isHOC?: boolean;              // Higher-Order Component
  wrapsComponent?: string;      // For HOCs: what component it wraps
  isMemoized?: boolean;         // React.memo wrapped
  isLazy?: boolean;             // React.lazy wrapped
  usesForwardRef?: boolean;     // forwardRef pattern
  typeParameters?: string[];    // Generic type params: <T, K>
  isAsync?: boolean;            // async function
  isGenerator?: boolean;        // generator function*

  // Component/Function metadata
  props?: string[];
  state?: string[];
  hooks?: string[];             // All hooks used
  customHooks?: string[];       // Custom hooks specifically
  usesComponents?: string[]; // IDs of child components this component uses
  providesContext?: string[]; // Context names this component provides
  consumesContext?: string[]; // Context names this component consumes

  // Call graph
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
