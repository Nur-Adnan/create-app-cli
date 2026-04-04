import inquirer from 'inquirer';
import { logInfo, stepHeader } from '../utils/logger';

export interface BackendAnswers {
  framework: 'express';
  language: 'typescript' | 'javascript';
}

export async function runBackendPrompts(): Promise<BackendAnswers> {
  stepHeader(2, 'Backend Configuration');

  logInfo('Framework: Express.js');

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: 'Choose a language:',
      choices: [
        { name: 'TypeScript', value: 'typescript' },
        { name: 'JavaScript', value: 'javascript' },
      ],
    },
  ]);

  return {
    framework: 'express',
    language: answers.language,
  };
}
