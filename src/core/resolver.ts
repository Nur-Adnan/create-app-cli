// resolver.ts — Maps raw prompt answers to a concrete, type-safe scaffolding configuration
import path from 'path';

/** All supported framework identifiers across project types. */
export type Framework = 'react-vite' | 'nextjs' | 'express' | 'mern' | 'next-fullstack';

/** Validated answers collected from the interactive prompt flow. */
export interface PromptAnswers {
  projectType: 'frontend' | 'backend' | 'fullstack';
  framework: Framework;
  language: 'typescript' | 'javascript';
  database: 'mongodb';
  projectName: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  targetPath: string;
}

/** Shared fields present on every resolved config variant. */
interface BaseConfig {
  projectType: 'frontend' | 'backend' | 'fullstack';
  projectName: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  framework: Framework;
  language: 'typescript' | 'javascript';
  database: 'mongodb';
  targetPath: string;
}

/** Config for projects scaffolded by delegating to an official CLI (e.g. create-vite, create-next-app). */
export interface DelegateConfig extends BaseConfig {
  type: 'delegate';
  command: string;
  args: string[];
}

/** Config for projects scaffolded by copying an internal template directory. */
export interface TemplateConfig extends BaseConfig {
  type: 'template';
  templateName: string;
  templatePath: string;
}

/** Discriminated union of all scaffolding strategies. */
export type ResolvedConfig = DelegateConfig | TemplateConfig;

/**
 * Resolves validated prompt answers into a concrete scaffolding configuration.
 *
 * @param answers - Validated prompt answers from the CLI flow
 * @returns A type-safe configuration object for the generator
 * @throws Error if the project type + framework combination is unsupported
 */
export function resolveConfig(answers: PromptAnswers): ResolvedConfig {
  const { projectType, framework, language, database, projectName, packageManager, targetPath } = answers;

  if (projectType === 'frontend') {
    if (framework === 'react-vite') {
      const template = language === 'typescript' ? 'react-ts' : 'react';
      return {
        type: 'delegate',
        projectType,
        projectName,
        packageManager,
        framework,
        language,
        database,
        targetPath,
        command: 'npm',
        args: ['create', 'vite@latest', projectName, '--yes', '--', '--template', template],
      };
    }

    if (framework === 'nextjs') {
      const args = [
        'create-next-app@latest',
        projectName,
        language === 'typescript' ? '--typescript' : '--no-typescript',
        '--eslint',
        '--no-git',
      ];

      if (packageManager === 'yarn') {
        args.push('--use-yarn');
      } else if (packageManager === 'pnpm') {
        args.push('--use-pnpm');
      } else {
        args.push('--use-npm');
      }

      return {
        type: 'delegate',
        projectType,
        projectName,
        packageManager,
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
