---
name: handoff
description: Create or update a handoff document when ownership of a change moves between agents. Use whenever you finish your part of a change and need to pass it to the next person. Invoke with /handoff.
---


# workflow: handoff

Create or update a `handoff.md` when ownership of a change moves from one agent to another. A good handoff means the next agent can start immediately without asking questions.

## When to use
- Finishing your task and passing to the next agent
- Resuming a change after a gap (update to reflect current state)
- Escalating a blocker to another agent
- Archiving a completed change

## Do not use when
- You are updating the handoff just to log progress mid-task — that's a status update, not a handoff
- The change has no next step — close it instead

## Steps

### Step 1: Assess current state
Before writing, be honest:
- What is actually done? (not what was planned)
- What is actually blocked? (not what might be blocked)
- What does the next person need to know to start immediately?

### Step 2: Write or update handoff.md

```markdown
# Handoff: <change-id>

## Metadata
- **Project:** <project-code>
- **Change ID:** <change-id>
- **Branch:** <branch-name>
- **Worktree:** <path if applicable>
- **Last updated:** <date>

## Current Owner
**<agent-name>** — <one sentence: what they should do>

## Status
<What is done so far, in plain language>

## What was done in this session
- <specific thing completed>
- <specific thing completed>

## Blocked on
<What is preventing progress, or "nothing" if unblocked>

## Files changed
- `src/api/users.ts` — <why it was changed>
- `src/db/migrations/001_add_users.sql` — <what it does>

## Decisions made
- <decision and brief rationale>

## Risks
- <risk and mitigation, or "none identified">

## Next step
<Clear, specific instruction for the next agent — not "continue implementation">

## Verification status
pending | in-progress | passed | failed

## Related artifacts
- Proposal: `openspec/changes/<change-id>/proposal.md`
- Design: `openspec/changes/<change-id>/design.md`
- Tasks: `openspec/changes/<change-id>/tasks.md`
```

### Step 3: Update tasks.md
Mark your completed tasks as `done` and update the status column.

### Step 4: Notify next owner
If delegating to a specific agent, include:
- Project code and change ID
- What you did
- What they need to do
- Any specific context they'll need (API keys, environment variables, known gotchas)

### Handoff routing guide
| You are | Work complete | Hand to |
|---------|--------------|---------|
| @product-owner | Proposal written | @dev-manager |
| @dev-manager | Tasks planned | First task owner |
| @tech-lead | Design written | @dev-manager or impl owner |
| @sr-fullstack | Implementation done | @qa-engineer |
| @staff-fullstack | Architecture approved | @sr-fullstack |
| @mobile-dev | Flutter changes done | @qa-engineer |
| @qa-engineer | Verification passed | @devops |
| @devops | Deployed to production | @dev-manager (close loop) |

## Output
- Updated `openspec/changes/<change-id>/handoff.md`
- Updated `openspec/changes/<change-id>/tasks.md`

## Done when
- [ ] Status reflects actual state (not aspirational state)
- [ ] Next step is specific and actionable
- [ ] Files changed are listed
- [ ] Decisions made are recorded
- [ ] Risks are explicit or stated as "none"
- [ ] Next owner is named

## Rules
| Rule | Why |
|------|-----|
| Be honest about blockers | A hidden blocker stays blocked longer |
| Next step must be specific | "Continue" is not a next step |
| List files changed | The next agent needs to know where to look |
| Record decisions | Future agents need the rationale |
