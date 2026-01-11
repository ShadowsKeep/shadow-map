# Shadows Map (Codebase Visualizer)

A stunning, interactive codebase visualization tool designed to bridge the gap between complex software architectures and human understanding. Shadows Map empowers developers to explore file dependencies, class hierarchies, and function calls through a premium, glassmorphic interface.

![Shadows Map Screenshot](./images/screenshot.png)

## Features

### 🔍 Interactive Visualization
- **Dynamic Node Graph**: Visualize your entire codebase as an interconnected graph.
- **Color-Coded Nodes**: Instantly identify node types:
  - 🔵 **Files** (Blue)
  - 🟣 **Classes** (Purple)
  - 🟢 **Functions** (Green)
  - 🟠 **External Libraries** (Orange)
- **Focus Mode**: Click any node to dim unrelated elements and highlight direct dependencies.

### 🤖 AI-Ready Context
- **One-Click Export**: Generate a serialized JSON representation of your current graph context.
- **Node-Specific Context**: Click into any node (Class, File, Function) to copy detailed, dependency-aware context specifically for that element.
- **Optimized for LLMs**: Paste the structured data directly into AI agents (like Claude, ChatGPT, or Gemini) to give them deep awareness of your project structure without manually copying files.

### ✨ Premium UX
- **Glassmorphism Design**: Modern, translucent UI components that feel native to high-end workflows.
- **Smooth Animations**: Fluid transitions for layout changes and interactions.

## Installation

### From VSIX (Coming Soon)
1.  Download the `.vsix` file from the [Releases](https://github.com/yourusername/shadows-map/releases) page.
2.  Open VS Code, go to Extensions (`Ctrl+Shift+X`), click `...` > `Install from VSIX...`.

### For Development
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    npm run install:all
    ```
3.  Run the extension:
    - Open the project in VS Code.
    - Press `F5` to launch the Extension Host.
    - Run the command `Shadows Map: Show Code Map`.

## Usage

1.  **Open a Workspace**: Open any TypeScript/JavaScript project in VS Code.
2.  **Launch Shadows Map**: Run the command `Show Code Map` from the Command Palette (`Ctrl+Shift+P`).
3.  **Explore**: Drag, zoom, and click nodes to explore the architecture.
4.  **Export Context**: Click the "Copy Context" button in the header to grab the graph structure for your AI workflow.

## Roadmap

### 🚀 Upcoming Features (v1.1)
- **Multi-Repo Analysis** (Paid/Enterprise): Correlate dependencies across multiple repositories (API + Frontend).
- **Custom Themes**: User-configurable color palettes.
- **Git Integration**: Visualize changes and active branches.

### 🔮 Long-Term Vision
- **Self-Hosted Enterprise Server**: Centralized knowledge graph for large teams.
- **Deep AST Analysis**: Support for Python, Go, and Rust.

## License
MIT
