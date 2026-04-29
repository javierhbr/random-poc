# Rules files and skills — what they are and why they matter

> If you take only ONE thing from this workshop, make it this: **set up your rules files**. It's the highest-impact, lowest-effort change you can make.

---

## The problem they solve

Every time you open ChatGPT, Copilot Chat, Claude Code, or Windsurf, the AI starts from **zero**. It doesn't know:

- What stack you use
- What conventions your team follows
- Which libraries are allowed (and which are banned)
- How your repo is structured
- Which patterns you avoid
- Which test framework you use

Without this information, the AI suggests code that **technically works** but doesn't fit your project. You have to fix the style, swap the libraries, move files. Every time. In every conversation.

**Solution:** a file at the root of your repo that the AI reads automatically in every interaction.

---

## Rules vs Skills — key difference

| Concept | What it is | When it loads |
|---|---|---|
| **Rules file** | A single file with the project's rules | **Always**, in every interaction |
| **Skill** | A modular file with a specific procedure | **On demand**, when the task needs it |

**Analogy:**

- **Rules file** = the new employee handbook. Read on day one and applied always.
- **Skills** = the specific "how to do X" guides. Consulted only when you're going to do X.

**Concrete example:**

- In your **rules file** you say: "we use strict TypeScript, no `any`, validation with Zod, tests with Vitest". This applies to everything.
- In a **skill called `database-migrations.md`** you document: "to create a DB migration we do this: step 1, 2, 3...". This only loads when the user asks for a migration.

---

## The 3 tools and their files

| Tool | Rules file | Supports modular skills |
|---|---|---|
| GitHub Copilot | `.github/copilot-instructions.md` | Yes (via instruction files with scope) |
| Claude Code | `CLAUDE.md` | Yes (via the skills system) |
| Windsurf | `.windsurfrules` | Yes (via workflows) |

> 💡 **Tip:** you can have all 3 files in the same repo. They point to the same conceptual content, but each tool reads its own. There are even devs who maintain a single `CONTRIBUTING-FOR-AI.md` and the other files import or copy from it.

---

## Anatomy of a good rules file

An effective rules file answers these questions:

### 1. What IS this project?
> "REST API for inventory management for a mid-sized e-commerce. ~30 endpoints, ~15K LOC."

### 2. What stack does it use?
> "Node 20, TypeScript 5.4 (strict), Express 4, Zod 3, Vitest 1, Postgres 16, Prisma."

### 3. How is it organized?
> ```
> src/
>   routes/      ← only define routes, no logic
>   controllers/ ← parse the request, call services
>   services/    ← business logic
>   schemas/     ← Zod schemas
>   db/          ← Prisma access
> tests/         ← one test per service file
> ```

### 4. What conventions do we follow?
> - No `any` (ever)
> - Pure functions whenever possible
> - Errors with custom classes (`AppError`, `ValidationError`)
> - Don't use default exports
> - Tests with AAA (Arrange / Act / Assert)

### 5. What do we AVOID?
> - Don't use `class` except for custom errors
> - Don't use `enum` (use union types)
> - Don't use `axios` (use native `fetch`)
> - Don't commit without running `npm run lint && npm test`

### 6. How do you run the commands?
> - Tests: `npm test`
> - Lint: `npm run lint`
> - Local server: `npm run dev`

---

## The 80/20 rule

**80% of the value comes from having ONE well-written rules file.**

The remaining 20% comes from modular skills for specific cases. Don't obsess over skills at first. Start with the basic rules file and improve from there.

---

## Quick exercise (3 min)

Before moving to the concrete templates, answer these questions about your current project:

1. If a new dev joined today, what would you tell them about the stack?
2. What pattern would you ask them to follow when creating a new endpoint?
3. What library do you use that would be weird/wrong to replace?
4. What team convention does "everyone knows" but isn't documented?

**Those 4 answers are the core of your rules file.**

Continue with the specific files:
- [`02-copilot-instructions.md`](./02-copilot-instructions.md)
- [`03-claude-md.md`](./03-claude-md.md)
- [`04-windsurfrules.md`](./04-windsurfrules.md)
- [`05-reusable-skills.md`](./05-reusable-skills.md)
