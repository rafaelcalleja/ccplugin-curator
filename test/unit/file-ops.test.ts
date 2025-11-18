import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  copyFile,
  copyDirectory,
  writeJson,
  ensureDirectory,
  setExecutable,
  copyHookScript,
  removeDirectory,
  exists,
  readJson,
  readFile,
  writeFile
} from '../../src/lib/file-ops';

const TEST_DIR = path.join(__dirname, '..', 'fixtures', 'file-ops-test');

describe('File Operations', () => {
  beforeEach(() => {
    // Clean up before each test
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('ensureDirectory', () => {
    it('should create directory if it does not exist', () => {
      const dirPath = path.join(TEST_DIR, 'new-dir');

      ensureDirectory(dirPath);

      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });

    it('should create nested directories', () => {
      const dirPath = path.join(TEST_DIR, 'a', 'b', 'c');

      ensureDirectory(dirPath);

      expect(fs.existsSync(dirPath)).toBe(true);
    });

    it('should not fail if directory already exists', () => {
      const dirPath = path.join(TEST_DIR, 'existing');
      fs.mkdirSync(dirPath);

      expect(() => ensureDirectory(dirPath)).not.toThrow();
    });
  });

  describe('exists', () => {
    it('should return true for existing file', () => {
      const filePath = path.join(TEST_DIR, 'test.txt');
      fs.writeFileSync(filePath, 'test');

      expect(exists(filePath)).toBe(true);
    });

    it('should return true for existing directory', () => {
      const dirPath = path.join(TEST_DIR, 'test-dir');
      fs.mkdirSync(dirPath);

      expect(exists(dirPath)).toBe(true);
    });

    it('should return false for non-existent path', () => {
      const filePath = path.join(TEST_DIR, 'non-existent.txt');

      expect(exists(filePath)).toBe(false);
    });
  });

  describe('copyFile', () => {
    it('should copy file to destination', () => {
      const source = path.join(TEST_DIR, 'source.txt');
      const dest = path.join(TEST_DIR, 'dest.txt');
      fs.writeFileSync(source, 'test content');

      copyFile(source, dest);

      expect(fs.existsSync(dest)).toBe(true);
      expect(fs.readFileSync(dest, 'utf-8')).toBe('test content');
    });

    it('should create parent directories', () => {
      const source = path.join(TEST_DIR, 'source.txt');
      const dest = path.join(TEST_DIR, 'nested', 'dir', 'dest.txt');
      fs.writeFileSync(source, 'test');

      copyFile(source, dest);

      expect(fs.existsSync(dest)).toBe(true);
    });

    it('should overwrite existing file', () => {
      const source = path.join(TEST_DIR, 'source.txt');
      const dest = path.join(TEST_DIR, 'dest.txt');
      fs.writeFileSync(source, 'new content');
      fs.writeFileSync(dest, 'old content');

      copyFile(source, dest);

      expect(fs.readFileSync(dest, 'utf-8')).toBe('new content');
    });
  });

  describe('copyDirectory', () => {
    it('should copy directory recursively', () => {
      const source = path.join(TEST_DIR, 'source-dir');
      const dest = path.join(TEST_DIR, 'dest-dir');

      fs.mkdirSync(source);
      fs.writeFileSync(path.join(source, 'file1.txt'), 'content1');
      fs.mkdirSync(path.join(source, 'subdir'));
      fs.writeFileSync(path.join(source, 'subdir', 'file2.txt'), 'content2');

      copyDirectory(source, dest);

      expect(fs.existsSync(path.join(dest, 'file1.txt'))).toBe(true);
      expect(fs.existsSync(path.join(dest, 'subdir', 'file2.txt'))).toBe(true);
      expect(fs.readFileSync(path.join(dest, 'file1.txt'), 'utf-8')).toBe('content1');
      expect(fs.readFileSync(path.join(dest, 'subdir', 'file2.txt'), 'utf-8')).toBe('content2');
    });

    it('should create destination directory', () => {
      const source = path.join(TEST_DIR, 'source-dir');
      const dest = path.join(TEST_DIR, 'new', 'dest-dir');

      fs.mkdirSync(source);
      fs.writeFileSync(path.join(source, 'file.txt'), 'test');

      copyDirectory(source, dest);

      expect(fs.existsSync(dest)).toBe(true);
    });
  });

  describe('writeJson', () => {
    it('should write JSON object to file', () => {
      const filePath = path.join(TEST_DIR, 'data.json');
      const data = { name: 'test', version: '1.0.0' };

      writeJson(filePath, data);

      expect(fs.existsSync(filePath)).toBe(true);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(content).toEqual(data);
    });

    it('should format JSON with 2-space indentation', () => {
      const filePath = path.join(TEST_DIR, 'formatted.json');
      const data = { nested: { key: 'value' } };

      writeJson(filePath, data);

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('  ');
      expect(content).toMatch(/\{\n  "nested":/);
    });

    it('should create parent directories', () => {
      const filePath = path.join(TEST_DIR, 'nested', 'data.json');
      const data = { test: true };

      writeJson(filePath, data);

      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should add trailing newline', () => {
      const filePath = path.join(TEST_DIR, 'newline.json');
      const data = { test: true };

      writeJson(filePath, data);

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content.endsWith('\n')).toBe(true);
    });
  });

  describe('readJson', () => {
    it('should read and parse JSON file', () => {
      const filePath = path.join(TEST_DIR, 'data.json');
      const data = { name: 'test', version: '1.0.0' };
      fs.writeFileSync(filePath, JSON.stringify(data));

      const result = readJson(filePath);

      expect(result).toEqual(data);
    });

    it('should throw error for invalid JSON', () => {
      const filePath = path.join(TEST_DIR, 'invalid.json');
      fs.writeFileSync(filePath, 'not json');

      expect(() => readJson(filePath)).toThrow();
    });
  });

  describe('writeFile', () => {
    it('should write text content to file', () => {
      const filePath = path.join(TEST_DIR, 'text.txt');
      const content = 'Hello, World!';

      writeFile(filePath, content);

      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, 'utf-8')).toBe(content);
    });

    it('should create parent directories', () => {
      const filePath = path.join(TEST_DIR, 'nested', 'file.txt');
      const content = 'test';

      writeFile(filePath, content);

      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should overwrite existing file', () => {
      const filePath = path.join(TEST_DIR, 'overwrite.txt');
      fs.writeFileSync(filePath, 'old');

      writeFile(filePath, 'new');

      expect(fs.readFileSync(filePath, 'utf-8')).toBe('new');
    });
  });

  describe('readFile', () => {
    it('should read text file content', () => {
      const filePath = path.join(TEST_DIR, 'read.txt');
      const content = 'Test content\nLine 2';
      fs.writeFileSync(filePath, content);

      const result = readFile(filePath);

      expect(result).toBe(content);
    });

    it('should throw error for non-existent file', () => {
      const filePath = path.join(TEST_DIR, 'non-existent.txt');

      expect(() => readFile(filePath)).toThrow();
    });
  });

  describe('setExecutable', () => {
    it('should set file permissions to 0o755', () => {
      const filePath = path.join(TEST_DIR, 'script.sh');
      fs.writeFileSync(filePath, '#!/bin/bash\necho "test"');

      setExecutable(filePath);

      // On Unix-like systems, check if file is executable
      if (process.platform !== 'win32') {
        const stats = fs.statSync(filePath);
        const mode = stats.mode & 0o777;
        expect(mode).toBe(0o755);
      }
    });

    it('should not throw on Windows where chmod might fail', () => {
      const filePath = path.join(TEST_DIR, 'script.sh');
      fs.writeFileSync(filePath, 'test');

      expect(() => setExecutable(filePath)).not.toThrow();
    });
  });

  describe('copyHookScript', () => {
    it('should copy file and make it executable', () => {
      const source = path.join(TEST_DIR, 'source.sh');
      const dest = path.join(TEST_DIR, 'dest.sh');
      fs.writeFileSync(source, '#!/bin/bash\necho "test"');

      copyHookScript(source, dest);

      expect(fs.existsSync(dest)).toBe(true);
      expect(fs.readFileSync(dest, 'utf-8')).toContain('echo "test"');

      // On Unix-like systems, verify executable permissions
      if (process.platform !== 'win32') {
        const stats = fs.statSync(dest);
        const mode = stats.mode & 0o777;
        expect(mode).toBe(0o755);
      }
    });
  });

  describe('removeDirectory', () => {
    it('should remove directory and all contents', () => {
      const dirPath = path.join(TEST_DIR, 'to-remove');
      fs.mkdirSync(dirPath);
      fs.writeFileSync(path.join(dirPath, 'file.txt'), 'test');
      fs.mkdirSync(path.join(dirPath, 'subdir'));

      removeDirectory(dirPath);

      expect(fs.existsSync(dirPath)).toBe(false);
    });

    it('should not fail if directory does not exist', () => {
      const dirPath = path.join(TEST_DIR, 'non-existent');

      expect(() => removeDirectory(dirPath)).not.toThrow();
    });

    it('should remove nested directories', () => {
      const dirPath = path.join(TEST_DIR, 'parent');
      fs.mkdirSync(path.join(dirPath, 'child', 'grandchild'), { recursive: true });
      fs.writeFileSync(path.join(dirPath, 'child', 'grandchild', 'file.txt'), 'test');

      removeDirectory(dirPath);

      expect(fs.existsSync(dirPath)).toBe(false);
    });
  });
});
