---
name: noony-dependency-initialization
description: Use when initializing database connections, setting up singleton services, implementing the three-condition guard for concurrent-safe one-time initialization, connecting to external APIs at startup, or preventing duplicate DB connections during cold starts in Noony handlers.
---

# skill:noony-dependency-initialization

## Does exactly this

The singleton initialization guard pattern — initialize database connections, services, and SDKs exactly once. Handles concurrent cold-start requests, initialization failures with retry, and graceful shutdown cleanup.

## When to use

- "Initialize database connection"
- "Set up singleton services at startup"
- "Prevent duplicate initialization under concurrent requests"
- "Three-condition guard pattern"
- "Graceful shutdown with cleanup"
- "Eager vs lazy initialization"

## Do not use this skill when

- For service RESOLUTION (getService, container scopes) → use `noony-dependency-injection` skill
- For broader performance optimization (memory, lazy vs eager strategy, containerPool tuning) → use `noony-performance-optimization` skill
- For testing with mocked services → use `noony-testing-handlers` skill
- For DI inside custom middleware → use `noony-middleware-development` skill

## Steps

1. Create the three-condition guard with `initialized` flag, `initializationPromise`, and first-run logic
   - Condition 1: fast path — return immediately if already initialized
   - Condition 2: concurrent path — `await initializationPromise` if another request started init
   - Condition 3: first request — perform actual initialization

2. Register all global services via `containerPool.initializeGlobal()` with `{ id, value }` pairs inside the guard
   - Never use `Container.set()` directly — it bypasses framework scoping

3. Reset state on failure so the next request can retry
   - Set `initialized = false` in the catch block
   - Call `containerPool.reset()` to clear partial state
   - Always clear `initializationPromise = null` in the finally block

4. Call `initializeDependencies()` at the right time
   - **Eager (Fastify/Express):** call at server startup before listening
   - **Lazy (Cloud Functions):** pass as third argument to handler wrapper
   - Never call inside a handler function — adds 300-500ms per request

5. After initialization, resolve services using `noony-dependency-injection` skill patterns

6. Add graceful shutdown with cleanup on SIGTERM/SIGINT
   - Disconnect database connections, call `containerPool.reset()`, set `initialized = false`

## Rules

- Three-condition guard is REQUIRED — all three conditions must be present
- Services registered ONLY via `containerPool.initializeGlobal()` with id/value pairs
- Never call `initializeDependencies()` inside a handler — adds latency per request
- Always reset `initialized = false` on error so next request retries
- Always clear `initializationPromise = null` in the finally block
- Graceful shutdown MUST call cleanup before process exit

## Anti-patterns

- ❌ Missing Condition 2 (`initializationPromise` check) — concurrent requests each open their own DB connection
- ❌ Forgetting to reset `initialized` on failure — stuck in broken state permanently
- ❌ Calling init inside handler function — 300-500ms penalty on every request
- ❌ Using `Container.set()` instead of `containerPool.initializeGlobal()` — bypasses framework DI scoping
- ❌ No cleanup on shutdown — database connections leak, sockets left open
- ❌ Creating new service instances per request instead of resolving from container

## Done when

- Three-condition guard is implemented with all three conditions
- Global services registered via `containerPool.initializeGlobal()`
- Failure resets state so next request can retry
- Initialization called at startup (eager) or via wrapper (lazy) — not per-request
- Graceful shutdown handlers registered for SIGTERM and SIGINT

---

## Reference: Singleton Pattern with Three-Condition Guard

```typescript
// src/core/initialization.ts
import { logger, containerPool } from '@noony-serverless/core';

let initialized = false;
let initializationPromise: Promise<void> | null = null;

export async function initializeDependencies(): Promise<void> {
  // CONDITION 1: Fast path - already initialized
  if (initialized && containerPool.isInitialized()) {
    logger.debug('[Init] Dependencies already initialized');
    return;
  }

  // CONDITION 2: Concurrent request path - wait for in-progress initialization
  if (initializationPromise) {
    logger.debug('[Init] Waiting for in-progress initialization');
    await initializationPromise;
    return;
  }

  // CONDITION 3: First request path - perform initialization
  logger.info('[Init] Starting dependency initialization');

  initializationPromise = (async () => {
    try {
      // 1. Connect to database
      const db = await databaseService.connect();

      // 2. Initialize repositories
      const userRepository = new UserRepository(db);
      const configRepository = new ConfigRepository(db);

      // 3. Initialize services
      const authService = new AuthService(userRepository);

      // 4. Register services in container pool for DI
      containerPool.initializeGlobal([
        { id: 'UserRepository', value: userRepository },
        { id: 'ConfigRepository', value: configRepository },
        { id: 'AuthService', value: authService },
      ]);

      // 5. Mark as initialized
      containerPool.setInitialized();
      initialized = true;

      logger.info('[Init] Dependency initialization complete');
    } catch (error) {
      // IMPORTANT: Reset state on failure so next request can retry
      initialized = false;
      containerPool.reset();
      throw error;
    } finally {
      // Always clear the promise to allow next attempt
      initializationPromise = null;
    }
  })();

  await initializationPromise;
}

export async function cleanup(): Promise<void> {
  await databaseService.disconnect();
  containerPool.reset();
  initialized = false;
}
```

## Reference: Eager Initialization (Fastify)

```typescript
// src/server.ts
const server = Fastify();

server.addHook('onReady', async () => {
  await initializeDependencies();
});

const gracefulShutdown = async () => {
  await server.close();
  await cleanup();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

## Reference: Lazy Initialization (Cloud Functions)

```typescript
// src/functions.ts
import { http } from '@google-cloud/functions-framework';
import { initializeDependencies } from './core/initialization';

export const createUser = http('createUser', async (req, res) => {
  // Lazy initialization on first request (cold start)
  // Subsequent requests hit fast path and return immediately
  await initializeDependencies();

  await createUserHandler.execute(req, res);
});
```

## Reference: Performance Implications

```
Cold start:  100ms (function startup)
+ First req: 500ms (init DB + services) + 50ms (business logic) = 550ms total
+ Req 2-N:   50ms (fast path)

Recommendation: Eager initialization for production (Cloud Run, App Engine warm servers).
Lazy initialization acceptable for low-traffic endpoints.
```

## Reference: Troubleshooting

### "Service not found" Error

**Cause:** Called handler before `initializeDependencies()` completed.
**Fix:** Always await initialization before handler execution.

### Multiple Concurrent Requests Initializing

**Cause:** Missing or broken CONDITION 2 (initializationPromise check).
**Fix:** Ensure promise tracking is correct — `if (initializationPromise) { await initializationPromise; return; }`

### "Already initialized" on Retry After Failure

**Cause:** Forgot to reset `initialized = false` in error handler.
**Fix:** Reset state in catch block: `initialized = false; containerPool.reset();`
