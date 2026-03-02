# Stop Feeding Your AI Everything.

**Engineering Insight · AI Systems Architecture**

*There's a smarter way to structure agent guidance — and once you see it, you can't unsee the waste happening everywhere else.*

---

## You're Paying for Instructions Your AI Never Reads

You've set up an AI agent for your dev team. Skill files for API docs, hotfixes, spec writing, component design. A `.CLAUDE.md` or `AGENTS.md` with project conventions. Everything carefully written, properly organised. The team is using it daily. It looks like it's working.

Now someone opens a session and types: **"write unit tests for `validateEmail()`."**

The agent produces decent tests in two minutes. Everyone moves on. But before it wrote the first `describe()` block, here is exactly what happened under the hood — silently, automatically, on every single request:

```
Step 1 — Session starts. Agent loads root instruction file:

AGENTS.md                              847 lines  ← always, every session
  ├─ Project coding conventions        ✓ relevant
  ├─ Git commit message format         ✗ not needed for a test
  ├─ Hotfix escalation policy          ✗ not needed for a test
  ├─ Platform spec template (full)     ✗ not needed for a test
  ├─ Deployment runbook                ✗ not needed for a test
  ├─ PR review checklist               ✗ not needed for a test
  └─ New developer onboarding guide    ✗ not needed for a test

Step 2 — Trigger matched. Agent loads skill file:

testing/SKILL.md                       312 lines  ← loaded on "test" trigger
  ├─ Unit test steps                   ✓ relevant
  ├─ Integration test guide            ✗ you asked for unit tests only
  ├─ E2E test setup walkthrough        ✗ you asked for unit tests only
  ├─ 18 full example test suites       ✗ you needed 1 pattern
  └─ Jest config troubleshooting       ✗ nothing is broken

Step 3 — Agent finally writes tests.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL LOADED:    1,159 lines
TOTAL NEEDED:      ~90 lines
WASTE:              92% — billed, loaded, ignored
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

And this wasn't a one-off. Every single task your team ran — rename a variable, update a doc comment, scaffold a new route, review a PR — began with 1,159 lines loading in the background. The agent wasn't consciously reading the hotfix policy when writing unit tests. But it was **present**. It coloured every response. It's the reason outputs felt slightly generic, slightly misaligned, like they were written for a different project than the one you actually have.

> **You asked for one focused thing. Your agent loaded an entire knowledge base. 92% of that context was pure noise — and you were billed for every token of it, on every request, every time anyone on your team opened a session.**

Multiply that by a team of eight engineers running fifteen sessions a day. You're not paying for AI assistance anymore. You're paying to repeatedly load a library no one asked for.

This is context bloat. It's not a prompting problem. It's not a model limitation. It's an **architecture problem** — and it has a clean architectural fix.

Enter the **3-Tier Layered Context Model.**

---

## Breaking Point: Outputs Start Drifting and Nobody Knows Why

The wasted tokens are the part you can measure. The degraded outputs are the part that actually hurts the team. And here's the cruel thing about context bloat: it doesn't fail loudly. There's no crash, no error, no obvious signal that something is wrong. It degrades quietly — and the symptoms look like team problems, not system problems.

- **Drift Signal 1:** Responses become generic "best practices" instead of the specific action you needed
- **Drift Signal 2:** The agent stops following steps in order — it improvises a path through the noise
- **Drift Signal 3:** Two people on the same team get meaningfully different answers for the identical prompt
- **Drift Signal 4:** The team starts debating prompt wording — trying to fix a system problem with better words

### Real-World Problem: "Hotfix" Mixes With "Standard Release" Because Both Live Everywhere

We asked:

> "Walk me through the production hotfix process."

The output looked plausible. Confident. Detailed. Step-numbered. It read like something you could hand to a junior engineer and have them follow. Until you tried to actually follow it.

Buried in the middle were steps from the standard release flow — change freeze windows, stakeholder sign-off, staged rollout percentages. None of that belongs in an emergency hotfix. But the agent had no way to know that, because hotfix guidance and release guidance were both present in its context simultaneously, with no clear boundary between them:

```
User: "Walk me through the production hotfix process."

