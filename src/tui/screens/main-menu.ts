import * as blessed from 'blessed';

export interface MainMenuResult {
  action: 'create' | 'exit';
}

/**
 * Displays the main menu and returns user's choice
 */
export async function showMainMenu(): Promise<MainMenuResult> {
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
      } else {
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
