---
name: noony-type-inference
description: Activate when reducing type boilerplate, avoiding repeated generics, inferring types from controller signatures, using createTypedHandler(), choosing between explicit generics and type inference, or fixing broken type chains in middleware.
---

# skill:noony-type-inference

## Does exactly this

Guides you through the two approaches to typed handlers in Noony: explicit generics (`new Handler<TBody, TUser>()`) and automatic inference via `createTypedHandler()`. Both provide full compile-time type safety — choose based on verbosity preference. Type chain preservation is most critical when writing custom middleware (`noony-middleware-development` skill).

## When to use

- Creating a new handler and choosing a typing approach
- Reducing generic boilerplate on middlewares
- Fixing type errors where `validatedBody` or `user` is `unknown`
- Writing custom middleware that preserves the type chain
- Sharing types across multiple handlers

## Do not use this skill when

- You need Zod schema types -> see `noony-validation-schemas` skill, it handles those automatically via `z.infer`
- You need to create a custom middleware -> see `noony-middleware-development` skill for implementation patterns
- You need DI or container services -> see `noony-dependency-initialization` skill
- You need middleware ordering -> see `noony-middleware-ordering` skill

## Steps

1. **Define request schema and user type** — required for both approaches
   - Use `z.infer<typeof schema>` for body types derived from Zod
   - Define a `TUser` interface for authenticated user shape

2. **Choose your approach** based on team preference:
   - **Explicit generics:** `new Handler<TBody, TUser>()` with generics on every middleware
   - **Type inference:** `createTypedHandler(controller)` with typed controller signature

3. **For explicit generics**, pass `<TBody, TUser>` to Handler and every middleware
   - Every `.use(new Middleware<TBody, TUser>())` must include both generics
   - Controller parameter must be `Context<TBody, TUser>`

4. **For type inference**, annotate the controller with `Context<TBody, TUser>` explicitly
   - `createTypedHandler()` infers types from the controller signature
   - Middlewares do not need explicit generics — they are inferred
   - Controller must have an explicit type annotation (not implicit `any`)

5. **Preserve the type chain in custom middleware** — this is where type inference most commonly breaks
   - Always implement `BaseMiddleware<TBody, TUser>` with both generic parameters
   - Use default values `= unknown` on generics for flexibility
   - Missing generics on middleware breaks the chain — `validatedBody` becomes `unknown`

## Rules

- Both approaches provide **full compile-time type safety** — neither is "less safe"
- Never use `as any` to bypass type errors — use proper type declarations
- All middlewares **must** implement `BaseMiddleware<TBody, TUser>` with both generics
- Pick one approach per handler — do not mix explicit and inferred in the same chain
- Controller **must** have explicit `Context<TBody, TUser>` annotation when using `createTypedHandler()`
- Use `= unknown` defaults on custom middleware generics for flexible usage

## Anti-patterns

- `as any` cast to bypass type errors — defeats the entire type system
- Mixing explicit generics on Handler with implicit middlewares — unclear which is authoritative
- Using `createTypedHandler()` with untyped controller — inference fails, types degrade to `unknown`
- Middleware without generics (`BaseMiddleware` instead of `BaseMiddleware<TBody, TUser>`) — breaks type chain
- Using `Handler<unknown>` with body validation — `validatedBody` stays `unknown` instead of the schema type
- `Handler<any, any>` cast to a typed handler — bypasses all checking

## Done when

- Handler uses one consistent approach (explicit or inferred) throughout
- `context.req.validatedBody` resolves to `TBody` (not `unknown` or `any`)
- `context.user` resolves to `TUser` (not `unknown` or `any`)
- Custom middlewares implement `BaseMiddleware<TBody, TUser>` with both generics
- No `as any` casts anywhere in the handler chain

---

## Reference: Option 1 — Explicit Generics

```typescript
import { Handler, Context } from '@noony-serverless/core';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(18).max(120),
  role: z.enum(['user', 'admin']).default('user')
});

type CreateUserRequest = z.infer<typeof createUserSchema>;

interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

// Specify generics explicitly on Handler
const createUserHandler = new Handler<CreateUserRequest, AuthenticatedUser>()
  .use(new ErrorHandlerMiddleware<CreateUserRequest, AuthenticatedUser>())
  .use(new BodyValidationMiddleware<CreateUserRequest, AuthenticatedUser>(createUserSchema))
  .use(new ResponseWrapperMiddleware<CreateUserRequest, AuthenticatedUser>())
  .handle(async (context: Context<CreateUserRequest, AuthenticatedUser>) => {
    const { name, email, age } = context.req.validatedBody!;
    const currentUser = context.user!;  // Type: AuthenticatedUser
    return { data: newUser };
  });
```

## Reference: Option 2 — Type Inference with createTypedHandler()

```typescript
import { createTypedHandler, Context } from '@noony-serverless/core';

// Define controller WITH EXPLICIT TYPES
async function createUserController(context: Context<CreateUserRequest, AuthenticatedUser>) {
  const { name, email, age } = context.req.validatedBody!;
  const user = context.user!;
  const newUser = await userService.create({ name, email, age });
  return { data: newUser };
}

// createTypedHandler infers types from controller signature
const createUserHandler = createTypedHandler(createUserController)
  .use(new ErrorHandlerMiddleware())        // Types inferred automatically!
  .use(new BodyValidationMiddleware(createUserSchema))
  .use(new ResponseWrapperMiddleware())
  .handle(createUserController);
```

## Reference: Comparison Table

| Aspect | Explicit Generics | Type Inference |
|--------|-------------------|-----------------|
| Boilerplate | High (specify on Handler + middlewares) | Low (infer from controller) |
| Readability | Clear and explicit | Cleaner code |
| Flexibility | Can use partial types | Requires full type signature |
| Best For | Complex types, planning | Controllers with explicit types |
| Compile Time Safety | ✅ Full type checking | ✅ Full type checking |

## Reference: Type Chain Preservation

```typescript
// ✅ CORRECT - Type chain preserved through all middlewares
class CustomMiddleware<TBody = unknown, TUser = unknown>
  implements BaseMiddleware<TBody, TUser>
{
  async before(context: Context<TBody, TUser>): Promise<void> {
    // Types flow through chain
  }
}

// ❌ WRONG - Breaks type chain
class CustomMiddleware implements BaseMiddleware {
  async before(context: Context): Promise<void> {
    // Type information lost
  }
}
```

## Reference: Common Gotchas

### ❌ Forgetting Controller Type Annotation

```typescript
// WRONG - createTypedHandler can't infer without explicit types
const createUserController = async (context) => { /* No type annotation! */ };
const handler = createTypedHandler(createUserController);  // ❌ Loses type safety
```

### ✅ Solution: Add Explicit Type

```typescript
const createUserController = async (context: Context<CreateUserRequest, AuthUser>) => {
  // TypeScript now knows exact types
};
const handler = createTypedHandler(createUserController);  // ✅ Types inferred
```

### ❌ Mixing Approaches

```typescript
// WRONG — All explicit OR all inferred, never both in the same handler
const handler = new Handler<CreateUserRequest, AuthUser>()  // Explicit
  .use(new ErrorHandlerMiddleware())  // No type (ambiguous)
  .handle(createUserController);
```
