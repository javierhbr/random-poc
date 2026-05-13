---
name: noony-middleware-ordering
description: THE canonical reference for middleware chain order — all other pipeline skills defer to this. Use when composing middleware pipelines, debugging execution order, fixing "response already sent" errors, understanding before/after/onError flow direction, sharing data between middlewares via context.businessData, or positioning any middleware in the chain.
---

# skill:noony-middleware-ordering

## Does exactly this

Defines the canonical middleware execution order for every Noony handler. Explains how middlewares execute (before forward 0->N, after/onError reverse N->0), why canonical order matters, and how to use `context.businessData` for inter-middleware communication. This is the single source of truth for pipeline ordering — all other pipeline skills defer to this one.

## When to use

- Composing a middleware pipeline for a new handler
- Debugging why errors aren't being caught properly
- Fixing "response already sent" or double-send errors
- Understanding why `ErrorHandlerMiddleware` must be first
- Understanding why `ResponseWrapperMiddleware` must be last
- Sharing data between middlewares via `context.businessData`
- Adding a new middleware and deciding where to place it
- Any time another skill tells you to "check `noony-middleware-ordering` for ordering"

## Do not use this skill when

- You need to create a custom middleware -> `noony-middleware-development` handles implementation
- You need error class details -> `noony-error-handling` covers error types and cause chaining
- You need DI container setup -> `noony-dependency-injection`
- This skill is REFERENCE for ordering, not implementation — use the linked skills for how to build each middleware

## Steps

1. Understand execution flow: `before` runs forward (0->N), `after`/`onError` run reverse (N->0)
2. Place middlewares in canonical order:
   - **Position 1**: ErrorHandlerMiddleware — catches all errors
   - **Position 2**: OpenTelemetryMiddleware — wraps full request including auth
   - **Position 3-5**: Header/structural checks (cheap, fast-fail)
   - **Position 6**: BodyParserMiddleware — parse before validation
   - **Position 7**: BodyValidationMiddleware — needs parsed body from position 6
   - **Position 8**: PathParametersMiddleware — before auth guards
   - **Position 9-12**: Auth middlewares (Firebase, OAuth2, guards)
   - **Position 13+**: DI / business logic middlewares
   - **Last**: ResponseWrapperMiddleware — must be last
3. Order principle: cheap structural checks early, expensive semantic operations late
4. Communicate between middlewares via `context.businessData` Map — never modify Context interface
5. When sending responses, choose ONE method: return value (for wrapping) OR `context.res.json()` — never both

## Rules

- `ErrorHandlerMiddleware` MUST be first (position 1) — its `onError` runs last in reverse, giving final authority
- `ResponseWrapperMiddleware` MUST be last — its `after` runs first in reverse, wrapping before others see it
- `OpenTelemetryMiddleware` at position 2 to wrap full request lifecycle including auth
- `BodyParserMiddleware` MUST come before `BodyValidationMiddleware` (positions 6-7)
- Path params at position 8, before auth guards that may need route params for ownership checks
- Never call `context.res.json()` AND return a value in the same handler — causes double-send
- Always check `context.res.headersSent` before sending in custom `after()` hooks
- Use `context.businessData` Map for inter-middleware state — do NOT extend Context interface
- Reserved key: `'otel_span'` — used by `OpenTelemetryMiddleware`, never overwrite

## Anti-patterns

- Ignoring this skill when setting up ANY handler — ordering errors are the #1 bug source in Noony pipelines
- `ErrorHandlerMiddleware` not first — errors from earlier middlewares go uncaught
- `ResponseWrapperMiddleware` not last — `after()` runs in wrong order, response wrapping fails
- `OpenTelemetryMiddleware` after auth — JWT verification time not traced
- `BodyValidationMiddleware` before `BodyParserMiddleware` — `parsedBody` is undefined, validation has nothing to work with
- Both `context.res.json()` AND return value — double-send error
- Sending response in multiple `after()` hooks — violates single-response contract
- Overwriting `context.businessData` key `'otel_span'` — breaks OpenTelemetry integration
- Expensive middleware (DB auth) before cheap validation (header check) — wastes resources on bad requests

## Done when

- Canonical ordering applied: ErrorHandler first, ResponseWrapper last
- You understand before->after reversed execution direction
- Each middleware is positioned per the canonical table above
- `RESPONSE_SENT` errors identified and prevented
- `context.businessData` used for inter-middleware communication

---

## Reference: Visual Timeline

