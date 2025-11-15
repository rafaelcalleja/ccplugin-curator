import React from 'react';
import type { NormalizedPlugin } from '../types/index.js';
import type { ComponentSelection } from '../types/index.js';
interface Props {
    plugins: NormalizedPlugin[];
    onExit: (selections: ComponentSelection[]) => void;
    onSave: (selections: ComponentSelection[]) => void;
}
export declare const PluginCurator: React.FC<Props>;
export {};
//# sourceMappingURL=PluginCurator.d.ts.map