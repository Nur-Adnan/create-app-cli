import inquirer from 'inquirer';
import { stepHeader } from '../utils/logger';

export interface FrontendAnswers {
  framework: 'react-vite' | 'nextjs';
  language: 'typescript' | 'javascript';
}

export async function runFrontendPrompts(): Promise<FrontendAnswers> {
  stepHeader(2, 'Frontend Configuration');

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Choose a framework:',
      choices: [
        { name: 'React (Vite-based)', value: 'react-vite' },
        { name: 'Next.js', value: 'nextjs' },
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
