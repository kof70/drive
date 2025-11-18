import { useEffect, useRef, useState, useCallback } from "react";
import { wsManager, WebSocketEvents } from "../services/websocket-manager";
import { UserSession } from "../../shared/types";

// Flag global pour empêcher plusieurs connexions WebSocket dans le même onglet
let hasConnectedOnce = false;

export interface UseWebSocketReturn {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
  socketId: string | undefined;
  connectedUsers: UserSession[];
  reconnectionAttempt: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
}

/**
 * Hook React pour gérer la connexion WebSocket
 * Ajout de logs pour traquer chaque montage, appel à connect, et démontage.
 */
export function useWebSocket(autoConnect = true): UseWebSocketReturn {
  console.log("[useWebSocket] MONTAGE du hook");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<UserSession[]>([]);
  const [reconnectionAttempt, setReconnectionAttempt] = useState(0);
  const mountedRef = useRef(true);

  // Protection stricte contre les connexions multiples
  const hasAttemptedConnect = useRef(false);

  // Fonction de connexion
  const connect = useCallback(async () => {
    console.log("[useWebSocket] Appel à connect()");
    if (
      connecting ||
      connected ||
      hasAttemptedConnect.current ||
      hasConnectedOnce
    )
      return;
    hasAttemptedConnect.current = true;
    hasConnectedOnce = true;
    console.log("[useWebSocket] wsManager.connect() appelé");
    setConnecting(true);
    setError(null);
    try {
      await wsManager.connect();
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setConnecting(false);
      }
    }
  }, [connecting, connected]);

  // Fonction de déconnexion
  const disconnect = useCallback(() => {
    wsManager.disconnect();
  }, []);

  // Fonction d'émission
  const emit = useCallback((event: string, data?: any) => {
    wsManager.send(event, data);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Gestionnaires d'événements
    const handleConnected = () => {
      if (mountedRef.current) {
        setConnected(true);
        setConnecting(false);
        setError(null);
        setReconnectionAttempt(0);
      }
    };

    const handleDisconnected = (reason: string) => {
      if (mountedRef.current) {
        setConnected(false);
        setConnecting(false);
        console.log(`Déconnecté: ${reason}`);
      }
    };

    const handleReconnecting = (attempt: number) => {
      if (mountedRef.current) {
        setReconnectionAttempt(attempt);
        setConnecting(true);
      }
    };

    const handleReconnected = () => {
      if (mountedRef.current) {
        setConnected(true);
        setConnecting(false);
        setReconnectionAttempt(0);
      }
    };

    const handleError = (err: Error) => {
      if (mountedRef.current) {
        setError(err);
        setConnecting(false);
      }
    };

    const handleUsersList = (users: UserSession[]) => {
      if (mountedRef.current) {
        // Déduplication par id
        const uniqueUsers = Array.from(
          new Map(users.map((u) => [u.id, u])).values(),
        );
        setConnectedUsers(uniqueUsers);
      }
    };

    const handleUserConnected = (user: UserSession) => {
      if (mountedRef.current) {
        setConnectedUsers((prev) =>
          prev.some((u) => u.id === user.id) ? prev : [...prev, user],
        );
      }
    };

    const handleUserDisconnected = (sessionId: string) => {
      if (mountedRef.current) {
        setConnectedUsers((prev) =>
          prev.filter((user) => user.id !== sessionId),
        );
      }
    };

    // Gestionnaires d'événements canvas
    const handleCanvasUpdate = (element: any) => {
      console.log("[WebSocket] canvas-update reçu", element);
      // TODO: synchroniser le store ici
    };
    const handleCanvasElementAdd = (element: any) => {
      console.log("[WebSocket] canvas-element-add reçu", element);
      // TODO: ajouter l'élément au store ici
    };
    const handleCanvasElementRemove = (elementId: string) => {
      console.log("[WebSocket] canvas-element-remove reçu", elementId);
      // TODO: retirer l'élément du store ici
    };

    // Synchronisation du curseur utilisateur
    const handleUserCursor = ({
      userId,
      position,
    }: {
      userId: string;
      position: { x: number; y: number };
    }) => {
      setConnectedUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, cursor: position } : user,
        ),
      );
    };

    // Enregistrer les écouteurs
    wsManager.on("connected", handleConnected);
    wsManager.on("disconnected", handleDisconnected);
    wsManager.on("reconnecting", handleReconnecting);
    wsManager.on("reconnected", handleReconnected);
    wsManager.on("error", handleError);
    wsManager.on("users-list", handleUsersList);
    wsManager.on("user-connected", handleUserConnected);
    wsManager.on("user-disconnected", handleUserDisconnected);
    wsManager.on("canvas-update", handleCanvasUpdate);
    wsManager.on("canvas-element-add", handleCanvasElementAdd);
    wsManager.on("canvas-element-remove", handleCanvasElementRemove);
    wsManager.on("user-cursor", handleUserCursor);

    // Connexion automatique si demandée
    if (autoConnect && !wsManager.connected) {
      connect();
    }

    // Nettoyage
    return () => {
      console.log("[useWebSocket] DÉMONTAGE du hook");
      mountedRef.current = false;
      wsManager.off("connected", handleConnected);
      wsManager.off("disconnected", handleDisconnected);
      wsManager.off("reconnecting", handleReconnecting);
      wsManager.off("reconnected", handleReconnected);
      wsManager.off("error", handleError);
      wsManager.off("users-list", handleUsersList);
      wsManager.off("user-connected", handleUserConnected);
      wsManager.off("user-disconnected", handleUserDisconnected);
      wsManager.off("canvas-update", handleCanvasUpdate);
      wsManager.off("canvas-element-add", handleCanvasElementAdd);
      wsManager.off("canvas-element-remove", handleCanvasElementRemove);
      wsManager.off("user-cursor", handleUserCursor);
      // wsManager.disconnect(); // Retiré pour éviter la fermeture immédiate de la connexion WebSocket
    };
  }, [autoConnect, connect]);

  // Hook pour logger les erreurs WebSocket
  useWebSocketErrorLogger({
    connected,
    connecting,
    error,
    socketId: wsManager.socketId,
    connectedUsers,
    reconnectionAttempt,
    connect,
    disconnect,
    emit,
  });

  return {
    connected,
    connecting,
    error,
    socketId: wsManager.socketId,
    connectedUsers,
    reconnectionAttempt,
    connect,
    disconnect,
    emit,
  };
}

