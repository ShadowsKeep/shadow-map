import * as vscode from "vscode";
import { ShadowMapPanel } from "./panels/ShadowMapPanel";
import { Logger } from "./utilities/Logger";
import { VSCodeLogger } from "./utilities/VSCodeLogger";

export function activate(context: vscode.ExtensionContext) {
  Logger.use(new VSCodeLogger());
  context.subscriptions.push(
    vscode.commands.registerCommand("shadow-map.start", () => {
      ShadowMapPanel.render(context.extensionUri);
    })
  );
}
