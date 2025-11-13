/**
 * Tests End-to-End avec données réelles
 * Ces tests utilisent un vrai serveur et de vrais clients WebSocket
 */

import { Server as HttpServer } from 'http';
import express from 'express';
import { createServer } from 'http';
import { WebSocketService } from '../../server/services/websocket';
import { io as ioClient, Socket } from 'socket.io-client';
import { CanvasElement, ClipboardData, CursorPosition } from '../../shared/types';

describe('Tests End-to-End avec données réelles', () => {
  let httpServer: HttpServer;
  let wsService: WebSocketService;
  let serverPort: number;
  let clients: Socket[] = [];

  beforeAll((done) => {
    // Créer un vrai serveur Express
    const app = express();
    httpServer = createServer(app);
    wsService = new WebSocketService(httpServer);

    // Démarrer le serveur sur un port aléatoire
    httpServer.listen(0, () => {
      const address = httpServer.address();
      serverPort = typeof address === 'object' && address ? address.port : 0;
      console.log(`✅ Serveur de test démarré sur le port ${serverPort}`);
      done();
    });
  });

  afterAll((done) => {
    // Fermer tous les clients
    clients.forEach(client => {
      if (client.connected) {
        client.disconnect();
      }
    });
    
    // Fermer le serveur
    httpServer.close(() => {
      console.log('✅ Serveur de test arrêté');
      done();
    });
  });

  afterEach(() => {
    // Nettoyer les clients après chaque test
    clients.forEach(client => {
      if (client.connected) {
        client.disconnect();
      }
    });
    clients = [];
  });

  describe('Connexion et Multi-utilisateurs', () => {
    it('devrait permettre à un client de se connecter', (done) => {
      const client = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket']
      });
      clients.push(client);

      client.on('connect', () => {
        expect(client.connected).toBe(true);
        expect(client.id).toBeDefined();
        console.log(`✅ Client connecté avec ID: ${client.id}`);
        
        // Vérifier que le serveur a bien enregistré l'utilisateur
        expect(wsService.getConnectedUsersCount()).toBe(1);
        done();
      });

      client.on('connect_error', (error) => {
        done(error);
      });
    });

    it('devrait gérer plusieurs clients simultanément', (done) => {
      const numClients = 3;
      let connectedCount = 0;

      for (let i = 0; i < numClients; i++) {
        const client = ioClient(`http://localhost:${serverPort}`, {
          transports: ['websocket']
        });
        clients.push(client);

        client.on('connect', () => {
          connectedCount++;
          console.log(`✅ Client ${i + 1}/${numClients} connecté`);

          if (connectedCount === numClients) {
            // Vérifier que tous les clients sont connectés
            expect(wsService.getConnectedUsersCount()).toBe(numClients);
            console.log(`✅ ${numClients} clients connectés simultanément`);
            done();
          }
        });
      }
    });

    it('devrait envoyer la liste des utilisateurs aux nouveaux clients', (done) => {
      // Connecter le premier client
      const client1 = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket']
      });
      clients.push(client1);

      client1.on('connect', () => {
        // Connecter le deuxième client
        const client2 = ioClient(`http://localhost:${serverPort}`, {
          transports: ['websocket']
        });
        clients.push(client2);

        client2.on('users-list', (users) => {
          console.log(`✅ Liste d'utilisateurs reçue:`, users);
          expect(Array.isArray(users)).toBe(true);
          expect(users.length).toBeGreaterThanOrEqual(1);
          expect(users[0]).toHaveProperty('id');
          expect(users[0]).toHaveProperty('deviceName');
          expect(users[0]).toHaveProperty('ipAddress');
          done();
        });
      });
    });
  });

  describe('Synchronisation Canvas en temps réel', () => {
    it('devrait synchroniser la création d\'éléments entre clients', (done) => {
      const client1 = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket']
      });
      const client2 = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket']
      });
      clients.push(client1, client2);

      let client1Connected = false;
      let client2Connected = false;

      client1.on('connect', () => {
        client1Connected = true;
        tryTest();
      });

      client2.on('connect', () => {
        client2Connected = true;
        tryTest();
      });

      function tryTest() {
        if (!client1Connected || !client2Connected) return;

        // Client 2 écoute les mises à jour
        client2.on('canvas-update', (data: CanvasElement) => {
          console.log('✅ Client 2 a reçu la mise à jour:', data);
          expect(data.id).toBe('test-note-123');
          expect(data.type).toBe('note');
          expect(data.content).toBe('Test de synchronisation réelle');
          expect(data.position).toEqual({ x: 100, y: 200 });
          done();
        });

        // Client 1 crée un élément
        const testElement: CanvasElement = {
          id: 'test-note-123',
          type: 'note',
          position: { x: 100, y: 200 },
          size: { width: 200, height: 150 },
          content: 'Test de synchronisation réelle',
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: client1.id || 'test-user'
          },
          style: {
            backgroundColor: '#fef3c7',
            borderColor: '#f59e0b'
          }
        };

        console.log('📤 Client 1 envoie un élément...');
        client1.emit('canvas-update', testElement);
      }
    });

    it('devrait synchroniser le déplacement d\'éléments', (done) => {
      const client1 = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket']
      });
      const client2 = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket']
      });
      clients.push(client1, client2);

      let bothConnected = false;

      const checkConnected = () => {
        if (client1.connected && client2.connected && !bothConnected) {
          bothConnected = true;
          startTest();
        }
      };

      client1.on('connect', checkConnected);
      client2.on('connect', checkConnected);

      function startTest() {
        const elementId = 'movable-element-' + Date.now();
        let updateCount = 0;

        client2.on('canvas-update', (data: CanvasElement) => {
          if (data.id === elementId) {
            updateCount++;
            console.log(`✅ Mise à jour ${updateCount} reçue:`, data.position);

            if (updateCount === 1) {
              expect(data.position).toEqual({ x: 150, y: 250 });
            } else if (updateCount === 2) {
              expect(data.position).toEqual({ x: 300, y: 400 });
              done();
            }
          }
        });

        // Simuler plusieurs déplacements
        setTimeout(() => {
          client1.emit('canvas-update', {
            id: elementId,
            type: 'note',
            position: { x: 150, y: 250 },
            size: { width: 200, height: 150 },
            content: 'Element mobile',
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: client1.id
            },
            style: {}
          });
        }, 100);

        setTimeout(() => {
          client1.emit('canvas-update', {
            id: elementId,
            type: 'note',
            position: { x: 300, y: 400 },
            size: { width: 200, height: 150 },
            content: 'Element mobile',
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: client1.id
            },
            style: {}
          });
        }, 200);
      }
    });
  });

  describe('Synchronisation Presse-papiers', () => {
    it('devrait synchroniser le presse-papiers entre clients', (done) => {
      const client1 = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket']
      });
      const client2 = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket']
      });
      clients.push(client1, client2);

      let bothConnected = false;

      const checkConnected = () => {
        if (client1.connected && client2.connected && !bothConnected) {
          bothConnected = true;
          startTest();
        }
      };

      client1.on('connect', checkConnected);
      client2.on('connect', checkConnected);

      function startTest() {
        client2.on('clipboard-sync', (data: ClipboardData) => {
          console.log('✅ Presse-papiers synchronisé:', data);
          expect(data.content).toBe('Texte copié depuis le client 1');
          expect(data.type).toBe('text');
          expect(data.deviceId).toBe(client1.id);
          done();
        });

        const clipboardData: ClipboardData = {
          id: 'clipboard-' + Date.now(),
          content: 'Texte copié depuis le client 1',
          type: 'text',
          timestamp: new Date(),
          deviceId: client1.id || 'unknown'
        };

        console.log('📋 Client 1 copie du texte...');
        client1.emit('clipboard-sync', clipboardData);
      }
    });
  });

  describe('Synchronisation Curseurs', () => {
    it('devrait synchroniser les positions de curseur', (done) => {
      const client1 = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket']
      });
      const client2 = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket']
      });
      clients.push(client1, client2);

      let bothConnected = false;

      const checkConnected = () => {
        if (client1.connected && client2.connected && !bothConnected) {
          bothConnected = true;
          startTest();
        }
      };

      client1.on('connect', checkConnected);
      client2.on('connect', checkConnected);

      function startTest() {
        client2.on('user-cursor', (data: { userId: string; position: CursorPosition }) => {
          console.log('✅ Position de curseur reçue:', data);
          expect(data.userId).toBe(client1.id);
          expect(data.position.x).toBe(250);
          expect(data.position.y).toBe(350);
          done();
        });

        const cursorPosition: CursorPosition = {
          x: 250,
          y: 350
        };

        console.log('🖱️ Client 1 déplace son curseur...');
        client1.emit('user-cursor', cursorPosition);
      }
    });
  });

  describe('Déconnexion et Reconnexion', () => {
    it('devrait notifier les autres clients lors d\'une déconnexion', (done) => {
      const client1 = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket']
      });
      const client2 = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket']
      });
      clients.push(client1, client2);

      let bothConnected = false;
      let client1Id: string;

      const checkConnected = () => {
        if (client1.connected && client2.connected && !bothConnected) {
          bothConnected = true;
          client1Id = client1.id!;
          startTest();
        }
      };

      client1.on('connect', checkConnected);
      client2.on('connect', checkConnected);

      function startTest() {
        client2.on('user-disconnected', (sessionId: string) => {
          console.log('✅ Déconnexion notifiée:', sessionId);
          expect(sessionId).toBe(client1Id);
          
          // Vérifier que le serveur a bien retiré l'utilisateur
          setTimeout(() => {
            expect(wsService.getConnectedUsersCount()).toBe(1);
            done();
          }, 100);
        });

        console.log('🔌 Client 1 se déconnecte...');
        client1.disconnect();
      }
    });
  });

  describe('Performance et Charge', () => {
    it('devrait gérer 10 clients simultanés', (done) => {
      const numClients = 10;
      let connectedCount = 0;

      for (let i = 0; i < numClients; i++) {
        const client = ioClient(`http://localhost:${serverPort}`, {
          transports: ['websocket']
        });
        clients.push(client);

        client.on('connect', () => {
          connectedCount++;
          
          if (connectedCount === numClients) {
            console.log(`✅ ${numClients} clients connectés`);
            expect(wsService.getConnectedUsersCount()).toBe(numClients);
            
            // Vérifier que tous les clients peuvent communiquer
            let messagesReceived = 0;
            const expectedMessages = numClients - 1; // Tous sauf l'émetteur

            clients.forEach((c, index) => {
              if (index > 0) { // Tous sauf le premier
                c.on('canvas-update', () => {
                  messagesReceived++;
                  if (messagesReceived === expectedMessages) {
                    console.log(`✅ Tous les clients ont reçu le message`);
                    done();
                  }
                });
              }
            });

            // Le premier client envoie un message
            clients[0].emit('canvas-update', {
              id: 'broadcast-test',
              type: 'note',
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
              content: 'Broadcast test',
              metadata: {
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: clients[0].id
              },
              style: {}
            });
          }
        });
      }
    }, 15000); // Timeout plus long pour ce test

    it('devrait gérer 50 mises à jour rapides', (done) => {
      const client1 = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket']
      });
      const client2 = ioClient(`http://localhost:${serverPort}`, {
        transports: ['websocket']
      });
      clients.push(client1, client2);

      let bothConnected = false;

      const checkConnected = () => {
        if (client1.connected && client2.connected && !bothConnected) {
          bothConnected = true;
          startTest();
        }
      };

      client1.on('connect', checkConnected);
      client2.on('connect', checkConnected);

      function startTest() {
        const numUpdates = 50;
        let receivedUpdates = 0;

        client2.on('canvas-update', () => {
          receivedUpdates++;
          if (receivedUpdates === numUpdates) {
            console.log(`✅ ${numUpdates} mises à jour reçues avec succès`);
            done();
          }
        });

        // Envoyer 50 mises à jour rapidement
        for (let i = 0; i < numUpdates; i++) {
          client1.emit('canvas-update', {
            id: `rapid-update-${i}`,
            type: 'note',
            position: { x: i * 10, y: i * 10 },
            size: { width: 100, height: 100 },
            content: `Update ${i}`,
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: client1.id
            },
            style: {}
          });
        }
      }
    }, 10000);
  });
});