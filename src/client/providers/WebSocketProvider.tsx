import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useCanvasSync } from '../hooks/useCanvasSync';

interface WebSocketContextType {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
  socketId: string | undefined;
  connectedUsers: any[];
  reconnectionAttempt: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const webSocketState = useWebSocket(true); // Auto-connect
  
  // Activer la synchronisation automatique du canvas
  useCanvasSync();

  return (
    <WebSocketContext.Provider value={webSocketState}>
      {children}
    </WebSocketContext.Provider>
  );
};