import type { NormalizedPlugin } from '../../types/normalized';
import type { Selection } from '../../lib/save-controller';
export interface ComponentSelectionResult {
    selection: Selection;
    action: 'save' | 'quit';
}
/**
 * Shows component selection TUI and returns user's selections
 */
export declare function showComponentSelection(plugins: NormalizedPlugin[]): Promise<ComponentSelectionResult>;
//# sourceMappingURL=component-selection.d.ts.map