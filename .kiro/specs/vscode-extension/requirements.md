# Requirements Document

## Introduction

Cette spécification définit les exigences pour transformer l'application Local Collaborative Workspace en une extension VS Code. L'extension permettra de démarrer automatiquement le serveur de collaboration et d'afficher l'interface canvas dans un WebView panel, tout en permettant aux autres appareils du réseau local d'accéder à l'application via leur navigateur.

## Glossary

- **Extension**: Module VS Code qui étend les fonctionnalités de l'éditeur
- **WebView**: Panneau VS Code qui affiche du contenu HTML/CSS/JS personnalisé
- **Server_Process**: Processus Node.js exécutant le serveur Express/Socket.io en arrière-plan
- **Status_Bar**: Barre d'état en bas de VS Code affichant des informations
- **Command_Palette**: Interface VS Code pour exécuter des commandes (Ctrl+Shift+P)
- **Local_Network**: Réseau local (LAN) sur lequel les appareils peuvent communiquer

## Requirements

### Requirement 1: Activation de l'extension

**User Story:** As a developer, I want the extension to activate when I open VS Code, so that I can quickly start collaborating.

#### Acceptance Criteria

1. WHEN the user executes the "Local Workspace: Start Server" command, THE Extension SHALL start the Server_Process on the configured port within 5 seconds.
2. WHEN the Server_Process starts successfully, THE Extension SHALL display a notification with the server URL and local network IP address.
3. WHEN the Server_Process fails to start, THE Extension SHALL display an error notification with the failure reason.
4. WHILE the Server_Process is running, THE Extension SHALL display a status indicator in the Status_Bar showing "Local Workspace: Running".

### Requirement 2: WebView Panel Integration

**User Story:** As a developer, I want to view the collaborative canvas directly in VS Code, so that I don't need to switch to a browser.

#### Acceptance Criteria

1. WHEN the user executes the "Local Workspace: Open Canvas" command, THE Extension SHALL open a WebView panel displaying the React application.
2. WHILE the WebView panel is open, THE Extension SHALL maintain WebSocket connectivity with the Server_Process.
3. WHEN the WebView panel is closed, THE Extension SHALL preserve the panel state for restoration.
4. IF the Server_Process is not running when opening the canvas, THEN THE Extension SHALL automatically start the Server_Process before displaying the WebView.

### Requirement 3: Server Lifecycle Management

**User Story:** As a developer, I want to control the server lifecycle, so that I can manage system resources.

#### Acceptance Criteria

1. WHEN the user executes the "Local Workspace: Stop Server" command, THE Extension SHALL gracefully terminate the Server_Process within 3 seconds.
2. WHEN VS Code is closed, THE Extension SHALL automatically stop the Server_Process.
3. WHEN the Server_Process crashes unexpectedly, THE Extension SHALL display an error notification and update the Status_Bar.
4. WHEN the user executes the "Local Workspace: Restart Server" command, THE Extension SHALL stop and restart the Server_Process.

### Requirement 4: Network Discovery and Access

**User Story:** As a developer, I want to share the workspace URL with colleagues on my local network, so that they can join the collaboration.

#### Acceptance Criteria

1. WHEN the Server_Process is running, THE Extension SHALL detect and display all available local network IP addresses.
2. WHEN the user executes the "Local Workspace: Copy URL" command, THE Extension SHALL copy the server URL to the clipboard.
3. WHEN the user executes the "Local Workspace: Show QR Code" command, THE Extension SHALL display a QR code containing the server URL for mobile device access.
4. WHILE the Server_Process is running, THE Extension SHALL allow connections from any device on the Local_Network.

### Requirement 5: Configuration Settings

**User Story:** As a developer, I want to configure the extension settings, so that I can customize the behavior to my needs.

#### Acceptance Criteria

1. THE Extension SHALL provide a configuration setting for the server port with a default value of 8080.
2. THE Extension SHALL provide a configuration setting for auto-start server on VS Code launch with a default value of false.
3. THE Extension SHALL provide a configuration setting for the storage directory path.
4. WHEN configuration settings are changed, THE Extension SHALL apply changes on the next server restart.

### Requirement 6: Status Bar Integration

**User Story:** As a developer, I want to see the server status at a glance, so that I know if collaboration is available.

#### Acceptance Criteria

1. WHILE the Server_Process is stopped, THE Extension SHALL display "Local Workspace: Stopped" in the Status_Bar with a play icon.
2. WHILE the Server_Process is running, THE Extension SHALL display "Local Workspace: Running (port)" in the Status_Bar with connected user count.
3. WHEN the user clicks the Status_Bar item, THE Extension SHALL show a quick pick menu with available actions.
4. WHILE the Server_Process is starting, THE Extension SHALL display "Local Workspace: Starting..." with a loading indicator.

### Requirement 7: Extension Packaging

**User Story:** As a developer, I want to install the extension easily, so that I can start using it without complex setup.

#### Acceptance Criteria

1. THE Extension SHALL be packaged as a single .vsix file containing all dependencies.
2. THE Extension SHALL include the pre-built React client assets.
3. THE Extension SHALL include the compiled server code.
4. THE Extension SHALL work on Windows, macOS, and Linux platforms.
