import type { NormalizedPlugin } from './types/index.js';
import type { ComponentSelection } from './types/index.js';
export declare class CLI {
    private rl;
    constructor();
    displayHeader(pluginName: string): void;
    displayPlugin(plugin: NormalizedPlugin): void;
    selectComponents(plugin: NormalizedPlugin): Promise<ComponentSelection>;
    selectMultiple(prompt: string, items: string[]): Promise<string[]>;
    confirm(message: string): Promise<boolean>;
    displaySelection(selection: ComponentSelection): void;
    showSuccess(filePath: string): void;
    showWarning(message: string): void;
    showError(message: string): void;
    close(): void;
}
//# sourceMappingURL=cli.d.ts.map