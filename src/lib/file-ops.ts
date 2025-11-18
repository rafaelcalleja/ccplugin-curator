import * as fs from 'fs';
import * as path from 'path';

/**
 * Copies a file from source to destination
 * Creates parent directories if they don't exist
 * @param source Source file path
 * @param dest Destination file path
 */
export function copyFile(source: string, dest: string): void {
  ensureDirectory(path.dirname(dest));
  fs.copyFileSync(source, dest);
}

/**
 * Copies a directory recursively from source to destination
 * @param source Source directory path
 * @param dest Destination directory path
 */
export function copyDirectory(source: string, dest: string): void {
  ensureDirectory(dest);
  fs.cpSync(source, dest, { recursive: true });
}

/**
 * Writes a JSON object to a file with pretty formatting
 * @param filePath File path to write to
 * @param data Object to serialize as JSON
 */
export function writeJson(filePath: string, data: any): void {
  ensureDirectory(path.dirname(filePath));
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json + '\n', 'utf-8');
}

/**
 * Ensures a directory exists, creating it and parents if needed
 * @param dirPath Directory path to ensure exists
 */
export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Sets a file as executable (chmod 0o755)
 * Required for hook scripts
 * @param filePath File path to make executable
 */
export function setExecutable(filePath: string): void {
  try {
    fs.chmodSync(filePath, 0o755);
  } catch (error) {
    // On Windows, chmod might not work - log but don't fail
    console.warn(`Warning: Could not set executable permissions on ${filePath}`);
  }
}

/**
 * Copies a hook script file with executable permissions
 * @param source Source script file path
 * @param dest Destination script file path
 */
export function copyHookScript(source: string, dest: string): void {
  copyFile(source, dest);
  setExecutable(dest);
}

/**
 * Removes a directory and all its contents
 * @param dirPath Directory path to remove
 */
export function removeDirectory(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

/**
 * Checks if a path exists
 * @param filePath Path to check
 * @returns True if path exists
 */
export function exists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Reads a JSON file and parses it
 * @param filePath Path to JSON file
 * @returns Parsed JSON object
 */
export function readJson(filePath: string): any {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Reads a text file
 * @param filePath Path to text file
 * @returns File contents as string
 */
export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Writes text content to a file
 * @param filePath Path to file
 * @param content Text content to write
 */
export function writeFile(filePath: string, content: string): void {
  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}
