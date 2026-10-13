const { spawn } = require('child_process');
const path = require('path');

console.log('\n=============================================================');
console.log('🍿 Launching REELFLIX Full-Stack Platform...');
console.log('=============================================================\n');

// Determine command for Windows or POSIX
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// Spawn Server
const server = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
});

// Spawn Client
const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
});

// Handle termination signals
const cleanExit = () => {
  console.log('\nStopping REELFLIX dev services...');
  server.kill();
  client.kill();
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
