---
name: noony-create-fastify-server
description: Use when setting up a Fastify server for local development from scratch. This is the STARTING POINT — get a dev server running fast, then graduate to `noony-complete-dual-entry` for production dual-entry.
---

# skill:noony-create-fastify-server

## Does exactly this

Creates a minimal Fastify server for local development with dependency initialization, route registration via `createFastifyHandler()`, and graceful shutdown. This is the fastest path to running Noony handlers locally.

## When to use

- "Set up local development server"
- "Create a Fastify server"
- "How do I start a dev server"
- "Add graceful shutdown to my server"
- "I need to run my handlers locally"
- "Configure server startup"
- Starting a new project and want to iterate locally before wiring up Cloud Functions

## Do not use this skill when

- You need a production-ready project with both Fastify AND Cloud Functions entry points — use **`noony-complete-dual-entry`** skill instead. That is the graduation path from this skill.
- You are converting an existing Cloud Functions handler to also run in Fastify — use **`noony-convert-cloud-functions-to-fastify`** skill instead. That skill handles migration-specific concerns.
- You need to support a non-Fastify framework (Koa, Hapi, NestJS) — use **`noony-custom-adapter`** skill instead.

## Steps

1. Create a Fastify instance with logging configured

2. Initialize dependencies in the `onReady` hook (eager initialization)
   - Call `initializeDependencies()` inside `server.addHook('onReady', ...)`
   - Exit process on init failure — server cannot serve requests without dependencies

3. Register routes using `createFastifyHandler()` wrapper
   - `createFastifyHandler(handler, name, initFn)` takes three arguments
   - Pass `() => Promise.resolve()` as initFn since deps are already initialized eagerly
   - Use the same handler instances that will deploy to Cloud Functions

4. Add graceful shutdown on SIGTERM/SIGINT
   - Close HTTP server with `server.close()`
   - Call `cleanup()` to release DB connections and reset container pool

5. Add health check endpoint (`GET /health`)

6. Configure npm scripts: `"dev": "tsx watch src/server.ts"`

7. Verify middleware ordering follows canonical order — see **`noony-middleware-ordering`** skill for the definitive reference

8. When ready for production, graduate to **`noony-complete-dual-entry`** skill to add Cloud Functions alongside your Fastify server

## Rules

- MUST initialize dependencies in `server.addHook('onReady')` — never inside route handlers
- MUST call `cleanup()` during graceful shutdown — DB connections leak otherwise
- Always use `createFastifyHandler()` wrapper — it handles error catching and response completion checks
- Register the same handler instance used in Cloud Functions — no environment-specific code in handlers
- Never import Cloud Functions code (`functions-framework`) into the Fastify server

## Anti-patterns

- Calling `initializeDependencies()` inside handler function — adds latency per request, defeats eager init
- Skipping graceful shutdown — database connections leak on restart, port stays occupied
- Creating different handlers for Fastify vs Cloud Functions — testing locally becomes meaningless
- Not catching `RESPONSE_SENT` errors in handler wrapper — causes unhandled promise rejections
- Blocking on resources during shutdown without timeout — process hangs indefinitely
- Setting up Fastify without planning for Cloud Functions deployment — use **`noony-complete-dual-entry`** skill when you need both entry points

## Done when

- `npm run dev` starts Fastify server successfully
- `GET /health` returns 200 OK
- Graceful shutdown closes cleanly on SIGTERM/SIGINT (no hanging processes)
- Handlers are identical between local Fastify and Cloud Functions entry points
- Dependencies initialize once on startup, not per-request
- Middleware ordering follows canonical order (verify with **`noony-middleware-ordering`** skill)

---

## Reference: Minimal Server

```typescript
// src/server.ts
import Fastify from 'fastify';
import { createFastifyHandler } from '@noony-serverless/core';
import { createUserHandler } from './handlers';
import { initializeDependencies } from './core/initialization';

const server = Fastify({ logger: true });

// Initialize dependencies on server startup
server.addHook('onReady', async () => {
  await initializeDependencies();
});

// Register route
server.post('/api/users',
  createFastifyHandler(createUserHandler, 'createUser', () => Promise.resolve())
);

// Start server
server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});
```

