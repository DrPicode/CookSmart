#!/usr/bin/env node
// Custom dev script: respects PORT env (used by vercel dev) and falls back to 5173.
import { spawn } from 'node:child_process';

const port = process.env.PORT || '5173';
const child = spawn('node', ['node_modules/vite/bin/vite.js', '--port', port], {
  stdio: 'inherit',
  env: process.env
});

child.on('exit', code => process.exit(code ?? 0));
