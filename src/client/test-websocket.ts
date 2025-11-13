/**
 * Test simple du WebSocket Manager
 * Ce fichier peut être exécuté avec Node.js pour tester la connexion
 */

import { wsManager } from './services/websocket-manager';
import { wsTest } from './utils/websocket-test';

async function testWebSocketConnection() {
  console.log('🚀 Démarrage du test WebSocket client...');

  try {
    // Configuration pour se connecter au serveur local
    const config = {
      serverUrl: 'http://localhost:8080',
      reconnectionAttempts: 3,
      reconnectionDelay: 1000
    };

    // Créer une nouvelle instance avec la config
    const testManager = new (require('./services/websocket-manager').WebSocketManager)(config);

    // Écouter les événements de connexion
    testManager.on('connected', () => {
      console.log('✅ Connexion établie avec succès');
      console.log(`📍 Socket ID: ${testManager.socketId}`);
      
      // Tester l'émission d'événements
      setTimeout(() => {
        console.log('📤 Test d\'émission d\'événements...');
        
        testManager.send('canvas-update', {
          id: 'test-element',
          type: 'note',
          position: { x: 100, y: 100 },
          content: 'Test depuis le client'
        });
        
        testManager.send('user-cursor', {
          x: 200,
          y: 150
        });
        
        console.log('✅ Événements émis');
      }, 1000);
      
      // Déconnecter après 5 secondes
      setTimeout(() => {
        console.log('🔌 Déconnexion...');
        testManager.disconnect();
        process.exit(0);
      }, 5000);
    });

    testManager.on('disconnected', (reason: string) => {
      console.log(`🔌 Déconnecté: ${reason}`);
    });

    testManager.on('error', (error: Error) => {
      console.error('❌ Erreur:', error.message);
      process.exit(1);
    });

    // Écouter les événements métier
    testManager.on('canvas-update', (data: any) => {
      console.log('📥 Reçu canvas-update:', data);
    });

    testManager.on('user-cursor', (data: any) => {
      console.log('📥 Reçu user-cursor:', data);
    });

    testManager.on('users-list', (users: any[]) => {
      console.log(`📥 ${users.length} utilisateur(s) connecté(s)`);
    });

    // Démarrer la connexion
    await testManager.connect();

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

// Exécuter le test si ce fichier est lancé directement
if (require.main === module) {
  testWebSocketConnection();
}

export { testWebSocketConnection };