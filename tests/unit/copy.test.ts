import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { vol } from 'memfs';
import { copyTemplate, replacePlaceholders, createEnvFile } from '../../src/utils/copy.js';

// Mock fs and fs/promises with memfs
vi.mock('fs', async () => {
  const memfs = await vi.importActual<typeof import('memfs')>('memfs');
  return memfs.fs;
});

vi.mock('fs/promises', async () => {
  const memfs = await vi.importActual<typeof import('memfs')>('memfs');
  return memfs.fs.promises;
});

describe('copy module', () => {
  beforeEach(() => {
    // Reset the in-memory file system before each test
    vol.reset();
  });

  afterEach(() => {
    vol.reset();
  });

  describe('copyTemplate', () => {
    it('should create all files in target directory', async () => {
      // Setup: Create a template directory with files
      vol.fromJSON({
        '/templates/test-template/package.json': '{"name": "PROJECT_NAME"}',
        '/templates/test-template/README.md': '# PROJECT_NAME',
        '/templates/test-template/src/index.ts': 'console.log("Hello");',
      });

      const templatePath = '/templates/test-template';
      const targetPath = '/target/my-app';

      // Execute
      await copyTemplate(templatePath, targetPath);

      // Verify all files were copied
      expect(vol.existsSync('/target/my-app/package.json')).toBe(true);
      expect(vol.existsSync('/target/my-app/README.md')).toBe(true);
      expect(vol.existsSync('/target/my-app/src/index.ts')).toBe(true);
    });
  });

  describe('replacePlaceholders', () => {
    it('should replace PROJECT_NAME in both package.json and README.md', async () => {
      // Setup: Create target directory with placeholder files
      vol.fromJSON({
        '/target/my-app/package.json': '{"name": "PROJECT_NAME", "version": "1.0.0"}',
        '/target/my-app/README.md': '# PROJECT_NAME\n\nWelcome to PROJECT_NAME',
      });

      const targetPath = '/target/my-app';
      const projectName = 'my-awesome-app';

      // Execute
      await replacePlaceholders(targetPath, projectName);

      // Verify replacements in package.json
      const packageJson = vol.readFileSync('/target/my-app/package.json', 'utf8') as string;
      expect(packageJson).toContain('"name": "my-awesome-app"');
      expect(packageJson).not.toContain('PROJECT_NAME');

      // Verify replacements in README.md
      const readme = vol.readFileSync('/target/my-app/README.md', 'utf8') as string;
      expect(readme).toContain('# my-awesome-app');
      expect(readme).toContain('Welcome to my-awesome-app');
      expect(readme).not.toContain('PROJECT_NAME');
    });

    it('should replace multiple occurrences of PROJECT_NAME per file', async () => {
      // Setup: Files with multiple PROJECT_NAME occurrences
      vol.fromJSON({
        '/target/test-app/package.json': JSON.stringify({
          name: 'PROJECT_NAME',
          description: 'PROJECT_NAME is awesome',
          repository: 'github.com/user/PROJECT_NAME',
        }),
        '/target/test-app/README.md': [
          '# PROJECT_NAME',
          '',
          'This is PROJECT_NAME.',
          'Install PROJECT_NAME with npm.',
          'Run PROJECT_NAME now!',
        ].join('\n'),
      });

      const targetPath = '/target/test-app';
      const projectName = 'cool-project';

      // Execute
      await replacePlaceholders(targetPath, projectName);

      // Verify all occurrences replaced in package.json
      const packageJson = vol.readFileSync('/target/test-app/package.json', 'utf8') as string;
      const packageData = JSON.parse(packageJson);
      expect(packageData.name).toBe('cool-project');
      expect(packageData.description).toBe('cool-project is awesome');
      expect(packageData.repository).toBe('github.com/user/cool-project');
      expect(packageJson).not.toContain('PROJECT_NAME');

      // Verify all occurrences replaced in README.md
      const readme = vol.readFileSync('/target/test-app/README.md', 'utf8') as string;
      expect(readme).toContain('# cool-project');
      expect(readme).toContain('This is cool-project.');
      expect(readme).toContain('Install cool-project with npm.');
      expect(readme).toContain('Run cool-project now!');
      expect(readme).not.toContain('PROJECT_NAME');
    });
  });

  describe('createEnvFile', () => {
    it('should create .env with same content when .env.example exists', async () => {
      // Setup: Create .env.example
      const envExampleContent = 'PORT=3000\nDB_URL=mongodb://localhost:27017\nSECRET=changeme';
      vol.fromJSON({
        '/target/my-app/.env.example': envExampleContent,
      });

      const targetPath = '/target/my-app';

      // Execute
      await createEnvFile(targetPath);

      // Verify .env was created with exact same content
      expect(vol.existsSync('/target/my-app/.env')).toBe(true);
      const envContent = vol.readFileSync('/target/my-app/.env', 'utf8') as string;
      expect(envContent).toBe(envExampleContent);
    });

    it('should not create .env and not throw error when .env.example is missing', async () => {
      // Setup: Empty target directory (no .env.example)
      vol.fromJSON({
        '/target/my-app/package.json': '{"name": "test"}',
      });

      const targetPath = '/target/my-app';

      // Execute - should not throw
      await expect(createEnvFile(targetPath)).resolves.toBeUndefined();

      // Verify .env was NOT created
      expect(vol.existsSync('/target/my-app/.env')).toBe(false);
    });
  });
});
