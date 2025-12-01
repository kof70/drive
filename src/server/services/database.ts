import path from "path";
import fs from "fs";
import { CanvasElement } from "../../shared/types";
import { logger } from "../utils/logger";

/**
 * Simple JSON-based database service
 * No native dependencies - works everywhere
 */
export class DatabaseService {
  private dbPath: string;
  private elements: Map<string, CanvasElement>;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor(dbPath: string = "./data/workspace.json") {
    this.dbPath = dbPath;
    this.elements = new Map();

    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      logger.info(`📁 Dossier de données créé: ${dataDir}`);
    }

    // Charger les données existantes
    this.loadFromDisk();

    logger.info(`💾 Base de données initialisée: ${dbPath}`);
  }

  /**
   * Charge les données depuis le disque
   */
  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf-8');
        const elements = JSON.parse(data) as CanvasElement[];
        this.elements = new Map(elements.map(el => [el.id, el]));
        logger.info(`✅ ${this.elements.size} éléments chargés depuis la base de données`);
      } else {
        logger.info('✅ Nouvelle base de données créée');
      }
    } catch (error) {
      logger.error('❌ Erreur lors du chargement de la base de données:', error as Error);
      this.elements = new Map();
    }
  }

  /**
   * Sauvegarde sur le disque (debounced)
   */
  private saveToDisk(): void {
    // Debounce: attendre 1 seconde avant de sauvegarder
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      try {
        const elements = Array.from(this.elements.values());
        fs.writeFileSync(this.dbPath, JSON.stringify(elements, null, 2), 'utf-8');
        logger.debug(`💾 ${elements.length} éléments sauvegardés sur le disque`);
      } catch (error) {
        logger.error('❌ Erreur lors de la sauvegarde:', error as Error);
      }
    }, 1000);
  }

  /**
   * Sauvegarde un élément du canvas
   */
  public saveElement(element: CanvasElement): void {
    this.elements.set(element.id, element);
    this.saveToDisk();
  }

  /**
   * Sauvegarde plusieurs éléments
   */
  public saveElements(elements: CanvasElement[]): void {
    for (const element of elements) {
      this.elements.set(element.id, element);
    }
    this.saveToDisk();
    logger.debug(`💾 ${elements.length} éléments sauvegardés`);
  }

  /**
   * Récupère un élément par son ID
   */
  public getElement(id: string): CanvasElement | null {
    return this.elements.get(id) || null;
  }

  /**
   * Récupère tous les éléments du canvas
   */
  public getAllElements(): CanvasElement[] {
    return Array.from(this.elements.values()).sort((a, b) => {
      const aTime = a.metadata.createdAt ? new Date(a.metadata.createdAt).getTime() : 0;
      const bTime = b.metadata.createdAt ? new Date(b.metadata.createdAt).getTime() : 0;
      return aTime - bTime;
    });
  }

  /**
   * Supprime un élément
   */
  public deleteElement(id: string): void {
    this.elements.delete(id);
    this.saveToDisk();
  }

  /**
   * Supprime tous les éléments
   */
  public clearAllElements(): void {
    this.elements.clear();
    this.saveToDisk();
    logger.info("🗑️  Tous les éléments supprimés");
  }

  /**
   * Compte le nombre d'éléments
   */
  public countElements(): number {
    return this.elements.size;
  }

  /**
   * Crée une sauvegarde de la base de données
   */
  public backup(backupPath?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const defaultBackupPath = `./data/backups/workspace-${timestamp}.json`;
    const finalBackupPath = backupPath || defaultBackupPath;

    // Créer le dossier de backup s'il n'existe pas
    const backupDir = path.dirname(finalBackupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Copier la base de données
    fs.copyFileSync(this.dbPath, finalBackupPath);

    logger.info(`💾 Backup créé: ${finalBackupPath}`);
    return finalBackupPath;
  }

  /**
   * Ferme la connexion à la base de données
   */
  public close(): void {
    // Sauvegarder immédiatement avant de fermer
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    try {
      const elements = Array.from(this.elements.values());
      fs.writeFileSync(this.dbPath, JSON.stringify(elements, null, 2), 'utf-8');
    } catch (error) {
      logger.error('❌ Erreur lors de la sauvegarde finale:', error as Error);
    }
    
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
    let dbSize = 0;
    try {
      const stats = fs.statSync(this.dbPath);
      dbSize = stats.size;
    } catch (error) {
      // File doesn't exist yet
    }

    return {
      elementCount: this.countElements(),
      dbSize,
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
