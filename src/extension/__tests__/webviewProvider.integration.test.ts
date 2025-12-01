/**
 * Integration tests for WebView Provider
 * 
 * Tests WebView creation and management
 * Requirements: 2.1, 2.2, 2.3
 */

import * as vscode from 'vscode';
import { CanvasWebviewProvider } from '../webviewProvider';

describe('WebView Provider Integration Tests', () => {
  let webviewProvider: CanvasWebviewProvider;
  const testExtensionUri = vscode.Uri.file(__dirname);
  const testPort = 8080;

  beforeEach(() => {
    webviewProvider = new CanvasWebviewProvider({
      extensionUri: testExtensionUri,
      serverPort: testPort,
    });
  });

  afterEach(() => {
    webviewProvider.dispose();
  });

  describe('WebView Creation', () => {
    it('should create webview provider without errors', () => {
      expect(webviewProvider).toBeDefined();
    });

    it('should not be visible initially', () => {
      expect(webviewProvider.isVisible()).toBe(false);
    });

    it('should update server port', () => {
      const newPort = 9090;
      expect(() => {
        webviewProvider.updateServerPort(newPort);
      }).not.toThrow();
    });
  });

  describe('WebView Messaging', () => {
    it('should post messages without errors when panel not created', () => {
      expect(() => {
        webviewProvider.postMessage({ type: 'test', data: 'hello' });
      }).not.toThrow();
    });
  });

  describe('WebView Disposal', () => {
    it('should dispose without errors', () => {
      expect(() => {
        webviewProvider.dispose();
      }).not.toThrow();
    });

    it('should handle multiple dispose calls', () => {
      webviewProvider.dispose();
      expect(() => {
        webviewProvider.dispose();
      }).not.toThrow();
    });
  });
});
