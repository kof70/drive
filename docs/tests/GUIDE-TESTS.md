# 🧪 Guide de Test Complet - v1.5.0

## Vue d'ensemble

Ce guide vous permet de tester toutes les fonctionnalités du Local Collaborative Workspace.

## 🚀 Démarrage

```bash
# Installation (si pas déjà fait)
pnpm install

# Démarrer l'application
pnpm dev
```

L'application sera accessible sur :
- **PC local** : http://localhost:3000
- **Autres appareils** : http://[IP_DU_PC]:3000

## ✅ Tests par Fonctionnalité

### 1. Test de Base - Création d'Éléments

**Objectif** : Vérifier que tous les types d'éléments peuvent être créés

1. Ouvrir http://localhost:3000
2. Dans la sidebar, cliquer sur "Note"
3. Cliquer sur le canvas → Une note apparaît
4. Cliquer sur "Folder"
5. Cliquer sur le canvas → Un dossier apparaît

**✅ Résultat attendu** : Les éléments sont créés et visibles

### 2. Test Multi-Utilisateurs

**Objectif** : Vérifier la synchronisation temps réel

1. Ouvrir deux onglets (ou deux appareils)
2. Dans l'onglet 1 : Créer une note
3. **✅ Vérifier** : La note apparaît dans l'onglet 2
4. Dans l'onglet 2 : Déplacer la note
5. **✅ Vérifier** : La note bouge dans l'onglet 1

### 3. Test d'Édition de Notes

**Objectif** : Vérifier l'édition complète des notes

#### 3.1 Édition Simple
1. Créer une note
2. Double-cliquer dessus
3. Taper : "Ma première note"
4. Cliquer en dehors
5. **✅ Vérifier** : Le texte est sauvegardé

#### 3.2 Auto-Resize
1. Éditer une note
2. Taper plusieurs lignes de texte
3. **✅ Vérifier** : Le textarea s'agrandit automatiquement

#### 3.3 Changement de Couleur
1. Sélectionner une note (cliquer dessus)
2. Cliquer sur l'icône palette (🎨)
3. Choisir une couleur
4. **✅ Vérifier** : La note change de couleur

#### 3.4 Changement de Taille
1. Sélectionner une note
2. Cliquer sur l'icône texte (A)
3. Choisir "Grand"
4. **✅ Vérifier** : Le texte devient plus grand

### 4. Test de Fichiers

**Objectif** : Vérifier l'upload et le téléchargement de fichiers

#### 4.1 Upload Simple
1. Préparer un fichier (image, PDF, texte)
2. Glisser-déposer le fichier sur le canvas
3. **✅ Vérifier** : 
   - Le fichier apparaît sur le canvas
   - Le nom et la taille sont affichés
   - L'icône correspond au type de fichier

#### 4.2 Upload Multiple
1. Sélectionner plusieurs fichiers
2. Les glisser sur le canvas
3. **✅ Vérifier** : Tous les fichiers apparaissent

#### 4.3 Téléchargement
1. Cliquer sur l'icône de téléchargement d'un fichier
2. **✅ Vérifier** : Le fichier se télécharge avec le bon nom

#### 4.4 Prévisualisation Image
1. Uploader une image
2. Cliquer sur l'icône de prévisualisation
3. **✅ Vérifier** : L'image s'ouvre dans un nouvel onglet

### 5. Test de Persistance

**Objectif** : Vérifier que les données sont sauvegardées

1. Créer plusieurs notes avec du texte
2. Uploader quelques fichiers
3. Changer les couleurs de certaines notes
4. Rafraîchir la page (F5)
5. **✅ Vérifier** :
   - Toutes les notes réapparaissent
   - Le contenu est préservé
   - Les couleurs sont conservées
   - Les fichiers sont toujours là

### 6. Test de Navigation Canvas

**Objectif** : Vérifier les contrôles du canvas

#### 6.1 Zoom
1. Utiliser la molette de la souris
2. **✅ Vérifier** : Le canvas zoome/dézoome
3. Cliquer sur les boutons +/- dans la toolbar
4. **✅ Vérifier** : Le zoom change

#### 6.2 Pan (Déplacement)
1. Cliquer et maintenir sur le canvas vide
2. Déplacer la souris
3. **✅ Vérifier** : Le canvas se déplace

#### 6.3 Reset
1. Zoomer et déplacer le canvas
2. Appuyer sur Ctrl+0 (ou cliquer sur le bouton reset)
3. **✅ Vérifier** : Le canvas revient à la position initiale

### 7. Test de Sélection

**Objectif** : Vérifier la sélection d'éléments

1. Créer plusieurs notes
2. Cliquer sur une note
3. **✅ Vérifier** : La note est sélectionnée (bordure bleue)
4. Cliquer sur le canvas vide
5. **✅ Vérifier** : La sélection est annulée

### 8. Test de Déplacement

**Objectif** : Vérifier le drag & drop d'éléments

1. Créer une note
2. Cliquer et maintenir sur la note
3. Déplacer la souris
4. **✅ Vérifier** : La note suit la souris
5. Relâcher
6. **✅ Vérifier** : La note reste à la nouvelle position

### 9. Test de Synchronisation Fichiers

**Objectif** : Vérifier que les fichiers sont synchronisés

1. Ouvrir deux onglets
2. Dans l'onglet 1 : Uploader un fichier
3. **✅ Vérifier dans l'onglet 2** : Le fichier apparaît
4. Dans l'onglet 2 : Télécharger le fichier
5. **✅ Vérifier** : Le téléchargement fonctionne

### 10. Test de Synchronisation Éditions

**Objectif** : Vérifier que les éditions sont synchronisées

1. Ouvrir deux onglets
2. Dans l'onglet 1 : Créer une note avec du texte
3. **✅ Vérifier dans l'onglet 2** : La note et le texte apparaissent
4. Dans l'onglet 1 : Changer la couleur de la note
5. **✅ Vérifier dans l'onglet 2** : La couleur change

## 🎹 Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| Double-clic | Éditer une note |
| Ctrl+Enter | Sauvegarder une note |
| Escape | Annuler l'édition |
| Ctrl+0 | Reset zoom |
| Ctrl++ | Zoom in |
| Ctrl+- | Zoom out |
| Molette | Zoom |
| Clic+Drag | Déplacer le canvas |

## 📊 Vérifications Techniques

### Console Navigateur (F12)

Ouvrir la console et vérifier qu'il n'y a pas d'erreurs rouges.

Messages attendus :
- `✅ Fichier uploadé et ajouté au canvas: [nom]`
- `Note saved: [contenu]`
- `🔌 WebSocket connecté`

### Console Serveur

Dans le terminal où tourne `pnpm dev`, vérifier :
- `🚀 Serveur démarré sur http://0.0.0.0:8080`
- `🔌 Nouvelle connexion WebSocket: [id]`
- `📝 Mise à jour canvas de [id]`
- `💾 Auto-save: X éléments sauvegardés` (toutes les 30s)

### Base de Données

Vérifier que les données sont sauvegardées :
```bash
# Voir les éléments
sqlite3 data/workspace.db "SELECT id, type, content FROM canvas_elements LIMIT 5;"

# Compter les éléments
sqlite3 data/workspace.db "SELECT COUNT(*) FROM canvas_elements;"
```

