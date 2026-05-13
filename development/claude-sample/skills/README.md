# Noony Framework Skills - Overview

Modular Claude Code skills for building serverless APIs with the Noony Framework.

## Skills Index

### 🚀 [noony-framework.md](./noony-framework.md)

**Main reference** - Core patterns, key rules, and quick commands. Start here.

- Handler/Controller/Repository patterns
- 5 critical rules to follow
- Quick command reference
- Common troubleshooting

### 📝 [noony-endpoint-creation.md](./noony-endpoint-creation.md)

**Step-by-step guide** - Complete code templates for creating CRUD endpoints.

- Zod schema definitions
- Repository with MongoDB
- Service layer business logic
- Controller implementations
- Handler setup and routing

### 🎨 [noony-patterns.md](./noony-patterns.md)

**Common patterns** - Frequently used code patterns.

- Pagination with MongoDB
- Query filtering
- Soft delete pattern
- Permission checking (2 approaches)
- Timezone handling
- Error handling
- Batch operations
- Structured logging

### ⚙️ [noony-infrastructure.md](./noony-infrastructure.md)

**Infrastructure setup** - Core infrastructure code.

- MongoDB connection with pooling
- Firebase Admin SDK setup
- Token validator with caching
- Structured logging with Pino
- Environment validation
- Cloud Functions entry point
- Development server
- Deployment scripts

## Quick Start

1. **Creating a new endpoint?** → See [noony-endpoint-creation.md](./noony-endpoint-creation.md)
2. **Need a common pattern?** → See [noony-patterns.md](./noony-patterns.md)
3. **Setting up infrastructure?** → See [noony-infrastructure.md](./noony-infrastructure.md)
4. **Quick reference?** → See [noony-framework.md](./noony-framework.md)

## Critical Rules (Never Forget!)

1. **Controllers return data** - Never call `context.res.json()`
2. **Always `ensureConnected()`** - Before every MongoDB operation
3. **Middleware order matters** - Error → Response → Auth → Permissions → Parse → Validate
4. **Use Zod for validation** - `z.infer<typeof schema>` for type safety
5. **Constructor DI** - Simple injection at module load

## Architecture

```
Request → Handler (Middleware Chain) → Controller → Service → Repository → MongoDB
                                           ↓
                                     Return Data
                                           ↓
                            Handler captures to context.responseData
                                           ↓
                            ResponseWrapperMiddleware sends JSON
```

## File Structure/c

```
src/
├── models/          # Zod schemas (validation + types)
├── repositories/    # Data access (MongoDB with ensureConnected)
├── services/        # Business logic
├── controllers/     # Request handlers (return data)
├── handlers/        # Noony handlers (middleware chains)
├── middlewares/     # Custom middleware
├── config/          # DB, Firebase, Logger
└── auth/            # Token validator
```

## Common Commands

```bash
# Development
bun run dev                    # Fastify dev server (hot reload)
bun run debug                  # Dev server with inspector
bun run functions:dev          # Cloud Functions emulator

# Testing
bun run test:cucumber          # ATDD tests
bun run test:cucumber:dev      # Dev profile

# Build & Deploy
bun run build:functions        # Build for production
gcloud functions deploy api    # Deploy to GCP
```

## Token Usage Optimization

These skills are designed to minimize token usage:

- **Main file**: 91 lines (core patterns only)
- **Endpoint creation**: 150 lines (complete templates)
- **Patterns**: 180 lines (reusable patterns)
- **Infrastructure**: 250 lines (setup code)

Total: ~670 lines vs original 2600+ lines (74% reduction)

## Related Documentation

- [NOONY-HOW-TO.md](../../NOONY-HOW-TO.md) - Original detailed guide
- [API-AGUIDE.md](../../docs/API-AGUIDE.md) - Complete architecture guide
- [STEP-BY-STEP.md](../../STEP-BY-STEP.md) - Project setup guide

---

# Noony Serverless Framework Guidelines

This project uses the **Noony Serverless Framework** for building APIs with Google Cloud Functions, MongoDB, and Firebase Authentication.

## 🎯 Noony Framework Skills

When working on this codebase, use the appropriate skill based on your task:

- **Creating an endpoint?** → `.claude/skills/noony-endpoint-creation.md`
- **Need a pattern?** (pagination, filtering, permissions) → `.claude/skills/noony-patterns.md`
- **Infrastructure setup?** (MongoDB, Firebase) → `.claude/skills/noony-infrastructure.md`
- **Quick reference?** (core patterns, rules) → `.claude/skills/noony-framework.md`

## ⚠️ Critical Rules

1. **Controllers MUST return data** - Never call `context.res.json()`
2. **Always call `ensureConnected()`** - Before EVERY MongoDB operation
3. **Middleware order matters** - Error → Response → Auth → Permissions → Parse → Validate
4. **Use Zod for validation** - `z.infer<typeof schema>` for type safety
5. **Constructor DI** - Simple injection at module load (no container)

## 🔧 Bun Runtime

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## 📂 Project Structure

```text
src/
├── models/          # Zod schemas (validation + types)
├── repositories/    # Data access (MongoDB with ensureConnected)
├── services/        # Business logic
├── controllers/     # Request handlers (MUST return data)
├── handlers/        # Noony handlers (middleware chains)
├── middlewares/     # Custom middleware
├── config/          # DB, Firebase, Logger
├── auth/            # Token validator
├── functions.ts     # Cloud Functions entry (production)
└── server.ts        # Fastify dev server (development)
```

## 🚀 Common Commands

```bash
# Development
bun run dev                    # Fastify dev server (hot reload)
bun run functions:dev          # Cloud Functions emulator

# Testing
bun run test:cucumber          # ATDD tests with Cucumber

# Build & Deploy
bun run build:functions        # Build for production
gcloud functions deploy api    # Deploy single function to GCP
```

## 📝 Example: Creating a New Endpoint

See `.claude/skills/noony-endpoint-creation.md` for complete templates.

**Quick workflow:**

1. Define Zod schema in `src/models/`
2. Create repository in `src/repositories/` (with `ensureConnected()`)
3. Create service in `src/services/`
4. Create controller in `src/controllers/` (return data, don't call `context.res`)
5. Create handler in `src/handlers/` (chain middleware)
6. Register routes in `src/functions.ts` and `src/server.ts`

For more details, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.
