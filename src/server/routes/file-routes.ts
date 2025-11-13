import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { FileStorageService } from '../services/file-storage';
import { logger } from '../utils/logger';
import { defaultConfig } from '../config/default';
import { ErrorCodes } from '../../shared/types';

export function createFileRoutes(fileStorage: FileStorageService): Router {
  const router = Router();

  // Configuration de multer pour l'upload temporaire
  const upload = multer({
    dest: path.join(defaultConfig.storagePath, 'temp'),
    limits: {
      fileSize: defaultConfig.maxFileSize,
    },
    fileFilter: (_req, file, cb) => {
      // Validation basique du type de fichier
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/json',
        'application/zip',
        'application/x-zip-compressed',
      ];

      if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`));
      }
    },
  });

  /**
   * Upload d'un fichier
   */
  router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: ErrorCodes.PERMISSION_DENIED,
            message: 'Aucun fichier fourni',
          },
        });
      }

      const uploadedBy = req.body.uploadedBy || 'anonymous';
      const fileReference = await fileStorage.saveFile(req.file, uploadedBy);

      res.json({
        success: true,
        data: fileReference,
      });
    } catch (error) {
      logger.error('Erreur lors de l\'upload:', error as Error);
      
      const errorMessage = (error as Error).message;
      const isFileTooLarge = errorMessage.includes('File too large');

      res.status(isFileTooLarge ? 413 : 500).json({
        success: false,
        error: {
          code: isFileTooLarge ? ErrorCodes.FILE_TOO_LARGE : ErrorCodes.STORAGE_FULL,
          message: isFileTooLarge 
            ? 'Fichier trop volumineux' 
            : 'Erreur lors de l\'upload du fichier',
        },
      });
    }
  });

  /**
   * Téléchargement d'un fichier
   */
  router.get('/download/:filename', (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const filePath = fileStorage.getFile(filename);

      if (!filePath) {
        return res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.PERMISSION_DENIED,
            message: 'Fichier non trouvé',
          },
        });
      }

      res.download(filePath);
    } catch (error) {
      logger.error('Erreur lors du téléchargement:', error as Error);
      res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.NETWORK_DISCONNECTED,
          message: 'Erreur lors du téléchargement',
        },
      });
    }
  });

  /**
   * Suppression d'un fichier
   */
  router.delete('/:filename', (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const deleted = fileStorage.deleteFile(filename);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.PERMISSION_DENIED,
            message: 'Fichier non trouvé',
          },
        });
      }

      res.json({
        success: true,
        data: { deleted: true },
      });
    } catch (error) {
      logger.error('Erreur lors de la suppression:', error as Error);
      res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.PERMISSION_DENIED,
          message: 'Erreur lors de la suppression',
        },
      });
    }
  });

  /**
   * Liste des fichiers
   */
  router.get('/list', (_req: Request, res: Response) => {
    try {
      const files = fileStorage.listFiles();
      res.json({
        success: true,
        data: files,
      });
    } catch (error) {
      logger.error('Erreur lors du listage:', error as Error);
      res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.NETWORK_DISCONNECTED,
          message: 'Erreur lors du listage des fichiers',
        },
      });
    }
  });

  /**
   * Métadonnées d'un fichier
   */
  router.get('/metadata/:fileId', (req: Request, res: Response) => {
    try {
      const { fileId } = req.params;
      const metadata = fileStorage.getMetadata(fileId);

      if (!metadata) {
        return res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.PERMISSION_DENIED,
            message: 'Métadonnées non trouvées',
          },
        });
      }

      res.json({
        success: true,
        data: metadata,
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des métadonnées:', error as Error);
      res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.NETWORK_DISCONNECTED,
          message: 'Erreur lors de la récupération des métadonnées',
        },
      });
    }
  });

  /**
   * Statistiques de stockage
   */
  router.get('/stats', (_req: Request, res: Response) => {
    try {
      const stats = fileStorage.getStorageStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des stats:', error as Error);
      res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.NETWORK_DISCONNECTED,
          message: 'Erreur lors de la récupération des statistiques',
        },
      });
    }
  });

  /**
   * Vérification de l'intégrité d'un fichier
   */
  router.post('/verify/:filename', async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const { checksum } = req.body;

      if (!checksum) {
        return res.status(400).json({
          success: false,
          error: {
            code: ErrorCodes.PERMISSION_DENIED,
            message: 'Checksum requis',
          },
        });
      }

      const isValid = await fileStorage.verifyFileIntegrity(filename, checksum);

      res.json({
        success: true,
        data: { valid: isValid },
      });
    } catch (error) {
      logger.error('Erreur lors de la vérification:', error as Error);
      res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.NETWORK_DISCONNECTED,
          message: 'Erreur lors de la vérification',
        },
      });
    }
  });

  return router;
}
