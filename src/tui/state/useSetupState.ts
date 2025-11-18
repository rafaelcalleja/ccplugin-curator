/**
 * Setup State Hook
 * Manages the setup flow state machine
 * Implements: docs/spec/009-tui-setup-screens.md
 */

import { useState, useCallback } from 'react';
import type { FormData } from '../screens/ConfigurationForm';

export type SetupScreen = 'main-menu' | 'configuration-form' | 'component-selection';

export interface SetupState {
  currentScreen: SetupScreen;
  formData: FormData | null;
}

export function useSetupState(initialScreen: SetupScreen = 'main-menu') {
  const [state, setState] = useState<SetupState>({
    currentScreen: initialScreen,
    formData: null,
  });

  const showMainMenu = useCallback(() => {
    setState({
      currentScreen: 'main-menu',
      formData: null,
    });
  }, []);

  const showConfigurationForm = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentScreen: 'configuration-form',
    }));
  }, []);

  const showComponentSelection = useCallback((formData: FormData) => {
    setState({
      currentScreen: 'component-selection',
      formData,
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.currentScreen === 'configuration-form') {
        return {
          currentScreen: 'main-menu',
          formData: null,
        };
      }
      return prev;
    });
  }, []);

  return {
    state,
    showMainMenu,
    showConfigurationForm,
    showComponentSelection,
    goBack,
  };
}
