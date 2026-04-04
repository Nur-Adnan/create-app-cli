#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_commander = require("commander");

// src/cli.ts
var import_inquirer5 = __toESM(require("inquirer"));
var import_fs3 = require("fs");
var path5 = __toESM(require("path"));

// src/prompts/main.prompt.ts
var import_inquirer = __toESM(require("inquirer"));

// src/utils/logger.ts
var import_chalk = __toESM(require("chalk"));
var import_ora = __toESM(require("ora"));
function logInfo(message) {
  console.log(import_chalk.default.blue("\u2139 " + message));
}
function logWarning(message) {
  console.log(import_chalk.default.yellow("\u26A0 " + message));
}
function logError(message) {
  console.log(import_chalk.default.red("\u2716 " + message));
}
function stepHeader(n, message) {
  console.log(import_chalk.default.bold.cyan("\n[" + n + "] " + message));
}
function createSpinner(text) {
  return (0, import_ora.default)(text);
}
function stopSpinner(spinner, status, message) {
  if (status === "succeed") {
    spinner.succeed(message);
  } else if (status === "fail") {
    spinner.fail(message);
  } else if (status === "warn") {
    spinner.warn(message);
  }
}
function displayNextSteps(config) {
  const { projectName, packageManager, framework } = config;
  console.log(import_chalk.default.bold.green(`
\u2714  Project "${projectName}" is ready!
`));
  console.log(import_chalk.default.bold("What to do next:\n"));
  if (framework === "mern") {
    console.log(import_chalk.default.cyan(`  cd ${projectName}/server && ${packageManager} run dev`));
    console.log(import_chalk.default.cyan(`  cd ${projectName}/client && ${packageManager} run dev`));
  } else {
    console.log(import_chalk.default.cyan(`  cd ${projectName}`));
    console.log(import_chalk.default.cyan(`  ${packageManager} run dev`));
  }
  console.log();
}

// src/prompts/main.prompt.ts
async function runMainPrompt() {
  stepHeader(1, "Project Type");
  const answers = await import_inquirer.default.prompt([
    {
      type: "list",
      name: "projectType",
      message: "What type of project?",
      choices: [
        { name: "Frontend", value: "frontend" },
        { name: "Backend", value: "backend" },
        { name: "Full Stack", value: "fullstack" }
      ]
    }
  ]);
  return {
    projectType: answers.projectType
  };
}

// src/prompts/frontend.prompt.ts
var import_inquirer2 = __toESM(require("inquirer"));
async function runFrontendPrompts() {
  stepHeader(2, "Frontend Configuration");
  const answers = await import_inquirer2.default.prompt([
    {
      type: "list",
      name: "framework",
      message: "Choose a framework:",
      choices: [
        { name: "React (Vite-based)", value: "react-vite" },
        { name: "Next.js", value: "nextjs" }
      ]
    },
    {
      type: "list",
      name: "language",
      message: "Choose a language:",
      choices: [
        { name: "TypeScript", value: "typescript" },
        { name: "JavaScript", value: "javascript" }
      ]
    }
  ]);
  return {
    framework: answers.framework,
    language: answers.language
  };
}

// src/prompts/backend.prompt.ts
var import_inquirer3 = __toESM(require("inquirer"));
async function runBackendPrompts() {
  stepHeader(2, "Backend Configuration");
  logInfo("Framework: Express.js");
  const answers = await import_inquirer3.default.prompt([
    {
      type: "list",
      name: "language",
      message: "Choose a language:",
      choices: [
        { name: "TypeScript", value: "typescript" },
        { name: "JavaScript", value: "javascript" }
      ]
    }
  ]);
  return {
    framework: "express",
    language: answers.language
  };
}

// src/prompts/fullstack.prompt.ts
var import_inquirer4 = __toESM(require("inquirer"));
async function runFullstackPrompts() {
  stepHeader(2, "Full Stack Configuration");
  const answers = await import_inquirer4.default.prompt([
    {
      type: "list",
      name: "framework",
      message: "Choose a stack:",
      choices: [
        { name: "MERN", value: "mern" },
        { name: "Next.js Full Stack", value: "next-fullstack" }
      ]
    },
    {
      type: "list",
      name: "language",
      message: "Choose a language:",
      choices: [
        { name: "TypeScript", value: "typescript" },
        { name: "JavaScript", value: "javascript" }
      ]
    }
  ]);
  return {
    framework: answers.framework,
    language: answers.language
  };
}

