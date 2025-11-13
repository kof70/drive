---
inclusion: always
---

# Project Structure

## Directory Layout

```
src/
├── client/              # React frontend application
│   ├── components/      # React components
│   │   ├── canvas/      # Canvas-related components
│   │   │   └── renderers/  # Element type renderers
│   │   ├── layout/      # Layout components (Header, Sidebar)
│   │   └── ui/          # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Client services (WebSocket manager)
│   ├── stores/          # Zustand state stores
│   ├── providers/       # React context providers
│   ├── styles/          # CSS files
│   ├── utils/           # Utility functions
│   ├── index.html       # HTML entry point
│   └── main.tsx         # React entry point
├── server/              # Node.js backend
│   ├── services/        # Server services (WebSocket)
│   ├── config/          # Configuration files
│   └── utils/           # Server utilities (logger)
├── shared/              # Shared types between client/server
│   └── types.ts         # TypeScript interfaces and types
└── __tests__/           # Test files
    ├── integration/     # Integration tests
    └── e2e/             # End-to-end tests

dist/                    # Compiled output (gitignored)
├── client/              # Built React app
└── server/              # Compiled Node.js server

scripts/                 # Utility scripts
```

## Architecture Patterns

### Client Architecture

- **Component Structure**: Organized by feature (canvas, layout, ui)
- **State Management**: Zustand stores for canvas and notifications
- **Hooks**: Custom hooks for WebSocket, canvas sync, drag-and-drop
- **Services**: WebSocket manager handles all Socket.io communication
- **Providers**: WebSocketProvider wraps app with connection context

### Server Architecture

- **Service Layer**: WebSocketService handles all real-time communication
- **Express Routes**: REST API for health checks and configuration
- **Static Serving**: Serves built client from dist/client
- **Logging**: Centralized logger utility

### Shared Code

- All TypeScript interfaces in `src/shared/types.ts`
- Ensures type safety between client and server
- Includes: CanvasElement, UserSession, WebSocketEvents, etc.

## Testing Structure

- Unit tests colocated with source: `__tests__/` folders
- Integration tests: `src/__tests__/integration/`
- E2E tests: `src/__tests__/e2e/`
- Mocks: `src/__mocks__/` for external dependencies

## Key Conventions

- TypeScript strict mode throughout
- ESLint for code quality
- Functional React components with hooks
- WebSocket events follow shared type definitions
- Server maintains authoritative state
- Last-write-wins conflict resolution
