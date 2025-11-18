import * as blessed from 'blessed';
import { validateMarketplaceName, validateEmail, validateDirectory, discoverPlugins } from '../../lib/validator';
import * as path from 'path';

export interface ConfigFormResult {
  marketplaceName: string;
  pluginName: string;
  sourceDirectory: string;
  outputDirectory: string;
  authorEmail?: string;
  action: 'continue' | 'cancel';
}

/**
 * Shows configuration form and returns user input
 */
export async function showConfigForm(): Promise<ConfigFormResult> {
  return new Promise((resolve) => {
    const screen = blessed.screen({
      smartCSR: true,
      title: 'Configuration - CCPlugin Curator'
    });

    const form = blessed.form({
      parent: screen,
      top: 'center',
      left: 'center',
      width: 80,
      height: 22,
      label: ' Plugin Configuration ',
      border: 'line',
      style: {
        border: {
          fg: 'cyan'
        }
      },
      keys: true,
      vi: true
    });

    const fields: any = {};

    // Marketplace Name
    blessed.text({
      parent: form,
      top: 1,
      left: 2,
      content: 'Marketplace Name: (required, kebab-case)'
    });

    fields.marketplaceName = blessed.textbox({
      parent: form,
      name: 'marketplaceName',
      top: 2,
      left: 2,
      width: 74,
      height: 1,
      inputOnFocus: true,
      style: {
        fg: 'white',
        bg: 'black',
        focus: {
          bg: 'blue'
        }
      }
    });

    fields.marketplaceStatus = blessed.text({
      parent: form,
      top: 2,
      right: 1,
      content: ''
    });

    // Plugin Name
    blessed.text({
      parent: form,
      top: 4,
      left: 2,
      content: 'Plugin Name: (required)'
    });

    fields.pluginName = blessed.textbox({
      parent: form,
      name: 'pluginName',
      top: 5,
      left: 2,
      width: 74,
      height: 1,
      inputOnFocus: true,
      style: {
        fg: 'white',
        bg: 'black',
        focus: {
          bg: 'blue'
        }
      }
    });

    // Source Directory
    blessed.text({
      parent: form,
      top: 7,
      left: 2,
      content: 'Source Directory: (required, path to plugins)'
    });

    fields.sourceDirectory = blessed.textbox({
      parent: form,
      name: 'sourceDirectory',
      top: 8,
      left: 2,
      width: 74,
      height: 1,
      inputOnFocus: true,
      style: {
        fg: 'white',
        bg: 'black',
        focus: {
          bg: 'blue'
        }
      }
    });

    fields.sourceStatus = blessed.text({
      parent: form,
      top: 9,
      left: 2,
      content: ''
    });

    // Output Directory
    blessed.text({
      parent: form,
      top: 11,
      left: 2,
      content: 'Output Directory: (auto-filled from marketplace name)'
    });

    fields.outputDirectory = blessed.textbox({
      parent: form,
      name: 'outputDirectory',
      top: 12,
      left: 2,
      width: 74,
      height: 1,
      inputOnFocus: true,
      style: {
        fg: 'white',
        bg: 'black',
        focus: {
          bg: 'blue'
        }
      }
    });

    // Author Email
    blessed.text({
      parent: form,
      top: 14,
      left: 2,
      content: 'Author Email: (optional)'
    });

    fields.authorEmail = blessed.textbox({
      parent: form,
      name: 'authorEmail',
      top: 15,
      left: 2,
      width: 74,
      height: 1,
      inputOnFocus: true,
      style: {
        fg: 'white',
        bg: 'black',
        focus: {
          bg: 'blue'
        }
      }
    });

    // Help text
    const help = blessed.text({
      parent: form,
      bottom: 0,
      left: 'center',
      content: 'TAB: next field | ESC: cancel | ENTER: continue',
      style: {
        fg: 'gray'
      }
    });

    // Validation
    fields.marketplaceName.on('submit', function() {
      const value = fields.marketplaceName.getValue();
      if (validateMarketplaceName(value)) {
        fields.marketplaceStatus.setContent('{green-fg}✓{/green-fg}');
        // Auto-fill output directory
        if (!fields.outputDirectory.getValue()) {
          fields.outputDirectory.setValue(path.resolve('./', value));
        }
      } else {
        fields.marketplaceStatus.setContent('{red-fg}✗{/red-fg}');
      }
      screen.render();
    });

    fields.sourceDirectory.on('submit', function() {
      const value = fields.sourceDirectory.getValue();
      const absPath = path.resolve(value);

      if (validateDirectory(absPath)) {
        const pluginCount = discoverPlugins(absPath);
        if (pluginCount > 0) {
          fields.sourceStatus.setContent(`{green-fg}✓ Found ${pluginCount} plugin(s){/green-fg}`);
        } else {
          fields.sourceStatus.setContent('{yellow-fg}⚠ No plugins found{/yellow-fg}');
        }
      } else {
        fields.sourceStatus.setContent('{red-fg}✗ Directory not found{/red-fg}');
      }
      screen.render();
    });

    // Form submission
    form.on('submit', () => {
      const marketplaceName = fields.marketplaceName.getValue().trim();
      const pluginName = fields.pluginName.getValue().trim();
      const sourceDirectory = fields.sourceDirectory.getValue().trim();
      const outputDirectory = fields.outputDirectory.getValue().trim() || path.resolve('./', marketplaceName);
      const authorEmail = fields.authorEmail.getValue().trim();

      // Validate required fields
      if (!marketplaceName || !pluginName || !sourceDirectory) {
        return;
      }

      if (!validateMarketplaceName(marketplaceName)) {
        return;
      }

      const absSourcePath = path.resolve(sourceDirectory);
      if (!validateDirectory(absSourcePath)) {
        return;
      }

      screen.destroy();
      resolve({
        marketplaceName,
        pluginName,
        sourceDirectory: absSourcePath,
        outputDirectory,
        authorEmail: authorEmail || undefined,
        action: 'continue'
      });
    });

    // Cancel
    screen.key(['escape'], () => {
      screen.destroy();
      resolve({
        marketplaceName: '',
        pluginName: '',
        sourceDirectory: '',
        outputDirectory: '',
        action: 'cancel'
      });
    });

    // Focus first field
    fields.marketplaceName.focus();
    screen.render();
  });
}
