# Local Collaborative Workspace

> 📚 **Documentation complète disponible dans le dossier [`docs/`](docs/)** 🚀

Un espace de travail collaboratif local, multiplateforme et sans dépendance Internet. Partagez des fichiers, notes et presse-papiers en temps réel sur votre réseau local.

![Status](https://img.shields.io/badge/status-MVP%20Fonctionnel-green)
![Version](https://img.shields.io/badge/version-1.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎉 Nouveautés v1.1.0 - Corrections Multi-Utilisateurs

- ✅ **Synchronisation d'état initial** : Les nouveaux utilisateurs reçoivent l'état complet du canvas
- ✅ **Reconnexion robuste** : Reconnexion automatique infinie avec Socket.io natif
- ✅ **Resynchronisation automatique** : L'état est resynchronisé après reconnexion
- ✅ **Gestion des conflits** : Stratégie last-write-wins implémentée
- ✅ **État autoritaire serveur** : Le serveur maintient la source de vérité

👉 **[Voir les détails des corrections](./RESUME-CORRECTIONS.md)**  
👉 **[Guide de test rapide](./DEMARRAGE-RAPIDE.md)**

## ✨ Fonctionnalités

- 🎨 **Canvas visuel interactif** - Organisez vos éléments librement
- 🔄 **Synchronisation temps réel** - Collaboration instantanée via WebSocket
- 📱 **Multiplateforme** - PC, mobile, tablette
- 🌐 **100% Local** - Aucune dépendance Internet
- 🖱️ **Drag & Drop** - Déplacez éléments et fichiers facilement
- 👥 **Multi-utilisateurs** - Voyez qui est connecté en temps réel
- 🔍 **Zoom & Pan** - Navigation fluide sur le canvas
- 📝 **Notes et Dossiers** - Créez et organisez vos idées
- 🎯 **Interface Responsive** - Optimisée pour mobile et tactile

## 🚀 Démarrage Rapide (5 minutes)

```bash
# 1. Installer les dépendances
pnpm install

# 2. Compiler l'application
pnpm build

# 3. Démarrer le serveur
pnpm start
```

**C'est tout !** Ouvrez `http://localhost:8080` dans votre navigateur.

### Test Rapide

1. **Ouvrir 2 onglets** sur `http://localhost:8080`
2. **Créer une note** dans le premier onglet (bouton "Note" dans la sidebar)
3. **Vérifier** que la note apparaît dans le deuxième onglet ✨

👉 **Guide complet :** [QUICK-TEST.md](./QUICK-TEST.md)

## 📱 Accès depuis Mobile/Tablette

### 1. Trouver l'IP de votre PC

```bash
# Linux/Mac
ip route get 1.1.1.1 | grep -oP 'src \K\S+'

# Windows
ipconfig
```

### 2. Se connecter

Sur votre mobile/tablette (même réseau WiFi) :
```
http://[IP_DE_VOTRE_PC]:8080
```

**Exemple :** `http://192.168.1.112:8080`

## 🎮 Utilisation

### Créer des Éléments

- **Note** : Cliquez sur "Note" dans la sidebar
- **Dossier** : Cliquez sur "Dossier" dans la sidebar
- **Fichier** : Glissez-déposez depuis votre explorateur (bientôt)

### Naviguer sur le Canvas

- **Zoom** : Molette de la souris ou boutons +/-
- **Pan** : Cliquer-glisser sur le canvas vide
- **Reset** : `Ctrl + 0` ou bouton reset

### Manipuler les Éléments

- **Déplacer** : Cliquer-glisser sur un élément
- **Sélectionner** : Cliquer sur un élément
- **Sélection multiple** : `Ctrl + Clic`
- **Déselectionner** : Cliquer sur le canvas vide

### Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl + 0` | Reset zoom à 100% |
| `Ctrl + +` | Zoom avant |
| `Ctrl + -` | Zoom arrière |
| `Ctrl + Clic` | Sélection multiple |

## 🛠️ Développement

### Scripts Disponibles

```bash
# Développement avec hot-reload
pnpm dev              # Serveur + Client
pnpm dev:server       # Serveur uniquement
pnpm dev:client       # Client uniquement

# Build
pnpm build            # Compile tout
pnpm build:server     # Compile le serveur
pnpm build:client     # Compile le client

# Tests
pnpm test             # Tests unitaires
pnpm test:e2e         # Tests end-to-end
pnpm test:manual      # Test manuel interactif

# Linting
pnpm lint             # Vérifie le code
pnpm lint:fix         # Corrige automatiquement
```

### Structure du Projet

```
local-collaborative-workspace/
├── src/
│   ├── client/              # Application React
│   │   ├── components/      # Composants UI
│   │   │   ├── canvas/      # Canvas et éléments
│   │   │   ├── layout/      # Layout (Header, Sidebar)
│   │   │   └── ui/          # Composants UI réutilisables
│   │   ├── hooks/           # Hooks React personnalisés
│   │   ├── services/        # Services (WebSocket, etc.)
│   │   ├── stores/          # État global (Zustand)
│   │   └── styles/          # CSS
│   ├── server/              # Serveur Node.js
│   │   ├── services/        # Services serveur
│   │   ├── config/          # Configuration
│   │   └── utils/           # Utilitaires
│   └── shared/              # Types partagés
├── dist/                    # Fichiers compilés
├── scripts/                 # Scripts utilitaires
└── docs/                    # Documentation
```

## 🧪 Tests

### Tests Rapides

```bash
# Test en 5 minutes
# Voir QUICK-TEST.md pour les instructions
```

### Tests Complets

```bash
# Tests automatisés
pnpm test

# Tests avec données réelles
pnpm test:e2e

# Test manuel interactif
pnpm test:manual
```

👉 **Documentation complète :** [REAL-WORLD-TESTING.md](./REAL-WORLD-TESTING.md)

## 📊 État du Projet

**Version :** 1.0.0 MVP  
**Statut :** 🟢 Fonctionnel

### ✅ Implémenté

- Serveur WebSocket multi-utilisateurs
- Interface canvas interactive
- Drag-and-drop (souris et tactile)
- Zoom et pan
- Synchronisation temps réel
- Interface responsive
- Tests unitaires et E2E

### 🚧 En Cours

- Persistance des données
- Édition de notes
- Upload de fichiers réels
- Presse-papiers fonctionnel

### 📋 Prévu

- Historique (Undo/Redo)
- Extension VS Code
- PWA (Progressive Web App)
- Découverte mDNS automatique

👉 **Détails complets :** [STATUS.md](./STATUS.md)

## 🔒 Sécurité

⚠️ **Important :** Cette application est conçue pour un usage sur réseau local de confiance.

- ✅ Réseau local uniquement
- ❌ Pas d'authentification
- ❌ Pas de chiffrement
- ❌ Ne pas exposer sur Internet

## 🐛 Dépannage

### Le serveur ne démarre pas

```bash
# Vérifier que le port 8080 est libre
lsof -i :8080  # Linux/Mac
netstat -ano | findstr :8080  # Windows

# Utiliser un autre port
PORT=3000 pnpm start
```

### Impossible de se connecter depuis mobile

1. **Vérifier le pare-feu**
   ```bash
   sudo ufw allow 8080  # Linux
   ```

2. **Vérifier le réseau**
   - Même WiFi pour PC et mobile
   - Pas de réseau invité isolé

3. **Vérifier l'IP**
   - Doit être 192.168.x.x ou 10.x.x.x

### WebSocket ne se connecte pas

1. Vérifier la console du navigateur (F12)
2. Vérifier les logs du serveur
3. Tester l'API : `curl http://localhost:8080/api/health`

## 📚 Documentation

- [QUICK-TEST.md](./QUICK-TEST.md) - Test rapide en 5 minutes
- [TESTING.md](./TESTING.md) - Guide de test complet
- [REAL-WORLD-TESTING.md](./REAL-WORLD-TESTING.md) - Tests avec données réelles
- [STATUS.md](./STATUS.md) - État détaillé du projet

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Socket.io](https://socket.io/) - Communication temps réel
- [React](https://react.dev/) - Interface utilisateur
- [Zustand](https://zustand-demo.pmnd.rs/) - Gestion d'état
- [Vite](https://vitejs.dev/) - Build tool ultra-rapide
- [TypeScript](https://www.typescriptlang.org/) - Typage statique

---

**Besoin d'aide ?** Consultez la [documentation](./QUICK-TEST.md) ou ouvrez une issue.

**Prêt à tester ?** Suivez le [guide de démarrage rapide](#-démarrage-rapide-5-minutes) !