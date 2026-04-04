import path from 'path';
import { resolveAvailablePackageManager } from '../utils/install';

export interface PromptAnswers {
  projectType: 'frontend' | 'backend' | 'fullstack';
  framework: string;
  language: 'typescript' | 'javascript';
  database: 'mongodb';
  projectName: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
}

export interface ResolvedConfig {
  type: 'delegate' | 'template';
  projectType: 'frontend' | 'backend' | 'fullstack';
  projectName: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  framework: string;
  language: 'typescript' | 'javascript';
  database: 'mongodb';
  targetPath: string;
  command?: string;
  args?: string[];
  templateName?: string;
  templatePath?: string;
}

export function resolveConfig(answers: PromptAnswers): ResolvedConfig {
  const { projectType, framework, language, database, projectName, packageManager } = answers;
  const targetPath = path.join(process.cwd(), projectName);

  // Frontend delegation
  if (projectType === 'frontend') {
    if (framework === 'react-vite') {
      const resolvedPm = resolveAvailablePackageManager(packageManager);
      const template = language === 'typescript' ? 'react-ts' : 'react';
      return {
        type: 'delegate',
        projectType,
        projectName,
        packageManager: resolvedPm,
        framework,
        language,
        database,
        targetPath,
        command: 'npm',
        args: ['create', 'vite@latest', projectName, '--yes', '--', '--template', template],
      };
    }

    if (framework === 'nextjs') {
      const resolvedPm = resolveAvailablePackageManager(packageManager);

      const args = [
        'create-next-app@latest',
        projectName,
        language === 'typescript' ? '--typescript' : '--no-typescript',
        '--eslint',
        '--no-git',
      ];

      if (resolvedPm === 'yarn') {
        args.push('--use-yarn');
      } else if (resolvedPm === 'pnpm') {
        args.push('--use-pnpm');
      } else {
        args.push('--use-npm');
      }

      return {
        type: 'delegate',
        projectType,
        projectName,
        packageManager: resolvedPm,
        framework,
        language,
        database,
        targetPath,
        command: 'npx',
        args,
      };
    }
  }

  // Backend templates
  if (projectType === 'backend' && framework === 'express') {
    const templateName = language === 'typescript' ? 'express-ts' : 'express-js';
    return {
      type: 'template',
      projectType,
      projectName,
      packageManager,
      framework,
      language,
      database,
      targetPath,
      templateName,
      templatePath: path.join(__dirname, '..', '..', 'templates', templateName),
    };
  }

  // Fullstack templates
  if (projectType === 'fullstack') {
    if (framework === 'mern') {
      const templateName = language === 'typescript' ? 'mern-ts' : 'mern-js';
      return {
        type: 'template',
        projectType,
        projectName,
        packageManager,
        framework,
        language,
        database,
        targetPath,
        templateName,
        templatePath: path.join(__dirname, '..', '..', 'templates', templateName),
      };
    }

    if (framework === 'next-fullstack') {
      const templateName = language === 'typescript' ? 'next-fullstack-ts' : 'next-fullstack-js';
      return {
        type: 'template',
        projectType,
        projectName,
        packageManager,
        framework,
        language,
        database,
        targetPath,
        templateName,
        templatePath: path.join(__dirname, '..', '..', 'templates', templateName),
      };
    }
  }

  throw new Error(`Unsupported configuration: ${projectType} / ${framework} / ${language}`);
}
