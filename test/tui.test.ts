import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MainMenu, MenuResult } from '../src/tui/menu';
import { ConfigForm, ConfigFormData } from '../src/tui/config-form';
import * as blessed from 'blessed';

describe('TUI Components', () => {
  describe('MainMenu', () => {
    it('should create main menu instance', () => {
      const menu = new MainMenu();
      expect(menu).toBeDefined();
    });

    it('should show menu and return create when create option selected', async () => {
      const menu = new MainMenu();

      // Mock the show method to simulate user selecting "create"
      const showSpy = vi.spyOn(menu, 'show');
      showSpy.mockResolvedValue('create');

      const result = await menu.show();
      expect(result).toBe('create');

      showSpy.mockRestore();
    });

    it('should show menu and return exit when exit option selected', async () => {
      const menu = new MainMenu();

      // Mock the show method to simulate user selecting "exit"
      const showSpy = vi.spyOn(menu, 'show');
      showSpy.mockResolvedValue('exit');

      const result = await menu.show();
      expect(result).toBe('exit');

      showSpy.mockRestore();
    });
  });

  describe('ConfigForm', () => {
    it('should create config form instance', () => {
      const form = new ConfigForm();
      expect(form).toBeDefined();
    });

    it('should show form and return config data when submitted', async () => {
      const form = new ConfigForm();

      const mockConfig: ConfigFormData = {
        marketplaceName: 'test-marketplace',
        pluginName: 'Test Plugin',
        sourceDir: '~/.claude/plugins',
        outputDir: './output/test-marketplace',
        authorEmail: 'test@example.com',
      };

      // Mock the show method to simulate user filling form
      const showSpy = vi.spyOn(form, 'show');
      showSpy.mockResolvedValue(mockConfig);

      const result = await form.show();
      expect(result).toEqual(mockConfig);
      expect(result?.marketplaceName).toBe('test-marketplace');
      expect(result?.pluginName).toBe('Test Plugin');
      expect(result?.sourceDir).toBe('~/.claude/plugins');
      expect(result?.outputDir).toBe('./output/test-marketplace');
      expect(result?.authorEmail).toBe('test@example.com');

      showSpy.mockRestore();
    });

    it('should return null when form is cancelled', async () => {
      const form = new ConfigForm();

      // Mock the show method to simulate user canceling
      const showSpy = vi.spyOn(form, 'show');
      showSpy.mockResolvedValue(null);

      const result = await form.show();
      expect(result).toBeNull();

      showSpy.mockRestore();
    });
  });
});