```
Request arrives
    ↓
Middleware1.before()  ← position 0 runs first
    ↓
Middleware2.before()  ← position 1 runs second
    ↓
Middleware3.before()  ← position 2 runs third
    ↓
Handler (business logic)
    ↓
    ├─ [If error thrown]
    │  ↓
    │  Middleware3.onError()  ← reverse: position 2 first
    │  ↓
    │  Middleware2.onError()  ← reverse: position 1 second
    │  ↓
    │  Middleware1.onError()  ← reverse: position 0 third (last say on response)
    │
    └─ [If success]
       ↓
       Middleware3.after()  ← reverse: position 2 first
       ↓
       Middleware2.after()  ← reverse: position 1 second
       ↓
       Middleware1.after()  ← reverse: position 0 third
    ↓
Response sent
```

## Reference: Canonical Middleware Order Table

| Position | Middleware | Lifecycle | Reason |
|----------|------------|-----------|--------|
| **1** | ErrorHandlerMiddleware | onError runs last (reverse) — final authority | Catches ALL errors in reverse order |
| **2** | OpenTelemetryMiddleware | before first, after second | Wraps full request lifecycle for complete tracing |
| **3** | AuthenticationMiddleware | before second | Validates JWT after telemetry; populates context.user |
| **4** | BodyParserMiddleware | before third | Parses JSON/Pub/Sub before validation |
| **5** | BodyValidationMiddleware | before fourth | Validates parsed body with Zod schema |
| **N-1** | (Custom middlewares) | Middle of pipeline | Business-specific logic |
| **N** | ResponseWrapperMiddleware | after runs first (reverse) — wraps return value | Wraps `context.responseData` before any other after() hook |

**Why This Order Matters:**
- `before` runs 0→N: Each middleware prepares data for the next
- `after` runs N→0: Each middleware processes the result in reverse
- `onError` runs N→0: Each middleware handles errors in reverse, with first-position middleware having final say

## Reference: Common Mistakes

### Mistake 1: ErrorHandlerMiddleware Not First (❌)

```typescript
const handler = new Handler()
  .use(new AuthenticationMiddleware())     // position 0 — onError runs last
  .use(new BodyValidationMiddleware())     // position 1 — onError runs second
  .use(new ErrorHandlerMiddleware())       // position 2 — onError runs first (TOO EARLY!)
  .handle(controller);
```

**The Fix:**
```typescript
const handler = new Handler()
  .use(new ErrorHandlerMiddleware())       // position 0 — onError runs LAST (final say!)
  .use(new AuthenticationMiddleware())     // position 1
  .use(new BodyValidationMiddleware())     // position 2
  .handle(controller);
```

### Mistake 2: ResponseWrapperMiddleware Not Last (❌)

```typescript
// WRONG
const handler = new Handler()
  .use(new ResponseWrapperMiddleware())    // position 0 — after runs LAST (wrong!)
  .use(new BodyValidationMiddleware())
  .use(new ErrorHandlerMiddleware())
  .handle(controller);

// CORRECT
const handler = new Handler()
  .use(new ErrorHandlerMiddleware())
  .use(new BodyValidationMiddleware())
  .use(new ResponseWrapperMiddleware())    // last — after runs FIRST (wraps immediately!)
  .handle(controller);
```

## Reference: Inter-Middleware Communication

```typescript
// Use context.businessData Map
class TimingMiddleware<TBody = unknown, TUser = unknown>
  implements BaseMiddleware<TBody, TUser>
{
  async before(context: Context<TBody, TUser>): Promise<void> {
    context.businessData.set('startTime', Date.now());
  }

  async after(context: Context<TBody, TUser>): Promise<void> {
    const startTime = context.businessData.get('startTime') as number;
    const elapsed = Date.now() - startTime;
    console.log(`[Timing] Request took ${elapsed}ms`);
  }
}
```

**Important:** Don't overwrite reserved keys:
- `'otel_span'` — Reserved by OpenTelemetryMiddleware for span tracking

## Reference: Response Sending Decision Tree

```
Handler execution complete
    │
    └─ Did handler return a value?
          │
          ├─ YES (returned object/data)      ← ✅ THE ONLY CORRECT PATTERN
          │  └─ context.responseData = { returned value }
          │     ResponseWrapperMiddleware.after() runs
          │     ✅ Response wrapped: { success: true, payload: ... }
          │
          └─ NO (returned nothing)
             └─ Risk: 204 No Content or incomplete response

NOTE: Never call context.res.json() from a handler.
      That path bypasses wrapping and logging.
      context.res is for framework internals only.
```

## Reference: RESPONSE_SENT Error

This error occurs when you try to send a response twice:

```typescript
// Prevention Checklist:
// 1. Only ONE middleware calls context.res.json() in after() — usually ResponseWrapperMiddleware
// 2. Handler either returns value OR calls context.res.json(), never both
// 3. Check context.res.headersSent before sending in custom after() hooks:

async after(context: Context): Promise<void> {
  if (!context.res.headersSent) {
    context.res.json({ custom: 'data' });  // Safe
  }
}
```
