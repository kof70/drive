/**
 * Server Manager for VS Code Extension
 * 
 * Manages the lifecycle of the Local Collaborative Workspace server process.
 * Handles start, stop, restart operations and emits status change events.
 * Uses IPC for communication with the server process.
 * 
 * Requirements: 1.1, 1.3, 3.1, 3.2, 3.3, 3.4
 */

import { ChildProcess, fork } from 'child_process';
import { EventEmitter } from 'events';
import * as path from 'path';
import * as os from 'os';

/**
 * Server status states
 */
export type ServerStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';

/**
 * IPC message from server process
 */
interface IPCStatusMessage {
  type: 'status';
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  port?: number;
  error?: string;
}

/**
 * IPC message to server process
 */
interface IPCCommand {
  type: 'start' | 'stop' | 'status' | 'ping';
  payload?: unknown;
}

/**
 * Server information when running
 */
export interface ServerInfo {
  port: number;
  localUrl: string;
  networkUrls: string[];
  pid: number;
}

/**
 * Server Manager events
 */
export interface ServerManagerEvents {
  'statusChange': (status: ServerStatus, info?: ServerInfo, error?: Error) => void;
}

/**
 * Configuration for the server manager
 */
export interface ServerManagerConfig {
  port: number;
  storagePath: string;
  extensionPath: string;
}

/**
 * Manages the server process lifecycle
 */
export class ServerManager extends EventEmitter {
  private serverProcess: ChildProcess | null = null;
  private status: ServerStatus = 'stopped';
  private serverInfo: ServerInfo | null = null;
  private config: ServerManagerConfig;
  private lastError: Error | null = null;

  // Timeouts for graceful shutdown
  private static readonly GRACEFUL_SHUTDOWN_TIMEOUT = 3000; // 3 seconds
  private static readonly FORCE_KILL_TIMEOUT = 1000; // 1 second after SIGTERM

  constructor(config: ServerManagerConfig) {
    super();
    this.config = config;
  }

  /**
   * Start the server process
   * @returns Promise resolving to ServerInfo on success
   */
  async start(): Promise<ServerInfo> {
    if (this.status === 'running') {
      if (this.serverInfo) {
        return this.serverInfo;
      }
      throw new Error('Server is already running');
    }

    if (this.status === 'starting') {
      throw new Error('Server is already starting');
    }

    this.setStatus('starting');

    return new Promise((resolve, reject) => {
      try {
        // Path to the compiled server entry point
        const serverPath = path.join(this.config.extensionPath, 'server', 'index.js');

        // Environment variables for the server
        const env = {
          ...process.env,
          PORT: this.config.port.toString(),
          HOST: '0.0.0.0', // Listen on all interfaces for network access
          STORAGE_PATH: this.config.storagePath || undefined,
          EXTENSION_MODE: 'true', // Signal to server that it's running in extension mode
        };

        // Fork the server process
        this.serverProcess = fork(serverPath, [], {
          env,
          stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
          cwd: path.join(this.config.extensionPath),
        });

        const startTimeout = setTimeout(() => {
          this.cleanup();
          const error = new Error('Server start timeout - server did not respond within 5 seconds');
          this.setStatus('error', undefined, error);
          reject(error);
        }, 5000);

        // Handle server stdout for logging
        this.serverProcess.stdout?.on('data', (data: Buffer) => {
          const message = data.toString();
          console.log('[Server]', message);
        });

        // Handle server stderr
        this.serverProcess.stderr?.on('data', (data: Buffer) => {
          console.error('[Server Error]', data.toString());
        });

        // Handle process errors
        this.serverProcess.on('error', (error) => {
          clearTimeout(startTimeout);
          this.cleanup();
          this.setStatus('error', undefined, error);
          reject(error);
        });

        // Handle process exit
        this.serverProcess.on('exit', (code, signal) => {
          clearTimeout(startTimeout);
          
          if (this.status === 'stopping') {
            // Expected shutdown
            this.cleanup();
            this.setStatus('stopped');
          } else if (this.status === 'running' || this.status === 'starting') {
            // Unexpected crash
            const error = new Error(`Server crashed unexpectedly (code: ${code}, signal: ${signal})`);
            this.cleanup();
            this.setStatus('error', undefined, error);
            
            if (this.status === 'starting') {
              reject(error);
            }
          }
        });

        // Handle IPC messages from server for status updates
        this.serverProcess.on('message', (message: IPCStatusMessage) => {
          console.log('[Server IPC]', message);
          
          if (message.type === 'status') {
            switch (message.status) {
              case 'running':
                clearTimeout(startTimeout);
                this.serverInfo = this.createServerInfo();
                this.setStatus('running', this.serverInfo);
                resolve(this.serverInfo);
                break;
              case 'error':
                clearTimeout(startTimeout);
                const error = new Error(message.error || 'Server error');
                this.cleanup();
                this.setStatus('error', undefined, error);
                reject(error);
                break;
              case 'stopping':
                // Server is shutting down
                break;
              case 'stopped':
                this.cleanup();
                this.setStatus('stopped');
                break;
            }
          }
        });

      } catch (error) {
        this.cleanup();
        const err = error instanceof Error ? error : new Error(String(error));
        this.setStatus('error', undefined, err);
        reject(err);
      }
    });
  }