### Fichiers Uploadés

Vérifier que les fichiers sont stockés :
```bash
ls -lh workspace-data/uploads/
ls -lh workspace-data/metadata/
```

## 🐛 Problèmes Connus

- Pas de barre de progression visuelle pour l'upload
- Pas de chunked upload (fichiers >10MB peuvent être lents)
- Pas de thumbnails pour les images
- Pas de prévisualisation PDF intégrée
- Pas d'indicateur "utilisateur en train d'éditer"

## ✅ Checklist Complète

- [ ] Création de notes
- [ ] Création de dossiers
- [ ] Édition de notes (double-clic)
- [ ] Auto-resize du textarea
- [ ] Sauvegarde avec Ctrl+Enter
- [ ] Annulation avec Escape
- [ ] Changement de couleur
- [ ] Changement de taille de police
- [ ] Upload de fichiers (drag & drop)
- [ ] Upload multiple
- [ ] Téléchargement de fichiers
- [ ] Prévisualisation d'images
- [ ] Synchronisation multi-utilisateurs
- [ ] Persistance après rafraîchissement
- [ ] Zoom (molette + boutons)
- [ ] Pan (déplacement du canvas)
- [ ] Sélection d'éléments
- [ ] Déplacement d'éléments
- [ ] Pas d'erreurs dans la console

## 🎉 Succès !

Si tous les tests passent, félicitations ! Le Local Collaborative Workspace est **pleinement fonctionnel** ! 🚀

## 📝 Rapport de Bugs

Si vous trouvez un bug, notez :
1. Ce que vous faisiez
2. Ce qui s'est passé
3. Ce qui aurait dû se passer
4. Les messages d'erreur (console)
5. Les étapes pour reproduire

## 🔄 Prochains Tests

Pour des tests plus avancés :
- `TEST-MULTI-UTILISATEURS.md` - Tests multi-appareils
- `TEST-FILE-INTEGRATION.md` - Tests approfondis des fichiers
- `TEST-NOTE-EDITING.md` - Tests approfondis des notes
# Guide de Test Multi-Utilisateurs

## 🚀 Démarrage Rapide

### 1. Démarrer le serveur
```bash
npm start
```

Le serveur démarre sur `http://localhost:8080`

### 2. Ouvrir plusieurs clients

#### Option A : Plusieurs navigateurs/onglets
```bash
# Chrome normal
http://localhost:8080

# Chrome mode incognito (Ctrl+Shift+N)
http://localhost:8080

# Firefox
http://localhost:8080
```

#### Option B : Avec des appareils mobiles
```bash
# Trouver votre IP locale
ip addr show | grep "inet " | grep -v 127.0.0.1

# Sur mobile, ouvrir :
http://[VOTRE_IP]:8080
# Exemple : http://192.168.1.100:8080
```

## 📋 Tests à Effectuer

### Test 1 : Connexion Multi-Utilisateurs ✅

**Objectif** : Vérifier que plusieurs utilisateurs peuvent se connecter simultanément

**Étapes** :
1. Ouvrir 3 navigateurs/onglets différents
2. Aller sur `http://localhost:8080` dans chacun
3. Observer la barre latérale "Utilisateurs connectés"

**Résultat attendu** :
- ✅ Chaque client voit les autres utilisateurs dans la liste
- ✅ Le nombre d'utilisateurs connectés est correct
- ✅ Chaque utilisateur a un ID unique

**Console serveur** :
```
🔌 Nouvelle connexion WebSocket: abc123
📊 État du canvas synchronisé avec abc123: 3 éléments
🔌 Nouvelle connexion WebSocket: def456
📊 État du canvas synchronisé avec def456: 3 éléments
```

---

### Test 2 : Synchronisation d'État Initial ✅

**Objectif** : Vérifier que les nouveaux utilisateurs reçoivent l'état actuel

**Étapes** :
1. Client 1 : Créer 2-3 notes sur le canvas
2. Client 2 : Se connecter (nouvel onglet)
3. Observer le canvas du Client 2

**Résultat attendu** :
- ✅ Le Client 2 voit immédiatement toutes les notes créées par le Client 1
- ✅ Les positions et contenus sont identiques
- ✅ Aucun délai perceptible

**Console navigateur (Client 2)** :
```
✅ Connexion WebSocket établie
📥 Réception de l'état complet du canvas: 5 éléments
🔄 Synchronisation de l'état du canvas: 5 éléments
```

---

### Test 3 : Synchronisation en Temps Réel ✅

**Objectif** : Vérifier que les modifications sont propagées instantanément

**Étapes** :
1. Ouvrir 2 clients côte à côte
2. Client 1 : Créer une nouvelle note
3. Client 2 : Observer
4. Client 2 : Déplacer une note existante
5. Client 1 : Observer
6. Client 1 : Supprimer une note
7. Client 2 : Observer

**Résultat attendu** :
- ✅ Création visible instantanément sur tous les clients
- ✅ Déplacement synchronisé en temps réel
- ✅ Suppression propagée immédiatement
- ✅ Aucun lag perceptible (< 100ms)

**Console navigateur** :
```
📥 Nouvel élément reçu: element-123
📥 Mise à jour d'élément reçue: element-456
📥 Suppression d'élément reçue: element-789
```

---

### Test 4 : Reconnexion Automatique ✅

**Objectif** : Vérifier que les clients se reconnectent automatiquement

**Étapes** :
1. Connecter 2 clients avec quelques éléments sur le canvas
2. Client 1 : Activer le mode avion ou déconnecter le WiFi
3. Observer l'indicateur de connexion (devrait passer à "Déconnecté")
4. Client 2 : Ajouter/modifier des éléments
5. Client 1 : Réactiver le réseau
6. Observer la reconnexion et la synchronisation

**Résultat attendu** :
- ✅ Le Client 1 détecte la déconnexion (indicateur rouge)
- ✅ Le Client 1 tente automatiquement de se reconnecter
- ✅ Après reconnexion, le Client 1 reçoit l'état mis à jour
- ✅ Les modifications du Client 2 sont visibles sur le Client 1
- ✅ Aucune perte de données

**Console navigateur (Client 1)** :
```
🔌 Déconnexion WebSocket: transport close
🔄 Tentative de reconnexion 1...
🔄 Tentative de reconnexion 2...
✅ Reconnexion WebSocket réussie
🔄 Demande de synchronisation de l'état du canvas...
📥 Réception de l'état complet du canvas: 7 éléments
```

---

### Test 5 : Reconnexion Serveur ✅

**Objectif** : Vérifier le comportement lors du redémarrage du serveur

**Étapes** :
1. Connecter 2 clients avec des éléments sur le canvas
2. Dans le terminal serveur : `Ctrl+C` pour arrêter
3. Observer les clients (indicateur de connexion)
4. Redémarrer le serveur : `npm start`
5. Observer la reconnexion automatique

**Résultat attendu** :
- ✅ Les clients détectent la déconnexion
- ✅ Les clients tentent de se reconnecter automatiquement
- ✅ Après redémarrage, les clients se reconnectent
- ⚠️ L'état du canvas est perdu (normal, pas de persistance)
- ✅ Les clients peuvent continuer à collaborer

