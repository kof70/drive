/**
 * WebView Provider for VS Code Extension
 * 
 * Provides the WebView panel that displays the React collaborative canvas application.
 * Handles panel creation, HTML content generation, and state preservation.
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

import * as vscode from 'vscode';

/**
 * View type identifier for the canvas WebView
 */
const VIEW_TYPE = 'localWorkspace.canvas';

/**
 * WebView panel options
 */
interface WebViewOptions {
  extensionUri: vscode.Uri;
  serverPort: number;
}

/**
 * Manages the WebView panel for displaying the collaborative canvas
 */
export class CanvasWebviewProvider {
  private panel: vscode.WebviewPanel | undefined;
  private extensionUri: vscode.Uri;
  private serverPort: number;
  private disposables: vscode.Disposable[] = [];

  constructor(options: WebViewOptions) {
    this.extensionUri = options.extensionUri;
    this.serverPort = options.serverPort;
  }

  /**
   * Create or reveal the WebView panel
   * Requirement 2.1: Open WebView panel displaying the React application
   */
  createOrShow(): void {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If panel already exists, reveal it
    if (this.panel) {
      this.panel.reveal(column);
      return;
    }

    // Create new panel
    this.panel = vscode.window.createWebviewPanel(
      VIEW_TYPE,
      'Local Workspace Canvas',
      column || vscode.ViewColumn.One,
      this.getWebviewOptions()
    );

    // Set HTML content
    this.panel.webview.html = this.getHtmlContent(this.panel.webview);

    // Handle panel disposal
    // Requirement 2.3: Preserve panel state for restoration
    this.panel.onDidDispose(() => this.onPanelDisposed(), null, this.disposables);

    // Handle visibility changes
    this.panel.onDidChangeViewState(
      (e) => {
        if (e.webviewPanel.visible) {
          // Panel became visible, could refresh content if needed
          console.log('[WebviewProvider] Panel became visible');
        }
      },
      null,
      this.disposables
    );

    // Handle messages from the WebView
    this.panel.webview.onDidReceiveMessage(
      (message) => this.handleMessage(message),
      null,
      this.disposables
    );
  }


  /**
   * Update the server port and refresh content if panel is open
   */
  updateServerPort(port: number): void {
    this.serverPort = port;
    if (this.panel) {
      this.panel.webview.html = this.getHtmlContent(this.panel.webview);
    }
  }

  /**
   * Check if the panel is currently visible
   */
  isVisible(): boolean {
    return this.panel?.visible ?? false;
  }

  /**
   * Send a message to the WebView
   */
  postMessage(message: unknown): void {
    if (this.panel) {
      this.panel.webview.postMessage(message);
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.panel) {
      this.panel.dispose();
    }

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Handle panel disposal
   */
  private onPanelDisposed(): void {
    this.panel = undefined;

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Handle messages from the WebView
   */
  private handleMessage(message: { type: string; data?: unknown }): void {
    switch (message.type) {
      case 'ready':
        console.log('[WebviewProvider] WebView is ready');
        break;
      case 'error':
        console.error('[WebviewProvider] WebView error:', message.data);
        vscode.window.showErrorMessage(`Canvas error: ${message.data}`);
        break;
      default:
        console.log('[WebviewProvider] Unknown message:', message);
    }
  }

  /**
   * Get WebView options
   * Requirement 2.2: Configure WebView for WebSocket connectivity
   */
  private getWebviewOptions(): vscode.WebviewOptions & vscode.WebviewPanelOptions {
    return {
      // Enable JavaScript in the WebView
      enableScripts: true,
      
      // Retain context when hidden (Requirement 2.3: state preservation)
      retainContextWhenHidden: true,
      
      // Restrict the WebView to only load resources from specific locations
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, 'client'),
        vscode.Uri.joinPath(this.extensionUri, 'dist', 'client'),
      ],
    };
  }


