import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn, workspace, Range, Position } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { LanguageRegistry } from "../analyzer/LanguageRegistry";
import { Logger } from "../utilities/Logger";
import * as path from "path";

/**
 * This class manages the state and behavior of ShadowMap webview panels.
 * It contains all the data and methods for:
 * - Creating and rendering webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML and message listeners for the webview
 */
export class ShadowMapPanel {
  public static currentPanel: ShadowMapPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];
  private readonly _extensionUri: Uri;
  private _parserRegistry: LanguageRegistry;

  /**
   * The ShadowMapPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._parserRegistry = new LanguageRegistry();

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, this._extensionUri);

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension
   */
  public static render(extensionUri: Uri) {
    if (ShadowMapPanel.currentPanel) {
      // If the webview panel already exists reveal it
      ShadowMapPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        "code-vis",
        "Codebase Visualizer",
        ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            Uri.joinPath(extensionUri, "out"),
            Uri.joinPath(extensionUri, "webview-ui/build"),
          ],
        }
      );

      ShadowMapPanel.currentPanel = new ShadowMapPanel(panel, extensionUri);
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    ShadowMapPanel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the React webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.css"]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.js"]);

    const nonce = getNonce();

    // Tip: Use a CSP (Content Security Policy) to only allow scripts and styles from your extension
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Codebase Visualizer</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context
   *
   * @param webview A reference to the extension webview
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      async (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case "getGraph":
             // If a path is provided, use it. Otherwise default to workspace root (or empty string if none)
             const rootPath = text || (workspace.workspaceFolders ? workspace.workspaceFolders[0].uri.fsPath : "");
             
             if (!rootPath) {
                 Logger.warn("No workspace open to visualize!");
                 window.showErrorMessage("No workspace open to visualize!");
                 return;
             }

             Logger.info(`Analyzing: ${rootPath}`);
             window.setStatusBarMessage(`Shadow Map: Analyzing...`, 3000);
             
             try {
                const parser = this._parserRegistry.getParserForProject(rootPath);
                const graphData = await parser.parse(rootPath);
                
                Logger.info(`Analysis complete. Found ${graphData.nodes.length} nodes and ${graphData.edges.length} edges.`);
                
                // Send data back to webview
                webview.postMessage({
                    command: "graphData",
                    data: graphData
                });
             } catch (err) {
                 Logger.error(`Analysis failed: ${err}`);
                 window.showErrorMessage(`Analysis failed: ${err}`);
             }
            return;

          case "openFile":
            const relativePath = message.file;
            const line = message.line || 1;
            
            // Resolve to absolute path using workspace root
            const wsFolder = workspace.workspaceFolders ? workspace.workspaceFolders[0].uri.fsPath : "";
            if (!wsFolder) {
                Logger.error("No workspace folder found to resolve file path.");
                return;
            }

            const absolutePath = path.join(wsFolder, relativePath);

            Logger.debug(`Opening file: ${relativePath} -> ${absolutePath}:${line}`);

            try {
                const doc = await workspace.openTextDocument(Uri.file(absolutePath));
                await window.showTextDocument(doc, { 
                    selection: new Range(new Position(line - 1, 0), new Position(line - 1, 0)),
                    preview: true,
                    viewColumn: ViewColumn.One
                });
            } catch (error) {
                Logger.error(`Could not open file: ${absolutePath}. Error: ${error}`);
                window.showErrorMessage(`Could not open file: ${relativePath}`);
            }
            return;
        }
      },
      undefined,
      this._disposables
    );
  }
}