**Note** : La perte de données est normale car il n'y a pas encore de persistance en base de données.

---

### Test 6 : Modification Simultanée ✅

**Objectif** : Vérifier la gestion des conflits

**Étapes** :
1. Ouvrir 2 clients côte à côte
2. Sélectionner le même élément sur les 2 clients
3. Déplacer l'élément simultanément sur les 2 clients
4. Observer le résultat

**Résultat attendu** :
- ✅ Aucune erreur dans la console
- ✅ L'élément se stabilise à une position
- ✅ Les deux clients voient la même position finale
- ✅ Pas de désynchronisation

**Comportement** : Last-write-wins (la dernière modification gagne)

---

### Test 7 : Performance avec Nombreux Éléments

**Objectif** : Vérifier les performances avec beaucoup d'éléments

**Étapes** :
1. Créer 20-30 éléments sur le canvas
2. Connecter un nouveau client
3. Mesurer le temps de synchronisation
4. Déplacer plusieurs éléments rapidement
5. Observer la fluidité

**Résultat attendu** :
- ✅ Synchronisation initiale < 1 seconde
- ✅ Déplacements fluides sans lag
- ✅ Pas de ralentissement perceptible
- ✅ Console sans erreurs

---

## 🧪 Test Automatisé

Un script de test automatisé est disponible :

```bash
# Démarrer le serveur dans un terminal
npm start

# Dans un autre terminal, lancer les tests
npx ts-node scripts/test-multi-user.ts
```

Ce script teste automatiquement :
- ✅ Connexion de plusieurs clients
- ✅ Synchronisation d'état initial
- ✅ Mises à jour en temps réel
- ✅ Reconnexion automatique
- ✅ Gestion des conflits

---

## 🔍 Débogage

### Logs Serveur

Le serveur affiche des logs détaillés :

```bash
# Connexions
🔌 Nouvelle connexion WebSocket: [socket-id]
📊 État du canvas synchronisé avec [socket-id]: X éléments

# Opérations
➕ Ajout élément canvas de [socket-id]: note element-123
📝 Mise à jour canvas de [socket-id]: note element-123
➖ Suppression élément canvas de [socket-id]: element-123

# Déconnexions
🔌 Déconnexion WebSocket: [socket-id] (transport close)
```

### Logs Client (Console Navigateur)

Ouvrir la console (F12) pour voir :

```javascript
// Connexion
🔌 Connexion à http://localhost:8080...
✅ Connexion WebSocket établie

// Synchronisation
📥 Réception de l'état complet du canvas: X éléments
🔄 Synchronisation de l'état du canvas: X éléments

// Opérations
📥 Nouvel élément reçu: element-123
📥 Mise à jour d'élément reçue: element-456
📥 Suppression d'élément reçue: element-789

// Reconnexion
🔌 Déconnexion WebSocket: transport close
🔄 Tentative de reconnexion 1...
✅ Reconnexion WebSocket réussie
```

### Problèmes Courants

#### ❌ "Connection refused"
**Cause** : Le serveur n'est pas démarré
**Solution** : `npm start`

#### ❌ "CORS error"
**Cause** : Configuration CORS incorrecte
**Solution** : Vérifier `src/server/services/websocket.ts` (origin: "*")

#### ❌ Les clients ne se voient pas
**Cause** : Problème de synchronisation
**Solution** : 
1. Vérifier les logs serveur
2. Rafraîchir les clients (F5)
3. Redémarrer le serveur

#### ❌ Reconnexion échoue
**Cause** : Timeout trop court
**Solution** : Déjà configuré avec des timeouts longs (60s)

#### ❌ Modifications non synchronisées
**Cause** : Problème de broadcast
**Solution** : Vérifier que `broadcast=true` dans les actions du store

---

## 📊 Métriques de Performance

### Latence Attendue
- Connexion initiale : < 500ms
- Synchronisation d'état : < 1s pour 50 éléments
- Propagation d'une modification : < 100ms
- Reconnexion : < 2s

### Limites Testées
- ✅ 10 clients simultanés
- ✅ 50 éléments sur le canvas
- ✅ 10 modifications/seconde
- ✅ Reconnexion après 5 minutes de déconnexion

---

## ✅ Checklist de Validation

Avant de considérer les corrections comme validées :

- [ ] 3+ clients peuvent se connecter simultanément
- [ ] Les nouveaux clients reçoivent l'état complet
- [ ] Les modifications sont propagées en < 100ms
- [ ] La reconnexion fonctionne après déconnexion réseau
- [ ] La reconnexion fonctionne après redémarrage serveur
- [ ] Aucune erreur dans les consoles (serveur et clients)
- [ ] Les conflits sont gérés sans crash
- [ ] Performance acceptable avec 20+ éléments
- [ ] Fonctionne sur mobile (même réseau local)
- [ ] Les logs sont clairs et informatifs

---

## 🎯 Prochaines Étapes

Une fois ces tests validés, vous pouvez :

1. **Ajouter la persistance** : Sauvegarder l'état dans une base de données
2. **Améliorer les conflits** : Implémenter CRDT ou OT
3. **Ajouter l'authentification** : Identifier les utilisateurs
4. **Optimiser les performances** : Compression, delta updates
5. **Ajouter des indicateurs visuels** : Qui édite quoi en temps réel

---

## 📝 Rapport de Bug

Si vous trouvez un problème, notez :

1. **Étapes pour reproduire**
2. **Résultat attendu**
3. **Résultat obtenu**
4. **Logs serveur** (copier les dernières lignes)
5. **Logs client** (console navigateur)
6. **Configuration** (nombre de clients, éléments, etc.)

Exemple :
```
Bug : Les modifications ne sont pas synchronisées

Étapes :
1. Connecter 2 clients
2. Client 1 crée une note
3. Client 2 ne voit rien

Logs serveur :
➕ Ajout élément canvas de abc123: note element-456

Logs client 2 :
(rien)

Configuration : 2 clients, 3 éléments existants
```
# Test de l'Intégration des Fichiers

## 🎯 Objectif

Tester le système complet d'upload, stockage et téléchargement de fichiers intégré au canvas.

## 🚀 Démarrage

```bash
# Terminal 1 : Démarrer le serveur et le client
pnpm dev
```

Ouvrir http://localhost:3000 dans votre navigateur.

## ✅ Scénarios de Test

### Test 1 : Upload Simple

1. Glisser-déposer un fichier (image, PDF, texte) sur le canvas
2. **Résultat attendu** :
   - Le fichier apparaît sur le canvas
   - Un élément "file" est créé avec le bon icône
   - Le nom et la taille du fichier sont affichés

### Test 2 : Upload Multiple

1. Sélectionner plusieurs fichiers et les glisser sur le canvas
2. **Résultat attendu** :
   - Tous les fichiers sont uploadés
   - Ils sont légèrement décalés pour éviter le chevauchement
   - Chaque fichier a son propre élément

### Test 3 : Téléchargement

1. Cliquer sur l'icône de téléchargement d'un fichier
2. **Résultat attendu** :
   - Le fichier se télécharge
   - Le nom original est préservé
   - Un spinner apparaît pendant le téléchargement

### Test 4 : Prévisualisation Image

