# 📖 Guide d'Utilisation - Local Collaborative Workspace

## 🎯 Qu'est-ce que c'est ?

C'est un **espace de travail visuel collaboratif** pour organiser des idées, notes et fichiers sur un canvas partagé en temps réel sur votre réseau local.

## ✅ Ce Qui Fonctionne Actuellement

### 1. Collaboration Multi-Utilisateurs
- ✅ Plusieurs personnes peuvent se connecter en même temps
- ✅ Tout le monde voit les mêmes éléments en temps réel
- ✅ Les modifications sont synchronisées instantanément

### 2. Créer des Éléments
- ✅ **Notes** : Zones de texte colorées (cliquer sur "Nouvelle Note")
- ✅ **Dossiers** : Conteneurs visuels (cliquer sur "Nouveau Dossier")
- ✅ **Fichiers** : Glisser-déposer un fichier crée un élément visuel

### 3. Manipuler les Éléments
- ✅ **Déplacer** : Cliquer-glisser un élément
- ✅ **Sélectionner** : Cliquer sur un élément
- ✅ **Supprimer** : Sélectionner puis appuyer sur "Suppr" (Delete)

### 4. Navigation
- ✅ **Zoom** : Molette de la souris ou boutons +/-
- ✅ **Pan** : Cliquer-glisser sur le fond du canvas
- ✅ **Reset** : Bouton "Reset" ou Ctrl+0

## ❌ Ce Qui NE Fonctionne PAS Encore

### 1. Upload de Fichiers Réels
**Problème** : Quand vous glissez un fichier JPG depuis votre téléphone :
- ❌ Le fichier n'est PAS uploadé sur le serveur
- ❌ Vous ne pouvez PAS voir l'image
- ❌ Vous ne pouvez PAS télécharger le fichier

**Ce qui se passe** : Un élément visuel est créé avec le nom du fichier, mais le fichier lui-même n'est pas stocké.

**Pourquoi** : L'upload de fichiers n'est pas encore implémenté (prévu pour v1.2.0).

### 2. Édition de Notes
**Problème** : Vous ne pouvez pas modifier le texte des notes.
- ❌ Double-clic ne fait rien
- ❌ Pas de zone de texte éditable

**Pourquoi** : L'édition n'est pas encore implémentée (prévu pour v1.2.0).

### 3. Dossiers Réels du PC
**Problème** : Les "dossiers" ne sont PAS vos vrais dossiers du PC.
- ❌ Ce ne sont que des éléments visuels
- ❌ Ils ne contiennent pas de vrais fichiers
- ❌ Vous ne pouvez pas parcourir votre PC

**Pourquoi** : C'est un canvas visuel, pas un explorateur de fichiers.

### 4. Persistance des Données
**Problème** : Tout est perdu au redémarrage du serveur.
- ❌ Pas de sauvegarde en base de données
- ❌ Tout est en mémoire

**Pourquoi** : La persistance n'est pas encore implémentée (prévu pour v1.2.0).

## 🤔 Questions Fréquentes

### Q1 : Pourquoi j'ai 2 utilisateurs connectés alors que je suis seul ?

**Réponse** : C'est NORMAL ! Voici pourquoi :

```
Utilisateur 1 : Votre PC
  ├─ Serveur (backend qui tourne)
  └─ Client (navigateur ouvert sur http://localhost:8080)

Utilisateur 2 : Votre téléphone
  └─ Client (navigateur ouvert sur http://[IP]:8080)
```

Le PC compte comme 1 utilisateur car il se connecte au serveur via son propre navigateur.

**Pour avoir 1 seul utilisateur** : N'ouvrez l'application QUE sur le téléphone, pas sur le PC.

---

### Q2 : Comment valider un fichier JPG uploadé ?

**Réponse** : Vous ne pouvez pas encore. L'upload de fichiers n'est pas fonctionnel.

**Ce qui se passe actuellement** :
1. Vous glissez un fichier JPG
2. Un élément "file" apparaît sur le canvas
3. Il affiche le nom du fichier
4. Mais le fichier n'est PAS stocké sur le serveur

**Solution temporaire** : Utilisez l'application pour organiser des notes et des idées visuellement, pas pour stocker des fichiers.

---

### Q3 : À quoi servent les dossiers si je ne peux pas y mettre mes fichiers du PC ?

**Réponse** : Les "dossiers" sont des **éléments visuels** pour organiser votre canvas, pas de vrais dossiers.

**Utilisation** :
- Créer des zones visuelles pour grouper des idées
- Organiser votre espace de travail
- Séparer différents projets visuellement

**Ce n'est PAS** :
- Un explorateur de fichiers
- Un accès à vos dossiers du PC
- Un système de stockage de fichiers

---

### Q4 : Pourquoi les notes affichent du texte que je n'ai pas écrit ?

**Réponse** : Ce sont des **données de test** créées au démarrage de l'application.

**Pour les supprimer** :
1. Cliquer sur une note
2. Appuyer sur "Suppr" (Delete)

**Pour créer vos propres notes** :
1. Cliquer sur "Nouvelle Note" dans la sidebar
2. Une note vide apparaît
3. Vous pouvez la déplacer

**Note** : Vous ne pouvez pas encore éditer le texte (prévu pour v1.2.0).

---

### Q5 : Mes données sont-elles sauvegardées ?

**Réponse** : NON, tout est perdu au redémarrage du serveur.

**Pourquoi** : Pas de base de données pour le moment (prévu pour v1.2.0).

