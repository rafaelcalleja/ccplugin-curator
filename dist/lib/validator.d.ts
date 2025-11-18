export interface ValidationResult {
    valid: boolean;
    errors?: string[];
}
/**
 * Validates plugin.json against official format schema
 * @param plugin Plugin object to validate
 * @returns Validation result
 */
export declare function validateOfficialFormat(plugin: any): ValidationResult;
/**
 * Validates normalized plugin against internal format schema
 * @param plugin Normalized plugin object to validate
 * @returns Validation result
 */
export declare function validateNormalizedFormat(plugin: any): ValidationResult;
/**
 * Validates marketplace name format
 * Must be kebab-case, 3-50 characters
 * @param name Marketplace name to validate
 * @returns True if valid
 */
export declare function validateMarketplaceName(name: string): boolean;
/**
 * Validates email format
 * @param email Email address to validate
 * @returns True if valid
 */
export declare function validateEmail(email: string): boolean;
/**
 * Validates that directory exists and contains plugin files
 * @param dirPath Directory path to validate
 * @returns True if valid plugin directory
 */
export declare function validateDirectory(dirPath: string): boolean;
/**
 * Validates that directory contains a Claude Code plugin
 * @param dirPath Directory path to validate
 * @returns True if contains .claude-plugin/plugin.json
 */
export declare function validatePluginDirectory(dirPath: string): boolean;
/**
 * Discovers and counts plugin directories in a path
 * @param dirPath Directory to scan
 * @returns Number of plugins found
 */
export declare function discoverPlugins(dirPath: string): number;
/**
 * Gets list of all plugin directories in a path
 * @param dirPath Directory to scan
 * @returns Array of plugin directory paths
 */
export declare function listPluginDirectories(dirPath: string): string[];
//# sourceMappingURL=validator.d.ts.map