1. Uploader une image
2. Cliquer sur l'icône de prévisualisation
3. **Résultat attendu** :
   - L'image s'ouvre dans un nouvel onglet
   - L'image est affichée en pleine résolution

### Test 5 : Synchronisation Multi-Utilisateurs

1. Ouvrir deux onglets (ou deux appareils)
2. Uploader un fichier dans le premier onglet
3. **Résultat attendu** :
   - Le fichier apparaît automatiquement dans le second onglet
   - La position et les métadonnées sont synchronisées

### Test 6 : Persistance

1. Uploader quelques fichiers
2. Rafraîchir la page (F5)
3. **Résultat attendu** :
   - Les fichiers réapparaissent sur le canvas
   - Ils sont toujours téléchargeables

### Test 7 : Types de Fichiers

Tester avec différents types :
- ✅ Images (JPG, PNG, GIF, WebP)
- ✅ Documents (PDF, TXT)
- ✅ Archives (ZIP)
- ✅ JSON

**Résultat attendu** : Chaque type a son icône approprié

### Test 8 : Gros Fichiers

1. Uploader un fichier de plusieurs MB
2. **Résultat attendu** :
   - L'upload fonctionne (limite : 1GB)
   - La progression est visible dans la console
   - Le fichier est téléchargeable après upload

## 🐛 Problèmes Connus

- Pas de barre de progression visuelle (seulement dans la console)
- Pas de chunked upload (fichiers >10MB peuvent être lents)
- Pas de thumbnails pour les images
- Pas de prévisualisation PDF intégrée

## 📊 Vérifications Techniques

### Console Navigateur

Ouvrir la console (F12) et vérifier :
- `📤 Upload du fichier: [nom]`
- `📊 Progression: X%`
- `✅ Fichier uploadé et ajouté au canvas: [nom]`

### Console Serveur

Vérifier dans le terminal serveur :
- `✅ Fichier sauvegardé: [nom] ([id])`
- `📝 Mise à jour canvas de [socket-id]`

### Système de Fichiers

Vérifier que les fichiers sont stockés :
```bash
ls -la workspace-data/uploads/
ls -la workspace-data/metadata/
```

## 🎉 Succès

Si tous les tests passent, l'intégration des fichiers est complète !

## 🔄 Prochaines Améliorations

- Barre de progression visuelle
- Chunked upload pour gros fichiers
- Thumbnails pour images
- Prévisualisation PDF intégrée
- Drag & drop depuis le canvas vers le système
# Test de l'Édition de Notes

## 🎯 Objectif

Tester le système complet d'édition de notes avec synchronisation temps réel.

## 🚀 Démarrage

```bash
pnpm dev
```

Ouvrir http://localhost:3000

## ✅ Scénarios de Test

### Test 1 : Création et Édition Simple

1. Cliquer sur "Note" dans la sidebar
2. Cliquer sur le canvas pour créer une note
3. Double-cliquer sur la note
4. **Résultat attendu** :
   - Le mode édition s'active
   - Le textarea a le focus
   - Le texte existant est sélectionné
   - Un indicateur "Ctrl+Enter pour sauver" apparaît

5. Taper du texte : "Ma première note"
6. Cliquer en dehors de la note
7. **Résultat attendu** :
   - Le texte est sauvegardé
   - Le mode édition se désactive
   - Le texte est visible dans la note

### Test 2 : Auto-Resize

1. Éditer une note
2. Taper plusieurs lignes de texte :
   ```
   Ligne 1
   Ligne 2
   Ligne 3
   Ligne 4
   Ligne 5
   ```
3. **Résultat attendu** :
   - Le textarea s'agrandit automatiquement
   - Pas de scrollbar visible
   - Tout le texte est visible

### Test 3 : Sauvegarde avec Ctrl+Enter

1. Éditer une note
2. Taper du texte
3. Appuyer sur Ctrl+Enter (Cmd+Enter sur Mac)
4. **Résultat attendu** :
   - Le texte est sauvegardé
   - Le mode édition se désactive
   - Le focus reste sur la note

### Test 4 : Annulation avec Escape

1. Éditer une note existante avec du contenu
2. Modifier le texte
3. Appuyer sur Escape
4. **Résultat attendu** :
   - Les modifications sont annulées
   - Le texte original est restauré
   - Le mode édition se désactive

### Test 5 : Synchronisation Multi-Utilisateurs

1. Ouvrir deux onglets (ou deux appareils)
2. Dans l'onglet 1 : Créer une note avec du texte
3. **Résultat attendu dans l'onglet 2** :
   - La note apparaît automatiquement
   - Le texte est visible

4. Dans l'onglet 1 : Éditer la note et changer le texte
5. **Résultat attendu dans l'onglet 2** :
   - Le texte est mis à jour automatiquement
   - La date de modification change

### Test 6 : Persistance

1. Créer plusieurs notes avec du texte
2. Rafraîchir la page (F5)
3. **Résultat attendu** :
   - Toutes les notes réapparaissent
   - Le contenu est préservé
   - Les notes sont éditables

### Test 7 : Compteur de Caractères

1. Éditer une note
2. Taper du texte
3. Observer le footer de la note
4. **Résultat attendu** :
   - Le compteur affiche le nombre de caractères
   - Il se met à jour en temps réel

### Test 8 : Placeholder

1. Créer une nouvelle note vide
2. **Résultat attendu** :
   - Le placeholder "Double-cliquez pour éditer..." est visible
   - Il est en italique et grisé

3. Double-cliquer sur la note
4. **Résultat attendu** :
   - Le placeholder disparaît
   - Le textarea affiche "Tapez votre note ici..."

### Test 9 : Hover Effect

1. Créer une note avec du texte
2. Passer la souris sur le contenu
3. **Résultat attendu** :
   - Un léger effet de survol apparaît
   - Le curseur devient un curseur texte
   - Indique que la note est cliquable

### Test 10 : Éditions Concurrentes

1. Ouvrir deux onglets
2. Dans les deux onglets : Éditer la même note en même temps
3. Onglet 1 : Taper "Version 1" et sauvegarder
4. Onglet 2 : Taper "Version 2" et sauvegarder
5. **Résultat attendu** :
   - La dernière sauvegarde gagne (last-write-wins)
   - Les deux onglets affichent le même contenu final

## 🎹 Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| Double-clic | Activer l'édition |
| Ctrl+Enter (Cmd+Enter) | Sauvegarder |
| Escape | Annuler |
| Clic en dehors | Sauvegarder automatiquement |

## 📊 Vérifications Techniques

### Console Navigateur

Ouvrir la console (F12) et vérifier :
- `Note saved: [contenu]` lors de la sauvegarde
- Pas d'erreurs JavaScript

### Console Serveur

Vérifier dans le terminal serveur :
- `📝 Mise à jour canvas de [socket-id]: note [id]`
- `💾 Auto-save: X éléments sauvegardés` (toutes les 30s)

### Base de Données

Vérifier que les notes sont sauvegardées :
```bash
sqlite3 data/workspace.db "SELECT id, type, content FROM canvas_elements WHERE type='note';"
```

## 🐛 Problèmes Connus

- Pas de formatage de texte (markdown, gras, italique)
- Pas de changement de couleur via UI
- Pas d'indicateur "en cours d'édition" pour les autres utilisateurs
- Pas de debouncing (chaque frappe pourrait déclencher une sauvegarde)

