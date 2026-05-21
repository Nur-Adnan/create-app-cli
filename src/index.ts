#!/usr/bin/env node
// index.ts — CLI entrypoint: configures Commander and delegates to the orchestrator
import { Command } from 'commander';
import { createApp } from './cli';
import * as path from 'path';
import * as fs from 'fs';

// Read version from package.json — single source of truth (ADR-003)
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as { version: string };

const program = new Command();

program
  .name('create-app')
  .version(pkg.version)
  .description('Scaffold a new project instantly');

program
  .command('create', { isDefault: true })
  .description('Create a new project')
  .action(createApp);

program.parse(process.argv);
