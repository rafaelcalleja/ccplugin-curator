/**
 * Functional test for MkCurator
 * Tests the complete flow: scan → normalize → select → transform → save
 */
import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanAndNormalizePlugins } from '../src/lib/normalize.js';
import { saveCuratedPlugin, buildCuratedPlugin } from '../src/lib/save.js';
import { reverseTransform } from '../src/lib/reverse-transform.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);
async function runTests() {
    console.log('🧪 Starting functional tests...\n');
    let testsRun = 0;
    let testsPassed = 0;
    let testsFailed = 0;
    // Test 1: Scan and normalize plugin
    console.log('Test 1: Scan and normalize test plugin');
    try {
        const testPluginDir = path.join(projectRoot, 'test-plugin');
        const plugins = await scanAndNormalizePlugins(testPluginDir);
        assert.strictEqual(plugins.length, 1, 'Should find exactly 1 plugin');
        assert.strictEqual(plugins[0].name, 'test-plugin', 'Plugin name should be "test-plugin"');
        assert.strictEqual(plugins[0].version, '1.0.0', 'Version should be 1.0.0');
        assert.strictEqual(plugins[0].description, 'Test plugin with all component types');
        console.log('✅ Test 1 passed: Plugin scanned and normalized correctly\n');
        testsPassed++;
    }
    catch (error) {
        console.error('❌ Test 1 failed:', error);
        testsFailed++;
    }
    testsRun++;
    // Test 2: Verify auto-discovery of components
    console.log('Test 2: Verify auto-discovery of components');
    try {
        const testPluginDir = path.join(projectRoot, 'test-plugin');
        const plugins = await scanAndNormalizePlugins(testPluginDir);
        const plugin = plugins[0];
        assert.strictEqual(plugin.commands.length, 2, 'Should discover 2 commands');
        assert.ok(plugin.commands.includes('commands/analyze.md'), 'Should include analyze.md');
        assert.ok(plugin.commands.includes('commands/build.md'), 'Should include build.md');
        assert.strictEqual(plugin.agents.length, 1, 'Should discover 1 agent');
        assert.ok(plugin.agents.includes('agents/reviewer.md'), 'Should include reviewer.md');
        assert.strictEqual(plugin.skills.length, 1, 'Should discover 1 skill');
        assert.ok(plugin.skills.includes('skills/test-skill'), 'Should include test-skill');
        assert.strictEqual(plugin.hooks.length, 2, 'Should discover 2 hooks');
        assert.strictEqual(plugin.hooks[0].event, 'SessionStart', 'First hook should be SessionStart');
        assert.strictEqual(plugin.hooks[1].event, 'PreToolUse', 'Second hook should be PreToolUse');
        assert.strictEqual(plugin.mcps.length, 2, 'Should discover 2 MCP servers');
        assert.strictEqual(plugin.mcps[0].name, 'test-server', 'First MCP should be test-server');
        assert.strictEqual(plugin.mcps[1].name, 'filesystem', 'Second MCP should be filesystem');
        console.log('✅ Test 2 passed: All components discovered correctly\n');
        testsPassed++;
    }
    catch (error) {
        console.error('❌ Test 2 failed:', error);
        testsFailed++;
    }
    testsRun++;
    // Test 3: Simulate selections and build curated plugin
    console.log('Test 3: Simulate selections and build curated plugin');
    try {
        const testPluginDir = path.join(projectRoot, 'test-plugin');
        const plugins = await scanAndNormalizePlugins(testPluginDir);
        const plugin = plugins[0];
        // Simulate user selections
        const selections = {
            'test-plugin': {
                commands: new Set(['commands/analyze.md']), // Select only analyze command
                agents: new Set(['agents/reviewer.md']), // Select the agent
                skills: new Set(), // Don't select skills
                hooks: new Set([0]), // Select first hook (SessionStart)
                mcps: new Set([0]), // Select first MCP (test-server)
            },
        };
        const curated = buildCuratedPlugin(plugins, selections, 'my-curated-plugin');
        assert.strictEqual(curated.name, 'my-curated-plugin', 'Curated plugin name should match');
        assert.strictEqual(curated.commands.length, 1, 'Should have 1 selected command');
        assert.strictEqual(curated.agents.length, 1, 'Should have 1 selected agent');
        assert.strictEqual(curated.skills.length, 0, 'Should have 0 selected skills');
        assert.strictEqual(curated.hooks.length, 1, 'Should have 1 selected hook');
        assert.strictEqual(curated.mcps.length, 1, 'Should have 1 selected MCP');
        console.log('✅ Test 3 passed: Curated plugin built correctly\n');
        testsPassed++;
    }
    catch (error) {
        console.error('❌ Test 3 failed:', error);
        testsFailed++;
    }
    testsRun++;
    // Test 4: Reverse transformation to official format
    console.log('Test 4: Reverse transformation to official format');
    try {
        const testPluginDir = path.join(projectRoot, 'test-plugin');
        const plugins = await scanAndNormalizePlugins(testPluginDir);
        const selections = {
            'test-plugin': {
                commands: new Set(['commands/analyze.md', 'commands/build.md']),
                agents: new Set(['agents/reviewer.md']),
                skills: new Set(['skills/test-skill']),
                hooks: new Set([0, 1]),
                mcps: new Set([0]),
            },
        };
        const curated = buildCuratedPlugin(plugins, selections, 'curated-plugin');
        const official = reverseTransform(curated);
        assert.strictEqual(official.name, 'curated-plugin', 'Name should be preserved');
        assert.ok(Array.isArray(official.commands), 'Commands should be an array');
        assert.strictEqual(official.commands.length, 2, 'Should have 2 commands');
        assert.ok(official.hooks, 'Hooks should exist');
        assert.ok(official.hooks.SessionStart, 'SessionStart hook should exist');
        assert.ok(official.hooks.PreToolUse, 'PreToolUse hook should exist');
        assert.ok(official.mcpServers, 'mcpServers should exist');
        assert.ok(official.mcpServers['test-server'], 'test-server MCP should exist');
        console.log('✅ Test 4 passed: Reverse transformation works correctly\n');
        testsPassed++;
    }
    catch (error) {
        console.error('❌ Test 4 failed:', error);
        testsFailed++;
    }
    testsRun++;
    // Test 5: Save curated plugin to file
    console.log('Test 5: Save curated plugin to file');
    try {
        const testPluginDir = path.join(projectRoot, 'test-plugin');
        const outputPath = path.join(projectRoot, 'test-output', 'curated.json');
        const plugins = await scanAndNormalizePlugins(testPluginDir);
        const selections = {
            'test-plugin': {
                commands: new Set(['commands/analyze.md']),
                agents: new Set(['agents/reviewer.md']),
                skills: new Set(['skills/test-skill']),
                hooks: new Set([0]),
                mcps: new Set([0, 1]),
            },
        };
        await saveCuratedPlugin(plugins, selections, outputPath, 'test-curated');
        // Verify file was created
        const fileExists = await fs
            .access(outputPath)
            .then(() => true)
            .catch(() => false);
        assert.ok(fileExists, 'Output file should exist');
        // Verify file contents
        const content = await fs.readFile(outputPath, 'utf-8');
        const saved = JSON.parse(content);
        assert.strictEqual(saved.name, 'test-curated', 'Saved plugin name should match');
        assert.ok(Array.isArray(saved.commands), 'Saved commands should be array');
        assert.strictEqual(saved.commands.length, 1, 'Should save 1 command');
        assert.ok(saved.mcpServers, 'Should have mcpServers');
        assert.ok(saved.mcpServers['test-server'], 'Should have test-server');
        assert.ok(saved.mcpServers['filesystem'], 'Should have filesystem');
        console.log('✅ Test 5 passed: Plugin saved correctly to file\n');
        testsPassed++;
    }
    catch (error) {
        console.error('❌ Test 5 failed:', error);
        testsFailed++;
    }
    testsRun++;
    // Test 6: Verify minimal output (default values omitted)
    console.log('Test 6: Verify minimal output format');
    try {
        const testPluginDir = path.join(projectRoot, 'test-plugin');
        const plugins = await scanAndNormalizePlugins(testPluginDir);
        // Select nothing
        const selections = {
            'test-plugin': {
                commands: new Set(),
                agents: new Set(),
                skills: new Set(),
                hooks: new Set(),
                mcps: new Set(),
            },
        };
        const curated = buildCuratedPlugin(plugins, selections, 'minimal-plugin');
        const official = reverseTransform(curated);
        // Verify defaults are omitted
        assert.strictEqual(official.version, undefined, 'Default version should be omitted');
        assert.strictEqual(official.description, undefined, 'Empty description should be omitted');
        assert.strictEqual(official.commands, undefined, 'Empty commands should be omitted');
        assert.strictEqual(official.agents, undefined, 'Empty agents should be omitted');
        assert.strictEqual(official.hooks, undefined, 'Empty hooks should be omitted');
        // Only name should remain
        assert.strictEqual(official.name, 'minimal-plugin', 'Name should always be present');
        console.log('✅ Test 6 passed: Minimal output format correct\n');
        testsPassed++;
    }
    catch (error) {
        console.error('❌ Test 6 failed:', error);
        testsFailed++;
    }
    testsRun++;
    // Test 7: Complete workflow test
    console.log('Test 7: Complete end-to-end workflow');
    try {
        const testPluginDir = path.join(projectRoot, 'test-plugin');
        const outputPath = path.join(projectRoot, 'test-output', 'workflow-test.json');
        // 1. Scan
        const plugins = await scanAndNormalizePlugins(testPluginDir);
        assert.strictEqual(plugins.length, 1, 'Step 1: Scan should find 1 plugin');
        // 2. Normalize (already done)
        const plugin = plugins[0];
        assert.ok(plugin.commands.length > 0, 'Step 2: Should have normalized commands');
        // 3. Select
        const selections = {
            'test-plugin': {
                commands: new Set(plugin.commands), // Select all commands
                agents: new Set(plugin.agents), // Select all agents
                skills: new Set(plugin.skills), // Select all skills
                hooks: new Set(plugin.hooks.map((_, i) => i)), // Select all hooks
                mcps: new Set(plugin.mcps.map((_, i) => i)), // Select all MCPs
            },
        };
        // 4. Build
        const curated = buildCuratedPlugin(plugins, selections, 'complete-plugin');
        assert.strictEqual(curated.commands.length, 2, 'Step 4: Should build with all commands');
        // 5. Transform
        const official = reverseTransform(curated);
        assert.ok(official.name, 'Step 5: Should transform to official format');
        // 6. Save
        await saveCuratedPlugin(plugins, selections, outputPath, 'complete-plugin');
        const saved = JSON.parse(await fs.readFile(outputPath, 'utf-8'));
        assert.strictEqual(saved.name, 'complete-plugin', 'Step 6: Should save correctly');
        console.log('✅ Test 7 passed: Complete workflow executed successfully\n');
        testsPassed++;
    }
    catch (error) {
        console.error('❌ Test 7 failed:', error);
        testsFailed++;
    }
    testsRun++;
    // Print summary
    console.log('═'.repeat(60));
    console.log('📊 Test Summary');
    console.log('═'.repeat(60));
    console.log(`Total tests run: ${testsRun}`);
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log('═'.repeat(60));
    if (testsFailed > 0) {
        console.log('\n❌ Some tests failed!');
        process.exit(1);
    }
    else {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    }
}
// Run tests
runTests().catch((error) => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
});
//# sourceMappingURL=functional.test.js.map