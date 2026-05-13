---
name: noony-validation-schemas
description: Use when validating request bodies with Zod schemas, understanding parsedBody vs validatedBody, ordering BodyParserMiddleware before BodyValidationMiddleware, handling Pub/Sub message validation, defining async validation, or inferring TypeScript types from Zod schemas in Noony handlers.
---

# skill:noony-validation-schemas

## Does exactly this

Provides Zod integration patterns for Noony: schema definition with `z.infer`, the parsedBody-to-validatedBody pipeline, middleware ordering per `noony-middleware-ordering`, Pub/Sub message validation, and async validation with database lookups.

## When to use

- "Validate request body"
- "Use Zod schema"
- "parsedBody vs validatedBody"
- "Pub/Sub message validation"
- "Async validation with database lookup"
- "How to test validation"

## Do not use this skill when

- You need error class selection -> `noony-error-handling` for error types and cause chaining
- You need middleware ordering beyond validation -> `noony-middleware-ordering` is the canonical reference
- You need custom middleware development -> `noony-middleware-development`
- You need path parameter validation -> `noony-path-parameters` handles route params
- You need type inference guidance -> `noony-type-inference` for generics flow

## Steps

1. Define Zod schema and infer TypeScript type via `z.infer<typeof schema>` — never define a separate interface
2. **Verify middleware ordering per `noony-middleware-ordering`**: ErrorHandlerMiddleware (position 1) -> BodyParserMiddleware (position 6) -> BodyValidationMiddleware (position 7)
3. Pass the inferred type to Handler: `new Handler<CreateUserRequest, AuthUser>()` — using `unknown` makes `validatedBody` untyped
4. In handler, access validated data via `context.req.validatedBody!` (not `body` or `parsedBody`)
5. For Pub/Sub messages, validate the envelope first (base64 decode via transform), then validate the decoded content with a second schema
6. For async validation (database lookups), add `{ async: true }` option to `BodyValidationMiddleware`

## Rules

- Never access `context.req.body` directly — always use `validatedBody` after validation middleware
- Always use `z.infer<typeof schema>` for TypeScript types — single source of truth, no interface drift
- `BodyParserMiddleware` MUST come before `BodyValidationMiddleware` — positions 6 and 7 in the canonical order
- `ErrorHandlerMiddleware` MUST be present at position 1 — without it, `ValidationError` crashes the function instead of returning a clean 400
- Async validation requires `{ async: true }` option — without it, async refinements silently break
- Define schemas at module scope, not inside handlers — schema compilation happens once
- Place expensive `.refine()` checks last — cheap format checks fail first for better performance

## Anti-patterns

- Accessing `context.req.body` directly — unsafe, untyped, bypasses the validation pipeline
- Skipping `BodyParserMiddleware` — `parsedBody` will be undefined, validation has nothing to work with
- Forgetting `BodyParserMiddleware` before `BodyValidationMiddleware` — reversing them breaks the pipeline
- Defining TypeScript interface separately from Zod schema — duplicates type definition, can drift out of sync
- Validating inside the handler (`schema.safeParse(body)`) — defeats middleware pipeline benefits
- `Handler<unknown>` with validation — `validatedBody` stays typed as `unknown` even after validation

## Done when

- You can define Zod schemas and infer types with `z.infer`
- You understand the parsedBody -> validatedBody pipeline
- You know middleware ordering: ErrorHandler (1) -> BodyParser (6) -> BodyValidation (7)
- You can validate Pub/Sub messages (envelope + decoded content)
- You know when and how to use async validation

---

## Reference: Middleware Order

```typescript
const handler = new Handler<CreateUserRequest, AuthUser>()
  .use(new ErrorHandlerMiddleware())
  .use(new BodyParserMiddleware())           // 1. Parse raw body → context.req.parsedBody
  .use(new BodyValidationMiddleware(schema)) // 2. Validate → context.req.validatedBody
  .handle(async (context) => {
    const body = context.req.validatedBody!; // Type: CreateUserRequest
  });
```

## Reference: parsedBody vs validatedBody

```typescript
interface GenericRequest<T> {
  body: unknown;           // Raw request body (string/Buffer) — never use directly
  parsedBody: T;           // Parsed JSON (type: unknown at runtime)
  validatedBody?: T;       // Zod validated (type: T) — always use this
}
```

## Reference: Basic Object Schema

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(18, 'Must be 18 or older').max(120, 'Invalid age'),
  phone: z.string().optional(),
  role: z.enum(['user', 'admin']).default('user')
});

type CreateUserRequest = z.infer<typeof createUserSchema>;
```

## Reference: Schema Reuse

```typescript
export const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(18),
  role: z.enum(['user', 'admin']).default('user')
});

export const createUserSchema = userSchema;
export const updateUserSchema = userSchema.partial();
export const patchUserSchema = userSchema.pick({ name: true, email: true }).partial();
```

## Reference: Pub/Sub Message Validation

```typescript
const pubsubMessageSchema = z.object({
  message: z.object({
    data: z.string().transform((base64) => {
      const json = Buffer.from(base64, 'base64').toString('utf-8');
      return JSON.parse(json);
    }),
    attributes: z.record(z.string()),
    messageId: z.string(),
    publishTime: z.string()
  })
});

const handler = new Handler<any, void>()
  .use(new ErrorHandlerMiddleware())
  .use(new BodyParserMiddleware())
  .use(new BodyValidationMiddleware(pubsubMessageSchema))
  .handle(async (context) => {
    const decodedData = context.req.validatedBody.message.data;
    const orderEvent = orderEventSchema.parse(decodedData);
    await eventService.handle(orderEvent);
  });
```

## Reference: Async Validation

```typescript
const registerUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3)
}).refine(
  async (data) => {
    const exists = await userService.findByEmail(data.email);
    return !exists;
  },
  { message: 'Email already registered', path: ['email'] }
);

const handler = new Handler<any, AuthUser>()
  .use(new ErrorHandlerMiddleware())
  .use(new BodyParserMiddleware())
  .use(new BodyValidationMiddleware(registerUserSchema, { async: true }))
  .handle(async (context) => {
    const { email, username } = context.req.validatedBody!;
  });
```

## Reference: Error Response Format

When `ErrorHandlerMiddleware` is present, validation failures return structured 400:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "path": ["name"], "message": "String must contain at least 1 character(s)" },
      { "path": ["email"], "message": "Invalid email" }
    ]
  }
}
```
