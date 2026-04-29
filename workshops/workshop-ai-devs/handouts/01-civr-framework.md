# Handout 1 — CIVR Framework

> Print it or keep it open for the whole workshop. It's your cheat sheet.

---

## The 4 letters

| Letter | Means | Ask yourself... |
|---|---|---|
| **C** | **Context** | Does the AI know what stack I use, what this project does, what file this is? |
| **I** | **Input** | Did I give it the code, the full error, the logs, examples of input/output? |
| **V** | **Validate** | Did I ask it to explain its reasoning BEFORE applying the change? |
| **R** | **Refine** | Did I iterate at least once instead of accepting the first answer? |

---

## Template 1 — Debugging

```
Context:
- Stack: TypeScript + Node + Express
- File: src/routes/users.ts
- Symptom: the GET /users/:id/profile endpoint returns
  `orders: {}` in production (should be an array). Locally
  the test passes.

Code:
[paste the code here]

Error / logs:
[paste what you see in console, or "no visible error"]

Task:
1. Identify the root cause
2. Explain WHY it happens before applying the fix
3. Propose the minimal fix
4. Suggest a test that prevents the regression
```

---

## Template 2 — Building a feature

**Step 1: ask for the plan**

```
Context: Express + TypeScript, I already have a rules file with
the project conventions in CLAUDE.md.

I want to build: POST /api/products that takes { name, price,
stock } and stores it in memory.

DO NOT write code yet. Give me a numbered list of the steps you
would follow, indicating which files you would create or touch
in each step.
```

**Step 2: implement step by step**

```
Perfect, now execute only step 1 of your plan: create the Zod
validation schema. Show me the code and wait for my confirmation
before continuing.
```

**Step 3: tests with edge cases**

```
Now generate Vitest tests for this endpoint. Include:
- happy path
- negative price
- non-integer stock
- empty name
- payload missing required fields
- payload with unexpected extra fields

Use supertest for the HTTP requests.
```

---

## Template 3 — Understanding unfamiliar code

```
I'm sending you a file from a repo I'm new to. I didn't write it.

[paste file or use @file in your IDE]

Answer in this order:
1. What does this file do in ONE sentence?
2. What are the public functions (entry points)?
3. Which other modules does it depend on? Who imports it?
4. If I change [X specific thing], what could break?
5. Are there code smells or obvious risks?

Be concise. Bullet points, not paragraphs.
```

---

## Template 4 — Safe refactor

```
I want to refactor this function to improve readability.
I do NOT want to change the behavior.

Current code:
[paste]

Task:
1. Before refactoring, list the expected inputs and outputs
2. Generate tests that capture the CURRENT behavior (even if
   it's weird or ugly) — this is my safety net
3. Only then propose the refactor
4. Confirm the tests from step 2 still pass with the
   refactored code
```

---

## Rules you must NOT forget

✅ **Always give context** — stack, file, what you're trying to achieve
✅ **Ask for reasoning before code** — "explain why" before "fix it"
✅ **Iterate 2-3 times** — the first answer is almost never the best
✅ **Read what it gave you before pasting** — if you don't get it, it's not yours
✅ **Verify invented functions and libraries** — the AI hallucinates names

❌ **Never paste credentials, API keys, or personal data**
❌ **Never accept huge refactors without prior tests**
❌ **Never ask "do it all at once"** — divide and conquer
