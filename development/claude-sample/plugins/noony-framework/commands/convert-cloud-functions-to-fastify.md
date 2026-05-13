---
name: noony-convert-cloud-functions-to-fastify
description: Use when MIGRATING existing Cloud Functions handlers to run locally with Fastify. Converts tightly-coupled Cloud Functions code into framework-agnostic handlers with dual deployment.
---

# skill:noony-convert-cloud-functions-to-fastify

## Does exactly this

Converts an existing Cloud Functions handler into a framework-agnostic Noony handler that runs in both Fastify (local dev) and Cloud Functions (production) with zero code duplication. This is a MIGRATION skill — it takes what you already have and restructures it.

## When to use

- "Convert my Cloud Function to run locally"
- "Test handler locally before deploying"
- "Speed up development iteration"
- "Migrate Cloud Functions code to Noony"
- "No code changes between environments"
- You have existing `functions.ts` code with inline handler logic and want to add local dev support

## Do not use this skill when

- You are starting a new project from scratch — use **`noony-complete-dual-entry`** skill instead. It gives you the production pattern without migration concerns.
- You only need a quick Fastify dev server without migration — use **`noony-create-fastify-server`** skill instead.
- You need to support a non-Fastify framework — use **`noony-custom-adapter`** skill instead.

## Steps

1. Extract handler logic into a framework-agnostic module
   - Create `src/handlers/[name].handler.ts` with `new Handler<TBody, TUser>()`
   - Move validation to `BodyValidationMiddleware(zodSchema)`
   - Move error handling to `ErrorHandlerMiddleware`
   - No imports from Cloud Functions or Fastify in this file

2. Verify middleware ordering follows canonical order
   - ErrorHandlerMiddleware first, ResponseWrapperMiddleware last
   - See **`noony-middleware-ordering`** skill for the definitive reference and common mistakes

3. Create shared initialization module
   - Singleton guard with `initialized` flag and concurrent-safe promise
   - Register global services in `containerPool.initializeGlobal()`

