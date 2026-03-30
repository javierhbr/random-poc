---
id: openspec-change
description: Full OpenSpec change lifecycle from requirements through deployment. Orchestrates the complete flow — propose, plan, design, implement, verify, deploy. Use when starting a new feature end-to-end.
primary_role: manager
---

# workflow: openspec-change

Orchestrate the complete OpenSpec change lifecycle from a raw idea through production deployment. This workflow coordinates all team agents in sequence.

## When to use
- Starting a completely new feature or significant change end-to-end
- You want a guided walkthrough of the full delivery pipeline
- Coordinating a complex change across multiple agents

## Do not use when
- You only need one part of the flow (use the specific workflow instead: [skill:propose], [skill:plan-change], etc.)
- The change is already in progress — pick up at the current stage instead

## The OpenSpec Lifecycle

```
[Idea] → [skill:propose] → [proposal.md]
                  ↓
              [skill:plan-change] → [tasks.md] [handoff.md]
                  ↓
              [skill:design-arch] → [design.md]  (if complex)
                  ↓
              [skill:implement] → [code + tests]
                  ↓
              [skill:test-verify] → [verification evidence]
                  ↓
              [skill:deploy-gcp] → [production]
                  ↓
              [archive]
```

## Steps

### Phase 0: Generate a change ID
```
<project-code>-<feature-description>-<YYYYMMDD>
Example: acme-user-notifications-20240315
```

### Phase 1: Propose (invoke [skill:propose])
Use [role:po] or the [skill:propose] workflow.

Exit criteria:
- `proposal.md` exists with problem, user story, acceptance criteria, scope
- No vague acceptance criteria
- Hand off to [role:manager]

### Phase 2: Plan (invoke [skill:plan-change])
Use [role:manager] or the [skill:plan-change] workflow.

Exit criteria:
- Change folder created: `openspec/changes/<change-id>/`
- `tasks.md` with owners and sequence
- `handoff.md` initialized
- `current-focus.md` updated

### Phase 3: Design (invoke [skill:design-arch] — if complex)
**Skip if:** bug fix, small UI change, no API/schema changes.
**Run if:** new API surface, DB migrations, new service, cross-package impact.

Use [role:tech-lead] or the [skill:design-arch] workflow.

Exit criteria:
- `design.md` with API contracts, schema migrations, component architecture, rollback plan
- `decision-log.md` updated

### Phase 4: Implement (invoke [skill:implement])
Use [role:sr-fullstack], [role:staff-fullstack], or [role:mobile] depending on scope.

Exit criteria:
- Code implements all acceptance criteria
- Tests written and passing
- [role:qa] and [role:tech-lead] notified of any contract/schema changes
- `handoff.md` updated pointing to [role:qa]

### Phase 5: Verify (invoke [skill:test-verify])
Use [role:qa] or the [skill:test-verify] workflow.

Exit criteria:
- All acceptance criteria traced to tests or manual checks
- Evidence documented in `handoff.md`
- Deployment signoff: YES or NO

**STOP if signoff is NO.** Return to Phase 4.

### Phase 6: Deploy (invoke [skill:deploy-gcp])
Use [role:devops] or the [skill:deploy-gcp] workflow.

Exit criteria:
- Terraform changes applied (if any)
- Staging verified healthy
- Production deployed and monitored (15 min)
- `handoff.md` updated with deployment status

### Phase 7: Archive
Move the change folder to archive:
```bash
mv openspec/changes/<change-id> openspec/changes/archive/<change-id>
```

Update `.ai/shared-memory/current-focus.md` — remove from active changes.

Write a retrospective in `.ai/shared-memory/lessons-learned.md` if there are learnings worth capturing.

## Tracking progress

Use `tasks.md` status column throughout:
```
planning → in-progress → blocked → done
```

The `handoff.md` is the single source of truth for current state. Check it before starting any phase.

## Escalation
| Issue | Escalate to |
|-------|-------------|
| Requirements unclear mid-implementation | [role:po] |
| Architecture decision needed | [role:tech-lead] |
| Blocker unresolvable at team level | [role:cto] |
| QA fails repeatedly | [role:staff-fullstack] for design review |
| Deployment fails repeatedly | [role:tech-lead] + [role:devops] joint review |

## Output
All phases produce artifacts in `openspec/changes/<change-id>/`:
- `proposal.md`
- `design.md` (if complex)
- `tasks.md`
- `handoff.md` (updated throughout)
- Code committed to branch
- Change deployed to production
- Moved to `openspec/changes/archive/`

## Done when
- [ ] All acceptance criteria implemented and verified
- [ ] Change deployed to production and monitored
- [ ] Change folder archived
- [ ] `current-focus.md` updated
- [ ] Lessons documented if any
