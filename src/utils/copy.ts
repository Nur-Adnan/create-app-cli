import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import * as path from 'path';

/**
 * Recursively copies a template directory to a target location.
 * Uses Node 18+ built-in fs.cp with recursive option.
 * 
 * @param templatePath - Absolute path to the template directory
 * @param targetPath - Absolute path to the target directory
 */
export async function copyTemplate(
  templatePath: string,
  targetPath: string
): Promise<void> {
  await fs.cp(templatePath, targetPath, { recursive: true });
}

/**
 * Replaces all PROJECT_NAME placeholders in package.json and README.md
 * with the actual project name.
 * 
 * @param targetPath - Absolute path to the project directory
 * @param projectName - The actual project name to replace placeholders with
 */
export async function replacePlaceholders(
  targetPath: string,
  projectName: string
): Promise<void> {
  // Replace in package.json
  const packageJsonPath = path.join(targetPath, 'package.json');
  const packageJsonContent = await fs.readFile(packageJsonPath, { encoding: 'utf8' });
  const updatedPackageJson = packageJsonContent.replace(/PROJECT_NAME/g, projectName);
  await fs.writeFile(packageJsonPath, updatedPackageJson, { encoding: 'utf8' });

  // Replace in README.md
  const readmePath = path.join(targetPath, 'README.md');
  const readmeContent = await fs.readFile(readmePath, { encoding: 'utf8' });
  const updatedReadme = readmeContent.replace(/PROJECT_NAME/g, projectName);
  await fs.writeFile(readmePath, updatedReadme, { encoding: 'utf8' });
}

/**
 * Creates a .env file from .env.example if it exists.
 * Silently returns if .env.example does not exist.
 * 
 * @param targetPath - Absolute path to the project directory
 */
export async function createEnvFile(targetPath: string): Promise<void> {
  const envExamplePath = path.join(targetPath, '.env.example');
  const envPath = path.join(targetPath, '.env');

  // Check if .env.example exists
  if (!fsSync.existsSync(envExamplePath)) {
    return;
  }

  // Copy .env.example to .env
  await fs.copyFile(envExamplePath, envPath);
}
