import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('🚀 Starting DevCollab Full-Stack Platform');
console.log('====================================================');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Start Backend Server
console.log('📡 Starting Backend API Service (Port 5000)...');
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'backend'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '5000' }
});

// 2. Start Frontend Vite Dev Server
console.log('💻 Starting Frontend Client (Port 5173)...');
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'frontend'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

function cleanup() {
  console.log('\n🛑 Shutting down DevCollab services...');
  if (isWindows) {
    if (backend.pid) spawn('taskkill', ['/pid', backend.pid.toString(), '/f', '/t']);
    if (frontend.pid) spawn('taskkill', ['/pid', frontend.pid.toString(), '/f', '/t']);
  } else {
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
