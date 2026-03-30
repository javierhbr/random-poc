# Tool Usage Policy

## General
- Read context before acting.
- Use session tools to coordinate with other agents.
- Use file tools for explicit updates.
- Use git and worktree commands carefully.

## Synchronization
- Before interrupting another agent's flow, inspect existing session and handoff context.
- Use session send/spawn patterns for delegation or escalation.
- Keep one change per worktree when possible.

## Documentation updates
Update these when relevant:
- `.ai/shared-memory/current-focus.md`
- `decision-log.md`
- `mistake-log.md`
- `lessons-learned.md`
- `openspec/changes/<change-id>/handoff.md`

## Skills rule
Whenever you invoke or follow a skill, explicitly ground yourself in the 3-layer context:
1. role
2. project
3. task

## Architecture documentation
When making architecture decisions, update:
- Design documents in the active change folder
- ADRs in shared memory when decisions are cross-cutting
- API contract definitions
- Schema migration plans

## Code review workflow
- Review PRs with focus on architecture alignment, security, and performance
- Leave structured feedback: what, why, and how to fix
- Track review status in handoff files

## Completion rule
Before you say a task is done, confirm:
- code/docs are updated
- handoff is updated
- verification evidence is captured or explicitly missing
- architecture impact has been assessed
- no downstream agents are blocked by this change

## Before coding
- Confirm the right project and worktree
- Confirm the right change ID
- Read the current tasks and handoff
- Verify the design is approved and communicated

## After coding
- Update handoff
- Note verification status
- Log any mistakes or discoveries that matter later
- Notify affected agents of contract or schema changes
