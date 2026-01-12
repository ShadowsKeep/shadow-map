# Artifact Recovery and Project Research

- [x] Attempt to recover artifacts from previous sessions <!-- id: 0 -->
    - [x] List directories in brain folder <!-- id: 1 -->
    - [x] Check for recoverable files <!-- id: 2 -->
- [x] Research current project (if recovery fails) <!-- id: 3 -->
    - [x] Explore `d:\Hacking\AG test` <!-- id: 4 -->
    - [x] Identify project goals and technology <!-- id: 5 -->
    - [x] Perform deep research on the topic <!-- id: 6 -->

- [x] Detailed React AST Mapping Research <!-- id: 7 -->
    - [x] Research extracting props, state, imports, and constants <!-- id: 8 -->
    - [x] Research handling different React frameworks (Next.js, Vite, Remix, etc.) <!-- id: 9 -->
    - [x] Research navigation/routing extraction <!-- id: 10 -->
- [x] Debug "Missing Nodes" Issue <!-- id: 11 -->
    - [x] Analyze current node extraction logic <!-- id: 12 -->
    - [x] Reproduce the issue (if possible) or dry-run logic <!-- id: 13 -->
- [x] Universal Navigation Support <!-- id: 24 -->
    - [x] Implement `NavigationStrategy` interface <!-- id: 25 -->
    - [x] Implement `NextJsStrategy` and `ReactRouterStrategy` <!-- id: 26 -->
    - [x] Refactor `NavigationParser` to use strategies <!-- id: 27 -->
- [x] Run regression test <!-- id: 28 -->

- [ ] Refactor & Stabilization <!-- id: 15 -->
    - [ ] Extract `ILogger` interface and refactor `Logger.ts` <!-- id: 16 -->
    - [ ] Update `BaseParser` to accept `ILogger` <!-- id: 17 -->
    - [ ] Update `LanguageRegistry` and `ShadowMapPanel` to inject Logger <!-- id: 18 -->

- [ ] Deep React Mapping <!-- id: 20 -->
    - [ ] Update `types.ts` with `props`, `state`, `hooks` <!-- id: 21 -->
    - [x] Implement `ReactParser` logic in `TypeScriptParser.ts` <!-- id: 22 -->
    - [ ] Update `debug-parser.ts` to verify React metadata <!-- id: 23 -->
