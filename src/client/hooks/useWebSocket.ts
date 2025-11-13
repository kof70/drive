import { useEffect, useRef, useState, useCallback } from 'react';
import { wsManager, WebSocketEvents } from '../services/websocket-manager';
import { UserSession } from '../../shared/types';

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
 */
export function useWebSocket(autoConnect = true): UseWebSocketReturn {
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [connectedUsers, setConnectedUsers] = useState<UserSession[]>([]);
    const [reconnectionAttempt, setReconnectionAttempt] = useState(0);
    const mountedRef = useRef(true);

    // Fonction de connexion
    const connect = useCallback(async () => {
        if (connecting || connected) return;

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
                setConnectedUsers(users);
            }
        };

        const handleUserConnected = (user: UserSession) => {
            if (mountedRef.current) {
                setConnectedUsers(prev => [...prev, user]);
            }
        };

        const handleUserDisconnected = (sessionId: string) => {
            if (mountedRef.current) {
                setConnectedUsers(prev => prev.filter(user => user.id !== sessionId));
            }
        };

        // Enregistrer les écouteurs
        wsManager.on('connected', handleConnected);
        wsManager.on('disconnected', handleDisconnected);
        wsManager.on('reconnecting', handleReconnecting);
        wsManager.on('reconnected', handleReconnected);
        wsManager.on('error', handleError);
        wsManager.on('users-list', handleUsersList);
        wsManager.on('user-connected', handleUserConnected);
        wsManager.on('user-disconnected', handleUserDisconnected);

        // Connexion automatique si demandée
        if (autoConnect && !wsManager.connected) {
            connect();
        }

        // Nettoyage
        return () => {
            mountedRef.current = false;
            wsManager.off('connected', handleConnected);
            wsManager.off('disconnected', handleDisconnected);
            wsManager.off('reconnecting', handleReconnecting);
            wsManager.off('reconnected', handleReconnected);
            wsManager.off('error', handleError);
            wsManager.off('users-list', handleUsersList);
            wsManager.off('user-connected', handleUserConnected);
            wsManager.off('user-disconnected', handleUserDisconnected);
        };
    }, [autoConnect, connect]);

    return {
        connected,
        connecting,
        error,
        socketId: wsManager.socketId,
        connectedUsers,
        reconnectionAttempt,
        connect,
        disconnect,
        emit
    };
}

/**
 * Hook pour écouter des événements WebSocket spécifiques
 */
export function useWebSocketEvent<K extends keyof WebSocketEvents>(
    event: K,
    handler: WebSocketEvents[K],
    deps: React.DependencyList = []
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

    const emitDebounced = useCallback((
        event: string,
        data?: any,
        delay = 100
    ) => {
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
    }, []);

    // Nettoyage des timeouts au démontage
    useEffect(() => {
        return () => {
            emitTimeouts.current.forEach(timeout => clearTimeout(timeout));
            emitTimeouts.current.clear();
        };
    }, []);

    return { emit, emitDebounced };
}