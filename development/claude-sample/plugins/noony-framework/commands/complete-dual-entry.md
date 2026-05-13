---
name: noony-complete-dual-entry
description: The PRODUCTION PATTERN for Noony projects. Use when building a new project or graduating from `noony-create-fastify-server`. Complete dual-entry setup with Fastify (local dev) and Cloud Functions (production) working from the same handler code.
---

# skill:noony-complete-dual-entry

## Does exactly this

End-to-end production-ready setup of a Noony project where the same handler runs identically in both Fastify (local dev) and Cloud Functions (production). This is the recommended starting point for new projects and the graduation target from `noony-create-fastify-server` skill.

## When to use

- "Show me a complete example"
- "How do I support both Fastify and Cloud Functions"
- "Write once, deploy anywhere"
- "Full integration setup"
- "How do the files connect"
- "Project structure for Noony"
- "Production-ready setup"
- Starting a new project that needs both local dev and Cloud Functions deployment
- Graduating from **`noony-create-fastify-server`** skill — you have a Fastify server and now need Cloud Functions too

## Do not use this skill when

- You only need a quick Fastify dev server to get started — use **`noony-create-fastify-server`** skill instead. Come back here when you are ready for production.
- You are migrating an existing Cloud Functions handler — use **`noony-convert-cloud-functions-to-fastify`** skill instead. That skill handles migration-specific concerns like extracting inline logic.
- You need a custom adapter for a non-Fastify framework — use **`noony-custom-adapter`** skill instead.

## Steps

1. Define handler once with all middlewares in canonical order
   - ErrorHandlerMiddleware first, then validation, then business logic
   - Verify ordering with **`noony-middleware-ordering`** skill — this is critical for correct execution
   - No imports from Cloud Functions or Fastify in this file
   - Export handler for use by both entry points

2. Create singleton initialization guard shared by both entry points
   - `initialized` flag + concurrent-safe promise pattern
   - Register global services in `containerPool.initializeGlobal()`
   - Include `cleanup()` function for graceful shutdown
   - See **`noony-dependency-initialization`** skill for detailed initialization patterns

3. Create Fastify entry point (`server.ts`)
   - Eager initialization in `onReady` hook
   - Use `createFastifyHandler()` wrapper for route registration
   - Add graceful shutdown (SIGTERM/SIGINT -> close server -> cleanup)

4. Create Cloud Functions entry point (`functions.ts`)
   - Use **`server.inject()`** to forward requests through Fastify — NOT `server.routing()` or `extractAndStoreRequestBody(server)`
   - Pre-read the body with `extractAndStoreRequestBody(req)` before injecting — stream is consumed by the time Fastify reads it
   - Ensure `--format=cjs` in the build command — top-level `await` forces ESM output which `require()` cannot load
   - Lazy initialization via `ensureServerReady()` guard before each inject

5. Configure npm scripts for both workflows

## Project structure

```
src/
  core/initialization.ts     # Singleton init guard (shared)
  handlers/user.handler.ts   # Framework-agnostic handler
  services/                  # Business logic
  server.ts                  # Fastify entry point (local dev)
  functions.ts               # Cloud Functions entry point (prod)
```

## Key differences between environments

| Aspect | Fastify (local) | Cloud Functions (prod) |
|--------|-----------------|------------------------|
| Entry point | `server.ts` | `functions.ts` |
| Handler execution | `createFastifyHandler()` | `server.inject()` |
| Initialization | Eager (`onReady` hook) | Lazy (on first request) |
| Cleanup | Graceful shutdown | Automatic |
| Handler code | Identical | Identical |
| Middleware chain | Identical | Identical |

## Rules

- Handler module exports ONLY the handler — no server or deployment code
- `server.ts` contains Fastify setup ONLY — never import `functions-framework`
- `functions.ts` contains Cloud Functions exports ONLY — never import Fastify
- Same handler instance, same middleware chain, same business logic in both environments
- Initialization is idempotent — safe to call multiple times, fast path returns immediately
- Use `initializeDependencies()` in both Fastify (`onReady` hook) and Cloud Functions (before `server.inject()`)

## Anti-patterns

