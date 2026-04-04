import chalk from 'chalk';
import ora, { Ora } from 'ora';

import { ResolvedConfig } from '../core/resolver';

export function logInfo(message: string): void {
  console.log(chalk.blue('ℹ ' + message));
}

export function logSuccess(message: string): void {
  console.log(chalk.green('✔ ' + message));
}

export function logWarning(message: string): void {
  console.log(chalk.yellow('⚠ ' + message));
}

export function logError(message: string): void {
  console.log(chalk.red('✖ ' + message));
}

export function stepHeader(n: number, message: string): void {
  console.log(chalk.bold.cyan('\n[' + n + '] ' + message));
}

export function createSpinner(text: string): Ora {
  return ora(text);
}

export function stopSpinner(
  spinner: Ora,
  status: 'succeed' | 'fail' | 'warn',
  message: string
): void {
  if (status === 'succeed') {
    spinner.succeed(message);
  } else if (status === 'fail') {
    spinner.fail(message);
  } else if (status === 'warn') {
    spinner.warn(message);
  }
}

export function displayNextSteps(config: ResolvedConfig): void {
  const { projectName, packageManager, framework } = config;

  console.log(chalk.bold.green(`\n✔  Project "${projectName}" is ready!\n`));
  console.log(chalk.bold('What to do next:\n'));

  // MERN has special instructions (server + client)
  if (framework === 'mern') {
    console.log(chalk.cyan(`  cd ${projectName}/server && ${packageManager} run dev`));
    console.log(chalk.cyan(`  cd ${projectName}/client && ${packageManager} run dev`));
  } else {
    // All other project types: cd + run dev
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan(`  ${packageManager} run dev`));
  }

  console.log();
}
