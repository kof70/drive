/**
 * Configuration Manager for VS Code Extension
 * 
 * Manages VS Code workspace configuration for localWorkspace settings.
 * Provides getConfig() method and configuration change events.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import * as vscode from 'vscode';
import { EventEmitter } from 'events';

/**
 * Extension configuration interface
 */
export interface ExtensionConfig {
  /** Server port (default: 8080) - Requirement 5.1 */
  port: number;
  /** Auto-start server on VS Code launch (default: false) - Requirement 5.2 */
  autoStart: boolean;
  /** Storage directory path (empty = workspace folder) - Requirement 5.3 */
  storagePath: string;
}

/**
 * Configuration Manager events
 */
export interface ConfigManagerEvents {
  'configChange': (config: ExtensionConfig, changedKeys: string[]) => void;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: ExtensionConfig = {
  port: 8080,
  autoStart: false,
  storagePath: '',
};

/**
 * Configuration section name in VS Code settings
 */
const CONFIG_SECTION = 'localWorkspace';

/**
 * Manages extension configuration from VS Code workspace settings
 */
export class ConfigManager extends EventEmitter {
  private config: ExtensionConfig;
  private disposable: vscode.Disposable | null = null;

  constructor() {
    super();
    this.config = this.readConfig();
    this.setupChangeListener();
  }

  /**
   * Get current configuration
   * @returns Current extension configuration
   */
  getConfig(): ExtensionConfig {
    return { ...this.config };
  }

  /**
   * Get a specific configuration value
   * @param key Configuration key
   * @returns Configuration value
   */
  get<K extends keyof ExtensionConfig>(key: K): ExtensionConfig[K] {
    return this.config[key];
  }

  /**
   * Refresh configuration from VS Code settings
   * Useful when you need to ensure you have the latest values
   */
  refresh(): ExtensionConfig {
    const oldConfig = this.config;
    this.config = this.readConfig();
    
    // Check for changes and emit if needed
    const changedKeys = this.getChangedKeys(oldConfig, this.config);
    if (changedKeys.length > 0) {
      this.emit('configChange', this.config, changedKeys);
    }
    
    return { ...this.config };
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.disposable) {
      this.disposable.dispose();
      this.disposable = null;
    }
    this.removeAllListeners();
  }

  /**
   * Read configuration from VS Code workspace settings
   */
  private readConfig(): ExtensionConfig {
    const vsConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);

    return {
      port: vsConfig.get<number>('port', DEFAULT_CONFIG.port),
      autoStart: vsConfig.get<boolean>('autoStart', DEFAULT_CONFIG.autoStart),
      storagePath: vsConfig.get<string>('storagePath', DEFAULT_CONFIG.storagePath),
    };
  }

  /**
   * Setup listener for configuration changes
   * Requirement 5.4: Apply changes on next server restart
   */
  private setupChangeListener(): void {
    this.disposable = vscode.workspace.onDidChangeConfiguration((event) => {
      // Check if our configuration section was affected
      if (event.affectsConfiguration(CONFIG_SECTION)) {
        const oldConfig = this.config;
        this.config = this.readConfig();
        
        const changedKeys = this.getChangedKeys(oldConfig, this.config);
        if (changedKeys.length > 0) {
          console.log('[ConfigManager] Configuration changed:', changedKeys);
          this.emit('configChange', this.config, changedKeys);
        }
      }
    });
  }

  /**
   * Get list of keys that changed between two configs
   */
  private getChangedKeys(oldConfig: ExtensionConfig, newConfig: ExtensionConfig): string[] {
    const changedKeys: string[] = [];
    
    for (const key of Object.keys(oldConfig) as (keyof ExtensionConfig)[]) {
      if (oldConfig[key] !== newConfig[key]) {
        changedKeys.push(key);
      }
    }
    
    return changedKeys;
  }
}

/**
 * Singleton instance for easy access
 */
let configManagerInstance: ConfigManager | null = null;

/**
 * Get or create the ConfigManager singleton
 * @returns ConfigManager instance
 */
export function getConfigManager(): ConfigManager {
  if (!configManagerInstance) {
    configManagerInstance = new ConfigManager();
  }
  return configManagerInstance;
}

/**
 * Dispose the ConfigManager singleton
 */
export function disposeConfigManager(): void {
  if (configManagerInstance) {
    configManagerInstance.dispose();
    configManagerInstance = null;
  }
}
