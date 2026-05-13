---
name: noony-middleware-development
description: Use when creating custom middleware, adding cross-cutting concerns, intercepting requests or responses, implementing before/after/onError lifecycle hooks, passing data between middlewares via businessData, or accessing DI services inside middleware. PREREQUISITE — read `noony-middleware-ordering` first for where to place your middleware, then come here for how to build it.
---

# skill:noony-middleware-development

## Does exactly this

Provides 5 patterns for building type-safe middleware: class-based, factory functions, DI-aware, conditional logic, and inter-middleware communication via `context.businessData`. All with proper `<TBody, TUser>` generics. This skill is the BRIDGE between the pipeline order (`noony-middleware-ordering`) and your custom logic.

## When to use

- "Create custom middleware"
- "Add cross-cutting concerns" (logging, timing, caching, auditing)
- "Intercept requests/responses"
- "Implement before/after/onError logic"
- "Pass data between middlewares"
- "Access DI services in middleware"

## Do not use this skill when

- You need middleware ordering guidance -> `noony-middleware-ordering` is the authority on positioning
- You need body validation schemas -> `noony-validation-schemas` for Zod integration
- You need error class selection -> `noony-error-handling` for error types and cause chaining
- You need type inference guidance -> `noony-type-inference` for generics flow
- For built-in middleware configuration -> see individual middleware skills

## Steps

1. **Read `noony-middleware-ordering` first** to determine where your middleware belongs in the canonical order
2. Define middleware class implementing `BaseMiddleware<TBody, TUser>` — both generics required to preserve the type chain
3. Implement lifecycle hooks as needed:
   - `before(context)` — preprocessing, runs top-to-bottom in registration order
   - `after(context)` — postprocessing, runs bottom-to-top (reverse order)
   - `onError(context, error)` — error handling, runs bottom-to-top (reverse order)
   - All hooks are optional — implement only what you need
4. Use `context.businessData` Map for inter-middleware communication — never extend Context interface
5. Access injected services via `getService(context, ServiceClass)` helper
6. Use factory functions for simpler, stateless middleware that needs configuration parameters
7. **Register your middleware in the canonical order from `noony-middleware-ordering`**

## Rules

- MANDATORY: `implements BaseMiddleware<TBody, TUser>` with both generics — omitting them silently breaks type inference
- Default generic values: `<TBody = unknown, TUser = unknown>` — allows optional type specification at usage site
- Inter-middleware data ONLY via `context.businessData.set(key, value)` — never modify Context properties directly
- Use descriptive, namespaced businessData keys to avoid collisions — `'otel_span'` is reserved by `OpenTelemetryMiddleware`
- All lifecycle methods are optional — implement only what you need
- Middleware must not have side effects on framework state

## Anti-patterns

- Writing middleware without reading `noony-middleware-ordering` first — ordering determines when your hooks run
- `BaseMiddleware` without generics — breaks type chain silently; `context.req.validatedBody` and `context.user` become `unknown`
- Extending Context interface (`interface CustomContext extends Context`) — not portable, breaks framework compatibility
- Returning data from `before()` — return value is ignored by the framework, use `businessData` instead
- Mutating `context.user` or `context.req.body` directly — these are read-only; use `businessData` for custom data
- Duplicate `businessData` keys across middlewares — second write silently overwrites first
- Heavy logic in `onError` without guard clauses — `onError` fires for every error type, check error class before acting

## Done when

- You have read `noony-middleware-ordering` and know where your middleware sits in the canonical order
- You can write class-based middleware with proper `<TBody, TUser>` generics
- You understand lifecycle hook execution order (before: top-down, after/onError: bottom-up)
- You can pass data between middlewares via `businessData`
- You know how to access DI services in middleware via `getService()`
- You can test middleware in isolation using `createContext()`

---

## Reference: Pattern 1 — Class-Based Middleware

```typescript
import { BaseMiddleware, Context } from '@noony-serverless/core';

export class TimingMiddleware<TBody = unknown, TUser = unknown>
  implements BaseMiddleware<TBody, TUser>
{
  async before(context: Context<TBody, TUser>): Promise<void> {
    context.businessData.set('startTime', Date.now());
  }

  async after(context: Context<TBody, TUser>): Promise<void> {
    const startTime = context.businessData.get('startTime') as number;
    const elapsed = Date.now() - startTime;
    console.log(`[Timing] Request completed in ${elapsed}ms`);
  }

  async onError(context: Context<TBody, TUser>, error: unknown): Promise<void> {
    const startTime = context.businessData.get('startTime') as number;
    const elapsed = Date.now() - startTime;
    console.error(`[Timing] Request failed after ${elapsed}ms`, error);
  }
}

// Usage
const handler = new Handler<RequestType, UserType>()
  .use(new TimingMiddleware<RequestType, UserType>())
  .handle(controller);
```

