import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { ResolvedConfig } from './resolver';
import { createSpinner, stopSpinner, stepHeader, logWarning } from '../utils/logger';
import {
  getTodoTypeContent,
  getUseTodosContent,
  getTodoItemContent,
  getTodoFormContent,
  getTodoListContent,
  getTodoIndexContent,
  getAppContent,
  getNextPageContent,
  getTailwindConfig,
  getPostcssConfig,
  getTailwindCSS,
} from './todoTemplates';

const FEATURE_DIRS = [
  'features/todo',
  'components/atoms',
  'components/molecules',
  'components/organisms',
  'hooks',
  'lib',
  'types',
];

export async function runPostProcessing(config: ResolvedConfig): Promise<void> {
  await injectFolderStructure(config);
  await setupTailwind(config);
  await injectTodoApp(config);
}

async function injectFolderStructure(config: ResolvedConfig): Promise<void> {
  stepHeader(2, 'Injecting folder structure');
  const spinner = createSpinner('Creating directories...');
  spinner.start();
  try {
    const srcPath = path.join(config.targetPath, 'src');
    for (const dir of FEATURE_DIRS) {
      const fullPath = path.join(srcPath, dir);
      await fs.mkdir(fullPath, { recursive: true });
      await fs.writeFile(path.join(fullPath, '.gitkeep'), '');
    }
    stopSpinner(spinner, 'succeed', 'Folder structure created');
  } catch (err) {
    stopSpinner(spinner, 'fail', 'Folder structure creation failed');
    throw err;
  }
}

async function spawnInstall(pm: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(pm, args, { cwd, stdio: 'pipe', shell: true });
    child.on('exit', code => (code === 0 ? resolve() : reject(new Error(`${pm} ${args.join(' ')} exited with code ${code}`))));
    child.on('error', err => reject(err));
  });
}

async function setupTailwind(config: ResolvedConfig): Promise<void> {
  stepHeader(3, 'Setting up Tailwind CSS');
  const { targetPath, packageManager, framework, language } = config;

  const installSpinner = createSpinner('Installing tailwindcss postcss autoprefixer...');
  installSpinner.start();
  try {
    await spawnInstall(packageManager, ['install', '-D', 'tailwindcss', 'postcss', 'autoprefixer'], targetPath);
    stopSpinner(installSpinner, 'succeed', 'Tailwind dependencies installed');
  } catch (err) {
    stopSpinner(installSpinner, 'warn', 'Tailwind install failed — skipping');
    logWarning(`Run manually: cd ${config.projectName} && ${packageManager} install -D tailwindcss postcss autoprefixer`);
    return;
  }

  const configSpinner = createSpinner('Writing Tailwind config files...');
  configSpinner.start();
  try {
    const tailwindExt = language === 'typescript' ? 'ts' : 'js';
    await fs.writeFile(
      path.join(targetPath, `tailwind.config.${tailwindExt}`),
      getTailwindConfig(framework, language),
    );
    await fs.writeFile(path.join(targetPath, 'postcss.config.js'), getPostcssConfig());

    if (framework === 'react-vite') {
      await fs.writeFile(path.join(targetPath, 'src', 'index.css'), getTailwindCSS());
    } else if (framework === 'nextjs') {
      await fs.writeFile(path.join(targetPath, 'app', 'globals.css'), getTailwindCSS());
    }
    stopSpinner(configSpinner, 'succeed', 'Tailwind configured');
  } catch (err) {
    stopSpinner(configSpinner, 'fail', 'Tailwind config write failed');
    throw err;
  }
}

