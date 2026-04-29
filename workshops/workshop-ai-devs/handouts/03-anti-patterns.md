# Handout 3 — Anti-patterns (what NOT to do)

> If you find yourself doing anything on this list, stop and rethink your prompt.

---

## 🚫 1. "It's not working, fix it"

**Why it's bad:** the AI doesn't know what stack you use, what you expected, or what happened. It's going to give you a generic answer that probably doesn't apply.

**Do this instead:**
> "Stack: TS + Express. I expect it to return an array, but I get `{}`. Here's the code and the log: [...]. Identify the root cause and explain why it happens before proposing a fix."

---

## 🚫 2. Accepting the first answer without reading it

**Why it's bad:** the AI's first answer is usually generic or incomplete. If you paste it without reading, you're programming with your eyes closed.

**Golden rule:**
> If you can't explain to a coworker what every line of what the AI gave you does, **don't paste it yet**.

---

## 🚫 3. Asking for huge changes in one go

**Bad example:**
> "Build me the complete orders module: routes, controllers, validation, persistence, tests, documentation, and authentication."

**Why it's bad:** the AI will generate 500+ lines, 30% of them will be wrong, you won't understand them, and when something fails you won't know where to look.

**Do this instead:** split into steps. Ask for the plan first, then implement step by step, validating each one.

---

## 🚫 4. Trusting invented libraries or functions

**Why it's bad:** the AI sometimes "hallucinates" — it makes up function names, library methods, or npm packages that **don't exist**. Sometimes the code compiles, sometimes it doesn't, and it always wastes your time.

**Do this instead:**
- If the AI uses a function you don't recognize → check the official documentation
- If the AI imports a package → search npmjs.com before installing it
- Ask directly: "does this function exist in version X of library Y? Cite the documentation."

---

## 🚫 5. No rules file

**Why it's bad:** every conversation starts from zero. You have to repeat "we use strict TypeScript, validation with Zod, tests with Vitest, no `any`..." every time.

**Do this instead:** create your `CLAUDE.md` / `.github/copilot-instructions.md` / `.windsurfrules` **once** and the AI honors it automatically in every interaction.

---

## 🚫 6. Pasting credentials, tokens, or sensitive data

**Why it's bad:** depending on the plan, that content can be used to train models, ends up in logs, or is shared with third parties. It's a real security risk.

**Never paste:**
- API keys, tokens, secrets
- Connection strings with passwords
- Personal user data (PII)
- Client code under NDA without authorization

**Do this instead:** swap them with placeholders (`API_KEY = "xxxxx"`) before pasting.

---

## 🚫 7. Using the wrong tool for the job

| Task | Bad use | Better option |
|---|---|---|
| Autocomplete a function | Claude Code in terminal | Inline Copilot |
| Refactor 10 files | Copilot | Claude Code or Windsurf |
| Understand a new repo | Read line by line | Claude Code "explain this module" |
| Generate repetitive boilerplate | Write by hand | Copilot |

---

## 🚫 8. Not iterating

**Bad example:**
> Ask for a test → AI gives something acceptable → you paste it → done.

**Better:**
> Ask for a test → AI gives something → read it → "add cases for empty input and invalid types" → AI improves it → read it → "now simplify using a shared setup" → confirm → paste.

Iteration is where the real value is.

---

## 🚫 9. Not verifying the output

**Why it's bad:** "it compiles" doesn't mean "it works". "Passes the tests the AI wrote" doesn't mean "it's correct" — the AI may have written tests that validate its own broken implementation.

**Do this instead:**
- Run the tests yourself
- Try the endpoint with real data
- Read the code before committing
- Ask yourself: "what happens if the input is unexpected?"

---

## 🚫 10. Treating the AI as absolute truth

The AI can be:
- **Out of date** (its training data has a cutoff)
- **Confidently wrong** (it tells you like it's the truth)
- **Biased** toward popular patterns even if they're not the best for your case

**Do this instead:** treat it like a very fast but sometimes distracted senior coworker. Useful, but not infallible.

---

## The master rule

> 🧠 **You are responsible for the code you commit. The AI doesn't sign the PR.**

If you get paged at 3am because something broke in production, "the AI told me so" is not a valid excuse.
