import { useInput } from 'ink';

/**
 * Keyboard navigation hook
 *
 * Handles:
 * - Arrow keys for navigation
 * - Space for toggle
 * - Tab for panel switching
 * - S for save
 * - Q for quit
 */

export interface KeyboardHandlers {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onSpace?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  onSelectAll?: () => void;
  onSelectNone?: () => void;
  onSave?: () => void;
  onQuit?: () => void;
}

export function useKeyboard(handlers: KeyboardHandlers) {
  useInput((input, key) => {
    if (key.upArrow && handlers.onUp) {
      handlers.onUp();
    } else if (key.downArrow && handlers.onDown) {
      handlers.onDown();
    } else if (key.leftArrow && handlers.onLeft) {
      handlers.onLeft();
    } else if (key.rightArrow && handlers.onRight) {
      handlers.onRight();
    } else if (input === ' ' && handlers.onSpace) {
      handlers.onSpace();
    } else if (key.tab && key.shift && handlers.onShiftTab) {
      handlers.onShiftTab();
    } else if (key.tab && handlers.onTab) {
      handlers.onTab();
    } else if ((input === 'a' || input === 'A') && handlers.onSelectAll) {
      handlers.onSelectAll();
    } else if ((input === 'n' || input === 'N') && handlers.onSelectNone) {
      handlers.onSelectNone();
    } else if ((input === 's' || input === 'S') && handlers.onSave) {
      handlers.onSave();
    } else if ((input === 'q' || input === 'Q') && handlers.onQuit) {
      handlers.onQuit();
    }
  });
}
