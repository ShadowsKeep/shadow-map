# Implementation Plan - Shadows Map 2.0

## Goal Description
Upgrade "Shadows Map" to support **Deep React Mapping** (Props, State, Hooks) and **Universal Navigation** (Next.js, React Router, Remix), while fixing the current "missing nodes" bug by decoupling the analysis engine from VS Code.

## User Review Required
> [!IMPORTANT]
> **Architecture Change**: I will decouple the `Logger` from the `analyzer` package. The analyzer will accept an `ILogger` interface. This allows us to run the parser in a CLI/Web Worker environment, which is critical for stability and testing.

## Proposed Changes

### 1. Refactor & Stabilization (Fixing Bugs)
Decouple the core logic to enable standalone testing.

#### [MODIFY] [Logger.ts](file:///d:/Hacking/AG test/src/utilities/Logger.ts)
- Create `ILogger` interface.
- Make the static `Logger` class implement/adapt this interface.

#### [MODIFY] [BaseParser.ts](file:///d:/Hacking/AG test/src/analyzer/parsers/BaseParser.ts)
- Accept `ILogger` in constructor (optional, default to console in CJS/CLI, or VSCode logger in extension).

### 2. Deep React Mapping
Extract detailed component metadata using `ts-morph`.

#### [MODIFY] [types.ts](file:///d:/Hacking/AG test/src/analyzer/types.ts)
- Add fields for `props`, `state`, `hooks` to `CodeNode`.

#### [MODIFY] [TypeScriptParser.ts](file:///d:/Hacking/AG test/src/analyzer/parsers/typescript/TypeScriptParser.ts)
- Enhance `processChildNode` to identify React Components.
- Extract `interface` definitions matching Component props.
- Detect `useState`, `useReducer`, and `useContext` calls.

### 3. Universal Navigation
Support multiple routing paradigms via a Strategy pattern.

#### [NEW] [NavigationStrategy.ts](file:///d:/Hacking/AG test/src/analyzer/parsers/navigation/NavigationStrategy.ts)
- Define `NavigationStrategy` interface.

#### [NEW] [NextJsStrategy.ts](file:///d:/Hacking/AG test/src/analyzer/parsers/navigation/strategies/NextJsStrategy.ts)
- Implement regex/glob matching for App Router (`app/**/page.tsx`) and Pages Router (`pages/**/*.tsx`).

#### [NEW] [ReactRouterStrategy.ts](file:///d:/Hacking/AG test/src/analyzer/parsers/navigation/strategies/ReactRouterStrategy.ts)
- Detect `<Route path="...">` and `useNavigate()` calls.

#### [MODIFY] [NavigationParser.ts](file:///d:/Hacking/AG test/src/analyzer/parsers/NavigationParser.ts)
- Detect framework and select appropriate strategy.

## Verification Plan

### Automated Tests
I will create a standalone test script `src/test/verify-parser.ts` (that doesn't depend on VSCode) to verify:
1.  **Node Count**: Ensure > 0 nodes are returned for the current project.
2.  **React Props**: Check if `ShadowMapPanel` component node has "props" metadata.
3.  **Navigation**: Check if edges exist between `extension.ts` and `ShadowMapPanel.ts` (or relevant nav links).

Run with:
```bash
npx tsx src/test/verify-parser.ts
```

### Manual Verification
1.  Build the extension (`npm run compile`).
2.  Launch Debug Instance (`F5`).
3.  Run command `Shadows Map: Open Visualizer`.
4.  Verify nodes appear on the canvas.
5.  Click a node to verify "Props" and "State" details are visible in the side panel (if UI supports it) or console logs.
