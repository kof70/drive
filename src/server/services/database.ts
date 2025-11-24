import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { CanvasElement } from "../../shared/types";
import { logger } from "../utils/logger";

export class DatabaseService {
  private db: Database.Database;
  private dbPath: string;

  constructor(dbPath: string = "./data/workspace.db") {
    this.dbPath = dbPath;

    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      logger.info(`📁 Dossier de données créé: ${dataDir}`);
    }

    // Initialiser la base de données
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL"); // Write-Ahead Logging pour de meilleures performances

    logger.info(`💾 Base de données initialisée: ${dbPath}`);

    // Créer les tables
    this.initializeTables();
  }

  /**
   * Initialise les tables de la base de données
   */
  private initializeTables(): void {
    // Table pour les éléments du canvas
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS canvas_elements (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        position_x REAL NOT NULL,
        position_y REAL NOT NULL,
        size_width REAL NOT NULL,
        size_height REAL NOT NULL,
        content TEXT,
        metadata TEXT NOT NULL,
        style TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Index pour améliorer les performances
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_canvas_elements_type
      ON canvas_elements(type)
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_canvas_elements_updated
      ON canvas_elements(updated_at)
    `);

    logger.info("✅ Tables de base de données créées/vérifiées");
  }

  /**
   * Sauvegarde un élément du canvas
   */
  public saveElement(element: CanvasElement): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO canvas_elements
      (id, type, position_x, position_y, size_width, size_height, content, metadata, style, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = Date.now();
    const createdAt = element.metadata.createdAt
      ? new Date(element.metadata.createdAt).getTime()
      : now;

    stmt.run(
      element.id,
      element.type,
      element.position.x,
      element.position.y,
      element.size.width,
      element.size.height,
      typeof element.content === "object"
        ? JSON.stringify(element.content)
        : element.content,
      JSON.stringify(element.metadata),
      element.style ? JSON.stringify(element.style) : null,
      createdAt,
      now,
    );
  }

  /**
   * Sauvegarde plusieurs éléments en une transaction
   */
  public saveElements(elements: CanvasElement[]): void {
    const saveMany = this.db.transaction((elements: CanvasElement[]) => {
      for (const element of elements) {
        this.saveElement(element);
      }
    });

    saveMany(elements);
    logger.debug(`💾 ${elements.length} éléments sauvegardés`);
  }

  /**
   * Récupère un élément par son ID
   */
  public getElement(id: string): CanvasElement | null {
    const stmt = this.db.prepare(`
      SELECT * FROM canvas_elements WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return this.rowToElement(row);
  }

  /**
   * Récupère tous les éléments du canvas
   */
  public getAllElements(): CanvasElement[] {
    const stmt = this.db.prepare(`
      SELECT * FROM canvas_elements ORDER BY created_at ASC
    `);

    const rows = stmt.all() as any[];
    return rows.map((row) => this.rowToElement(row));
  }

  /**
   * Supprime un élément
   */
  public deleteElement(id: string): void {
    const stmt = this.db.prepare(`
      DELETE FROM canvas_elements WHERE id = ?
    `);

    stmt.run(id);
  }

  /**
   * Supprime tous les éléments
   */
  public clearAllElements(): void {
    this.db.exec("DELETE FROM canvas_elements");
    logger.info("🗑️  Tous les éléments supprimés");
  }

  /**
   * Compte le nombre d'éléments
   */
  public countElements(): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM canvas_elements
    `);

    const result = stmt.get() as { count: number };
    return result.count;
  }

  /**
   * Convertit une ligne de base de données en CanvasElement
   */
  private rowToElement(row: any): CanvasElement {
    return {
      id: row.id,
      type: row.type,
      position: {
        x: row.position_x,
        y: row.position_y,
      },
      size: {
        width: row.size_width,
        height: row.size_height,
      },
      content: row.content,
      metadata: JSON.parse(row.metadata),
      style: row.style ? JSON.parse(row.style) : undefined,
    };
  }

  /**
   * Crée une sauvegarde de la base de données
   */
  public backup(backupPath?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const defaultBackupPath = `./data/backups/workspace-${timestamp}.db`;
    const finalBackupPath = backupPath || defaultBackupPath;

    // Créer le dossier de backup s'il n'existe pas
    const backupDir = path.dirname(finalBackupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Copier la base de données
    this.db.backup(finalBackupPath);

    logger.info(`💾 Backup créé: ${finalBackupPath}`);
    return finalBackupPath;
  }

  /**
   * Ferme la connexion à la base de données
   */
  public close(): void {
    this.db.close();
    logger.info("💾 Base de données fermée");
  }

  /**
   * Obtient des statistiques sur la base de données
   */
  public getStats(): {
    elementCount: number;
    dbSize: number;
    dbPath: string;
  } {
    const stats = fs.statSync(this.dbPath);

    return {
      elementCount: this.countElements(),
      dbSize: stats.size,
      dbPath: this.dbPath,
    };
  }
}

// Instance singleton
let dbInstance: DatabaseService | null = null;

export function getDatabaseService(dbPath?: string): DatabaseService {
  if (!dbInstance) {
    dbInstance = new DatabaseService(dbPath);
  }
  return dbInstance;
}

export function closeDatabaseService(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
