---
name: noony-dependency-injection
description: Use when resolving services with getService(), managing ContainerPool scopes (global vs local), configuring DependencyInjectionMiddleware, understanding the hybrid proxy container memory model, or accessing type-safe services in Noony controllers. Covers service RESOLUTION, not initialization.
---

# skill:noony-dependency-injection

## Does exactly this

Service RESOLUTION — ContainerPool, `getService()`, global vs local scopes, and the hybrid proxy container memory model. This skill covers how to access and use services after they have been initialized.

## When to use

- "Resolve a service in a controller"
- "getService() for type-safe access"
- "Global vs local scope"
- "ContainerPool API"
- "DependencyInjectionMiddleware setup"
- "Proxy container memory model"

## Do not use this skill when

- For service INITIALIZATION (one-time setup, singleton guard) → use `noony-dependency-initialization`
- For cold start optimization and performance tuning → use `noony-performance-optimization`
- For DI inside custom middleware development → use `noony-middleware-development`
- For testing with mocked services → use `noony-testing-handlers`

## Steps

The DI flow: `noony-dependency-initialization` (init) → `noony-dependency-injection` (resolve) → `noony-middleware-development` (use in middleware).

1. First, initialize services with `noony-dependency-initialization`'s singleton guard pattern — services must exist before resolution

2. Add `DependencyInjectionMiddleware` to the handler for request-scoped services
   - Use `scope: 'local'` (default) for request-specific data like trace IDs, user context
   - Use `scope: 'global'` only at startup for process-lifetime services

3. Resolve services with `getService(context, ServiceClass)` in controllers — never access the container directly

4. Understand the proxy container: local writes shadow global reads without mutation
   - Global services are shared across all requests (zero-copy)
   - Local services are isolated per request (cloned on write)

5. For testing, inject mocks via `DependencyInjectionMiddleware` with `scope: 'local'`

## Rules

- `containerPool.initializeGlobal()` called ONCE at startup — never per-request
- Global scope for expensive services (DB connections, HTTP clients, external APIs)
- Local scope for request-specific data (trace IDs, user context, request IDs)
- Always use `getService(context, ServiceClass)` for type-safe resolution
- Never call TypeDI `Container.get()` directly — bypasses framework scoping
- Proxy container: local writes shadow global reads without mutating global state
- Global services must be immutable after initialization — no mutation during requests

## Anti-patterns

- ❌ `containerPool.initializeGlobal()` inside handler — reconnects DB every request (~300-500ms penalty)
- ❌ `Container.get(Service)` or `Container.set()` — bypasses framework DI, misses proxy scoping
- ❌ Mutating global services during requests — race conditions with concurrent requests
- ❌ `new ServiceClass()` per request inside handler — defeats DI benefits entirely
- ❌ String-based service IDs without class references — loses type safety from `getService()`
- ❌ Request-specific data in global scope — state leaks between requests

## Done when

- Global services initialized once at startup via `noony-dependency-initialization`, resolved via `getService()`
- Request-scoped data injected via `DependencyInjectionMiddleware`
- All service access uses `getService(context, ServiceClass)`
- You understand proxy container prevents global mutation

---

## Reference: ContainerPool API

```typescript
import { containerPool } from '@noony-serverless/core';

// Initialize global services once at startup
containerPool.initializeGlobal([
  { id: 'Database', value: new DatabaseService() },
  { id: 'Logger', value: new LoggerService() },
  { id: 'Config', value: new ConfigService() }
]);

// Check if initialized
if (containerPool.isInitialized()) {
  console.log('Global services ready');
}

// Create lightweight proxy for each request
const proxyContainer = containerPool.createProxyContainer();

// Reset all (testing only)
containerPool.reset();
```

## Reference: Global Scope Services

```typescript
// Startup (once per process)
async function initializeDependencies(): Promise<void> {
  const database = new DatabaseService();
  await database.connect();

  containerPool.initializeGlobal([
    { id: 'Database', value: database },
    { id: 'Logger', value: new LoggerService() },
    { id: 'EmailService', value: new EmailService() }
  ]);
}

// Per-request (thousands of times)
const createUserHandler = new Handler<CreateUserRequest, AuthUser>()
  .use(new DependencyInjectionMiddleware())
  .handle(async (context) => {
    // Read global database connection (zero copy)
    const database = getService(context, DatabaseService);
    const user = await database.users.create(context.req.validatedBody!);
    return { userId: user.id };
  });
```

## Reference: Local Scope Services

```typescript
const handler = new Handler<CreateUserRequest, AuthUser>()
  .use(new ErrorHandlerMiddleware())
  .use(new DependencyInjectionMiddleware([
    { id: 'RequestId', value: generateRequestId() },
    { id: 'TraceContext', value: extractTraceContext(req) },
    { id: 'StartTime', value: Date.now() }
  ]))
  .use(new AuthenticationMiddleware(tokenVerifier))
  .handle(async (context) => {
    const requestId = getService(context, 'RequestId');
    const startTime = getService(context, 'StartTime');
    console.log(`[${requestId}] Processing request`);
  });
```

## Reference: getService() Helper

```typescript
// Type-safe - no casting needed
const handler = new Handler<CreateUserRequest, AuthUser>()
  .handle(async (context: Context<CreateUserRequest, AuthUser>) => {
    const userService = getService(context, UserService);
    const user = await userService.create(context.req.validatedBody!);
    return { userId: user.id };
  });
```

## Reference: Hybrid Proxy Container Pattern

```
Traditional Container Pooling (Per-Request Clone):
  Global Services: 1KB
  + Request 1 clone: 15KB
  + Request 2 clone: 15KB
  Total: 31KB for 2 requests

Hybrid Proxy Container (WeakMap + Proxy):
  Global Services: 1KB
  + Proxy 1 overhead: ~2KB
  + Proxy 2 overhead: ~2KB
  Total: ~5KB for 2 requests (~85% savings)
```

## Reference: Testing with DI Mocking

```typescript
describe('UserHandler', () => {
  it('should create user with mock service', async () => {
    const mockUserService = {
      create: jest.fn().mockResolvedValue({ id: 'user-123', email: 'test@example.com' })
    };

    const handler = new Handler<CreateUserRequest, AuthUser>()
      .use(new DependencyInjectionMiddleware([
        { id: 'UserService', value: mockUserService }
      ]))
      .handle(async (context) => {
        const userService = getService(context, 'UserService');
        return await userService.create({ email: 'test@example.com', name: 'Test' });
      });

    const context = createMockContext();
    const result = await handler.executeGeneric(context.req, context.res);

    expect(mockUserService.create).toHaveBeenCalled();
  });
});
```
