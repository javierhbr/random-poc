---
name: noony-performance-optimization
description: Use when optimizing cold starts, tuning memory usage in serverless environments, choosing between lazy and eager initialization strategies, configuring containerPool for zero-copy DI, managing connection pooling, or reviewing a Noony application for broader performance issues beyond basic initialization.
---

# skill:noony-performance-optimization

## Does exactly this

Broader performance optimization — cold start strategies, memory management, lazy vs eager initialization, containerPool tuning, and connection pooling. For the initialization guard pattern itself, see `noony-dependency-initialization`. This skill covers the BROADER performance picture.

## When to use

- "Optimize cold start latency"
- "Lazy vs eager initialization strategy"
- "Memory usage in serverless"
- "ContainerPool tuning for zero-copy DI"
- "Connection pooling best practices"
- "Review application for performance issues"

## Do not use this skill when

- For JUST the initialization guard pattern → use `noony-dependency-initialization` (focused, faster)
- For DI container API and service resolution → use `noony-dependency-injection`
- For testing performance-related code → use `noony-testing-handlers`
- For middleware ordering (cheap-before-expensive) → use `noony-middleware-ordering`

## Steps

`noony-performance-optimization` = `noony-dependency-initialization` (init guard) + `noony-dependency-injection` (DI resolution) + performance-specific patterns.

1. **Apply `noony-dependency-initialization`'s initialization guard** — the foundation of cold start optimization
   - The three-condition guard ensures one-time initialization under concurrency

2. **Choose lazy vs eager initialization** based on your deployment target
   - **Lazy** (Cloud Functions): init on first request, good for low-traffic functions
   - **Eager** (Fastify/Cloud Run): init at startup before accepting traffic, good for production
   - Eager eliminates cold start for the first user request but increases deployment time

3. **Configure containerPool with `noony-dependency-injection`** for zero-copy DI
   - Global services shared via proxy — no per-request cloning (~99% memory savings)
   - Local services isolated per request — safe to mutate
   - Avoid large objects in local scope — they are cloned per request

4. **Optimize middleware ordering** — place cheap checks before expensive ones
   - Auth token validation (fast) before database lookups (slow)
   - Body validation before service calls — reject invalid requests early
   - See `noony-middleware-ordering` for the canonical order

5. **Tune connection pooling** for database and HTTP clients
   - Set pool size based on expected concurrency (Cloud Functions: 1-5, Cloud Run: 10-80)
   - Use keep-alive for HTTP clients to reuse TCP connections

6. **Add graceful shutdown** to clean up resources on SIGTERM/SIGINT
   - Drain active requests, close DB pools, release connections

## Rules

- Three-condition guard REQUIRED for initialization — see `noony-dependency-initialization` for the pattern
- `containerPool.initializeGlobal()` called ONCE — never per-request
- Global services must be immutable — initialized once, never mutated during requests
- Use eager init for production (Cloud Run, long-running servers); lazy for low-traffic Cloud Functions
- Never call `initializeDependencies()` inside a handler function — adds ~500ms per request
- Proxy container provides zero-copy reads of global services — leverage this for memory efficiency
- Place cheap middleware before expensive middleware — reject bad requests early

## Anti-patterns

- ❌ `initializeDependencies()` inside handler body — 300-500ms latency on EVERY request
- ❌ `new DatabaseService()` per request — socket allocation + SSL handshake each time
- ❌ Missing Condition 2 in init guard — concurrent cold-start requests each open separate DB connections
- ❌ Large objects in local scope — cloned per request, wastes memory
- ❌ Mutating global services during request processing — race conditions with concurrent requests
- ❌ Skipping graceful shutdown — DB connections leak on process restart
- ❌ No connection pool limits — unbounded connections exhaust database capacity

## Done when

- Initialization uses `noony-dependency-initialization`'s three-condition guard
- Lazy vs eager strategy chosen for your deployment target
- ContainerPool configured with appropriate global/local scoping (`noony-dependency-injection`)
- Middleware ordered cheap-before-expensive (`noony-middleware-ordering`)
- Connection pools sized for your concurrency model
- Graceful shutdown cleans up connections

---

## Reference: Performance Benchmark

| Scenario | Cold Start | First Request | Subsequent | Total Time 1000 req |
|----------|-----------|----------------|-----------|-------------------|
| Lazy Init (Cloud Fn) | ~100ms | ~400ms | ~30ms | 30,100ms |
| Eager Init (Fastify) | ~600ms | ~50ms | ~50ms | 50,600ms |
| No Init (no DB) | ~50ms | ~10ms | ~10ms | 10,050ms |

**Eager init recommended for production** (warm start servers like Cloud Run, App Engine).

## Reference: ❌ Anti-Pattern — Initializing Inside Handler

```typescript
// WRONG - ~500ms latency per request!
export const createUser = http('createUser', async (req, res) => {
  const db = await databaseService.connect();  // Each request waits!
  const userRepository = new UserRepository(db);
  const user = await userRepository.create(req.body);
  res.json({ data: user });
});
```

## Reference: ✅ Correct Pattern

```typescript
// Startup — initialize in Fastify onReady or before handlers execute
server.addHook('onReady', async () => {
  await initializeDependencies(); // connects DB, registers services
});

// Noony handler reuses same connection via DI
export const createUserHandler = new Handler<CreateUserBody>()
  .use(new ErrorHandlerMiddleware())
  .use(new BodyValidationMiddleware(createUserSchema))
  .use(new DependencyInjectionMiddleware())
  .use(new ResponseWrapperMiddleware())
  .handle(async (context) => {
    const userRepository = getService(UserRepository, context.container);
    const user = await userRepository.create(context.req.validatedBody!);
    return user; // never res.json() — always return
  });
```

## Reference: Performance Checklist

- [ ] Database connection initialized once at startup using singleton guard
- [ ] HTTP clients (axios, fetch) initialized once and reused
- [ ] Cache services initialized once and reused
- [ ] No `await initializeDependencies()` inside handler function
- [ ] Concurrent initialization requests wait for first one (check `initializationPromise`)
- [ ] Container state reset on failure so retry is possible
- [ ] External API clients configured with connection pooling enabled
- [ ] No service mutations during request processing
- [ ] Global services marked `const` to prevent reassignment
