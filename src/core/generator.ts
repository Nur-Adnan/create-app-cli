import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { copyTemplate, replacePlaceholders, createEnvFile } from '../utils/copy';
import { installDependencies } from '../utils/install';
import { initGit } from '../utils/git';
import {
  stepHeader,
  createSpinner,
  displayNextSteps,
  logWarning,
} from '../utils/logger';
import { ResolvedConfig } from './resolver';

/**
 * Validates that a template directory exists and contains required files.
 * 
 * @param templatePath - Absolute path to the template directory
 * @throws Error if template directory or required files are missing
 */
async function validateTemplate(templatePath: string): Promise<void> {
  // Check template directory exists
  try {
    await fs.access(templatePath);
  } catch {
    throw new Error(`Template directory not found: ${templatePath}`);
  }

  // Check package.json exists
  const packageJsonPath = path.join(templatePath, 'package.json');
  try {
    await fs.access(packageJsonPath);
  } catch {
    throw new Error(`Missing required file: package.json in ${templatePath}`);
  }

  // Check README.md exists
  const readmePath = path.join(templatePath, 'README.md');
  try {
    await fs.access(readmePath);
  } catch {
    throw new Error(`Missing required file: README.md in ${templatePath}`);
  }
}

/**
 * Generates a project based on the resolved configuration.
 * Orchestrates the full scaffolding pipeline: scaffold → install → git → next steps.
 * 
 * @param config - Resolved configuration from resolver.ts
 */
export async function generateProject(config: ResolvedConfig): Promise<void> {
  // Step 1: Scaffold
  stepHeader(1, 'Scaffolding project...');
  
  if (config.type === 'delegate') {
    // Delegate to official CLI — subprocess uses stdio: inherit so output is visible directly
    try {
      await runOfficialCLI(config.command!, config.args!);
    } catch (err) {
      throw err;
    }
  } else if (config.type === 'template') {
    // Copy internal template
    const spinner = createSpinner('Copying template...');
    spinner.start();
    
    try {
      await validateTemplate(config.templatePath!);
      await copyTemplate(config.templatePath!, config.targetPath);
      await replacePlaceholders(config.targetPath, config.projectName);
      await createEnvFile(config.targetPath);
      spinner.succeed('Template copied');
    } catch (err) {
      spinner.fail('Template copy failed');
      throw err;
    }
  }

  // Step 2: Install dependencies
  stepHeader(2, 'Installing dependencies');
  const installSpinner = createSpinner('Installing...');
  installSpinner.start();
  try {
    await installDependencies(config.targetPath, config.packageManager);
    installSpinner.succeed('Dependencies installed');
  } catch (err) {
    installSpinner.warn('Dependency installation failed');
    logWarning(
      `Failed to install dependencies. Run manually:\n  cd ${config.projectName} && ${config.packageManager} install`
    );
  }

  // Step 3: Initialize git repository
  stepHeader(3, 'Initializing git repository');
  const gitSpinner = createSpinner('Initializing git...');
  gitSpinner.start();
  try {
    await initGit(config.targetPath);
    gitSpinner.succeed('Git initialized with initial commit');
  } catch (err) {
    gitSpinner.warn('Git initialization failed');
    logWarning('Git initialization failed — you can run it manually');
  }

  // Step 5: Display next steps
  displayNextSteps(config);
}

/**
 * Runs an official CLI command (create-vite, create-next-app) with stdio: inherit.
 * 
 * @param command - The command to run (e.g., 'npm', 'npx')
 * @param args - Command arguments
 * @returns Promise that resolves on exit code 0
 * @throws Error if command exits with non-zero code
 */
function runOfficialCLI(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to spawn ${command}: ${err.message}`));
    });
  });
}