/**
 * Hook pour écouter des événements WebSocket spécifiques
 */
export function useWebSocketEvent<K extends keyof WebSocketEvents>(
  event: K,
  handler: WebSocketEvents[K],
  deps: React.DependencyList = [],
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const wrappedHandler = (...args: any[]) => {
      (handlerRef.current as any)(...args);
    };

    wsManager.on(event, wrappedHandler as WebSocketEvents[K]);

    return () => {
      wsManager.off(event, wrappedHandler as WebSocketEvents[K]);
    };
  }, [event, ...deps]);
}

/**
 * Hook pour émettre des événements WebSocket avec debouncing
 */
export function useWebSocketEmit() {
  const emitTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const emit = useCallback((event: string, data?: any) => {
    wsManager.send(event, data);
  }, []);

  const emitDebounced = useCallback(
    (event: string, data?: any, delay = 100) => {
      // Annuler le timeout précédent pour cet événement
      const existingTimeout = emitTimeouts.current.get(event);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Créer un nouveau timeout
      const timeout = setTimeout(() => {
        wsManager.send(event, data);
        emitTimeouts.current.delete(event);
      }, delay);

      emitTimeouts.current.set(event, timeout);
    },
    [],
  );

  // Nettoyage des timeouts au démontage
  useEffect(() => {
    return () => {
      emitTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      emitTimeouts.current.clear();
    };
  }, []);

  return { emit, emitDebounced };
}

/**
 * Hook pour logger les erreurs WebSocket
 */
export function useWebSocketErrorLogger(ws: UseWebSocketReturn) {
  useEffect(() => {
    if (ws.error) {
      // Ici tu peux afficher une notification ou logger
      console.error("WebSocket error:", ws.error);
    }
  }, [ws.error]);
}