**Conseil** : Utilisez l'application pour des sessions de brainstorming temporaires, pas pour stocker des données importantes.

---

## 🎨 Cas d'Usage Actuels

### ✅ Ce pour quoi l'application est BONNE :

1. **Brainstorming en équipe**
   - Créer des notes visuelles
   - Organiser des idées
   - Collaborer en temps réel

2. **Organisation visuelle temporaire**
   - Planifier un projet
   - Créer un mind map
   - Organiser des tâches

3. **Démonstration de collaboration**
   - Montrer la synchronisation temps réel
   - Tester la connexion multi-utilisateurs

### ❌ Ce pour quoi l'application n'est PAS BONNE :

1. **Stockage de fichiers**
   - Pas d'upload réel
   - Pas de téléchargement
   - Pas de prévisualisation

2. **Prise de notes détaillées**
   - Pas d'édition de texte
   - Pas de formatage
   - Pas de sauvegarde

3. **Gestion de documents**
   - Pas d'accès aux fichiers du PC
   - Pas de système de dossiers réels

## 🚀 Comment Bien Utiliser l'Application

### Scénario 1 : Brainstorming en Équipe

```
1. Démarrer le serveur sur un PC
2. Tout le monde se connecte (PC, mobiles, tablettes)
3. Créer des notes pour chaque idée
4. Déplacer et organiser visuellement
5. Discuter en temps réel
6. Prendre une capture d'écran du résultat final
```

### Scénario 2 : Organisation de Projet

```
1. Créer des dossiers pour chaque phase du projet
2. Créer des notes pour chaque tâche
3. Organiser les notes dans les zones de dossiers
4. Déplacer les notes au fur et à mesure
5. Prendre des captures d'écran pour documenter
```

### Scénario 3 : Démonstration Technique

```
1. Montrer la connexion multi-utilisateurs
2. Démontrer la synchronisation temps réel
3. Tester la reconnexion automatique
4. Montrer la collaboration simultanée
```

## 📊 Tableau Récapitulatif

| Fonctionnalité | État | Commentaire |
|----------------|------|-------------|
| Créer des notes | ✅ Fonctionne | Mais pas d'édition de texte |
| Créer des dossiers | ✅ Fonctionne | Éléments visuels uniquement |
| Déplacer des éléments | ✅ Fonctionne | Drag & drop fluide |
| Supprimer des éléments | ✅ Fonctionne | Touche Suppr |
| Zoom et pan | ✅ Fonctionne | Molette + drag |
| Multi-utilisateurs | ✅ Fonctionne | Synchronisation temps réel |
| Reconnexion auto | ✅ Fonctionne | Robuste et infinie |
| Éditer le texte | ❌ Pas encore | Prévu v1.2.0 |
| Upload de fichiers | ❌ Pas encore | Prévu v1.2.0 |
| Télécharger fichiers | ❌ Pas encore | Prévu v1.2.0 |
| Sauvegarder données | ❌ Pas encore | Prévu v1.2.0 |
| Accès fichiers PC | ❌ Jamais | Pas le but de l'app |

## 🔮 Prochaines Versions

### Version 1.2.0 (Prochaine)
- ✏️ **Édition de notes** : Double-clic pour éditer le texte
- 💾 **Persistance** : Sauvegarde en base de données SQLite
- 📁 **Upload réel** : Stocker et télécharger des fichiers

### Version 1.3.0 (Future)
- ↩️ **Historique** : Undo/Redo
- 👁️ **Curseurs** : Voir les curseurs des autres utilisateurs
- 🎨 **Personnalisation** : Changer les couleurs

## 💡 Conseils d'Utilisation

### Pour une Meilleure Expérience

1. **Utilisez-le pour des sessions courtes**
   - Brainstorming de 30 minutes à 2 heures
   - Pas pour stocker des données long terme

2. **Prenez des captures d'écran**
   - Documentez vos sessions
   - Sauvegardez les résultats importants

3. **Utilisez le même réseau WiFi**
   - Tous les appareils sur le même réseau
   - Meilleure performance

4. **Limitez le nombre d'éléments**
   - Maximum 30-50 éléments pour de bonnes performances
   - Supprimez les éléments inutiles

### Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Suppr` | Supprimer l'élément sélectionné |
| `Ctrl + 0` | Reset zoom à 100% |
| `Ctrl + +` | Zoom avant |
| `Ctrl + -` | Zoom arrière |
| `Molette` | Zoom |
| `Clic + Drag` | Déplacer élément ou canvas |

## 🆘 Problèmes Courants

### "Je ne vois pas les changements des autres"
**Solution** : Rafraîchir la page (F5)

### "L'application est lente"
**Solution** : Supprimer des éléments, vous en avez trop

### "Je ne peux pas éditer le texte"
**Réponse** : Normal, pas encore implémenté

### "Mes fichiers ne s'uploadent pas"
**Réponse** : Normal, pas encore implémenté

### "Tout est perdu au redémarrage"
**Réponse** : Normal, pas de persistance pour le moment

## 📞 Besoin d'Aide ?

- 📖 Lire [README.md](./README.md) pour plus de détails
- 🧪 Voir [TEST-MULTI-UTILISATEURS.md](./TEST-MULTI-UTILISATEURS.md) pour tester
- 🔧 Consulter [STATUS.md](./STATUS.md) pour l'état du projet

---

**Version** : 1.1.0  
**Date** : 23 Octobre 2025  
**Statut** : MVP Fonctionnel (avec limitations)
