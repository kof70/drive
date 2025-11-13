#!/usr/bin/env ts-node
/**
 * Script de test manuel interactif
 * Lance des tests réels avec le serveur et des clients
 */

import { io, Socket } from 'socket.io-client';
import * as readline from 'readline';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8080';

class ManualTester {
  private clients: Socket[] = [];
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('🧪 Test Manuel - Local Collaborative Workspace\n');
    console.log(`📡 Serveur: ${SERVER_URL}\n`);
    
    await this.showMenu();
  }

  private async showMenu() {
    console.log('\n=== MENU PRINCIPAL ===');
    console.log('1. Connecter un nouveau client');
    console.log('2. Créer une note');
    console.log('3. Déplacer un élément');
    console.log('4. Copier dans le presse-papiers');
    console.log('5. Déplacer le curseur');
    console.log('6. Afficher les clients connectés');
    console.log('7. Déconnecter un client');
    console.log('8. Test de charge (10 clients)');
    console.log('9. Test de synchronisation');
    console.log('0. Quitter\n');

    this.rl.question('Choisissez une option: ', async (answer) => {
      await this.handleChoice(answer.trim());
    });
  }

  private async handleChoice(choice: string) {
    switch (choice) {
      case '1':
        await this.connectClient();
        break;
      case '2':
        await this.createNote();
        break;
      case '3':
        await this.moveElement();
        break;
      case '4':
        await this.copyToClipboard();
        break;
      case '5':
        await this.moveCursor();
        break;
      case '6':
        this.showConnectedClients();
        break;
      case '7':
        await this.disconnectClient();
        break;
      case '8':
        await this.loadTest();
        break;
      case '9':
        await this.syncTest();
        break;
      case '0':
        this.cleanup();
        return;
      default:
        console.log('❌ Option invalide');
    }
    
    await this.showMenu();
  }

  private async connectClient(): Promise<void> {
    return new Promise((resolve) => {
      console.log('\n🔌 Connexion d\'un nouveau client...');
      
      const client = io(SERVER_URL, {
        transports: ['websocket']
      });

      client.on('connect', () => {
        console.log(`✅ Client connecté! ID: ${client.id}`);
        this.clients.push(client);
        
        // Écouter les événements
        this.setupClientListeners(client, this.clients.length);
        resolve();
      });

      client.on('connect_error', (error) => {
        console.log(`❌ Erreur de connexion: ${error.message}`);
        resolve();
      });
    });
  }

  private setupClientListeners(client: Socket, clientNumber: number) {
    client.on('canvas-update', (data) => {
      console.log(`📥 [Client ${clientNumber}] Canvas update:`, {
        id: data.id,
        type: data.type,
        position: data.position
      });
    });

    client.on('clipboard-sync', (data) => {
      console.log(`📋 [Client ${clientNumber}] Clipboard:`, data.content.substring(0, 50));
    });

    client.on('user-cursor', (data) => {
      console.log(`🖱️ [Client ${clientNumber}] Cursor:`, data.position);
    });

    client.on('user-connected', (session) => {
      console.log(`👤 [Client ${clientNumber}] Utilisateur connecté:`, session.deviceName);
    });

    client.on('user-disconnected', (sessionId) => {
      console.log(`👋 [Client ${clientNumber}] Utilisateur déconnecté:`, sessionId);
    });

    client.on('users-list', (users) => {
      console.log(`👥 [Client ${clientNumber}] ${users.length} utilisateur(s) connecté(s)`);
    });
  }

  private async createNote(): Promise<void> {
    if (this.clients.length === 0) {
      console.log('❌ Aucun client connecté. Connectez d\'abord un client (option 1)');
      return;
    }

    return new Promise((resolve) => {
      this.rl.question('Numéro du client (1-' + this.clients.length + '): ', (clientNum) => {
        const index = parseInt(clientNum) - 1;
        
        if (index < 0 || index >= this.clients.length) {
          console.log('❌ Numéro de client invalide');
          resolve();
          return;
        }

        this.rl.question('Contenu de la note: ', (content) => {
          const client = this.clients[index];
          const note = {
            id: `note-${Date.now()}`,
            type: 'note',
            position: { 
              x: Math.floor(Math.random() * 500), 
              y: Math.floor(Math.random() * 500) 
            },
            size: { width: 200, height: 150 },
            content: content || 'Nouvelle note',
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: client.id
            },
            style: {
              backgroundColor: '#fef3c7',
              borderColor: '#f59e0b'
            }
          };

          console.log(`📝 Création de la note...`);
          client.emit('canvas-update', note);
          console.log(`✅ Note créée et envoyée!`);
          resolve();
        });
      });
    });
  }

  private async moveElement(): Promise<void> {
    if (this.clients.length === 0) {
      console.log('❌ Aucun client connecté');
      return;
    }

    return new Promise((resolve) => {
      this.rl.question('Numéro du client: ', (clientNum) => {
        const index = parseInt(clientNum) - 1;
        
        if (index < 0 || index >= this.clients.length) {
          console.log('❌ Numéro de client invalide');
          resolve();
          return;
        }

        this.rl.question('ID de l\'élément: ', (elementId) => {
          this.rl.question('Nouvelle position X: ', (x) => {
            this.rl.question('Nouvelle position Y: ', (y) => {
              const client = this.clients[index];
              const update = {
                id: elementId,
                type: 'note',
                position: { x: parseInt(x), y: parseInt(y) },
                size: { width: 200, height: 150 },
                content: 'Element déplacé',
                metadata: {
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  createdBy: client.id
                },
                style: {}
              };

              console.log(`🔄 Déplacement de l'élément...`);
              client.emit('canvas-update', update);
              console.log(`✅ Élément déplacé!`);
              resolve();
            });
          });
        });
      });
    });
  }

  private async copyToClipboard(): Promise<void> {
    if (this.clients.length === 0) {
      console.log('❌ Aucun client connecté');
      return;
    }

    return new Promise((resolve) => {
      this.rl.question('Numéro du client: ', (clientNum) => {
        const index = parseInt(clientNum) - 1;
        
        if (index < 0 || index >= this.clients.length) {
          console.log('❌ Numéro de client invalide');
          resolve();
          return;
        }

        this.rl.question('Texte à copier: ', (text) => {
          const client = this.clients[index];
          const clipboardData = {
            id: `clipboard-${Date.now()}`,
            content: text,
            type: 'text',
            timestamp: new Date(),
            deviceId: client.id
          };

          console.log(`📋 Copie dans le presse-papiers...`);
          client.emit('clipboard-sync', clipboardData);
          console.log(`✅ Texte copié et synchronisé!`);
          resolve();
        });
      });
    });
  }

  private async moveCursor(): Promise<void> {
    if (this.clients.length === 0) {
      console.log('❌ Aucun client connecté');
      return;
    }

    return new Promise((resolve) => {
      this.rl.question('Numéro du client: ', (clientNum) => {
        const index = parseInt(clientNum) - 1;
        
        if (index < 0 || index >= this.clients.length) {
          console.log('❌ Numéro de client invalide');
          resolve();
          return;
        }

        this.rl.question('Position X: ', (x) => {
          this.rl.question('Position Y: ', (y) => {
            const client = this.clients[index];
            const cursorPosition = {
              x: parseInt(x),
              y: parseInt(y)
            };

            console.log(`🖱️ Déplacement du curseur...`);
            client.emit('user-cursor', cursorPosition);
            console.log(`✅ Curseur déplacé!`);
            resolve();
          });
        });
      });
    });
  }

  private showConnectedClients() {
    console.log(`\n👥 Clients connectés: ${this.clients.length}`);
    this.clients.forEach((client, index) => {
      console.log(`  ${index + 1}. ID: ${client.id} - Connecté: ${client.connected}`);
    });
  }

  private async disconnectClient(): Promise<void> {
    if (this.clients.length === 0) {
      console.log('❌ Aucun client connecté');
      return;
    }

    return new Promise((resolve) => {
      this.rl.question('Numéro du client à déconnecter: ', (clientNum) => {
        const index = parseInt(clientNum) - 1;
        
        if (index < 0 || index >= this.clients.length) {
          console.log('❌ Numéro de client invalide');
          resolve();
          return;
        }

        const client = this.clients[index];
        console.log(`🔌 Déconnexion du client ${client.id}...`);
        client.disconnect();
        this.clients.splice(index, 1);
        console.log(`✅ Client déconnecté!`);
        resolve();
      });
    });
  }

  private async loadTest(): Promise<void> {
    console.log('\n🔥 Test de charge: connexion de 10 clients...');
    
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(this.connectClient());
      await new Promise(resolve => setTimeout(resolve, 100)); // Délai entre connexions
    }

    await Promise.all(promises);
    console.log(`✅ 10 clients connectés! Total: ${this.clients.length}`);
  }

  private async syncTest(): Promise<void> {
    if (this.clients.length < 2) {
      console.log('❌ Au moins 2 clients nécessaires. Connectez plus de clients.');
      return;
    }

    console.log('\n🔄 Test de synchronisation...');
    console.log('Le client 1 va créer 5 notes, les autres devraient les recevoir.\n');

    let receivedCount = 0;
    const expectedCount = (this.clients.length - 1) * 5; // Tous sauf l'émetteur

    // Configurer les listeners
    for (let i = 1; i < this.clients.length; i++) {
      this.clients[i].once('canvas-update', () => {
        receivedCount++;
        console.log(`📥 Client ${i + 1} a reçu une mise à jour (${receivedCount}/${expectedCount})`);
      });
    }

    // Client 1 envoie 5 notes
    for (let i = 0; i < 5; i++) {
      const note = {
        id: `sync-test-${i}`,
        type: 'note',
        position: { x: i * 50, y: i * 50 },
        size: { width: 200, height: 150 },
        content: `Note de test ${i + 1}`,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: this.clients[0].id
        },
        style: {}
      };

      this.clients[0].emit('canvas-update', note);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setTimeout(() => {
      console.log(`\n✅ Test terminé! ${receivedCount}/${expectedCount} messages reçus`);
    }, 2000);
  }

  private cleanup() {
    console.log('\n🧹 Nettoyage...');
    this.clients.forEach(client => {
      if (client.connected) {
        client.disconnect();
      }
    });
    this.rl.close();
    console.log('👋 Au revoir!\n');
    process.exit(0);
  }
}

// Lancer le testeur
const tester = new ManualTester();
tester.start().catch(console.error);