#!/usr/bin/env node
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Register tsx loader
register('tsx/esm', pathToFileURL('./'));

// Import and run the CLI
await import('../src/cli.tsx');
