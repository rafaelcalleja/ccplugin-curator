import type { NormalizedPlugin } from '../types/normalized';
/**
 * Transforms a normalized plugin back to official Claude Code format
 * @param normalized Normalized plugin object
 * @returns Official plugin.json format
 */
export declare function toOfficialFormat(normalized: NormalizedPlugin): any;
/**
 * Groups hooks by event and matcher, creating nested structure
 * @param hooks Flat array of hooks
 * @returns Nested hooks object
 */
export declare function groupHooksByEvent(hooks: Array<{
    event: string;
    type: 'command';
    command: string;
    matcher?: string;
    timeout?: number;
    [key: string]: any;
}>): any;
/**
 * Converts MCP array to object using name as key
 * @param mcps Array of MCP configurations
 * @returns Object with MCP names as keys
 */
export declare function mcpsToObject(mcps: Array<{
    name: string;
    command: string;
    args?: string[];
    env?: Record<string, string>;
    [key: string]: any;
}>): any;
/**
 * Removes default values from plugin object to minimize output
 * @param plugin Partial plugin object
 * @returns Cleaned plugin object
 */
export declare function omitDefaults(plugin: any): any;
//# sourceMappingURL=reverse-transformer.d.ts.map