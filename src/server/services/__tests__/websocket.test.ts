/**
 * Tests unitaires pour WebSocketService
 */

import { Server as HttpServer } from 'http';
import { WebSocketService } from '../websocket';
import { UserSession, CanvasElement, ClipboardData, CursorPosition } from '../../../shared/types';

// Mock Socket.io
const mockSocket = {
  id: 'test-socket-id',
  handshake: {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    address: '192.168.1.100'
  },
  on: jest.fn(),
  emit: jest.fn(),
  broadcast: {
    emit: jest.fn()
  }
};

const mockIo = {
  on: jest.fn(),
  emit: jest.fn(),
  sockets: {
    sockets: new Map([['test-socket-id', mockSocket]])
  }
};

jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => mockIo)
}));

describe('WebSocketService', () => {
  let httpServer: HttpServer;
  let wsService: WebSocketService;
  let connectionHandler: Function;
  let disconnectHandler: Function;

  beforeEach(() => {
    httpServer = new HttpServer();
    wsService = new WebSocketService(httpServer);
    
    // Récupérer le handler de connexion
    connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')?.[1];
    
    // Reset des mocks
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize Socket.io server with correct configuration', () => {
      expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });
  });

  describe('Connection Handling', () => {
    it('should handle new client connections', () => {
      // Simuler une nouvelle connexion
      connectionHandler(mockSocket);
      
      // Vérifier que les événements sont configurés
      expect(mockSocket.on).toHaveBeenCalledWith('canvas-update', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('clipboard-sync', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('user-cursor', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('file-upload', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should create user session on connection', () => {
      connectionHandler(mockSocket);
      
      const connectedUsers = wsService.getConnectedUsers();
      expect(connectedUsers).toHaveLength(1);
      
      const user = connectedUsers[0];
      expect(user.id).toBe('test-socket-id');
      expect(user.deviceName).toBe('Windows PC');
      expect(user.ipAddress).toBe('192.168.1.100');
      expect(user.connectedAt).toBeInstanceOf(Date);
    });

    it('should broadcast user connection to other clients', () => {
      connectionHandler(mockSocket);
      
      expect(mockSocket.broadcast.emit).toHaveBeenCalledWith('user-connected', expect.objectContaining({
        id: 'test-socket-id',
        deviceName: 'Windows PC'
      }));
    });

    it('should send users list to new client', () => {
      connectionHandler(mockSocket);
      
      expect(mockSocket.emit).toHaveBeenCalledWith('users-list', expect.any(Array));
    });
  });

  describe('Event Handling', () => {
    let canvasUpdateHandler: Function;
    let clipboardSyncHandler: Function;
    let userCursorHandler: Function;
    let fileUploadHandler: Function;
    let disconnectHandler: Function;

    beforeEach(() => {
      connectionHandler(mockSocket);
      
      // Récupérer les handlers d'événements
      canvasUpdateHandler = mockSocket.on.mock.calls.find(call => call[0] === 'canvas-update')?.[1];
      clipboardSyncHandler = mockSocket.on.mock.calls.find(call => call[0] === 'clipboard-sync')?.[1];
      userCursorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'user-cursor')?.[1];
      fileUploadHandler = mockSocket.on.mock.calls.find(call => call[0] === 'file-upload')?.[1];
      disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')?.[1];
    });

    it('should handle canvas-update events', () => {
      const testCanvasElement: CanvasElement = {
        id: 'test-element',
        type: 'note',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 100 },
        content: 'Test content',
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'test-user'
        },
        style: {
          backgroundColor: '#ffeb3b'
        }
      };

      canvasUpdateHandler(testCanvasElement);

      expect(mockSocket.broadcast.emit).toHaveBeenCalledWith('canvas-update', testCanvasElement);
    });

    it('should handle clipboard-sync events', () => {
      const testClipboardData: ClipboardData = {
        id: 'test-clipboard',
        content: 'Test clipboard content',
        type: 'text',
        timestamp: new Date(),
        deviceId: 'test-device'
      };

      clipboardSyncHandler(testClipboardData);

      expect(mockSocket.broadcast.emit).toHaveBeenCalledWith('clipboard-sync', testClipboardData);
    });

    it('should handle user-cursor events', () => {
      const testCursorPosition: CursorPosition = {
        x: 150,
        y: 200,
        elementId: 'test-element'
      };

      userCursorHandler(testCursorPosition);

      expect(mockSocket.broadcast.emit).toHaveBeenCalledWith('user-cursor', {
        userId: 'test-socket-id',
        position: testCursorPosition
      });
    });

    it('should handle file-upload events', () => {
      const testFileData = {
        filename: 'test.txt',
        size: 1024,
        type: 'text/plain'
      };

      fileUploadHandler(testFileData);

      expect(mockSocket.broadcast.emit).toHaveBeenCalledWith('file-upload', testFileData);
    });

    it('should handle disconnection events', () => {
      // D'abord connecter
      connectionHandler(mockSocket);
      expect(wsService.getConnectedUsersCount()).toBe(1);

      // Puis déconnecter
      disconnectHandler('client namespace disconnect');

      expect(mockSocket.broadcast.emit).toHaveBeenCalledWith('user-disconnected', 'test-socket-id');
      expect(wsService.getConnectedUsersCount()).toBe(0);
    });
  });

  describe('Device Name Extraction', () => {
    it('should extract device name from user agent', () => {
      const testCases = [
        { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)', expected: 'Mobile' },
        { userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)', expected: 'Tablet' },
        { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', expected: 'Windows PC' },
        { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', expected: 'Mac' },
        { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', expected: 'Linux PC' },
        { userAgent: 'Unknown Browser', expected: 'Unknown Device' }
      ];

      testCases.forEach(({ userAgent, expected }) => {
        const mockSocketWithUA = {
          ...mockSocket,
          handshake: {
            ...mockSocket.handshake,
            headers: { 'user-agent': userAgent }
          }
        };

        connectionHandler(mockSocketWithUA);
        
        const users = wsService.getConnectedUsers();
        const user = users.find(u => u.id === mockSocketWithUA.id);
        expect(user?.deviceName).toBe(expected);
        
        // Nettoyer pour le test suivant - simuler la déconnexion
        disconnectHandler = mockSocketWithUA.on.mock.calls.find((call: any) => call[0] === 'disconnect')?.[1];
        if (disconnectHandler) {
          disconnectHandler('test');
        }
      });
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      connectionHandler(mockSocket);
    });

    it('should return connected users list', () => {
      const users = wsService.getConnectedUsers();
      
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        id: 'test-socket-id',
        deviceName: 'Windows PC',
        ipAddress: '192.168.1.100'
      });
    });

    it('should return connected users count', () => {
      expect(wsService.getConnectedUsersCount()).toBe(1);
    });

    it('should broadcast to all clients', () => {
      const testData = { message: 'test broadcast' };
      
      wsService.broadcastToAll('test-event', testData);
      
      expect(mockIo.emit).toHaveBeenCalledWith('test-event', testData);
    });

    it('should broadcast to others excluding specific socket', () => {
      const testData = { message: 'test broadcast to others' };
      
      wsService.broadcastToOthers('test-socket-id', 'test-event', testData);
      
      // Dans ce test, il n'y a qu'une socket, donc rien ne devrait être émis
      expect(mockSocket.emit).not.toHaveBeenCalledWith('test-event', testData);
    });
  });

  describe('Error Handling', () => {
    it('should handle socket errors gracefully', () => {
      connectionHandler(mockSocket);
      
      const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'error')?.[1];
      
      // Simuler une erreur - ne doit pas planter
      expect(() => {
        errorHandler(new Error('Socket error'));
      }).not.toThrow();
    });
  });

  describe('Cursor Position Updates', () => {
    beforeEach(() => {
      connectionHandler(mockSocket);
    });

    it('should update user cursor position in session', () => {
      const userCursorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'user-cursor')?.[1];
      
      const cursorPosition: CursorPosition = {
        x: 300,
        y: 400,
        elementId: 'element-123'
      };

      userCursorHandler(cursorPosition);

      const users = wsService.getConnectedUsers();
      const user = users.find(u => u.id === 'test-socket-id');
      
      expect(user?.cursor).toEqual(cursorPosition);
    });
  });
});