  /**
   * Stop the server process gracefully
   * Uses IPC stop command first, then SIGTERM, then SIGKILL if needed
   */
  async stop(): Promise<void> {
    if (this.status === 'stopped') {
      return;
    }

    if (this.status === 'stopping') {
      // Wait for existing stop operation
      return new Promise((resolve) => {
        const checkStopped = () => {
          if (this.status === 'stopped') {
            resolve();
          } else {
            setTimeout(checkStopped, 100);
          }
        };
        checkStopped();
      });
    }

    if (!this.serverProcess) {
      this.setStatus('stopped');
      return;
    }

    this.setStatus('stopping');

    return new Promise((resolve) => {
      const forceKillTimeout = setTimeout(() => {
        // Force kill if graceful shutdown fails
        if (this.serverProcess && !this.serverProcess.killed) {
          console.log('[ServerManager] Force killing server process');
          this.serverProcess.kill('SIGKILL');
        }
      }, ServerManager.GRACEFUL_SHUTDOWN_TIMEOUT);

      const sigtermTimeout = setTimeout(() => {
        // Fall back to SIGTERM if IPC doesn't work
        if (this.serverProcess && !this.serverProcess.killed) {
          console.log('[ServerManager] IPC stop timeout, sending SIGTERM');
          this.serverProcess.kill('SIGTERM');
        }
      }, ServerManager.FORCE_KILL_TIMEOUT);

      const onExit = () => {
        clearTimeout(forceKillTimeout);
        clearTimeout(sigtermTimeout);
        this.cleanup();
        this.setStatus('stopped');
        resolve();
      };

      if (this.serverProcess) {
        this.serverProcess.once('exit', onExit);
        
        // Try IPC stop command first for graceful shutdown
        if (this.serverProcess.connected) {
          console.log('[ServerManager] Sending IPC stop command to server');
          this.sendIPCCommand({ type: 'stop' });
        } else {
          // Fall back to SIGTERM if IPC not available
          console.log('[ServerManager] IPC not available, sending SIGTERM');
          this.serverProcess.kill('SIGTERM');
        }
      } else {
        onExit();
      }
    });
  }

  /**
   * Send IPC command to server process
   */
  private sendIPCCommand(command: IPCCommand): boolean {
    if (this.serverProcess && this.serverProcess.connected) {
      this.serverProcess.send(command);
      return true;
    }
    return false;
  }

  /**
   * Restart the server (stop then start)
   */
  async restart(): Promise<ServerInfo> {
    await this.stop();
    return this.start();
  }

  /**
   * Get current server status
   */
  getStatus(): ServerStatus {
    return this.status;
  }

  /**
   * Get current server info (if running)
   */
  getServerInfo(): ServerInfo | null {
    return this.serverInfo;
  }

  /**
   * Get the last error that occurred
   */
  getLastError(): Error | null {
    return this.lastError;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ServerManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if server is running
   */
  isRunning(): boolean {
    return this.status === 'running';
  }

  /**
   * Dispose of resources
   */
  async dispose(): Promise<void> {
    await this.stop();
    this.removeAllListeners();
  }

  /**
   * Set status and emit event
   */
  private setStatus(status: ServerStatus, info?: ServerInfo, error?: Error): void {
    this.status = status;
    this.lastError = error || null;
    
    if (status !== 'running') {
      this.serverInfo = null;
    }
    
    this.emit('statusChange', status, info, error);
  }

  /**
   * Clean up server process references
   */
  private cleanup(): void {
    if (this.serverProcess) {
      this.serverProcess.removeAllListeners();
      this.serverProcess = null;
    }
    this.serverInfo = null;
  }

  /**
   * Create ServerInfo object with network URLs
   */
  private createServerInfo(): ServerInfo {
    const networkUrls = this.getNetworkUrls();
    
    return {
      port: this.config.port,
      localUrl: `http://localhost:${this.config.port}`,
      networkUrls,
      pid: this.serverProcess?.pid || 0,
    };
  }

  /**
   * Get all available network URLs
   */
  private getNetworkUrls(): string[] {
    const urls: string[] = [];
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
      const netInterface = interfaces[name];
      if (!netInterface) continue;

      for (const net of netInterface) {
        // Skip internal (loopback) and non-IPv4 addresses
        if (net.internal || net.family !== 'IPv4') continue;
        
        urls.push(`http://${net.address}:${this.config.port}`);
      }
    }

    // Sort URLs to prioritize 192.168.x.x addresses (home/office networks)
    return urls.sort((a, b) => {
      const aIs192 = a.includes('192.168.');
      const bIs192 = b.includes('192.168.');
      
      if (aIs192 && !bIs192) return -1;
      if (!aIs192 && bIs192) return 1;
      
      // Also prioritize 10.x.x.x (private networks)
      const aIs10 = a.includes('://10.');
      const bIs10 = b.includes('://10.');
      
      if (aIs10 && !bIs10) return -1;
      if (!aIs10 && bIs10) return 1;
      
      return 0;
    });
  }
}
