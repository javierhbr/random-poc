# Blind Spot Skills

A small skill package for finding **material considerations that are missing from the current frame** of an artifact before those omissions become decisions, implementation behavior, publication problems, or operational risk.

The package contains two skills:

1. **`blind-spot-finder`** — general-purpose blind-spot analysis for ideas, plans, tasks, proposals, articles, papers, decisions, architecture, and other artifacts.
2. **`spec-blind-spot`** — specialized blind-spot analysis for specifications created under Spec-Driven Development (SDD).

---

# Why this exists

Most review prompts ask an AI to critique, improve, or summarize an artifact. That often produces a long list of possible improvements, but it does not reliably answer the harder question:

> What is important here that is absent from the current frame?

These skills optimize for a different outcome:

> **Find the smallest number of missing considerations with the greatest potential to change the outcome.**

That rule is called the **Blind Spot Budget**.

The skills are intentionally allowed to conclude that no material blind spots exist.

---

# Three-Layer Pattern

The package follows a three-layer pattern designed to keep runtime context small while preserving deep methods when they are needed.

```text
Layer 1 — SKILL.md
    Core purpose, rules, execution flow, output contract

Layer 2 — references/*.md
    Detailed methods loaded only when relevant

Layer 3 — README / examples
    Human documentation, architecture, usage, examples
```

## Why split the skill this way?

A small artifact may need only the core skill. A complex architecture proposal may need adversarial orchestration. An SDD specification may need producer/consumer analysis and an Independent Implementer pass.

Keeping the details in references allows an agent to load only the context required for the current job.

---

# Package Structure

```text
blind-spot-skills/
├── README.md
├── blind-spot-finder/
│   ├── SKILL.md
│   └── references/
│       ├── lenses-and-tests.md
│       ├── orchestration.md
│       └── materiality-and-output.md
└── spec-blind-spot/
    ├── SKILL.md
    └── references/
        ├── spec-analysis.md
        ├── orchestration.md
        └── materiality-and-output.md
```

---

# 1. Blind Spot Finder

## What it does

`blind-spot-finder` can analyze:

- ideas
- plans
- tasks
- proposals
- architecture
- decisions
- articles
- social posts
- papers
- strategies
- designs
- other structured or unstructured artifacts

It does not primarily ask whether the artifact is good or bad. It asks what the artifact's current frame may be preventing the author from seeing.

## How it works

The core flow is:

```text
UNDERSTAND
    ↓
DISCOVER
    ↓
CHALLENGE
    ↓
STRESS
    ↓
FILTER
    ↓
PRIORITIZE
    ↓
DECIDE
```

The analysis may inspect framing, assumptions, actors, dependencies, evidence, ambiguity, incentives, failure conditions, second-order effects, ownership, reversibility, and scope.

The final result is filtered through the Blind Spot Budget.

Each material finding must end in a disposition:

```text
RESOLVE
ASSUME
OUT OF SCOPE
ACCEPT RISK
```

## Adaptive premortem

The skill changes the premortem according to the artifact.

For an article:

> Imagine knowledgeable readers strongly reject, misunderstand, or challenge the article. What did the author overlook?

For a task:

> Imagine the task was marked complete, but the desired outcome wasn't achieved. What was missing?

For a plan:

> Imagine the plan was executed as written but the desired outcome was not achieved. What was missing?

For a technical design:

> Imagine the implementation matches the design but creates operational, security, scalability, organizational, or maintenance problems. What did the design fail to consider?

---

# 2. SDD Spec Blind Spot

## What it does

`spec-blind-spot` analyzes specifications that will become authoritative inputs to planning and implementation.

Its central question is:

> **If a competent implementation team followed this spec literally, what important behavior, decision, contract, or constraint would they still have to invent?**

The skill treats material decisions that must be guessed as **specification debt**.

## What it inspects

The detailed SDD analysis can inspect:

- objective and intended outcome
- bounded context
- actors
- inputs and outputs
- producers and consumers
- dependencies
- contracts
- invariants
- state
- failure behavior
- retries and duplicates where relevant
- ownership
- compatibility
- acceptance criteria
- traceability
- non-functional constraints
- explicit assumptions
- explicit scope

A critical question is:

> Could two competent teams implement this specification differently while both believing they complied?

If the answer is yes and the difference is material, the spec contains a blind spot or ambiguity.

---

# Orchestration

The package supports independent subagent passes for higher-confidence analysis.

The purpose is not to create more agents for its own sake. The purpose is to reduce anchoring and confirmation bias.

```text
                     Original Artifact
                            │
                            ▼
                     Orchestrator
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
     Context Scout      Premortem         Adversary
                          Agent          Fresh Context
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                       Candidate Pool
                            │
                            ▼
                        Synthesizer
                            │
                  Materiality + Budget
                            │
                            ▼
                         Decision
```

## Context independence

The adversarial agent should **not** receive the findings produced by other agents.

For example, do not tell it:

```text
Another reviewer thinks governance is missing.
Another reviewer found a scalability issue.
```

Instead give it the original artifact, objective, necessary constraints, and scope.

This allows convergence to emerge independently rather than through priming.

## Model selection

The recommended priority is:

```text
context independence
    > prompt/role diversity
    > model diversity
```

Using the same strong model in separate fresh contexts can be more useful than using different models that all inherit the same analysis history.

When different capability levels are available:

- extraction/context mapping → fast capable model
- candidate discovery → strong reasoning model
- premortem → strong model, fresh context
- Independent Implementer → strong coding/reasoning model, fresh context
- adversary → strongest practical reasoning model, strict isolation
- synthesis → strong reasoning model

---

# Independent Implementer for SDD

This is the most important specialized subagent in `spec-blind-spot`.

Instead of asking:

> Review this spec and tell me what is missing.

