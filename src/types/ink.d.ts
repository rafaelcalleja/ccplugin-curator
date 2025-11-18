/**
 * Type declarations for ink (ESM module)
 * This file provides type compatibility for the ink library
 */

declare module 'ink' {
  import { FC, ReactNode } from 'react';

  export interface BoxProps {
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    width?: number | string;
    height?: number | string;
    minWidth?: number;
    minHeight?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    padding?: number;
    marginLeft?: number;
    marginRight?: number;
    marginTop?: number;
    marginBottom?: number;
    margin?: number;
    borderStyle?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic';
    borderColor?: string;
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    children?: ReactNode;
  }

  export const Box: FC<BoxProps>;

  export interface TextProps {
    color?: string;
    backgroundColor?: string;
    dimColor?: boolean;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    inverse?: boolean;
    wrap?: 'wrap' | 'truncate' | 'truncate-start' | 'truncate-middle' | 'truncate-end';
    children?: ReactNode;
  }

  export const Text: FC<TextProps>;

  export interface AppContext {
    exit: (error?: Error) => void;
  }

  export function useApp(): AppContext;

  export interface UseInputOptions {
    isActive?: boolean;
  }

  export function useInput(
    inputHandler: (input: string, key: Key) => void,
    options?: UseInputOptions
  ): void;

  export interface Key {
    upArrow: boolean;
    downArrow: boolean;
    leftArrow: boolean;
    rightArrow: boolean;
    return: boolean;
    escape: boolean;
    ctrl: boolean;
    shift: boolean;
    tab: boolean;
    backspace: boolean;
    delete: boolean;
    pageDown: boolean;
    pageUp: boolean;
    meta: boolean;
  }

  export interface RenderOptions {
    stdout?: NodeJS.WriteStream;
    stdin?: NodeJS.ReadStream;
    stderr?: NodeJS.WriteStream;
    debug?: boolean;
    exitOnCtrlC?: boolean;
    patchConsole?: boolean;
  }

  export interface Instance {
    rerender: (tree: ReactNode) => void;
    unmount: () => void;
    waitUntilExit: () => Promise<void>;
    clear: () => void;
  }

  export function render(tree: ReactNode, options?: RenderOptions): Instance;
}
