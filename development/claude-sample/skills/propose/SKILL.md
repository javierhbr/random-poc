---
name: propose
description: Create or refine a change proposal with acceptance criteria. Use when starting a new feature, bug fix, or improvement. Produces proposal.md in the change folder. Invoke with /propose.
---


# workflow: propose

Create a well-scoped change proposal with testable acceptance criteria. This workflow ensures no implementation starts without clear requirements.

## When to use
- Starting a new feature or bug fix
- Refining a vague request into clear requirements
- Writing acceptance criteria for QA to verify
- Scoping work before breaking it into tasks

## Do not use when
- The proposal already exists and is approved — use /plan-change instead
- You are in the middle of implementation — requirements changes go back to @product-owner

## Steps

### Phase 1: Discover (before writing anything)

1. Identify the project: read ``
2. Read `.ai/shared-memory/project-context.md` and `current-focus.md`
3. Ask the following clarifying questions (do not skip):
   - Who is the user and what is the problem they face?
   - What does success look like — specifically, measurably?
   - What is explicitly out of scope for this change?
   - Are there edge cases, error states, or constraints to handle?
   - Is there a deadline or dependency this depends on?

### Phase 1.5: Classify before writing

Run the Requirement Analysis Protocol (SOUL.md):
1. Separate Explicit / Inferred / Open questions — resolve all open questions before continuing
2. Identify actors, flows, and constraints
3. **Classify change size:**

| Size | Criteria | Action |
|---|---|---|
| trivial | 1 task, no design needed, no QA | Proceed directly to implementation handoff |
| small | 2–5 tasks, no schema changes | Write proposal + skip design phase |
| medium | 5–15 tasks, API/schema changes | Full lifecycle |
| epic | >15 tasks or multiple subsystems | **STOP. Decompose first. Do not write a proposal for an epic.** |

Record the size in the proposal under `## Size: <trivial|small|medium|epic>`.

### Phase 2: Write the proposal

Create `openspec/changes/<change-id>/proposal.md`:

```markdown
# Change: <change-id>

## Problem
<What problem does this solve? For whom? Why does it matter?>

## User Story
As a <user type>, I want to <action> so that <benefit>.

## Size
<trivial | small | medium | epic>

## Acceptance Criteria
- [ ] Given <context>, when <action>, then <outcome>
- [ ] Given <context>, when <action>, then <outcome>
- [ ] Given <error condition>, when <action>, then <safe outcome>

## Scope
**In:** <what is included in this change>
**Out:** <what is explicitly excluded>

## Open Questions
- [ ] <unresolved question that needs an answer before implementation>
```

### Phase 3: Validate

Review the proposal against these rules:
- Every acceptance criterion is testable without asking questions
- No vague language: "fast", "smooth", "looks good" → replace with measurable outcomes
- Scope boundaries are explicit
- Error states and edge cases are covered
- **If the change touches `packages/web/**`**: at least one acceptance criterion MUST express the verification path through `agent-browser` (e.g., "snapshot shows X", "annotated screenshot diff stays within tolerance", "no errors in `agent-browser errors --json`"). See `.claude/rules/agent-browser-ui-testing.md`. A UI proposal without an agent-browser acceptance criterion is incomplete — return to discovery.

### Phase 3.5: Transition phase state
After validating the proposal:
```
openspec_change({ action: "transition", projectCode: "<code>", changeId: "<id>" })
```
This advances from `proposal` → `plan`. Prerequisite: `proposal.md` must have content.

### Phase 4: Hand off

Update `openspec/changes/<change-id>/handoff.md`:
- Owner: @dev-manager
- Status: proposal ready
- Next step: create tasks and route to implementation

## Output
- `openspec/changes/<change-id>/proposal.md`
- Updated `handoff.md`

## Done when
- [ ] Problem is clearly stated in one paragraph
- [ ] User story is specific and verifiable
- [ ] All acceptance criteria use Given/When/Then and are testable
- [ ] Scope has explicit In/Out sections
- [ ] No open questions remain (or they are listed and acknowledged)

## Rules
| Rule | Why |
|------|-----|
| Ask before writing | Writing without discovery produces proposals that miss the real problem |
| No vague acceptance criteria | "Should be fast" cannot be verified by QA |
| Explicit out-of-scope | Prevents scope creep during implementation |
| One user story per proposal | Multiple stories = multiple changes |
| UI changes name agent-browser | Verification path must be explicit in the spec, not assumed (see `.claude/rules/agent-browser-ui-testing.md`) |
