---
name: noony-testing-handlers
description: Use when writing tests for Noony handlers, creating mock request/response objects, testing middleware in isolation, mocking services with DI, testing error paths, testing validation schemas, testing guard authorization, using executeGeneric() in tests, or verifying response wrapping behavior.
---

# skill:noony-testing-handlers

## Does exactly this

Complete testing patterns for Noony handlers: full handler chain testing, middleware in isolation, service mocking via DI, error path testing, validation testing, and guard authorization testing. All use `executeGeneric()` with mock request/response factories.

## When to use

- "Write unit tests for a handler"
- "Create mock request/response objects"
- "Test middleware in isolation"
- "Mock services via DI"
- "Test error paths and HTTP status mapping"
- "Test validation schemas"
- "Test guard authorization"

## Do not use this skill when

- For setting up the things you are testing — use the relevant skill first:
  - Validation schemas → `noony-validation-schemas`
  - Error handling → `noony-error-handling`
  - DI container setup → `noony-dependency-injection`
  - Guard authorization → `noony-guard-system`
  - Middleware ordering → `noony-middleware-ordering`

## Steps

1. Create mock request/response factories satisfying `GenericRequest<T>` and `GenericResponse` interfaces
   - `res.status()` must return `this` for chaining

2. Build handler with middlewares in canonical order and call `handler.executeGeneric(mockReq, mockRes)`
   - NOT `handler.execute()` which expects Cloud Functions native objects

3. For service mocking, use `DependencyInjectionMiddleware` with `scope: 'local'` to inject mocks
   - Never use TypeDI `Container.set()` or `Container.reset()` — use framework DI

4. For middleware isolation, use `createContext(mockReq, mockRes, user)` and call hooks directly

5. Test validation errors — send invalid body and assert `ValidationError` returns 400 with structured error response
   - Always set `parsedBody` on mock request when testing body validation

6. Test guard authorization — create mock users with specific permission arrays
   - Assert 403 Forbidden when permissions are missing
   - Assert success when permissions are present

7. Assert on wrapped response format when using `ResponseWrapperMiddleware`: `data.success`, `data.payload`, `data.timestamp`

## Rules

- Always use `handler.executeGeneric(mockReq, mockRes)` in tests — never `execute()`
- Mock objects MUST satisfy `GenericRequest<T>` and `GenericResponse` interfaces completely
- Always set `parsedBody` on mock request when testing handlers with body validation
- Inject mocked services via `DependencyInjectionMiddleware` with `scope: 'local'` — never TypeDI `Container`
- Assert on wrapped format (`data.success`, `data.payload`) when `ResponseWrapperMiddleware` is in the chain
- Use `createContext(mockReq, mockRes, user)` for middleware isolation testing
- Include `ErrorHandlerMiddleware` in test handlers — without it, error responses will not match production behavior

## Anti-patterns

- ❌ `handler.execute(mockReq, mockRes)` — wrong API for unit tests, expects Cloud Functions objects
- ❌ `Container.reset()` or `Container.set()` in tests — pollutes global TypeDI, does not use framework DI
- ❌ Missing `parsedBody` on mock request — `BodyValidationMiddleware` has nothing to validate
- ❌ Plain objects without full `GenericRequest`/`GenericResponse` shape — causes runtime errors
- ❌ Asserting `data.name` when `ResponseWrapperMiddleware` wraps it to `data.payload.name`
- ❌ Testing without `ErrorHandlerMiddleware` — error responses will not match production
- ❌ Testing guards without setting `context.user` — guards always fail without authentication context

## Done when

- Full handler chain test passes with mock request/response
- Service mocks injected via `DependencyInjectionMiddleware`
- Validation error paths tested with correct 400 status codes
- Guard authorization tested with 403 for missing permissions
- Error paths tested with correct HTTP status codes
- Response wrapping assertions account for standard envelope

---

## Reference: Mock Factories

```typescript
function createMockRequest<T>(overrides: Partial<any> = {}): any {
  return {
    method: 'POST',
    url: '/api/test',
    path: '/api/test',
    headers: {},
    query: {},
    params: {},
    body: undefined,
    parsedBody: undefined,
    ...overrides
  };
}

function createMockResponse(): any {
  let statusCode = 200;
  let responseData: any = null;

  return {
    statusCode,
    headersSent: false,
    status: function(code: number) {
      statusCode = code;
      this.statusCode = code;
      return this;
    },
    json: function(data: any) {
      responseData = data;
      this.headersSent = true;
      return this;
    },
    send: function(data: any) {
      responseData = data;
      this.headersSent = true;
      return this;
    },
    header: function(name: string, value: string) { return this; },
    end: function() { this.headersSent = true; },
    getData: () => responseData,
    getStatus: () => statusCode
  };
}
```

