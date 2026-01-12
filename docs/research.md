# Deep Research: Codebase Visualization & LLM Context

## 1. Codebase Visualization Landscape

Visualizing software architecture is a solved problem with several robust approaches. The goal is to balance "wow factor" (visuals) with "utility" (understanding).

### Top Visualization Libraries
*   **Cytoscape.js**: The industry standard for interactive graph analysis. robust, handles thousands of nodes, and has rich layout options.
*   **React Flow / React Force Graph**: Excellent for modern, component-based UIs. `react-force-graph` provides the "dynamic/alive" feel with physics-based layout.
*   **D3.js**: Infinite customization but high complexity. Good for unique, non-standard visualizations.
*   **Dagre**: (Currently used by this project) Good for directed acyclic graphs (DAGs) like helping with automatic layouting, often used in conjunction with other renderers.

### Competitor Analysis
*   **Dependency Cruiser**: Generates static graphs (SVG/images). Good for CI/CD, less for exploration.
*   **DepViz**: Interactive call graph/module visualizer.
*   **AppMap**: Runtime analysis visualization (dynamic vs static).
*   **Shadows Map (This Project)**: Differentiates by focusing on *Aesthetics* (Glassmorphism) and *LLM Context*, filling a specific niche for AI-native developers.

## 2. LLM Context Extraction

The second pillar of this project is providing "context" to AI agents.

### The Problem
Copy-pasting file contents is inefficient and loses structural relationships. LLMs need:
1.  **Definitions**: Interface shapes, class signatures.
2.  **Relationships**: "Who calls this?" and "What does this import?".
3.  **Economy**: Maximizing information density per token.

### Best Practices via `ts-morph`
`ts-morph` is the correct tool choice here. It allows traversing the AST to extract only high-value information:
*   **Extract Signatures**: Get standard function signatures without implementation details for high-level context.
*   **Dependency Walking**: Resolve imports to find definitions in other files.
*   **Pruning**: Remove comments, internal implementation details, and test files to save tokens.

### Strategy for "Shadows Map"
*   **Node-Specific Context**: When a user clicks a Class node, generate a prompt snippet that includes:
    *   The Class source code (minified/stripped).
    *   Interfaces it implements.
    *   Signatures of imported dependencies.
*   **Graph Context**: Export the generic JSON structure of the graph (nodes/edges) so the LLM understands the *architecture* before diving into code.

## 3. Technology Recommendations for "Shadow Map"

| Component | Recommendation | Reason |
| :--- | :--- | :--- |
| **Graph Rendering** | **React Flow** or **Cytoscape.js** | Easier to implement interactive features (drag, zoom, click) than raw D3. Supports the "Glassmorphism" UI better via React components. |
| **Layout Engine** | **Dagre** (Keep it) | Excellent for hierarchical layouts (Top-Down) which match software dependency structures better than force-directed chaos. |
| **Analysis** | **ts-morph** (Keep it) | Best-in-class wrapper for TypeScript Compiler API. |
| **UI Framework** | **React + Tailwind** | For the "premium" glassmorphic look. VS Code webviews support React well. |
