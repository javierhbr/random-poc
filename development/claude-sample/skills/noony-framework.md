# Noony Framework - Quick Reference

Concise patterns for building serverless APIs with Noony Framework, Google Cloud Functions, MongoDB, and Firebase.

## Core Patterns

### Handler (Middleware Chain)

```typescript
export const createItemHandler = new Handler<any>()
  .use(new ErrorHandlerMiddleware())
  .use(new ResponseWrapperMiddleware(201))
  .use(new AuthenticationMiddleware(tokenValidator))
  .use(new PermissionsGuard(Permissions.MANAGE))
  .use(new BodyParserMiddleware())
  .use(new BodyValidationMiddleware(schema))
  .use(createSignalMiddleware({ event: 'item' }))
  .handle(controller.createItem as any);
```

### Controller (Return Values - CRITICAL)

```typescript
// ✅ CORRECT: Return data
createItem = async (context: Context<CreateItemRequest>) => {
  const data = context.req.validatedBody!;
  return await this.itemService.create(userId, data);
};

// ❌ WRONG: Don't call context.res
context.res.status(201).json({ payload: item });
```

### Repository (Always ensureConnected)

```typescript
async create(data: any) {
  await ensureConnected(); // ← ALWAYS call first
  const item = new ItemModel({ _id: ulid(), ...data });
  await item.save();
  return item.toObject();
}
```

## Key Rules

1. **Controllers return data** - Handler captures to `context.responseData`
2. **Always `ensureConnected()`** - Before every DB operation
3. **Middleware order** - Error → Response → Auth → Permissions → Parse → Validate → Signals → Controller
4. **Zod for validation** - `z.infer<typeof schema>` for types
5. **Constructor DI** - Simple injection at module load

## 5-Step Endpoint Creation

See `noony-endpoint-creation.md` for complete code examples.

**Quick steps:**

1. Zod schema (`src/models/`) → `z.infer<typeof schema>` for types
2. Repository (`src/repositories/`) → Always `ensureConnected()` first
3. Service (`src/services/`) → Business logic
4. Controller (`src/controllers/`) → Return data (don't call `context.res`)
5. Handler (`src/handlers/`) → Chain middleware, register routes

## Common Patterns

See `noony-patterns.md` for pagination, filtering, soft delete, and permission checking examples.

## Infrastructure

See `noony-infrastructure.md` for MongoDB connection setup and Firebase token validator.

## Commands

```bash
bun run dev                 # Dev server
bun run functions:dev       # Cloud Functions local
bun run test:cucumber       # ATDD tests
bun run build:functions     # Production build
```

## Deployment

```bash
gcloud functions deploy api \
  --gen2 --runtime=nodejs20 --region=us-central1 \
  --entry-point=api --trigger-http --memory=512MB
```

## Troubleshooting

- **"validatedBody undefined"** → Add `BodyParserMiddleware` before `BodyValidationMiddleware`
- **"MongoDB timeout"** → Check `serverSelectionTimeoutMS: 2000`, verify `MONGODB_URI`
- **"Response already sent"** → Controllers must return data, not call `context.res`
