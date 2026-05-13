---
name: noony-error-handling
description: Use when throwing errors, handling error types, mapping errors to HTTP status codes, wrapping external API errors, or implementing custom error classes in Noony handlers. Covers the full error class hierarchy, cause chaining, ErrorHandlerMiddleware lifecycle, and ServiceError for non-HTTP contexts.
---

# skill:noony-error-handling

## Does exactly this

Covers built-in error classes with HTTP status codes, cause chaining for wrapping errors, custom error types, and ErrorHandlerMiddleware lifecycle. ErrorHandlerMiddleware must be at position 1 in the canonical middleware order (see `noony-middleware-ordering`).

## When to use

- "Throw an error"
- "Handle different error types"
- "Map errors to HTTP status codes"
- "Wrap external API errors"
- "Custom error class"

## Do not use this skill when

- You need middleware ordering guidance -> `noony-middleware-ordering` is the canonical reference
- You need body validation schemas -> `noony-validation-schemas` for Zod integration
- You need custom middleware development -> `noony-middleware-development`

## Steps

1. Import typed error from `@noony-serverless/core` — never throw generic `Error()`
2. **Ensure ErrorHandlerMiddleware is at position 1** per `noony-middleware-ordering` — its `onError` fires last in reverse order, giving it final authority over error responses
3. Throw typed error in handler — `ErrorHandlerMiddleware` catches and formats the JSON response automatically
4. For external API errors, wrap with cause chaining to preserve the original stack trace:
   ```typescript
   throw new InternalServerError('API failed', originalError);
   ```
5. Never call `context.res.status().json()` for errors — always throw typed errors instead
6. For domain-specific errors, extend `HttpError` with a custom status code
7. Use `ServiceError` in service layers that shouldn't know about HTTP

## Rules

- Always throw typed errors (`NotFoundError`, `ForbiddenError`) — generic `Error()` becomes an opaque 500
- `ErrorHandlerMiddleware` must be **first** (position 1) in the middleware chain per `noony-middleware-ordering`
- Use cause chaining for wrapping: `new InternalServerError(message, causeError)` — preserves the original stack for logging while keeping the client response clean
- `ServiceError` for non-HTTP errors (business logic, internal services) — translate to `HttpError` subclass in the handler
- HTTP status codes are automatic based on error type — no manual status setting needed

## Anti-patterns

- `context.res.status(404).json()` — bypasses error formatting and logging
- `throw new Error('Not found')` — loses HTTP status code, becomes 500
- `catch (err) { /* ignore */ }` — silent failures hide bugs
- Wrapping errors without cause chaining — original error context lost for debugging
- `ErrorHandlerMiddleware` not at position 1 per `noony-middleware-ordering` — errors from earlier middlewares go uncaught

## Done when

- You know which error to throw for 400, 401, 403, 404, 409, 500
- You understand cause chaining pattern for wrapping external errors
- You can write custom error classes extending `HttpError`
- ErrorHandlerMiddleware is at position 1 per `noony-middleware-ordering`

---

## Reference: Error Class Hierarchy Table

| Error Class | HTTP Status | Use Case | Example |
|------------|-------------|----------|---------|
| **HttpError** | Custom | Base class for HTTP errors | Generic error with custom status |
| **ValidationError** | 400 | Input validation failures | Invalid request schema |
| **UnauthorizedError** | 401 | Missing/invalid authentication | JWT token missing or invalid |
| **SecurityError** | 403 | Security violations | Invalid CSRF token, rate limit |
| **ForbiddenError** | 403 | Insufficient permissions | User lacks required role |
| **NotFoundError** | 404 | Resource not found | User ID doesn't exist |
| **ConflictError** | 409 | Resource conflict/duplicate | Email already registered |
| **TimeoutError** | 408 | Request timeout | External API timeout |
| **TooLargeError** | 413 | Request too large | File upload exceeds limit |
| **InternalServerError** | 500 | Unexpected errors | Database connection failed |
| **BusinessError** | 200-599 | Business logic errors | Custom status codes |
| **ServiceError** | N/A | Service layer errors | Non-HTTP service failures |

