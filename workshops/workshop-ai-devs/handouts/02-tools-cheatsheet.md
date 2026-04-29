# Handout 2 — Tools cheatsheet

> Which tool do I use for what? This sheet tells you.

---

## Quick comparison

| Feature | GitHub Copilot | Claude Code | Windsurf |
|---|---|---|---|
| **Lives in** | Inline in your editor | Terminal (CLI) | Full IDE |
| **Main mode** | Autocomplete + chat | Conversational agent | Agent + side chat |
| **Sees the whole repo** | Limited (workspace) | Yes (with permissions) | Yes |
| **Edits multiple files** | Hard | Yes, natively | Yes, natively |
| **Runs commands** | No | Yes (with permission) | Yes (with permission) |
| **Rules file** | `.github/copilot-instructions.md` | `CLAUDE.md` | `.windsurfrules` |
| **Sweet spot** | Writing line by line | Multi-file tasks | Pair programming |

---

## When to use each

### 🟢 Use GitHub Copilot when...

- You're writing code and want smart autocomplete
- You need repetitive boilerplate (a getter, a mapper, a DTO)
- You're writing tests similar to ones you already have
- You want it to complete a function whose signature you already wrote
- You're working on **a single file at a time**

**Example:**
```typescript
// You write this:
function calculateTax(price: number, country: string): number {

// Copilot completes the body based on patterns elsewhere in the repo
```

### 🟣 Use Claude Code when...

- You need to touch **multiple files in a coordinated way** (e.g., adding an endpoint requires route + controller + service + test + types)
- You're debugging something that crosses modules
- You want it to run commands: run tests, install deps, view logs
- You're refactoring across an entire module
- You want an agent that iterates on its own until tests pass
- You work from the terminal (no heavy IDE)

**Example:**
```bash
claude "add a complete CRUD for products: route + controller +
service + zod schema + tests with vitest. Follow the conventions
in CLAUDE.md"
```

### 🔵 Use Windsurf when...

- You want a full IDE experience with an integrated agent
- You need the AI to navigate your repo visually while you watch
- You want to accept/reject changes via visual diffs before committing
- You like the "side chat + see code in real time" flow
- You're pair programming with a junior even more junior than you

**Example:**
> In the side chat: "add validation to all `/api/users` endpoints using the schema that already exists in `src/schemas/users.ts`"

---

## Combos that work

🔥 **Combo 1 — Copilot + Claude Code**
- Copilot for day-to-day code writing
- Claude Code for big tasks and refactors

🔥 **Combo 2 — Windsurf + Claude Code**
- Windsurf as your main IDE
- Claude Code in the terminal for quick scripts and automations

🔥 **Combo 3 — All 3 by context**
- Copilot while writing
- Windsurf for big features with visual diffs
- Claude Code for tasks in CI/CD or agentic scripts

---

## Anti-combinations (don't do this)

❌ Using Copilot for multi-file refactors → you'll waste hours fighting with context

❌ Using Claude Code to autocomplete a variable → like killing a fly with a cannon

❌ Having all 3 suggesting at the same time in the same file → visual chaos

---

## Quick decision question

For any task, ask yourself:

```
How many files am I going to touch?

  1 file, small change          →  Copilot
  Multiple coordinated files    →  Claude Code or Windsurf
  A new repo I don't know       →  Claude Code or Windsurf (to understand)

Do I need it to run commands for me?

  Yes  →  Claude Code or Windsurf
  No   →  any of them works

Do I want to see the changes visually before applying?

  Yes        →  Windsurf (best diff UX)
  Don't care →  Claude Code (faster)
```
