# API de Stockage de Fichiers

## Vue d'ensemble

Le système de stockage de fichiers permet d'uploader, télécharger, et gérer des fichiers sur le serveur local. Tous les fichiers sont stockés dans le répertoire `workspace-data/uploads/` avec leurs métadonnées dans `workspace-data/metadata/`.

## Endpoints API

### 1. Upload de fichier

**POST** `/api/files/upload`

Upload un fichier sur le serveur.

**Headers:**
- `Content-Type: multipart/form-data`

**Body (form-data):**
- `file`: Le fichier à uploader (requis)
- `uploadedBy`: Nom de l'utilisateur (optionnel, défaut: "anonymous")

**Réponse (succès):**
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

**Exemple avec curl:**
```bash
curl -X POST http://localhost:8080/api/files/upload \
  -F "file=@/path/to/file.pdf" \
  -F "uploadedBy=john"
```

**Exemple avec fetch:**
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

### 2. Téléchargement de fichier

**GET** `/api/files/download/:filename`

Télécharge un fichier depuis le serveur.

**Paramètres:**
- `filename`: Le nom du fichier stocké (storedPath)

**Exemple:**
```bash
curl -O http://localhost:8080/api/files/download/abc123-def456.pdf
```

### 3. Liste des fichiers

**GET** `/api/files/list`

Récupère la liste de tous les fichiers stockés.

**Réponse:**
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

### 4. Métadonnées d'un fichier

**GET** `/api/files/metadata/:fileId`

Récupère les métadonnées d'un fichier spécifique.

**Paramètres:**
- `fileId`: L'ID du fichier (UUID)

**Réponse:**
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

### 5. Suppression de fichier

**DELETE** `/api/files/:filename`

Supprime un fichier du serveur.

**Paramètres:**
- `filename`: Le nom du fichier stocké (storedPath)

**Réponse:**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

### 6. Statistiques de stockage

**GET** `/api/files/stats`

Récupère les statistiques de stockage.

**Réponse:**
```json
{
  "success": true,
  "data": {
    "totalFiles": 42,
    "totalSize": 52428800
  }
}
```

### 7. Vérification d'intégrité

**POST** `/api/files/verify/:filename`

Vérifie l'intégrité d'un fichier en comparant son checksum.

**Paramètres:**
- `filename`: Le nom du fichier stocké

**Body:**
```json
{
  "checksum": "sha256hash..."
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "valid": true
  }
}
```

## Codes d'erreur

- `FILE_001`: Fichier trop volumineux (> 1GB)
- `STORAGE_001`: Espace de stockage insuffisant
- `AUTH_001`: Permission refusée
- `NET_001`: Erreur réseau

## Limitations

- Taille maximale par fichier: **1GB**
- Types de fichiers autorisés:
  - Images: JPEG, PNG, GIF, WebP
  - Documents: PDF, TXT, JSON
  - Archives: ZIP

## Sécurité

- Tous les fichiers sont vérifiés avec un checksum SHA256
- Les types MIME sont validés côté serveur
- Les fichiers sont stockés avec des noms UUID pour éviter les conflits
- Aucune authentification n'est requise (réseau local de confiance)

## Structure de stockage

```
workspace-data/
├── uploads/           # Fichiers uploadés
│   ├── abc123.pdf
│   └── def456.jpg
├── metadata/          # Métadonnées JSON
│   ├── abc123.json
│   └── def456.json
└── temp/             # Fichiers temporaires (multer)
```
# Guide de Démarrage Rapide - Stockage de Fichiers

## 🚀 Démarrage

### 1. Installer les dépendances (si pas déjà fait)

```bash
pnpm install
```

### 2. Démarrer le serveur

```bash
pnpm dev:server
```

Le serveur démarre sur `http://localhost:8080`

## 🧪 Tester l'API de Fichiers

### Option 1 : Script de Test Automatique (Recommandé)

Dans un nouveau terminal :

```bash
pnpm test:file-upload
```

Ce script va :
1. ✅ Créer un fichier de test
2. ✅ L'uploader sur le serveur
3. ✅ Récupérer ses métadonnées
4. ✅ Lister tous les fichiers
5. ✅ Obtenir les statistiques
6. ✅ Vérifier l'intégrité
7. ✅ Télécharger le fichier
8. ✅ Supprimer le fichier

### Option 2 : Tests Unitaires

```bash
pnpm test -- file-storage.test.ts
```

### Option 3 : Test Manuel avec Curl

#### Upload d'un fichier

```bash
curl -X POST http://localhost:8080/api/files/upload \
  -F "file=@README.md" \
  -F "uploadedBy=test-user"
```

Réponse :
```json
{
  "success": true,
  "data": {
    "filename": "README.md",
    "storedPath": "abc123-def456.md",
    "mimeType": "text/markdown",
    "size": 1234,
    "checksum": "sha256hash..."
  }
}
```

#### Lister les fichiers

```bash
curl http://localhost:8080/api/files/list
```

#### Télécharger un fichier

```bash
curl -O http://localhost:8080/api/files/download/abc123-def456.md
```

#### Statistiques

```bash
curl http://localhost:8080/api/files/stats
```

#### Supprimer un fichier

```bash
curl -X DELETE http://localhost:8080/api/files/abc123-def456.md
```

## 📁 Structure des Fichiers

Après avoir uploadé des fichiers, vous verrez :

```
workspace-data/
├── uploads/              # Vos fichiers uploadés
│   ├── abc123-def456.md
│   └── xyz789-uvw012.pdf
├── metadata/             # Métadonnées JSON
│   ├── abc123-def456.json
│   └── xyz789-uvw012.json
└── temp/                 # Fichiers temporaires (nettoyés automatiquement)
```

## 🔍 Vérifier les Métadonnées

Les métadonnées sont stockées en JSON :

```bash
cat workspace-data/metadata/abc123-def456.json
```

Contenu :
```json
{
  "id": "abc123-def456",
  "filename": "README.md",
  "size": 1234,
  "mimeType": "text/markdown",
  "uploadedAt": "2025-10-23T10:30:00.000Z",
  "uploadedBy": "test-user"
}
```

## 🎯 Prochaines Étapes

Maintenant que le stockage de fichiers fonctionne, les prochaines étapes sont :

1. **Tâche 7.2** : Transfert de fichiers avec progression (chunked upload)
2. **Tâche 7.3** : Système de prévisualisation (thumbnails, PDF preview)
3. **Tâche 7.4** : Intégration avec le canvas (drag & drop, synchronisation)

## 📚 Documentation Complète

Pour plus de détails sur l'API, consultez :
- `FILE-STORAGE-API.md` - Documentation complète de l'API
- `PHASE-4-IMPLEMENTATION.md` - Détails de l'implémentation

## ⚠️ Limitations Actuelles

- Taille maximale : 1GB par fichier
- Types autorisés : images, PDF, texte, JSON, ZIP
- Pas de chunked upload (sera implémenté en 7.2)
- Pas de prévisualisation (sera implémenté en 7.3)
