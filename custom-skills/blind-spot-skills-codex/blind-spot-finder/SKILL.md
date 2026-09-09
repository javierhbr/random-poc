---
name: blind-spot-finder
description: Identify the smallest number of material considerations missing from the current frame of an idea, plan, task, proposal, article, paper, decision, design, or other artifact. Use assumptions, outsider perspectives, adaptive premortems, adversarial review, success stress tests, and explicit dispositions.
---

# Blind Spot Finder

## Purpose

Find important considerations the author has not seen, stated, tested, or consciously excluded.

Do not primarily summarize, rewrite, or critique what is already present.

Focus on:

> What is important but absent from the current frame?

A blind spot is a missing consideration that could materially change the decision, implementation, interpretation, outcome, risk, or credibility of the artifact.

## Optimization Rule

> Find the smallest number of missing considerations with the greatest potential to change the outcome.

Generate broadly. Report narrowly.

Default final budget: **3–7 material blind spots**. Report fewer when fewer are sufficient. Never invent findings to fill the budget.

## Core Flow

Use:

**UNDERSTAND → DISCOVER → CHALLENGE → STRESS → FILTER → PRIORITIZE → DECIDE**

1. Understand the artifact, objective, audience, constraints, scope, known facts, assumptions, and unknowns.
2. Identify the current frame and what must be true for it to hold.
3. Explore relevant blind-spot lenses.
4. Run an artifact-aware premortem and success stress test.
5. For important artifacts, use independent subagents for isolated discovery and adversarial review.
6. Filter candidates by materiality and compress findings to root causes.
7. Force a disposition for every material finding.

## Information States

Classify missing context as:

- **KNOWN** — explicitly supported.
- **ASSUMED** — expected or required to be true but not established.
- **INFERRED** — reasonably derived but not explicit.
- **UNKNOWN** — cannot be determined.

Never silently convert UNKNOWN into ASSUMED.

## Core Questions

Ask:

> What must be true for this to work?

> What happens if that assumption is false?

> What would a smart outsider ask that the author would be surprised they had not considered?

> What would make someone say, “This looks great, but what about ___?”

> If this succeeds much more than expected, what new problem appears?

## Dispositions

Every material blind spot must end in one recommended disposition:

- **RESOLVE** — investigate or change the artifact before proceeding.
- **ASSUME** — proceed with an explicit documented assumption.
- **OUT OF SCOPE** — consciously exclude it and state the boundary.
- **ACCEPT RISK** — acknowledge it and intentionally proceed.

Never end a major finding with only “something to think about.”

## Output

Return:

1. **Understanding** — artifact, objective, audience, current frame, confidence.
2. **Top Blind Spots** — severity, why it matters, hidden assumption/unknown, consequence, disposition, suggested action or scope statement.
3. **Hidden Assumptions** — only material ones.
4. **Premortem** — artifact-aware failure scenario.
5. **Success Stress Test** — blind spots exposed by unexpected success.
6. **Strongest Independent Challenge** — when orchestration is used.
7. **Outsider Questions** — only high-value questions.
8. **Recommended Decisions** — smallest set needed before proceeding.
9. **Verdict** — one of:
   - No material blind spots found
   - Safe with explicit assumptions
   - Important blind spots should be resolved
   - Critical blind spot threatens the approach

## Runtime References

Load only what is needed:

- `references/lenses-and-tests.md` — detailed discovery lenses and adaptive tests.
- `references/orchestration.md` — subagent roles, isolation boundaries, context contracts, and synthesis flow.
- `references/materiality-and-output.md` — prioritization, blind-spot budget, root-cause compression, severity, and output contract.

For small artifacts, the core skill may be sufficient. For high-impact work, architecture, strategy, publication, or ambiguous artifacts, load the orchestration reference.

## Behavioral Rules

Be skeptical without being cynical.

Do not manufacture criticism.

Do not confuse optional improvement with a blind spot.

Do not turn every unknown into a blocker.

Do not expand scope unnecessarily.

Explicitly excluded scope is not a blind spot unless the exclusion creates a material contradiction.

Prefer findings that could change a decision over findings that merely add detail.

If no material blind spots exist, say so.
