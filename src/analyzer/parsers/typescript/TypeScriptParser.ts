import { BaseParser, ParserOptions } from '../BaseParser';
import { GraphData, CodeNode, CodeEdge } from '../../types';
import { Project, SyntaxKind, Node, FunctionDeclaration, ClassDeclaration, MethodDeclaration, VariableDeclaration } from 'ts-morph';
import path from 'path';
import fs from 'fs';
import { Logger } from '../../../utilities/Logger';

export class TypeScriptParser extends BaseParser {
  canParse(filePath: string): boolean {
    return filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx');
  }

  async parse(rootPath: string, options?: ParserOptions): Promise<GraphData> {
    Logger.info(`Initializing TypeScript project for: ${rootPath}`);
    
    const project = new Project({
      tsConfigFilePath: path.join(rootPath, 'tsconfig.json'),
      skipAddingFilesFromTsConfig: false,
    });

    // If no tsconfig, add source files manually
    if (!fs.existsSync(path.join(rootPath, 'tsconfig.json'))) {
        Logger.info("No tsconfig.json found, adding source files manually...");
        project.addSourceFilesAtPaths([
            path.join(rootPath, '**/*.{ts,tsx,js,jsx}'),
            '!**/node_modules/**'
        ]);
    }

    const nodes: CodeNode[] = [];
    const edges: CodeEdge[] = [];

    const sourceFiles = project.getSourceFiles();
    Logger.info(`Found ${sourceFiles.length} source files to analyze.`);

    let processed = 0;
    for (const sourceFile of sourceFiles) {
      if (sourceFile.getFilePath().includes('node_modules')) continue;
      
      processed++;
      if (processed % 10 === 0) Logger.info(`Processed ${processed}/${sourceFiles.length} files...`);

      const filePath = path.relative(rootPath, sourceFile.getFilePath());
      const fileId = `file:${filePath}`;
      
      // File Node
      nodes.push({
        id: fileId,
        type: 'file',
        label: path.basename(filePath),
        filePath: filePath,
        language: 'typescript',
        loc: sourceFile.getEndLineNumber()
      });

      // Imports
      const imports = sourceFile.getImportDeclarations();
      for (const imp of imports) {
        const moduleSpecifier = imp.getModuleSpecifierValue();
        let targetId = '';
        
        // Try to resolve the module
        const sourceFileRef = imp.getModuleSpecifierSourceFile();
        if (sourceFileRef && !sourceFileRef.getFilePath().includes('node_modules')) {
             const targetPath = path.relative(rootPath, sourceFileRef.getFilePath());
             targetId = `file:${targetPath}`;
        } else {
             // External module
             targetId = `external:${moduleSpecifier}`;
             if (!nodes.find(n => n.id === targetId)) {
                 nodes.push({
                     id: targetId,
                     type: 'variable', // treating external packages as generic nodes for now
                     label: moduleSpecifier,
                     filePath: 'node_modules',
                     language: 'n/a'
                 });
             }
        }

        edges.push({
            id: `edge:${fileId}-${targetId}`,
            source: fileId,
            target: targetId,
            type: 'import'
        });
      }

      // Functions & Classes
      const functions = sourceFile.getFunctions();
      const classes = sourceFile.getClasses();
      const variables = sourceFile.getVariableDeclarations();

      // Helper to process nodes inside the file
      const processChildNode = (name: string, kind: 'function' | 'class' | 'variable', node: Node, parentId: string) => {
          const id = `${parentId}:${name}`;
          const text = node.getText();
          const loc = node.getEndLineNumber() - node.getStartLineNumber() + 1;
          
          let signature = '';
          if (Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node)) {
             signature = node.getSignature().getDeclaration().getText().split('{')[0].trim();
          } else if (Node.isVariableDeclaration(node)) {
             signature = node.getType().getText();
          }

          // Basic complexity: count control flow keywords
          const complexity = (text.match(/(if|else|for|while|switch|case|catch|&&|\|\||\\?)/g) || []).length + 1;

          nodes.push({
              id,
              type: kind,
              label: name,
              filePath: filePath,
              line: node.getStartLineNumber(),
              code: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
              loc,
              complexity,
              typeSignature: signature
          });
          
          // Edge from file to items
          edges.push({
              id: `edge:${parentId}-${id}`,
              source: parentId,
              target: id,
              type: 'usage' // Structural hierarchy essentially
          });
          
          return id;
      };

      functions.forEach((f: FunctionDeclaration) => {
          const name = f.getName();
          if (name) processChildNode(name, 'function', f, fileId);
      });

      classes.forEach((c: ClassDeclaration) => {
          const name = c.getName();
          if (name) {
              const classId = processChildNode(name, 'class', c, fileId);
              // Methods
              c.getMethods().forEach((m: MethodDeclaration) => {
                  const mName = m.getName();
                  processChildNode(mName, 'function', m, classId);
              })
          }
      });
      
      // Simple variable declarations
      variables.forEach((v: VariableDeclaration) => {
          const name = v.getName();
           // Only top level variables
           if (v.getParent()?.getParent()?.getKind() === SyntaxKind.SourceFile) {
               processChildNode(name, 'variable', v, fileId);
           }
      });
    }

    return { nodes, edges };
  }
}
