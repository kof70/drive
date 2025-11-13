/**
 * Tests unitaires pour le hook useWebSocket
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useWebSocket, useWebSocketEvent, useWebSocketEmit } from '../useWebSocket';
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

describe('useWebSocket', () => {
    beforeEach(() => {
        resetMocks();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    describe('Connection Management', () => {
        it('should initialize with correct default state', () => {
            const { result } = renderHook(() => useWebSocket(false));

            expect(result.current.connected).toBe(false);
            expect(result.current.connecting).toBe(false);
            expect(result.current.error).toBe(null);
            expect(result.current.socketId).toBeUndefined();
            expect(result.current.connectedUsers).toEqual([]);
            expect(result.current.reconnectionAttempt).toBe(0);
        });

        it('should auto-connect when autoConnect is true', async () => {
            const { result } = renderHook(() => useWebSocket(true));

            expect(result.current.connecting).toBe(true);

            // Simuler la connexion
            await act(async () => {
                simulateConnect();
            });

            expect(result.current.connected).toBe(true);
            expect(result.current.connecting).toBe(false);
            expect(result.current.socketId).toBe('mock-socket-id');
        });

        it('should not auto-connect when autoConnect is false', () => {
            const { result } = renderHook(() => useWebSocket(false));

            expect(result.current.connecting).toBe(false);
            expect(result.current.connected).toBe(false);
        });

        it('should handle manual connection', async () => {
            const { result } = renderHook(() => useWebSocket(false));

            await act(async () => {
                const connectPromise = result.current.connect();
                simulateConnect();
                await connectPromise;
            });

            expect(result.current.connected).toBe(true);
            expect(result.current.connecting).toBe(false);
        });

        it('should handle connection errors', async () => {
            const { result } = renderHook(() => useWebSocket(false));

            await act(async () => {
                const connectPromise = result.current.connect();
                const error = new Error('Connection failed');
                simulateError(error);

                try {
                    await connectPromise;
                } catch (e) {
                    // Expected error
                }
            });

            expect(result.current.connected).toBe(false);
            expect(result.current.connecting).toBe(false);
            expect(result.current.error).toEqual(expect.objectContaining({
                message: 'Connection failed'
            }));
        });

        it('should handle disconnection', async () => {
            const { result } = renderHook(() => useWebSocket(false));

            // Connecter d'abord
            await act(async () => {
                const connectPromise = result.current.connect();
                simulateConnect();
                await connectPromise;
            });

            expect(result.current.connected).toBe(true);

            // Déconnecter
            act(() => {
                simulateDisconnect('transport close');
            });

            expect(result.current.connected).toBe(false);
        });

        it('should handle manual disconnection', async () => {
            const { result } = renderHook(() => useWebSocket(false));

            // Connecter d'abord
            await act(async () => {
                const connectPromise = result.current.connect();
                simulateConnect();
                await connectPromise;
            });

            // Déconnecter manuellement
            act(() => {
                result.current.disconnect();
            });

            const mockSocket = getMockSocket();
            expect(mockSocket?.disconnect).toHaveBeenCalled();
        });
    });

    describe('User Management', () => {
        it('should handle users list updates', async () => {
            const { result } = renderHook(() => useWebSocket(false));

            await act(async () => {
                const connectPromise = result.current.connect();
                simulateConnect();
                await connectPromise;
            });

            const testUsers = [
                { id: 'user1', deviceName: 'PC', ipAddress: '192.168.1.1', userAgent: 'Chrome', connectedAt: new Date() },
                { id: 'user2', deviceName: 'Mobile', ipAddress: '192.168.1.2', userAgent: 'Safari', connectedAt: new Date() }
            ];

            act(() => {
                simulateEvent('users-list', testUsers);
            });

            expect(result.current.connectedUsers).toEqual(testUsers);
        });

        it('should handle user connection events', async () => {
            const { result } = renderHook(() => useWebSocket(false));

            await act(async () => {
                const connectPromise = result.current.connect();
                simulateConnect();
                await connectPromise;
            });

            const newUser = {
                id: 'new-user',
                deviceName: 'Tablet',
                ipAddress: '192.168.1.3',
                userAgent: 'iPad',
                connectedAt: new Date()
            };

            act(() => {
                simulateEvent('user-connected', newUser);
            });

            expect(result.current.connectedUsers).toContain(newUser);
        });

        it('should handle user disconnection events', async () => {
            const { result } = renderHook(() => useWebSocket(false));

            await act(async () => {
                const connectPromise = result.current.connect();
                simulateConnect();
                await connectPromise;
            });

            // Ajouter des utilisateurs d'abord
            const users = [
                { id: 'user1', deviceName: 'PC', ipAddress: '192.168.1.1', userAgent: 'Chrome', connectedAt: new Date() },
                { id: 'user2', deviceName: 'Mobile', ipAddress: '192.168.1.2', userAgent: 'Safari', connectedAt: new Date() }
            ];

            act(() => {
                simulateEvent('users-list', users);
            });

            // Déconnecter un utilisateur
            act(() => {
                simulateEvent('user-disconnected', 'user1');
            });

            expect(result.current.connectedUsers).toHaveLength(1);
            expect(result.current.connectedUsers[0].id).toBe('user2');
        });
    });

    describe('Reconnection Handling', () => {
        it('should handle reconnection attempts', async () => {
            const { result } = renderHook(() => useWebSocket(false));

            await act(async () => {
                const connectPromise = result.current.connect();
                simulateConnect();
                await connectPromise;
            });

            // Simuler une tentative de reconnexion
            act(() => {
                simulateEvent('reconnecting', 2);
            });

            expect(result.current.reconnectionAttempt).toBe(2);
            expect(result.current.connecting).toBe(true);
        });

        it('should reset reconnection attempt on successful reconnection', async () => {
            const { result } = renderHook(() => useWebSocket(false));

            await act(async () => {
                const connectPromise = result.current.connect();
                simulateConnect();
                await connectPromise;
            });

            // Simuler une tentative de reconnexion
            act(() => {
                simulateEvent('reconnecting', 3);
            });

            expect(result.current.reconnectionAttempt).toBe(3);

            // Simuler une reconnexion réussie
            act(() => {
                simulateEvent('reconnected');
            });

            expect(result.current.reconnectionAttempt).toBe(0);
            expect(result.current.connected).toBe(true);
            expect(result.current.connecting).toBe(false);
        });
    });

    describe('Message Emission', () => {
        it('should emit messages through the hook', async () => {
            const { result } = renderHook(() => useWebSocket(false));

            await act(async () => {
                const connectPromise = result.current.connect();
                simulateConnect();
                await connectPromise;
            });

            act(() => {
                result.current.emit('test-event', { data: 'test' });
            });

            const mockSocket = getMockSocket();
            expect(mockSocket?.emit).toHaveBeenCalledWith('test-event', { data: 'test' });
        });
    });

    describe('Cleanup', () => {
        it('should cleanup event listeners on unmount', async () => {
            const { result, unmount } = renderHook(() => useWebSocket(false));

            await act(async () => {
                const connectPromise = result.current.connect();
                simulateConnect();
                await connectPromise;
            });

            const mockSocket = getMockSocket();
            const offCallCount = mockSocket?.off.mock.calls.length || 0;

            unmount();

            // Vérifier que off a été appelé pour nettoyer les écouteurs
            expect(mockSocket?.off.mock.calls.length || 0).toBeGreaterThan(offCallCount);
        });
    });
});

describe('useWebSocketEvent', () => {
    beforeEach(() => {
        resetMocks();
        jest.clearAllMocks();
    });

    it('should register event listener', () => {
        const handler = jest.fn();

        renderHook(() => useWebSocketEvent('canvas-update', handler));

        // Simuler l'événement
        act(() => {
            simulateEvent('canvas-update', { test: 'data' });
        });

        expect(handler).toHaveBeenCalledWith({ test: 'data' });
    });

    it('should cleanup event listener on unmount', () => {
        const handler = jest.fn();

        const { unmount } = renderHook(() => useWebSocketEvent('canvas-update', handler));

        unmount();

        // Simuler l'événement après unmount
        act(() => {
            simulateEvent('canvas-update', { test: 'data' });
        });

        expect(handler).not.toHaveBeenCalled();
    });

    it('should update handler when dependencies change', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();

        const { rerender } = renderHook(
            ({ handler }) => useWebSocketEvent('canvas-update', handler, [handler]),
            { initialProps: { handler: handler1 } }
        );

        // Simuler l'événement avec le premier handler
        act(() => {
            simulateEvent('canvas-update', { test: 'data1' });
        });

        expect(handler1).toHaveBeenCalledWith({ test: 'data1' });

        // Changer le handler
        rerender({ handler: handler2 });

        // Simuler l'événement avec le nouveau handler
        act(() => {
            simulateEvent('canvas-update', { test: 'data2' });
        });

        expect(handler2).toHaveBeenCalledWith({ test: 'data2' });
    });
});

describe('useWebSocketEmit', () => {
    beforeEach(() => {
        resetMocks();
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should emit messages immediately', () => {
        const { result } = renderHook(() => useWebSocketEmit());

        act(() => {
            result.current.emit('test-event', { data: 'test' });
        });

        const mockSocket = getMockSocket();
        expect(mockSocket?.emit).toHaveBeenCalledWith('test-event', { data: 'test' });
    });

    it('should debounce messages', () => {
        const { result } = renderHook(() => useWebSocketEmit());

        act(() => {
            result.current.emitDebounced('test-event', { data: 'test1' }, 100);
            result.current.emitDebounced('test-event', { data: 'test2' }, 100);
            result.current.emitDebounced('test-event', { data: 'test3' }, 100);
        });

        const mockSocket = getMockSocket();

        // Aucun message ne doit être émis immédiatement
        expect(mockSocket?.emit).not.toHaveBeenCalled();

        // Avancer le temps
        act(() => {
            jest.advanceTimersByTime(100);
        });

        // Seul le dernier message doit être émis
        expect(mockSocket?.emit).toHaveBeenCalledTimes(1);
        expect(mockSocket?.emit).toHaveBeenCalledWith('test-event', { data: 'test3' });
    });

    it('should cleanup timeouts on unmount', () => {
        const { result, unmount } = renderHook(() => useWebSocketEmit());

        act(() => {
            result.current.emitDebounced('test-event', { data: 'test' }, 100);
        });

        unmount();

        // Avancer le temps après unmount
        act(() => {
            jest.advanceTimersByTime(100);
        });

        const mockSocket = getMockSocket();
        expect(mockSocket?.emit).not.toHaveBeenCalled();
    });
});