---
name: openspec-change
description: Full OpenSpec change lifecycle from requirements through deployment. Orchestrates the complete flow: propose → plan → design → implement → verify → deploy. Use when starting a new feature end-to-end. Invoke with /openspec-change.
---

# skill: openspec-change

Orchestrate the complete OpenSpec change lifecycle from a raw idea through production deployment. This skill coordinates all team agents in sequence.

## When to use
- Starting a completely new feature or significant change end-to-end
- You want a guided walkthrough of the full delivery pipeline
- Coordinating a complex change across multiple agents

## Do not use when
- You only need one part of the flow (use the specific skill instead: `/propose`, `/plan-change`, etc.)
- The change is already in progress — pick up at the current stage instead

## The OpenSpec Lifecycle

```
[Idea] → /propose → [proposal.md]
                  ↓
              /plan-change → [tasks.md] [handoff.md]
                  ↓
              /design-arch → [design.md]  (if complex)
                  ↓
              /implement → [code + tests]
                  ↓
              /test-verify → [verification evidence]
                  ↓
              /deploy-gcp → [production]
                  ↓
              [archive]
```

## Steps

### Phase 0: Generate a change ID
```
<project-code>-<feature-description>-<YYYYMMDD>
Example: acme-user-notifications-20240315
```

### Phase 1: Propose (invoke `/propose`)
Use `@product-owner` or the `/propose` skill.

Exit criteria:
- `proposal.md` exists with problem, user story, acceptance criteria, scope
- No vague acceptance criteria
- Hand off to `@dev-manager`

### Phase 2: Plan (invoke `/plan-change`)
Use `@dev-manager` or the `/plan-change` skill.

Exit criteria:
- Change folder created: `openspec/changes/<change-id>/`
- `tasks.md` with owners and sequence
- `handoff.md` initialized
- `current-focus.md` updated

### Phase 3: Design (invoke `/design-arch` — if complex)
**Skip if:** bug fix, small UI change, no API/schema changes.
**Run if:** new API surface, DB migrations, new service, cross-package impact.

Use `@tech-lead` or the `/design-arch` skill.

Exit criteria:
- `design.md` with API contracts, schema migrations, component architecture, rollback plan
- `decision-log.md` updated

### Phase 4: Implement (invoke `/implement`)
Use `@sr-fullstack`, `@staff-fullstack`, or `@mobile-dev` depending on scope.

Exit criteria:
- Code implements all acceptance criteria
- Tests written and passing
- QA and Tech Lead notified of any contract/schema changes
- `handoff.md` updated pointing to `@qa-engineer`

### Phase 5: Verify (invoke `/test-verify`)
Use `@qa-engineer` or the `/test-verify` skill.

Exit criteria:
- All acceptance criteria traced to tests or manual checks
- Evidence documented in `handoff.md`
- Deployment signoff: YES or NO

**STOP if signoff is NO.** Return to Phase 4.

### Phase 6: Deploy (invoke `/deploy-gcp`)
Use `@devops` or the `/deploy-gcp` skill.

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
| Requirements unclear mid-implementation | @product-owner |
| Architecture decision needed | @tech-lead |
| Blocker unresolvable at team level | CTO / stakeholder |
| QA fails repeatedly | @staff-fullstack for design review |
| Deployment fails repeatedly | @tech-lead + @devops joint review |

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
