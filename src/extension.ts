import * as vscode from "vscode";
import { ShadowMapPanel } from "./panels/ShadowMapPanel";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("code-vis.start", () => {
      ShadowMapPanel.render(context.extensionUri);
    })
  );
}
