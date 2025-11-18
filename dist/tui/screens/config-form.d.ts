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
export declare function showConfigForm(): Promise<ConfigFormResult>;
//# sourceMappingURL=config-form.d.ts.map