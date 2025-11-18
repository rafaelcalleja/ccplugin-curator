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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOfficialFormat = validateOfficialFormat;
exports.validateNormalizedFormat = validateNormalizedFormat;
exports.validateMarketplaceName = validateMarketplaceName;
exports.validateEmail = validateEmail;
exports.validateDirectory = validateDirectory;
exports.validatePluginDirectory = validatePluginDirectory;
exports.discoverPlugins = discoverPlugins;
exports.listPluginDirectories = listPluginDirectories;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const plugin_schema_json_1 = __importDefault(require("../../schemas/plugin.schema.json"));
const normalized_plugin_schema_json_1 = __importDefault(require("../../schemas/normalized-plugin.schema.json"));
const ajv = new ajv_1.default({ allErrors: true });
(0, ajv_formats_1.default)(ajv);
// Compile schemas
const validatePlugin = ajv.compile(plugin_schema_json_1.default);
const validateNormalized = ajv.compile(normalized_plugin_schema_json_1.default);
/**
 * Validates plugin.json against official format schema
 * @param plugin Plugin object to validate
 * @returns Validation result
 */
function validateOfficialFormat(plugin) {
    const valid = validatePlugin(plugin);
    if (!valid && validatePlugin.errors) {
        return {
            valid: false,
            errors: validatePlugin.errors.map(err => `${err.instancePath} ${err.message}`)
        };
    }
    return { valid: true };
}
/**
 * Validates normalized plugin against internal format schema
 * @param plugin Normalized plugin object to validate
 * @returns Validation result
 */
function validateNormalizedFormat(plugin) {
    const valid = validateNormalized(plugin);
    if (!valid && validateNormalized.errors) {
        return {
            valid: false,
            errors: validateNormalized.errors.map(err => `${err.instancePath} ${err.message}`)
        };
    }
    return { valid: true };
}
/**
 * Validates marketplace name format
 * Must be kebab-case, 3-50 characters
 * @param name Marketplace name to validate
 * @returns True if valid
 */
function validateMarketplaceName(name) {
    const pattern = /^[a-z0-9-]{3,50}$/;
    return pattern.test(name);
}
/**
 * Validates email format
 * @param email Email address to validate
 * @returns True if valid
 */
function validateEmail(email) {
    // Basic email validation
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}
/**
 * Validates that directory exists and contains plugin files
 * @param dirPath Directory path to validate
 * @returns True if valid plugin directory
 */
function validateDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        return false;
    }
    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) {
        return false;
    }
    return true;
}
/**
 * Validates that directory contains a Claude Code plugin
 * @param dirPath Directory path to validate
 * @returns True if contains .claude-plugin/plugin.json
 */
function validatePluginDirectory(dirPath) {
    if (!validateDirectory(dirPath)) {
        return false;
    }
    const pluginJsonPath = path.join(dirPath, '.claude-plugin', 'plugin.json');
    return fs.existsSync(pluginJsonPath);
}
/**
 * Discovers and counts plugin directories in a path
 * @param dirPath Directory to scan
 * @returns Number of plugins found
 */
function discoverPlugins(dirPath) {
    if (!validateDirectory(dirPath)) {
        return 0;
    }
    let count = 0;
    const entries = fs.readdirSync(dirPath);
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (validatePluginDirectory(fullPath)) {
                count++;
            }
        }
    }
    return count;
}
/**
 * Gets list of all plugin directories in a path
 * @param dirPath Directory to scan
 * @returns Array of plugin directory paths
 */
function listPluginDirectories(dirPath) {
    if (!validateDirectory(dirPath)) {
        return [];
    }
    const plugins = [];
    const entries = fs.readdirSync(dirPath);
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && validatePluginDirectory(fullPath)) {
            plugins.push(fullPath);
        }
    }
    return plugins;
}
//# sourceMappingURL=validator.js.map