import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { defaultConfig } from './config/default';
import { logger } from './utils/logger';
import { WebSocketService } from './services/websocket';
import { getDatabaseService, closeDatabaseService } from './services/database';
import { FileStorageService } from './services/file-storage';
import { createFileRoutes } from './routes/file-routes';

// IPC message types for extension communication
interface IPCMessage {
  type: 'start' | 'stop' | 'status' | 'ping';
  payload?: unknown;
}

interface IPCStatusMessage {
  type: 'status';
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  port?: number;
  error?: string;
}

// Check if running as child process (spawned by VS Code extension)
const isChildProcess = typeof process.send === 'function';

/**
 * Send IPC message to parent process (VS Code extension)
 */
function sendIPCMessage(message: IPCStatusMessage): void {
  if (isChildProcess && process.send) {
    process.send(message);
  }
}

/**
 * Resolve the client assets path
 * - In extension mode: client assets are in ../client relative to server
 * - In standalone mode: client assets are in dist/client from cwd
 */
function resolveClientPath(): string {
  // Check for EXTENSION_MODE environment variable
  const extensionMode = process.env.EXTENSION_MODE === 'true';
  
  if (extensionMode) {
    // Extension mode: assets are bundled alongside server
    return path.join(__dirname, '../client');
  }
  
  // Standalone mode: check if running from dist or development
  const distClientPath = path.join(__dirname, '../client');
  if (fs.existsSync(distClientPath)) {
    return distClientPath;
  }
  
  // Fallback to cwd-based path for development
  return path.join(process.cwd(), 'dist/client');
}

const app = express();
const server = createServer(app);

// Initialiser le service de base de données
const dbService = getDatabaseService();

// Initialiser le service de stockage de fichiers
const fileStorage = new FileStorageService(defaultConfig.storagePath);

// Créer le répertoire temp pour multer s'il n'existe pas
const tempDir = path.join(defaultConfig.storagePath, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Initialiser le service WebSocket avec la base de données
const wsService = new WebSocketService(server, dbService);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du client
const clientPath = resolveClientPath();
logger.info(`📂 Client assets path: ${clientPath}`);
app.use(express.static(clientPath));

// Routes de base
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/config', (_req, res) => {
  res.json({
    maxFileSize: defaultConfig.maxFileSize,
    enableMDNS: defaultConfig.enableMDNS,
  });
});

app.get('/api/users', (_req, res) => {
  res.json({
    connectedUsers: wsService.getConnectedUsers(),
    totalConnected: wsService.getConnectedUsersCount()
  });
});

app.get('/api/database/stats', (_req, res) => {
  res.json(dbService.getStats());
});

app.post('/api/database/backup', (_req, res) => {
  try {
    const backupPath = dbService.backup();
    res.json({ 
      success: true, 
      backupPath,
      message: 'Backup créé avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors du backup:', error as Error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la création du backup' 
    });
  }
});

// Routes pour les fichiers
app.use('/api/files', createFileRoutes(fileStorage));

// Route pour servir l'application client (doit être en dernier)
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Démarrage du serveur
const PORT = parseInt(process.env.PORT || defaultConfig.port.toString(), 10);
const HOST = process.env.HOST || defaultConfig.host;

// Send starting status to parent process
sendIPCMessage({ type: 'status', status: 'starting', port: PORT });

server.listen(PORT, HOST, () => {
  logger.info(`🚀 Serveur démarré sur http://${HOST}:${PORT}`);
  logger.info(`📁 Stockage: ${defaultConfig.storagePath}`);
  logger.info(`📊 Taille max fichier: ${Math.round(defaultConfig.maxFileSize / (1024 * 1024))}MB`);
  
  // Send running status to parent process
  sendIPCMessage({ type: 'status', status: 'running', port: PORT });
});

// Handle server startup errors
server.on('error', (error: NodeJS.ErrnoException) => {
  logger.error('❌ Erreur de démarrage du serveur:', error);
  
  let errorMessage = error.message;
  if (error.code === 'EADDRINUSE') {
    errorMessage = `Port ${PORT} is already in use`;
  } else if (error.code === 'EACCES') {
    errorMessage = `Permission denied for port ${PORT}`;
  }
  
  sendIPCMessage({ type: 'status', status: 'error', error: errorMessage });
  
  // Exit with error code if running as child process
  if (isChildProcess) {
    process.exit(1);
  }
});

/**
 * Graceful shutdown handler
 */
function gracefulShutdown(signal: string): void {
  logger.info(`🛑 ${signal} reçu, arrêt du serveur...`);
  sendIPCMessage({ type: 'status', status: 'stopping' });
  
  wsService.stopAutoSave();
  closeDatabaseService();
  
  server.close(() => {
    logger.info('✅ Serveur arrêté proprement');
    sendIPCMessage({ type: 'status', status: 'stopped' });
    process.exit(0);
  });
  
  // Force exit after timeout if graceful shutdown fails
  setTimeout(() => {
    logger.warn('⚠️ Arrêt forcé après timeout');
    process.exit(1);
  }, 5000);
}

// Gestion propre de l'arrêt
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// IPC message handling for extension communication
if (isChildProcess) {
  process.on('message', (message: IPCMessage) => {
    logger.info(`📨 IPC message reçu: ${message.type}`);
    
    switch (message.type) {
      case 'stop':
        gracefulShutdown('IPC stop command');
        break;
      case 'ping':
        sendIPCMessage({ type: 'status', status: 'running', port: PORT });
        break;
      case 'status':
        // Respond with current status
        const status = server.listening ? 'running' : 'stopped';
        sendIPCMessage({ type: 'status', status, port: PORT });
        break;
      default:
        logger.warn(`⚠️ Unknown IPC message type: ${message.type}`);
    }
  });
  
  // Handle parent process disconnect
  process.on('disconnect', () => {
    logger.info('🔌 Parent process disconnected, shutting down...');
    gracefulShutdown('Parent disconnect');
  });
}

export { app, server, wsService };