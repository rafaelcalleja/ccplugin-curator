#!/usr/bin/env node
"use strict";
/**
 * CLI Interface for ccplugin-curator
 * Based on docs/spec/004-user-workflows.md
 */
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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const normalize_1 = require("./normalize");
const save_1 = require("./save");
const program = new commander_1.Command();
program
    .name('ccplugin-curator')
    .description('Claude Code Plugin Curator - Select and merge plugin components')
    .version('0.0.8');
/**
 * Select command - Main entry point
 *
 * Usage: app select <plugin-folder>
 *
 * Example: app select ~/.claude/plugins
 */
program
    .command('select <plugin-folder>')
    .description('Select components from plugins to create curated plugin')
    .option('-o, --output <dir>', 'Output directory', './output/curated-plugin')
    .option('-n, --name <name>', 'Output plugin name', 'curated-plugin')
    .option('--overwrite', 'Overwrite existing output directory', false)
    .option('--no-tui', 'Disable TUI (use for testing/automation)')
    .action(async (pluginFolder, options) => {
    try {
        // Resolve plugin folder path
        const resolvedPath = path.resolve(pluginFolder);
        if (!fs.existsSync(resolvedPath)) {
            console.error(`❌ Error: Plugin folder not found: ${resolvedPath}`);
            process.exit(1);
        }
        // Scan for plugins in the folder
        console.log(`📂 Scanning plugins in: ${resolvedPath}\n`);
        const plugins = scanPlugins(resolvedPath);
        if (plugins.length === 0) {
            console.error('❌ No plugins found in the specified directory.');
            console.error('   Plugins must have a .claude-plugin/plugin.json file.');
            process.exit(1);
        }
        console.log(`✅ Found ${plugins.length} plugin(s):\n`);
        plugins.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name}`);
            console.log(`      📍 ${p.source}`);
            console.log(`      📦 ${p.commands.length} commands, ${p.agents.length} agents, ${p.skills.length} skills`);
            console.log(`      🔗 ${p.hooks.length} hooks, ${p.mcps.length} MCPs\n`);
        });
        // If TUI is disabled, select all components from all plugins
        if (options.tui === false) {
            console.log('💾 Saving all components (--no-tui mode)...\n');
            (0, save_1.savePlugin)(plugins, {
                outputDir: options.output,
                pluginName: options.name,
                overwrite: options.overwrite,
            });
            showSuccessMessage(options.output, options.name, plugins);
        }
        else {
            // TODO: Launch TUI for interactive selection
            console.log('🎨 TUI mode not yet implemented.');
            console.log('   Use --no-tui flag to select all components automatically.\n');
            process.exit(0);
        }
    }
    catch (error) {
        console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
});
/**
 * Scan a directory for Claude Code plugins
 */
function scanPlugins(baseDir) {
    const plugins = [];
    // Check if baseDir itself is a plugin
    const pluginJsonPath = path.join(baseDir, '.claude-plugin', 'plugin.json');
    if (fs.existsSync(pluginJsonPath)) {
        try {
            const normalized = (0, normalize_1.normalize)(baseDir);
            plugins.push(normalized);
            return plugins;
        }
        catch (error) {
            console.warn(`⚠️  Warning: Failed to load plugin from ${baseDir}: ${error}`);
        }
    }
    // Otherwise, scan subdirectories
    try {
        const entries = fs.readdirSync(baseDir, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isDirectory())
                continue;
            const pluginDir = path.join(baseDir, entry.name);
            const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
            if (fs.existsSync(pluginJsonPath)) {
                try {
                    const normalized = (0, normalize_1.normalize)(pluginDir);
                    plugins.push(normalized);
                }
                catch (error) {
                    console.warn(`⚠️  Warning: Failed to load plugin from ${pluginDir}: ${error}`);
                }
            }
        }
    }
    catch (error) {
        // Ignore scanning errors
    }
    return plugins;
}
/**
 * Show success message with installation instructions
 */
function showSuccessMessage(outputDir, pluginName, plugins) {
    const totalCommands = plugins.reduce((sum, p) => sum + p.commands.length, 0);
    const totalAgents = plugins.reduce((sum, p) => sum + p.agents.length, 0);
    const totalSkills = plugins.reduce((sum, p) => sum + p.skills.length, 0);
    const totalHooks = plugins.reduce((sum, p) => sum + p.hooks.length, 0);
    const totalMcps = plugins.reduce((sum, p) => sum + p.mcps.length, 0);
    console.log('✅ Plugin guardado exitosamente\n');
    console.log('📁 Archivos generados:');
    console.log(`   • ${path.join(outputDir, '.claude-plugin/marketplace.json')}     (marketplace oficial)`);
    console.log(`   • ${path.join(outputDir, 'plugins', pluginName)}                  (plugin con componentes)`);
    console.log(`   • ${path.join(outputDir, 'normalized-plugin.json')}               (normalizado - debugging)\n`);
    console.log('📦 Componentes incluidos:');
    console.log(`   • ${totalCommands} commands`);
    console.log(`   • ${totalAgents} agents`);
    console.log(`   • ${totalSkills} skills`);
    console.log(`   • ${totalHooks} hooks`);
    console.log(`   • ${totalMcps} MCPs\n`);
    console.log('📍 Ubicación:', outputDir);
    console.log('\n🚀 Instalación:');
    console.log(`   /plugin marketplace add ${outputDir}`);
    console.log(`   /plugin install ${pluginName}\n`);
}
// Parse command line arguments
program.parse();
//# sourceMappingURL=cli.js.map