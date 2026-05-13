---
name: noony-custom-adapter
description: Use when creating adapters for unsupported frameworks (Koa, Hapi, NestJS), OR when a Fastify route needs access to raw request data (rawBody, custom headers) that createFastifyHandler does not expose. The executeGeneric + custom adapter pattern is the correct solution for both cases.
---

# skill:noony-custom-adapter

## Does exactly this

Provides the pattern for building a custom `GenericRequest<T>` + `GenericResponse` adapter and calling `handler.executeGeneric()` directly. Use this for unsupported frameworks (Koa, Hapi, NestJS) **or** for Fastify routes that need fields not populated by the built-in `createFastifyHandler` — most commonly `rawBody` for signature verification.

## When to use

- "Add support for Koa/Hapi/NestJS/[framework]"
- "Create adapter for my framework"
- "Make Noony work with [framework]"
- "I want to use Noony outside of Cloud Functions and Fastify"
- "Implement GenericRequest or GenericResponse"
- "How does executeGeneric work"
- A Fastify route needs `context.req.rawBody` (e.g. webhook signature verification) — `createFastifyHandler` does not populate this field; write a custom adapter that sets it

## Do not use this skill when

- **Express** — built-in support via `handler.execute()`. No adapter needed.
- **Google Cloud Functions** — built-in support via `handler.execute()`. No adapter needed.
- You want the standard Fastify + Cloud Functions dual-entry pattern with no raw-body needs — use **`noony-complete-dual-entry`** skill instead.

## The executeGeneric pattern (core concept)

```typescript
// Instead of createFastifyHandler (which doesn't populate rawBody):
server.post('/webhook/:id', async (req, reply) => {
  const genericReq = adaptFastifyRequestWithRawBody(req);  // custom adapter
  const genericRes = adaptFastifyReply(reply);
  await handler.executeGeneric(genericReq, genericRes);     // zero-overhead, no internal conversion
});
```

`executeGeneric()` accepts already-adapted `GenericRequest`/`GenericResponse` — you control exactly what fields are set.

## Steps

1. Capture raw bytes before Fastify parses JSON
   - Register `addContentTypeParser('application/json', { parseAs: 'buffer' }, ...)` on the Fastify server
   - Store the buffer on the Fastify request: `(req as any).rawBodyBuffer = buf`
   - Then call `JSON.parse(buf.toString('utf8'))` and pass to `done(null, parsed)`
   - This must be registered BEFORE routes

2. Implement `GenericRequest<T>` adapter
   - Map Fastify request to: method, url, path, headers, query, params, body, parsedBody
   - Set `rawBody: (req as any).rawBodyBuffer` — the Buffer captured in step 1
   - CRITICAL: Set `parsedBody` from `req.body` — `BodyValidationMiddleware` reads from this

3. Implement `GenericResponse` adapter
   - Implement: `status()`, `json()`, `send()`, `header()`, `headers()`, `end()`
   - All methods MUST return `this` (chainable)
   - Track `headersSent` via `reply.sent` to prevent double-send
   - Expose read-only `statusCode` and `headersSent` properties

4. Create a route wrapper that calls `executeGeneric`
   - `await handler.executeGeneric(genericReq, genericRes)`
   - Handle `isResponseAlreadySent` errors gracefully

5. Register routes using the wrapper for routes that need rawBody; use `createFastifyHandler` for all others
   - Standard routes: `server.post('/api/users', createFastifyHandler(handler, 'name', initFn))`
   - Raw-body routes: `server.post('/webhook/:id', adaptWithRawBody(handler))`

