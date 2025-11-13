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
app.use(express.static(path.join(__dirname, '../client')));

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
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Démarrage du serveur
const PORT = parseInt(process.env.PORT || defaultConfig.port.toString(), 10);
const HOST = process.env.HOST || defaultConfig.host;

server.listen(PORT, HOST, () => {
  logger.info(`🚀 Serveur démarré sur http://${HOST}:${PORT}`);
  logger.info(`📁 Stockage: ${defaultConfig.storagePath}`);
  logger.info(`📊 Taille max fichier: ${Math.round(defaultConfig.maxFileSize / (1024 * 1024))}MB`);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  logger.info('🛑 Arrêt du serveur...');
  wsService.stopAutoSave();
  closeDatabaseService();
  server.close(() => {
    logger.info('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('🛑 Interruption reçue, arrêt du serveur...');
  wsService.stopAutoSave();
  closeDatabaseService();
  server.close(() => {
    logger.info('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

export { app, server, wsService };