## Reference: Basic Error Usage

```typescript
import {
  ValidationError, UnauthorizedError, ForbiddenError,
  NotFoundError, ConflictError, TimeoutError, TooLargeError,
  InternalServerError
} from '@noony-serverless/core';

throw new ValidationError('Email is required');           // 400
throw new UnauthorizedError('JWT token missing');         // 401
throw new ForbiddenError('You cannot delete this');       // 403

const user = await userService.getById(userId);
if (!user) throw new NotFoundError(`User ${userId} not found`); // 404

const existing = await userService.findByEmail(email);
if (existing) throw new ConflictError('Email already registered'); // 409

// Server error with cause chaining
try {
  await database.query(sql);
} catch (err) {
  throw new InternalServerError('Database query failed', err as Error);
}
```

## Reference: Error Response Format

`ErrorHandlerMiddleware` automatically formats all errors:

```json
{
  "success": false,
  "payload": {
    "error": "Request validation failed",
    "code": "MISSING_EMAIL"
  },
  "timestamp": "2025-03-10T12:00:00.000Z"
}
```

- `code` included only for client errors (4xx), not server errors
- `details` included only in development (`NODE_ENV=development` or `DEBUG=true`)

## Reference: Cause Chaining Pattern

```typescript
const handler = new Handler<CreateOrderRequest, AuthUser>()
  .use(new ErrorHandlerMiddleware())
  .handle(async (context) => {
    try {
      const inventory = await inventoryService.reserve(productId, quantity);
      return { success: true, reservationId: inventory.id };
    } catch (err) {
      throw new InternalServerError('Failed to reserve inventory', err as Error);
    }
  });
```

**Internal log** shows full chain. **Client response** is clean.

## Reference: Custom Error Classes

```typescript
export class PaymentError extends HttpError {
  constructor(
    message: string,
    readonly transactionId: string,
    readonly paymentMethod: string
  ) {
    super(message, 402);
    this.name = 'PaymentError';
  }
}

// Usage
throw new PaymentError('Payment declined', 'txn-12345', 'visa-****1234');
```

## Reference: ServiceError for Non-HTTP Contexts

```typescript
// Service layer — no HTTP awareness
import { ServiceError } from '@noony-serverless/core';

export class UserService {
  async validateEmail(email: string): Promise<void> {
    const exists = await this.findByEmail(email);
    if (exists) throw new ServiceError('Email already in use', 'DUPLICATE_EMAIL', { email });
  }
}

// Handler — translates ServiceError to HTTP error
.handle(async (context) => {
  try {
    await userService.validateEmail(email);
  } catch (err) {
    if (err instanceof ServiceError && err.code === 'DUPLICATE_EMAIL') {
      throw new ConflictError(err.message);
    }
    throw new InternalServerError(err.message, err as Error);
  }
});
```

## Reference: Testing Error Paths

```typescript
describe('getUserHandler', () => {
  it('should throw NotFoundError for missing user', async () => {
    const handler = new Handler<any, AuthUser>()
      .use(new ErrorHandlerMiddleware())
      .handle(async (context) => {
        const user = await mockUserService.getById('missing-id');
        if (!user) throw new NotFoundError('User not found');
        return user;
      });

    await expect(handler.executeGeneric(req, res)).rejects.toThrow(NotFoundError);
  });
});
```

## Reference: Anti-Patterns Quick Reference

| Don't | Do Instead | Why |
|-------|-----------|-----|
| `throw new Error('Not found')` | `throw new NotFoundError(msg)` | Generic errors become opaque 500s |
| `context.res.status(404).json()` | `throw new NotFoundError(msg)` | Bypasses logging and formatting |
| `catch (err) { /* ignore */ }` | `throw new InternalServerError(msg, err)` | Silent failures hide bugs |
| `new InternalServerError('Not found')` | `new NotFoundError('Not found')` | Wrong status misleads clients |
| ErrorHandler not first | Always `.use(new ErrorHandlerMiddleware())` first | Earlier errors go uncaught |
