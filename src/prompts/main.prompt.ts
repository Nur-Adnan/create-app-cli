import inquirer from 'inquirer';
import { stepHeader } from '../utils/logger';

export interface MainAnswers {
  projectType: 'frontend' | 'backend' | 'fullstack';
}

export async function runMainPrompt(): Promise<MainAnswers> {
  stepHeader(1, 'Project Type');

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: 'What type of project?',
      choices: [
        { name: 'Frontend', value: 'frontend' },
        { name: 'Backend', value: 'backend' },
        { name: 'Full Stack', value: 'fullstack' },
      ],
    },
  ]);

  return {
    projectType: answers.projectType,
  };
}
