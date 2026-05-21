// cli.ts — Main CLI orchestrator: chains prompts → resolver → generator
import inquirer from 'inquirer';
import { promises as fs } from 'fs';
import * as path from 'path';
import { runMainPrompt } from './prompts/main.prompt';
import { runFrontendPrompts } from './prompts/frontend.prompt';
import { runBackendPrompts } from './prompts/backend.prompt';
import { runFullstackPrompts } from './prompts/fullstack.prompt';
import { validateProjectName } from './prompts/validators';
import { resolveConfig, PromptAnswers } from './core/resolver';
import { generateProject } from './core/generator';
import { logInfo, logError, logWarning, stepHeader } from './utils/logger';
import { isPackageManagerAvailable } from './utils/install';

/**
 * Main CLI orchestration function.
 * Wires all prompts together, handles directory collision, and triggers project generation.
 */
export async function createApp(): Promise<void> {
  try {
    // Step 1: Get project type
    const { projectType } = await runMainPrompt();

    // Step 2: Get project-type-specific configuration
    let subAnswers: { framework: string; language: 'typescript' | 'javascript' };
    
    if (projectType === 'frontend') {
      subAnswers = await runFrontendPrompts();
    } else if (projectType === 'backend') {
      subAnswers = await runBackendPrompts();
    } else {
      subAnswers = await runFullstackPrompts();
    }

    // Step 3: Get database (backend and fullstack only — frontend has no direct DB connection)
    let database: 'mongodb' = 'mongodb';
    if (projectType !== 'frontend') {
      stepHeader(3, 'Database');
      const dbAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'database',
          message: 'Which database?',
          choices: [
            { name: 'MongoDB (recommended)', value: 'mongodb' },
          ],
        },
      ]);
      database = dbAnswer.database;
    }

    // Step numbers shift depending on whether database prompt was shown
    const nameStep = projectType !== 'frontend' ? 4 : 3;
    const pmStep = projectType !== 'frontend' ? 5 : 4;

    // Get project name with validation
    stepHeader(nameStep, 'Project Name');
    const { projectName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        validate: validateProjectName,
      },
    ]);

    // Get package manager
    stepHeader(pmStep, 'Package Manager');
    const { packageManager } = await inquirer.prompt([
      {
        type: 'list',
        name: 'packageManager',
        message: 'Package manager:',
        choices: [
          { name: 'npm', value: 'npm' },
          { name: 'yarn', value: 'yarn' },
          { name: 'pnpm', value: 'pnpm' },
        ],
      },
    ]);

    // Compute target path (single source of truth — resolver no longer computes this)
    const targetPath = path.join(process.cwd(), projectName);

    // Step 5: Merge all answers
    const answers: PromptAnswers = {
      projectType,
      framework: subAnswers.framework as PromptAnswers['framework'],
      language: subAnswers.language,
      database,
      projectName,
      packageManager,
      targetPath,
    };

    // Warn and fall back if chosen package manager isn't installed
    if (!isPackageManagerAvailable(packageManager)) {
      logWarning(`${packageManager} is not installed on this machine. Falling back to npm.`);
      answers.packageManager = 'npm';
    }

    // Step 6: Check for directory collision
    try {
      await fs.access(targetPath);
      
      // Directory exists - prompt for action
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Directory already exists. What would you like to do?',
          choices: [
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Cancel', value: 'cancel' },
          ],
        },
      ]);

      if (action === 'cancel') {
        logInfo('Cancelled');
        process.exit(0);
        return; // Ensure we don't continue in test environment
      }

      // Overwrite - delete existing directory
      await fs.rm(targetPath, { recursive: true, force: true });
    } catch {
      // Directory does not exist - proceed normally
    }

    // Step 7: Resolve configuration
    const config = resolveConfig(answers);

    // Step 8: Generate project
    await generateProject(config);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logError(message);
    process.exit(1);
  }
}