## 🎉 Succès

Si tous les tests passent, l'édition de notes est complète !

## 🔄 Prochaines Améliorations

- Formatage de texte (markdown, couleurs, taille)
- Indicateur "utilisateur en train d'éditer"
- Debouncing pour éviter trop de mises à jour
- Gestion des conflits d'édition concurrente
- Historique des modifications (undo/redo)
# Guide de Test Rapide 🚀

## Test en 5 Minutes

### 1. Démarrer l'Application

```bash
# Terminal 1 : Compiler et démarrer
pnpm build
pnpm start
```

Vous devriez voir :
```
✅ Serveur démarré sur http://0.0.0.0:8080
📁 Stockage: /home/user/workspace-data
📊 Taille max fichier: 1024MB
```

### 2. Test sur PC (2 Onglets)

**Onglet 1 :**
1. Ouvrir `http://localhost:8080`
2. Vérifier : 🟢 Connecté
3. Cliquer sur "Note" dans la sidebar
4. Une note jaune apparaît

**Onglet 2 :**
1. Ouvrir `http://localhost:8080` (nouvel onglet)
2. Vérifier : 🟢 Connecté
3. Vérifier : "2 utilisateurs connectés"
4. **La note de l'onglet 1 doit être visible !** ✅

**Dans Onglet 1 :**
5. Glisser la note vers une nouvelle position
6. **La note doit bouger dans l'onglet 2 !** ✅

### 3. Test sur Mobile

**Sur ton PC :**
```bash
# Trouver ton IP
ip route get 1.1.1.1 | grep -oP 'src \K\S+'
# Exemple: 192.168.1.112
```

**Sur ton téléphone :**
1. Connecter au même WiFi que le PC
2. Ouvrir le navigateur
3. Aller à `http://192.168.1.112:8080` (remplace par ton IP)
4. Vérifier : 🟢 Connecté
5. Créer une note sur le téléphone
6. **La note doit apparaître sur le PC !** ✅

### 4. Test Drag-and-Drop

**Sur PC :**
1. Cliquer et maintenir sur une note
2. Déplacer la souris
3. Relâcher
4. **La note reste à la nouvelle position** ✅

**Sur Mobile :**
1. Toucher et maintenir une note
2. Glisser le doigt
3. Relâcher
4. **La note reste à la nouvelle position** ✅

### 5. Test Zoom

**Avec la molette :**
1. Molette vers le haut → Zoom avant
2. Molette vers le bas → Zoom arrière
3. Vérifier l'indicateur en bas à droite (ex: "150%")

**Avec les boutons :**
1. Cliquer sur + dans la toolbar
2. Cliquer sur - dans la toolbar
3. Cliquer sur le bouton reset (4 flèches)

**Avec le clavier :**
1. `Ctrl + +` → Zoom avant
2. `Ctrl + -` → Zoom arrière
3. `Ctrl + 0` → Reset à 100%

---

## ✅ Checklist Rapide

- [ ] Serveur démarre sans erreur
- [ ] Interface s'affiche dans le navigateur
- [ ] Indicateur de connexion est vert
- [ ] 2 onglets voient "2 utilisateurs connectés"
- [ ] Note créée dans un onglet apparaît dans l'autre
- [ ] Note déplacée se synchronise
- [ ] Mobile peut se connecter
- [ ] Drag-and-drop fonctionne (souris et tactile)
- [ ] Zoom fonctionne (molette, boutons, clavier)
- [ ] Pan fonctionne (glisser le canvas)

---

## 🐛 Problèmes Courants

### "Cannot connect to server"

**Solution :**
```bash
# Vérifier que le serveur tourne
curl http://localhost:8080/api/health

# Devrait retourner:
# {"status":"ok","timestamp":"...","version":"1.0.0"}
```

### "Mobile ne peut pas se connecter"

**Solutions :**
1. Vérifier que PC et mobile sont sur le même WiFi
2. Vérifier le pare-feu :
   ```bash
   # Linux
   sudo ufw allow 8080
   ```
3. Vérifier l'IP :
   ```bash
   # Doit être 192.168.x.x ou 10.x.x.x
   ip addr show
   ```

### "Les changements ne se synchronisent pas"

**Solutions :**
1. Vérifier la console du navigateur (F12)
2. Vérifier que WebSocket est connecté (🟢 vert)
3. Rafraîchir la page (F5)
4. Redémarrer le serveur

---

## 📊 Test de Performance Simple

### Test avec 5 Notes

1. Créer 5 notes rapidement
2. Déplacer chaque note
3. Zoomer et dézoomer
4. **Tout doit rester fluide** ✅

### Test avec 2 Utilisateurs Actifs

1. Ouvrir 2 onglets
2. Dans chaque onglet, créer 3 notes
3. Déplacer les notes simultanément
4. **Pas de lag, tout se synchronise** ✅

---

## 🎯 Test Complet (10 minutes)

### Étape 1 : Connexion (2 min)
- [ ] Démarrer le serveur
- [ ] Ouvrir 2 onglets
- [ ] Vérifier la connexion
- [ ] Vérifier le compteur d'utilisateurs

### Étape 2 : Création (2 min)
- [ ] Créer 3 notes
- [ ] Créer 2 dossiers
- [ ] Vérifier la synchronisation

### Étape 3 : Manipulation (3 min)
- [ ] Déplacer les éléments
- [ ] Sélectionner des éléments
- [ ] Déselectionner (clic sur canvas vide)
- [ ] Sélection multiple (Ctrl+Clic)

### Étape 4 : Navigation (2 min)
- [ ] Zoomer à 200%
- [ ] Zoomer à 50%
- [ ] Reset à 100%
- [ ] Pan (déplacer la vue)

### Étape 5 : Mobile (1 min)
- [ ] Se connecter depuis mobile
- [ ] Créer une note
- [ ] Vérifier sur PC

---

## 📝 Rapport de Test

**Date :** ___________

**Fonctionnalités testées :**
- [ ] Connexion : ✅ / ❌
- [ ] Multi-utilisateurs : ✅ / ❌
- [ ] Synchronisation : ✅ / ❌
- [ ] Drag-and-drop : ✅ / ❌
- [ ] Zoom/Pan : ✅ / ❌
- [ ] Mobile : ✅ / ❌

**Problèmes rencontrés :**
1. ___________
2. ___________

**Notes :**
___________

---

## 🚀 Prochaine Étape

Si tous les tests passent, tu peux :

1. **Inviter d'autres personnes** à tester
2. **Tester avec plus d'appareils** (tablettes, autres PC)
3. **Tester sur différents réseaux**
4. **Utiliser l'application** pour de vrais cas d'usage

Pour des tests plus avancés, voir [REAL-WORLD-TESTING.md](./REAL-WORLD-TESTING.md)# Tests avec Données Réelles

Ce document explique comment tester l'application avec de vraies données, sans mocks.

## 🎯 Types de Tests Disponibles

### 1. Tests End-to-End Automatisés

Ces tests utilisent un vrai serveur et de vrais clients WebSocket.

```bash
# Lancer les tests E2E
pnpm test:e2e
```