// src/prompts/validators.ts
function validateProjectName(name) {
  if (name.trim() === "") {
    return "Project name cannot be empty";
  }
  if (name.includes(" ")) {
    return "Project name cannot contain spaces";
  }
  if (/[A-Z]/.test(name)) {
    return "Project name must be lowercase";
  }
  const validPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!validPattern.test(name)) {
    return "Only lowercase letters, numbers, and hyphens are allowed";
  }
  return true;
}

// src/core/resolver.ts
var import_path = __toESM(require("path"));

// src/utils/install.ts
var import_child_process = require("child_process");
function isPackageManagerAvailable(pm) {
  try {
    (0, import_child_process.execSync)(`${pm} --version`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
function resolveAvailablePackageManager(preferred) {
  if (isPackageManagerAvailable(preferred)) return preferred;
  return "npm";
}
async function installDependencies(targetPath, packageManager) {
  return new Promise((resolve, reject) => {
    const commands = {
      npm: "npm install",
      yarn: "yarn install",
      pnpm: "pnpm install"
    };
    const command = commands[packageManager];
    const [cmd, ...args] = command.split(" ");
    const child = (0, import_child_process.spawn)(cmd, args, {
      cwd: targetPath,
      stdio: "inherit",
      shell: true
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${packageManager} install failed with exit code ${code}`));
      }
    });
    child.on("error", (err) => {
      reject(new Error(`Failed to spawn ${packageManager}: ${err.message}`));
    });
  });
}

// src/core/resolver.ts
function resolveConfig(answers) {
  const { projectType, framework, language, database, projectName, packageManager } = answers;
  const targetPath = import_path.default.join(process.cwd(), projectName);
  if (projectType === "frontend") {
    if (framework === "react-vite") {
      const resolvedPm = resolveAvailablePackageManager(packageManager);
      const template = language === "typescript" ? "react-ts" : "react";
      return {
        type: "delegate",
        projectType,
        projectName,
        packageManager: resolvedPm,
        framework,
        language,
        database,
        targetPath,
        command: "npm",
        args: ["create", "vite@latest", projectName, "--yes", "--", "--template", template]
      };
    }
    if (framework === "nextjs") {
      const resolvedPm = resolveAvailablePackageManager(packageManager);
      const args = [
        "create-next-app@latest",
        projectName,
        language === "typescript" ? "--typescript" : "--no-typescript",
        "--eslint",
        "--no-git"
      ];
      if (resolvedPm === "yarn") {
        args.push("--use-yarn");
      } else if (resolvedPm === "pnpm") {
        args.push("--use-pnpm");
      } else {
        args.push("--use-npm");
      }
      return {
        type: "delegate",
        projectType,
        projectName,
        packageManager: resolvedPm,
        framework,
        language,
        database,
        targetPath,
        command: "npx",
        args
      };
    }
  }
  if (projectType === "backend" && framework === "express") {
    const templateName = language === "typescript" ? "express-ts" : "express-js";
    return {
      type: "template",
      projectType,
      projectName,
      packageManager,
      framework,
      language,
      database,
      targetPath,
      templateName,
      templatePath: import_path.default.join(__dirname, "..", "..", "templates", templateName)
    };
  }
  if (projectType === "fullstack") {
    if (framework === "mern") {
      const templateName = language === "typescript" ? "mern-ts" : "mern-js";
      return {
        type: "template",
        projectType,
        projectName,
        packageManager,
        framework,
        language,
        database,
        targetPath,
        templateName,
        templatePath: import_path.default.join(__dirname, "..", "..", "templates", templateName)
      };
    }
    if (framework === "next-fullstack") {
      const templateName = language === "typescript" ? "next-fullstack-ts" : "next-fullstack-js";
      return {
        type: "template",
        projectType,
        projectName,
        packageManager,
        framework,
        language,
        database,
        targetPath,
        templateName,
        templatePath: import_path.default.join(__dirname, "..", "..", "templates", templateName)
      };
    }
  }
  throw new Error(`Unsupported configuration: ${projectType} / ${framework} / ${language}`);
}

// src/core/generator.ts
var import_child_process4 = require("child_process");
var import_fs2 = require("fs");
var path4 = __toESM(require("path"));

// src/utils/copy.ts
var import_fs = require("fs");
var fsSync = __toESM(require("fs"));
var path2 = __toESM(require("path"));
async function copyTemplate(templatePath, targetPath) {
  await import_fs.promises.cp(templatePath, targetPath, { recursive: true });
}
async function replacePlaceholders(targetPath, projectName) {
  const packageJsonPath = path2.join(targetPath, "package.json");
  const packageJsonContent = await import_fs.promises.readFile(packageJsonPath, { encoding: "utf8" });
  const updatedPackageJson = packageJsonContent.replace(/PROJECT_NAME/g, projectName);
  await import_fs.promises.writeFile(packageJsonPath, updatedPackageJson, { encoding: "utf8" });
  const readmePath = path2.join(targetPath, "README.md");
  const readmeContent = await import_fs.promises.readFile(readmePath, { encoding: "utf8" });
  const updatedReadme = readmeContent.replace(/PROJECT_NAME/g, projectName);
  await import_fs.promises.writeFile(readmePath, updatedReadme, { encoding: "utf8" });
}
async function createEnvFile(targetPath) {
  const envExamplePath = path2.join(targetPath, ".env.example");
  const envPath = path2.join(targetPath, ".env");
  if (!fsSync.existsSync(envExamplePath)) {
    return;
  }
  await import_fs.promises.copyFile(envExamplePath, envPath);
}

// src/utils/git.ts
var import_child_process2 = require("child_process");
async function initGit(targetPath) {
  const commands = [
    { cmd: "git", args: ["init"], description: "git init" },
    { cmd: "git", args: ["add", "."], description: "git add ." },
    { cmd: "git", args: ["commit", "-m", "Initial commit from create-app"], description: "git commit" }
  ];
  for (const { cmd, args, description } of commands) {
    await runGitCommand(cmd, args, targetPath, description);
  }
}
function runGitCommand(cmd, args, cwd, description) {
  return new Promise((resolve, reject) => {
    const child = (0, import_child_process2.spawn)(cmd, args, {
      cwd,
      stdio: "pipe",
      shell: true
    });
    let stderr = "";
    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${description} failed with exit code ${code}${stderr ? ": " + stderr.trim() : ""}`));
      }
    });
    child.on("error", (err) => {
      reject(new Error(`Failed to execute ${description}: ${err.message}`));
    });
  });
}

