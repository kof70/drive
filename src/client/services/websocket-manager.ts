import { io, Socket } from "socket.io-client";
import {
  CanvasElement,
  ClipboardData,
  CursorPosition,
  UserSession,
} from "../../shared/types";

export interface WebSocketManagerConfig {
  serverUrl: string;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  maxReconnectionDelay: number;
  timeout: number;
}

export interface WebSocketEvents {
  // Événements entrants du serveur
  "canvas-update": (data: CanvasElement) => void;
  "canvas-state-sync": (elements: CanvasElement[]) => void;
  "canvas-element-add": (element: CanvasElement) => void;
  "canvas-element-remove": (elementId: string) => void;
  "clipboard-sync": (data: ClipboardData) => void;
  "user-cursor": (data: { userId: string; position: CursorPosition }) => void;
  "file-upload": (data: any) => void;
  "user-connected": (session: UserSession) => void;
  "user-disconnected": (sessionId: string) => void;
  "users-list": (users: UserSession[]) => void;

  // Événements de connexion
  connected: () => void;
  disconnected: (reason: string) => void;
  reconnecting: (attempt: number) => void;
  reconnected: () => void;
  error: (error: Error) => void;
}

export class WebSocketManager {
  private socket: Socket | null = null;
  private config: WebSocketManagerConfig;
  private eventListeners: Map<keyof WebSocketEvents, Set<Function>> = new Map();
  private messageQueue: Array<{ event: string; data: any }> = [];
  private isConnected = false;
  private reconnectionAttempt = 0;
  private reconnectionTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<WebSocketManagerConfig> = {}) {
    // Utiliser l'URL actuelle du navigateur pour le WebSocket
    const defaultServerUrl =
      typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.host}`
        : "http://localhost:8080";

    this.config = {
      serverUrl: defaultServerUrl,
      reconnectionAttempts: Infinity, // Reconnexion infinie
      reconnectionDelay: 1000,
      maxReconnectionDelay: 30000,
      timeout: 20000,
      ...config,
    };
  }

  /**
   * Établit la connexion WebSocket
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      console.log(`🔌 Connexion à ${this.config.serverUrl}...`);

      this.socket = io(this.config.serverUrl, {
        transports: ["websocket", "polling"],
        timeout: this.config.timeout,
        reconnection: true, // Activer la reconnexion automatique de Socket.io
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        autoConnect: true,
      });

      // Gestionnaire de connexion réussie
      this.socket.on("connect", () => {
        const isReconnection = this.reconnectionAttempt > 0;
        console.log(
          isReconnection
            ? "✅ Reconnexion WebSocket réussie"
            : "✅ Connexion WebSocket établie",
        );
        this.isConnected = true;

        // Ajoute ce log pour diagnostiquer le flush
        console.log("[WS CLIENT] Appel à flushMessageQueue après connexion");

        // Vider la file d'attente des messages
        this.flushMessageQueue();

        // Si c'est une reconnexion, demander l'état actuel du canvas
        if (isReconnection) {
          console.log("🔄 Demande de synchronisation de l'état du canvas...");
          this.socket?.emit("request-canvas-state");
          this.emit("reconnected");
        }

        this.reconnectionAttempt = 0;

        // Émettre l'événement de connexion
        this.emit("connected");
        resolve();
      });

      // Gestionnaire de déconnexion
      this.socket.on("disconnect", (reason) => {
        console.log(`🔌 Déconnexion WebSocket: ${reason}`);
        this.isConnected = false;
        this.emit("disconnected", reason);

        // Socket.io gère automatiquement la reconnexion
        // On n'a plus besoin de startReconnection() manuel
      });

      // Gestionnaire de tentative de reconnexion (natif Socket.io)
      this.socket.io.on("reconnect_attempt", (attempt) => {
        this.reconnectionAttempt = attempt;
        console.log(`🔄 Tentative de reconnexion ${attempt}...`);
        this.emit("reconnecting", attempt);
      });

      // Gestionnaire d'erreur de reconnexion
      this.socket.io.on("reconnect_error", (error) => {
        console.error("❌ Erreur de reconnexion:", error);
      });

      // Gestionnaire d'échec de reconnexion
      this.socket.io.on("reconnect_failed", () => {
        console.error("❌ Échec de toutes les tentatives de reconnexion");
      });

      // Gestionnaire d'erreurs
      this.socket.on("connect_error", (error) => {
        console.error("❌ Erreur de connexion WebSocket:", error);
        this.emit("error", error);

        if (!this.isConnected) {
          reject(error);
        }
      });

      // Gestionnaires des événements métier
      this.setupBusinessEventHandlers();
    });
  }

  /**
   * Ferme la connexion WebSocket
   */
  public disconnect(): void {
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    console.log("🔌 Connexion WebSocket fermée");
  }

  /**
   * Envoie un message au serveur
   */
  public send(event: string, data?: any): void {
    console.log(`[WS CLIENT] Envoi event: ${event}`, data); // <-- log ajouté
    if (this.isConnected && this.socket) {
      this.socket.emit(event, data);
    } else {
      // Ajouter à la file d'attente si pas connecté
      this.messageQueue.push({ event, data });
      console.log(`📤 Message mis en file d'attente: ${event}`);
    }
  }

  /**
   * Écoute un événement
   */
  public on<K extends keyof WebSocketEvents>(
    event: K,
    listener: WebSocketEvents[K],
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * Supprime un écouteur d'événement
   */
  public off<K extends keyof WebSocketEvents>(
    event: K,
    listener: WebSocketEvents[K],
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Supprime tous les écouteurs d'un événement
   */
  public removeAllListeners<K extends keyof WebSocketEvents>(event?: K): void {
    if (event) {
      this.eventListeners.delete(event);
    } else {
      this.eventListeners.clear();
    }
  }

  /**
   * Retourne l'état de la connexion
   */
  public get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Retourne l'ID de la socket
   */
  public get socketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * Configure les gestionnaires d'événements métier
   */
  private setupBusinessEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("canvas-update", (data: CanvasElement) => {
      this.emit("canvas-update", data);
    });

    this.socket.on("clipboard-sync", (data: ClipboardData) => {
      this.emit("clipboard-sync", data);
    });

    this.socket.on(
      "user-cursor",
      (data: { userId: string; position: CursorPosition }) => {
        this.emit("user-cursor", data);
      },
    );

    this.socket.on("file-upload", (data: any) => {
      this.emit("file-upload", data);
    });

    this.socket.on("user-connected", (session: UserSession) => {
      this.emit("user-connected", session);
    });

    this.socket.on("user-disconnected", (sessionId: string) => {
      this.emit("user-disconnected", sessionId);
    });

    this.socket.on("users-list", (users: UserSession[]) => {
      this.emit("users-list", users);
    });

    this.socket.on("canvas-state-sync", (elements: CanvasElement[]) => {
      this.emit("canvas-state-sync", elements);
    });

    this.socket.on("canvas-element-add", (element: CanvasElement) => {
      this.emit("canvas-element-add", element);
    });

    this.socket.on("canvas-element-remove", (elementId: string) => {
      this.emit("canvas-element-remove", elementId);
    });
  }

  /**
   * Émet un événement vers les écouteurs locaux
   */
  private emit<K extends keyof WebSocketEvents>(
    event: K,
    ...args: Parameters<WebSocketEvents[K]>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          (listener as any)(...args);
        } catch (error) {
          console.error(`Erreur dans l'écouteur ${event}:`, error);
        }
      });
    }
  }

  /**
   * Vide la file d'attente des messages
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length > 0) {
      console.log(
        `[WS CLIENT] Envoi de ${this.messageQueue.length} messages en attente`,
      );

      this.messageQueue.forEach(({ event, data }) => {
        if (this.socket) {
          console.log(`[WS CLIENT] Flushing event: ${event}`, data); // <-- log ajouté
          this.socket.emit(event, data);
        }
      });

      this.messageQueue = [];
    }
  }

  /**
   * Démarre le processus de reconnexion automatique
   * Note: Cette méthode n'est plus utilisée car Socket.io gère la reconnexion automatiquement
   * @deprecated
   */
  private startReconnection(): void {
    // Socket.io gère maintenant la reconnexion automatiquement
    // Cette méthode est conservée pour compatibilité mais n'est plus appelée
  }
}

// Détection dynamique de l'URL du backend WebSocket (toujours sur le port 8080)
const wsPort = 8080;
const wsHost =
  typeof window !== "undefined" ? window.location.hostname : "localhost";
const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
export const wsManager = new WebSocketManager({
  serverUrl: `${wsProtocol}//${wsHost}:${wsPort}`,
});
