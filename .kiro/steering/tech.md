---
inclusion: always
---

# Technology Stack

## Core Technologies

- **Runtime**: Node.js with TypeScript
- **Frontend**: React 19 with Vite
- **Backend**: Express.js with Socket.io
- **State Management**: Zustand
- **Testing**: Jest with React Testing Library
- **Package Manager**: pnpm (required)

## Key Libraries

- `socket.io` / `socket.io-client` - Real-time WebSocket communication
- `zustand` - Client-side state management
- `express` - HTTP server
- `multer` - File upload handling
- `bonjour-service` - mDNS service discovery
- `sqlite3` - Local data persistence

## Build System

- **Client**: Vite with React plugin
- **Server**: TypeScript compiler (tsc)
- **Dev**: Concurrent server + client with hot-reload

## Common Commands

```bash
# Development
pnpm dev              # Start both server and client with hot-reload
pnpm dev:server       # Server only (port 8080)
pnpm dev:client       # Client only (port 3000)

# Build
pnpm build            # Build both server and client
pnpm build:server     # Compile TypeScript to dist/server
pnpm build:client     # Build React app to dist/client

# Production
pnpm start            # Run compiled server (serves client from dist/client)

# Testing
pnpm test             # Run all Jest tests
pnpm test:watch       # Watch mode
pnpm test:e2e         # End-to-end tests only
pnpm test:manual      # Interactive manual test script

# Code Quality
pnpm lint             # Check code with ESLint
pnpm lint:fix         # Auto-fix ESLint issues
```

## TypeScript Configuration

- Three separate tsconfig files: base, client, server
- Strict mode enabled
- Path aliases: `@/`, `@shared/`, `@client/`
- Target: ES2020

## Development Ports

- Server: 8080 (production and dev)
- Client dev server: 3000 (proxies to 8080)
- WebSocket: Same port as HTTP server