## Reference: Production-Ready Server with Graceful Shutdown

```typescript
// src/server.ts
import Fastify, { FastifyInstance } from 'fastify';
import { createFastifyHandler } from '@noony-serverless/core';
import {
  createUserHandler,
  getUserHandler,
  updateUserHandler,
  deleteUserHandler
} from './handlers';
import { initializeDependencies, cleanup } from './core/initialization';

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    // NOTE: Use explicit if-block for pino-pretty; object spread causes pino to resolve
    // the transport at module load regardless of the condition.
    ...(process.env.NODE_ENV !== 'production' ? {
      transport: { target: 'pino-pretty', options: { colorize: true } }
    } : {})
  }
});

// === Lifecycle Hooks ===

server.addHook('onReady', async () => {
  try {
    await initializeDependencies();
    server.log.info('[Server] Dependencies initialized');
  } catch (error) {
    server.log.error('[Server] Initialization failed', error);
    process.exit(1);
  }
});

// Health check endpoint
server.get('/health', async (request, reply) => {
  return { status: 'ok', uptime: process.uptime() };
});

// === Routes ===

const createUser = createFastifyHandler(createUserHandler, 'createUser', () => Promise.resolve());
const getUser = createFastifyHandler(getUserHandler, 'getUser', () => Promise.resolve());
const updateUser = createFastifyHandler(updateUserHandler, 'updateUser', () => Promise.resolve());
const deleteUser = createFastifyHandler(deleteUserHandler, 'deleteUser', () => Promise.resolve());

server.post('/api/users', createUser);
server.get('/api/users/:userId', getUser);
server.patch('/api/users/:userId', updateUser);
server.delete('/api/users/:userId', deleteUser);

// === Graceful Shutdown ===

const gracefulShutdown = async (signal: string) => {
  server.log.info(`[Server] ${signal} received, shutting down...`);

  try {
    await server.close();
    server.log.info('[Server] HTTP server closed');

    await cleanup();
    server.log.info('[Server] Cleanup complete');

    process.exit(0);
  } catch (error) {
    server.log.error('[Server] Error during shutdown', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// === Start Server ===

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    server.log.info('[Server] Fastify server started on http://0.0.0.0:3000');
  } catch (error) {
    server.log.error('[Server] Failed to start server', error);
    process.exit(1);
  }
};

start();

export default server;
```

## Reference: package.json Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "node dist/server.js",
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "dependencies": {
    "@noony-serverless/core": "^0.8.0",
    "fastify": "^4.25.0",
    "pino": "^8.17.0",
    "pino-pretty": "^10.2.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "tsx": "^4.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

## Reference: Development Workflow

```bash
# Start dev server
npm run dev
# Output: [Server] Fastify server started on http://0.0.0.0:3000

# Test locally
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'

curl http://localhost:3000/api/users/123
curl http://localhost:3000/health

# Run tests
npm test
npm run test:coverage

# Build for production
npm run build
```

## Reference: Deployment (Cloud Run)

```bash
# 1. Build Docker image
gcloud builds submit --tag gcr.io/[PROJECT_ID]/noony-server

# 2. Deploy to Cloud Run
gcloud run deploy noony-server \
  --image gcr.io/[PROJECT_ID]/noony-server \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --timeout 60 \
  --set-env-vars LOG_LEVEL=info

# 3. Test deployed service
curl https://noony-server-xxxxx.run.app/health
```

## Reference: Troubleshooting

### Port Already in Use

```bash
lsof -i :3000
kill -9 <PID>
```

### Dependencies Not Initialized

```
Error: Service not found in container
```

**Fix:** Ensure `server.addHook('onReady', async () => { await initializeDependencies(); })`

### Graceful Shutdown Not Working

```bash
# Test graceful shutdown
npm run dev
# In another terminal:
kill -SIGTERM <PID>
# Should see: [Server] SIGTERM received, shutting down...
```