async function injectTodoApp(config: ResolvedConfig): Promise<void> {
  const { targetPath, framework, language } = config;
  const ext = language === 'typescript' ? 'ts' : 'js';
  const jsx = language === 'typescript' ? 'tsx' : 'jsx';
  const srcPath = path.join(targetPath, 'src');

  const spinner = createSpinner('Injecting Todo application...');
  spinner.start();
  try {
    await fs.writeFile(path.join(srcPath, 'types', `todo.${ext}`), getTodoTypeContent(language));
    await fs.writeFile(path.join(srcPath, 'hooks', `useTodos.${ext}`), getUseTodosContent(language));
    await fs.writeFile(path.join(srcPath, 'features', 'todo', `TodoItem.${jsx}`), getTodoItemContent(language));
    await fs.writeFile(path.join(srcPath, 'features', 'todo', `TodoForm.${jsx}`), getTodoFormContent(language));
    await fs.writeFile(path.join(srcPath, 'features', 'todo', `TodoList.${jsx}`), getTodoListContent(language));
    await fs.writeFile(path.join(srcPath, 'features', 'todo', `index.${ext}`), getTodoIndexContent(language));

    if (framework === 'react-vite') {
      await fs.writeFile(path.join(srcPath, `App.${jsx}`), getAppContent(language));
      await fs.unlink(path.join(srcPath, 'App.css')).catch(() => undefined);
      await fs.unlink(path.join(srcPath, 'assets', 'react.svg')).catch(() => undefined);
    } else if (framework === 'nextjs') {
      await fs.writeFile(path.join(targetPath, 'app', `page.${jsx}`), getNextPageContent(language));
      const componentsDir = path.join(targetPath, 'components');
      await fs.mkdir(componentsDir, { recursive: true });
      await fs.writeFile(path.join(componentsDir, `TodoList.${jsx}`), getNextjsTodoListContent(language));
    }

    stopSpinner(spinner, 'succeed', 'Todo application injected');
  } catch (err) {
    stopSpinner(spinner, 'fail', 'Todo injection failed');
    throw err;
  }
}

function getNextjsTodoListContent(language: string): string {
  if (language === 'typescript') {
    return `'use client';
import { useState } from 'react';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [value, setValue] = useState('');

  const addTodo = (title: string) => {
    if (!title.trim()) return;
    setTodos(prev => [...prev, { id: Date.now().toString(), title: title.trim(), completed: false }]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo(value);
    setValue('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Todos</h1>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
            Add
          </button>
        </form>
        <div className="flex flex-col gap-2">
          {todos.length === 0 && (
            <p className="text-center text-gray-400 py-8">No tasks yet. Add one above!</p>
          )}
          {todos.map(todo => (
            <div key={todo.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} className="w-4 h-4 accent-blue-500 cursor-pointer" />
              <span className={\`flex-1 text-gray-800 \${todo.completed ? 'line-through text-gray-400' : ''}\`}>{todo.title}</span>
              <button onClick={() => deleteTodo(todo.id)} className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors">Delete</button>
            </div>
          ))}
        </div>
        {todos.length > 0 && (
          <p className="text-center text-sm text-gray-400 mt-4">
            {todos.filter(t => t.completed).length}/{todos.length} completed
          </p>
        )}
      </div>
    </div>
  );
}
`;
  }
  return `'use client';
import { useState } from 'react';

export function TodoList() {
  const [todos, setTodos] = useState([]);
  const [value, setValue] = useState('');

  const addTodo = (title) => {
    if (!title.trim()) return;
    setTodos(prev => [...prev, { id: Date.now().toString(), title: title.trim(), completed: false }]);
  };

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTodo(value);
    setValue('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Todos</h1>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
            Add
          </button>
        </form>
        <div className="flex flex-col gap-2">
          {todos.length === 0 && (
            <p className="text-center text-gray-400 py-8">No tasks yet. Add one above!</p>
          )}
          {todos.map(todo => (
            <div key={todo.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} className="w-4 h-4 accent-blue-500 cursor-pointer" />
              <span className={\`flex-1 text-gray-800 \${todo.completed ? 'line-through text-gray-400' : ''}\`}>{todo.title}</span>
              <button onClick={() => deleteTodo(todo.id)} className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors">Delete</button>
            </div>
          ))}
        </div>
        {todos.length > 0 && (
          <p className="text-center text-sm text-gray-400 mt-4">
            {todos.filter(t => t.completed).length}/{todos.length} completed
          </p>
        )}
      </div>
    </div>
  );
}
`;
}