## Reference: Pattern 2 — Factory Function Middleware

```typescript
export const loggingMiddleware = <TBody = unknown, TUser = unknown>(
  logLevel: 'debug' | 'info' | 'error' = 'info'
): BaseMiddleware<TBody, TUser> => ({
  async before(context: Context<TBody, TUser>): Promise<void> {
    console.log(`[${logLevel}] Request started: ${context.req.method} ${context.req.path}`);
  },

  async after(context: Context<TBody, TUser>): Promise<void> {
    console.log(`[${logLevel}] Request completed: ${context.res.statusCode}`);
  },

  async onError(context: Context<TBody, TUser>, error: unknown): Promise<void> {
    console.error(`[error] Request failed:`, error);
  }
});

// Usage with configuration
const handler = new Handler<RequestType, UserType>()
  .use(loggingMiddleware('info'))
  .handle(controller);
```

## Reference: Pattern 3 — DI-Aware Middleware

```typescript
import { BaseMiddleware, Context, getService } from '@noony-serverless/core';

class AuditMiddleware<TBody = unknown, TUser = unknown>
  implements BaseMiddleware<TBody, TUser>
{
  async after(context: Context<TBody, TUser>): Promise<void> {
    // Access injected service
    const auditService = getService(context, AuditService);

    await auditService.log({
      userId: context.user?.id,
      action: `${context.req.method} ${context.req.path}`,
      status: context.res.statusCode,
      timestamp: new Date()
    });
  }
}
```

## Reference: Pattern 4 — Conditional Middleware

```typescript
export class ConditionalCachingMiddleware<TBody = unknown, TUser = unknown>
  implements BaseMiddleware<TBody, TUser>
{
  constructor(private cacheConfig: { enabled: boolean; ttl: number }) {}

  async before(context: Context<TBody, TUser>): Promise<void> {
    if (!this.cacheConfig.enabled) return;
    if (context.req.method !== 'GET') return;

    const cacheKey = `${context.req.path}`;
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      context.businessData.set('cachedResponse', cached);
    }
  }

  async after(context: Context<TBody, TUser>): Promise<void> {
    if (!this.cacheConfig.enabled) return;
    if (context.req.method !== 'GET') return;

    const cachedResponse = context.businessData.get('cachedResponse');
    if (cachedResponse) {
      context.responseData = cachedResponse;
      return;
    }

    if (context.responseData) {
      const cacheKey = `${context.req.path}`;
      await cacheService.set(cacheKey, context.responseData, this.cacheConfig.ttl);
    }
  }
}
```

## Reference: Pattern 5 — Inter-Middleware Communication via businessData

```typescript
// Middleware 1: Extract and store user info
class UserExtractionMiddleware<TBody = unknown, TUser = unknown>
  implements BaseMiddleware<TBody, TUser>
{
  async before(context: Context<TBody, TUser>): Promise<void> {
    const token = context.req.headers['authorization']?.replace('Bearer ', '');
    if (token) {
      const user = await tokenService.verify(token);
      context.businessData.set('extractedUser', user);
    }
  }
}

// Middleware 2: Use data from Middleware 1
class PermissionCheckMiddleware<TBody = unknown, TUser = unknown>
  implements BaseMiddleware<TBody, TUser>
{
  async before(context: Context<TBody, TUser>): Promise<void> {
    const user = context.businessData.get('extractedUser');
    if (!user) {
      throw new UnauthorizedError('No user found');
    }

    if (!user.permissions.includes('write')) {
      throw new ForbiddenError('Write permission required');
    }
  }
}
```

## Reference: Anti-Patterns

### ❌ Middleware Without Generics

```typescript
// WRONG - Breaks type chain
export class MyMiddleware implements BaseMiddleware {
  async before(context: Context): Promise<void> {
    // Lost TBody and TUser types!
  }
}

// CORRECT
export class MyMiddleware<TBody = unknown, TUser = unknown>
  implements BaseMiddleware<TBody, TUser>
{
  async before(context: Context<TBody, TUser>): Promise<void> {
    // Full type safety preserved
  }
}
```

### ❌ Extending Context Interface

```typescript
// WRONG
interface CustomContext extends Context { customData: string; }

// CORRECT - Use businessData Map
async before(context: Context<TBody, TUser>): Promise<void> {
  context.businessData.set('customData', 'test');  // Standard approach
}
```
