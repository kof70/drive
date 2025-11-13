/**
 * Tests unitaires pour WebSocketManager
 */

import { WebSocketManager } from '../websocket-manager';
import { 
  getMockSocket, 
  simulateConnect, 
  simulateDisconnect, 
  simulateError, 
  simulateEvent,
  resetMocks 
} from '../../../__mocks__/socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client');

describe('WebSocketManager', () => {
  let wsManager: WebSocketManager;
  
  beforeEach(() => {
    resetMocks();
    wsManager = new WebSocketManager({
      serverUrl: 'http://localhost:8080',
      reconnectionAttempts: 3,
      reconnectionDelay: 100,
      maxReconnectionDelay: 1000,
      timeout: 5000
    });
  });

  afterEach(() => {
    wsManager.disconnect();
    jest.clearAllTimers();
  });

  describe('Connection Management', () => {
    it('should establish connection successfully', async () => {
      const connectPromise = wsManager.connect();
      
      // Simuler la connexion
      simulateConnect();
      
      await connectPromise;
      
      expect(wsManager.connected).toBe(true);
      expect(wsManager.socketId).toBe('mock-socket-id');
    });

    it('should handle connection errors', async () => {
      const connectPromise = wsManager.connect();
      
      // Simuler une erreur de connexion
      const error = new Error('Connection failed');
      simulateError(error);
      
      await expect(connectPromise).rejects.toThrow('Connection failed');
      expect(wsManager.connected).toBe(false);
    });

    it('should disconnect properly', async () => {
      // Connecter d'abord
      const connectPromise = wsManager.connect();
      simulateConnect();
      await connectPromise;
      
      expect(wsManager.connected).toBe(true);
      
      // Déconnecter
      wsManager.disconnect();
      
      expect(wsManager.connected).toBe(false);
      const mockSocket = getMockSocket();
      expect(mockSocket?.disconnect).toHaveBeenCalled();
    });

    it('should not connect if already connected', async () => {
      // Première connexion
      const connectPromise1 = wsManager.connect();
      simulateConnect();
      await connectPromise1;
      
      // Deuxième tentative de connexion
      const connectPromise2 = wsManager.connect();
      await connectPromise2;
      
      // Vérifier qu'une seule connexion a été établie
      expect(wsManager.connected).toBe(true);
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      const connectPromise = wsManager.connect();
      simulateConnect();
      await connectPromise;
    });

    it('should emit connected event on successful connection', (done) => {
      const newManager = new WebSocketManager();
      
      newManager.on('connected', () => {
        expect(newManager.connected).toBe(true);
        done();
      });
      
      const connectPromise = newManager.connect();
      simulateConnect();
    });

    it('should emit disconnected event on disconnection', (done) => {
      wsManager.on('disconnected', (reason: string) => {
        expect(reason).toBe('transport close');
        expect(wsManager.connected).toBe(false);
        done();
      });
      
      simulateDisconnect('transport close');
    });

    it('should handle canvas-update events', (done) => {
      const testData = {
        id: 'test-element',
        type: 'note' as const,
        position: { x: 100, y: 100 },
        size: { width: 200, height: 100 },
        content: 'Test content'
      };
      
      wsManager.on('canvas-update', (data) => {
        expect(data).toEqual(testData);
        done();
      });
      
      simulateEvent('canvas-update', testData);
    });

    it('should handle clipboard-sync events', (done) => {
      const testData = {
        id: 'test-clipboard',
        content: 'Test clipboard content',
        type: 'text' as const,
        timestamp: new Date(),
        deviceId: 'test-device'
      };
      
      wsManager.on('clipboard-sync', (data) => {
        expect(data).toEqual(testData);
        done();
      });
      
      simulateEvent('clipboard-sync', testData);
    });

    it('should handle user-cursor events', (done) => {
      const testData = {
        userId: 'test-user',
        position: { x: 150, y: 200 }
      };
      
      wsManager.on('user-cursor', (data) => {
        expect(data).toEqual(testData);
        done();
      });
      
      simulateEvent('user-cursor', testData);
    });
  });

  describe('Message Sending', () => {
    beforeEach(async () => {
      const connectPromise = wsManager.connect();
      simulateConnect();
      await connectPromise;
    });

    it('should send messages when connected', () => {
      const testData = { test: 'data' };
      
      wsManager.send('test-event', testData);
      
      const mockSocket = getMockSocket();
      expect(mockSocket?.emit).toHaveBeenCalledWith('test-event', testData);
    });

    it('should queue messages when disconnected', () => {
      // Déconnecter
      wsManager.disconnect();
      
      const testData = { test: 'queued data' };
      wsManager.send('test-event', testData);
      
      // Le message ne doit pas être envoyé immédiatement
      const mockSocket = getMockSocket();
      expect(mockSocket?.emit).not.toHaveBeenCalledWith('test-event', testData);
    });

    it('should flush message queue on reconnection', async () => {
      // Déconnecter
      wsManager.disconnect();
      
      // Envoyer des messages en mode déconnecté
      wsManager.send('event1', { data: 1 });
      wsManager.send('event2', { data: 2 });
      
      // Reconnecter
      const connectPromise = wsManager.connect();
      simulateConnect();
      await connectPromise;
      
      // Vérifier que les messages en file d'attente ont été envoyés
      const mockSocket = getMockSocket();
      expect(mockSocket?.emit).toHaveBeenCalledWith('event1', { data: 1 });
      expect(mockSocket?.emit).toHaveBeenCalledWith('event2', { data: 2 });
    });
  });

  describe('Event Listeners Management', () => {
    it('should add and remove event listeners', () => {
      const handler = jest.fn();
      
      // Ajouter un écouteur
      wsManager.on('connected', handler);
      
      // Émettre l'événement
      wsManager['emit']('connected');
      expect(handler).toHaveBeenCalled();
      
      // Supprimer l'écouteur
      wsManager.off('connected', handler);
      handler.mockClear();
      
      // Émettre à nouveau
      wsManager['emit']('connected');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should remove all listeners for an event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      wsManager.on('connected', handler1);
      wsManager.on('connected', handler2);
      
      // Supprimer tous les écouteurs
      wsManager.removeAllListeners('connected');
      
      // Émettre l'événement
      wsManager['emit']('connected');
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should remove all listeners for all events', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      wsManager.on('connected', handler1);
      wsManager.on('disconnected', handler2);
      
      // Supprimer tous les écouteurs
      wsManager.removeAllListeners();
      
      // Émettre les événements
      wsManager['emit']('connected');
      wsManager['emit']('disconnected', 'test');
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('Reconnection Logic', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should attempt reconnection on unexpected disconnection', async () => {
      // Connecter d'abord
      const connectPromise = wsManager.connect();
      simulateConnect();
      await connectPromise;
      
      const reconnectingSpy = jest.fn();
      wsManager.on('reconnecting', reconnectingSpy);
      
      // Simuler une déconnexion inattendue
      simulateDisconnect('transport error');
      
      // Avancer le temps pour déclencher la reconnexion
      jest.advanceTimersByTime(100);
      
      expect(reconnectingSpy).toHaveBeenCalledWith(1);
    });

    it('should use exponential backoff for reconnection delays', async () => {
      // Connecter d'abord
      const connectPromise = wsManager.connect();
      simulateConnect();
      await connectPromise;
      
      const reconnectingSpy = jest.fn();
      wsManager.on('reconnecting', reconnectingSpy);
      
      // Simuler plusieurs déconnexions/échecs de reconnexion
      simulateDisconnect('transport error');
      
      // Première tentative (délai: 100ms)
      jest.advanceTimersByTime(100);
      expect(reconnectingSpy).toHaveBeenCalledWith(1);
      
      // Simuler l'échec et la deuxième tentative (délai: 200ms)
      simulateError(new Error('Reconnection failed'));
      jest.advanceTimersByTime(200);
      expect(reconnectingSpy).toHaveBeenCalledWith(2);
    });

    it('should stop reconnection after max attempts', async () => {
      // Connecter d'abord
      const connectPromise = wsManager.connect();
      simulateConnect();
      await connectPromise;
      
      const reconnectingSpy = jest.fn();
      wsManager.on('reconnecting', reconnectingSpy);
      
      // Simuler une déconnexion
      simulateDisconnect('transport error');
      
      // Simuler 3 échecs de reconnexion (max configuré)
      for (let i = 1; i <= 3; i++) {
        jest.advanceTimersByTime(100 * Math.pow(2, i - 1));
        expect(reconnectingSpy).toHaveBeenCalledWith(i);
        simulateError(new Error('Reconnection failed'));
      }
      
      // Vérifier qu'aucune tentative supplémentaire n'est faite
      jest.advanceTimersByTime(10000);
      expect(reconnectingSpy).toHaveBeenCalledTimes(3);
    });

    it('should not reconnect on manual disconnection', async () => {
      // Connecter d'abord
      const connectPromise = wsManager.connect();
      simulateConnect();
      await connectPromise;
      
      const reconnectingSpy = jest.fn();
      wsManager.on('reconnecting', reconnectingSpy);
      
      // Déconnexion manuelle
      wsManager.disconnect();
      simulateDisconnect('io client disconnect');
      
      // Avancer le temps
      jest.advanceTimersByTime(1000);
      
      // Aucune tentative de reconnexion ne doit être faite
      expect(reconnectingSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle listener errors gracefully', () => {
      const faultyHandler = jest.fn(() => {
        throw new Error('Handler error');
      });
      const goodHandler = jest.fn();
      
      wsManager.on('connected', faultyHandler);
      wsManager.on('connected', goodHandler);
      
      // Émettre l'événement - ne doit pas planter
      expect(() => {
        wsManager['emit']('connected');
      }).not.toThrow();
      
      // Le bon handler doit quand même être appelé
      expect(goodHandler).toHaveBeenCalled();
    });
  });
});