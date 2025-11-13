# 🎨 Documentation API pour le Développeur Frontend

## 📋 Vue d'ensemble

Cette documentation est destinée au développeur frontend. Elle décrit toutes les API REST disponibles pour construire l'interface utilisateur.

**Base URL :** `http://localhost:8080`  
**Version :** 1.5.0

## 🚀 Démarrage Rapide

### Collection Postman

Une collection Postman complète est disponible dans le dossier `postman/` :
- `Local-Collaborative-Workspace.postman_collection.json`
- `Local-Environment.postman_environment.json`

Voir [postman/README.md](../../postman/README.md) pour l'import.

### Tester l'API

```bash
# Démarrer le serveur
pnpm dev:server

# Le serveur sera accessible sur http://localhost:8080
```

## 📡 API REST Disponibles

### 1. Health & Configuration

#### GET /api/health
Vérifie que le serveur fonctionne.

**Réponse :**
```json
{
  "status": "ok",
  "timestamp": "2025-10-24T21:35:30.713Z",
  "version": "1.0.0"
}
```

#### GET /api/config
Récupère la configuration du serveur.

**Réponse :**
```json
{
  "maxFileSize": 1073741824,
  "enableMDNS": true
}
```

---

### 2. Utilisateurs

#### GET /api/users
Liste des utilisateurs connectés via WebSocket.

**Réponse :**
```json
{
  "connectedUsers": [
    {
      "id": "socket-id",
      "deviceName": "Windows PC",
      "ipAddress": "192.168.1.10",
      "connectedAt": "2025-10-24T21:00:00.000Z"
    }
  ],
  "totalConnected": 1
}
```

---

### 3. Base de Données

#### GET /api/database/stats
Statistiques de la base de données.

**Réponse :**
```json
{
  "elementCount": 5,
  "dbSize": 8192,
  "dbPath": "./data/workspace.db"
}
```

#### POST /api/database/backup
Crée un backup manuel de la base de données.

**Réponse :**
```json
{
  "success": true,
  "backupPath": "./data/backups/workspace-2025-10-24.db",
  "message": "Backup créé avec succès"
}
```

---

### 4. Gestion des Fichiers

#### POST /api/files/upload
Upload un fichier sur le serveur.

**Content-Type :** `multipart/form-data`

**Body :**
- `file` : Le fichier (requis)
- `uploadedBy` : Nom de l'utilisateur (optionnel)

**Exemple avec fetch :**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('uploadedBy', 'john');

const response = await fetch('http://localhost:8080/api/files/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "filename": "document.pdf",
    "originalPath": "document.pdf",
    "storedPath": "abc123-def456.pdf",
    "mimeType": "application/pdf",
    "size": 1024000,
    "checksum": "sha256hash..."
  }
}
```

#### GET /api/files/download/:filename
Télécharge un fichier.

**Paramètres :**
- `filename` : Le `storedPath` retourné par l'upload

**Exemple :**
```javascript
const link = document.createElement('a');
link.href = `http://localhost:8080/api/files/download/${storedPath}`;
link.download = originalFilename;
link.click();
```

#### DELETE /api/files/:filename
Supprime un fichier.

**Paramètres :**
- `filename` : Le `storedPath` du fichier

**Réponse :**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

#### GET /api/files/list
Liste tous les fichiers stockés.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123-def456",
      "filename": "document.pdf",
      "size": 1024000,
      "mimeType": "application/pdf",
      "uploadedAt": "2025-10-23T10:30:00.000Z",
      "uploadedBy": "john"
    }
  ]
}
```

#### GET /api/files/metadata/:fileId
Récupère les métadonnées d'un fichier.

**Paramètres :**
- `fileId` : L'UUID du fichier

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "abc123-def456",
    "filename": "document.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "uploadedAt": "2025-10-23T10:30:00.000Z",
    "uploadedBy": "john"
  }
}
```

#### GET /api/files/stats
Statistiques de stockage des fichiers.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "totalFiles": 42,
    "totalSize": 52428800
  }
}
```

#### POST /api/files/verify/:filename
Vérifie l'intégrité d'un fichier.

**Paramètres :**
- `filename` : Le `storedPath` du fichier

**Body :**
```json
{
  "checksum": "sha256hash..."
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "valid": true
  }
}
```

---

## 🔌 WebSocket

