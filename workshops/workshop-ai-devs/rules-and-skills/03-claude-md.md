# Claude Code — `CLAUDE.md`

> Claude Code reads this file automatically when you run it in a repo. It's the most powerful of the three because Claude Code is the most agentic.

---

## Where it goes

```
your-repo/
├── CLAUDE.md          ← repo root (most common)
├── src/
│   └── CLAUDE.md      ← optional: scoped to a folder
└── package.json
```

**Trick:** you can have several `CLAUDE.md` files in different folders. Claude Code loads them hierarchically, so the one in `src/api/CLAUDE.md` adds context about the `api/` folder without polluting the rest of the repo.

---

## Ready-to-copy template

```markdown
# CLAUDE.md

Context for Claude Code when working in this repository.

## Project

REST API for product inventory management. ~30 endpoints, mid-sized
e-commerce backend.

## Stack

- **Runtime:** Node 20
- **Language:** TypeScript 5.4 (strict mode, no `any` allowed)
- **Framework:** Express 4
- **Validation:** Zod 3
- **Tests:** Vitest 1 + supertest
- **Database:** Postgres 16 via Prisma

## Repository structure

```
src/
  routes/        Express route definitions only — no logic
  controllers/   Parse request, call service, format response
  services/      Business logic, pure when possible
  schemas/       Zod schemas for validation
  db/            Prisma client + DB access
  errors.ts      Custom error classes (AppError, ValidationError, ...)
  config.ts      Single source for env vars
tests/           Mirrors src/ structure, one file per service
```

## Conventions

### TypeScript
- **No `any`, ever.** Use `unknown` and narrow.
- Prefer type unions over `enum`.
- Named exports only — no default exports.
- Functions should be pure when possible.

### Errors
- All thrown errors extend `AppError`.
- Validation errors use `ValidationError` from `src/errors.ts`.
- Never throw plain `new Error("...")`.

### HTTP layer
- Routes in `src/routes/` ONLY register endpoints.
- Controllers in `src/controllers/` parse + delegate.
- Services in `src/services/` contain business logic.
- All request bodies validated with Zod via `safeParse`.
- Validation failures → 400 with `details` from `error.flatten()`.

### Tests
- Vitest + supertest for HTTP tests.
- AAA pattern (Arrange / Act / Assert).
- Must include edge cases: empty, oversized, wrong type, missing
  fields, unexpected extra fields.
- One test file per service file.

## Commands

| Action | Command |
|--------|---------|
| Run tests | `npm test` |
| Run specific test | `npm test -- path/to/file.test.ts` |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Dev server | `npm run dev` |
| Production build | `npm run build` |

**Always run `npm run lint && npm test` before declaring a task complete.**

## Workflow expectations

When asked to add a new endpoint, follow this exact order:
1. Create the Zod schema in `src/schemas/`
2. Create or extend the service in `src/services/`
3. Create the controller in `src/controllers/`
4. Register the route in `src/routes/`
5. Write Vitest tests covering happy path + at least 4 edge cases
6. Run `npm run lint && npm test` and fix any issues

When asked to modify existing code:
1. Read the relevant files first (don't guess)
2. Run the tests to confirm the baseline is green
3. Make the change
4. Run the tests again
5. If anything broke, fix it before proceeding

## What to avoid

- ❌ Adding new dependencies without explicit user approval
- ❌ Modifying `package.json` or `tsconfig.json` without approval
- ❌ Using `class` syntax except for error classes
- ❌ Using `enum`
- ❌ Reading `process.env` outside of `src/config.ts`
- ❌ Replacing `fetch` with `axios` or other HTTP libraries
- ❌ Skipping tests "for speed"
- ❌ Refactoring code that wasn't part of the asked task

## When in doubt

Ask the user a clarifying question instead of guessing. It's
cheaper to ask than to undo a wrong change.
```

---

## Why `CLAUDE.md` matters especially for Claude Code

Unlike Copilot (which suggests line by line), Claude Code is **agentic**: it runs commands, reads files, makes multi-file changes, runs tests. Without a good `CLAUDE.md`, it will:

- Run commands your project doesn't use (`yarn test` instead of `npm test`)
- Create files in folders that don't follow your convention
- Invent project structures based on patterns it saw during training
- Loop in circles because it doesn't know when to stop

With a good `CLAUDE.md`, Claude Code becomes a colleague that **respects** your project.

---

## Tips specific to Claude Code

### 1. The "commands" section is critical

Claude Code is going to RUN commands. If you tell it your tests are `npm test`, it'll use it. If you say nothing, it'll try `yarn test`, `pnpm test`, `vitest`, until it gets it right — wasting time and tokens.

### 2. Define what "task complete" means

In the "Workflow expectations" section, explicitly say: "A task is not complete until `npm run lint && npm test` passes". Without this, Claude Code can tell you "done" when it has only written code.

### 3. Be clear about implicit permissions

If you DO NOT want it to touch `package.json`, say so explicitly. Claude Code is agentic and by default feels it has permission to change whatever it needs.

### 4. Use CLAUDE.md in layers

If your monorepo has `apps/web/` and `apps/api/`, consider:
- `CLAUDE.md` at the root: general conventions
- `apps/web/CLAUDE.md`: frontend-specific conventions
- `apps/api/CLAUDE.md`: backend-specific conventions

Claude Code composes them automatically depending on which folder you're working in.

---

## How to verify it works

```bash
cd your-repo
claude "what conventions do you follow in this repo?"
```

If the answer reflects your `CLAUDE.md`, it's working. If not, check the file is at the root and is named exactly `CLAUDE.md` (uppercase).