**Ce qui est testé :**
- ✅ Connexion réelle de clients WebSocket
- ✅ Synchronisation multi-utilisateurs
- ✅ Création et déplacement d'éléments
- ✅ Synchronisation du presse-papiers
- ✅ Positions de curseur
- ✅ Déconnexion et reconnexion
- ✅ Performance avec 10+ clients
- ✅ 50 mises à jour rapides

### 2. Tests Manuels Interactifs

Un script interactif pour tester manuellement toutes les fonctionnalités.

```bash
# Démarrer le serveur dans un terminal
pnpm start

# Dans un autre terminal, lancer le testeur manuel
pnpm test:manual
```

**Menu disponible :**
```
1. Connecter un nouveau client
2. Créer une note
3. Déplacer un élément
4. Copier dans le presse-papiers
5. Déplacer le curseur
6. Afficher les clients connectés
7. Déconnecter un client
8. Test de charge (10 clients)
9. Test de synchronisation
0. Quitter
```

## 📋 Scénarios de Test Recommandés

### Scénario 1 : Test de Base

**Objectif :** Vérifier que la connexion et la synchronisation fonctionnent

1. Démarrer le serveur : `pnpm start`
2. Lancer le testeur : `pnpm test:manual`
3. Connecter 2 clients (option 1, deux fois)
4. Créer une note avec le client 1 (option 2)
5. Vérifier que le client 2 reçoit la note
6. Déplacer la note avec le client 1 (option 3)
7. Vérifier que le client 2 voit le déplacement

**Résultat attendu :**
```
✅ Client 1 connecté! ID: abc123
✅ Client 2 connecté! ID: def456
📝 Création de la note...
✅ Note créée et envoyée!
📥 [Client 2] Canvas update: { id: 'note-...', type: 'note', position: { x: 123, y: 456 } }
```

---

### Scénario 2 : Test Presse-papiers

**Objectif :** Vérifier la synchronisation du presse-papiers

1. Connecter 2 clients
2. Copier du texte avec le client 1 (option 4)
3. Vérifier que le client 2 reçoit le texte

**Résultat attendu :**
```
📋 Copie dans le presse-papiers...
✅ Texte copié et synchronisé!
📋 [Client 2] Clipboard: Texte copié depuis le client 1
```

---

### Scénario 3 : Test Multi-utilisateurs

**Objectif :** Vérifier que plusieurs utilisateurs peuvent collaborer

1. Connecter 3 clients
2. Afficher les clients connectés (option 6)
3. Créer des notes depuis différents clients
4. Vérifier que tous reçoivent toutes les notes

**Résultat attendu :**
```
👥 Clients connectés: 3
  1. ID: abc123 - Connecté: true
  2. ID: def456 - Connecté: true
  3. ID: ghi789 - Connecté: true
```

---

### Scénario 4 : Test de Charge

**Objectif :** Vérifier les performances avec beaucoup de clients

1. Lancer le test de charge (option 8)
2. Attendre que les 10 clients se connectent
3. Lancer le test de synchronisation (option 9)
4. Vérifier que tous les messages sont reçus

**Résultat attendu :**
```
🔥 Test de charge: connexion de 10 clients...
✅ Client 1 connecté! ID: ...
✅ Client 2 connecté! ID: ...
...
✅ 10 clients connectés! Total: 10

🔄 Test de synchronisation...
📥 Client 2 a reçu une mise à jour (1/45)
📥 Client 3 a reçu une mise à jour (2/45)
...
✅ Test terminé! 45/45 messages reçus
```

---

### Scénario 5 : Test de Reconnexion

**Objectif :** Vérifier la gestion des déconnexions

1. Connecter 2 clients
2. Déconnecter le client 1 (option 7)
3. Vérifier que le client 2 est notifié
4. Reconnecter un client (option 1)
5. Vérifier que le nouveau client reçoit la liste des utilisateurs

**Résultat attendu :**
```
🔌 Déconnexion du client abc123...
✅ Client déconnecté!
👋 [Client 2] Utilisateur déconnecté: abc123
```

---

## 🧪 Tests Automatisés E2E

Les tests E2E sont dans `src/__tests__/e2e/real-world.test.ts`

### Lancer tous les tests E2E

```bash
pnpm test:e2e
```

### Lancer un test spécifique

```bash
# Test de connexion uniquement
pnpm test:e2e -- -t "devrait permettre à un client de se connecter"

# Test de synchronisation
pnpm test:e2e -- -t "devrait synchroniser la création"

# Test de performance
pnpm test:e2e -- -t "devrait gérer 10 clients"
```

### Tests disponibles

1. **Connexion et Multi-utilisateurs**
   - Connexion d'un client
   - Connexion de plusieurs clients
   - Liste des utilisateurs

2. **Synchronisation Canvas**
   - Création d'éléments
   - Déplacement d'éléments
   - Mises à jour en temps réel

3. **Synchronisation Presse-papiers**
   - Copie de texte
   - Synchronisation entre clients

4. **Synchronisation Curseurs**
   - Positions de curseur
   - Mise à jour en temps réel

5. **Déconnexion et Reconnexion**
   - Notification de déconnexion
   - Nettoyage des utilisateurs

6. **Performance et Charge**
   - 10 clients simultanés
   - 50 mises à jour rapides

---

## 🔍 Vérification Manuelle dans le Navigateur

### Test avec 2 Navigateurs

1. **Terminal 1 :** Démarrer le serveur
   ```bash
   pnpm start
   ```

2. **Navigateur 1 :** Ouvrir `http://localhost:8080`
   - Vérifier : 🟢 Connecté
   - Vérifier : "1 utilisateur connecté"

3. **Navigateur 2 :** Ouvrir `http://localhost:8080` (nouvel onglet/fenêtre)
   - Vérifier : 🟢 Connecté
   - Vérifier : "2 utilisateurs connectés"

4. **Dans Navigateur 1 :** Créer une note (bouton "Note" dans sidebar)
   - Vérifier : Note apparaît dans Navigateur 1
   - Vérifier : Note apparaît dans Navigateur 2

5. **Dans Navigateur 1 :** Déplacer la note
   - Vérifier : La note se déplace dans Navigateur 2

6. **Dans Navigateur 2 :** Créer un dossier
   - Vérifier : Dossier apparaît dans Navigateur 1

### Test Mobile + PC

1. **PC :** Démarrer le serveur
   ```bash
   pnpm start
   ```

2. **PC :** Trouver l'IP
   ```bash
   ip route get 1.1.1.1 | grep -oP 'src \K\S+'
   # Exemple: 192.168.1.112
   ```

3. **Mobile :** Ouvrir le navigateur
   - Aller à `http://192.168.1.112:8080`
   - Vérifier la connexion

4. **PC :** Ouvrir `http://localhost:8080`

5. **Tester la synchronisation :**
   - Créer une note sur PC → Voir sur mobile
   - Déplacer un élément sur mobile → Voir sur PC
   - Vérifier le compteur d'utilisateurs (2)

---

## 📊 Métriques à Vérifier

### Performance

- ✅ **Latence de synchronisation** : < 200ms
- ✅ **Connexion** : < 1 seconde
- ✅ **Reconnexion** : < 3 secondes
- ✅ **Clients simultanés** : 10+ sans problème
- ✅ **Mises à jour rapides** : 50+ par seconde