Agent's context at the time of answering:
  AGENTS.md                ← hotfix escalation rules lived here (global)
  sdd/hotfix/SKILL.md      ← hotfix steps lived here (correct)
  shared-conventions.md    ← standard release steps, copied here "for reference"
  platform-spec/SKILL.md   ← loaded because trigger matched loosely

The agent had no canonical source to trust.
It averaged across all four. The output was a blend.

Result: plausible-looking. Step-numbered. Confident.
And wrong in the three places that matter most under pressure.

Nobody caught it in review. The failure surfaced in production.
```

That's the hidden cost of context bloat. Not just wasted tokens — **wasted trust.** An agent that averages across conflicting sources will always produce output that sounds authoritative and is subtly wrong. And subtle wrongness in a hotfix process is the most dangerous kind of wrong there is.

The 3-tier model eliminates this failure mode by design. Hotfix guidance lives in exactly one place. The root file routes to it. Nothing else loads. When you ask about hotfixes, you get hotfix answers — not a blend.

---

## The Core Idea Is Embarrassingly Simple

Think about how a good surgeon works. She doesn't walk into the operating room carrying every instrument in the hospital. She starts with a few core tools, asks for specific instruments as the procedure unfolds, and knows exactly where the specialized equipment lives.

Your AI agent should work the same way.

> *"An agent that loads everything knows nothing useful."*

The 3-Tier Layered Context Model organizes agent guidance into three distinct layers — each one loaded at a different moment, for a different reason. Stop front-loading everything. Start loading on demand.

---

### Tier 1 — The Router
**Loaded once per session · 53–70 lines**

A lean master file that maps trigger words to skill files. It's the agent's GPS: it knows where everything lives, but it doesn't carry the whole map in memory. Routers never grow. They contain exactly one line per skill, plus formatting — nothing more.

### Tier 2 — The Skill File
**Loaded when triggered · 54–130 lines**

A focused instruction file that tells the agent exactly what to do for a specific task. Step-by-step. Output format. Done condition. No bloat, no digressions. If it can't be said in 130 lines, something needs to move to Tier 3.

### Tier 3 — The Resource File
**Loaded on demand · 150–500 lines**

The detail layer — housing templates, full questionnaires, examples, and edge cases. Rich and comprehensive. But loaded *only* when the task actually needs it. A resource file can grow large; that's fine. The point is that it doesn't load unless it's asked for.

---

## What Bloat Looks Like in the Real World

Let's be specific, because vague warnings about "context bloat" don't stick. Concrete examples do.

### Real-World Example: The API Docs Skill

Imagine you're running a dev platform where agents help engineers write API documentation. You have one skill for this, triggered by the keyword **"api-docs"**.

In the *bloated* model, your skill file is a 450-line monolith. It contains every documentation template for every endpoint type, plus 40 example requests and responses, plus a style guide with 12 edge cases, plus onboarding notes for junior engineers.

When someone says "api-docs for my `/users` endpoint," your agent loads all 450 lines. The engineer gets their five-paragraph doc. The other 390 lines? Wasted.

```
// BLOATED MODEL — What actually gets loaded
api-docs/SKILL.md          450 lines ← EVERY TRIGGER
  ├─ Step 1 (needed)
  ├─ Step 2 (needed)
  ├─ All 40 example responses (3 used)
  ├─ REST template (used)
  ├─ GraphQL template (not used)
  ├─ gRPC template (not used)
  └─ Style guide appendix (not used)