- Duplicating handler code between `server.ts` and `functions.ts` — violates DRY, bugs diverge between environments
- Different middleware chains for local vs production — testing locally becomes unreliable
- Calling `initializeDependencies()` inside handler function body — adds latency per request
- Importing Fastify server startup code into `functions.ts` — Cloud Functions runtime cannot run Fastify
- Adding OpenTelemetryMiddleware only in production — tracing behavior diverges from local testing
- Using `server.routing(req, res)` in Cloud Functions entry point — causes upstream request timeout; responses are never terminated correctly
- Using `extractAndStoreRequestBody(server)` as a routing adapter — in `@noony-serverless/core@0.8+` this takes a single `req`, not a server instance
- Top-level `await` in `functions.ts` — forces ESM output; wrap startup awaits in an async IIFE or `ensureServerReady()` guard, and always build with `--format=cjs`
- Passing `pino-pretty` transport via object spread (`...isDev && { transport: ... }`) — pino resolves the transport string at module load regardless; use an explicit `if` block so the key is absent in production

## Done when

- Handler is defined once and imported by both `server.ts` and `functions.ts`
- Fastify entry point uses eager initialization via `onReady` hook
- Cloud Functions entry point uses lazy initialization + `server.inject()` before each request
- `npm run dev` starts Fastify locally, `npm run deploy` deploys to Cloud Functions
- No framework-specific imports in handler files
- Middleware ordering verified against canonical order (**`noony-middleware-ordering`** skill)

---

## Reference: Full Project Structure

```
src/
├── core/
│   └── initialization.ts      # Singleton init guard
├── handlers/
│   └── user.handlers.ts       # Handler definitions
├── services/
│   └── user.service.ts        # Business logic
├── server.ts                  # Fastify for local dev
└── functions.ts               # Cloud Functions for prod

package.json
```

## Reference: 1. Handler Definition (Used by Both Environments)

```typescript
// src/handlers/user.handlers.ts
import { Handler, Context } from '@noony-serverless/core';
import { ErrorHandlerMiddleware, BodyValidationMiddleware, ResponseWrapperMiddleware } from '@noony-serverless/core';
import { z } from 'zod';
import { UserService } from '../services/user.service';

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email()
});

type CreateUserRequest = z.infer<typeof createUserSchema>;

interface AuthenticatedUser {
  id: string;
  role: 'admin' | 'user';
}

// Define handler once, use in both Fastify and Cloud Functions
export const createUserHandler = new Handler<CreateUserRequest, AuthenticatedUser>()
  .use(new ErrorHandlerMiddleware<CreateUserRequest, AuthenticatedUser>())
  .use(new BodyValidationMiddleware<CreateUserRequest, AuthenticatedUser>(createUserSchema))
  .use(new ResponseWrapperMiddleware<CreateUserRequest, AuthenticatedUser>())
  .handle(async (context: Context<CreateUserRequest, AuthenticatedUser>) => {
    const { name, email } = context.req.validatedBody!;
    const userService = new UserService();

    const user = await userService.create({ name, email });
    return { data: user };
  });
```

## Reference: 2. Initialization (Shared by Both)

```typescript
// src/core/initialization.ts
import { logger, containerPool } from '@noony-serverless/core';
import { DatabaseService } from '../services/database.service';
import { UserService } from '../services/user.service';

let initialized = false;
let initializationPromise: Promise<void> | null = null;

export async function initializeDependencies(): Promise<void> {
  // Fast path
  if (initialized && containerPool.isInitialized()) {
    return;
  }

  // Concurrent path
  if (initializationPromise) {
    await initializationPromise;
    return;
  }

  // First run
  initializationPromise = (async () => {
    try {
      logger.info('[Init] Starting initialization');

      const db = new DatabaseService();
      await db.connect();

      const userService = new UserService(db);

      containerPool.initializeGlobal([
        { id: 'Database', value: db },
        { id: 'UserService', value: userService }
      ]);

      containerPool.setInitialized();
      initialized = true;

      logger.info('[Init] Initialization complete');
    } catch (error) {
      logger.error('[Init] Failed', { error });
      initialized = false;
      containerPool.reset();
      throw error;
    } finally {
      initializationPromise = null;
    }
  })();

  await initializationPromise;
}

export async function cleanup(): Promise<void> {
  logger.info('[Cleanup] Starting');
  containerPool.reset();
  initialized = false;
  logger.info('[Cleanup] Complete');
}
```

