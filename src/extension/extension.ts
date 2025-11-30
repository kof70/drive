/**
 * VS Code Extension Entry Point
 * 
 * Initializes all providers, registers commands, and manages the extension lifecycle.
 * Handles auto-start configuration and graceful shutdown.
 * 
 * Requirements: 1.1, 1.2, 3.2
 */

import * as vscode from 'vscode';
import { ServerManager, ServerStatus, ServerInfo } from './serverManager';
import { ConfigManager, disposeConfigManager } from './configManager';
import { StatusBarProvider, registerStatusMenuCommand } from './statusBarProvider';
import { CanvasWebviewProvider, disposeWebviewProvider } from './webviewProvider';
import { NetworkDiscovery } from './networkDiscovery';
import { registerCommands, CommandDependencies } from './commands';

/**
 * Global references for cleanup during deactivation
 */
let serverManager: ServerManager | null = null;
let configManager: ConfigManager | null = null;
let statusBarProvider: StatusBarProvider | null = null;
let webviewProvider: CanvasWebviewProvider | null = null;
let networkDiscovery: NetworkDiscovery | null = null;

/**
 * Called when the extension is activated
 * Requirement 1.1: Start server when command is executed
 * Requirement 1.2: Display notification with server URL on successful start
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('[Extension] Local Collaborative Workspace extension is activating');

  try {
    // Initialize ConfigManager first to get settings
    configManager = new ConfigManager();
    const config = configManager.getConfig();

    // Initialize ServerManager with configuration
    serverManager = new ServerManager({
      port: config.port,
      storagePath: config.storagePath || getDefaultStoragePath(context),
      extensionPath: context.extensionPath,
    });

    // Initialize StatusBarProvider
    statusBarProvider = new StatusBarProvider();

    // Initialize NetworkDiscovery
    networkDiscovery = new NetworkDiscovery();

    // Initialize WebviewProvider
    webviewProvider = new CanvasWebviewProvider({
      extensionUri: context.extensionUri,
      serverPort: config.port,
    });

    // Setup server status change listener
    setupServerStatusListener(serverManager, statusBarProvider);

    // Setup configuration change listener
    setupConfigChangeListener(configManager, serverManager, webviewProvider);

    // Register status menu command
    const statusMenuDisposable = registerStatusMenuCommand(context, statusBarProvider);
    context.subscriptions.push(statusMenuDisposable);

    // Register all commands
    const commandDeps: CommandDependencies = {
      serverManager,
      webviewProvider,
      statusBarProvider,
      networkDiscovery,
      configManager,
      extensionUri: context.extensionUri,
    };
    const commandDisposables = registerCommands(context, commandDeps);
    context.subscriptions.push(...commandDisposables);

    // Register disposables for cleanup
    context.subscriptions.push({
      dispose: () => {
        disposeAll();
      },
    });

    // Check autoStart configuration and start server if enabled
    // Requirement 5.2: Auto-start server on VS Code launch
    if (config.autoStart) {
      console.log('[Extension] Auto-starting server (autoStart is enabled)');
      startServerOnActivation(serverManager, statusBarProvider);
    }

    console.log('[Extension] Local Collaborative Workspace extension activated successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Extension] Failed to activate extension:', errorMessage);
    vscode.window.showErrorMessage(`Failed to activate Local Workspace extension: ${errorMessage}`);
  }
}

/**
 * Called when the extension is deactivated
 * Requirement 3.2: Automatically stop the Server_Process when VS Code is closed
 */
export async function deactivate(): Promise<void> {
  console.log('[Extension] Local Collaborative Workspace extension is deactivating');

  try {
    // Stop server gracefully if running
    if (serverManager && serverManager.isRunning()) {
      console.log('[Extension] Stopping server gracefully...');
      await serverManager.stop();
      console.log('[Extension] Server stopped');
    }

    // Dispose all resources
    disposeAll();

    console.log('[Extension] Extension deactivated successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Extension] Error during deactivation:', errorMessage);
  }
}

/**
 * Setup listener for server status changes
 */
function setupServerStatusListener(
  server: ServerManager,
  statusBar: StatusBarProvider
): void {
  server.on('statusChange', (status: ServerStatus, info?: ServerInfo, error?: Error) => {
    console.log(`[Extension] Server status changed: ${status}`);
    
    // Update status bar
    statusBar.update(status, info);

    // Show notification for errors (Requirement 1.3, 3.3)
    if (status === 'error' && error) {
      vscode.window.showErrorMessage(`Server error: ${error.message}`, 'Restart').then((action) => {
        if (action === 'Restart') {
          vscode.commands.executeCommand('localWorkspace.restartServer');
        }
      });
    }
  });
}

/**
 * Setup listener for configuration changes
 * Requirement 5.4: Apply changes on next server restart
 */
function setupConfigChangeListener(
  config: ConfigManager,
  server: ServerManager,
  webview: CanvasWebviewProvider
): void {
  config.on('configChange', (newConfig, changedKeys) => {
    console.log('[Extension] Configuration changed:', changedKeys);

    // Update server manager config
    server.updateConfig({
      port: newConfig.port,
      storagePath: newConfig.storagePath,
    });

    // Update webview provider port
    webview.updateServerPort(newConfig.port);

    // Notify user that changes will apply on restart
    if (server.isRunning() && (changedKeys.includes('port') || changedKeys.includes('storagePath'))) {
      vscode.window.showInformationMessage(
        'Configuration changed. Restart the server to apply changes.',
        'Restart Now'
      ).then((action) => {
        if (action === 'Restart Now') {
          vscode.commands.executeCommand('localWorkspace.restartServer');
        }
      });
    }
  });
}

/**
 * Start server during extension activation (for autoStart)
 */
async function startServerOnActivation(
  server: ServerManager,
  statusBar: StatusBarProvider
): Promise<void> {
  try {
    statusBar.update('starting');
    const serverInfo = await server.start();
    statusBar.update('running', serverInfo);

    // Show notification with server URL (Requirement 1.2)
    const networkUrl = serverInfo.networkUrls[0] || serverInfo.localUrl;
    vscode.window.showInformationMessage(
      `Local Workspace server started on ${networkUrl}`,
      'Open Canvas',
      'Copy URL'
    ).then((action) => {
      if (action === 'Open Canvas') {
        vscode.commands.executeCommand('localWorkspace.openCanvas');
      } else if (action === 'Copy URL') {
        vscode.env.clipboard.writeText(networkUrl);
        vscode.window.showInformationMessage('URL copied to clipboard');
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    statusBar.update('error');
    vscode.window.showErrorMessage(`Failed to auto-start server: ${errorMessage}`);
  }
}

/**
 * Get default storage path based on workspace or extension storage
 */
function getDefaultStoragePath(context: vscode.ExtensionContext): string {
  // Prefer workspace folder if available
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0].uri.fsPath;
  }

  // Fall back to extension storage path
  return context.globalStorageUri.fsPath;
}

/**
 * Dispose all resources
 */
function disposeAll(): void {
  if (serverManager) {
    serverManager.dispose();
    serverManager = null;
  }

  if (statusBarProvider) {
    statusBarProvider.dispose();
    statusBarProvider = null;
  }

  if (webviewProvider) {
    disposeWebviewProvider();
    webviewProvider = null;
  }

  if (configManager) {
    disposeConfigManager();
    configManager = null;
  }

  networkDiscovery = null;
}
