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
exports.showMainMenu = showMainMenu;
const blessed = __importStar(require("blessed"));
/**
 * Displays the main menu and returns user's choice
 */
async function showMainMenu() {
    return new Promise((resolve) => {
        const screen = blessed.screen({
            smartCSR: true,
            title: 'CCPlugin Curator'
        });
        // Welcome banner
        const banner = blessed.box({
            top: 2,
            left: 'center',
            width: 60,
            height: 7,
            content: `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║           CCPlugin Curator v0.1.0                     ║
║                                                       ║
║     Curate and combine Claude Code plugins            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝`,
            tags: true,
            border: 'line',
            style: {
                fg: 'cyan',
                border: {
                    fg: 'cyan'
                }
            }
        });
        // Menu options
        const menu = blessed.list({
            top: 10,
            left: 'center',
            width: 50,
            height: 8,
            label: ' Select an option ',
            tags: true,
            keys: true,
            vi: true,
            mouse: true,
            border: 'line',
            scrollbar: {
                ch: ' ',
                track: {
                    bg: 'cyan'
                },
                style: {
                    inverse: true
                }
            },
            style: {
                fg: 'white',
                selected: {
                    bg: 'blue',
                    fg: 'white',
                    bold: true
                },
                border: {
                    fg: 'cyan'
                }
            },
            items: [
                '  Create New Curated Plugin',
                '  Exit'
            ]
        });
        // Help text
        const help = blessed.text({
            bottom: 1,
            left: 'center',
            width: 'shrink',
            height: 1,
            content: 'Use ↑↓ arrows to navigate, ENTER to select, Q to quit',
            style: {
                fg: 'gray'
            }
        });
        screen.append(banner);
        screen.append(menu);
        screen.append(help);
        menu.focus();
        // Handle selection
        menu.on('select', (item, index) => {
            screen.destroy();
            if (index === 0) {
                resolve({ action: 'create' });
            }
            else {
                resolve({ action: 'exit' });
            }
        });
        // Handle quit
        screen.key(['q', 'Q', 'escape', 'C-c'], () => {
            screen.destroy();
            resolve({ action: 'exit' });
        });
        screen.render();
    });
}
//# sourceMappingURL=main-menu.js.map