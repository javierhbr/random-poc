---
name: coding-agent
description: OpenSpec-gated implementation skill. Checks status.yaml phase before writing any code — hard stops if phase is not implementation. Manages openspec_task lifecycle (task_update, task_comment) and enforces before-coding checklist. Invoke with /coding-agent.
---

# coding-agent

## Purpose
Execute implementation work with an OpenSpec phase gate — prevents writing code before the implementation phase is authorized.

## Primary role
sr-fullstack

## OpenSpec Gate (mandatory check before writing any code)

Before writing any source file, running any scaffold command, or installing any package:

1. Read `openspec/changes/<change-id>/status.yaml`
2. Check the `phase` field

**If `phase` is NOT `implementation`:**
```
STOP. Current phase is <phase>. Writing code is only allowed during the implementation phase.
Report the current phase to the user and wait for instruction.
```

**If `phase` IS `implementation`:**
Continue to the implementation steps below.

## Procedure

### Step 1: Load context (3-layer protocol)

**Layer 1 — Role:**
- `IDENTITY.md`, `SOUL.md`, `USER.md`, `TOOLS.md`, `HEARTBEAT.md`, `BOOTSTRAP.md`

**Layer 2 — Project:**
- ``
- `.ai/shared-memory/project-context.md`
- `.ai/shared-memory/current-focus.md`
- `.ai/shared-memory/lessons-learned.md`

**Layer 3 — Task:**
- `openspec/changes/<change-id>/status.yaml` ← **gate check here**
- `openspec/changes/<change-id>/tasks-tracker.yaml`
- `openspec/changes/<change-id>/proposal.md`
- `openspec/changes/<change-id>/design.md` (required for medium+ changes)
- `openspec/changes/<change-id>/tasks.md`
- `openspec/changes/<change-id>/handoff.md`

### Step 2: Hard stops before implementing

- `proposal.md` missing or empty → **STOP**
- `design.md` missing for medium+ changes → **STOP**, get design from tech-lead first
- `tasks.md` missing or empty → **STOP**
- `status.yaml` phase is not `implementation` → **STOP** (gate above)

### Step 3: Mark task in progress
```
openspec_task({ action: "task_update", changeId: "<change-id>", id: "<task-id>", status: "in_progress" })
```

### Step 4: Implement
Follow `design.md` contracts. Follow existing codebase patterns. One concern per commit.

### Step 5: Write tests
All tasks require tests before marking done. Tests must cover happy path and at least one error/edge case.

### Step 6: Mark task done and log activity
```
openspec_task({ action: "task_update", changeId: "<change-id>", id: "<task-id>", status: "done" })
openspec_task({
  action: "task_comment",
  changeId: "<change-id>",
  id: "<task-id>",
  role: "sr-fullstack",
  content: "<summary of what was implemented>"
})
```

### Step 7: Update handoff
Update `openspec/changes/<change-id>/handoff.md` with what changed and set next owner to `qa-engineer`.

## Output expectations
- Code implementing the task's acceptance criteria
- Tests written and passing
- Task marked `done` in tasks-tracker.yaml
- Handoff updated pointing to QA
