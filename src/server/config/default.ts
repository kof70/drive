import { ServerConfig } from '../../shared/types';
import path from 'path';

export const defaultConfig: ServerConfig = {
  port: 8080,
  host: '0.0.0.0',
  storagePath: path.join(process.cwd(), 'workspace-data'),
  maxFileSize: 1024 * 1024 * 1024, // 1GB
  enableMDNS: true,
};

export const canvasConfig = {
  maxElements: 1000,
  autoSave: true,
  saveInterval: 30000, // 30 secondes
};

export const syncConfig = {
  clipboardEnabled: true,
  clipboardHistorySize: 10,
  maxLatency: 100, // ms
};