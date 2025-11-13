/**
 * Mock pour socket.io-client utilisé dans les tests
 */

export interface MockSocket {
  id: string;
  connected: boolean;
  on: jest.Mock;
  off: jest.Mock;
  emit: jest.Mock;
  disconnect: jest.Mock;
  connect: jest.Mock;
}

export interface MockSocketIO {
  (url: string, options?: any): MockSocket;
}

// Mock de la socket
const createMockSocket = (): MockSocket => ({
  id: 'mock-socket-id',
  connected: false,
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
  connect: jest.fn()
});

let mockSocket: MockSocket | null = null;

// Mock de la fonction io
const mockIo: MockSocketIO = jest.fn((url: string, options?: any) => {
  if (!mockSocket) {
    mockSocket = createMockSocket();
  }
  return mockSocket;
});

// Utilitaires pour les tests
export const getMockSocket = (): MockSocket | null => mockSocket;

export const simulateConnect = () => {
  if (mockSocket) {
    mockSocket.connected = true;
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
    if (connectHandler) {
      connectHandler();
    }
  }
};

export const simulateDisconnect = (reason = 'transport close') => {
  if (mockSocket) {
    mockSocket.connected = false;
    const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')?.[1];
    if (disconnectHandler) {
      disconnectHandler(reason);
    }
  }
};

export const simulateError = (error: Error) => {
  if (mockSocket) {
    const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')?.[1];
    if (errorHandler) {
      errorHandler(error);
    }
  }
};

export const simulateEvent = (event: string, data: any) => {
  if (mockSocket) {
    const eventHandler = mockSocket.on.mock.calls.find(call => call[0] === event)?.[1];
    if (eventHandler) {
      eventHandler(data);
    }
  }
};

export const resetMocks = () => {
  mockSocket = null;
  (mockIo as jest.Mock).mockClear();
};

export const io = mockIo;
export { mockSocket as Socket };