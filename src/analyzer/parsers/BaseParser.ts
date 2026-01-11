import { GraphData } from '../types';

export interface ParserOptions {
  entryPoint?: string;
  exclude?: string[];
}

export abstract class BaseParser {
  abstract parse(rootPath: string, options?: ParserOptions): Promise<GraphData>;
  abstract canParse(filePath: string): boolean;
}
