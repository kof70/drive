import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import {
  UserSession,
  CursorPosition,
  CanvasElement,
  ClipboardData,
} from "../../shared/types";
import { logger } from "../utils/logger";
import { DatabaseService } from "./database";

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, UserSession> = new Map();
  private canvasState: Map<string, CanvasElement> = new Map(); // État partagé du canvas
  private db: DatabaseService;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor(httpServer: HttpServer, db: DatabaseService) {
    this.db = db;
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
      // Configuration de reconnexion améliorée
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 45000,
    });

    // Charger l'état initial depuis la base de données
    this.loadCanvasStateFromDatabase();

    this.setupEventHandlers();

    // Démarrer l'auto-save toutes les 30 secondes
    this.startAutoSave();
  }

  /**
   * Charge l'état du canvas depuis la base de données
   */
  private loadCanvasStateFromDatabase(): void {
    const elements = this.db.getAllElements();
    this.canvasState.clear();

    elements.forEach((element) => {
      this.canvasState.set(element.id, element);
    });

    logger.info(
      `💾 ${elements.length} éléments chargés depuis la base de données`,
    );
  }

  /**
   * Démarre l'auto-save périodique
   */
  private startAutoSave(): void {
    // Auto-save toutes les 30 secondes
    this.autoSaveInterval = setInterval(() => {
      this.saveCanvasStateToDatabase();
    }, 30000);

    logger.info("⏰ Auto-save activé (toutes les 30 secondes)");
  }

  /**
   * Sauvegarde l'état du canvas dans la base de données
   */
  private saveCanvasStateToDatabase(): void {
    const elements = Array.from(this.canvasState.values());
    if (elements.length > 0) {
      this.db.saveElements(elements);
      logger.debug(`💾 Auto-save: ${elements.length} éléments sauvegardés`);
    }
  }

  /**
   * Arrête l'auto-save
   */
  public stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      logger.info("⏰ Auto-save arrêté");
    }
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket) => {
      logger.info(`🔌 Nouvelle connexion WebSocket: ${socket.id}`);

      // Créer une session utilisateur
      const userSession: UserSession = {
        id: socket.id,
        deviceName: this.extractDeviceName(
          socket.handshake.headers["user-agent"] || "",
        ),
        ipAddress: socket.handshake.address,
        userAgent: socket.handshake.headers["user-agent"] || "",
        connectedAt: new Date(),
      };

      this.connectedUsers.set(socket.id, userSession);

      logger.info(`👥 Utilisateurs connectés: ${this.connectedUsers.size}`);

      // Notifier les autres utilisateurs de la nouvelle connexion
      socket.broadcast.emit("user-connected", userSession);

      // Envoyer la liste des utilisateurs connectés au nouveau client
      socket.emit("users-list", Array.from(this.connectedUsers.values()));

      // IMPORTANT : Envoyer l'état actuel du canvas au nouveau client
      const currentCanvasState = Array.from(this.canvasState.values());
      socket.emit("canvas-state-sync", currentCanvasState);
      logger.info(
        `📊 État du canvas synchronisé avec ${socket.id}: ${currentCanvasState.length} éléments`,
      );

      // Gestionnaire pour les mises à jour du canvas
      socket.on("canvas-update", (data: CanvasElement) => {
        logger.info(
          `📝 [INFO] Mise à jour canvas de ${socket.id}: ${data.type} ${data.id}`,
        );

        // Mettre à jour l'état partagé du serveur
        this.canvasState.set(data.id, data);

        // Sauvegarder immédiatement dans la base de données
        this.db.saveElement(data);

        // Propager à tous les autres clients
        socket.broadcast.emit("canvas-update", data);
      });

      // Gestionnaire pour l'ajout d'éléments
      socket.on("canvas-element-add", (data: CanvasElement) => {
        logger.debug(
          `➕ Ajout élément canvas de ${socket.id}: ${data.type} ${data.id}`,
        );

        // Ajouter à l'état partagé
        this.canvasState.set(data.id, data);

        // Sauvegarder immédiatement dans la base de données
        this.db.saveElement(data);

        // Propager à tous les autres clients
        socket.broadcast.emit("canvas-element-add", data);
      });

      // Gestionnaire pour la suppression d'éléments
      socket.on("canvas-element-remove", (elementId: string) => {
        logger.debug(
          `➖ Suppression élément canvas de ${socket.id}: ${elementId}`,
        );

        // Supprimer de l'état partagé
        this.canvasState.delete(elementId);

        // Supprimer de la base de données
        this.db.deleteElement(elementId);

        // Propager à tous les autres clients
        socket.broadcast.emit("canvas-element-remove", elementId);
      });

      // Gestionnaire pour demander l'état complet du canvas
      socket.on("request-canvas-state", () => {
        const currentCanvasState = Array.from(this.canvasState.values());
        socket.emit("canvas-state-sync", currentCanvasState);
        logger.debug(
          `📊 État du canvas envoyé à ${socket.id}: ${currentCanvasState.length} éléments`,
        );
      });

      // Gestionnaire pour la synchronisation du presse-papiers
      socket.on("clipboard-sync", (data: ClipboardData) => {
        logger.debug(`📋 Sync presse-papiers de ${socket.id}`);
        // Propager à tous les autres clients
        socket.broadcast.emit("clipboard-sync", data);
      });

      // Gestionnaire pour les positions de curseur
      socket.on("user-cursor", (position: CursorPosition) => {
        // Mettre à jour la position du curseur dans la session
        const session = this.connectedUsers.get(socket.id);
        if (session) {
          session.cursor = position;
          this.connectedUsers.set(socket.id, session);
        }

        // Propager la position aux autres clients
        socket.broadcast.emit("user-cursor", {
          userId: socket.id,
          position,
        });
      });

      // Gestionnaire pour les uploads de fichiers
      socket.on("file-upload", (fileData: any) => {
        logger.info(`📁 Upload fichier de ${socket.id}: ${fileData.filename}`);
        // Propager aux autres clients
        socket.broadcast.emit("file-upload", fileData);
      });

      // Gestionnaire de déconnexion
      socket.on("disconnect", (reason) => {
        logger.info(`🔌 Déconnexion WebSocket: ${socket.id} (${reason})`);

        // Supprimer l'utilisateur de la liste
        this.connectedUsers.delete(socket.id);

        logger.info(`👥 Utilisateurs connectés: ${this.connectedUsers.size}`);

        // Notifier les autres utilisateurs de la déconnexion
        socket.broadcast.emit("user-disconnected", socket.id);
      });

      // Gestionnaire d'erreurs
      socket.on("error", (error) => {
        logger.error(`❌ Erreur WebSocket ${socket.id}:`, error);
      });
    });

    // Gestionnaire d'erreurs globales
    this.io.on("error", (error) => {
      logger.error("❌ Erreur Socket.IO:", error);
    });
  }

  private extractDeviceName(userAgent: string): string {
    // Extraction simple du nom de l'appareil depuis le User-Agent
    if (userAgent.includes("Mobile")) return "Mobile";
    if (userAgent.includes("Tablet")) return "Tablet";
    if (userAgent.includes("Windows")) return "Windows PC";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Linux")) return "Linux PC";
    return "Unknown Device";
  }

  // Méthodes utilitaires publiques
  public getConnectedUsers(): UserSession[] {
    return Array.from(this.connectedUsers.values());
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  public broadcastToOthers(
    excludeSocketId: string,
    event: string,
    data: any,
  ): void {
    this.io.sockets.sockets.forEach((socket) => {
      if (socket.id !== excludeSocketId) {
        socket.emit(event, data);
      }
    });
  }
}
