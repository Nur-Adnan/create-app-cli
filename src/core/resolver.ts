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

  // Frontend templates
  if (projectType === 'frontend') {
    if (framework === 'react-vite') {
      const templateName = language === 'typescript' ? 'react-vite-ts' : 'react-vite-js';
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

    if (framework === 'nextjs') {
      const templateName = language === 'typescript' ? 'next-frontend-ts' : 'next-frontend-js';
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