### Fiabilité

- ✅ **Pas de perte de messages**
- ✅ **Pas de duplication**
- ✅ **Ordre des messages préservé**
- ✅ **Reconnexion automatique**
- ✅ **Nettoyage des utilisateurs déconnectés**

### Interface

- ✅ **Feedback visuel** pendant le drag
- ✅ **Notifications** pour les actions
- ✅ **Indicateur de connexion** à jour
- ✅ **Liste des utilisateurs** correcte
- ✅ **Responsive** sur mobile

---

## 🐛 Debugging

### Activer les logs détaillés

Dans le testeur manuel, tous les événements sont loggés automatiquement :

```
📥 [Client 1] Canvas update: { id: '...', type: 'note', position: { x: 100, y: 200 } }
📋 [Client 2] Clipboard: Texte copié
🖱️ [Client 3] Cursor: { x: 250, y: 350 }
👤 [Client 1] Utilisateur connecté: Windows PC
👋 [Client 2] Utilisateur déconnecté: abc123
```

### Vérifier les logs serveur

Le serveur log automatiquement :

```
[2025-10-21T12:00:00.000Z] INFO: 🔌 Nouvelle connexion WebSocket: abc123
[2025-10-21T12:00:01.000Z] INFO: 📝 Mise à jour canvas de abc123: note note-123
[2025-10-21T12:00:02.000Z] INFO: 🔌 Déconnexion WebSocket: abc123 (client namespace disconnect)
```

### Console du navigateur

Ouvrir la console (F12) pour voir :
- Connexions WebSocket
- Messages envoyés/reçus
- Erreurs éventuelles

---

## ✅ Checklist de Test Complet

### Tests Automatisés
- [ ] `pnpm test:e2e` passe sans erreur
- [ ] Tous les tests de connexion passent
- [ ] Tous les tests de synchronisation passent
- [ ] Tests de performance passent

### Tests Manuels Interactifs
- [ ] Connexion de clients fonctionne
- [ ] Création de notes fonctionne
- [ ] Déplacement d'éléments fonctionne
- [ ] Presse-papiers fonctionne
- [ ] Curseurs fonctionnent
- [ ] Déconnexion fonctionne
- [ ] Test de charge (10 clients) fonctionne
- [ ] Test de synchronisation fonctionne

### Tests Navigateur
- [ ] 2 onglets se synchronisent
- [ ] Mobile + PC se synchronisent
- [ ] Drag-and-drop fonctionne
- [ ] Zoom et pan fonctionnent
- [ ] Interface responsive

### Tests Réseau
- [ ] Accessible depuis le réseau local
- [ ] Plusieurs appareils peuvent se connecter
- [ ] Reconnexion automatique fonctionne

---

## 📝 Rapport de Test

Après avoir effectué les tests, note :

**Date :** ___________

**Tests Automatisés :**
- [ ] Tous passent
- [ ] Certains échouent (lesquels ?) : ___________

**Tests Manuels :**
- [ ] Tous fonctionnent
- [ ] Problèmes trouvés : ___________

**Performance :**
- Latence moyenne : _____ ms
- Nombre max de clients testés : _____
- Problèmes de performance : ___________

**Bugs trouvés :**
1. ___________
2. ___________
3. ___________

---

## 🚀 Prochaines Étapes

Après avoir validé ces tests, tu peux :

1. **Tester avec plus d'utilisateurs réels**
2. **Tester sur différents réseaux**
3. **Tester avec de gros fichiers**
4. **Tester la stabilité sur longue durée**
5. **Implémenter les fonctionnalités manquantes**# Guide de Test - Local Collaborative Workspace

## Tests Automatiques

### Lancer tous les tests
```bash
pnpm test
```

### Tests spécifiques
```bash
# Tests WebSocket uniquement
pnpm test -- --testPathPattern="websocket"

# Tests avec couverture
pnpm test -- --coverage
```

## Tests Manuels

### 1. Test de Connexion WebSocket

**Objectif :** Vérifier que la connexion WebSocket fonctionne

**Étapes :**
1. Démarrer le serveur : `pnpm start`
2. Ouvrir le navigateur sur `http://localhost:8080`
3. Vérifier dans le header : "🟢 Connecté"
4. Vérifier le nombre d'utilisateurs connectés : "1 utilisateur connecté"

**Résultat attendu :**
- ✅ Indicateur vert de connexion
- ✅ Compteur d'utilisateurs à jour
- ✅ Pas d'erreurs dans la console

---

### 2. Test Multi-Utilisateurs

**Objectif :** Vérifier que plusieurs utilisateurs peuvent se connecter simultanément

**Étapes :**
1. Ouvrir le navigateur sur `http://localhost:8080` (Utilisateur 1)
2. Ouvrir un autre onglet/navigateur sur la même URL (Utilisateur 2)
3. Vérifier que les deux voient "2 utilisateurs connectés"
4. Dans la sidebar, vérifier la liste des utilisateurs connectés

**Résultat attendu :**
- ✅ Les deux clients voient 2 utilisateurs
- ✅ La sidebar affiche les deux utilisateurs avec leurs infos (device, IP)
- ✅ Indicateur vert pour chaque utilisateur

---

### 3. Test de Création d'Éléments

**Objectif :** Vérifier la création de notes et dossiers

**Étapes :**
1. Dans la sidebar, cliquer sur "Note"
2. Vérifier qu'une nouvelle note apparaît sur le canvas
3. Cliquer sur "Dossier"
4. Vérifier qu'un nouveau dossier apparaît

**Résultat attendu :**
- ✅ Note créée avec fond jaune
- ✅ Dossier créé avec fond violet
- ✅ Notification "Note créée" / "Dossier créé"
- ✅ Éléments positionnés aléatoirement sur le canvas

---

### 4. Test de Drag-and-Drop (Souris)

**Objectif :** Vérifier le déplacement d'éléments avec la souris

**Étapes :**
1. Cliquer et maintenir sur une note
2. Déplacer la souris
3. Relâcher le bouton
4. Vérifier que la note reste à la nouvelle position

**Résultat attendu :**
- ✅ L'élément suit le curseur pendant le drag
- ✅ Feedback visuel (opacité, classe "dragging")
- ✅ Position finale correcte après le drop
- ✅ Pas de saut ou glitch

---

### 5. Test de Drag-and-Drop (Tactile)

**Objectif :** Vérifier le déplacement sur mobile/tablette

**Étapes :**
1. Sur un appareil tactile, toucher et maintenir une note
2. Déplacer le doigt
3. Relâcher
4. Vérifier la nouvelle position

**Résultat attendu :**
- ✅ L'élément suit le doigt
- ✅ Pas de conflit avec le scroll
- ✅ Position finale correcte

---

### 6. Test de Sélection

**Objectif :** Vérifier la sélection d'éléments

**Étapes :**
1. Cliquer sur une note
2. Vérifier qu'elle est sélectionnée (bordure bleue)
3. Cliquer sur le canvas vide
4. Vérifier que la sélection est annulée
5. Ctrl+Clic sur plusieurs éléments
6. Vérifier la sélection multiple

