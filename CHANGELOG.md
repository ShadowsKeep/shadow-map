# Changelog

All notable changes to the Shadow Map extension will be documented in this file.

## [2.0.0] - 2026-01-17

### 🎉 Major Release - Comprehensive TypeScript & React Mapping

This release represents a complete overhaul of Shadow Map with **3x more code elements** detected and comprehensive React/TypeScript support.

#### ✨ Added

**React Pattern Detection**
- Custom Hooks detection with new `custom-hook` node type
- Higher-Order Components (HOCs) identification  
- React optimization pattern flags (`memo`, `lazy`, `forwardRef`)
- Separated custom hooks from built-in hooks in metadata
- Component composition tracking

**TypeScript Advanced Features**
- Generic type parameters extraction (`<T, K>`)
- Async/Generator function detection
- JSDoc documentation capture
- Interface, Type Alias, and Enum mapping
- Export status tracking

**Enhanced Metadata**
- 11 new CodeNode fields
- React-specific: `props`, `state`, `hooks`, `customHooks`, `usesComponents`
- Context API: `providesContext`, `consumesContext`
- Type info: `typeParameters`, `isAsync`, `isGenerator`
- Patterns: `isHOC`, `wrapsComponent`, `isMemoized`, `isLazy`, `usesForwardRef`

**Call Graph & Relationships**
- Function call graph building (`calls`, `calledBy`)
- Component composition relationships
- Context provider/consumer tracking
- Inheritance tracking

#### 🔧 Fixed
- Default export detection for components
- Component detection for all JSX patterns (arrow functions, implicit returns)
- Top-level variable hierarchy detection
- Export status accuracy

#### 📊 Performance
- Two-pass parsing for efficiency
- Optimized AST traversal
- Enhanced node coverage: **60 nodes vs 19 originally (+216%)**

#### 🎨 UI Enhancements
- Search and filter component
- Type-based filtering
- Complexity range filters
- Export status filters
- Enhanced copy context with comprehensive metadata

---

## [0.0.1] - Initial Release

### Added
- Basic TypeScript/JavaScript visualization
- File, function, and class detection
- Simple dependency graph
- Interactive graph UI
- Copy context for AI integration

---

## Release Notes

### V2.0.0 Highlights

Shadow Map V2 now provides **comprehensive mapping** of TypeScript and React codebases:

- **Custom Hooks**: Automatically detected and properly typed
- **Full React Support**: Components, hooks, context, composition
- **Type Information**: Generics, interfaces, enums, type aliases
- **Call Graphs**: Complete function and component relationships
- **AI-Ready**: Enhanced context export with all metadata

**Upgrade Impact**: Existing projects will see significantly more nodes and relationships detected. The extension now maps virtually every code element developers need to understand project structure.
