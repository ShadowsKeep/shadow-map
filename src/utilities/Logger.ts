import * as vscode from 'vscode';

export class Logger {
    private static _outputChannel: vscode.OutputChannel;

    private static get outputChannel(): vscode.OutputChannel {
        if (!this._outputChannel) {
            this._outputChannel = vscode.window.createOutputChannel("Shadow Map");
        }
        return this._outputChannel;
    }

    public static info(message: string) {
        this.outputChannel.appendLine(`[INFO] ${message}`);
    }

    public static warn(message: string) {
        this.outputChannel.appendLine(`[WARN] ${message}`);
    }

    public static error(message: string | unknown) {
        this.outputChannel.appendLine(`[ERROR] ${this.format(message)}`);
        this.outputChannel.show(true); // Bring to front on error
    }

    public static debug(message: string) {
        // Could be conditional
        this.outputChannel.appendLine(`[DEBUG] ${message}`);
    }

    private static format(value: unknown): string {
        if (value instanceof Error) {
            return value.stack || value.message;
        }
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    }
}
