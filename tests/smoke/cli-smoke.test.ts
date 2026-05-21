// cli-smoke.test.ts — Post-build smoke test: verifies the built CLI binary loads and responds to --help
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const distPath = path.resolve(__dirname, '..', '..', 'dist', 'index.js');

describe('CLI smoke tests', () => {
  it('dist/index.js exists', () => {
    expect(fs.existsSync(distPath)).toBe(true);
  });

  it('dist/index.js starts with shebang', () => {
    const content = fs.readFileSync(distPath, 'utf8');
    expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  it('--help exits with code 0 and prints usage', () => {
    const output = execFileSync('node', [distPath, '--help'], {
      encoding: 'utf8',
      timeout: 10_000,
    });

    expect(output).toContain('create-app');
    expect(output).toContain('Scaffold');
  });

  it('--version prints the package.json version', () => {
    const pkgPath = path.resolve(__dirname, '..', '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version: string };

    const output = execFileSync('node', [distPath, '--version'], {
      encoding: 'utf8',
      timeout: 10_000,
    });

    expect(output.trim()).toBe(pkg.version);
  });

  it('sourcemap file exists alongside the bundle', () => {
    const mapPath = distPath + '.map';
    expect(fs.existsSync(mapPath)).toBe(true);
  });
});