  /**
   * Generate HTML content for the WebView
   * Loads the React app from bundled assets or connects to the dev server
   * Requirement 2.1: Display the React application
   * Requirement 2.2: Maintain WebSocket connectivity
   */
  private getHtmlContent(webview: vscode.Webview): string {
    // Server URL for WebSocket connection
    const serverUrl = `http://localhost:${this.serverPort}`;

    // Path to bundled client assets
    // In production, assets are in dist/client
    const distClientPath = vscode.Uri.joinPath(this.extensionUri, 'dist', 'client');
    
    // Get URIs for bundled assets
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(distClientPath, 'assets', 'index.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(distClientPath, 'assets', 'index.css')
    );

    // Use a nonce to only allow specific scripts to run
    const nonce = getNonce();

    // Content Security Policy
    // Allow connections to localhost for WebSocket
    const csp = [
      `default-src 'none'`,
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `script-src 'nonce-${nonce}'`,
      `font-src ${webview.cspSource}`,
      `img-src ${webview.cspSource} data: blob:`,
      `connect-src ${serverUrl} ws://localhost:${this.serverPort}`,
    ].join('; ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <title>Local Workspace Canvas</title>
  <link rel="stylesheet" href="${styleUri}">
  <style>
    html, body, #root {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--vscode-foreground, #333);
      background: var(--vscode-editor-background, #fff);
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--vscode-progressBar-background, #0066b8);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .loading-text {
      margin-top: 16px;
      font-size: 14px;
    }
    
    .error-container {
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--vscode-errorForeground, #f44336);
      background: var(--vscode-editor-background, #fff);
      padding: 20px;
      text-align: center;
    }
    
    .error-container.visible {
      display: flex;
    }
    
    .retry-button {
      margin-top: 16px;
      padding: 8px 16px;
      background: var(--vscode-button-background, #0066b8);
      color: var(--vscode-button-foreground, #fff);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .retry-button:hover {
      background: var(--vscode-button-hoverBackground, #0055a0);
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="loading-container" id="loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading canvas...</div>
    </div>
  </div>
  
  <div class="error-container" id="error">
    <h2>Failed to load canvas</h2>
    <p id="error-message">The server may not be running.</p>
    <button class="retry-button" onclick="retryLoad()">Retry</button>
  </div>
  
  <script nonce="${nonce}">
    // VS Code API for communication with extension
    const vscode = acquireVsCodeApi();
    
    // Server configuration
    window.__LOCAL_WORKSPACE_CONFIG__ = {
      serverUrl: '${serverUrl}',
      wsUrl: 'ws://localhost:${this.serverPort}',
      isVSCodeWebview: true
    };
    
    // Notify extension that WebView is ready
    vscode.postMessage({ type: 'ready' });
    
    // Error handling
    function showError(message) {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('error').classList.add('visible');
      document.getElementById('error-message').textContent = message;
      vscode.postMessage({ type: 'error', data: message });
    }
    
    function retryLoad() {
      document.getElementById('error').classList.remove('visible');
      document.getElementById('loading').style.display = 'flex';
      location.reload();
    }
    
    // Handle script load errors
    window.onerror = function(message, source, lineno, colno, error) {
      showError('Script error: ' + message);
      return true;
    };
  </script>
  
  <script nonce="${nonce}" src="${scriptUri}" type="module"></script>
</body>
</html>`;
  }
}


/**
 * Generate a nonce for Content Security Policy
 */
function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * Singleton instance for easy access
 */
let webviewProviderInstance: CanvasWebviewProvider | null = null;

/**
 * Get or create the CanvasWebviewProvider singleton
 * @param options WebView options (required on first call)
 * @returns CanvasWebviewProvider instance
 */
export function getWebviewProvider(options?: WebViewOptions): CanvasWebviewProvider {
  if (!webviewProviderInstance) {
    if (!options) {
      throw new Error('WebViewOptions required for first initialization');
    }
    webviewProviderInstance = new CanvasWebviewProvider(options);
  }
  return webviewProviderInstance;
}

/**
 * Dispose the CanvasWebviewProvider singleton
 */
export function disposeWebviewProvider(): void {
  if (webviewProviderInstance) {
    webviewProviderInstance.dispose();
    webviewProviderInstance = null;
  }
}
