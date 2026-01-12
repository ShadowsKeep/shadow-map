
import { TypeScriptParser } from './src/analyzer/parsers/typescript/TypeScriptParser';
import * as path from 'path';

async function run() {
    console.log("Starting parser test...");
    const parser = new TypeScriptParser();
    const rootPath = path.resolve(__dirname, 'webview-ui'); // Run on the webview-ui project
    console.log(`Analyzing: ${rootPath}`);

    // Skip canParse for directory, assume we want to parse this project
    try {
        const data = await parser.parse(rootPath);
        console.log(`Nodes found: ${data.nodes.length}`);
        console.log(`Edges found: ${data.edges.length}`);

        if (data.nodes.length === 0) {
            console.error("NO NODES FOUND! Parser failed.");
        } else {
            const interestingNodes = data.nodes.filter(n => n.props || n.state || n.hooks);
            console.log(`Found ${interestingNodes.length} nodes with React metadata.`);
            console.log("Sample Interesting Nodes:", JSON.stringify(interestingNodes.slice(0, 3), null, 2));
        }
    } catch (error) {
        console.error("Parser crashed:", error);
    }
}

run();
