---
name: openspec-change
description: Full OpenSpec change lifecycle from requirements through deployment. Orchestrates the complete flow: propose → plan → design → implement → verify → deploy. Use when starting a new feature end-to-end. Invoke with /openspec-change.
---


# workflow: openspec-change

Orchestrate the complete OpenSpec change lifecycle from a raw idea through production deployment. This workflow coordinates all team agents in sequence.

## When to use
- Starting a completely new feature or significant change end-to-end
- You want a guided walkthrough of the full delivery pipeline
- Coordinating a complex change across multiple agents

## Do not use when
- You only need one part of the flow (use the specific workflow instead: /propose, /plan-change, etc.)
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

### Phase 0: Generate a change ID and classify size
```
<project-code>-<feature-description>-<YYYYMMDD>
Example: acme-user-notifications-20240315
```

**Size classification (done by PO during propose phase):**

| Size | Criteria | Phases required | Max tasks |
|---|---|---|---|
| trivial | 1 task, no API/schema changes | idea → implementation → done | 1 |
| small | 2–5 tasks, no schema changes | proposal → plan → implementation → verification → done (skip design) | 5 |
| medium | 5–15 tasks, API/schema changes | Full lifecycle | 15 |
| epic | >15 tasks or multiple subsystems | **STOP. Decompose first.** | N/A |

**Phase skipping rules:**
- `trivial`: skip proposal, skip design, skip verification
- `small`: skip design phase only
- `medium`: run all phases
- `epic`: do not enter the lifecycle — return to PO for decomposition

### Phase 1: Propose (invoke /propose)
Use @product-owner or the /propose workflow.

Exit criteria:
- `proposal.md` exists with problem, user story, acceptance criteria, scope
- No vague acceptance criteria
- Hand off to @dev-manager

### Phase 2: Plan (invoke /plan-change)
Use @dev-manager or the /plan-change workflow.

Exit criteria:
- Change folder created: `openspec/changes/<change-id>/`
- `tasks.md` with owners and sequence
- `handoff.md` initialized
- `current-focus.md` updated

### Phase 3: Design (invoke /design-arch — if complex)
**Skip if:** bug fix, small UI change, no API/schema changes.
**Run if:** new API surface, DB migrations, new service, cross-package impact.

Use @tech-lead or the /design-arch workflow.

Exit criteria:
- `design.md` with API contracts, schema migrations, component architecture, rollback plan
- `decision-log.md` updated

### Phase 4: Implement (invoke /implement)
Use @sr-fullstack, @staff-fullstack, or @mobile-dev depending on scope.

Exit criteria:
- Code implements all acceptance criteria
- Tests written and passing
- @qa-engineer and @tech-lead notified of any contract/schema changes
- `handoff.md` updated pointing to @qa-engineer

### Phase 5: Verify (invoke /test-verify)
Use @qa-engineer or the /test-verify workflow.

Exit criteria:
- All acceptance criteria traced to tests or manual checks
- Evidence documented in `handoff.md`
- Deployment signoff: YES or NO

**STOP if signoff is NO.** Return to Phase 4.

### Phase 6: Deploy (invoke /deploy-gcp)
Use @devops or the /deploy-gcp workflow.

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

## Phase transition gates

Every phase transition must be executed via `openspec_change(transition)`. The gate enforces prerequisites:

| Transition | Prerequisite |
|---|---|
| `idea` → `proposal` | No prerequisites |
| `proposal` → `plan` | `proposal.md` must have content |
| `plan` → `design` | `tasks.md` must have content |
| `design` → `implementation` | `design.md` AND `tasks.md` must have content |
| `implementation` → `verification` | `handoff.md` must have content |
| `verification` → `deployment` | `verification.md` must contain "Signoff: YES" |
| `deployment` → `done` | `release.md` must have content |

**Can-advance check before transitioning:**
```bash
openclaw call openspec.changes.can-advance \
  '{ "projectCode": "<code>", "changeId": "<id>" }'
```

**Transition call:**
```
openspec_change({ action: "transition", projectCode: "<code>", changeId: "<id>" })
```

**Assign an agent to a phase:**
```
openspec_change({ action: "assign", changeId: "<id>", role: "<role>", sessionKey: "<key>" })
```

**Block/unblock:**
```
openspec_change({ action: "block", changeId: "<id>", reason: "<reason>" })
openspec_change({ action: "unblock", changeId: "<id>" })
```

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
| Blocker unresolvable at team level | @cto |
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
