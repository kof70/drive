import fs from 'fs';
import path from 'path';
import { FileStorageService } from '../file-storage';

describe('FileStorageService', () => {
  let fileStorage: FileStorageService;
  const testStoragePath = path.join(process.cwd(), 'test-storage');

  beforeEach(() => {
    // Créer un répertoire de test
    if (!fs.existsSync(testStoragePath)) {
      fs.mkdirSync(testStoragePath, { recursive: true });
    }
    fileStorage = new FileStorageService(testStoragePath);
  });

  afterEach(() => {
    // Nettoyer le répertoire de test
    if (fs.existsSync(testStoragePath)) {
      fs.rmSync(testStoragePath, { recursive: true, force: true });
    }
  });

  describe('Directory Initialization', () => {
    it('should create uploads and metadata directories', () => {
      const uploadsDir = path.join(testStoragePath, 'uploads');
      const metadataDir = path.join(testStoragePath, 'metadata');

      expect(fs.existsSync(uploadsDir)).toBe(true);
      expect(fs.existsSync(metadataDir)).toBe(true);
    });
  });

  describe('File Operations', () => {
    it('should save and retrieve a file', async () => {
      // Créer un fichier de test
      const tempDir = path.join(testStoragePath, 'temp');
      fs.mkdirSync(tempDir, { recursive: true });
      const tempFilePath = path.join(tempDir, 'test.txt');
      fs.writeFileSync(tempFilePath, 'Test content');

      const mockFile = {
        originalname: 'test.txt',
        path: tempFilePath,
        mimetype: 'text/plain',
        size: 12,
      } as Express.Multer.File;

      const fileRef = await fileStorage.saveFile(mockFile, 'test-user');

      expect(fileRef.filename).toBe('test.txt');
      expect(fileRef.mimeType).toBe('text/plain');
      expect(fileRef.size).toBe(12);
      expect(fileRef.checksum).toBeDefined();

      const retrievedPath = fileStorage.getFile(fileRef.storedPath);
      expect(retrievedPath).toBeTruthy();
    });

    it('should list all files', async () => {
      const tempDir = path.join(testStoragePath, 'temp');
      fs.mkdirSync(tempDir, { recursive: true });

      // Créer deux fichiers de test
      const file1Path = path.join(tempDir, 'file1.txt');
      const file2Path = path.join(tempDir, 'file2.txt');
      fs.writeFileSync(file1Path, 'Content 1');
      fs.writeFileSync(file2Path, 'Content 2');

      const mockFile1 = {
        originalname: 'file1.txt',
        path: file1Path,
        mimetype: 'text/plain',
        size: 9,
      } as Express.Multer.File;

      const mockFile2 = {
        originalname: 'file2.txt',
        path: file2Path,
        mimetype: 'text/plain',
        size: 9,
      } as Express.Multer.File;

      await fileStorage.saveFile(mockFile1, 'user1');
      await fileStorage.saveFile(mockFile2, 'user2');

      const files = fileStorage.listFiles();
      expect(files).toHaveLength(2);
    });

    it('should get storage stats', async () => {
      const stats = fileStorage.getStorageStats();
      expect(stats.totalFiles).toBe(0);
      expect(stats.totalSize).toBe(0);
    });
  });
});
