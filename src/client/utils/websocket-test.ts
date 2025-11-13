import { wsManager } from '../services/websocket-manager';
import { CanvasElement, ClipboardData, CursorPosition } from '../../shared/types';

/**
 * Utilitaires pour tester la connexion WebSocket
 */
export class WebSocketTester {
  private static instance: WebSocketTester;
  private testResults: Map<string, any> = new Map();

  public static getInstance(): WebSocketTester {
    if (!WebSocketTester.instance) {
      WebSocketTester.instance = new WebSocketTester();
    }
    return WebSocketTester.instance;
  }

  /**
   * Test de connexion de base
   */
  public async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Test de connexion WebSocket...');
      
      await wsManager.connect();
      
      if (wsManager.connected) {
        console.log('✅ Connexion WebSocket réussie');
        console.log(`📍 Socket ID: ${wsManager.socketId}`);
        return true;
      } else {
        console.log('❌ Connexion WebSocket échouée');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors du test de connexion:', error);
      return false;
    }
  }

  /**
   * Test d'émission d'événements
   */
  public testEventEmission(): void {
    if (!wsManager.connected) {
      console.log('❌ WebSocket non connecté, impossible de tester l\'émission');
      return;
    }

    console.log('🧪 Test d\'émission d\'événements...');

    // Test canvas-update
    const testCanvasElement: CanvasElement = {
      id: 'test-element-' + Date.now(),
      type: 'note',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
      content: 'Test note from WebSocket',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: wsManager.socketId || 'unknown'
      },
      style: {
        backgroundColor: '#ffeb3b',
        borderColor: '#fbc02d'
      }
    };

    wsManager.send('canvas-update', testCanvasElement);
    console.log('📤 Événement canvas-update émis');

    // Test clipboard-sync
    const testClipboardData: ClipboardData = {
      id: 'test-clipboard-' + Date.now(),
      content: 'Test clipboard content',
      type: 'text',
      timestamp: new Date(),
      deviceId: wsManager.socketId || 'unknown'
    };

    wsManager.send('clipboard-sync', testClipboardData);
    console.log('📤 Événement clipboard-sync émis');

    // Test user-cursor
    const testCursorPosition: CursorPosition = {
      x: Math.random() * 800,
      y: Math.random() * 600
    };

    wsManager.send('user-cursor', testCursorPosition);
    console.log('📤 Événement user-cursor émis');
  }

  /**
   * Test de réception d'événements
   */
  public setupEventListeners(): void {
    console.log('🧪 Configuration des écouteurs de test...');

    // Écouter les mises à jour du canvas
    wsManager.on('canvas-update', (data) => {
      console.log('📥 Reçu canvas-update:', data);
      this.testResults.set('canvas-update', data);
    });

    // Écouter la synchronisation du presse-papiers
    wsManager.on('clipboard-sync', (data) => {
      console.log('📥 Reçu clipboard-sync:', data);
      this.testResults.set('clipboard-sync', data);
    });

    // Écouter les positions de curseur
    wsManager.on('user-cursor', (data) => {
      console.log('📥 Reçu user-cursor:', data);
      this.testResults.set('user-cursor', data);
    });

    // Écouter les connexions d'utilisateurs
    wsManager.on('user-connected', (session) => {
      console.log('📥 Utilisateur connecté:', session);
      this.testResults.set('user-connected', session);
    });

    // Écouter les déconnexions d'utilisateurs
    wsManager.on('user-disconnected', (sessionId) => {
      console.log('📥 Utilisateur déconnecté:', sessionId);
      this.testResults.set('user-disconnected', sessionId);
    });

    // Écouter la liste des utilisateurs
    wsManager.on('users-list', (users) => {
      console.log('📥 Liste des utilisateurs:', users);
      this.testResults.set('users-list', users);
    });

    console.log('✅ Écouteurs de test configurés');
  }

  /**
   * Test de reconnexion
   */
  public async testReconnection(): Promise<void> {
    if (!wsManager.connected) {
      console.log('❌ WebSocket non connecté, impossible de tester la reconnexion');
      return;
    }

    console.log('🧪 Test de reconnexion...');

    // Écouter les événements de reconnexion
    wsManager.on('disconnected', (reason) => {
      console.log(`📥 Déconnecté: ${reason}`);
    });

    wsManager.on('reconnecting', (attempt) => {
      console.log(`📥 Tentative de reconnexion: ${attempt}`);
    });

    wsManager.on('reconnected', () => {
      console.log('📥 Reconnecté avec succès');
    });

    // Forcer une déconnexion pour tester la reconnexion
    wsManager.disconnect();
    
    // Attendre un peu puis reconnecter
    setTimeout(() => {
      wsManager.connect();
    }, 2000);
  }

  /**
   * Test de la file d'attente des messages
   */
  public testMessageQueue(): void {
    console.log('🧪 Test de la file d\'attente des messages...');

    // Déconnecter d'abord
    wsManager.disconnect();

    // Émettre des messages pendant la déconnexion
    wsManager.send('canvas-update', { test: 'message 1' });
    wsManager.send('clipboard-sync', { test: 'message 2' });
    wsManager.send('user-cursor', { test: 'message 3' });

    console.log('📤 Messages émis pendant la déconnexion');

    // Reconnecter après un délai
    setTimeout(() => {
      console.log('🔄 Reconnexion pour vider la file d\'attente...');
      wsManager.connect();
    }, 1000);
  }

  /**
   * Obtenir les résultats des tests
   */
  public getTestResults(): Map<string, any> {
    return this.testResults;
  }

  /**
   * Nettoyer les résultats des tests
   */
  public clearTestResults(): void {
    this.testResults.clear();
  }

  /**
   * Test complet
   */
  public async runFullTest(): Promise<void> {
    console.log('🧪 Démarrage du test complet WebSocket...');

    // 1. Test de connexion
    const connected = await this.testConnection();
    if (!connected) {
      console.log('❌ Test complet arrêté - connexion échouée');
      return;
    }

    // 2. Configuration des écouteurs
    this.setupEventListeners();

    // 3. Test d'émission
    setTimeout(() => {
      this.testEventEmission();
    }, 1000);

    // 4. Test de la file d'attente (optionnel)
    setTimeout(() => {
      this.testMessageQueue();
    }, 3000);

    console.log('✅ Test complet WebSocket terminé');
  }
}

// Instance singleton
export const wsTest = WebSocketTester.getInstance();