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
exports.copyFile = copyFile;
exports.copyDirectory = copyDirectory;
exports.writeJson = writeJson;
exports.ensureDirectory = ensureDirectory;
exports.setExecutable = setExecutable;
exports.copyHookScript = copyHookScript;
exports.removeDirectory = removeDirectory;
exports.exists = exists;
exports.readJson = readJson;
exports.readFile = readFile;
exports.writeFile = writeFile;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Copies a file from source to destination
 * Creates parent directories if they don't exist
 * @param source Source file path
 * @param dest Destination file path
 */
function copyFile(source, dest) {
    ensureDirectory(path.dirname(dest));
    fs.copyFileSync(source, dest);
}
/**
 * Copies a directory recursively from source to destination
 * @param source Source directory path
 * @param dest Destination directory path
 */
function copyDirectory(source, dest) {
    ensureDirectory(dest);
    fs.cpSync(source, dest, { recursive: true });
}
/**
 * Writes a JSON object to a file with pretty formatting
 * @param filePath File path to write to
 * @param data Object to serialize as JSON
 */
function writeJson(filePath, data) {
    ensureDirectory(path.dirname(filePath));
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, json + '\n', 'utf-8');
}
/**
 * Ensures a directory exists, creating it and parents if needed
 * @param dirPath Directory path to ensure exists
 */
function ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
/**
 * Sets a file as executable (chmod 0o755)
 * Required for hook scripts
 * @param filePath File path to make executable
 */
function setExecutable(filePath) {
    try {
        fs.chmodSync(filePath, 0o755);
    }
    catch (error) {
        // On Windows, chmod might not work - log but don't fail
        console.warn(`Warning: Could not set executable permissions on ${filePath}`);
    }
}
/**
 * Copies a hook script file with executable permissions
 * @param source Source script file path
 * @param dest Destination script file path
 */
function copyHookScript(source, dest) {
    copyFile(source, dest);
    setExecutable(dest);
}
/**
 * Removes a directory and all its contents
 * @param dirPath Directory path to remove
 */
function removeDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
    }
}
/**
 * Checks if a path exists
 * @param filePath Path to check
 * @returns True if path exists
 */
function exists(filePath) {
    return fs.existsSync(filePath);
}
/**
 * Reads a JSON file and parses it
 * @param filePath Path to JSON file
 * @returns Parsed JSON object
 */
function readJson(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}
/**
 * Reads a text file
 * @param filePath Path to text file
 * @returns File contents as string
 */
function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}
/**
 * Writes text content to a file
 * @param filePath Path to file
 * @param content Text content to write
 */
function writeFile(filePath, content) {
    ensureDirectory(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf-8');
}
//# sourceMappingURL=file-ops.js.map