**Résultat attendu :**
- ✅ Bordure bleue sur l'élément sélectionné
- ✅ Déselection au clic sur le canvas
- ✅ Sélection multiple avec Ctrl+Clic
- ✅ Tous les éléments sélectionnés ont la bordure

---

### 7. Test de Zoom et Pan

**Objectif :** Vérifier la navigation sur le canvas

**Étapes :**
1. Utiliser la molette de la souris pour zoomer
2. Vérifier l'indicateur de zoom en bas à droite
3. Cliquer et glisser sur le canvas vide pour déplacer la vue
4. Utiliser les boutons de la toolbar pour zoomer
5. Tester les raccourcis clavier :
   - `Ctrl + 0` : Reset zoom
   - `Ctrl + +` : Zoom avant
   - `Ctrl + -` : Zoom arrière

**Résultat attendu :**
- ✅ Zoom fluide avec la molette
- ✅ Indicateur de zoom à jour (ex: "150%")
- ✅ Pan fonctionnel avec le drag
- ✅ Boutons de toolbar fonctionnels
- ✅ Raccourcis clavier opérationnels
- ✅ Zoom limité entre 10% et 300%

---

### 8. Test de Synchronisation Temps Réel

**Objectif :** Vérifier que les changements sont synchronisés entre utilisateurs

**Étapes :**
1. Ouvrir deux navigateurs (Client A et Client B)
2. Sur Client A, créer une note
3. Vérifier que Client B voit la note apparaître
4. Sur Client A, déplacer la note
5. Vérifier que Client B voit le déplacement
6. Sur Client B, créer un dossier
7. Vérifier que Client A le voit

**Résultat attendu :**
- ✅ Création d'éléments synchronisée
- ✅ Déplacement synchronisé
- ✅ Latence < 500ms
- ✅ Pas de conflit ou duplication

---

### 9. Test de Drop de Fichiers

**Objectif :** Vérifier le glisser-déposer de fichiers

**Étapes :**
1. Depuis l'explorateur de fichiers, glisser un fichier sur le canvas
2. Vérifier qu'un élément "file" apparaît
3. Glisser plusieurs fichiers en même temps
4. Vérifier qu'ils sont tous ajoutés

**Résultat attendu :**
- ✅ Fichier ajouté au canvas
- ✅ Icône et nom du fichier affichés
- ✅ Multiple fichiers supportés
- ✅ Position au point de drop

---

### 10. Test Mobile (Responsive)

**Objectif :** Vérifier l'interface sur mobile

**Étapes :**
1. Accéder depuis un téléphone : `http://[IP_PC]:8080`
2. Vérifier que l'interface s'adapte
3. Tester le zoom avec pinch
4. Tester le drag-and-drop tactile
5. Vérifier la sidebar (peut être réduite)

**Résultat attendu :**
- ✅ Interface responsive
- ✅ Boutons assez grands pour le tactile
- ✅ Pinch-to-zoom fonctionnel
- ✅ Drag tactile fluide
- ✅ Sidebar adaptée (réductible)

---

### 11. Test de Reconnexion

**Objectif :** Vérifier la reconnexion automatique

**Étapes :**
1. Connecter un client
2. Arrêter le serveur (`Ctrl+C`)
3. Vérifier l'indicateur de connexion (🔴 ou 🟡)
4. Redémarrer le serveur
5. Vérifier la reconnexion automatique

**Résultat attendu :**
- ✅ Indicateur passe à "Déconnecté" ou "Reconnexion..."
- ✅ Reconnexion automatique après redémarrage
- ✅ Indicateur repasse à "Connecté"
- ✅ Fonctionnalités restaurées

---

### 12. Test de Performance

**Objectif :** Vérifier les performances avec beaucoup d'éléments

**Étapes :**
1. Créer 20-30 notes sur le canvas
2. Tester le zoom et pan
3. Tester le drag-and-drop
4. Vérifier la fluidité (60 FPS)

**Résultat attendu :**
- ✅ Pas de lag visible
- ✅ Zoom fluide
- ✅ Drag fluide
- ✅ Pas de freeze

---

### 13. Test de Notifications

**Objectif :** Vérifier le système de notifications

**Étapes :**
1. Créer une note
2. Vérifier la notification en haut à droite
3. Attendre 3 secondes
4. Vérifier que la notification disparaît
5. Cliquer sur le X d'une notification
6. Vérifier qu'elle se ferme immédiatement

**Résultat attendu :**
- ✅ Notification apparaît avec animation
- ✅ Disparaît après 3 secondes
- ✅ Bouton X fonctionnel
- ✅ Plusieurs notifications empilées correctement

---

### 14. Test de la Grille

**Objectif :** Vérifier l'affichage de la grille

**Étapes :**
1. Observer la grille de points sur le canvas
2. Zoomer à 50%
3. Vérifier que la grille s'adapte ou disparaît
4. Zoomer à 200%
5. Vérifier que la grille est visible

**Résultat attendu :**
- ✅ Grille visible au zoom normal
- ✅ Grille disparaît en dessous de 50%
- ✅ Grille s'adapte au niveau de zoom
- ✅ Pas de problème de performance

---

## Tests de Sécurité

### 15. Test d'Accès Réseau Local

**Objectif :** Vérifier que seul le réseau local peut accéder

**Étapes :**
1. Vérifier que le serveur écoute sur `0.0.0.0:8080`
2. Tester l'accès depuis un appareil sur le même réseau
3. Vérifier qu'on ne peut pas accéder depuis Internet

**Résultat attendu :**
- ✅ Accessible depuis le réseau local
- ✅ Pas accessible depuis Internet (sans port forwarding)

---

## Checklist Complète

### Fonctionnalités de Base
- [ ] Connexion WebSocket
- [ ] Multi-utilisateurs
- [ ] Création de notes
- [ ] Création de dossiers
- [ ] Drag-and-drop souris
- [ ] Drag-and-drop tactile
- [ ] Sélection simple
- [ ] Sélection multiple
- [ ] Déselection

### Navigation Canvas
- [ ] Zoom molette
- [ ] Zoom boutons
- [ ] Zoom raccourcis
- [ ] Pan souris
- [ ] Pan tactile
- [ ] Reset zoom
- [ ] Indicateur de zoom

### Synchronisation
- [ ] Création synchronisée
- [ ] Déplacement synchronisé
- [ ] Liste utilisateurs à jour
- [ ] Reconnexion automatique

### Interface
- [ ] Responsive mobile
- [ ] Sidebar réductible
- [ ] Notifications
- [ ] Grille adaptative
- [ ] Feedback visuel

### Performance
- [ ] Fluidité avec 30+ éléments
- [ ] Pas de memory leak
- [ ] Reconnexion rapide

---

## Rapport de Bugs

Si tu trouves un bug, note :
1. **Étapes pour reproduire**
2. **Résultat attendu**
3. **Résultat obtenu**
4. **Navigateur/OS**
5. **Console errors** (F12 > Console)

---

## Tests Automatisés Existants

### Tests Unitaires
- ✅ WebSocketManager (20 tests)
- ✅ WebSocketService (tests serveur)
- ✅ useWebSocket hook (tests React)

### Tests d'Intégration
- ✅ Communication client-serveur
- ✅ Multi-clients
- ✅ Synchronisation

Pour lancer : `pnpm test`