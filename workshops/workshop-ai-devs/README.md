# Workshop: AI for Junior Devs with Copilot, Claude Code, and Windsurf

> Stack: **TypeScript + Node.js (Express)**
> Duration: **2 hours**
> Audience: **Junior developers** (1–3 years of experience)
> Tools: **GitHub Copilot, Claude Code, Windsurf**

---

## 🎯 Goal

By the end of the workshop, each participant should be able to:

1. Recognize when they're misusing an AI tool (anti-patterns).
2. Configure **rules files** and **skills** so the AI knows their project.
3. Structure prompts with minimum viable context using the **CIVR** framework.
4. Apply AI to real tasks: debugging, building features with tests, understanding unfamiliar code, and refactoring safely.
5. Tell when to use **Copilot** (autocomplete), **Claude Code** (terminal agent), or **Windsurf** (agentic IDE).

---

## 📂 Workshop structure

```
workshop/
├── README.md                              ← you are here
├── facilitator-guide/
│   └── 00-facilitator-guide.md            ← full agenda with timing and notes
├── handouts/
│   ├── 01-civr-framework.md               ← the 4 rules + prompt templates
│   ├── 02-tools-cheatsheet.md             ← when to use each tool
│   └── 03-anti-patterns.md                ← what NOT to do
├── exercises/
│   ├── 01-async-debugging.md              ← async/await bug
│   ├── 02-feature-endpoint.md             ← build endpoint with tests
│   ├── 03-understand-code.md              ← onboarding to unfamiliar code
│   └── 04-safe-refactor.md                ← refactor with a safety net
├── rules-and-skills/
│   ├── 01-what-are-rules-and-skills.md    ← key concepts
│   ├── 02-copilot-instructions.md         ← .github/copilot-instructions.md
│   ├── 03-claude-md.md                    ← CLAUDE.md for Claude Code
│   ├── 04-windsurfrules.md                ← .windsurfrules
│   └── 05-reusable-skills.md              ← how to build your own skills
└── slides/
    └── slides-outline.md                  ← deck outline for presenting
```

---

## 🛠️ Prerequisites for participants

Before the workshop, each dev should have:

- Node.js 20+ and npm installed
- An editor with **at least one** of these tools:
  - **GitHub Copilot** (extension for VS Code, JetBrains, or Neovim)
  - **Claude Code** (`npm install -g @anthropic-ai/claude-code`)
  - **Windsurf** (download from windsurf.com)
- Workshop repo cloned:
  ```bash
  git clone <workshop-repo-url>
  cd workshop-ai-devs && npm install
  ```
- An active account on at least one of the tools

---

## 📋 Quick agenda (2 hours)

| Time    | Block                                         | Type           |
| ------- | --------------------------------------------- | -------------- |
| 0:00    | Intro + live prompt contrast                  | Demo           |
| 0:15    | The 3 tools: when to use each                 | Short theory   |
| 0:25    | Rules files and skills: give your AI memory   | Theory + demo  |
| 0:40    | **Exercise 1** — Debugging with CIVR          | Hands-on       |
| 1:05    | **Exercise 2** — Feature + tests              | Hands-on       |
| 1:35    | **Exercise 3** — Understand unfamiliar code   | Hands-on       |
| 1:50    | Anti-patterns + closing + Q&A                 | Discussion     |
| 2:00    | End                                           |                |

> **Exercise 4 (Safe refactor)** is optional / bonus if there's spare time, or it can be left as homework.

---

## 💡 Workshop philosophy

- **70% practice, 30% theory.** Juniors learn by doing.
- **Let them fail first.** The contrast between a bad prompt and a good one has to be lived, not explained.
- **Pairs, not solo.** One writes the prompt, the other critiques. They rotate.
- **Real stack.** Everything in TypeScript + Node, no toy examples.
- **No abstract "agents".** We talk about concrete habits they can apply tomorrow.
