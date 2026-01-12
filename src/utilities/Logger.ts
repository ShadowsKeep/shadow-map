import { ILogger } from './ILogger';

class ConsoleLogger implements ILogger {
    info(message: string): void {
        console.log(`[INFO] ${message}`);
    }
    warn(message: string): void {
        console.warn(`[WARN] ${message}`);
    }
    error(message: string | unknown): void {
        console.error(`[ERROR] ${message}`);
    }
    debug(message: string): void {
        console.debug(`[DEBUG] ${message}`);
    }
}

export class Logger {
    private static implementation: ILogger = new ConsoleLogger();

    public static use(impl: ILogger) {
        this.implementation = impl;
    }

    public static info(message: string) {
        this.implementation.info(message);
    }

    public static warn(message: string) {
        this.implementation.warn(message);
    }

    public static error(message: string | unknown) {
        this.implementation.error(message);
    }

    public static debug(message: string) {
        this.implementation.debug(message);
    }
}
