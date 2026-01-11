import { TypeScriptParser } from '../analyzer/parsers/typescript/TypeScriptParser';
import path from 'path';

async function verify() {
    // Adjusted path for when running from dist/scripts/verify-fixture.js
    // dist/scripts -> dist -> code-vis -> AG test -> test-fixture
    const fixturePath = path.resolve(__dirname, '../../../test-fixture');
    console.log(`Verifying fixture at: ${fixturePath}`);
    
    const parser = new TypeScriptParser();
    try {
        const result = await parser.parse(fixturePath);
        
        console.log('--- Verification Results ---');
        console.log(`Total Nodes: ${result.nodes.length}`);
        console.log(`Total Edges: ${result.edges.length}`);
        
        const files = result.nodes.filter(n => n.type === 'file');
        console.log(`Files detected: ${files.length} (${files.map(f => f.label).join(', ')})`);
        
        const classes = result.nodes.filter(n => n.type === 'class');
        console.log(`Classes detected: ${classes.length} (${classes.map(c => c.label).join(', ')})`);

        const functions = result.nodes.filter(n => n.type === 'function');
        console.log(`Functions/Methods detected: ${functions.length}`);

        console.log('----------------------------');
        
        // Simple assertions
        if (files.length < 4) console.error('FAIL: Expected at least 4 files.');
        else console.log('PASS: File count looks correct.');

        if (classes.length < 1) console.error('FAIL: Expected at least 1 class.');
        else console.log('PASS: Class count looks correct.');

        console.log('--- JSON OUTPUT START ---');
        console.log(JSON.stringify(result, null, 2));
        console.log('--- JSON OUTPUT END ---');

    } catch (err) {
        console.error('Verification failed:', err);
    }
}

verify();
