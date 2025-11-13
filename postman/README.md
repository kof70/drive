# 📮 Collection Postman - Local Collaborative Workspace

## 📥 Import dans Postman

### Méthode 1 : Import de Fichiers

1. Ouvrir Postman
2. Cliquer sur **Import** (en haut à gauche)
3. Glisser-déposer ou sélectionner les fichiers :
   - `Local-Collaborative-Workspace.postman_collection.json`
   - `Local-Environment.postman_environment.json`
4. Cliquer sur **Import**

### Méthode 2 : Import depuis le Dossier

1. Ouvrir Postman
2. Cliquer sur **Import**
3. Sélectionner l'onglet **Folder**
4. Choisir le dossier `postman/`
5. Cliquer sur **Import**

## 🔧 Configuration

### Sélectionner l'Environnement

1. En haut à droite de Postman
2. Sélectionner **Local Development** dans le menu déroulant
3. L'URL de base sera automatiquement `http://localhost:8080`

### Variables d'Environnement

| Variable | Valeur | Description |
|----------|--------|-------------|
| `baseUrl` | `http://localhost:8080` | URL de base de l'API |
| `uploadedBy` | `postman-user` | Nom d'utilisateur par défaut |

## 🚀 Utilisation

### Démarrer le Serveur

Avant d'utiliser la collection, démarrer le serveur :

```bash
cd /path/to/project
pnpm dev:server
# ou
pnpm dev
```

Le serveur démarre sur `http://localhost:8080`

### Tester les Endpoints

#### 1. Health Check
- **GET** `/api/health`
- Vérifie que le serveur fonctionne
- Pas de paramètres requis

#### 2. Configuration
- **GET** `/api/config`
- Récupère la configuration du serveur
- Retourne : `maxFileSize`, `enableMDNS`

#### 3. Utilisateurs Connectés
- **GET** `/api/users`
- Liste des utilisateurs WebSocket connectés
- Retourne : `connectedUsers[]`, `totalConnected`

#### 4. Statistiques Base de Données
- **GET** `/api/database/stats`
- Statistiques de la base de données
- Retourne : `elementCount`, `dbSize`, `dbPath`

#### 5. Backup Base de Données
- **POST** `/api/database/backup`
- Crée un backup manuel
- Retourne : `backupPath`, `message`

#### 6. Upload de Fichier
- **POST** `/api/files/upload`
- Upload un fichier (max 1GB)
- **Body** : `form-data`
  - `file` : Le fichier (requis)
  - `uploadedBy` : Nom utilisateur (optionnel)
- Retourne : `FileReference` avec `checksum`

#### 7. Télécharger un Fichier
- **GET** `/api/files/download/:filename`
- Télécharge un fichier
- **Param** : `filename` (storedPath du fichier)

#### 8. Supprimer un Fichier
- **DELETE** `/api/files/:filename`
- Supprime un fichier
- **Param** : `filename` (storedPath du fichier)

#### 9. Lister les Fichiers
- **GET** `/api/files/list`
- Liste tous les fichiers stockés
- Retourne : Array de `FileMetadata`

#### 10. Métadonnées d'un Fichier
- **GET** `/api/files/metadata/:fileId`
- Récupère les métadonnées
- **Param** : `fileId` (UUID du fichier)

#### 11. Statistiques de Stockage
- **GET** `/api/files/stats`
- Statistiques des fichiers
- Retourne : `totalFiles`, `totalSize`

#### 12. Vérifier l'Intégrité
- **POST** `/api/files/verify/:filename`
- Vérifie le checksum d'un fichier
- **Body** : `{ "checksum": "sha256..." }`
- Retourne : `{ "valid": true/false }`

## 📋 Exemples de Réponses

### Success Response
```json
{
  "success": true,
  "data": {
    // données...
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "FILE_001",
    "message": "Fichier trop volumineux"
  }
}
```

## 🔑 Codes d'Erreur

| Code | Description |
|------|-------------|
| `FILE_001` | Fichier trop volumineux (> 1GB) |
| `STORAGE_001` | Espace de stockage insuffisant |
| `AUTH_001` | Permission refusée |
| `NET_001` | Erreur réseau |

## 🧪 Scénario de Test Complet

### 1. Vérifier le Serveur
```
GET /api/health
→ Status: 200 OK
```

### 2. Uploader un Fichier
```
POST /api/files/upload
Body: form-data
  - file: test.txt
  - uploadedBy: john
→ Récupérer le storedPath
```

### 3. Lister les Fichiers
```
GET /api/files/list
→ Voir le fichier uploadé
```

### 4. Télécharger le Fichier
```
GET /api/files/download/{storedPath}
→ Fichier téléchargé
```

### 5. Vérifier l'Intégrité
```
POST /api/files/verify/{storedPath}
Body: { "checksum": "..." }
→ valid: true
```

### 6. Supprimer le Fichier
```
DELETE /api/files/{storedPath}
→ deleted: true
```

## 📊 Tests Automatisés

La collection inclut des exemples de réponses pour chaque endpoint. Vous pouvez :

1. Exécuter toute la collection : **Runner** → Sélectionner la collection
2. Tester un dossier : Clic droit sur le dossier → **Run**
3. Tester un endpoint : Cliquer sur **Send**

## 🔗 Liens Utiles

- [Documentation API Complète](../docs/api/FILES.md)
- [Guide de Test](../docs/tests/GUIDE-TESTS.md)
- [README Principal](../README.md)

## 💡 Astuces

### Variables dans les Requêtes

Utilisez `{{baseUrl}}` dans vos requêtes pour faciliter le changement d'environnement.

### Sauvegarder les Réponses

Après un upload, sauvegardez le `storedPath` dans une variable pour les requêtes suivantes :

```javascript
// Dans Tests (onglet Tests de la requête)
pm.environment.set("lastUploadedFile", pm.response.json().data.storedPath);
```

### Chaîner les Requêtes

1. Upload → Sauvegarder `storedPath`
2. Download → Utiliser `{{lastUploadedFile}}`
3. Delete → Utiliser `{{lastUploadedFile}}`

## 🐛 Dépannage

### Erreur de Connexion

- Vérifier que le serveur est démarré : `pnpm dev:server`
- Vérifier l'URL : `http://localhost:8080`
- Vérifier le port (8080 par défaut)

### Upload Échoue

- Vérifier la taille du fichier (max 1GB)
- Vérifier le type MIME (images, PDF, texte, JSON, ZIP)
- Vérifier l'espace disque disponible

### Fichier Non Trouvé

- Vérifier que le `storedPath` est correct
- Vérifier que le fichier existe : `ls workspace-data/uploads/`

---

**Version :** 1.5.0  
**Dernière mise à jour :** 24 Octobre 2025