6. In the GCF entry point, pass `req.rawBody` (GCF's original Buffer) as the `server.inject()` payload
   - GCF sets `req.rawBody: Buffer` with the original bytes before JSON parsing
   - `server.inject({ payload: gcfRawBody })` routes it through `addContentTypeParser` which stores it as `rawBodyBuffer`

7. Read `context.req.rawBody` in the middleware — it is a `Buffer | string | undefined`
   ```typescript
   const raw = context.req.rawBody;
   const str = Buffer.isBuffer(raw) ? raw.toString('utf8') : raw ?? JSON.stringify(context.req.body ?? {});
   ```

8. Verify middleware ordering follows canonical order — see **`noony-middleware-ordering`** skill

## Rules

- `GenericRequest<T>` and `GenericResponse` MUST be fully implemented — no partial implementations
- Always track `headersSent` flag to prevent double-send errors
- Response methods MUST be chainable (return `this`)
- Never mutate the framework's native request/response during adaptation — create new objects
- Always set `parsedBody` from framework's parsed body (required for BodyValidationMiddleware)
- Handle `RESPONSE_SENT` errors gracefully — response already sent is expected behavior
- Use `executeGeneric()`, never `execute()` — the latter is for native GCP/Express req/res only
- `addContentTypeParser` MUST be registered before routes on the Fastify server
- GCF `req.rawBody` (Buffer) must be passed as `server.inject()` payload — `extractAndStoreRequestBody` re-serializes and loses original bytes

## Anti-patterns

- Passing framework-native req/res directly to `executeGeneric()` without adapting — misses the interface contract, middleware will fail
- Forgetting `headersSent` check in response adapter — causes double-send errors and crashes
- Not setting `parsedBody` on adapted request — validation middleware fails silently, body is always undefined
- Breaking method chaining on response methods — middleware pipeline breaks when `.status(200).json(data)` fails
- Using `execute()` instead of `executeGeneric()` — `execute()` expects native GCP/Express objects
- Using `JSON.stringify(req.body)` as rawBody for signature verification — re-serialized bytes differ from original; always use the captured Buffer
- Bypassing Fastify entirely (pattern-matching URLs in the GCF handler) — loses Fastify routing, logging, and middleware; use `executeGeneric` inside a Fastify route instead

## Done when

- `addContentTypeParser` captures raw bytes into `rawBodyBuffer` on the Fastify request
- `GenericRequest` adapter sets `rawBody` from `rawBodyBuffer`
- `GenericResponse` adapter prevents double-send via `headersSent` tracking
- `executeGeneric` called in route handler with adapted request/response
- GCF entry point passes `req.rawBody` Buffer as `server.inject()` payload
- Middleware reads `context.req.rawBody` — no internal imports, no WeakMap hacks
- Middleware ordering verified against canonical order (**`noony-middleware-ordering`** skill)

---

## Reference: Step 1 — Capture Raw Bytes in Content-Type Parser

Register BEFORE routes on the Fastify server. GCF passes `req.rawBody` (Buffer) as the `server.inject()` payload — this parser receives it and stores it.

```typescript
server.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body as string, 'utf8');
  (req as unknown as { rawBodyBuffer: Buffer }).rawBodyBuffer = buf;
  try {
    done(null, JSON.parse(buf.toString('utf8')));
  } catch (err) {
    done(err as Error, undefined);
  }
});
```

## Reference: Step 2 — Fastify Request Adapter with rawBody

```typescript
import type { FastifyRequest } from 'fastify';
import type { GenericRequest } from '@noony-serverless/core';

function adaptFastifyRequestWithRawBody<T = unknown>(req: FastifyRequest): GenericRequest<T> {
  const rawBuf = (req as unknown as { rawBodyBuffer?: Buffer }).rawBodyBuffer;
  return {
    method: req.method,
    url: req.url,
    path: (req.routeOptions as unknown as { url?: string })?.url ?? req.url,
    headers: req.headers as Record<string, string | string[] | undefined>,
    query: (req.query as Record<string, string | string[] | undefined>) ?? {},
    params: (req.params as Record<string, string>) ?? {},
    body: req.body,
    parsedBody: req.body as T,
    rawBody: rawBuf,          // ← the original bytes; undefined falls back gracefully
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };
}
```

## Reference: Step 3 — Fastify Response Adapter

```typescript
import type { FastifyReply } from 'fastify';
import type { GenericResponse } from '@noony-serverless/core';

function adaptFastifyReply(reply: FastifyReply): GenericResponse {
  let statusCode = 200;
  let headersSent = false;
  const res: GenericResponse = {
    status(code)      { statusCode = code; reply.code(code); return res; },
    json(data)        { if (reply.sent) return res; headersSent = true; reply.send(data); return res; },
    send(data)        { if (reply.sent) return res; headersSent = true; reply.send(data); return res; },
    header(name, val) { reply.header(name, val); return res; },
    headers(hdrs)     { for (const k in hdrs) reply.header(k, hdrs[k]); return res; },
    end()             { if (!reply.sent) { headersSent = true; reply.send(); } },
    get statusCode()  { return statusCode; },
    get headersSent() { return headersSent || reply.sent; },
  };
  return res;
}
```

## Reference: Step 4 — executeGeneric Wrapper

```typescript
import type { Handler } from '@noony-serverless/core';
import { isResponseAlreadySent, INTERNAL_ERROR_RESPONSE } from '@noony-serverless/core';

function adaptWithRawBody(handler: Handler<any, any>, initFn: () => Promise<void>) {
  return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    await initFn();
    try {
      const genericReq = adaptFastifyRequestWithRawBody(req);
      const genericRes = adaptFastifyReply(reply);
      await handler.executeGeneric(genericReq, genericRes);
    } catch (error) {
      if (isResponseAlreadySent(error)) return;
      if (!reply.sent) reply.code(500).send(INTERNAL_ERROR_RESPONSE);
    }
  };
}
```

## Reference: Step 5 — Route Registration

Mix standard and custom adapters on the same Fastify server:

```typescript
// Routes that need rawBody — use executeGeneric with custom adapter
server.get('/webhook/ebay/notifications/:marketplaceId', adaptWithRawBody(challengeHandler, init));
server.post('/webhook/ebay/notifications/:marketplaceId', adaptWithRawBody(notificationHandler, init));

// Standard routes — use createFastifyHandler (no rawBody needed)
server.post('/api/orders', createFastifyHandler(orderHandler, 'order', init));
server.get('/health', createFastifyHandler(healthHandler, 'health', init));
```

## Reference: Step 6 — GCF Entry Point with rawBody

```typescript
import { http } from '@google-cloud/functions-framework';
import { extractAndStoreRequestBody, CloudFunctionRequest } from '@noony-serverless/core';

http('myHandler', async (req, res) => {
  await ensureServerReady();

  // GCF sets req.rawBody as Buffer with the original bytes before JSON parsing.
  const gcfRawBody: Buffer | undefined = (req as any).rawBody;
  extractAndStoreRequestBody(req);
  const payload = gcfRawBody ?? (req as unknown as CloudFunctionRequest).__rawBody;

  const response = await server.inject({
    method: req.method as any,
    url: req.url || '/',
    headers: req.headers as Record<string, string>,
    payload,  // ← Buffer flows through to addContentTypeParser → rawBodyBuffer
  });

  res.statusCode = response.statusCode;
  for (const [key, value] of Object.entries(response.headers)) {
    if (value !== undefined) res.setHeader(key, value as string);
  }
  res.end(response.payload);
});
```

## Reference: Step 7 — Read rawBody in Middleware

```typescript
// In any middleware before() method:
const rawBodyRaw = context.req.rawBody;
const rawBody: string = Buffer.isBuffer(rawBodyRaw)
  ? rawBodyRaw.toString('utf8')
  : typeof rawBodyRaw === 'string'
    ? rawBodyRaw
    : JSON.stringify(context.req.body ?? {});  // fallback for routes without rawBody
```

## Reference: Complete Koa Adapter Example

```typescript
import { GenericRequest, GenericResponse } from '@noony-serverless/core';
import { Context as KoaContext } from 'koa';

export function adaptKoaRequest<T = unknown>(koaContext: KoaContext): GenericRequest<T> {
  return {
    method: koaContext.method,
    url: koaContext.url,
    path: koaContext.path,
    headers: koaContext.headers as Record<string, string | string[]>,
    query: koaContext.query as Record<string, string | string[]>,
    params: koaContext.params as Record<string, string>,
    body: koaContext.request.body as unknown,
    parsedBody: koaContext.request.body as T,
    ip: koaContext.ip,
    userAgent: koaContext.headers['user-agent'],
  };
}

export function adaptKoaResponse(koaContext: KoaContext): GenericResponse {
  let statusCode = 200;
  let headersSent = false;

  return {
    status(code) { statusCode = code; koaContext.status = code; return this; },
    json(data)   { if (!headersSent) { koaContext.type = 'application/json'; koaContext.body = data; headersSent = true; } return this; },
    send(data)   { if (!headersSent) { koaContext.body = data; headersSent = true; } return this; },
    header(name, value) { koaContext.set(name, value); return this; },
    headers(headers) { Object.entries(headers).forEach(([k, v]) => koaContext.set(k, v)); return this; },
    end() { headersSent = true; },
    get statusCode() { return statusCode; },
    get headersSent() { return headersSent; },
  };
}

export function createKoaHandler(noonyHandler: Handler<unknown>, functionName: string, initFn?: () => Promise<void>) {
  return async (koaContext: KoaContext) => {
    try {
      if (initFn) await initFn();
      const genericReq = adaptKoaRequest(koaContext);
      const genericRes = adaptKoaResponse(koaContext);
      await noonyHandler.executeGeneric(genericReq, genericRes);
    } catch (error) {
      if (error instanceof Error && error.message === 'RESPONSE_SENT') return;
      console.error(`[${functionName}] Unexpected error`, error);
      if (!koaContext.res.headersSent) {
        koaContext.status = 500;
        koaContext.body = { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } };
      }
    }
  };
}
```

## Reference: Adapter Checklist

- [ ] `addContentTypeParser` registered BEFORE routes (Fastify rawBody pattern)
- [ ] `rawBodyBuffer` stored on Fastify request in content-type parser
- [ ] `GenericRequest.rawBody` set from `rawBodyBuffer` (Buffer, not re-serialized string)
- [ ] GCF entry passes `req.rawBody` Buffer as `server.inject()` payload
- [ ] Implements `GenericRequest<T>` interface completely
- [ ] Implements `GenericResponse` interface completely
- [ ] `parsedBody` set from framework's parsed body
- [ ] Prevents double-send via `headersSent` tracking
- [ ] All response methods return `this` (chainable)
- [ ] Has `status()`, `json()`, `send()`, `header()`, `headers()`, `end()` methods
- [ ] Read-only `statusCode` and `headersSent` properties
- [ ] `executeGeneric()` called — never `execute()` for adapted requests
- [ ] `isResponseAlreadySent` errors handled gracefully in wrapper

## Reference: Common Gotchas

### ❌ Using JSON.stringify as rawBody

```typescript
// WRONG — re-serialized bytes differ from original; signature verification fails
const rawBody = JSON.stringify(req.body);

// CORRECT — use the captured Buffer
const rawBodyRaw = context.req.rawBody;
const rawBody = Buffer.isBuffer(rawBodyRaw) ? rawBodyRaw.toString('utf8') : ...;
```

### ❌ Bypassing Fastify for Routes That Need rawBody

```typescript
// WRONG — pattern-matching URLs in the GCF handler loses Fastify routing/logging
if (url.startsWith('/webhook/')) {
  await handler.execute(req, res);  // bypasses Fastify entirely
}

// CORRECT — stay inside Fastify, use executeGeneric with custom adapter
server.post('/webhook/:id', adaptWithRawBody(handler, init));
```

### ❌ Forgetting headersSent Check

```typescript
// WRONG — can send twice
json(data) { reply.send(data); return res; }

// CORRECT
json(data) { if (reply.sent) return res; headersSent = true; reply.send(data); return res; }
```

### ❌ Not Setting parsedBody

```typescript
// WRONG — BodyValidationMiddleware reads parsedBody, not body
return { body: req.body };

// CORRECT
return { body: req.body, parsedBody: req.body as T };
```
