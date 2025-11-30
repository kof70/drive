/**
 * Commands Handler for VS Code Extension
 * 
 * Registers and handles all extension commands for server control,
 * canvas display, URL sharing, and QR code generation.
 * 
 * Requirements: 1.1, 2.4, 3.4, 4.2, 4.3
 */

import * as vscode from 'vscode';
import { ServerManager, ServerStatus, ServerInfo } from './serverManager';
import { CanvasWebviewProvider } from './webviewProvider';
import { StatusBarProvider } from './statusBarProvider';
import { NetworkDiscovery } from './networkDiscovery';
import { ConfigManager } from './configManager';

/**
 * Dependencies required for command handlers
 */
export interface CommandDependencies {
  serverManager: ServerManager;
  webviewProvider: CanvasWebviewProvider;
  statusBarProvider: StatusBarProvider;
  networkDiscovery: NetworkDiscovery;
  configManager: ConfigManager;
  extensionUri: vscode.Uri;
}

/**
 * Register all extension commands
 * @param context Extension context for disposable registration
 * @param deps Command dependencies (managers and providers)
 * @returns Array of disposables for all registered commands
 */
export function registerCommands(
  context: vscode.ExtensionContext,
  deps: CommandDependencies
): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];

  // Register each command
  disposables.push(
    registerStartServerCommand(deps),
    registerStopServerCommand(deps),
    registerRestartServerCommand(deps),
    registerOpenCanvasCommand(deps),
    registerCopyUrlCommand(deps),
    registerShowQRCodeCommand(deps)
  );

  return disposables;
}


/**
 * Register the "Local Workspace: Start Server" command
 * Requirement 1.1: Start the Server_Process on the configured port
 */
