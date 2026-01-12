# Shadows Map Upgrade Walkthrough

## Overview
We have successfully upgraded Shadows Map to support **Deep React Mapping** and **Universal Navigation**. This allows the visualizer to understand internal component state (Props, State, Hooks) and navigation flows across multiple frameworks (Next.js, React Router).

## key Features Implemented

### 1. Robust Parser Infrastructure
- **Decoupled Logger**: The parser logic is no longer tied to VS Code's window API, allowing it to run in CLI environments and Web Workers.
- **Test Script**: `debug-parser.ts` is available to verify parser logic without launching the extension.

### 2. Deep React Mapping
The analyzer now extracts detailed metadata from React components:
- **Props**: Extracts prop names and types from component signatures.
- **State**: Identifies `useState` hooks and extracts state variable names (e.g., `count`, `setCount`).
- **Hooks**: Catalogs all custom and built-in hooks used (e.g., `useGraphData`, `useEffect`).

### 3. Universal Navigation
We introduced a **Strategy Pattern** for navigation analysis, currently supporting:
- **Next.js**: Pages Router (`pages/`) and App Router (`app/`).
- **React Router**: `<Route path="...">`, `<Link to="...">`, and `useNavigate()` calls.

## Verification Results

We verified the implementation using the `debug-parser.ts` script on the `webview-ui` codebase.

**Output Snippet:**
```json
{
    "id": "file:src\\App.tsx:App",
    "type": "function",
    "label": "App",
    "state": ["selectedNode", "viewMode"],
    "hooks": ["useGraphData", "useState"]
}
```

## How to Test
To verify the parser yourself:
1. Open a terminal in the project root.
2. Run: `npx tsx debug-parser.ts`
3. This will analyze the `webview-ui` folder and output JSON data representing the graph nodes and edges.