10 triggers × 450 lines = 4,500 lines of overhead
~80% of it: never read by the agent
```

In the *3-tier model*, the skill file is 58 lines. It covers the five steps and links out to examples. Only when the engineer explicitly asks to see a GraphQL template does the resource file load. Otherwise? Done at 111 lines total.

```
// 3-TIER MODEL — What actually gets loaded
SKILLS.md                  53 lines ← loaded once
api-docs/SKILL.md          58 lines ← loaded on trigger
api-docs/resources/*.md    loaded only if detail requested

10 triggers × 111 lines = 1,110 lines baseline
Savings: 92% of baseline token cost
```

### Real-World Example: The Complex Platform Spec

Now flip the scenario. An architect is using your **"platform-spec"** skill to model a guest checkout flow. This *does* need deep detail — domain models, event schemas, API contracts, the full template.

The 3-tier model handles this gracefully. The skill file loads, the agent runs the first three steps without resources, then — when it needs to generate the Domain Model section — it loads the resource file. Right moment. Right content. No guesswork.

```
// MULTI-STEP LOAD — Detail pulled mid-task
SKILLS.md                         53 lines
sdd/SKILLS.md                     59 lines
sdd/platform-spec/SKILL.md       128 lines
  Steps 1–3 complete...
  Agent: "Need the Domain Model template"
resources/platform-spec-template.md  331 lines ← now loaded

TOTAL: 571 lines
BASELINE (without detail): 240 lines
Load what you need. Nothing else.
```

Full power when you need it. Lean baseline when you don't. That's the promise — and it delivers.

---

## The Problem Even Hit Our Own Instruction Files

Here's the part that tends to land hardest when we explain this model to teams: the bloat problem didn't just hit our skill files. It hit our **`.CLAUDE.md`** and **`AGENTS.md`** files too — the very files meant to instruct Claude how to behave in a project.

If you've worked with AI agents long enough, you've written one of these. It starts innocently: a few lines about the project's coding conventions, maybe a note on how to name files. Then someone adds the deployment process. Then the PR review checklist. Then the onboarding notes for new team members. Then the full test strategy. Before long, your `.CLAUDE.md` is 800 lines long — and Claude reads every single line of it at the start of *every session*, whether the session is fixing a typo or architecting a new service.

> **Claude is told "here are your project instructions." But what it actually receives is the equivalent of handing a surgeon the entire hospital manual before they're allowed to pick up a scalpel.**

We saw this directly. Our `.CLAUDE.md` had grown to contain: project architecture decisions, full git commit conventions, deployment runbooks, maintenance checklists, skill file templates, PR review criteria, onboarding flows, and troubleshooting guides. All of it loaded upfront. All of it present for a session where someone just wanted Claude to help rename a variable.

### Applying the 3-Tier Model to .CLAUDE.md

The fix was exactly what you'd expect: apply the same tiered thinking to the instruction file itself.

```
// BEFORE — Monolithic .CLAUDE.md
.CLAUDE.md                          847 lines ← loaded every session
  ├─ Project overview (needed)
  ├─ Coding conventions (sometimes needed)
  ├─ Git commit format (rarely needed)
  ├─ Full deployment runbook (almost never needed)
  ├─ PR review checklist (needed during reviews only)
  ├─ Onboarding guide (needed once, by new members)
  ├─ Maintenance checklists (needed monthly)
  ├─ Full skill file templates (needed when adding skills)
  └─ Troubleshooting guide (needed when things break)

Every session × 847 lines = constant overhead
~85% of it irrelevant to the task at hand
```

```
// AFTER — Tiered .CLAUDE.md
.CLAUDE.md                          ~90 lines ← Tier 1 router
  ├─ Project overview (always relevant)
  ├─ Output preferences (always relevant)
  ├─ Architecture summary (always relevant)
  └─ → docs/SKILL-GUIDE.md when adding skills
     → docs/DEPLOYMENT.md when deploying
     → docs/MAINTENANCE.md when auditing
     → docs/ONBOARDING.md for new team members

docs/SKILL-GUIDE.md                ~130 lines ← Tier 2, loaded on demand
docs/DEPLOYMENT.md                 ~200 lines ← Tier 2, loaded on demand
docs/MAINTENANCE.md                ~180 lines ← Tier 2, loaded on demand

Session fixing a variable rename:
  Loaded: 90 lines. That's it.

Session adding a new skill:
  Loaded: 90 + 130 = 220 lines. Exactly what's needed.
```

The same principle. The same result. Claude walks into every session carrying a sharp briefing — not a binder. When it needs the deployment runbook, it knows exactly where to find it. When it's just fixing a bug, it never has to read it at all.

This is also why `AGENTS.md` files — used by frameworks like AutoGPT, CrewAI, and others to define agent behavior — suffer identically. A monolithic `AGENTS.md` that defines every agent's full persona, capabilities, constraints, examples, and edge cases gets loaded in full for every task, by every agent. Apply the 3-tier model: slim the `AGENTS.md` to routing and essential rules, push capability detail to per-agent files, push examples and edge cases to resource files. The gains are the same.

**The lesson:** the 3-tier model isn't a skill-file pattern. It's a thinking pattern. Apply it wherever instructions accumulate — and they will always accumulate.

---

## The Root Cause: We Were "Helpful" in the Wrong Places

Here's the thing about context bloat — it never happens because someone was careless. It happens because everyone was *trying to help*. Two well-intended patterns combined into a mess:

**Pattern 1:** Our root `AGENTS.md` / `.CLAUDE.md` had grown into a mini playbook library. Every time someone thought "Claude should know about this," they added it to the root file. It felt like the right call every single time.

**Pattern 2:** Several `SKILL.md` files had become long and template-heavy. Adding a template inline felt more convenient than creating a separate resource file — so that's what people did, over and over.

### Real-World Problem: Root File Pollution Is Permanent Pollution

Because `AGENTS.md` is loaded every session, anything you add there becomes background noise for **every** task — forever. Our root doc wasn't just "global rules" anymore. It contained workflow details, templates, examples, and policy reminders that belonged to specific contexts.

So even a simple API docs request began with the agent already "thinking about" hotfix governance, platform spec conventions, and onboarding procedures it had no business knowing about for that task.

```
// What was in our root AGENTS.md — and what it contaminated

AGENTS.md contained:
  ├─ Global coding rules           ← relevant everywhere
  ├─ Hotfix workflow details       ← relevant 2% of sessions
  ├─ Platform spec templates       ← relevant 5% of sessions
  ├─ PR review checklist           ← relevant during reviews only
  ├─ Onboarding policy reminders   ← relevant to new members only
  └─ Incident response examples    ← relevant when things break only

User: "Generate API docs for /users"
Agent context already contains: hotfix templates, incident examples,
onboarding policies. None of it requested. All of it present.
```

The model's diagnosis is blunt and accurate: big upfront context creates noise, and noise creates generic outputs. The agent isn't lazy — it's overwhelmed. It starts averaging across everything it was handed instead of focusing on what the task actually needs.

---

## Let's Talk Numbers

Because architecture decisions live or die by measurable outcomes, not elegant theory.

| Metric | Value |
|---|---|
| Baseline token reduction | **92%** |
| Skills refactored | **19** |
| Resource files created | **16** |
| Average lines per skill file | **85** |
| Skill file size range | **54–118 lines** |

The 92% baseline reduction is the headline, but the precision gain matters just as much. When an agent's context is 111 focused lines instead of 700 mixed ones, its outputs are sharper. Fewer hallucinations. Less context confusion. The agent is reading a sharp briefing, not wading through a bureaucratic binder.

And when you do need the full depth? You get it. The resource files are comprehensive — 150 to 500 lines of rich detail — and they're right there waiting. You're not trading depth for efficiency. You're unlocking both simultaneously.

---

## Keeping the System Healthy Over Time

Here's the uncomfortable truth about any architecture: it will drift if you let it. Engineers add content inline. Skill files grow. Routers accumulate explanation. Six months later, you're back to the bloat you started with.

The 3-tier model comes with clear health signals — so you always know where you stand.

### 🟢 Green — System is Healthy
- Routers: 50–70 lines
- Skill files: 54–130 lines
- Resources: 150–500 lines
- Zero broken links
- Maintenance completed less than 1 month ago

**Action:** Monthly checks. Nothing urgent.

### 🟡 Yellow — Attention Needed
- Router: 80–100 lines
- Skill file: 130–180 lines
- Resource file: 450–550 lines
- 1–2 broken links
- Maintenance overdue by 1–2 months

**Action:** Schedule extraction/refactoring within two weeks.

### 🔴 Red — Critical Issues
- Router: 100+ lines
- Skill file: 180+ lines
- Resource file: 800+ lines
- 3+ broken links
- Maintenance overdue by more than a month

**Action:** Immediate intervention. Refactoring sprint now.

---

### The Monthly 15-Minute Habit

Real-world example: your platform team ships a new **"hotfix"** skill in November. By January, two engineers have added inline templates and a decision flowchart directly to the skill file. It's now 190 lines. Red zone.

The fix is straightforward: extract the templates to `resources/hotfix-templates.md`, replace the inline content with a single link, verify the skill file drops back under 100 lines. Twenty minutes of work. System health restored.

Run a monthly size check — it takes 15 minutes and catches drift before it becomes a refactoring sprint:

```bash
# Monthly check — paste and run
wc -l internal/skills/packs/SKILLS.md
# Should be ~53 lines

find internal/skills/packs -name "SKILL.md" \
  -exec wc -l {} + | sort -rn | head -5
# All should be < 130 lines

find internal/skills/packs -path "*/resources/*.md" \
  -exec wc -l {} + | awk '$1 > 500 {print}'
# Flag any resources over 500 lines for splitting
```

Three commands. One habit. Healthy system indefinitely.

---

## The Question Every Developer Needs to Ask

When you're adding new content to the system, there's one question that cuts through all the ambiguity:

**"Does this fit in one or two sentences?"**

If yes — it lives in Tier 2. The skill file. Keep it there.

If no — it gets extracted to Tier 3. A resource file. Linked from the skill file. Available on demand.

That's the entire decision framework. Let's make it concrete:

**Q: What are the three phases of our openspec process?**
One sentence answer: "Phase 1: Requirements, Phase 2: Design, Phase 3: Review." → **Tier 2.**

**Q: Can you show me the full Phase 1 requirements questionnaire?**
Needs 40+ lines of structured questions. → **Tier 3.** Lives in `resources/phases.md`, linked from the skill file.

**Q: Here's an example of a complete API response for a nested object.**
It's an example. Long by nature. → **Tier 3.** Always. No exceptions.

Once you internalize this decision, you'll catch bloat before it happens. Not after.

---

## This Isn't Just About Tokens

Yes, the 92% baseline token reduction is real and meaningful — especially at scale, where every trigger is a cost center. But reducing the model to a cost-saving measure undersells it.

This architecture makes your AI system more honest. An agent reading 58 focused lines knows exactly what it's supposed to do. An agent reading 700 mixed lines is guessing what matters. The precision difference shows up in output quality, in edge case handling, in fewer "I think you might mean..." hedges.

It also makes your system more maintainable. When every skill file is under 130 lines and every resource file has a clear purpose, your team can navigate, update, and extend the system confidently. No one-file monoliths that everyone fears touching. No mystery content buried 300 lines down.

---

> ## The Golden Rule
> *"Load what you need, nothing else."*

---

Apply it consistently and two things happen: your AI gets sharper, and your engineering costs drop. That's a trade-off worth making — except it isn't really a trade-off at all. It's just better engineering.

The 3-tier model is documented, production-ready, and waiting. The only thing left is to start using it.

---

*Part of an ongoing series on building efficient, precise AI-powered development workflows.*
