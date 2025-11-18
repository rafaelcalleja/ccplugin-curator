/**
 * Configuration Form screen
 * Spec 009-tui-setup-screens.md lines 67-261
 *
 * Note: Using @inquirer/prompts for better form UX in terminal
 */

import { input } from '@inquirer/prompts';
import { access } from 'fs/promises';
import { resolve } from 'path';

export interface PluginConfig {
  marketplaceName: string;
  pluginName: string;
  sourceDirectory: string;
  outputDirectory: string;
  authorEmail?: string;
}

/**
 * Validate marketplace name (spec 009 lines 168-176)
 * Pattern: ^[a-z0-9-]+$ (3-50 chars, lowercase only)
 */
function validateMarketplaceName(value: string): true | string {
  if (!value || value.length < 3) {
    return 'Marketplace name must be at least 3 characters';
  }
  if (value.length > 50) {
    return 'Marketplace name must be at most 50 characters';
  }
  if (!/^[a-z0-9-]+$/.test(value)) {
    return 'Only lowercase letters, numbers, and hyphens allowed';
  }
  return true;
}

/**
 * Validate email format (spec 009 lines 178-186)
 */
function validateEmail(value: string): true | string {
  if (!value) return true; // Optional field

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Invalid email format';
  }
  return true;
}

/**
 * Validate directory exists (spec 009 lines 188-195)
 */
async function validateDirectory(value: string): Promise<true | string> {
  if (!value) {
    return 'Directory is required';
  }

  try {
    const resolvedPath = resolve(value);
    await access(resolvedPath);
    return true;
  } catch {
    return `Directory does not exist: ${value}`;
  }
}

/**
 * Run configuration form
 * Returns configuration or null if cancelled
 */
export async function runConfigurationForm(): Promise<PluginConfig | null> {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   CREATE CURATED PLUGIN                   ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  try {
    // Marketplace Name (required)
    const marketplaceName = await input({
      message: 'Marketplace Name (lowercase, numbers, hyphens):',
      default: 'my-marketplace',
      validate: validateMarketplaceName,
    });

    // Plugin Name (required)
    const pluginName = await input({
      message: 'Plugin Name (display name):',
      default: 'My Awesome Plugin',
      validate: (value) => value.length > 0 || 'Plugin name is required',
    });

    // Source Plugin Directory (required)
    const sourceDirectory = await input({
      message: 'Source Plugin Directory (contains plugins):',
      default: '.',
      validate: validateDirectory,
    });

    // Output Directory (optional, auto-fill from marketplace name)
    const outputDirectory = await input({
      message: 'Output Directory:',
      default: `./output/${marketplaceName}`,
    });

    // Author Email (optional)
    const authorEmail = await input({
      message: 'Author Email (optional):',
      default: '',
      validate: validateEmail,
    });

    const config: PluginConfig = {
      marketplaceName,
      pluginName,
      sourceDirectory: resolve(sourceDirectory),
      outputDirectory: resolve(outputDirectory),
      authorEmail: authorEmail || undefined,
    };

    console.log('\n✓ Configuration complete\n');

    return config;
  } catch (error: any) {
    // User cancelled (Ctrl+C or ESC)
    if (error.message?.includes('User force closed')) {
      console.log('\n✗ Configuration cancelled\n');
      return null;
    }
    throw error;
  }
}
