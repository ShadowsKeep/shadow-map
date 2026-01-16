# Shadow Map - Code Visualizer

**Comprehensive TypeScript & React codebase visualization with AI-ready context export.**

Shadow Map V2 is a powerful VS Code extension that visualizes your entire codebase as an interactive dependency graph, mapping components, hooks, interfaces, functions, and their relationships. Perfect for understanding complex architectures and providing AI coding assistants with deep project context.

![Shadow Map Icon](./images/icon.png)

---

## ✨ Features

### 🎯 **Comprehensive Code Mapping**

Shadow Map detects and visualizes **everything** in your TypeScript/React codebase:

- **Components** - All React components with full metadata
- **Custom Hooks** - Automatically detected and properly categorized
- **Interfaces & Types** - Complete type system mapping
- **Functions** - Regular functions, async, generators
- **Call Graphs** - Function and component relationships
- **Dependencies** - Import/export relationships

**Result**: See 3x more code elements than basic tools (60+ nodes vs 19)

### 🧩 **Advanced React Support**

- ✅ Component composition tracking (`usesComponents`)
- ✅ Custom hooks identification (`type: "custom-hook"`)
- ✅ HOC (Higher-Order Component) detection
- ✅ React optimization patterns (`memo`, `lazy`, `forwardRef`)
- ✅ Context API tracking (providers & consumers)
- ✅ Props, state, and hooks metadata

### 📐 **TypeScript Deep Dive**

- ✅ Generic type parameters (`<T, K>`)
- ✅ Interface, Type Alias, and Enum mapping
- ✅ Async/Generator function detection
- ✅ JSDoc documentation capture
- ✅ Export status tracking
- ✅ Comprehensive type signatures

### 🤖 **AI-Ready Context Export**

Click "Copy AI Context" on any node to get:
- Complete node metadata with all V2 enhancements
- React-specific information (props, state, hooks, composition)
- Full dependency trees
- Call graphs
- Formatted JSON + Markdown for easy AI integration

Perfect for Claude, ChatGPT, Gemini, or any LLM!

### 🔍 **Interactive Visualization**

- **Dynamic Graph** - Zoom, pan, drag nodes
- **Smart Search** - Find components, hooks, interfaces instantly
- **Advanced Filters** - Filter by type, complexity, export status
- **Color Coding** - Visual distinction by node type
- **Focus Mode** - Click nodes to see details and relationships

---

## 🚀 Quick Start

1. **Install** the extension from the marketplace
2. **Open** a TypeScript/React project in VS Code
3. **Run** command: `Shadow Map: Open Visualizer` (Ctrl+Shift+P)
4. **Explore** your codebase as an interactive graph!

---

## 📊 What Makes V2 Different?

### Before Shadow Map V2:
- Basic file/function detection
- Limited metadata
- No React-specific features
- 19 nodes detected

### With Shadow Map V2:
- **Comprehensive mapping** of all code elements
- **Rich metadata** for every node
- **Full React & TypeScript support**
- **60+ nodes detected** (+216% increase!)
- Custom hooks, HOCs, generics, Context API, and more

---

## 💡 Use Cases

### **For Developers**
- Understand unfamiliar codebases quickly
- Visualize component hierarchies
- Track dependencies and relationships
- Identify optimization opportunities
- Document architecture

### **For AI-Assisted Development**
- Export rich context for AI coding assistants
- Provide comprehensive project structure to LLMs
- Get better AI suggestions with full context
- Accelerate development with AI pair programming

### **For Teams**
- Onboard new developers faster
- Review architecture decisions
- Plan refactoring efforts
- Identify circular dependencies
- Maintain code quality

---

## 📋 Requirements

- VS Code 1.80.0 or higher
- TypeScript or JavaScript project
- React projects get enhanced detection

---

## 🎨 Extension Settings

Shadow Map works out of the box with no configuration required!

Future versions will add customizable settings for:
- Color themes
- Filter presets
- Export formats
- Graph layout options

---

## 🔧 Known Issues

- Webview Phase 2 UI enhancements temporarily disabled (backend fully functional)
- Very large projects (>1000 files) may take time to analyze

See [Issues](https://github.com/NICKLOUBSER/shadow-map/issues) for the latest status.

---

## 📝 Release Notes

### 2.0.0 - Major Release

**Complete TypeScript/React mapping overhaul!**

#### Added
- Custom Hooks detection with dedicated node type
- HOC identification
- React optimization patterns (memo, lazy, forwardRef)
- Generic type parameters extraction
- Async/Generator function detection
- JSDoc documentation capture
- Interface, Type Alias, and Enum mapping
- Enhanced call graphs and relationships
- Comprehensive AI context export

#### Improved
- 216% more code elements detected
- Accurate export detection
- Component detection for all JSX patterns
- Performance optimizations

See [CHANGELOG](CHANGELOG.md) for full details.

---

## 🤝 Contributing

Contributions welcome! Please see our [GitHub repository](https://github.com/NICKLOUBSER/shadow-map) for guidelines.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with:
- [ts-morph](https://github.com/dsherret/ts-morph) - TypeScript AST manipulation
- [React Flow](https://reactflow.dev/) - Graph visualization
- [Dagre](https://github.com/dagrejs/dagre) - Graph layout  

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/NICKLOUBSER/shadow-map/issues)
- **Discussions**: [GitHub Discussions](https://github.com/NICKLOUBSER/shadow-map/discussions)

---

**Enjoy visualizing your code with Shadow Map! 🗺️**
