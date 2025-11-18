/**
 * Copies a file from source to destination
 * Creates parent directories if they don't exist
 * @param source Source file path
 * @param dest Destination file path
 */
export declare function copyFile(source: string, dest: string): void;
/**
 * Copies a directory recursively from source to destination
 * @param source Source directory path
 * @param dest Destination directory path
 */
export declare function copyDirectory(source: string, dest: string): void;
/**
 * Writes a JSON object to a file with pretty formatting
 * @param filePath File path to write to
 * @param data Object to serialize as JSON
 */
export declare function writeJson(filePath: string, data: any): void;
/**
 * Ensures a directory exists, creating it and parents if needed
 * @param dirPath Directory path to ensure exists
 */
export declare function ensureDirectory(dirPath: string): void;
/**
 * Sets a file as executable (chmod 0o755)
 * Required for hook scripts
 * @param filePath File path to make executable
 */
export declare function setExecutable(filePath: string): void;
/**
 * Copies a hook script file with executable permissions
 * @param source Source script file path
 * @param dest Destination script file path
 */
export declare function copyHookScript(source: string, dest: string): void;
/**
 * Removes a directory and all its contents
 * @param dirPath Directory path to remove
 */
export declare function removeDirectory(dirPath: string): void;
/**
 * Checks if a path exists
 * @param filePath Path to check
 * @returns True if path exists
 */
export declare function exists(filePath: string): boolean;
/**
 * Reads a JSON file and parses it
 * @param filePath Path to JSON file
 * @returns Parsed JSON object
 */
export declare function readJson(filePath: string): any;
/**
 * Reads a text file
 * @param filePath Path to text file
 * @returns File contents as string
 */
export declare function readFile(filePath: string): string;
/**
 * Writes text content to a file
 * @param filePath Path to file
 * @param content Text content to write
 */
export declare function writeFile(filePath: string, content: string): void;
//# sourceMappingURL=file-ops.d.ts.map