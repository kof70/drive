/**
 * Status Bar Provider for VS Code Extension
 * 
 * Manages the status bar item that displays server status and provides
 * quick access to common actions via a click menu.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import * as vscode from 'vscode';
import { ServerStatus, ServerInfo } from './serverManager';

/**
 * Status bar icons using VS Code codicons
 */
const StatusIcons = {
  stopped: '$(debug-stop)',
  starting: '$(sync~spin)',
  running: '$(broadcast)',
  stopping: '$(sync~spin)',
  error: '$(error)',
} as const;

/**
 * Quick pick action items
 */
interface QuickPickAction {
  label: string;
  description?: string;
  command: string;
}

/**
 * Manages the VS Code status bar item for server status display
 */
export class StatusBarProvider {
  private statusBarItem: vscode.StatusBarItem;
  private currentStatus: ServerStatus = 'stopped';
  private currentInfo: ServerInfo | null = null;
  private connectedUsers: number = 0;

  constructor() {
    // Create status bar item with left alignment and high priority
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    
    // Set command to show quick pick menu on click (Requirement 6.3)
    this.statusBarItem.command = 'localWorkspace.showStatusMenu';
    
    // Initialize with stopped state
    this.update('stopped');
    this.statusBarItem.show();
  }

  /**
   * Update the status bar display based on server status
   * @param status Current server status
   * @param info Server info (when running)
   */
  update(status: ServerStatus, info?: ServerInfo): void {
    this.currentStatus = status;
    this.currentInfo = info || null;

    const icon = StatusIcons[status];
    
    switch (status) {
      case 'stopped':
        // Requirement 6.1: Display "Local Workspace: Stopped" with play icon
        this.statusBarItem.text = `$(play) Local Workspace: Stopped`;
        this.statusBarItem.tooltip = 'Click to start server';
        this.statusBarItem.backgroundColor = undefined;
        break;

      case 'starting':
        // Requirement 6.4: Display "Local Workspace: Starting..." with loading indicator
        this.statusBarItem.text = `${icon} Local Workspace: Starting...`;
        this.statusBarItem.tooltip = 'Server is starting...';
        this.statusBarItem.backgroundColor = undefined;
        break;

      case 'running':
        // Requirement 6.2: Display "Local Workspace: Running (port)" with user count
        const port = info?.port || 'unknown';
        const userText = this.connectedUsers > 0 ? ` • ${this.connectedUsers} user${this.connectedUsers > 1 ? 's' : ''}` : '';
        this.statusBarItem.text = `${icon} Local Workspace: Running (:${port})${userText}`;
        this.statusBarItem.tooltip = this.buildRunningTooltip(info);
        this.statusBarItem.backgroundColor = undefined;
        break;

      case 'stopping':
        this.statusBarItem.text = `${icon} Local Workspace: Stopping...`;
        this.statusBarItem.tooltip = 'Server is stopping...';
        this.statusBarItem.backgroundColor = undefined;
        break;

      case 'error':
        this.statusBarItem.text = `${icon} Local Workspace: Error`;
        this.statusBarItem.tooltip = 'Server error - click for options';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        break;
    }
  }

  /**
   * Update the connected user count
   * @param count Number of connected users
   */
  updateUserCount(count: number): void {
    this.connectedUsers = count;
    // Refresh display if running
    if (this.currentStatus === 'running') {
      this.update('running', this.currentInfo || undefined);
    }
  }

  /**
   * Show quick pick menu with available actions (Requirement 6.3)
   */
  async showQuickPick(): Promise<void> {
    const actions = this.getAvailableActions();
    
    const selected = await vscode.window.showQuickPick(actions, {
      placeHolder: 'Select an action',
      title: 'Local Workspace Actions',
    });

    if (selected) {
      await vscode.commands.executeCommand(selected.command);
    }
  }

  /**
   * Get current status
   */
  getStatus(): ServerStatus {
    return this.currentStatus;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.statusBarItem.dispose();
  }

  /**
   * Build tooltip text for running state
   */
  private buildRunningTooltip(info?: ServerInfo): string {
    if (!info) {
      return 'Server is running - click for options';
    }

    const lines = [
      'Local Workspace Server Running',
      '',
      `Local: ${info.localUrl}`,
    ];

    if (info.networkUrls.length > 0) {
      lines.push('');
      lines.push('Network URLs:');
      info.networkUrls.forEach(url => lines.push(`  ${url}`));
    }

    if (this.connectedUsers > 0) {
      lines.push('');
      lines.push(`Connected users: ${this.connectedUsers}`);
    }

    lines.push('');
    lines.push('Click for more options');

    return lines.join('\n');
  }

  /**
   * Get available actions based on current status
   */
  private getAvailableActions(): QuickPickAction[] {
    const actions: QuickPickAction[] = [];

    switch (this.currentStatus) {
      case 'stopped':
      case 'error':
        actions.push({
          label: '$(play) Start Server',
          description: 'Start the collaboration server',
          command: 'localWorkspace.startServer',
        });
        break;

      case 'running':
        actions.push({
          label: '$(browser) Open Canvas',
          description: 'Open the collaborative canvas',
          command: 'localWorkspace.openCanvas',
        });
        actions.push({
          label: '$(clippy) Copy URL',
          description: 'Copy server URL to clipboard',
          command: 'localWorkspace.copyUrl',
        });
        actions.push({
          label: '$(device-mobile) Show QR Code',
          description: 'Display QR code for mobile access',
          command: 'localWorkspace.showQRCode',
        });
        actions.push({
          label: '$(debug-restart) Restart Server',
          description: 'Restart the server',
          command: 'localWorkspace.restartServer',
        });
        actions.push({
          label: '$(debug-stop) Stop Server',
          description: 'Stop the server',
          command: 'localWorkspace.stopServer',
        });
        break;

      case 'starting':
      case 'stopping':
        // No actions available during transitions
        actions.push({
          label: '$(sync~spin) Please wait...',
          description: 'Operation in progress',
          command: '',
        });
        break;
    }

    return actions;
  }
}

/**
 * Register the status menu command
 * @param context Extension context
 * @param provider StatusBarProvider instance
 * @returns Disposable for the command
 */
export function registerStatusMenuCommand(
  context: vscode.ExtensionContext,
  provider: StatusBarProvider
): vscode.Disposable {
  return vscode.commands.registerCommand('localWorkspace.showStatusMenu', () => {
    provider.showQuickPick();
  });
}
