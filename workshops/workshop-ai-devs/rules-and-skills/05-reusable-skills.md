# Reusable skills

> This document is the "next level" after the rules files. If you're just starting, **focus first on the rules file** and come back here when it's already a habit.

---

## What is a skill?

A **skill** is a Markdown file with a specific procedure that the AI loads **on demand** when it detects the task needs it.

**Examples of useful skills for a backend:**

- "How to write a database migration"
- "How to add a new REST endpoint"
- "How to write integration tests for Stripe"
- "How to handle errors in a controller"
- "How to deploy to staging"
- "How to write a seed script for test data"

Each one is an independent, self-contained `.md` file with its own title and description.

---

## Why not put everything in the rules file?

Because your rules file gets huge and the AI starts ignoring parts. Better:

- **Rules file:** general conventions, always loaded
- **Skills:** specific procedures, loaded only when relevant

**Analogy:** the rules file is the Constitution (short, always in force). Skills are the specific laws (one per topic, consulted when needed).

---

## Anatomy of a skill

A good skill has 3 parts:

```markdown
---
name: skill-name
description: Concise description of when to use this skill.
              This is what the AI reads to decide whether to load it.
---

# Skill title

## When to use
[clear criteria]

## Steps
[numbered procedure]

## Examples
[concrete code examples]

## Common mistakes
[what to avoid]
```

The critical part is the **`description` in the frontmatter**. The AI uses it to decide whether to load the skill or not. If it's poorly written, the skill never activates.

---

## Full example: skill for creating REST endpoints

Create `.claude/skills/add-rest-endpoint/SKILL.md`:

````markdown
---
name: add-rest-endpoint
description: Use this skill when the user asks to add, create or
  scaffold a new REST endpoint in this Express + TypeScript API.
  Triggers: "add an endpoint", "create a route", "add a POST/GET/PUT/DELETE",
  "scaffold an API endpoint". Do not use for modifying existing endpoints
  (use modify-endpoint skill instead).
---

# Add a REST endpoint

## When to use this skill

Use when the user wants to add a brand new endpoint to the API.
Do NOT use for:
- Modifying existing endpoints (different skill)
- Adding GraphQL resolvers (we don't use GraphQL)
- Adding internal helper functions (just edit the file directly)

## Required information

Before writing any code, confirm with the user:
1. HTTP method (GET / POST / PUT / DELETE / PATCH)
2. Path (e.g., `/api/products`)
3. Request body shape (for POST/PUT/PATCH)
4. Expected response shape and status code
5. Any auth requirements

If any of these are missing, ASK before proceeding.

## Steps

### 1. Schema (src/schemas/)

Create or extend `src/schemas/<resource>.ts`:

```typescript
import { z } from "zod";

export const create<Resource>Schema = z.object({
  // fields...
});

export type Create<Resource>Input = z.infer<typeof create<Resource>Schema>;
```

### 2. Service (src/services/)

Create or extend `src/services/<resource>.ts`. Keep it pure when
possible. If it needs DB access:

```typescript
import { prisma } from "../db/client";
import { Create<Resource>Input } from "../schemas/<resource>";

export async function create<Resource>(input: Create<Resource>Input) {
  return prisma.<resource>.create({ data: input });
}
```

### 3. Controller (src/controllers/)

```typescript
import { Request, Response } from "express";
import { create<Resource>Schema } from "../schemas/<resource>";
import * as <resource>Service from "../services/<resource>";

export async function create<Resource>Controller(req: Request, res: Response) {
  const result = create<Resource>Schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.flatten(),
    });
  }
  const created = await <resource>Service.create<Resource>(result.data);
  return res.status(201).json(created);
}
```

### 4. Route (src/routes/)

```typescript
import { Router } from "express";
import { create<Resource>Controller } from "../controllers/<resource>";

export const <resource>Router = Router();
<resource>Router.post("/<resource>", create<Resource>Controller);
```

Then register it in `src/app.ts`:
```typescript
import { <resource>Router } from "./routes/<resource>";
app.use("/api", <resource>Router);
```

### 5. Tests (tests/)

Create `tests/<resource>.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";

describe("POST /api/<resource>", () => {
  it("creates a <resource> with valid input", async () => {
    const res = await request(app)
      .post("/api/<resource>")
      .send({ /* valid payload */ });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ /* expected shape */ });
  });

  it("rejects empty payload", async () => {
    const res = await request(app).post("/api/<resource>").send({});
    expect(res.status).toBe(400);
  });

  // Add 3+ more edge case tests
});
```

### 6. Quality checks

Run before declaring complete:
```bash
npm run lint && npm test
```

If anything fails, fix before continuing.

## Common mistakes

- ❌ Putting business logic in the controller (it goes in the service)
- ❌ Putting validation in the service (it goes in the schema + controller)
- ❌ Forgetting to register the router in `src/app.ts`
- ❌ Skipping edge case tests
- ❌ Using `parse()` instead of `safeParse()`

## Checklist

Before saying "done", verify:
- [ ] Schema exported from `src/schemas/`
- [ ] Service function exported from `src/services/`
- [ ] Controller exported from `src/controllers/`
- [ ] Route registered in `src/routes/` AND in `src/app.ts`
- [ ] Tests cover happy path + at least 4 edge cases
- [ ] `npm run lint` passes
- [ ] `npm test` passes
````

---

## How to use skills in each tool

### Claude Code

Claude Code supports skills natively. Put them in `.claude/skills/<name>/SKILL.md` and Claude discovers them automatically. The frontmatter `description` is critical — the AI uses it to decide when to load each skill.

### Copilot

Copilot supports scoped instruction files via `.github/instructions/<name>.instructions.md`, where you can define an `applyTo` glob so it only applies to certain files. It's not exactly "skills on demand", but it serves a similar role.

### Windsurf

Windsurf uses the **workflows** we saw in the previous file. They're conceptually equivalent to skills.

---

## When to create a new skill

Create a skill when:

✅ You repeat the same procedure more than 3 times
✅ You have a process with ritual steps (migrations, deploys, scaffolds)
✅ There's a "team-correct way" that gets lost if done from memory
✅ You want a junior to be able to do it right without supervision

Don't create a skill when:

❌ The procedure varies a lot from project to project
❌ It's a one-off task
❌ It's so general it's already covered by the rules file

---

## List of skills you probably want to have

For a TypeScript + Node backend, these are the highest-ROI skills:

1. **`add-rest-endpoint`** (the one we saw above)
2. **`add-database-migration`** — steps to create and apply a Prisma migration
3. **`add-zod-schema`** — conventions for schemas: names, refinements, error messages
4. **`write-vitest-tests`** — AAA pattern, mocks, supertest
5. **`debug-failing-test`** — process for diagnosing red tests
6. **`update-dependency`** — steps to update a dep, including regression tests
7. **`add-error-handling`** — how to create a new AppError and use it

Start with **one** (the highest-frequency in your team) and add more.

---

## Success metric

You know your rules + skills system is working when:

> A junior dev can ask the AI "add a POST /api/categories endpoint" and what the AI produces **can be merged with no manual changes**, respecting all the team's conventions.

When you reach that point, you've automated the technical onboarding of your team to AI. It's one of the highest-ROI things you can do as a tech lead.
