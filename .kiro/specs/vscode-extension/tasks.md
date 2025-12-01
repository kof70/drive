# Implementation Plan

- [x] 1. Setup extension project structure
  - Create `src/extension/` directory for extension code
  - Create `package.json` with VS Code extension manifest (commands, configuration, activation events)
  - Create `tsconfig.extension.json` for extension TypeScript compilation
  - Add esbuild configuration for bundling extension code
  - _Requirements: 7.1, 7.4_

- [x] 2. Implement Server Manager
  - [x] 2.1 Create `src/extension/serverManager.ts` with ServerManager class
    - Implement `start()` method using child_process.fork() to spawn server
    - Implement `stop()` method with graceful shutdown (SIGTERM then SIGKILL)
    - Implement `restart()` method combining stop and start
    - Implement `getStatus()` returning current server state
    - Add EventEmitter for status change notifications
    - _Requirements: 1.1, 1.3, 3.1, 3.2, 3.3, 3.4_

- [x] 3. Implement Network Discovery
  - [x] 3.1 Create `src/extension/networkDiscovery.ts`
    - Implement `getLocalIPs()` using os.networkInterfaces() to detect IPv4 addresses
    - Implement `generateQRCode()` using qrcode library to create data URL
    - Filter out internal/loopback addresses
    - _Requirements: 4.1, 4.3_

- [x] 4. Implement Configuration Manager
  - [x] 4.1 Create `src/extension/configManager.ts`
    - Read VS Code workspace configuration for localWorkspace settings
    - Implement `getConfig()` returning port, autoStart, storagePath
    - Add configuration change listener
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Implement Status Bar Provider
  - [x] 5.1 Create `src/extension/statusBarProvider.ts`
    - Create StatusBarItem with appropriate alignment and priority
    - Implement `update()` method to change text, icon, and tooltip based on status
    - Add click handler to show quick pick menu with actions
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6. Implement WebView Provider
  - [x] 6.1 Create `src/extension/webviewProvider.ts`
    - Implement `createOrShow()` to create or reveal WebView panel
    - Generate HTML content that loads the React app from bundled assets
    - Configure WebView options (enableScripts, localResourceRoots)
    - Handle WebView disposal and state preservation
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 7. Implement Commands Handler
  - [x] 7.1 Create `src/extension/commands.ts`
    - Register `localWorkspace.startServer` command
    - Register `localWorkspace.stopServer` command
    - Register `localWorkspace.restartServer` command
    - Register `localWorkspace.openCanvas` command (auto-start server if needed)
    - Register `localWorkspace.copyUrl` command using vscode.env.clipboard
    - Register `localWorkspace.showQRCode` command displaying QR in WebView
    - _Requirements: 1.1, 2.4, 3.4, 4.2, 4.3_

- [x] 8. Implement Extension Entry Point
  - [x] 8.1 Create `src/extension/extension.ts`
    - Implement `activate()` function initializing all providers
    - Register all commands and disposables
    - Check autoStart configuration and start server if enabled
    - Implement `deactivate()` function stopping server gracefully
    - _Requirements: 1.1, 1.2, 3.2_

- [x] 9. Adapt existing server for extension bundling
  - [x] 9.1 Modify server entry point for child process communication
    - Add IPC message handling for start/stop commands
    - Send status updates back to parent process
    - Ensure server can find bundled client assets
    - _Requirements: 7.2, 7.3_

- [x] 10. Setup build and packaging




  - [x] 10.1 Create build scripts


    - Add npm script to build extension with esbuild
    - Add npm script to copy server dist and client assets
    - Add npm script to package as .vsix using vsce
    - Update .vscodeignore to exclude source files
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 10.2 Write integration tests


    - Test extension activation
    - Test server start/stop commands
    - Test WebView creation
    - _Requirements: All_