import { FileReference, ApiResponse } from '../../shared/types';
import { logger } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export class FileUploadService {
  /**
   * Upload un fichier vers le serveur
   */
  async uploadFile(
    file: File,
    uploadedBy: string,
    onProgress?: (progress: number) => void
  ): Promise<FileReference> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', uploadedBy);

    try {
      const xhr = new XMLHttpRequest();

      // Promesse pour gérer l'upload
      const uploadPromise = new Promise<FileReference>((resolve, reject) => {
        // Gérer la progression
        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = (event.loaded / event.total) * 100;
              onProgress(progress);
            }
          });
        }

        // Gérer la réponse
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response: ApiResponse<FileReference> = JSON.parse(xhr.responseText);
              if (response.success && response.data) {
                resolve(response.data);
              } else {
                reject(new Error(response.error?.message || 'Upload failed'));
              }
            } catch (error) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        // Gérer les erreurs
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });

        // Envoyer la requête
        xhr.open('POST', `${API_BASE_URL}/api/files/upload`);
        xhr.send(formData);
      });

      const fileReference = await uploadPromise;
      logger.info(`✅ Fichier uploadé: ${file.name}`);
      return fileReference;
    } catch (error) {
      logger.error('❌ Erreur lors de l\'upload:', error as Error);
      throw error;
    }
  }

  /**
   * Télécharge un fichier depuis le serveur
   */
  async downloadFile(storedFilename: string, originalFilename: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/files/download/${storedFilename}`);
      
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      
      // Créer un lien de téléchargement temporaire
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      logger.info(`✅ Fichier téléchargé: ${originalFilename}`);
    } catch (error) {
      logger.error('❌ Erreur lors du téléchargement:', error as Error);
      throw error;
    }
  }

  /**
   * Supprime un fichier du serveur
   */
  async deleteFile(storedFilename: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/files/${storedFilename}`, {
        method: 'DELETE',
      });

      const result: ApiResponse = await response.json();
      
      if (result.success) {
        logger.info(`✅ Fichier supprimé: ${storedFilename}`);
        return true;
      } else {
        throw new Error(result.error?.message || 'Delete failed');
      }
    } catch (error) {
      logger.error('❌ Erreur lors de la suppression:', error as Error);
      throw error;
    }
  }

  /**
   * Récupère la liste de tous les fichiers
   */
  async listFiles(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/files/list`);
      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Failed to list files');
      }
    } catch (error) {
      logger.error('❌ Erreur lors du listage des fichiers:', error as Error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques de stockage
   */
  async getStorageStats(): Promise<{ totalFiles: number; totalSize: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/files/stats`);
      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Failed to get stats');
      }
    } catch (error) {
      logger.error('❌ Erreur lors de la récupération des stats:', error as Error);
      throw error;
    }
  }
}

// Instance singleton
export const fileUploadService = new FileUploadService();
