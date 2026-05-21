// logger.ts — Terminal output helpers: colored logs, step headers, and spinner factory
import chalk from 'chalk';
import ora, { Ora } from 'ora';

/**
 * Logs an informational message with a blue icon.
 *
 * @param message - The message to display
 */
export function logInfo(message: string): void {
  console.log(chalk.blue('ℹ ' + message));
}

/**
 * Logs a success message with a green checkmark.
 *
 * @param message - The message to display
 */
export function logSuccess(message: string): void {
  console.log(chalk.green('✔ ' + message));
}

/**
 * Logs a warning message with a yellow icon.
 *
 * @param message - The message to display
 */
export function logWarning(message: string): void {
  console.log(chalk.yellow('⚠ ' + message));
}

/**
 * Logs an error message with a red icon.
 *
 * @param message - The message to display
 */
export function logError(message: string): void {
  console.log(chalk.red('✖ ' + message));
}

/**
 * Prints a numbered step header in bold cyan.
 *
 * @param n - The step number
 * @param message - The step description
 */
export function stepHeader(n: number, message: string): void {
  console.log(chalk.bold.cyan('\n[' + n + '] ' + message));
}

/**
 * Creates an ora spinner instance.
 *
 * @param text - Initial spinner text
 * @returns An ora spinner instance
 */
export function createSpinner(text: string): Ora {
  return ora(text);
}
