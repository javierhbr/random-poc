# Windsurf — `.windsurfrules`

> Windsurf is an agentic IDE (a VS Code fork) with a rules system similar to the others, but with the twist that it can orchestrate **multi-step workflows** from its side chat.

---

## Where it goes

```
your-repo/
├── .windsurfrules        ← repo root
├── .windsurf/
│   └── workflows/        ← reusable workflows (optional)
└── src/
```

> **Note:** Windsurf evolves quickly. The path and format may change between versions. Check the official docs if something doesn't work.

---

## Ready-to-copy template

Create `.windsurfrules` at the repo root:

```markdown
# Windsurf rules — Inventory API

## Project context

REST API for product inventory management. Mid-sized e-commerce
backend. ~30 endpoints.

## Tech stack

- Node 20, TypeScript 5.4 strict
- Express 4
- Zod 3 for validation
- Vitest 1 + supertest for tests
- Postgres 16 via Prisma

## Hard rules (never violate)

1. **Never use `any`.** Use `unknown` and narrow with type guards.
2. **Never use default exports.** Named exports only.
3. **Never use `class`** except for error classes extending `AppError`.
4. **Never use `enum`.** Prefer string union types.
5. **Never read `process.env`** outside `src/config.ts`.
6. **Never add new dependencies** without explicit user approval.
7. **Never use `axios`.** Use the native `fetch` API.

## Folder structure

src/
  routes/        ← Express route registration only, no logic
  controllers/   ← Request parsing, calls services, formats response
  services/      ← Business logic, prefer pure functions
  schemas/       ← Zod validation schemas
  db/            ← Prisma client and DB queries
  errors.ts      ← Custom error classes
tests/           ← Mirrors src/ structure

## Standard workflow for new endpoints

When adding a new endpoint, create files in this order:
1. Zod schema in `src/schemas/`
2. Service in `src/services/`
3. Controller in `src/controllers/`
4. Route registration in `src/routes/`
5. Vitest test in `tests/` covering happy path + 4+ edge cases

After creating, run:
```
npm run lint && npm test
```

Do not declare the task complete until both pass.

## Test conventions

- Use Vitest + supertest
- AAA pattern (Arrange / Act / Assert)
- One test file per service file
- Always cover: empty input, oversized input, wrong types,
  missing fields, unexpected extra fields

## Validation conventions

- Use `schema.safeParse()`, never `schema.parse()`
- On validation failure, respond 400 with:
  ```json
  { "error": "Validation failed", "details": <flattened error> }
  ```

## Communication style

- When in doubt, ask. Don't guess.
- Before applying multi-file changes, summarize what you'll do
  and wait for confirmation.
- After making changes, summarize what you changed and which
  tests you ran.
```

---

## Workflows in Windsurf (advanced)

Windsurf lets you define **reusable workflows** in `.windsurf/workflows/`. They're Markdown files describing step-by-step procedures the agent can execute.

### Example: `add-endpoint.md`

Create `.windsurf/workflows/add-endpoint.md`:

```markdown
# Workflow: Add a new REST endpoint

Use this workflow when the user asks to add a new endpoint to
the API.

## Inputs needed
- HTTP method (GET, POST, PUT, DELETE)
- Path (e.g., /api/products)
- Request body shape (if applicable)
- Expected response shape

## Steps

1. **Confirm requirements**
   Echo back the inputs to the user and ask for confirmation
   before writing any code.

2. **Create the Zod schema**
   File: `src/schemas/<resource>.ts`
   Export a schema named `<action><Resource>Schema`.
   Export the inferred type as `<Action><Resource>Input`.

3. **Create or extend the service**
   File: `src/services/<resource>.ts`
   The service should be pure when possible. If it needs DB
   access, import the Prisma client from `src/db/`.

4. **Create the controller**
   File: `src/controllers/<resource>.ts`
   - Use `safeParse` for validation
   - Return 400 on validation failure with `details`
   - Return appropriate success status code

5. **Register the route**
   File: `src/routes/<resource>.ts`
   Use the existing Router pattern.

6. **Write tests**
   File: `tests/<resource>.test.ts`
   Cover at minimum:
   - Happy path
   - Validation failure (each required field)
   - Edge cases for each field type

7. **Run quality checks**
   Run: `npm run lint && npm test`
   If anything fails, fix it before declaring complete.

8. **Summary**
   Tell the user which files were created/modified and which
   tests now exist.
```

Now, from Windsurf's side chat you can say:

> "Run the `add-endpoint` workflow for POST /api/categories with fields name (string) and parentId (optional string)."

And Windsurf will follow your workflow's steps in a structured way.

---

## Tips specific to Windsurf

### 1. Use the visual diffs

Windsurf shows interactive diffs before applying changes. **Read them.** Don't accept on autopilot. It's one of the best features for juniors because it forces you to understand every change.

### 2. Use the side chat for quick questions

If you just want to understand what a function does, don't open Claude Code in a terminal. Windsurf's side chat with the file open is faster.

### 3. Combine with `@file` and `@symbol`

Windsurf lets you reference files and symbols with `@`. Instead of pasting code:

> "Refactor @file:src/services/orderProcessor.ts to extract the constants into a separate file"

Cleaner than pasting 100 lines into the chat.

---

## How to verify it works

In Windsurf's side chat, type:

> "What conventions do you follow in this project? And what should you not do?"

If the answer reflects your `.windsurfrules`, it's working.

If it says generic things or cites rules you didn't write, check that the file is at the root of the open workspace.
