---
name: edge-case
description: Review PRDs, Platform Specs, Component Specs, user stories, acceptance criteria, API contracts, and implementation plans for missing edge cases, failure modes, recovery behavior, and agent-dangerous ambiguity before implementation.
---

# Edge Case Skill

## Purpose

Incomplete specs used to have a human safety net: engineers noticed gaps and asked questions. AI coding agents can instead turn silence into plausible but unauthorized behavior. This skill replaces that lost safety net with a repeatable review.

## Core rule

**Never silently fill a material requirement gap.**

Classify every important behavior as:
- **Confirmed by source** — authoritative artifact specifies it.
- **Approved decision** — authorized owner selected it.
- **Proposed — pending decision** — recommended, not adopted.
- **Conflicting** — authoritative sources disagree.
- **Unknown** — evidence is insufficient.

A recommendation is not a requirement until approved.

## Inputs

Use on briefs, investigations, PRDs, Platform Specs, Component Specs, stories, acceptance criteria, API/integration contracts, ADRs, business rules, and implementation plans.

## Workflow

### 1. Establish scope and invariants
Extract objective, actors, systems, inputs/outputs, states, dependencies, side effects, irreversible effects, constraints, non-goals, and business invariants such as totals, uniqueness, ownership, permissions, ordering, and consistency.

### 2. Map the happy path
Describe trigger → processing → external calls/writes → checkpoints → observable completion. Mark every side effect and interruption boundary.

### 3. Run the fixed eight-category pass
Always use this order:
1. User types
2. Contexts of use
3. Unexpected inputs and system failures
4. User error
5. Feature interactions
6. Load
7. Security and privacy
8. Accessibility

See `references/edge-case-reference.md`.

For each category record: `Gap found`, `Covered — source`, `Not applicable — rationale`, or `Not assessed — limitation`.

### 4. Expand every material gap
Capture:
- Trigger/precondition
- Concrete scenario
- Invariant at risk
- Requirement status
- Allowed effects
- Prohibited effects
- Failure/interruption state
- User/operator feedback
- Recovery owner/action
- Retry/replay behavior
- Completion evidence
- Affected components/contracts
- Acceptance scenario

### 5. Hunt ambiguous escape hatches
Look for phrases like: “something is wrong”, “handle appropriately”, “retry as needed”, “gracefully”, “should work”, “validate”, “reconcile”, “eventually”, “normally”, “etc.” Also inspect TODOs, emojis, comments, happy-path-only examples, and single clean acceptance tests.

Ask: **Could two competent implementers choose materially different behaviors while both claiming compliance?** If yes, the requirement is ambiguous.

### 6. Check uncertain outcomes
For every external side effect distinguish:
- Not attempted
- Confirmed succeeded
- Confirmed failed
- Outcome unknown

A timeout can mean the remote write succeeded but the response was lost. Never recommend blind retry unless duplicate prevention and result discovery are defined.

### 7. Check replay, idempotency, and concurrency
Establish business operation identity, dedupe source of truth, exact replay behavior, changed-data replay behavior, concurrent execution behavior, and recovery when remote success occurs before local checkpoint persistence.

### 8. Check partial progress
Never assume distributed atomicity. At each step boundary determine what may have committed, what must not repeat, whether to resume/reconcile/compensate/manual-recover, how uncertain effects are discovered, and how completion is proven.

### 9. Prioritize
- **Critical:** money/data corruption, security/tenant violation, irreversible wrong effect, duplicate external records.
- **High:** inconsistent state, blocked recovery, lost work, major invariant violation.
- **Medium:** important ambiguity with bounded/recoverable impact.
- **Low:** low-impact clarification/usability issue.

### 10. Produce decision queue
For unresolved material gaps provide exact decision, why it matters, recommendation, consequential alternatives, owner if known, and blocking status.

### 11. Convert approved decisions into SDD artifacts
Trace:
`source/version -> gap -> decision -> requirement -> component contract -> acceptance scenario -> end-to-end test`

## Coding-agent guardrails

- Implement confirmed/approved behavior only.
- Never promote a proposal to a requirement.
- Never infer business policy from examples.
- Never treat a UI tag/manual label as authoritative state unless specified.
- Never continue after an invariant violation unless continuation is explicit.
- Never blindly retry an uncertain external write.
- Surface blocking decisions before implementing affected paths.

## Output

Use `templates/review-template.md`.

A strong review uses concrete scenarios, states the invariant/impact, separates product policy from technical mechanism, defines recovery rather than only detection, checks cross-component boundaries, includes replay/concurrency, makes failure visible, creates testable acceptance scenarios, and preserves traceability.
