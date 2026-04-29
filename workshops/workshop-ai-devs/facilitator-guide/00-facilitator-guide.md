# Facilitator Guide

> 2-hour workshop for junior devs on productive use of Copilot, Claude Code, and Windsurf with TypeScript + Node.js.

---

## Before you start

### Technical setup (30 min before)

- [ ] Projector / screen sharing working
- [ ] Your editor with **all 3 tools installed and logged in** (Copilot, Claude Code, Windsurf) — you'll switch between them during demos
- [ ] Workshop repo cloned and `npm install` run
- [ ] Terminal with large font (minimum 18pt)
- [ ] Shared document open (Notion, Google Doc, or similar) for the "wall of good prompts"
- [ ] Visible timer

### Pedagogical setup

- [ ] Confirm every participant has **at least one** of the tools working
- [ ] Pair up participants (pairs or trios max)
- [ ] Hand out `01-civr-framework.md` (printed or digital)
- [ ] Have the shared "prompt wall" doc ready

---

## Block 1 — Intro with contrast (15 min) · 0:00 → 0:15

### Goal
Create the "aha moment" in the first 10 minutes. Let them see the difference between misusing AI vs using it well — without explaining it yet.

### Live demo (10 min)

Open your editor with Copilot Chat or Claude Code. Paste this code (it's in `exercises/01-async-debugging.md`):

```typescript
app.get("/users/:id/profile", async (req, res) => {
  try {
    const user = await fetchUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    const orders = fetchUserOrders(user.id); // bug: missing await
    return res.json({ user, orders });
  } catch (error) {
    return res.status(500).json({ error: "Internal error" });
  }
});
```

**Round 1 — Bad prompt:**
> "it's not working, fix it"

Show how the AI gives a generic answer, possibly rewrites things it shouldn't, or asks vaguely.

**Round 2 — Prompt with context:**
> "I'm in Express + TypeScript. This endpoint returns `orders` as an empty `{}` object in production instead of an array. The unit test passes, but QA reports the bug in staging. I need you to: (1) identify the root cause, (2) explain WHY it happens before applying the fix, (3) propose the minimal fix. Here's the code: [paste]"

Show how the response is dramatically better: it spots the missing `await`, explains why `JSON.stringify` turns a Promise into `{}`, and proposes the fix.

### Quick discussion (5 min)

Open question to the group:
> "What was different between the two prompts?"

Collect answers in the shared doc. You'll use them to build the CIVR framework in the next block.

### ⚠️ Traps to avoid

- **Don't explain the framework yet.** Let them discover it.
- **Don't make the demo too perfect.** It's fine for the first round to give a bad answer.

---

## Block 2 — The 3 tools (10 min) · 0:15 → 0:25

### Goal
They should understand it's **not the same tool for everything**. Each one has its sweet spot.

### Key message

> "Copilot, Claude Code, and Windsurf aren't competitors. They're different tools for different moments of the workflow."

### Comparison table (project this)

| Tool | Lives in | Best for | Not great at |
|---|---|---|---|
| **GitHub Copilot** | Inline in your editor | Autocomplete, writing short functions, repetitive tests, boilerplate | Multi-file changes, big refactors, complex debugging |
| **Claude Code** | Terminal (CLI) | Multi-file tasks, refactors, debugging with full repo context, agentic scripts | Line-by-line suggestions while you type |
| **Windsurf** | Full IDE (VS Code fork) | Agentic pair programming, coordinated changes across files, "build this feature for me" | Offline work, pure terminal flows |

### Quick demo (3 min)

Show the same trivial task: adding a `GET /health` endpoint.

- **With Copilot**: start typing `app.get("/health"` and let it autocomplete.
- **With Claude Code**: in the terminal, run `claude "add a GET /health endpoint that returns { status: 'ok', timestamp }"`.
- **With Windsurf**: in the side chat, "add a health endpoint with timestamp".

Let them see the **three visually distinct flows** for the same task.

### Practical rule for juniors

> "If you already know what you want to write → **Copilot**.
> If you want someone to write it for you → **Claude Code** or **Windsurf**.
> If you're going to touch multiple files → **Claude Code** or **Windsurf**, never Copilot."

---

## Block 3 — Rules files and skills (15 min) · 0:25 → 0:40

### Goal
Teach them that modern AI tools **are not memoryless chats**. You can and should configure them to know the project.

### Key concept (explain it like this)

> "Imagine you hire a new dev. On day one you give them a README, a style guide, you tell them which libraries you use, which patterns you avoid. You have to do the same with the AI. Without that setup, it suggests code that doesn't fit your project."

### The 3 life-changing files (5 min)

Project this summary:

| Tool | File | Where it goes |
|---|---|---|
| GitHub Copilot | `.github/copilot-instructions.md` | Repo root |
| Claude Code | `CLAUDE.md` | Repo root (or subfolders) |
| Windsurf | `.windsurfrules` | Repo root |

All 3 tools read these files automatically and inject them as context in every interaction. **You don't have to repeat the same thing in every prompt.**

### Live demo (8 min)

1. Open the workshop repo with no rules file.
2. Ask Copilot/Claude Code to create a new endpoint `POST /products`.
3. Notice: it probably uses `app.post(...)` directly, no validation, no types, throws in `any`, doesn't write tests.
4. Now **add** a `CLAUDE.md` (you have one ready in `rules-and-skills/03-claude-md.md`) that says:
   - "We use Express + strict TypeScript, no `any`."
   - "Every route lives in `src/routes/` and delegates to a controller in `src/controllers/`."
   - "Validation with Zod."
   - "Every new endpoint needs a test in `tests/` with Vitest."
5. Repeat the same prompt. Now the AI respects every convention without you saying it.

### Skills (quick concept, 2 min)

> "Skills are like rules files but **modular and reusable**. Instead of dumping everything into one giant file, you split by topic: one skill for 'how to write migrations', another for 'how to test endpoints'. The AI loads only the one it needs at the moment."

Don't go deep here. Just plant the seed. Anyone who wants more finds it in `rules-and-skills/05-reusable-skills.md`.

---

## Block 4 — Exercise 1: Debugging with CIVR (25 min) · 0:40 → 1:05

### Goal
Internalize the CIVR framework by practicing it on a real bug.

### Introduce the CIVR framework (3 min)

Write it on the whiteboard or project it. It's the simplified version of the contrast they already saw:

| Letter | Means | Example |
|---|---|---|
| **C** | Context | "Express + TS, checkout endpoint, test passes but QA reports a bug" |
| **I** | Input | The code, the error, the logs, the stack trace |
| **V** | Validate | "Explain your reasoning BEFORE applying the fix" |
| **R** | Refine | "If the first answer doesn't convince you, ask for alternatives or more detail" |

### Exercise setup (2 min)

Each pair opens `exercises/01-async-debugging.md` and reads only the "Your task" section. **They should not look at the solutions section.**

### Practice (15 min)

- **5 min** — Each pair tries to fix the bug with a deliberately bad prompt ("it's not working, fix it").
- **10 min** — They rewrite the prompt using CIVR and try again.

While they practice: walk between the pairs. **Don't correct them immediately.** If you see them stuck, ask "which part of CIVR are you missing?". Let them get there themselves.

### Debrief (5 min)

Ask 2 pairs:
1. "Which prompt worked better? Read it out loud."
2. "Which part of CIVR did you forget at first?"

Stick the best prompts on the shared doc (prompt wall).

### ⚠️ If they finish fast
Have them do a second iteration: "now ask the AI to write a test that would prevent this bug in the future".

---

## Block 5 — Exercise 2: Feature + tests (30 min) · 1:05 → 1:35

### Goal
Practice an **iterative 3-step flow** instead of asking for everything at once.

### Introduce the flow (3 min)

Write this on the whiteboard:

```
Step 1 → PLAN     "Before writing code, give me a list of steps"
Step 2 → BUILD    Implement step by step, validating each one
Step 3 → TEST     "Now generate tests with edge cases"
```

> "The most common mistake I see in juniors is asking 'build me the complete products endpoint with tests'. The AI hands you 200 lines, you don't understand all of them, and when something fails you don't know where to look."

### Setup (2 min)

Open `exercises/02-feature-endpoint.md`. The task: build a `POST /api/products` endpoint with validation, in-memory persistence, and tests.

### Practice (20 min)

- **5 min** — Step 1: ask the AI for the plan and discuss it as a pair before accepting
- **10 min** — Step 2: implement step by step (ideally with Claude Code or Windsurf)
- **5 min** — Step 3: ask for tests with edge cases

### Debrief (5 min)

- "Which steps from the original plan changed as you implemented?"
- "How many edge cases did the AI find that you wouldn't have thought of?"
- "Did anyone use all 3 different tools? For what?"

### ⚠️ If they finish fast
Tell them: "now add a `GET /api/products/:id` endpoint reusing the rules file".

---

## Block 6 — Exercise 3: Understand unfamiliar code (15 min) · 1:35 → 1:50

### Goal
Show them **the most underrated use case**: using AI as an onboarding tutor when you land in a new codebase.

### Setup (2 min)

Open `exercises/03-understand-code.md`. It's a ~120-line file with an order processing service that mixes validation, tax calculation, discounts, and persistence. **They didn't write it.**

### Practice (10 min)

Each pair must use their favorite tool to answer these 4 questions **without reading the code line by line**:

1. What does this file do in one sentence?
2. What are the public functions (entry points)?
3. If I change the tax calculation, which tests might break?
4. Are there any obvious code smells or risks?

### Debrief (3 min)

- "How many minutes would it have taken you to understand this on your own vs with the AI?"
- "Did the AI catch anything you wouldn't have seen?"
- Key point: **"This is what you're going to do every time you land on someone else's PR or a new repo."**

---

## Block 7 — Closing and anti-patterns (10 min) · 1:50 → 2:00

### Anti-patterns (5 min)

Project this list (also in `handouts/03-anti-patterns.md`):

1. **Pasting code without context** → "it's not working"
2. **Accepting the first answer without reading it**
3. **Asking for huge changes in one go**
4. **Trusting libraries or functions the AI invents** → always verify they exist
5. **No rules file** → every conversation starts from zero
6. **Pasting credentials, tokens, or sensitive data** in the prompt

### Final golden rule

Repeat it three times, slowly:

> **"If you don't understand what the AI gave you, don't paste it."**

This is critical for juniors. The AI can produce code that looks right, compiles, even passes superficial tests, but if you don't understand what it does, you're responsible for any bug it causes in production.

### Closing (3 min)

- Hand out (or link) the final handouts
- Point at the workshop's "prompt wall" as a resource
- Optional homework: `Exercise 4` on safe refactoring
- Quick Q&A (max 2 min)

### Success metric

If anyone says "I already knew this" at the end → you failed to push them.
If anyone says "I'm setting up my rules file on Monday" → you won.

---

## Appendix: time management

| If you're behind... | Cut this |
|---|---|
| 5 min | The 3-tools demo (just mention them) |
| 10 min | Exercise 3 (leave as homework) |
| 15 min | Exercise 2: only do Step 1 (plan) and Step 3 (tests), skip the build |

| If you're ahead... | Add this |
|---|---|
| 10 min | Exercise 4 — Safe refactor |
| 5 min  | Live demo of building a custom skill |
| 5 min  | Round of "share your best prompt of the workshop" |

---

## Appendix: questions you'll get

**Q: Which tool is best?**
A: None. Each one solves a different problem. The skill is knowing which to use when.

**Q: Will AI replace devs?**
A: No, but devs who know how to use AI will replace devs who don't.

**Q: Is it safe to paste company code into these tools?**
A: Depends on the plan. Check with your lead/security on data retention policies. Copilot Business and Claude for enterprises have different policies than the free versions.

**Q: How many tokens / how much does it cost?**
A: Don't worry about that at first. Focus on learning the flow. Optimization comes later.

**Q: What if the AI gives me code that doesn't work?**
A: Welcome to the real world. That's exactly the value of CIVR: iterate.
