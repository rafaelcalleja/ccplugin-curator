import * as blessed from 'blessed';
import { FieldValidator, scanForPlugins } from '../lib/validation';

export interface ConfigFormData {
  marketplaceName: string;
  pluginName: string;
  sourceDir: string;
  outputDir: string;
  authorEmail: string;
}

interface Field {
  id: keyof ConfigFormData;
  label: string;
  placeholder: string;
  helpText: string;
  required: boolean;
  validator: (value: string) => Promise<{ valid: boolean; error?: string }>;
}

export class ConfigForm {
  private screen: blessed.Widgets.Screen;
  private fields: Field[];
  private fieldValues: Map<string, string> = new Map();
  private fieldErrors: Map<string, string> = new Map();
  private currentFieldIndex: number = 0;
  private discoveredPlugins: string[] = [];

  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Create Curated Plugin',
    });

    this.fields = [
      {
        id: 'marketplaceName',
        label: 'Marketplace Name',
        placeholder: 'my-marketplace',
        helpText: 'Used in package.json name field (lowercase, numbers, hyphens)',
        required: true,
        validator: async (value) => FieldValidator.validateMarketplaceName(value),
      },
      {
        id: 'pluginName',
        label: 'Plugin Name',
        placeholder: 'My Awesome Plugin',
        helpText: 'Display name for your curated plugin',
        required: true,
        validator: async (value) => FieldValidator.validatePluginName(value),
      },
      {
        id: 'sourceDir',
        label: 'Source Plugin Directory',
        placeholder: '~/.claude/plugins',
        helpText: 'Directory containing source plugins to curate',
        required: true,
        validator: async (value) => FieldValidator.validateSourceDirectory(value),
      },
      {
        id: 'outputDir',
        label: 'Output Directory',
        placeholder: './output',
        helpText: 'Where to save the curated plugin',
        required: false,
        validator: async (value) => FieldValidator.validateOutputDirectory(value),
      },
      {
        id: 'authorEmail',
        label: 'Author Email',
        placeholder: 'you@example.com',
        helpText: 'Optional email for plugin metadata',
        required: false,
        validator: async (value) => FieldValidator.validateEmail(value),
      },
    ];

    // Initialize with placeholders as values
    this.fields.forEach((field) => {
      this.fieldValues.set(field.id, '');
    });
  }

  public async show(): Promise<ConfigFormData | null> {
    return new Promise((resolve) => {
      this.render();
      this.setupKeyboardHandlers(resolve);
      this.screen.render();
    });
  }

  private render(): void {
    // Clear screen
    this.screen.children.forEach((child) => child.detach());

    // Title bar
    const titleBar = blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      content: ' CREATE CURATED PLUGIN',
      style: {
        fg: 'cyan',
        bg: 'black',
        bold: true,
      },
    });

    const separator = blessed.line({
      parent: this.screen,
      top: 1,
      left: 0,
      right: 0,
      orientation: 'horizontal',
      style: {
        fg: 'gray',
      },
    });

    // Required fields section
    const requiredBox = blessed.box({
      parent: this.screen,
      top: 3,
      left: 3,
      right: 3,
      height: 20,
      label: ' REQUIRED FIELDS ',
      border: {
        type: 'line',
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'yellow',
        },
        label: {
          fg: 'yellow',
        },
      },
    });

    // Optional fields section
    const optionalBox = blessed.box({
      parent: this.screen,
      top: 24,
      left: 3,
      right: 3,
      height: 12,
      label: ' OPTIONAL FIELDS ',
      border: {
        type: 'line',
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'yellow',
        },
        label: {
          fg: 'yellow',
        },
      },
    });

    // Render fields
    let requiredFieldTop = 2;
    let optionalFieldTop = 2;

    this.fields.forEach((field, index) => {
      const isFocused = index === this.currentFieldIndex;
      const value = this.fieldValues.get(field.id) || '';
      const error = this.fieldErrors.get(field.id);
      const isValid = value.length > 0 && !error;

      const parentBox = field.required ? requiredBox : optionalBox;
      const fieldTop = field.required ? requiredFieldTop : optionalFieldTop;

      // Field label
      blessed.text({
        parent: parentBox,
        top: fieldTop,
        left: 2,
        content: field.label,
        style: {
          fg: 'white',
          bold: true,
        },
      });

      // Input box
      const inputBox = blessed.box({
        parent: parentBox,
        top: fieldTop + 1,
        left: 2,
        width: 84,
        height: 3,
        border: {
          type: 'line',
        },
        style: {
          fg: value.length === 0 ? 'gray' : 'white',
          bg: 'black',
          border: {
            fg: isFocused ? 'blue' : 'gray',
          },
        },
      });

      // Display placeholder or value
      const displayText = value.length === 0 ? field.placeholder : value + (isFocused ? '█' : '');
      blessed.text({
        parent: inputBox,
        top: 0,
        left: 1,
        content: displayText,
        style: {
          fg: value.length === 0 ? 'gray' : 'white',
        },
      });

      // Validation indicator
      if (isValid) {
        blessed.text({
          parent: parentBox,
          top: fieldTop + 1,
          left: 87,
          content: '✓',
          style: {
            fg: 'green',
            bold: true,
          },
        });
      } else if (error) {
        blessed.text({
          parent: parentBox,
          top: fieldTop + 1,
          left: 87,
          content: '✗',
          style: {
            fg: 'red',
            bold: true,
          },
        });
      }

      // Focus indicator
      if (isFocused) {
        blessed.text({
          parent: parentBox,
          top: fieldTop + 2,
          left: 0,
          content: '►',
          style: {
            fg: 'yellow',
          },
        });
      }

      // Help text or error message
      const helpContent = error || field.helpText;
      const helpColor = error ? 'red' : 'gray';

      blessed.text({
        parent: parentBox,
        top: fieldTop + 4,
        left: 2,
        content: helpContent,
        style: {
          fg: helpColor,
        },
      });

      // Special: Show discovered plugins for source directory
      if (field.id === 'sourceDir' && this.discoveredPlugins.length > 0) {
        blessed.text({
          parent: parentBox,
          top: fieldTop + 5,
          left: 2,
          content: `→ Scanning... Found ${this.discoveredPlugins.length} plugins (${this.discoveredPlugins.join(', ')})`,
          style: {
            fg: 'green',
          },
        });
      }

      if (field.required) {
        requiredFieldTop += 6;
      } else {
        optionalFieldTop += 6;
      }
    });

    // Bottom help bar
    const canSubmit = this.validateAllRequiredFields();
    const helpText = canSubmit
      ? ' ENTER: Start Curating → | ESC: Cancel'
      : ' ↑↓/TAB: Navigate | Type to edit (placeholder disappears) | ENTER: Continue | ESC: Cancel';

    blessed.box({
      parent: this.screen,
      bottom: 0,
      left: 0,
      right: 0,
      height: 1,
      content: helpText,
      style: {
        fg: 'white',
        bg: 'black',
      },
    });
  }

  private setupKeyboardHandlers(resolve: (result: ConfigFormData | null) => void): void {
    // Navigation
    this.screen.key(['up', 'shift-tab'], () => {
      this.currentFieldIndex = Math.max(0, this.currentFieldIndex - 1);
      this.render();
      this.screen.render();
    });

    this.screen.key(['down', 'tab'], () => {
      this.currentFieldIndex = Math.min(this.fields.length - 1, this.currentFieldIndex + 1);
      this.render();
      this.screen.render();
    });

    // Text input
    this.screen.on('keypress', async (ch: string, key: any) => {
      if (!key) return;

      const currentField = this.fields[this.currentFieldIndex];

      // Handle backspace
      if (key.name === 'backspace') {
        const currentValue = this.fieldValues.get(currentField.id) || '';
        this.fieldValues.set(currentField.id, currentValue.slice(0, -1));
        await this.validateField(currentField);
        this.render();
        this.screen.render();
        return;
      }

      // Handle printable characters
      if (ch && ch.length === 1 && !key.ctrl && !key.meta) {
        const currentValue = this.fieldValues.get(currentField.id) || '';
        this.fieldValues.set(currentField.id, currentValue + ch);
        await this.validateField(currentField);

        // Auto-fill output directory
        if (currentField.id === 'marketplaceName') {
          const marketplaceName = this.fieldValues.get('marketplaceName') || '';
          const currentOutputDir = this.fieldValues.get('outputDir') || '';
          if (currentOutputDir.length === 0 || currentOutputDir === './output') {
            this.fieldValues.set('outputDir', `./output/${marketplaceName}`);
          }
        }

        // Scan for plugins when source directory changes
        if (currentField.id === 'sourceDir') {
          const sourceDir = this.fieldValues.get('sourceDir') || '';
          if (sourceDir.length > 0) {
            this.discoveredPlugins = await scanForPlugins(sourceDir);
          }
        }

        this.render();
        this.screen.render();
      }
    });

    // Submit
    this.screen.key(['enter'], () => {
      if (this.validateAllRequiredFields()) {
        const data: ConfigFormData = {
          marketplaceName: this.fieldValues.get('marketplaceName') || '',
          pluginName: this.fieldValues.get('pluginName') || '',
          sourceDir: this.fieldValues.get('sourceDir') || '',
          outputDir: this.fieldValues.get('outputDir') || './output',
          authorEmail: this.fieldValues.get('authorEmail') || '',
        };
        this.cleanup();
        resolve(data);
      }
    });

    // Cancel
    this.screen.key(['escape', 'q', 'Q', 'C-c'], () => {
      this.cleanup();
      resolve(null);
    });
  }

  private async validateField(field: Field): Promise<void> {
    const value = this.fieldValues.get(field.id) || '';

    if (value.length === 0) {
      if (field.required) {
        this.fieldErrors.set(field.id, `${field.label} is required`);
      } else {
        this.fieldErrors.delete(field.id);
      }
      return;
    }

    const result = await field.validator(value);
    if (result.valid) {
      this.fieldErrors.delete(field.id);
    } else {
      this.fieldErrors.set(field.id, result.error || 'Invalid value');
    }
  }

  private validateAllRequiredFields(): boolean {
    const requiredFields = this.fields.filter((f) => f.required);

    for (const field of requiredFields) {
      const value = this.fieldValues.get(field.id) || '';
      const error = this.fieldErrors.get(field.id);

      if (value.length === 0 || error) {
        return false;
      }
    }

    return true;
  }

  private cleanup(): void {
    this.screen.destroy();
  }
}
