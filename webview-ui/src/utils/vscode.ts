import { WebviewApi } from "vscode-webview";

class VSCodeAPIWrapper {
  private readonly vsCodeApi: any;

  constructor() {
    if (typeof acquireVsCodeApi === "function") {
      this.vsCodeApi = acquireVsCodeApi();
    }
  }

  public postMessage(message: unknown) {
    if (this.vsCodeApi) {
      this.vsCodeApi.postMessage(message);
    } else {
      console.log("VS Code API not available, mocked message:", message);
    }
  }

  public getState(): unknown | undefined {
    if (this.vsCodeApi) {
      return this.vsCodeApi.getState();
    }
    return undefined;
  }

  public setState(newState: unknown): void {
    if (this.vsCodeApi) {
      this.vsCodeApi.setState(newState);
    }
  }
}

export const vscode = new VSCodeAPIWrapper();
