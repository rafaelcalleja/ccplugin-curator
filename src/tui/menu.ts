import * as blessed from 'blessed';

export type MenuResult = 'create' | 'exit';

export class MainMenu {
  private screen: blessed.Widgets.Screen;
  private selectedIndex: number = 0;
  private options = [
    { id: 'create' as const, label: 'Create New Curated Plugin' },
    { id: 'exit' as const, label: 'Exit' },
  ];

  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Claude Marketplace Curator',
    });
  }

  public async show(): Promise<MenuResult> {
    return new Promise((resolve) => {
      this.render();
      this.setupKeyboardHandlers(resolve);
      this.screen.render();
    });
  }

  private render(): void {
    // Title box
    const titleBox = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: 55,
      height: 7,
      content: [
        '',
        '      CLAUDE MARKETPLACE CURATOR',
        '',
        '      Curate and combine plugin components',
        '      from multiple sources',
        '',
      ].join('\n'),
      tags: true,
      border: {
        type: 'line',
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'cyan',
        },
      },
    });

    // Menu options
    this.options.forEach((option, index) => {
      const top = 16 + index * 4;
      const isSelected = index === this.selectedIndex;
      const prefix = isSelected ? '► ' : '  ';

      blessed.box({
        parent: this.screen,
        top,
        left: 'center',
        width: 41,
        height: 3,
        content: `${prefix}${option.label}`,
        tags: true,
        border: {
          type: 'line',
        },
        style: {
          fg: isSelected ? 'yellow' : 'white',
          bg: 'black',
          border: {
            fg: isSelected ? 'blue' : 'gray',
          },
        },
      });
    });

    // Help text at bottom
    const helpBar = blessed.box({
      parent: this.screen,
      bottom: 0,
      left: 0,
      right: 0,
      height: 1,
      content: ' ↑↓: Navigate | ENTER: Select | Q: Quit',
      tags: true,
      style: {
        fg: 'white',
        bg: 'black',
      },
    });
  }

  private setupKeyboardHandlers(resolve: (result: MenuResult) => void): void {
    // Navigation
    this.screen.key(['up', 'k'], () => {
      this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
      this.screen.children.forEach((child) => child.detach());
      this.render();
      this.screen.render();
    });

    this.screen.key(['down', 'j'], () => {
      this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
      this.screen.children.forEach((child) => child.detach());
      this.render();
      this.screen.render();
    });

    // Selection
    this.screen.key(['enter'], () => {
      const selected = this.options[this.selectedIndex];
      this.cleanup();
      resolve(selected.id);
    });

    // Quit
    this.screen.key(['q', 'Q', 'escape', 'C-c'], () => {
      this.cleanup();
      resolve('exit');
    });
  }

  private cleanup(): void {
    this.screen.destroy();
  }
}
