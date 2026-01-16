import { BaseParser } from './parsers/BaseParser';
import { EnhancedTypeScriptParser } from './parsers/typescript/EnhancedTypeScriptParser';

export class LanguageRegistry {
  private parsers: BaseParser[] = [];

  constructor() {
    this.registerParser(new EnhancedTypeScriptParser());
  }

  registerParser(parser: BaseParser) {
    this.parsers.push(parser);
  }

  getParserForFile(filePath: string): BaseParser | undefined {
    return this.parsers.find(p => p.canParse(filePath));
  }

  // For the project level, we might default to TS for now or detect based on file presence
  // But our TS parser handles JS too.
  getParserForProject(rootPath: string): BaseParser {
    // Simplified strategy: Just return TS parser for now as it handles JS/TS
    return this.parsers[0];
  }
}
