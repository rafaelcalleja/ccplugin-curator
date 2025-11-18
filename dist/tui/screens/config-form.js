"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.showConfigForm = showConfigForm;
const blessed = __importStar(require("blessed"));
const validator_1 = require("../../lib/validator");
const path = __importStar(require("path"));
/**
 * Shows configuration form and returns user input
 */
async function showConfigForm() {
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
        const fields = {};
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
        fields.marketplaceName.on('submit', function () {
            const value = fields.marketplaceName.getValue();
            if ((0, validator_1.validateMarketplaceName)(value)) {
                fields.marketplaceStatus.setContent('{green-fg}✓{/green-fg}');
                // Auto-fill output directory
                if (!fields.outputDirectory.getValue()) {
                    fields.outputDirectory.setValue(path.resolve('./', value));
                }
            }
            else {
                fields.marketplaceStatus.setContent('{red-fg}✗{/red-fg}');
            }
            screen.render();
        });
        fields.sourceDirectory.on('submit', function () {
            const value = fields.sourceDirectory.getValue();
            const absPath = path.resolve(value);
            if ((0, validator_1.validateDirectory)(absPath)) {
                const pluginCount = (0, validator_1.discoverPlugins)(absPath);
                if (pluginCount > 0) {
                    fields.sourceStatus.setContent(`{green-fg}✓ Found ${pluginCount} plugin(s){/green-fg}`);
                }
                else {
                    fields.sourceStatus.setContent('{yellow-fg}⚠ No plugins found{/yellow-fg}');
                }
            }
            else {
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
            if (!(0, validator_1.validateMarketplaceName)(marketplaceName)) {
                return;
            }
            const absSourcePath = path.resolve(sourceDirectory);
            if (!(0, validator_1.validateDirectory)(absSourcePath)) {
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
//# sourceMappingURL=config-form.js.map