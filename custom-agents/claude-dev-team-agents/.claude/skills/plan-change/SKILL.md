---
name: plan-change
description: Create the OpenSpec change folder with proposal.md, tasks.md, and handoff.md. Routes work to the right agent. Use when a new issue or feature is ready to be broken down and assigned. Invoke with /plan-change.
---

# skill: plan-change

Create a complete change folder and break work into trackable tasks with named owners. This is the Dev Manager's core workflow — every change that gets implemented goes through this.

## When to use
- A new issue or feature has arrived and needs to be structured
- Routing work to the right team member(s)
- Starting the OpenSpec change lifecycle

## Do not use when
- The change folder already exists and tasks are assigned — use `/handoff` to update state
- Requirements are unclear — use `/propose` first

## Steps

### Step 1: Load context
1. Read `~/coding-projects/project-map.yaml` to locate the project
2. Read `.ai/shared-memory/project-context.md` and `current-focus.md`
3. Check `openspec/changes/` for related existing work

### Step 2: Create the change folder
```bash
CHANGE_ID="<descriptive-kebab-case-id>"
mkdir -p openspec/changes/$CHANGE_ID
```

### Step 3: Write proposal.md (if not already present)
If proposal is missing, invoke `/propose` first or draft it inline:
```markdown
# Change: <change-id>
## Problem / User Story / Acceptance Criteria / Scope
```

### Step 4: Decide architecture complexity
- **Simple change** (UI tweak, bug fix, small API addition): skip `design.md`
- **Complex change** (new service, schema migration, cross-package impact): request `design.md` from `@tech-lead`

### Step 5: Write tasks.md
```markdown
# Tasks: <change-id>

## Status: planning

| # | Task | Owner | Status | Depends on |
|---|------|-------|--------|-----------|
| 1 | Write proposal | @product-owner | done | — |
| 2 | Design architecture | @tech-lead | pending | task 1 |
| 3 | Implement API endpoints | @sr-fullstack | pending | task 2 |
| 4 | Implement UI components | @sr-fullstack | pending | task 2 |
| 5 | Implement Flutter screens | @mobile-dev | pending | task 2 |
| 6 | Test and verify | @qa-engineer | pending | tasks 3-5 |
| 7 | Deploy to GCP | @devops | pending | task 6 |
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

## Output
- `openspec/changes/<change-id>/proposal.md`
- `openspec/changes/<change-id>/tasks.md`
- `openspec/changes/<change-id>/handoff.md`
- Updated `.ai/shared-memory/current-focus.md`

## Done when
- [ ] Change folder created with all three files
- [ ] All tasks have named owners
- [ ] Handoff points to first active owner
- [ ] `current-focus.md` is updated
