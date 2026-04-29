# Slide deck — outline for presenting

> Markdown outline ready to convert to `.pptx`, Google Slides, Keynote, or whatever you prefer. Each `##` is a slide.

---

## Slide 1 — Cover

**AI for Junior Devs**
*From passive user to productive operator*

Hands-on workshop · 2 hours
Stack: TypeScript + Node.js
Tools: Copilot · Claude Code · Windsurf

---

## Slide 2 — Why this workshop

**You didn't come here to learn what AI is.**
You came here to learn how to use it well.

- 70% practice
- 30% theory
- 0% empty buzzwords

---

## Slide 3 — What you take home

By the end you'll be able to:

1. Recognize when you're misusing AI
2. Configure rules files so the AI knows your project
3. Apply the **CIVR** framework to any prompt
4. Tell Copilot, Claude Code, and Windsurf apart
5. Solve real tasks: debugging, features, tests, refactor

---

## Slide 4 — Live demo: the contrast

Same bug. Two prompts.

**Prompt A:**
> "it's not working, fix it"

**Prompt B:**
> "Stack: TS + Express. The endpoint returns `orders: {}` in production when it should be an array. Tests pass. Identify root cause, explain why it happens, propose minimal fix."

*(Do the live demo here)*

---

## Slide 5 — What was different?

Open question to the group.

*(Collect answers in the shared doc)*

Spoiler of what they should say:
- Stack context
- Specific symptom
- Asked for reasoning, not just the fix
- Scoped the change

---

## Slide 6 — The 3 tools

| | Copilot | Claude Code | Windsurf |
|---|---|---|---|
| **Lives in** | Inline editor | Terminal | Full IDE |
| **Best for** | Autocomplete | Multi-file tasks | Pair programming |
| **Rules file** | `.github/copilot-instructions.md` | `CLAUDE.md` | `.windsurfrules` |

> Not competitors. Different tools for different moments.

---

## Slide 7 — Practical decision rule

```
How many files am I going to touch?

  1 file, small change          →  Copilot
  Multiple coordinated files    →  Claude Code or Windsurf

Do I need it to run commands for me?

  Yes  →  Claude Code or Windsurf
  No   →  any of them works
```

---

## Slide 8 — The problem: the AI doesn't know your project

Every new conversation, the AI starts from zero.

It doesn't know:
- What stack you use
- What conventions your team follows
- Which libraries are forbidden
- How to structure new files

**Result:** you fix the style every time.

---

## Slide 9 — The solution: rules files

A file at the root of your repo that the AI reads automatically.

| Tool | File |
|---|---|
| Copilot | `.github/copilot-instructions.md` |
| Claude Code | `CLAUDE.md` |
| Windsurf | `.windsurfrules` |

**Once. Applies forever.**

---

## Slide 10 — Anatomy of a rules file

A good rules file answers:

1. **What is** this project?
2. **What stack** does it use?
3. **How is** the code organized?
4. **What conventions** do we follow?
5. **What do we avoid**?
6. **How do you run** the commands?

---

## Slide 11 — Demo: same prompt, two results

**Without rules file:**
> Any code that looks reasonable

**With rules file:**
> Code that follows your conventions, in the right files, with your validation library, and with tests in your team's style.

*(Live demo)*

---

## Slide 12 — Skills (quick concept)

**Rules file** = the Constitution
> General conventions, always loaded

**Skills** = specific laws
> Procedures by topic, loaded on demand

Example skill: "How to add a DB migration"

> Don't obsess over this at first. **Start with your rules file.**

---

## Slide 13 — CIVR framework

| Letter | Means |
|---|---|
| **C** | **C**ontext — stack, file, what you're trying to do |
| **I** | **I**nput — code, error, logs |
| **V** | **V**alidate — ask for reasoning before the fix |
| **R** | **R**efine — iterate at least 2-3 times |

---

## Slide 14 — 🛠️ Exercise 1: Debugging

**The bug:** an endpoint returns `orders: {}` instead of an array.

**Task:**
1. First, try with a deliberately bad prompt
2. Then, rewrite using CIVR
3. Compare results

⏱️ **25 minutes** · 👥 In pairs

*(Open `exercises/01-async-debugging.md`)*

---

## Slide 15 — Debrief Exercise 1

- Which prompt worked better?
- Which part of CIVR did you forget at first?
- *(Stick the best prompts on the shared wall)*

---

## Slide 16 — Iterative 3-step flow

For building features:

```
1. PLAN    "Before writing code, give me the steps"
2. BUILD   Implement step by step, validating each
3. TEST    "Generate tests with edge cases"
```

> DO NOT ask "build me the whole endpoint". That's professional suicide.

---

## Slide 17 — 🛠️ Exercise 2: Feature + tests

**Task:** build `POST /api/products` with validation, persistence, and tests.

**Game rules:**
- Follow the 3 steps in order
- Don't tell the AI "do it all"
- Read each step before moving to the next

⏱️ **30 minutes** · 👥 In pairs

---

## Slide 18 — Debrief Exercise 2

- At what step did the plan surprise you?
- Did you have to fix anything?
- How many edge cases did the AI find that you wouldn't have thought of?

---

## Slide 19 — The most underrated use case

**Using AI to understand code you DIDN'T write.**

Next time you land on a new repo, don't read line by line. Ask the AI:

1. What does this file do in one sentence?
2. What are the public functions?
3. If I change X, what breaks?
4. Are there code smells?

---

## Slide 20 — 🛠️ Exercise 3: Understand unfamiliar code

We give you a ~120-line file you've never seen.

Your task: answer those 4 questions using only the AI, **without reading line by line**.

⏱️ **15 minutes** · 👥 In pairs

---

## Slide 21 — Anti-patterns (what NOT to do)

❌ "It's not working, fix it"
❌ Accepting the first answer without reading it
❌ Asking for huge changes in one go
❌ Trusting functions invented by the AI
❌ Not having a rules file
❌ Pasting credentials or sensitive data
❌ Treating the AI as absolute truth

---

## Slide 22 — The master rule

> # "If you don't understand what the AI gave you, don't paste it."

You are responsible for the code you commit.
The AI doesn't sign the PR.

---

## Slide 23 — Plan for next week

Monday:
- [ ] Create `CLAUDE.md` (or whatever file your tool uses) in your main repo
- [ ] Try the prompt templates from the handout
- [ ] Do exercise 4 (safe refactor) as homework

Month 1:
- [ ] Build your first skill / workflow
- [ ] Share your best prompt with the team

---

## Slide 24 — Resources

📁 **Workshop repo:** [link]
📄 **Handouts:** CIVR framework, tools cheatsheet, anti-patterns
📚 **Official docs:**
- Copilot: docs.github.com/copilot
- Claude Code: docs.claude.com/claude-code
- Windsurf: docs.windsurf.com

📌 **Workshop prompt wall:** [link to shared doc]

---

## Slide 25 — Q&A

Questions?

*(Max 5 minutes. What we don't answer here goes to the team channel.)*

---

## Slide 26 — Closing

**If you take only ONE thing from today:**

# Set up your rules file on Monday.

It's the highest-impact, lowest-effort change you can make.

---

## Notes for the facilitator (DO NOT show)

- **Pace:** slides 1-13 are quick (1-2 min each). The exercise slides (14, 17, 20) take the time.
- **Don't read the slides.** Tell them in your own words.
- **After each exercise**, ask 1-2 pairs to share their best prompt out loud.
- **If you're behind**, skip slide 12 (skills) and exercise 4 becomes homework.
- **If you're ahead**, add exercise 4 after exercise 3.
