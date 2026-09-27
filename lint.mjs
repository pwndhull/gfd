// Runs content checks: regenerates content, bundles src/lint.ts for Node and executes it.
import { build } from 'esbuild';
import { execSync } from 'node:child_process';
execSync('node build.mjs --dev', { stdio: 'ignore' });
await build({ entryPoints: ['src/lint.ts'], bundle: true, platform: 'node', format: 'esm', outfile: '.lint.mjs', logLevel: 'error' });
await import('./.lint.mjs?' + Date.now());
