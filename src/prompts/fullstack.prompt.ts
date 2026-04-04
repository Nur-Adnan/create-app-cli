import inquirer from 'inquirer';
import { stepHeader } from '../utils/logger';

export interface FullstackAnswers {
  framework: 'mern' | 'next-fullstack';
  language: 'typescript' | 'javascript';
}

export async function runFullstackPrompts(): Promise<FullstackAnswers> {
  stepHeader(2, 'Full Stack Configuration');

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Choose a stack:',
      choices: [
        { name: 'MERN', value: 'mern' },
        { name: 'Next.js Full Stack', value: 'next-fullstack' },
      ],
    },
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
    framework: answers.framework,
    language: answers.language,
  };
}
