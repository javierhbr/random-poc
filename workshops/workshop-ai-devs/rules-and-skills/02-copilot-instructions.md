# GitHub Copilot — `.github/copilot-instructions.md`

> Copilot reads this file automatically in VS Code, JetBrains, and Neovim when you work in this repo. It saves you from repeating conventions in every chat.

---

## Where it goes

```
your-repo/
├── .github/
│   └── copilot-instructions.md   ← here
├── src/
└── package.json
```

Only create the `.github/` folder if it doesn't exist (the same folder where your GitHub Actions workflows live).

---

## Ready-to-copy template

Copy this into your repo and adjust for your project:

```markdown
# Instructions for GitHub Copilot

You are helping develop a TypeScript + Node.js backend API. Follow
these conventions strictly.

## Project context

- **What it is:** REST API for product inventory management.
- **Stack:** Node 20, TypeScript 5.4 (strict mode), Express 4, Zod 3
  for validation, Vitest 1 for tests, Prisma for the DB layer.
- **Size:** ~30 endpoints, growing.

## Code conventions

- Use TypeScript strict mode. **Never use `any`**. If a type is
  truly unknown, use `unknown` and narrow with type guards.
- Prefer type unions over `enum`.
- No default exports — use named exports.
- Functions should be pure when possible. Side effects (DB, I/O,
  external APIs) live in `services/` or `db/`.
- Use `async/await`, never raw `.then()` chains.
- All thrown errors should extend `AppError` (in `src/errors.ts`).

## Project structure

```
src/
  routes/        ← Express route definitions only. No logic here.
  controllers/   ← Parse request, call service, format response.
  services/      ← Business logic. Pure when possible.
  schemas/       ← Zod schemas for validation.
  db/            ← Prisma client and DB access.
  errors.ts      ← Custom error classes.
tests/           ← One test file per service file.
```

When asked to create a new endpoint, you must touch (in this order):
1. `src/schemas/` — add Zod schema for request body
2. `src/services/` — add business logic
3. `src/controllers/` — add controller that uses schema + service
4. `src/routes/` — register the route
5. `tests/` — add Vitest tests with happy path + edge cases

## Validation

- All request bodies are validated with Zod **before** the controller.
- Use `schema.safeParse()`, never `parse()`. Return 400 on failure.
- Validation errors must include `details` from `result.error.flatten()`.

## Tests

- Use Vitest + supertest for HTTP tests.
- Follow AAA (Arrange / Act / Assert) structure.
- Each test file mirrors the structure of `src/`.
- Always include edge cases: empty input, oversized input, wrong
  types, missing required fields, unexpected extra fields.
- Do not use `any` in tests either.

## What to avoid

- ❌ Do not use `axios`. Use the native `fetch` API.
- ❌ Do not use `class` syntax except for error classes.
- ❌ Do not use `enum`.
- ❌ Do not introduce new dependencies without asking.
- ❌ Do not modify `package.json` directly without explanation.
- ❌ Do not write code that depends on `process.env` outside
  of `src/config.ts`.

## Useful commands

- Run tests: `npm test`
- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Dev server: `npm run dev`

Before suggesting a commit-ready change, mentally run lint + tests
and only suggest code that would pass both.
```

---

## How to verify Copilot is using it

1. Save the file in the right path.
2. Restart your editor (sometimes needed).
3. In Copilot Chat, type: "what conventions do you follow in this repo?"
4. The answer should reflect your file. If it says generic things, it's not reading it.

---

## Golden tips for Copilot

- **Be specific, not aspirational.** Don't write "the code should be elegant". Write "no `any`, prefer pure functions".
- **Give examples when you can.** If you say "we handle errors with AppError", include a mini example of what it looks like.
- **List what NOT to do.** Explicit prohibitions are as important as recommendations.
- **Keep it under ~200 lines.** Beyond that, Copilot starts ignoring parts.
- **Update it when conventions change.** If your team stops using X, delete it from the file.

---

## Common mistakes

❌ **Too abstract:** "Write clean and maintainable code"
✅ **Concrete:** "Functions of at most 20 lines, names in English, no abbreviations"

❌ **Forgetting project context:** only listing rules
✅ **Start with what the project is** and why those rules exist

❌ **Mixing rules from multiple projects in one file**
✅ **One rules file per repo**, specific to that repo
