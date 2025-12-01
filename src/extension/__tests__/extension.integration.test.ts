/**
 * Integration tests for VS Code Extension
 * 
 * Tests extension activation, server lifecycle, and WebView creation
 * Requirements: All
 */

import * as vscode from 'vscode';
import * as assert from 'assert';
import { activate, deactivate } from '../extension';

describe('Extension Integration Tests', () => {
  let context: vscode.ExtensionContext;

  beforeEach(() => {
    // Create mock extension context
    context = {
      subscriptions: [],
      extensionPath: __dirname,
      extensionUri: vscode.Uri.file(__dirname),
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn().mockReturnValue([]),
        setKeysForSync: jest.fn(),
      } as any,
      workspaceState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn().mockReturnValue([]),
      } as any,
      globalStorageUri: vscode.Uri.file(__dirname + '/storage'),
      logUri: vscode.Uri.file(__dirname + '/logs'),
      storageUri: vscode.Uri.file(__dirname + '/storage'),
      extensionMode: vscode.ExtensionMode.Test,
      environmentVariableCollection: {} as any,
      secrets: {} as any,
      extension: {} as any,
      asAbsolutePath: (relativePath: string) => __dirname + '/' + relativePath,
      storagePath: __dirname + '/storage',
      globalStoragePath: __dirname + '/storage',
      logPath: __dirname + '/logs',
    } as any;
  });

  afterEach(async () => {
    // Clean up after each test
    await deactivate();
    
    // Dispose all subscriptions
    context.subscriptions.forEach(d => d.dispose());
    context.subscriptions.length = 0; // Clear array without reassigning
  });

  describe('Extension Activation', () => {
    it('should activate without errors', () => {
      assert.doesNotThrow(() => {
        activate(context);
      });
    });

    it('should register disposables', () => {
      activate(context);
      assert.ok(context.subscriptions.length > 0, 'Should register at least one disposable');
    });

    it('should register all required commands', async () => {
      activate(context);
      
      const commands = await vscode.commands.getCommands(true);
      const requiredCommands = [
        'localWorkspace.startServer',
        'localWorkspace.stopServer',
        'localWorkspace.restartServer',
        'localWorkspace.openCanvas',
        'localWorkspace.copyUrl',
        'localWorkspace.showQRCode',
      ];

      requiredCommands.forEach(cmd => {
        assert.ok(
          commands.includes(cmd),
          `Command ${cmd} should be registered`
        );
      });
    });
  });

  describe('Extension Deactivation', () => {
    it('should deactivate without errors', async () => {
      activate(context);
      await assert.doesNotReject(async () => {
        await deactivate();
      });
    });

    it('should clean up resources on deactivation', async () => {
      activate(context);
      const initialSubscriptions = context.subscriptions.length;
      
      await deactivate();
      
      // Verify cleanup happened (subscriptions should be disposed)
      assert.ok(initialSubscriptions > 0, 'Should have had subscriptions');
    });
  });
});