4. Set up Cloud Functions entry point
   - Use `server.inject()` to forward requests through Fastify — NOT `server.routing()` (causes timeouts)
   - Pass `req.rawBody` (GCF's Buffer) as `payload` to `server.inject()` — this preserves original bytes through `addContentTypeParser`
   - Pre-read body with `extractAndStoreRequestBody(req)` as fallback only; use `gcfRawBody ?? __rawBody` as the payload
   - Build with `--format=cjs` — avoid top-level `await` (forces ESM, breaks `require()`)
   - `ensureServerReady()` guard (calls `initializeDependencies()` + `server.ready()`) before each inject

5. Set up Fastify entry point
   - Standard routes: `createFastifyHandler(handler, name, initFn)` wrapper
   - Routes needing rawBody (webhooks, signatures): use `executeGeneric` with custom adapter — see **`noony-custom-adapter`** skill
   - Register `addContentTypeParser('application/json', { parseAs: 'buffer' }, ...)` BEFORE routes when any route needs rawBody
   - Initialize eagerly in `onReady` hook

6. Test locally with Fastify, deploy to Cloud Functions with confidence

## Migration pattern (before/after)

**Before** (tightly coupled):
```
functions.ts -> handler logic inline with req.body, try/catch, res.status()
```

**After** (framework-agnostic):
```
handlers/user.handler.ts  -> Handler<T,U> with middleware chain
functions.ts               -> ensureServerReady() + server.inject()
server.ts                  -> createFastifyHandler(handler, name, initFn)
```

## Rules

- Same handler instance for both entry points — never duplicate handler code
- Same middleware chain in both environments — if you add OTel in prod, add it locally too
- `server.inject()` for Cloud Functions — routes through Fastify, preserves middleware chain
- `createFastifyHandler()` for Fastify — adapts to GenericRequest/GenericResponse
- `initializeDependencies()` in both paths — idempotent, safe to call multiple times
- No environment-specific logic in handler modules

## Anti-patterns

- Different middleware chains for Fastify vs Cloud Functions — production behavior differs from local testing
- Duplicating handler code between entry points — bugs in one environment won't surface in the other
- Using `handler.execute()` directly in GCF when using `server.inject()` pattern — bypasses Fastify
- Importing Fastify server code into `functions.ts` — Cloud Functions cannot run Fastify
- Converting without the dual-entry pattern — locks you into Fastify and loses Cloud Functions deployment
- Using `server.routing(req, res)` in the Cloud Functions entry — response is never terminated, causes upstream request timeout
- Using `extractAndStoreRequestBody(server)` as a routing wrapper — not a routing adapter in `@noony-serverless/core@0.8+`; use `server.inject()` instead
- Top-level `await` in `functions.ts` — GCP's Functions Framework uses `require()` which cannot load ESM with TLA; wrap in IIFE or guard function and build with `--format=cjs`
- `pino-pretty` transport via object spread — pino resolves the transport at module load; use explicit `if (isDevelopment)` block so the key is absent in production
- Using `JSON.stringify(req.body)` as rawBody for signature verification — re-serialized bytes differ from original; pass `req.rawBody` (GCF Buffer) through `server.inject()` and capture via `addContentTypeParser`
- Bypassing Fastify entirely for webhook routes that need rawBody — use `executeGeneric` with a custom adapter inside a Fastify route instead; see **`noony-custom-adapter`** skill

## Done when

- Same handler runs in both Fastify and Cloud Functions without code changes
- Cloud Functions entry uses `server.inject()` in `functions.ts`
- `createFastifyHandler()` used in `server.ts` for standard routes
- Local testing with `npm run dev` produces identical responses to deployed Cloud Function
- No Cloud Functions or Fastify imports in handler files
- Middleware ordering verified against canonical order (**`noony-middleware-ordering`** skill)

---

## Reference: Architecture — Same Handler, Two Deployments

```
Handler Code (src/handlers/user.handler.ts)
    |
    +-- Cloud Functions Entry Point
    |   (src/functions.ts)
    |   +-- ensureServerReady()
    |   +-- server.inject()
    |   +-- Deploy to GCP
    |
    +-- Fastify Entry Point
        (src/server.ts)
        +-- createFastifyHandler()
        +-- npm run dev
```

## Reference: Step 1 — Migration Checklist (Before/After)

**Before (Tightly Coupled):**
```typescript
// OLD — Cloud Functions specific
export const createUser = http('createUser', async (req, res) => {
  try {
    const { email, name, age } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const user = await userService.create({ email, name, age });
    res.status(201).json({ data: user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

**After (Framework-Agnostic):**
```typescript
// NEW — Works everywhere
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  age: z.number().min(18)
});

export const createUserHandler = new Handler<z.infer<typeof createUserSchema>>()
  .use(new ErrorHandlerMiddleware())
  .use(new BodyValidationMiddleware(createUserSchema))
  .use(new ResponseWrapperMiddleware())
  .handle(async (context) => {
    const { email, name, age } = context.req.validatedBody!;
    const user = await userService.create({ email, name, age });
    // Return the value — never call context.res.status().json()
    return user;
  });
```

## Reference: Step 2 — Cloud Functions Entry Point

Use `server.inject()` — do NOT call `handler.execute()` directly (bypasses Fastify) or `server.routing()` (causes timeout).

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

http('myHandler', async (req, res) => {
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
      payload,  // ← original Buffer flows to addContentTypeParser → rawBodyBuffer
    });

    res.statusCode = response.statusCode;
    for (const [key, value] of Object.entries(response.headers)) {
      if (value !== undefined) res.setHeader(key, value as string);
    }
    res.end(response.payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[myHandler] error', { message, url: req.url });
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An error occurred' } }));
  }
});
```

## Reference: Step 3 — Fastify Entry Point

Two patterns depending on whether the route needs `rawBody`:

**Standard routes** (no rawBody needed) — use `createFastifyHandler`:

