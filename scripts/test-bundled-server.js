/**
 * Test script to verify the bundled server can start
 */

const { fork } = require('child_process');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'dist', 'server', 'index.js');

console.log('Testing bundled server...');
console.log('Server path:', serverPath);

const serverProcess = fork(serverPath, [], {
  env: {
    ...process.env,
    PORT: '8082',
    HOST: '0.0.0.0',
    EXTENSION_MODE: 'true',
  },
  stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
});

serverProcess.stdout.on('data', (data) => {
  console.log('[Server]', data.toString());
});

serverProcess.stderr.on('data', (data) => {
  console.error('[Server Error]', data.toString());
});

serverProcess.on('message', (message) => {
  console.log('[IPC]', message);
  
  if (message.type === 'status' && message.status === 'running') {
    console.log('\n✅ Server started successfully!');
    console.log(`   URL: http://localhost:${message.port}`);
    
    // Stop server after 2 seconds
    setTimeout(() => {
      console.log('\nStopping server...');
      serverProcess.send({ type: 'stop' });
      
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    }, 2000);
  }
  
  if (message.type === 'status' && message.status === 'error') {
    console.error('\n❌ Server failed to start:', message.error);
    process.exit(1);
  }
});

serverProcess.on('error', (error) => {
  console.error('\n❌ Failed to start server process:', error);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  console.log(`\nServer exited with code ${code}, signal ${signal}`);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('\n❌ Server start timeout');
  serverProcess.kill();
  process.exit(1);
}, 10000);
