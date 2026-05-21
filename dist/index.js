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
var path4 = __toESM(require("path"));

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
function resolveConfig(answers) {
  const { projectType, framework, language, database, projectName, packageManager } = answers;
  const targetPath = import_path.default.join(process.cwd(), projectName);
  if (projectType === "frontend") {
    if (framework === "react-vite") {
      const templateName = language === "typescript" ? "react-vite-ts" : "react-vite-js";
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
    if (framework === "nextjs") {
      const templateName = language === "typescript" ? "next-frontend-ts" : "next-frontend-js";
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
var import_child_process3 = require("child_process");
var import_fs2 = require("fs");
var path3 = __toESM(require("path"));

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

// src/core/generator.ts
async function validateTemplate(templatePath) {
  try {
    await import_fs2.promises.access(templatePath);
  } catch {
    throw new Error(`Template directory not found: ${templatePath}`);
  }
  const packageJsonPath = path3.join(templatePath, "package.json");
  try {
    await import_fs2.promises.access(packageJsonPath);
  } catch {
    throw new Error(`Missing required file: package.json in ${templatePath}`);
  }
  const readmePath = path3.join(templatePath, "README.md");
  try {
    await import_fs2.promises.access(readmePath);
  } catch {
    throw new Error(`Missing required file: README.md in ${templatePath}`);
  }
}
async function generateProject(config) {
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
      await copyTemplate(config.templatePath, config.targetPath);
      await replacePlaceholders(config.targetPath, config.projectName);
      await createEnvFile(config.targetPath);
      spinner.succeed("Template copied");
    } catch (err) {
      spinner.fail("Template copy failed");
      throw err;
    }
  }
  stepHeader(2, "Installing dependencies");
  const installSpinner = createSpinner("Installing...");
  installSpinner.start();
  try {
    await installDependencies(config.targetPath, config.packageManager);
    installSpinner.succeed("Dependencies installed");
  } catch (err) {
    installSpinner.warn("Dependency installation failed");
    logWarning(
      `Failed to install dependencies. Run manually:
  cd ${config.projectName} && ${config.packageManager} install`
    );
  }
  stepHeader(3, "Initializing git repository");
  const gitSpinner = createSpinner("Initializing git...");
  gitSpinner.start();
  try {
    await initGit(config.targetPath);
    gitSpinner.succeed("Git initialized with initial commit");
  } catch (err) {
    gitSpinner.warn("Git initialization failed");
    logWarning("Git initialization failed \u2014 you can run it manually");
  }
  displayNextSteps(config);
}
function runOfficialCLI(command, args) {
  return new Promise((resolve, reject) => {
    const child = (0, import_child_process3.spawn)(command, args, {
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
    let database = "mongodb";
    if (projectType !== "frontend") {
      stepHeader(3, "Database");
      const dbAnswer = await import_inquirer5.default.prompt([
        {
          type: "list",
          name: "database",
          message: "Which database?",
          choices: [
            { name: "MongoDB (recommended)", value: "mongodb" }
          ]
        }
      ]);
      database = dbAnswer.database;
    }
    const nameStep = projectType !== "frontend" ? 4 : 3;
    const pmStep = projectType !== "frontend" ? 5 : 4;
    stepHeader(nameStep, "Project Name");
    const { projectName } = await import_inquirer5.default.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Project name:",
        validate: validateProjectName
      }
    ]);
    stepHeader(pmStep, "Package Manager");
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
    const targetPath = path4.join(process.cwd(), answers.projectName);
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
