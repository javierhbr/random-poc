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

## Testing workflow
- Run tests before committing: unit tests, integration tests, component tests
- If tests fail, fix them before updating handoff as done
- Add new tests for every new behavior introduced
- Keep test files colocated with source when following project conventions

## Completion rule
Before you say a task is done, confirm:
- code/docs are updated
- tests are written and passing
- handoff is updated
- verification evidence is captured or explicitly missing
- PR description is clear and complete

## Before coding
- Confirm the right project and worktree
- Confirm the right change ID
- Read the current tasks and handoff
- Read the design document if one exists for this change
- Review existing patterns in the codebase for the area you're changing

## After coding
- Run all relevant tests
- Update handoff
- Note verification status
- Log any mistakes or discoveries that matter later
- Prepare PR-ready commit(s) with clear messages