function registerStartServerCommand(deps: CommandDependencies): vscode.Disposable {
  return vscode.commands.registerCommand('localWorkspace.startServer', async () => {
    const { serverManager, statusBarProvider } = deps;

    // Check if already running
    if (serverManager.isRunning()) {
      vscode.window.showInformationMessage('Server is already running');
      return;
    }

    try {
      statusBarProvider.update('starting');
      const serverInfo = await serverManager.start();
      statusBarProvider.update('running', serverInfo);

      // Show success notification with server URLs
      const networkUrl = serverInfo.networkUrls[0] || serverInfo.localUrl;
      const message = `Server started on port ${serverInfo.port}`;
      const action = await vscode.window.showInformationMessage(
        message,
        'Copy URL',
        'Open Canvas'
      );

      if (action === 'Copy URL') {
        await vscode.env.clipboard.writeText(networkUrl);
        vscode.window.showInformationMessage('URL copied to clipboard');
      } else if (action === 'Open Canvas') {
        await vscode.commands.executeCommand('localWorkspace.openCanvas');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      statusBarProvider.update('error');
      vscode.window.showErrorMessage(`Failed to start server: ${errorMessage}`);
    }
  });
}

/**
 * Register the "Local Workspace: Stop Server" command
 * Requirement 3.1: Gracefully terminate the Server_Process within 3 seconds
 */
function registerStopServerCommand(deps: CommandDependencies): vscode.Disposable {
  return vscode.commands.registerCommand('localWorkspace.stopServer', async () => {
    const { serverManager, statusBarProvider } = deps;

    // Check if already stopped
    if (!serverManager.isRunning()) {
      vscode.window.showInformationMessage('Server is not running');
      return;
    }

    try {
      statusBarProvider.update('stopping');
      await serverManager.stop();
      statusBarProvider.update('stopped');
      vscode.window.showInformationMessage('Server stopped');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      statusBarProvider.update('error');
      vscode.window.showErrorMessage(`Failed to stop server: ${errorMessage}`);
    }
  });
}

/**
 * Register the "Local Workspace: Restart Server" command
 * Requirement 3.4: Stop and restart the Server_Process
 */
function registerRestartServerCommand(deps: CommandDependencies): vscode.Disposable {
  return vscode.commands.registerCommand('localWorkspace.restartServer', async () => {
    const { serverManager, statusBarProvider } = deps;

    try {
      statusBarProvider.update('stopping');
      const serverInfo = await serverManager.restart();
      statusBarProvider.update('running', serverInfo);
      vscode.window.showInformationMessage(`Server restarted on port ${serverInfo.port}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      statusBarProvider.update('error');
      vscode.window.showErrorMessage(`Failed to restart server: ${errorMessage}`);
    }
  });
}


/**
 * Register the "Local Workspace: Open Canvas" command
 * Requirement 2.4: Auto-start server if not running before displaying WebView
 */
function registerOpenCanvasCommand(deps: CommandDependencies): vscode.Disposable {
  return vscode.commands.registerCommand('localWorkspace.openCanvas', async () => {
    const { serverManager, webviewProvider, statusBarProvider, configManager } = deps;

    try {
      // Auto-start server if not running (Requirement 2.4)
      if (!serverManager.isRunning()) {
        statusBarProvider.update('starting');
        const serverInfo = await serverManager.start();
        statusBarProvider.update('running', serverInfo);
        
        // Update webview provider with the correct port
        webviewProvider.updateServerPort(serverInfo.port);
      }

      // Open the canvas WebView
      webviewProvider.createOrShow();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      statusBarProvider.update('error');
      vscode.window.showErrorMessage(`Failed to open canvas: ${errorMessage}`);
    }
  });
}

/**
 * Register the "Local Workspace: Copy URL" command
 * Requirement 4.2: Copy the server URL to the clipboard
 */
function registerCopyUrlCommand(deps: CommandDependencies): vscode.Disposable {
  return vscode.commands.registerCommand('localWorkspace.copyUrl', async () => {
    const { serverManager, networkDiscovery, configManager } = deps;

    // Check if server is running
    if (!serverManager.isRunning()) {
      const action = await vscode.window.showWarningMessage(
        'Server is not running. Start it first?',
        'Start Server',
        'Cancel'
      );
      
      if (action === 'Start Server') {
        await vscode.commands.executeCommand('localWorkspace.startServer');
      }
      return;
    }

    const serverInfo = serverManager.getServerInfo();
    if (!serverInfo) {
      vscode.window.showErrorMessage('Could not get server information');
      return;
    }

    // Get available URLs
    const urls = [serverInfo.localUrl, ...serverInfo.networkUrls];
    
    if (urls.length === 1) {
      // Only localhost available, copy directly
      await vscode.env.clipboard.writeText(urls[0]);
      vscode.window.showInformationMessage(`URL copied: ${urls[0]}`);
    } else {
      // Multiple URLs available, let user choose
      const selected = await vscode.window.showQuickPick(
        urls.map(url => ({
          label: url,
          description: url === serverInfo.localUrl ? '(localhost)' : '(network)',
        })),
        {
          placeHolder: 'Select URL to copy',
          title: 'Copy Server URL',
        }
      );

      if (selected) {
        await vscode.env.clipboard.writeText(selected.label);
        vscode.window.showInformationMessage(`URL copied: ${selected.label}`);
      }
    }
  });
}


/**
 * Register the "Local Workspace: Show QR Code" command
 * Requirement 4.3: Display a QR code containing the server URL for mobile device access
 */
function registerShowQRCodeCommand(deps: CommandDependencies): vscode.Disposable {
  return vscode.commands.registerCommand('localWorkspace.showQRCode', async () => {
    const { serverManager, networkDiscovery, extensionUri } = deps;

    // Check if server is running
    if (!serverManager.isRunning()) {
      const action = await vscode.window.showWarningMessage(
        'Server is not running. Start it first?',
        'Start Server',
        'Cancel'
      );
      
      if (action === 'Start Server') {
        await vscode.commands.executeCommand('localWorkspace.startServer');
        // Wait a bit for server to start, then retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!serverManager.isRunning()) {
          return;
        }
      } else {
        return;
      }
    }

    const serverInfo = serverManager.getServerInfo();
    if (!serverInfo) {
      vscode.window.showErrorMessage('Could not get server information');
      return;
    }

    // Prefer network URL for QR code (more useful for mobile devices)
    const url = serverInfo.networkUrls[0] || serverInfo.localUrl;

    try {
      // Generate QR code
      const qrDataUrl = await networkDiscovery.generateQRCode(url);

      // Create WebView panel to display QR code
      const panel = vscode.window.createWebviewPanel(
        'localWorkspace.qrCode',
        'Local Workspace QR Code',
        vscode.ViewColumn.One,
        {
          enableScripts: false,
        }
      );

      panel.webview.html = getQRCodeHtml(url, qrDataUrl, serverInfo);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Failed to generate QR code: ${errorMessage}`);
    }
  });
}

/**
 * Generate HTML content for the QR code display panel
 */
function getQRCodeHtml(url: string, qrDataUrl: string, serverInfo: ServerInfo): string {
  const networkUrlsList = serverInfo.networkUrls
    .map(u => `<li><code>${u}</code></li>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Local Workspace QR Code</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
      background: var(--vscode-editor-background, #1e1e1e);
      color: var(--vscode-foreground, #cccccc);
    }
    
    .container {
      text-align: center;
      max-width: 400px;
    }
    
    h1 {
      font-size: 1.5em;
      margin-bottom: 8px;
      color: var(--vscode-foreground, #cccccc);
    }
    
    .subtitle {
      font-size: 0.9em;
      color: var(--vscode-descriptionForeground, #888888);
      margin-bottom: 24px;
    }
    
    .qr-container {
      background: white;
      padding: 16px;
      border-radius: 12px;
      display: inline-block;
      margin-bottom: 24px;
    }
    
    .qr-code {
      width: 256px;
      height: 256px;
    }
    
    .url-display {
      background: var(--vscode-textBlockQuote-background, #2d2d2d);
      padding: 12px 16px;
      border-radius: 6px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 14px;
      word-break: break-all;
      margin-bottom: 16px;
    }
    
    .network-urls {
      text-align: left;
      margin-top: 24px;
      padding: 16px;
      background: var(--vscode-textBlockQuote-background, #2d2d2d);
      border-radius: 6px;
    }
    
    .network-urls h3 {
      margin: 0 0 12px 0;
      font-size: 0.9em;
      color: var(--vscode-foreground, #cccccc);
    }
    
    .network-urls ul {
      margin: 0;
      padding-left: 20px;
    }
    
    .network-urls li {
      margin: 4px 0;
      font-size: 0.85em;
    }
    
    .network-urls code {
      background: var(--vscode-textCodeBlock-background, #1e1e1e);
      padding: 2px 6px;
      border-radius: 3px;
    }
    
    .instructions {
      font-size: 0.85em;
      color: var(--vscode-descriptionForeground, #888888);
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📱 Scan to Connect</h1>
    <p class="subtitle">Scan this QR code with your mobile device</p>
    
    <div class="qr-container">
      <img class="qr-code" src="${qrDataUrl}" alt="QR Code for ${url}">
    </div>
    
    <div class="url-display">${url}</div>
    
    ${serverInfo.networkUrls.length > 0 ? `
    <div class="network-urls">
      <h3>Available Network URLs:</h3>
      <ul>
        ${networkUrlsList}
      </ul>
    </div>
    ` : ''}
    
    <p class="instructions">
      Make sure your mobile device is connected to the same local network.
    </p>
  </div>
</body>
</html>`;
}
