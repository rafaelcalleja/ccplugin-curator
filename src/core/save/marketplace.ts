/**
 * Marketplace Generator
 *
 * Generates marketplace.json configuration file.
 *
 * Spec: docs/spec/007-save-operation-rules.md (Section 3)
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Marketplace configuration
 */
export interface MarketplaceConfig {
  name: string;
  owner: {
    name: string;
    email?: string;
  };
  plugins: Array<{
    name: string;
    source: string;
  }>;
}

/**
 * Generate marketplace.json
 *
 * @param pluginName - Name of the curated plugin
 * @param options - Optional owner information
 * @returns Marketplace configuration object
 */
export function generateMarketplace(
  pluginName: string,
  options?: {
    ownerName?: string;
    ownerEmail?: string;
  }
): MarketplaceConfig {
  return {
    name: 'curated-plugins',
    owner: {
      name: options?.ownerName || 'User',
      email: options?.ownerEmail,
    },
    plugins: [
      {
        name: pluginName,
        source: `./plugins/${pluginName}`,
      },
    ],
  };
}

/**
 * Write marketplace.json to disk
 *
 * @param marketplaceDir - Path to .claude-plugin directory
 * @param config - Marketplace configuration
 */
export function writeMarketplaceJson(
  marketplaceDir: string,
  config: MarketplaceConfig
): void {
  const filePath = join(marketplaceDir, 'marketplace.json');
  const content = JSON.stringify(config, null, 2);
  writeFileSync(filePath, content, 'utf-8');
}
