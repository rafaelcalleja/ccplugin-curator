import fs from 'fs';
import path from 'path';
import { scanPlugins } from './src/scanner.js';
import { normalizePlugin } from './src/normalizer.js';
import { saveCuratedPlugin } from './src/persistence.js';
import type { ComponentSelection } from './src/types/index.js';

const TEST_PLUGIN_DIR = path.resolve('./test-plugin');
const OUTPUT_DIR = path.resolve('./test-output');

async function runIntegrationTest() {
  console.log('🧪 Starting Integration Test\n');

  try {
    // Step 1: Scan plugins
    console.log('Step 1: Scanning test-plugin directory...');
    const plugins = await scanPlugins(TEST_PLUGIN_DIR);

    if (plugins.length === 0) {
      throw new Error('No plugins found!');
    }

    console.log(`✓ Found ${plugins.length} plugin(s)`);
    console.log(`  - Plugin name: ${plugins[0].name}\n`);

    // Step 2: Normalize plugins
    console.log('Step 2: Normalizing plugins...');
    const normalized = await normalizePlugin(plugins[0], (plugins[0] as any).__sourceDir);

    console.log('✓ Plugin normalized successfully');
    console.log(`  - Commands: ${normalized.commands.length}`);
    console.log(`  - Agents: ${normalized.agents.length}`);
    console.log(`  - Skills: ${normalized.skills.length}`);
    console.log(`  - Hooks: ${(normalized as any).hooks?.length || 0}`);
    console.log(`  - MCPs: ${(normalized as any).mcps?.length || 0}\n`);

    // Step 3: Verify components
    console.log('Step 3: Verifying components...');

    const expectedCommands = ['commands/build.md', 'commands/deploy.md', 'commands/test.md'];
    const expectedAgents = ['agents/code-reviewer.md', 'agents/documentation-writer.md'];
    const expectedSkills = ['skills/skill-a', 'skills/skill-b'];

    let verified = true;

    // Check commands
    for (const cmd of expectedCommands) {
      if (normalized.commands.includes(cmd)) {
        console.log(`  ✓ Found command: ${cmd}`);
      } else {
        console.log(`  ✗ Missing command: ${cmd}`);
        verified = false;
      }
    }

    // Check agents
    for (const agent of expectedAgents) {
      if (normalized.agents.includes(agent)) {
        console.log(`  ✓ Found agent: ${agent}`);
      } else {
        console.log(`  ✗ Missing agent: ${agent}`);
        verified = false;
      }
    }

    // Check skills
    for (const skill of expectedSkills) {
      if (normalized.skills.includes(skill)) {
        console.log(`  ✓ Found skill: ${skill}`);
      } else {
        console.log(`  ✗ Missing skill: ${skill}`);
        verified = false;
      }
    }

    // Check hooks
    const hooks = (normalized as any).hooks || [];
    if (hooks.length > 0) {
      console.log(`  ✓ Found ${hooks.length} hook(s)`);
    } else {
      console.log(`  ✗ No hooks found`);
      verified = false;
    }

    // Check MCPs
    const mcps = (normalized as any).mcps || [];
    if (mcps.length > 0) {
      console.log(`  ✓ Found ${mcps.length} MCP server(s)`);
    } else {
      console.log(`  ✗ No MCPs found`);
      verified = false;
    }

    if (!verified) {
      throw new Error('Some components are missing!');
    }

    console.log('\n✓ All components verified!\n');

    // Step 4: Create mock selections
    console.log('Step 4: Creating mock selections...');
    const mockSelection: ComponentSelection = {
      pluginName: normalized.name,
      commands: [normalized.commands[0], normalized.commands[1]], // Select 2 commands
      agents: [normalized.agents[0]], // Select 1 agent
      skills: [normalized.skills[0]], // Select 1 skill
      hooks: hooks.length > 0 ? [hooks[0]] : [],
      mcps: mcps.length > 0 ? [mcps[0]] : [],
    };

    console.log('✓ Mock selections created:');
    console.log(`  - Selected ${mockSelection.commands.length} commands`);
    console.log(`  - Selected ${mockSelection.agents.length} agents`);
    console.log(`  - Selected ${mockSelection.skills.length} skills`);
    console.log(`  - Selected ${mockSelection.hooks.length} hooks`);
    console.log(`  - Selected ${mockSelection.mcps.length} mcps\n`);

    // Step 5: Save curated plugin
    console.log('Step 5: Saving curated plugin...');
    const savedPath = await saveCuratedPlugin([mockSelection], OUTPUT_DIR);
    console.log(`✓ Plugin saved to: ${savedPath}\n`);

    // Step 6: Verify output file
    console.log('Step 6: Verifying output file...');
    if (!fs.existsSync(savedPath)) {
      throw new Error('Output file was not created!');
    }

    const savedContent = JSON.parse(fs.readFileSync(savedPath, 'utf-8'));
    console.log('✓ Output file created and valid JSON');
    console.log('  Output structure:');
    console.log(JSON.stringify(savedContent, null, 2));

    // Step 7: Verify saved content matches selections
    console.log('\nStep 7: Verifying saved content...');
    let contentVerified = true;

    if (savedContent.commands?.length === 2) {
      console.log(`  ✓ Commands saved correctly (${savedContent.commands.length})`);
    } else {
      console.log(`  ✗ Commands mismatch. Expected 2, got ${savedContent.commands?.length || 0}`);
      contentVerified = false;
    }

    if (savedContent.agents?.length === 1) {
      console.log(`  ✓ Agents saved correctly (${savedContent.agents.length})`);
    } else {
      console.log(`  ✗ Agents mismatch. Expected 1, got ${savedContent.agents?.length || 0}`);
      contentVerified = false;
    }

    if (savedContent.skills?.length === 1) {
      console.log(`  ✓ Skills saved correctly (${savedContent.skills.length})`);
    } else {
      console.log(`  ✗ Skills mismatch. Expected 1, got ${savedContent.skills?.length || 0}`);
      contentVerified = false;
    }

    if (contentVerified) {
      console.log('\n✓ All content verified!\n');
    } else {
      throw new Error('Content verification failed!');
    }

    // Final Summary
    console.log('═'.repeat(60));
    console.log('✅ INTEGRATION TEST PASSED!\n');
    console.log('Summary:');
    console.log(`  ✓ Scanner correctly found all plugins`);
    console.log(`  ✓ Normalizer correctly discovered all components`);
    console.log(`  ✓ Selections created successfully`);
    console.log(`  ✓ Output file saved correctly`);
    console.log(`  ✓ Saved content matches expected structure`);
    console.log('\nOutput saved to:');
    console.log(`  ${OUTPUT_DIR}/`);
    console.log('═'.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ INTEGRATION TEST FAILED!\n');
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

runIntegrationTest();
