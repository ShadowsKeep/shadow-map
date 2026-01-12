import * as vscode from 'vscode';
import { ILogger } from './ILogger';

export class VSCodeLogger implements ILogger {
    private _outputChannel: vscode.OutputChannel;

    constructor() {
        this._outputChannel = vscode.window.createOutputChannel("Shadow Map");
    }

    info(message: string): void {
        this._outputChannel.appendLine(`[INFO] ${message}`);
    }

    warn(message: string): void {
        this._outputChannel.appendLine(`[WARN] ${message}`);
    }

    error(message: string | unknown): void {
        this._outputChannel.appendLine(`[ERROR] ${this.format(message)}`);
        this._outputChannel.show(true);
    }

    debug(message: string): void {
        this._outputChannel.appendLine(`[DEBUG] ${message}`);
    }

    private format(value: unknown): string {
        if (value instanceof Error) {
            return value.stack || value.message;
        }
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    }
}
