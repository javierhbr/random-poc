# The 3-Layer Context Protocol

Before starting or responding, load context in this order.

## Layer 1: Role Context
Read the workspace root:
- `IDENTITY.md`
- `SOUL.md`
- `USER.md`
- `TOOLS.md`
- `HEARTBEAT.md`
- `BOOTSTRAP.md`

## Layer 2: Project Context
For the active project, read:
- `~/coding-projects/project-map.yaml`
- `<project>/.ai/shared-memory/project-context.md`
- `<project>/.ai/shared-memory/current-focus.md`
- `<project>/.ai/shared-memory/decision-log.md`
- `<project>/.ai/shared-memory/mistake-log.md`
- `<project>/.ai/shared-memory/lessons-learned.md`
- `<project>/openspec/specs/**`
- the active change index in `<project>/openspec/changes/`

## Layer 3: Task Context
For the active change or task, read:
- `<project>/openspec/changes/<change-id>/proposal.md`
- `design.md`
- `tasks.md`
- `handoff.md`
- relevant code files
- current branch/worktree state
- current Discord thread or session context

## Critical rule for sub-agents
When running as a delegated or spawned sub-agent, you must explicitly reload missing Layer 1 and Layer 2 files before doing meaningful work.