### Connexion

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:8080', {
  transports: ['websocket', 'polling']
});
```

### Événements Disponibles

#### Événements Serveur → Client

| Événement | Description | Données |
|-----------|-------------|---------|
| `canvas-state-sync` | État initial du canvas | `CanvasElement[]` |
| `canvas-update` | Mise à jour d'un élément | `CanvasElement` |
| `canvas-element-add` | Nouvel élément ajouté | `CanvasElement` |
| `canvas-element-remove` | Élément supprimé | `string` (elementId) |
| `user-connected` | Nouvel utilisateur | `UserSession` |
| `user-disconnected` | Utilisateur déconnecté | `string` (userId) |
| `users-list` | Liste des utilisateurs | `UserSession[]` |
| `user-cursor` | Position du curseur | `{ userId, position }` |

#### Événements Client → Serveur

| Événement | Description | Données |
|-----------|-------------|---------|
| `canvas-update` | Mettre à jour un élément | `CanvasElement` |
| `canvas-element-add` | Ajouter un élément | `CanvasElement` |
| `canvas-element-remove` | Supprimer un élément | `string` (elementId) |
| `request-canvas-state` | Demander l'état complet | - |
| `user-cursor` | Envoyer position curseur | `CursorPosition` |

### Exemple d'Utilisation

```javascript
// Recevoir l'état initial
socket.on('canvas-state-sync', (elements) => {
  console.log('État initial:', elements);
  // Mettre à jour votre state
});

// Recevoir les mises à jour
socket.on('canvas-update', (element) => {
  console.log('Élément mis à jour:', element);
  // Mettre à jour votre state
});

// Envoyer une mise à jour
socket.emit('canvas-update', {
  id: 'note-123',
  type: 'note',
  content: 'Mon texte',
  position: { x: 100, y: 200 },
  // ...
});
```

---

## 📦 Types TypeScript

Tous les types sont disponibles dans `src/shared/types.ts` :

```typescript
interface CanvasElement {
  id: string;
  type: 'file' | 'note' | 'folder' | 'image';
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: string | FileReference;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
  style: {
    backgroundColor?: string;
    borderColor?: string;
    fontSize?: number;
  };
}

interface FileReference {
  filename: string;
  originalPath: string;
  storedPath: string;
  mimeType: string;
  size: number;
  checksum: string;
}

interface UserSession {
  id: string;
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  connectedAt: Date;
  cursor?: CursorPosition;
}
```

---

## 🎯 Flux de Travail Recommandé

### 1. Initialisation

```javascript
// 1. Vérifier que le serveur fonctionne
const health = await fetch('/api/health').then(r => r.json());

// 2. Se connecter au WebSocket
const socket = io('http://localhost:8080');

// 3. Attendre l'état initial
socket.on('canvas-state-sync', (elements) => {
  // Initialiser votre canvas
});
```

### 2. Upload de Fichier

```javascript
// 1. Upload le fichier
const formData = new FormData();
formData.append('file', file);
const response = await fetch('/api/files/upload', {
  method: 'POST',
  body: formData
});
const { data: fileRef } = await response.json();

// 2. Créer un élément canvas
const element = {
  id: crypto.randomUUID(),
  type: 'file',
  position: { x: 100, y: 100 },
  size: { width: 200, height: 150 },
  content: fileRef,
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user'
  },
  style: {}
};

// 3. Ajouter au canvas via WebSocket
socket.emit('canvas-element-add', element);
```

### 3. Édition de Note

```javascript
// 1. Récupérer l'élément
const element = canvasStore.getElementById(noteId);

// 2. Modifier le contenu
element.content = 'Nouveau texte';
element.metadata.updatedAt = new Date();

// 3. Synchroniser via WebSocket
socket.emit('canvas-update', element);
```

---

## ⚠️ Limitations

- **Taille max fichier :** 1GB
- **Types MIME autorisés :** images, PDF, texte, JSON, ZIP
- **Pas d'authentification** (réseau local de confiance)
- **Pas de chunked upload** (fichiers >10MB peuvent être lents)

---

## 🐛 Gestion d'Erreurs

### Format des Erreurs

```json
{
  "success": false,
  "error": {
    "code": "FILE_001",
    "message": "Fichier trop volumineux"
  }
}
```

### Codes d'Erreur

| Code | Description |
|------|-------------|
| `FILE_001` | Fichier trop volumineux |
| `STORAGE_001` | Espace de stockage insuffisant |
| `AUTH_001` | Permission refusée |
| `NET_001` | Erreur réseau |

### Exemple de Gestion

```javascript
try {
  const response = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (!result.success) {
    console.error('Erreur:', result.error.message);
    // Afficher un message à l'utilisateur
  }
} catch (error) {
  console.error('Erreur réseau:', error);
}
```

---

## 📚 Ressources

- **Collection Postman :** `postman/`
- **Documentation API complète :** `docs/api/FILES.md`
- **Types TypeScript :** `src/shared/types.ts`
- **Exemples de code :** `src/client/services/file-upload.ts`

---

## 💬 Support

Pour toute question sur l'API :
1. Consulter la documentation dans `docs/`
2. Tester avec Postman
3. Voir les exemples dans `src/client/`

**Bon développement ! 🚀**
