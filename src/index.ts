#!/usr/bin/env node
import { Command } from 'commander';
import { createApp } from './cli';

const program = new Command();

program
  .name('create-app')
  .version('1.0.0')
  .description('Scaffold a new project instantly');

program
  .command('create', { isDefault: true })
  .description('Create a new project')
  .action(createApp);

program.parse(process.argv);
