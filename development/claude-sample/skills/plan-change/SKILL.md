---
name: plan-change
description: Create the OpenSpec change folder with proposal.md, tasks.md, and handoff.md. Routes work to the right agent. Use when a new issue or feature is ready to be broken down and assigned. Invoke with /plan-change.
---


# workflow: plan-change

Create a complete change folder and break work into trackable tasks with named owners. This is the Dev Manager's core workflow — every change that gets implemented goes through this.

## When to use
- A new issue or feature has arrived and needs to be structured
- Routing work to the right team member(s)
- Starting the OpenSpec change lifecycle

## Do not use when
- The change folder already exists and tasks are assigned — use /handoff to update state
- Requirements are unclear — use /propose first

## Steps

### Step 1: Load context
1. Read `` to locate the project
2. Read `.ai/shared-memory/project-context.md` and `current-focus.md`
3. Check `openspec/changes/` for related existing work

### Step 2: Create the change folder
```bash
CHANGE_ID="<descriptive-kebab-case-id>"
mkdir -p openspec/changes/$CHANGE_ID
```

### Step 3: Write proposal.md (if not already present)
If proposal is missing, invoke /propose first or draft it inline:
```markdown
# Change: <change-id>
## Problem / User Story / Acceptance Criteria / Scope
```

### Step 4: Decide architecture complexity
- **Simple change** (UI tweak, bug fix, small API addition): skip `design.md`
- **Complex change** (new service, schema migration, cross-package impact): request `design.md` from @tech-lead

### Step 5: Create tasks using openspec_task API

For each task, call:
```
openspec_task({
  action: "task_create",
  changeId: "<change-id>",
  id: "T1.1",
  title: "<task title>",
  phase: "Phase 1: <phase name>",
  role: "<role>",
  owner: "dev-manager",
  reviewer: "<reviewing role>",
  priority: "high|medium|low",
  dependsOn: ["T1.0"],   // empty list if no dependencies
  estimatedEffort: "2h"  // must be 4h or less — split if larger
})
```

This creates the individual task file at `tasks/Phase{X}-T{X}.{Y}.md` and updates `tasks-tracker.yaml`.

Then write `tasks.md` as the human-readable index:
```markdown
# Tasks: <change-id>

## Status: planning

| # | Task | Owner | Status | Depends on |
|---|------|-------|--------|-----------|
| T1.1 | Write proposal | @product-owner | done | — |
| T2.1 | Design architecture | @tech-lead | pending | T1.1 |
| T3.1 | Implement API endpoints | @sr-fullstack | pending | T2.1 |
| T3.2 | Implement UI components | @sr-fullstack | pending | T2.1 |
| T3.3 | Implement Flutter screens | @mobile-dev | pending | T2.1 |
| T4.1 | Test and verify | @qa-engineer | pending | T3.1, T3.2, T3.3 |
| T5.1 | Deploy to GCP | @devops | pending | T4.1 |
```

Adjust rows to match what this change actually needs. Remove rows that don't apply.

### Step 6: Write handoff.md
```markdown
# Handoff: <change-id>

- **Project:** <project-code>
- **Change ID:** <change-id>
- **Owner:** @dev-manager
- **Branch/Worktree:** <branch-name>
- **Status:** planning — tasks created, awaiting routing
- **Blocked on:** nothing
- **Next step:** Route task 2 to @tech-lead (or task 3 to @sr-fullstack if no design needed)
- **Verification status:** pending
```

### Step 7: Update current-focus.md
Add the new change to `.ai/shared-memory/current-focus.md` under active changes.

### Step 7a: UI tasks must include agent-browser sub-tasks

If the change touches `packages/web/**`, `tasks.md` MUST allocate two extra tasks per `.claude/rules/agent-browser-ui-testing.md`:

| # | Task | Owner | Phase |
|---|------|-------|-------|
| TX.Y | `agent-browser self-test` (snapshot + annotated screenshot + clean `errors --json` of the changed view; artifacts to `tmp/qa/<change-id>/dev-*.png`) | implementer (`@sr-fullstack` / `@staff-fullstack`) | implementation |
| TX.Z | `agent-browser QA evidence` (verification snapshots + diffs + linked from `handoff.md`) | `@qa-engineer` | verification |

These are **not optional** — a UI `tasks.md` missing either is incomplete and must not transition out of `plan` phase.

### Step 7b: Validate task granularity
Before delegating, validate every task against both tests:

**Too large?** Split if any are true:
- Changes multiple subsystems with no single outcome
- Mixes infra + backend + UI in one unit
- Cannot be reviewed in one pass
- Estimated effort > 4 hours
- More than 3 dependencies on unresolved tasks

**Too vague?** Rewrite if any field is missing:
- Objective (one sentence outcome)
- Includes (explicit in-scope list)
- Excludes (explicit out-of-scope list)
- Done when (observable, testable)
- Dependencies (explicit list or empty)

Do not delegate any task that fails either test.

### Step 7c: Transition phase state
After tasks are validated:
```
openspec_change({ action: "transition", projectCode: "<code>", changeId: "<id>" })
```
This advances from `plan` → `design` (if medium/complex) or `plan` → `implementation` (if small/trivial). Prerequisite: `tasks.md` must have content.

### Step 8: Delegate to first owner
Notify the first task owner with:
- Project code and change ID
- Link to proposal.md and their task
- Expected output and deadline if applicable

## Routing guide
| Situation | First owner |
|-----------|-------------|
| Requirements need refinement | @product-owner |
| Complex change needing design | @tech-lead |
| Simple web/backend change | @sr-fullstack |
| Flutter/mobile change | @mobile-dev |
| Bug fix with clear scope | @sr-fullstack |

## Individual task file template (tasks/Phase{X}-T{X}.{Y}.md)

Each `openspec_task(task_create)` call produces a task file. The template:

```markdown
---
id: "T2.1"
title: "<task title>"
phase: "Phase 2: <phase name>"
status: todo
priority: high|medium|low
assignee: ""
role: "<role>"
owner: "dev-manager"
reviewer: ""
depends_on: ["T1.1"]
blocked_by: []
created_at: "<ISO timestamp>"
updated_at: "<ISO timestamp>"
started_at: ""
completed_at: ""
estimated_effort: "2h"
---

# T2.1 — <task title>

## Objective
<One sentence: what is the single outcome of this task>

## Includes
- <explicit in-scope item>

## Excludes
- <explicit out-of-scope item>

## Done when
<Observable, testable condition — no ambiguity>

## Dependencies
- T1.1 (or empty list)

## Technical Notes

## Files
| File | Action | Notes |
|---|---|---|

## Activity Log

## Bugs
```

All 6 required fields must be present. A task missing any of Objective, Includes, Excludes, Done-when, Dependencies, or Estimated effort is incomplete and must not be delegated.

## Output
- `openspec/changes/<change-id>/proposal.md`
- `openspec/changes/<change-id>/tasks.md`
- `openspec/changes/<change-id>/tasks-tracker.yaml`
- `openspec/changes/<change-id>/tasks/Phase{X}-T{X}.{Y}.md` (one per task)
- `openspec/changes/<change-id>/handoff.md`
- Updated `.ai/shared-memory/current-focus.md`

## Done when
- [ ] Change folder created with all three files
- [ ] All tasks have named owners
- [ ] Handoff points to first active owner
- [ ] `current-focus.md` is updated