```typescript
// src/server.ts
import Fastify from 'fastify';
import { createFastifyHandler } from '@noony-serverless/core';
import { createUserHandler } from './handlers/user.handler';
import { initializeDependencies } from './config/di.config';

export const server = Fastify({ logger: true });

// MUST register addContentTypeParser BEFORE routes when any route needs rawBody
server.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body as string, 'utf8');
  (req as unknown as { rawBodyBuffer: Buffer }).rawBodyBuffer = buf;
  try {
    done(null, JSON.parse(buf.toString('utf8')));
  } catch (err) {
    done(err as Error, undefined);
  }
});

// Standard routes — createFastifyHandler (rawBody not populated)
server.post('/api/users', createFastifyHandler(createUserHandler, 'createUser', initializeDependencies));
server.get('/health', createFastifyHandler(healthHandler, 'health', initializeDependencies));

// Routes needing rawBody — use executeGeneric with custom adapter (see noony-custom-adapter skill)
server.post('/webhook/:id', adaptWithRawBody(webhookHandler, initializeDependencies));
```

## Reference: Step 4 — Shared Configuration

```typescript
// src/config/di.config.ts
import { containerPool } from '@noony-serverless/core';
import { DatabaseService } from '../services/database.service';
import { UserService } from '../services/user.service';

let initialized = false;
let initializationPromise: Promise<void> | null = null;

export async function initializeDependencies(): Promise<void> {
  if (initialized && containerPool.isInitialized()) return;
  if (initializationPromise) { await initializationPromise; return; }

  initializationPromise = (async () => {
    try {
      const database = new DatabaseService();
      await database.connect();

      containerPool.initializeGlobal([
        { id: 'Database', value: database },
        { id: 'UserService', value: new UserService(database) }
      ]);

      containerPool.setInitialized();
      initialized = true;
    } catch (error) {
      initialized = false;
      containerPool.reset();
      throw error;
    } finally {
      initializationPromise = null;
    }
  })();

  await initializationPromise;
}
```

## Reference: Local Integration Testing

```typescript
// test/integration.test.ts
import Fastify from 'fastify';
import { createFastifyHandler } from '@noony-serverless/core';
import { createUserHandler } from '../src/handlers/user.handler';
import { initializeDependencies } from '../src/config/di.config';

describe('User Handler Integration', () => {
  let app: any;

  beforeAll(async () => {
    app = Fastify();
    app.post('/api/users',
      createFastifyHandler(createUserHandler, 'createUser', initializeDependencies)
    );
  });

  it('should create user successfully', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      headers: { Authorization: `Bearer ${token}` },
      payload: { email: 'new@example.com', name: 'New User', age: 30 }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.id).toBeDefined();
  });

  it('should reject invalid email', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { email: 'invalid-email', name: 'User', age: 30 }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('VALIDATION_ERROR');
  });
});
```

## Reference: Performance Comparison

| Metric | Fastify (Local) | Cloud Functions | Fastify Benefits |
|--------|-----------------|-----------------|------------------|
| Startup Time | 150ms | 3000ms+ | ~20x faster |
| Request Time | 5-10ms | 50-200ms | ~10x faster |
| Iteration Speed | 1s (code save) | 5min+ (deploy) | 300x faster |
| Debugging | Full local tools | Cloud Logging | Immensely better |

## Reference: Common Gotchas

### Gotcha 1: Using server.routing() in GCF

```typescript
// WRONG — response never terminates, causes upstream timeout
http('myHandler', async (req, res) => {
  await server.routing(req, res);
});

// CORRECT — use server.inject() and forward the response manually
http('myHandler', async (req, res) => {
  await ensureServerReady();
  const response = await server.inject({ ... });
  res.statusCode = response.statusCode;
  res.end(response.payload);
});
```

### Gotcha 2: Using JSON.stringify as rawBody

```typescript
// WRONG — re-serialized bytes differ from original; signature verification fails
const rawBody = JSON.stringify(req.body);

// CORRECT — pass GCF's original Buffer through server.inject
const gcfRawBody: Buffer | undefined = (req as any).rawBody;
const payload = gcfRawBody ?? (req as unknown as CloudFunctionRequest).__rawBody;
await server.inject({ ..., payload });
```

### Gotcha 3: Top-level await in functions.ts

```typescript
// WRONG — forces ESM (TLA), breaks require() used by GCF Functions Framework
const db = await connectDB();

// CORRECT — wrap in guarded async function, build with --format=cjs
async function ensureServerReady() {
  if (serverReady) return;
  await initializeDependencies();
  await server.ready();
  serverReady = true;
}
```
