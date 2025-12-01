/**
 * Mock server for testing ServerManager
 * Simulates the real server's IPC communication
 */

// Simulate server startup delay
setTimeout(() => {
  if (process.send) {
    // Send starting status
    process.send({ type: 'status', status: 'starting' });
    
    // After a short delay, send running status
    setTimeout(() => {
      if (process.send) {
        const port = parseInt(process.env.PORT || '8080', 10);
        process.send({ type: 'status', status: 'running', port });
      }
    }, 100);
  }
}, 50);

// Handle IPC commands from parent
process.on('message', (message) => {
  if (message.type === 'stop') {
    if (process.send) {
      process.send({ type: 'status', status: 'stopping' });
    }
    
    setTimeout(() => {
      if (process.send) {
        process.send({ type: 'status', status: 'stopped' });
      }
      process.exit(0);
    }, 100);
  } else if (message.type === 'ping') {
    if (process.send) {
      const port = parseInt(process.env.PORT || '8080', 10);
      process.send({ type: 'status', status: 'running', port });
    }
  }
});

// Keep process alive
setInterval(() => {}, 1000);