## Reference: Pattern 1 — Full Handler Chain Testing

```typescript
describe('UserHandler - Full Chain', () => {
  it('should create user successfully with valid data', async () => {
    const mockReq = createMockRequest<CreateUserRequest>({
      body: { name: 'Alice', email: 'alice@example.com' },
      parsedBody: { name: 'Alice', email: 'alice@example.com' }
    });

    const mockRes = createMockResponse();

    // Execute via executeGeneric (not execute!)
    await handler.executeGeneric(mockReq, mockRes);

    expect(mockRes.getStatus()).toBe(200);
    const data = mockRes.getData();
    expect(data.success).toBe(true);
    expect(data.payload.data.id).toBe('123');
  });

  it('should return 400 for invalid email', async () => {
    const mockReq = createMockRequest<CreateUserRequest>({
      body: { name: 'Bob', email: 'not-an-email' },
      parsedBody: { name: 'Bob', email: 'not-an-email' }
    });

    const mockRes = createMockResponse();
    await handler.executeGeneric(mockReq, mockRes);

    expect(mockRes.getStatus()).toBe(400);
    const data = mockRes.getData();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
```

## Reference: Pattern 2 — Middleware in Isolation

```typescript
describe('TimingMiddleware', () => {
  it('should set start time in businessData', async () => {
    const middleware = new TimingMiddleware();

    const mockReq = createMockRequest();
    const mockRes = createMockResponse();
    const context = createContext(mockReq, mockRes, {});

    // Call before() directly
    await middleware.before(context);

    expect(context.businessData.get('startTime')).toBeDefined();
    expect(typeof context.businessData.get('startTime')).toBe('number');
  });
});
```

## Reference: Pattern 3 — Testing with DI Service Mocking

```typescript
describe('Handler with Dependency Injection', () => {
  it('should resolve mocked service from container', async () => {
    const mockUserService = {
      getUser: jest.fn().mockResolvedValue({ id: '123', name: 'Alice' })
    };

    const handler = new Handler<void, void>()
      .use(new ErrorHandlerMiddleware())
      .use(new DependencyInjectionMiddleware(
        [{ id: UserService, value: mockUserService }],
        { scope: 'local' }
      ))
      .handle(async (context) => {
        const userService = getService(context, UserService);  // Type-safe
        const user = await userService.getUser('123');
        return { data: user };
      });

    const mockReq = createMockRequest();
    const mockRes = createMockResponse();

    await handler.executeGeneric(mockReq, mockRes);

    expect(mockUserService.getUser).toHaveBeenCalledWith('123');
  });
});
```

## Reference: Pattern 4 — Testing Error Handling

```typescript
describe('Error Handling', () => {
  it('should catch and format NotFoundError as 404', async () => {
    const handler = new Handler<void, void>()
      .use(new ErrorHandlerMiddleware())
      .handle(async (context) => {
        throw new NotFoundError('User not found');
      });

    const mockReq = createMockRequest();
    const mockRes = createMockResponse();

    await handler.executeGeneric(mockReq, mockRes);

    expect(mockRes.getStatus()).toBe(404);
    const data = mockRes.getData();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NOT_FOUND');
  });

  it('should catch unexpected errors as 500', async () => {
    const handler = new Handler<void, void>()
      .use(new ErrorHandlerMiddleware())
      .handle(async (context) => {
        throw new Error('Something broke');
      });

    const mockReq = createMockRequest();
    const mockRes = createMockResponse();

    await handler.executeGeneric(mockReq, mockRes);

    expect(mockRes.getStatus()).toBe(500);
  });
});
```

## Reference: Anti-Patterns

### ❌ Using execute() Instead of executeGeneric()

```typescript
// WRONG - execute() is for GCP Cloud Functions production
await handler.execute(req, res);  // ❌

// CORRECT
await handler.executeGeneric(mockReq, mockRes);  // ✅
```

### ❌ Missing parsedBody

```typescript
// WRONG - BodyValidationMiddleware has nothing to validate
const mockReq = createMockRequest({ body: { name: 'Alice' } });
// Missing parsedBody!

// CORRECT
const mockReq = createMockRequest({
  body: { name: 'Alice' },
  parsedBody: { name: 'Alice' }  // BodyParserMiddleware sets this
});
```

### ❌ Wrong Response Assertion

```typescript
// WRONG - ResponseWrapperMiddleware wraps the data
const data = mockRes.getData();
expect(data.name).toBe('Alice');  // Fails!

// CORRECT
expect(data.success).toBe(true);
expect(data.payload.name).toBe('Alice');  // Wrapped structure
```
