import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { FileReference, FileMetadata } from '../../shared/types';
import { logger } from '../utils/logger';

export class FileStorageService {
  private uploadsDir: string;
  private metadataDir: string;

  constructor(storagePath: string) {
    this.uploadsDir = path.join(storagePath, 'uploads');
    this.metadataDir = path.join(storagePath, 'metadata');
    this.initializeDirectories();
  }

  private initializeDirectories(): void {
    try {
      // Créer le répertoire uploads s'il n'existe pas
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
        logger.info(`📁 Répertoire uploads créé: ${this.uploadsDir}`);
      }

      // Créer le répertoire metadata s'il n'existe pas
      if (!fs.existsSync(this.metadataDir)) {
        fs.mkdirSync(this.metadataDir, { recursive: true });
        logger.info(`📁 Répertoire metadata créé: ${this.metadataDir}`);
      }
    } catch (error) {
      logger.error('Erreur lors de la création des répertoires:', error as Error);
      throw error;
    }
  }

  /**
   * Calcule le checksum SHA256 d'un fichier
   */
  private calculateChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Sauvegarde un fichier et retourne sa référence
   */
  async saveFile(
    file: Express.Multer.File,
    uploadedBy: string
  ): Promise<FileReference> {
    try {
      const fileId = crypto.randomUUID();
      const fileExtension = path.extname(file.originalname);
      const storedFilename = `${fileId}${fileExtension}`;
      const storedPath = path.join(this.uploadsDir, storedFilename);

      // Déplacer le fichier vers le répertoire de stockage
      fs.renameSync(file.path, storedPath);

      // Calculer le checksum
      const checksum = await this.calculateChecksum(storedPath);

      // Créer la référence du fichier
      const fileReference: FileReference = {
        filename: file.originalname,
        originalPath: file.originalname,
        storedPath: storedFilename,
        mimeType: file.mimetype,
        size: file.size,
        checksum,
      };

      // Sauvegarder les métadonnées
      const metadata: FileMetadata = {
        id: fileId,
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
        uploadedBy,
      };

      this.saveMetadata(fileId, metadata);

      logger.info(`✅ Fichier sauvegardé: ${file.originalname} (${fileId})`);
      return fileReference;
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde du fichier:', error as Error);
      throw error;
    }
  }

  /**
   * Récupère un fichier par son nom stocké
   */
  getFile(storedFilename: string): string | null {
    const filePath = path.join(this.uploadsDir, storedFilename);
    
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    
    logger.warn(`Fichier non trouvé: ${storedFilename}`);
    return null;
  }

  /**
   * Supprime un fichier
   */
  deleteFile(storedFilename: string): boolean {
    try {
      const filePath = path.join(this.uploadsDir, storedFilename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        
        // Supprimer aussi les métadonnées
        const fileId = path.parse(storedFilename).name;
        this.deleteMetadata(fileId);
        
        logger.info(`🗑️ Fichier supprimé: ${storedFilename}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Erreur lors de la suppression du fichier:', error as Error);
      return false;
    }
  }

  /**
   * Vérifie l'intégrité d'un fichier
   */
  async verifyFileIntegrity(storedFilename: string, expectedChecksum: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadsDir, storedFilename);
      
      if (!fs.existsSync(filePath)) {
        return false;
      }

      const actualChecksum = await this.calculateChecksum(filePath);
      return actualChecksum === expectedChecksum;
    } catch (error) {
      logger.error('Erreur lors de la vérification du fichier:', error as Error);
      return false;
    }
  }

  /**
   * Sauvegarde les métadonnées d'un fichier
   */
  private saveMetadata(fileId: string, metadata: FileMetadata): void {
    const metadataPath = path.join(this.metadataDir, `${fileId}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  /**
   * Récupère les métadonnées d'un fichier
   */
  getMetadata(fileId: string): FileMetadata | null {
    try {
      const metadataPath = path.join(this.metadataDir, `${fileId}.json`);
      
      if (fs.existsSync(metadataPath)) {
        const data = fs.readFileSync(metadataPath, 'utf-8');
        return JSON.parse(data);
      }
      
      return null;
    } catch (error) {
      logger.error('Erreur lors de la lecture des métadonnées:', error as Error);
      return null;
    }
  }

  /**
   * Supprime les métadonnées d'un fichier
   */
  private deleteMetadata(fileId: string): void {
    const metadataPath = path.join(this.metadataDir, `${fileId}.json`);
    
    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
    }
  }

  /**
   * Liste tous les fichiers stockés
   */
  listFiles(): FileMetadata[] {
    try {
      const metadataFiles = fs.readdirSync(this.metadataDir);
      const files: FileMetadata[] = [];

      for (const file of metadataFiles) {
        if (file.endsWith('.json')) {
          const fileId = path.parse(file).name;
          const metadata = this.getMetadata(fileId);
          if (metadata) {
            files.push(metadata);
          }
        }
      }

      return files;
    } catch (error) {
      logger.error('Erreur lors du listage des fichiers:', error as Error);
      return [];
    }
  }

  /**
   * Obtient les statistiques de stockage
   */
  getStorageStats(): { totalFiles: number; totalSize: number } {
    try {
      const files = this.listFiles();
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);

      return {
        totalFiles: files.length,
        totalSize,
      };
    } catch (error) {
      logger.error('Erreur lors du calcul des statistiques:', error as Error);
      return { totalFiles: 0, totalSize: 0 };
    }
  }
}
