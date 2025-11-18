import React, { createContext, useContext, ReactNode } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { useCanvasSync } from "../hooks/useCanvasSync";

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

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider",
    );
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
  onError?: (error: Error) => void; // Ajout d'un callback d'erreur
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  onError,
}) => {
  const webSocketState = useWebSocket(true); // Auto-connect
  React.useEffect(() => {
    console.log("WebSocketProvider MONTÉ");
    return () => {
      console.log("WebSocketProvider DÉMONTÉ");
    };
  }, []);
  // Gestion d'erreur globale
  React.useEffect(() => {
    if (webSocketState.error && onError) {
      onError(webSocketState.error);
    }
  }, [webSocketState.error, onError]);

  // Activer la synchronisation automatique du canvas
  useCanvasSync();

  return (
    <WebSocketContext.Provider value={webSocketState}>
      {!webSocketState.connected && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white p-2 text-center z-50">
          Déconnecté du serveur WebSocket
        </div>
      )}
      {children}
    </WebSocketContext.Provider>
  );
};
