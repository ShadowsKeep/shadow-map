import { useState, useEffect } from 'react';
import { GraphData } from '../types';
import { vscode } from '../utils/vscode';

export function useGraphData() {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    vscode.postMessage({ command: 'getGraph', text: '' });
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === 'graphData') {
        setData(message.data);
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Initial fetch
    fetchData();

    // Development fallback for browser testing
    if (!window.hasOwnProperty('acquireVsCodeApi')) {
        console.log('Running in browser, loading mock fixture data...');
        setTimeout(() => {
            const mockData: GraphData = {
              "nodes": [
                {
                  "id": "file:src\\index.ts",
                  "type": "file",
                  "label": "index.ts",
                  "filePath": "src\\index.ts",
                  "language": "typescript",
                  "loc": 9
                },
                {
                  "id": "file:src\\components\\MyComponent.tsx",
                  "type": "file",
                  "label": "MyComponent.tsx",
                  "filePath": "src\\components\\MyComponent.tsx",
                  "language": "typescript",
                  "loc": 13
                },
                {
                  "id": "external:react",
                  "type": "variable",
                  "label": "react",
                  "filePath": "node_modules",
                  "language": "n/a"
                },
                {
                  "id": "file:src\\services\\UserService.ts",
                  "type": "file",
                  "label": "UserService.ts",
                  "filePath": "src\\services\\UserService.ts",
                  "language": "typescript",
                  "loc": 18
                },
                {
                  "id": "file:src\\services\\UserService.ts:UserService",
                  "type": "class",
                  "label": "UserService",
                  "filePath": "src\\services\\UserService.ts",
                  "line": 3,
                  "code": "export class UserService {\r\n    private users: string[] = [];\r\n\r\n    constructor() {\r\n        console.log('UserService initialized ' + HELPER_CONSTANT);\r\n    }\r\n\r\n    addUser(name: string): void {\r\n        this.users.push(name);\r\n    }\r\n\r\n    getUsers(): string[] {\r\n        return this.users;\r\n    }...",
                  "loc": 15,
                  "complexity": 305,
                  "typeSignature": ""
                },
                {
                  "id": "file:src\\services\\UserService.ts:UserService:addUser",
                  "type": "function",
                  "label": "addUser",
                  "filePath": "src\\services\\UserService.ts",
                  "line": 10,
                  "code": "addUser(name: string): void {\r\n        this.users.push(name);\r\n    }",
                  "loc": 3,
                  "complexity": 70,
                  "typeSignature": "addUser(name: string): void"
                },
                {
                  "id": "file:src\\services\\UserService.ts:UserService:getUsers",
                  "type": "function",
                  "label": "getUsers",
                  "filePath": "src\\services\\UserService.ts",
                  "line": 14,
                  "code": "getUsers(): string[] {\r\n        return this.users;\r\n    }",
                  "loc": 3,
                  "complexity": 59,
                  "typeSignature": "getUsers(): string[]"
                },
                {
                  "id": "file:src\\utils\\helpers.ts",
                  "type": "file",
                  "label": "helpers.ts",
                  "filePath": "src\\utils\\helpers.ts",
                  "language": "typescript",
                  "loc": 9
                },
                {
                  "id": "file:src\\utils\\helpers.ts:add",
                  "type": "function",
                  "label": "add",
                  "filePath": "src\\utils\\helpers.ts",
                  "line": 4,
                  "code": "export function add(a: number, b: number): number {\r\n    return a + b;\r\n}",
                  "loc": 3,
                  "complexity": 75,
                  "typeSignature": "export function add(a: number, b: number): number"
                }
              ],
              "edges": [
                {
                  "id": "edge:file:src\\index.ts-file:src\\components\\MyComponent.tsx",
                  "source": "file:src\\index.ts",
                  "target": "file:src\\components\\MyComponent.tsx",
                  "type": "import"
                },
                {
                  "id": "edge:file:src\\index.ts-file:src\\services\\UserService.ts",
                  "source": "file:src\\index.ts",
                  "target": "file:src\\services\\UserService.ts",
                  "type": "import"
                },
                {
                  "id": "edge:file:src\\index.ts-file:src\\utils\\helpers.ts",
                  "source": "file:src\\index.ts",
                  "target": "file:src\\utils\\helpers.ts",
                  "type": "import"
                },
                {
                  "id": "edge:file:src\\components\\MyComponent.tsx-external:react",
                  "source": "file:src\\components\\MyComponent.tsx",
                  "target": "external:react",
                  "type": "import"
                },
                {
                  "id": "edge:file:src\\services\\UserService.ts-file:src\\utils\\helpers.ts",
                  "source": "file:src\\services\\UserService.ts",
                  "target": "file:src\\utils\\helpers.ts",
                  "type": "import"
                },
                {
                  "id": "edge:file:src\\services\\UserService.ts-file:src\\services\\UserService.ts:UserService",
                  "source": "file:src\\services\\UserService.ts",
                  "target": "file:src\\services\\UserService.ts:UserService",
                  "type": "usage"
                },
                {
                  "id": "edge:file:src\\services\\UserService.ts:UserService-file:src\\services\\UserService.ts:UserService:addUser",
                  "source": "file:src\\services\\UserService.ts:UserService",
                  "target": "file:src\\services\\UserService.ts:UserService:addUser",
                  "type": "usage"
                },
                {
                  "id": "edge:file:src\\services\\UserService.ts:UserService-file:src\\services\\UserService.ts:UserService:getUsers",
                  "source": "file:src\\services\\UserService.ts:UserService",
                  "target": "file:src\\services\\UserService.ts:UserService:getUsers",
                  "type": "usage"
                },
                {
                  "id": "edge:file:src\\utils\\helpers.ts-file:src\\utils\\helpers.ts:add",
                  "source": "file:src\\utils\\helpers.ts",
                  "target": "file:src\\utils\\helpers.ts:add",
                  "type": "usage"
                }
              ]
            };
            setData(mockData);
            setLoading(false);
        }, 500);
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return { data, loading, error, reload: fetchData };
}