// src/core/postprocessor.ts
var import_promises = __toESM(require("fs/promises"));
var import_path2 = __toESM(require("path"));
var import_child_process3 = require("child_process");

// src/core/todoTemplates.ts
function getTodoTypeContent(language) {
  if (language === "typescript") {
    return `export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}
`;
  }
  return `/**
 * @typedef {Object} Todo
 * @property {string} id
 * @property {string} title
 * @property {boolean} completed
 */
`;
}
function getUseTodosContent(language) {
  if (language === "typescript") {
    return `import { useState } from 'react';
import { Todo } from '../types/todo';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

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

  return { todos, addTodo, toggleTodo, deleteTodo };
}
`;
  }
  return `import { useState } from 'react';

export function useTodos() {
  const [todos, setTodos] = useState([]);

  /** @param {string} title */
  const addTodo = (title) => {
    if (!title.trim()) return;
    setTodos(prev => [...prev, { id: Date.now().toString(), title: title.trim(), completed: false }]);
  };

  /** @param {string} id */
  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  /** @param {string} id */
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return { todos, addTodo, toggleTodo, deleteTodo };
}
`;
}
function getTodoItemContent(language) {
  if (language === "typescript") {
    return `import { Todo } from '../../types/todo';

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-4 h-4 accent-blue-500 cursor-pointer"
      />
      <span className={\`flex-1 text-gray-800 \${todo.completed ? 'line-through text-gray-400' : ''}\`}>
        {todo.title}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors"
      >
        Delete
      </button>
    </div>
  );
}
`;
  }
  return `/**
 * @param {{ todo: {id: string, title: string, completed: boolean}, onToggle: (id: string) => void, onDelete: (id: string) => void }} props
 */
export function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-4 h-4 accent-blue-500 cursor-pointer"
      />
      <span className={\`flex-1 text-gray-800 \${todo.completed ? 'line-through text-gray-400' : ''}\`}>
        {todo.title}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors"
      >
        Delete
      </button>
    </div>
  );
}
`;
}
function getTodoFormContent(language) {
  if (language === "typescript") {
    return `import { useState } from 'react';

interface Props {
  onAdd: (title: string) => void;
}

export function TodoForm({ onAdd }: Props) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(value);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Add a new task..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
      >
        Add
      </button>
    </form>
  );
}
`;
  }
  return `import { useState } from 'react';

/** @param {{ onAdd: (title: string) => void }} props */
export function TodoForm({ onAdd }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(value);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Add a new task..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
      >
        Add
      </button>
    </form>
  );
}
`;
}
function getTodoListContent(language) {
  if (language === "typescript") {
    return `import { useTodos } from '../../hooks/useTodos';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';

export function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Todos</h1>
        <TodoForm onAdd={addTodo} />
        <div className="flex flex-col gap-2">
          {todos.length === 0 && (
            <p className="text-center text-gray-400 py-8">No tasks yet. Add one above!</p>
          )}
          {todos.map(todo => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
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
  return `import { useTodos } from '../../hooks/useTodos';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';

export function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Todos</h1>
        <TodoForm onAdd={addTodo} />
        <div className="flex flex-col gap-2">
          {todos.length === 0 && (
            <p className="text-center text-gray-400 py-8">No tasks yet. Add one above!</p>
          )}
          {todos.map(todo => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
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
function getTodoIndexContent(language) {
  return `export { TodoList } from './TodoList';
export { TodoForm } from './TodoForm';
export { TodoItem } from './TodoItem';
`;
}
function getAppContent(language) {
  if (language === "typescript") {
    return `import { TodoList } from './features/todo';

function App() {
  return <TodoList />;
}

export default App;
`;
  }
  return `import { TodoList } from './features/todo';

function App() {
  return <TodoList />;
}

export default App;
`;
}
function getNextPageContent(language) {
  if (language === "typescript") {
    return `import { TodoList } from '@/components/TodoList';

export default function Home() {
  return (
    <main>
      <TodoList />
    </main>
  );
}
`;
  }
  return `import { TodoList } from '@/components/TodoList';

export default function Home() {
  return (
    <main>
      <TodoList />
    </main>
  );
}
`;
}
function getTailwindConfig(framework, language) {
  const isTs = language === "typescript";
  const contentPaths = framework === "react-vite" ? `['./src/**/*.{js,jsx,ts,tsx}', './index.html']` : `['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}']`;
  if (isTs) {
    return `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ${contentPaths},
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
`;
  }
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ${contentPaths},
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
}
function getPostcssConfig() {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
}
function getTailwindCSS() {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
}

// src/core/postprocessor.ts
var FEATURE_DIRS = [
  "features/todo",
  "components/atoms",
  "components/molecules",
  "components/organisms",
  "hooks",
  "lib",
  "types"
];
async function runPostProcessing(config) {
  await injectFolderStructure(config);
  await setupTailwind(config);
  await injectTodoApp(config);
}
async function injectFolderStructure(config) {
  stepHeader(2, "Injecting folder structure");
  const spinner = createSpinner("Creating directories...");
  spinner.start();
  try {
    const srcPath = import_path2.default.join(config.targetPath, "src");
    for (const dir of FEATURE_DIRS) {
      const fullPath = import_path2.default.join(srcPath, dir);
      await import_promises.default.mkdir(fullPath, { recursive: true });
      await import_promises.default.writeFile(import_path2.default.join(fullPath, ".gitkeep"), "");
    }
    stopSpinner(spinner, "succeed", "Folder structure created");
  } catch (err) {
    stopSpinner(spinner, "fail", "Folder structure creation failed");
    throw err;
  }
}
async function spawnInstall(pm, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = (0, import_child_process3.spawn)(pm, args, { cwd, stdio: "pipe", shell: true });
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${pm} ${args.join(" ")} exited with code ${code}`)));
    child.on("error", (err) => reject(err));
  });
}
async function setupTailwind(config) {
  stepHeader(3, "Setting up Tailwind CSS");
  const { targetPath, packageManager, framework, language } = config;
  const installSpinner = createSpinner("Installing tailwindcss postcss autoprefixer...");
  installSpinner.start();
  try {
    await spawnInstall(packageManager, ["install", "-D", "tailwindcss", "postcss", "autoprefixer"], targetPath);
    stopSpinner(installSpinner, "succeed", "Tailwind dependencies installed");
  } catch (err) {
    stopSpinner(installSpinner, "warn", "Tailwind install failed \u2014 skipping");
    logWarning(`Run manually: cd ${config.projectName} && ${packageManager} install -D tailwindcss postcss autoprefixer`);
    return;
  }
  const configSpinner = createSpinner("Writing Tailwind config files...");
  configSpinner.start();
  try {
    const tailwindExt = language === "typescript" ? "ts" : "js";
    await import_promises.default.writeFile(
      import_path2.default.join(targetPath, `tailwind.config.${tailwindExt}`),
      getTailwindConfig(framework, language)
    );
    await import_promises.default.writeFile(import_path2.default.join(targetPath, "postcss.config.js"), getPostcssConfig());
    if (framework === "react-vite") {
      await import_promises.default.writeFile(import_path2.default.join(targetPath, "src", "index.css"), getTailwindCSS());
    } else if (framework === "nextjs") {
      await import_promises.default.writeFile(import_path2.default.join(targetPath, "app", "globals.css"), getTailwindCSS());
    }
    stopSpinner(configSpinner, "succeed", "Tailwind configured");
  } catch (err) {
    stopSpinner(configSpinner, "fail", "Tailwind config write failed");
    throw err;
  }
}
async function injectTodoApp(config) {
  const { targetPath, framework, language } = config;
  const ext = language === "typescript" ? "ts" : "js";
  const jsx = language === "typescript" ? "tsx" : "jsx";
  const srcPath = import_path2.default.join(targetPath, "src");
  const spinner = createSpinner("Injecting Todo application...");
  spinner.start();
  try {
    await import_promises.default.writeFile(import_path2.default.join(srcPath, "types", `todo.${ext}`), getTodoTypeContent(language));
    await import_promises.default.writeFile(import_path2.default.join(srcPath, "hooks", `useTodos.${ext}`), getUseTodosContent(language));
    await import_promises.default.writeFile(import_path2.default.join(srcPath, "features", "todo", `TodoItem.${jsx}`), getTodoItemContent(language));
    await import_promises.default.writeFile(import_path2.default.join(srcPath, "features", "todo", `TodoForm.${jsx}`), getTodoFormContent(language));
    await import_promises.default.writeFile(import_path2.default.join(srcPath, "features", "todo", `TodoList.${jsx}`), getTodoListContent(language));
    await import_promises.default.writeFile(import_path2.default.join(srcPath, "features", "todo", `index.${ext}`), getTodoIndexContent(language));
    if (framework === "react-vite") {
      await import_promises.default.writeFile(import_path2.default.join(srcPath, `App.${jsx}`), getAppContent(language));
      await import_promises.default.unlink(import_path2.default.join(srcPath, "App.css")).catch(() => void 0);
      await import_promises.default.unlink(import_path2.default.join(srcPath, "assets", "react.svg")).catch(() => void 0);
    } else if (framework === "nextjs") {
      await import_promises.default.writeFile(import_path2.default.join(targetPath, "app", `page.${jsx}`), getNextPageContent(language));
      const componentsDir = import_path2.default.join(targetPath, "components");
      await import_promises.default.mkdir(componentsDir, { recursive: true });
      await import_promises.default.writeFile(import_path2.default.join(componentsDir, `TodoList.${jsx}`), getNextjsTodoListContent(language));
    }
    stopSpinner(spinner, "succeed", "Todo application injected");
  } catch (err) {
    stopSpinner(spinner, "fail", "Todo injection failed");
    throw err;
  }
}
function getNextjsTodoListContent(language) {
  if (language === "typescript") {
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

// src/core/generator.ts
async function validateTemplate(templatePath) {
  try {
    await import_fs2.promises.access(templatePath);
  } catch {
    throw new Error(`Template directory not found: ${templatePath}`);
  }
  const packageJsonPath = path4.join(templatePath, "package.json");
  try {
    await import_fs2.promises.access(packageJsonPath);
  } catch {
    throw new Error(`Missing required file: package.json in ${templatePath}`);
  }
  const readmePath = path4.join(templatePath, "README.md");
  try {
    await import_fs2.promises.access(readmePath);
  } catch {
    throw new Error(`Missing required file: README.md in ${templatePath}`);
  }
}
async function generateProject(config) {
  const targetPath = path4.join(process.cwd(), config.projectName);
  stepHeader(1, "Scaffolding project...");
  if (config.type === "delegate") {
    try {
      await runOfficialCLI(config.command, config.args);
    } catch (err) {
      throw err;
    }
  } else if (config.type === "template") {
    const spinner = createSpinner("Copying template...");
    spinner.start();
    try {
      await validateTemplate(config.templatePath);
      await copyTemplate(config.templatePath, targetPath);
      await replacePlaceholders(targetPath, config.projectName);
      await createEnvFile(targetPath);
      spinner.succeed("Template copied");
    } catch (err) {
      spinner.fail("Template copy failed");
      throw err;
    }
  }
  if (config.projectType === "frontend") {
    stepHeader(2, "Enhancing project structure");
    await runPostProcessing(config);
  }
  if (config.type === "template") {
    stepHeader(3, "Installing dependencies");
    const installSpinner = createSpinner("Installing...");
    installSpinner.start();
    try {
      await installDependencies(targetPath, config.packageManager);
      installSpinner.succeed("Dependencies installed");
    } catch (err) {
      installSpinner.warn("Dependency installation failed");
      logWarning(
        `Failed to install dependencies. You can install them manually:
  cd ${config.projectName} && ${config.packageManager} install`
      );
    }
    stepHeader(4, "Initializing git repository");
    const gitSpinner = createSpinner("Initializing git...");
    gitSpinner.start();
    try {
      await initGit(targetPath);
      gitSpinner.succeed("Git initialized with initial commit");
    } catch (err) {
      gitSpinner.warn("Git initialization failed");
      logWarning("Git initialization failed \u2014 you can run it manually");
    }
  }
  displayNextSteps(config);
}
function runOfficialCLI(command, args) {
  return new Promise((resolve, reject) => {
    const child = (0, import_child_process4.spawn)(command, args, {
      stdio: "inherit",
      shell: true
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
      }
    });
    child.on("error", (err) => {
      reject(new Error(`Failed to spawn ${command}: ${err.message}`));
    });
  });
}

// src/cli.ts
async function createApp() {
  try {
    const { projectType } = await runMainPrompt();
    let subAnswers;
    if (projectType === "frontend") {
      subAnswers = await runFrontendPrompts();
    } else if (projectType === "backend") {
      subAnswers = await runBackendPrompts();
    } else {
      subAnswers = await runFullstackPrompts();
    }
    stepHeader(3, "Database");
    const { database } = await import_inquirer5.default.prompt([
      {
        type: "list",
        name: "database",
        message: "Which database?",
        choices: [
          { name: "MongoDB (recommended)", value: "mongodb" }
        ]
      }
    ]);
    stepHeader(4, "Project Name");
    const { projectName } = await import_inquirer5.default.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Project name:",
        validate: validateProjectName
      }
    ]);
    stepHeader(5, "Package Manager");
    const { packageManager } = await import_inquirer5.default.prompt([
      {
        type: "list",
        name: "packageManager",
        message: "Package manager:",
        choices: [
          { name: "npm", value: "npm" },
          { name: "yarn", value: "yarn" },
          { name: "pnpm", value: "pnpm" }
        ]
      }
    ]);
    const answers = {
      projectType,
      framework: subAnswers.framework,
      language: subAnswers.language,
      database,
      projectName,
      packageManager
    };
    if (!isPackageManagerAvailable(packageManager)) {
      logWarning(`${packageManager} is not installed on this machine. Falling back to npm.`);
    }
    const targetPath = path5.join(process.cwd(), answers.projectName);
    try {
      await import_fs3.promises.access(targetPath);
      const { action } = await import_inquirer5.default.prompt([
        {
          type: "list",
          name: "action",
          message: "Directory already exists. What would you like to do?",
          choices: [
            { name: "Overwrite", value: "overwrite" },
            { name: "Cancel", value: "cancel" }
          ]
        }
      ]);
      if (action === "cancel") {
        logInfo("Cancelled");
        process.exit(0);
        return;
      }
      await import_fs3.promises.rm(targetPath, { recursive: true, force: true });
    } catch {
    }
    const config = resolveConfig(answers);
    await generateProject(config);
  } catch (err) {
    logError(err.message);
    process.exit(1);
  }
}

// src/index.ts
var program = new import_commander.Command();
program.name("create-app").version("1.0.0").description("Scaffold a new project instantly");
program.command("create", { isDefault: true }).description("Create a new project").action(createApp);
program.parse(process.argv);
