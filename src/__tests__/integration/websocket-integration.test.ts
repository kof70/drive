/**
 * Tests d'intégration WebSocket
 * Ces tests vérifient la communication complète entre client et serveur
 */

import { Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import { WebSocketService } from '../../server/services/websocket';
import { WebSocketManager } from '../../client/services/websocket-manager';
import { getDatabaseService, closeDatabaseService } from '../../server/services/database';
import { CanvasElement, ClipboardData, CursorPosition } from '../../shared/types';

describe('WebSocket Integration Tests', () => {
  let httpServer: HttpServer;
  let wsService: WebSocketService;
  let clientManager: WebSocketManager;
  let serverPort: number;

  beforeAll((done) => {
    // Créer un serveur HTTP pour les tests
    httpServer = new HttpServer();
    const dbService = getDatabaseService(':memory:'); // Base de données en mémoire pour les tests
    wsService = new WebSocketService(httpServer, dbService);
    
    httpServer.listen(0, () => {
      const address = httpServer.address() as AddressInfo;
      serverPort = address.port;
      done();
    });
  });

  afterAll((done) => {
    wsService.stopAutoSave();
    closeDatabaseService();
    httpServer.close(done);
  });

  beforeEach(() => {
    clientManager = new WebSocketManager({
      serverUrl: `http://localhost:${serverPort}`,
      reconnectionAttempts: 3,
      reconnectionDelay: 100,
      timeout: 5000
    });
  });

  afterEach(async () => {
    if (clientManager.connected) {
      clientManager.disconnect();
    }
    
    // Attendre un peu pour que la déconnexion soit traitée
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  describe('Connection Flow', () => {
    it('should establish connection between client and server', async () => {
      const connectPromise = new Promise<void>((resolve) => {
        clientManager.on('connected', () => {
          resolve();
        });
      });

      await clientManager.connect();
      await connectPromise;

      expect(clientManager.connected).toBe(true);
      expect(clientManager.socketId).toBeDefined();
      expect(wsService.getConnectedUsersCount()).toBe(1);
    });

    it('should handle client disconnection', async () => {
      // Connecter d'abord
      await clientManager.connect();
      await new Promise<void>((resolve) => {
        clientManager.on('connected', resolve);
      });

      expect(wsService.getConnectedUsersCount()).toBe(1);

      // Déconnecter
      const disconnectPromise = new Promise<void>((resolve) => {
        clientManager.on('disconnected', () => {
          resolve();
        });
      });

      clientManager.disconnect();
      await disconnectPromise;

      // Attendre que le serveur traite la déconnexion
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(clientManager.connected).toBe(false);
      expect(wsService.getConnectedUsersCount()).toBe(0);
    });

    it('should receive users list on connection', async () => {
      const usersListPromise = new Promise<any[]>((resolve) => {
        clientManager.on('users-list', (users) => {
          resolve(users);
        });
      });

      await clientManager.connect();
      const usersList = await usersListPromise;

      expect(Array.isArray(usersList)).toBe(true);
      expect(usersList).toHaveLength(1);
      expect(usersList[0]).toMatchObject({
        id: clientManager.socketId,
        deviceName: expect.any(String),
        ipAddress: expect.any(String)
      });
    });
  });

  describe('Canvas Updates', () => {
    beforeEach(async () => {
      await clientManager.connect();
      await new Promise<void>((resolve) => {
        clientManager.on('connected', resolve);
      });
    });

    it('should broadcast canvas updates between clients', async () => {
      // Créer un deuxième client
      const client2 = new WebSocketManager({
        serverUrl: `http://localhost:${serverPort}`,
        reconnectionAttempts: 3,
        reconnectionDelay: 100,
        timeout: 5000
      });

      await client2.connect();
      await new Promise<void>((resolve) => {
        client2.on('connected', resolve);
      });

      // Préparer la réception sur le client 2
      const canvasUpdatePromise = new Promise<CanvasElement>((resolve) => {
        client2.on('canvas-update', (data) => {
          resolve(data);
        });
      });

      // Envoyer une mise à jour depuis le client 1
      const testElement: CanvasElement = {
        id: 'test-element-' + Date.now(),
        type: 'note',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 100 },
        content: 'Test canvas element',
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: clientManager.socketId || 'unknown'
        },
        style: {
          backgroundColor: '#ffeb3b'
        }
      };

      clientManager.send('canvas-update', testElement);

      // Vérifier que le client 2 reçoit la mise à jour
      const receivedElement = await canvasUpdatePromise;
      expect(receivedElement).toEqual(testElement);

      client2.disconnect();
    });
  });

  describe('Clipboard Synchronization', () => {
    beforeEach(async () => {
      await clientManager.connect();
      await new Promise<void>((resolve) => {
        clientManager.on('connected', resolve);
      });
    });

    it('should synchronize clipboard data between clients', async () => {
      // Créer un deuxième client
      const client2 = new WebSocketManager({
        serverUrl: `http://localhost:${serverPort}`,
        reconnectionAttempts: 3,
        reconnectionDelay: 100,
        timeout: 5000
      });

      await client2.connect();
      await new Promise<void>((resolve) => {
        client2.on('connected', resolve);
      });

      // Préparer la réception sur le client 2
      const clipboardSyncPromise = new Promise<ClipboardData>((resolve) => {
        client2.on('clipboard-sync', (data) => {
          resolve(data);
        });
      });

      // Envoyer des données de presse-papiers depuis le client 1
      const testClipboardData: ClipboardData = {
        id: 'test-clipboard-' + Date.now(),
        content: 'Test clipboard content from integration test',
        type: 'text',
        timestamp: new Date(),
        deviceId: clientManager.socketId || 'unknown'
      };

      clientManager.send('clipboard-sync', testClipboardData);

      // Vérifier que le client 2 reçoit les données
      const receivedData = await clipboardSyncPromise;
      expect(receivedData).toEqual(testClipboardData);

      client2.disconnect();
    });
  });

  describe('Cursor Position Updates', () => {
    beforeEach(async () => {
      await clientManager.connect();
      await new Promise<void>((resolve) => {
        clientManager.on('connected', resolve);
      });
    });

    it('should broadcast cursor positions between clients', async () => {
      // Créer un deuxième client
      const client2 = new WebSocketManager({
        serverUrl: `http://localhost:${serverPort}`,
        reconnectionAttempts: 3,
        reconnectionDelay: 100,
        timeout: 5000
      });

      await client2.connect();
      await new Promise<void>((resolve) => {
        client2.on('connected', resolve);
      });

      // Préparer la réception sur le client 2
      const cursorUpdatePromise = new Promise<{ userId: string; position: CursorPosition }>((resolve) => {
        client2.on('user-cursor', (data) => {
          resolve(data);
        });
      });

      // Envoyer une position de curseur depuis le client 1
      const testCursorPosition: CursorPosition = {
        x: 250,
        y: 350,
        elementId: 'test-element-123'
      };

      clientManager.send('user-cursor', testCursorPosition);

      // Vérifier que le client 2 reçoit la position
      const receivedData = await cursorUpdatePromise;
      expect(receivedData).toEqual({
        userId: clientManager.socketId,
        position: testCursorPosition
      });

      client2.disconnect();
    });
  });

  describe('Multi-Client Scenarios', () => {
    it('should handle multiple clients connecting and disconnecting', async () => {
      const clients: WebSocketManager[] = [];
      const clientCount = 3;

      // Connecter plusieurs clients
      for (let i = 0; i < clientCount; i++) {
        const client = new WebSocketManager({
          serverUrl: `http://localhost:${serverPort}`,
          reconnectionAttempts: 3,
          reconnectionDelay: 100,
          timeout: 5000
        });

        await client.connect();
        await new Promise<void>((resolve) => {
          client.on('connected', resolve);
        });

        clients.push(client);
      }

      // Vérifier que tous les clients sont connectés
      expect(wsService.getConnectedUsersCount()).toBe(clientCount);

      // Déconnecter tous les clients
      for (const client of clients) {
        client.disconnect();
      }

      // Attendre que toutes les déconnexions soient traitées
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(wsService.getConnectedUsersCount()).toBe(0);
    });

    it('should broadcast events to all connected clients except sender', async () => {
      const clients: WebSocketManager[] = [];
      const clientCount = 3;
      const receivedMessages: any[][] = Array(clientCount).fill(null).map(() => []);

      // Connecter plusieurs clients
      for (let i = 0; i < clientCount; i++) {
        const client = new WebSocketManager({
          serverUrl: `http://localhost:${serverPort}`,
          reconnectionAttempts: 3,
          reconnectionDelay: 100,
          timeout: 5000
        });

        await client.connect();
        await new Promise<void>((resolve) => {
          client.on('connected', resolve);
        });

        // Configurer l'écoute des messages
        client.on('canvas-update', (data) => {
          receivedMessages[i].push(data);
        });

        clients.push(client);
      }

      // Envoyer un message depuis le premier client
      const testMessage = {
        id: 'broadcast-test',
        type: 'note' as const,
        position: { x: 100, y: 100 },
        content: 'Broadcast test message'
      };

      clients[0].send('canvas-update', testMessage);

      // Attendre que les messages soient propagés
      await new Promise(resolve => setTimeout(resolve, 100));

      // Vérifier que tous les autres clients ont reçu le message
      expect(receivedMessages[0]).toHaveLength(0); // L'expéditeur ne doit pas recevoir son propre message
      expect(receivedMessages[1]).toHaveLength(1);
      expect(receivedMessages[2]).toHaveLength(1);

      expect(receivedMessages[1][0]).toMatchObject(testMessage);
      expect(receivedMessages[2][0]).toMatchObject(testMessage);

      // Nettoyer
      for (const client of clients) {
        client.disconnect();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle server disconnection gracefully', async () => {
      await clientManager.connect();
      await new Promise<void>((resolve) => {
        clientManager.on('connected', resolve);
      });

      expect(clientManager.connected).toBe(true);

      // Simuler une fermeture du serveur
      const disconnectPromise = new Promise<void>((resolve) => {
        clientManager.on('disconnected', () => {
          resolve();
        });
      });

      httpServer.close();
      await disconnectPromise;

      expect(clientManager.connected).toBe(false);

      // Redémarrer le serveur pour les autres tests
      await new Promise<void>((resolve) => {
        httpServer = new HttpServer();
        wsService = new WebSocketService(httpServer);
        
        httpServer.listen(serverPort, () => {
          resolve();
        });
      });
    });
  });
});