## Reference: 3. Local Development (Fastify)

```typescript
// src/server.ts
import Fastify from 'fastify';
import { createFastifyHandler } from '@noony-serverless/core';
import { createUserHandler } from './handlers/user.handlers';
import { initializeDependencies, cleanup } from './core/initialization';

const server = Fastify({ logger: true });

// Initialize on server startup (eager)
server.addHook('onReady', async () => {
  await initializeDependencies();
});

// Register routes
server.post('/api/users',
  createFastifyHandler(createUserHandler, 'createUser', () => Promise.resolve())
);

// Graceful shutdown
const gracefulShutdown = async () => {
  await server.close();
  await cleanup();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});

export default server;
```

## Reference: 4. Production (Cloud Functions)

```typescript
// src/functions.ts
import { http } from '@google-cloud/functions-framework';
import { extractAndStoreRequestBody, CloudFunctionRequest } from '@noony-serverless/core';
import { server, initializeDependencies } from './server';

let serverReady = false;

async function ensureServerReady(): Promise<void> {
  if (serverReady) return;
  await initializeDependencies();
  await server.ready();
  serverReady = true;
}

export const createUser = http('createUser', async (req, res) => {
  try {
    await ensureServerReady();

    // GCF sets req.rawBody as Buffer with original bytes before JSON parsing.
    const gcfRawBody: Buffer | undefined = (req as any).rawBody;
    extractAndStoreRequestBody(req);  // fallback: stores re-parsed body on req.__rawBody
    const payload = gcfRawBody ?? (req as unknown as CloudFunctionRequest).__rawBody;

    const response = await server.inject({
      method: req.method as any,
      url: req.url || '/',
      headers: req.headers as Record<string, string>,
      payload,
    });

    res.statusCode = response.statusCode;
    for (const [key, value] of Object.entries(response.headers)) {
      if (value !== undefined) res.setHeader(key, value as string);
    }
    res.end(response.payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[createUser] error', { message });
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An error occurred' } }));
  }
});
```

## Reference: 5. npm Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc --format=cjs",
    "test": "jest",
    "deploy": "npm run build && gcloud functions deploy createUser --runtime nodejs20 --trigger-http --entry-point createUser"
  }
}
```

## Reference: Comparison Table

| Aspect | Local (Fastify) | Production (Cloud Functions) |
|--------|-----------------|----------------------------|
| Entry Point | `server.ts` | `functions.ts` |
| Handler Execution | `createFastifyHandler()` wrapper | `server.inject()` |
| Initialization | Eager (on server startup) | Lazy (on first request) |
| Cleanup | Graceful shutdown on SIGTERM | Automatic (function ends) |
| Same Handler | ✅ Yes, identical | ✅ Yes, identical |
| Same Middleware Chain | ✅ Yes, identical | ✅ Yes, identical |

## Reference: Common Gotchas

### ❌ Different Middleware Chains

```typescript
// WRONG — different for local vs production
const localHandler = new Handler()
  .use(new ErrorHandlerMiddleware())
  .use(new BodyValidationMiddleware(schema))
  // Missing OpenTelemetryMiddleware
  .handle(controller);

// CORRECT — single definition used by both
const handler = new Handler()
  .use(new ErrorHandlerMiddleware())
  .use(new OpenTelemetryMiddleware())
  .use(new BodyValidationMiddleware(schema))
  .handle(controller);

server.post('/api/endpoint', createFastifyHandler(handler, 'endpoint', initDeps));

export const endpoint = http('endpoint', async (req, res) => {
  await ensureServerReady();
  const response = await server.inject({ method: req.method as any, url: req.url || '/', headers: req.headers as any, payload: (req as any).rawBody });
  res.statusCode = response.statusCode;
  res.end(response.payload);
});
```

### ❌ Initialization in Wrong Place

```typescript
// WRONG — initializes in handler body
const handler = new Handler()
  .handle(async (context) => {
    const db = await DatabaseService.connect();  // Each request waits!
  });

// CORRECT — initialize at startup
server.addHook('onReady', () => initializeDependencies());
// In GCF: await ensureServerReady() before server.inject()
```
