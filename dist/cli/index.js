#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const normalizer_1 = require("../lib/normalizer");
const save_controller_1 = require("../lib/save-controller");
const validator_1 = require("../lib/validator");
const main_menu_1 = require("../tui/screens/main-menu");
const config_form_1 = require("../tui/screens/config-form");
const component_selection_1 = require("../tui/screens/component-selection");
const path = __importStar(require("path"));
const program = new commander_1.Command();
program
    .name('ccplugin-curator')
    .description('Curate and combine Claude Code plugin components')
    .version('0.1.0');
program
    .command('normalize <plugin-dir>')
    .description('Normalize a plugin and display its structure')
    .action(async (pluginDir) => {
    try {
        const absolutePath = path.resolve(pluginDir);
        console.log(`Normalizing plugin at: ${absolutePath}\n`);
        const normalized = await (0, normalizer_1.normalizePlugin)(absolutePath);
        console.log('Normalized Plugin:');
        console.log(JSON.stringify(normalized, null, 2));
        console.log('\nStats:');
        console.log(`  Commands: ${normalized.commands.length}`);
        console.log(`  Agents: ${normalized.agents.length}`);
        console.log(`  Skills: ${normalized.skills.length}`);
        console.log(`  Hooks: ${normalized.hooks.length}`);
        console.log(`  MCPs: ${normalized.mcps.length}`);
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
program
    .command('list <directory>')
    .description('List all plugins in a directory')
    .action((directory) => {
    try {
        const absolutePath = path.resolve(directory);
        const plugins = (0, validator_1.listPluginDirectories)(absolutePath);
        if (plugins.length === 0) {
            console.log('No plugins found in directory');
            return;
        }
        console.log(`Found ${plugins.length} plugin(s):\n`);
        for (const plugin of plugins) {
            const name = path.basename(plugin);
            console.log(`  - ${name} (${plugin})`);
        }
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
program
    .command('curate')
    .description('Interactive TUI for selecting and combining plugin components')
    .action(async () => {
    try {
        // Show main menu
        const menuResult = await (0, main_menu_1.showMainMenu)();
        if (menuResult.action === 'exit') {
            console.log('Goodbye!');
            return;
        }
        // Show configuration form
        const configResult = await (0, config_form_1.showConfigForm)();
        if (configResult.action === 'cancel') {
            console.log('Cancelled.');
            return;
        }
        // Load plugins from source directory
        console.log('Loading plugins...');
        const pluginPaths = (0, validator_1.listPluginDirectories)(configResult.sourceDirectory);
        if (pluginPaths.length === 0) {
            console.error('No plugins found in source directory');
            process.exit(1);
        }
        const plugins = [];
        for (const pluginPath of pluginPaths) {
            const normalized = await (0, normalizer_1.normalizePlugin)(pluginPath);
            plugins.push(normalized);
        }
        // Show component selection
        const selectionResult = await (0, component_selection_1.showComponentSelection)(plugins);
        if (selectionResult.action === 'quit') {
            console.log('Cancelled.');
            return;
        }
        // Save the curated plugin
        console.log('\nSaving curated plugin...\n');
        const saveConfig = {
            marketplaceName: configResult.marketplaceName,
            pluginName: configResult.pluginName,
            outputDirectory: configResult.outputDirectory,
            authorEmail: configResult.authorEmail
        };
        const result = await (0, save_controller_1.save)(selectionResult.selection, saveConfig);
        if (!result.success) {
            console.error('Failed to save plugin:');
            if (result.errors) {
                for (const error of result.errors) {
                    console.error(`  - ${error}`);
                }
            }
            process.exit(1);
        }
        console.log('✓ Plugin saved successfully\n');
        console.log('Files generated:');
        console.log(`  • ${result.outputPath}/.claude-plugin/marketplace.json`);
        console.log(`  • ${result.outputPath}/plugins/${saveConfig.pluginName}/`);
        console.log(`  • ${result.outputPath}/normalized-plugin.json\n`);
        console.log('Components included:');
        if (result.stats) {
            console.log(`  • ${result.stats.commands} commands`);
            console.log(`  • ${result.stats.agents} agents`);
            console.log(`  • ${result.stats.skills} skills`);
            console.log(`  • ${result.stats.hooks} hooks`);
            console.log(`  • ${result.stats.mcps} MCPs\n`);
        }
        console.log('Installation:');
        console.log(`  /plugin marketplace add ${result.outputPath}`);
        console.log(`  /plugin install ${saveConfig.pluginName}`);
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
program
    .command('combine <source-dir>')
    .description('Combine plugins from a source directory')
    .requiredOption('-n, --name <name>', 'Curated plugin name')
    .requiredOption('-o, --output <dir>', 'Output directory')
    .option('-m, --marketplace <name>', 'Marketplace name', 'curated-plugins')
    .option('-e, --email <email>', 'Author email')
    .action(async (sourceDir, options) => {
    try {
        const sourcePath = path.resolve(sourceDir);
        const plugins = (0, validator_1.listPluginDirectories)(sourcePath);
        if (plugins.length === 0) {
            console.error('No plugins found in source directory');
            process.exit(1);
        }
        console.log(`Found ${plugins.length} plugin(s) to combine\n`);
        // Normalize all plugins
        const normalized = [];
        for (const pluginPath of plugins) {
            console.log(`Normalizing ${path.basename(pluginPath)}...`);
            const norm = await (0, normalizer_1.normalizePlugin)(pluginPath);
            normalized.push(norm);
        }
        // Create selection with all components from all plugins
        const selection = {
            plugins: normalized.map(norm => ({
                normalized: norm,
                commands: norm.commands,
                agents: norm.agents,
                skills: norm.skills,
                hooks: norm.hooks,
                mcps: norm.mcps
            }))
        };
        // Save configuration
        const config = {
            marketplaceName: options.marketplace,
            pluginName: options.name,
            outputDirectory: path.resolve(options.output),
            authorEmail: options.email
        };
        console.log('\nSaving curated plugin...\n');
        const result = await (0, save_controller_1.save)(selection, config);
        if (!result.success) {
            console.error('Failed to save plugin:');
            if (result.errors) {
                for (const error of result.errors) {
                    console.error(`  - ${error}`);
                }
            }
            process.exit(1);
        }
        console.log('✓ Plugin saved successfully\n');
        console.log('Files generated:');
        console.log(`  • ${result.outputPath}/.claude-plugin/marketplace.json`);
        console.log(`  • ${result.outputPath}/plugins/${config.pluginName}/`);
        console.log(`  • ${result.outputPath}/normalized-plugin.json\n`);
        console.log('Components included:');
        if (result.stats) {
            console.log(`  • ${result.stats.commands} commands`);
            console.log(`  • ${result.stats.agents} agents`);
            console.log(`  • ${result.stats.skills} skills`);
            console.log(`  • ${result.stats.hooks} hooks`);
            console.log(`  • ${result.stats.mcps} MCPs\n`);
        }
        console.log('Installation:');
        console.log(`  /plugin marketplace add ${result.outputPath}`);
        console.log(`  /plugin install ${config.pluginName}`);
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=index.js.map