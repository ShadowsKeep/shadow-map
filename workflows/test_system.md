---
description: Test the Codebase Visualizer System
---

This workflow guides you through the process of testing the Codebase Visualizer extension, including building, packaging, and verifying functionality in the VS Code Extension Host.

## 1. Clean and Prepare
Ensure no old processes are running and dependencies are fresh.

```bash
taskkill /F /IM node.exe
npm run install:all
```

## 2. Build the Project
Compile both the extension and the webview UI.

// turbo
```bash
npm run compile
npm run build:webview
```

## 3. Launch Extension Host
To test the full integration (including "Open File" navigation), you must run the extension in the VS Code Host.

1.  Open the "Run and Debug" side panel in VS Code.
2.  Select "Run Extension" from the dropdown.
3.  Press **F5**.
4.  In the new **Extension Development Host** window:
    - Open a folder (e.g., this project itself).
    - Run command: `Shadows Map: Show Code Map`.

## 4. Verification Checklist

### UI & Styling
- [ ] **Glass Controls**: Check bottom-left zoom/fit buttons. They should be dark, translucent, and blurred (not white).
- [ ] **Node Colors**: Files (Blue), Classes (Purple), Functions (Green).
- [ ] **Selection**: Click a node. Is the color preserved and highlighted?

### Interactive Features
- [ ] **Navigation**: Click the file path (e.g., `src/extension.ts:50`) in the customized side panel. **Did it open the file in the editor?**
- [ ] **AI Context**:
    - Click "Copy AI Context" on a node.
    - Paste into a notepad or AI chat.
    - Check if it contains: `code`, `imports`, `used_by`, `complexity`.

## 5. Packaging (Optional)
If everything works, package the extension.

```bash
vsce package
```