ask:

> You are responsible for implementing this specification literally. Do not improve or redesign it. Whenever the spec forces you to make an unstated material decision, record that decision. Report only decisions whose ambiguity could produce materially different implementations, behavior, contracts, or outcomes.

This changes the cognitive task from **critique** to **implementation simulation**.

Example spec:

```text
When an order completes, publish OrderCompleted.
```

During implementation simulation, the agent may discover that it must invent answers to questions such as:

- Can the event be delivered more than once?
- Does ordering matter?
- Who owns the event schema?
- What happens if state persistence succeeds but publishing fails?
- What compatibility guarantees exist for consumers?

Those are candidate spec blind spots rather than decisions that should be silently invented in code.

---

# Example Prompts

## General plan

```text
Use blind-spot-finder on the following rollout plan.

I do not want a generic critique. Find only the smallest number of
missing considerations that could materially change the outcome.

For each one recommend Resolve, Assume, Out of Scope, or Accept Risk.

<plan>
...
</plan>
```

## Article

```text
Analyze this article with blind-spot-finder.

Use the article-aware premortem:
"Imagine knowledgeable readers strongly reject the article.
What did the author overlook?"

Prioritize unsupported assumptions, missing perspectives, and claims
that could materially damage the article's argument.

<article>
...
</article>
```

## Architecture proposal

```text
Run an orchestrated blind-spot analysis on this architecture proposal.

Use independent fresh-context passes for the premortem and adversarial
review. Do not expose earlier findings to the adversarial reviewer.

Return no more than the highest-value blind spots unless additional
critical findings would be misleading to omit.
```

## SDD spec

```text
Use spec-blind-spot on this component specification before planning.

Run the Independent Implementer test in fresh context.

The primary question is:
"What material decisions would an implementer still be forced to invent?"

Also identify whether two competent implementers could conform to this
spec while producing materially different behavior.

<spec>
...
</spec>
```

---

# Example General Output

```markdown
# Blind Spot Analysis

## Understanding
Artifact: Rollout Plan
Objective: Migrate teams to the new extension model
Current frame: Adoption is primarily a technical migration problem
Confidence: High

## Top Blind Spots

### CRITICAL — Adoption ownership is undefined

Why it matters:
The plan defines the technical migration but no accountable owner for
moving teams through it.

Hidden assumption:
Teams will independently prioritize the migration.

What changes if this is wrong:
The platform can be technically ready while adoption remains stalled.

Recommended disposition:
RESOLVE

Suggested action:
Define accountable migration owners and completion criteria before rollout.

### IMPORTANT — Backward compatibility is assumed but not stated
...

## Premortem
The rollout completed technically but failed to reach adoption because
team incentives and ownership were never part of the migration model.

## Strongest Independent Challenge
The proposal treats extensibility as a technical contract problem while
the most difficult constraint may actually be governance of contract evolution.

## Recommended Decisions
1. Define migration ownership.
2. State compatibility guarantees.
3. Explicitly exclude unsupported legacy integrations.

## Verdict
Important blind spots should be resolved.
```

---

# Example SDD Output

```markdown
# SDD Spec Blind Spot Analysis

## Spec Understanding
Type: Component specification
Objective: Publish OrderCompleted when an order reaches completed state
Bounded context: Order Management

## Top Blind Spots

### CRITICAL · MISSING CONTRACT — Delivery semantics are undefined

Missing or ambiguous:
The spec requires publishing OrderCompleted but does not define whether
delivery can be duplicated.

Why it matters:
Consumers may implement non-idempotent side effects.

Implementation decision currently left open:
The implementer must invent retry and duplicate behavior.

Potential divergent implementations:
One implementation may retry indefinitely while another may drop the
event after the first failure.

Recommended disposition:
RESOLVE

Suggested spec change:
Define the expected delivery semantics and consumer idempotency contract.

## Implementation Invention Test

The implementer is currently forced to invent:
- retry behavior
- duplicate semantics
- publish failure handling
- schema ownership

## SDD Premortem
The implementation passed acceptance tests because the happy-path event
was published, but production consumers processed duplicate events and
created duplicate downstream actions.

## Verdict
NEEDS CLARIFICATION
```

---

# Runtime Reference Loading

A recommended runtime strategy is:

## Small artifact

Load only:

```text
SKILL.md
```

## Important general artifact

Load:

```text
SKILL.md
references/lenses-and-tests.md
references/materiality-and-output.md
```

## High-impact or adversarial general artifact

Also load:

```text
references/orchestration.md
```

## SDD specification

Load:

```text
spec-blind-spot/SKILL.md
references/spec-analysis.md
references/materiality-and-output.md
```

If the spec drives implementation or agents, also load:

```text
references/orchestration.md
```

---

# Design Principles

1. **Missing > imperfect** — focus on absent considerations, not cosmetic improvement.
2. **Materiality > completeness** — a shorter high-impact analysis is better.
3. **Explicit decisions > vague warnings** — Resolve, Assume, Out of Scope, or Accept Risk.
4. **Independent discovery > repeated confirmation** — isolate adversarial passes.
5. **Context independence > model diversity** — fresh context matters more than changing model names.
6. **Implementation invention is specification debt** — especially in SDD.
7. **Out of scope is valid** — when it is conscious and explicit.
8. **No blind spot is a valid result** — never manufacture criticism.

---

# Suggested Installation

Copy each skill directory into the location used by your agent harness for custom skills.

Keep the directory structure intact so the `SKILL.md` can reference its `references/` files using relative paths.

```text
<skills-root>/blind-spot-finder/
<skills-root>/spec-blind-spot/
```

The package does not assume a particular agent framework. The same structure can be adapted to Codex, Claude Code, custom agent harnesses, or other systems that support skill instructions and runtime-loaded references.
