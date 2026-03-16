# SDD v3.0 Process Detail

Full phase walkthroughs, templates, and troubleshooting for each SDD phase.

## Phase 0 — Initiative Definition (PM)

### Steps

1. Define the problem statement — what is broken or missing, and for whom
2. Define a measurable success metric — quantitative, with a target and timeframe
3. Run the 5-question risk interview (see `../../risk-assessment/SKILL.md`)
4. Create the initiative with `agentic-agent specify start "Feature Name" --risk [level]`
5. Write Given/When/Then success criteria for every acceptance criterion

### Risk Scoring

| Question | YES adds | NO adds |
|----------|----------|---------|
| Touches >2 services? | +2 | 0 |
| Needs new data model or schema change? | +2 | 0 |
| Affects auth, billing, or PII? | +3 | 0 |
| Has external dependency or third-party integration? | +1 | 0 |
| Deadline-driven or regulatory? | +1 | 0 |

| Score | Classification |
|-------|---------------|
| 0–1 | Low (Quick workflow) |
| 2–4 | Medium (Standard workflow) |
| 5–7 | High (Full workflow) |
| 8+ | Critical (Full workflow + executive review) |

### Initiative Template

```markdown
# Initiative: [Name]

## Problem Statement
[What is broken or missing, and for whom]

## Success Metric
[Quantitative metric with target and timeframe]

## Risk Classification
- Score: [N]
- Level: [low|medium|high|critical]
- Workflow: [quick|standard|full]

## Acceptance Criteria
- [ ] Given [context], When [action], Then [outcome]
```

---

## Phase 1 — Architecture Design (Architect)

### Steps

1. Read the initiative file and understand intent, scope, and risk level
2. Check the Platform Constitution (`constitution.md`) for applicable policies
3. Produce `feature-spec.md` — the cross-cutting feature specification
4. Produce `component-spec.md` per affected service — the local implementation contract
5. Run gate checks: `agentic-agent specify gate-check SPEC-[ID]`
6. Create dev tasks: `agentic-agent task create --title "Implement [Service]"`

### Gate Checklist (5 Gates)

| Gate | Checks |
|------|--------|
| Gate 1 — Context | Constitution version declared, platform refs pinned |
| Gate 2 — Domain | Data ownership correct per Constitution, no cross-service DB access |
| Gate 3 — Integration | Contract versioning and dual-publish per Constitution |
| Gate 4 — NFR | Observability, security, PII, performance per Constitution |
| Gate 5 — Ready | No ambiguity, all ACs in GWT, ADRs resolved |

### Feature Spec Template

```markdown
# Feature Spec: [Name]

## Metadata
- Initiative: [ID]
- Constitution Version: [vX.Y]
- Risk: [level]

## Behavior
[What the feature does, in MUST/SHALL language]

## Acceptance Criteria
- [ ] Given [context], When [action], Then [outcome]

## Affected Components
- [service-a]: [what changes]
- [service-b]: [what changes]

## ADRs
- [ADR-NNN]: [decision]
```

---

## Phase 2 — Implementation (Developers, parallel)

### Steps per component

1. Claim task: `agentic-agent task claim [TASK-ID]`
2. Read the component-spec for your service
3. Implement against the spec — code, tests, observability
4. Produce `impl-spec.md` documenting what was actually built
5. Run gate check: `agentic-agent specify gate-check SPEC-[SERVICE]-IMPL`
6. Push and complete: `agentic-agent task complete [TASK-ID]`

### Impl Spec Template

```markdown
# Implementation Spec: [Component]

## Task
- Task ID: [ID]
- Component Spec: [ref]

## What was built
[Summary of implementation]

## Files changed
- [path]: [what changed]

## Tests added
- [test file]: [what it covers]

## Observability
- Logging: [what is logged]
- Metrics: [what is measured]
- Tracing: [spans added]

## Edge cases handled
- [case]: [how handled]

## Deviations from spec
- [deviation]: [why, and impact]
```

---

## Phase 3 — Verification (Verifier)

### Steps

1. For every AC: map to a test, run the test, capture evidence
2. Check observability in staging — logs, metrics, traces present and correct
3. Run full test suite: `agentic-agent validate`
4. Produce `verify.md` with AC-to-evidence mapping
5. Sync the spec graph: `agentic-agent specify sync-graph`
6. Merge to main

### Verify Template

```markdown
# Verification: [Feature]

## AC Evidence

| AC | Test | Result | Evidence |
|----|------|--------|----------|
| Given X, When Y, Then Z | test_file:test_name | PASS | [link or output] |

## Observability Check
- [ ] Logs present in staging
- [ ] Metrics reporting correctly
- [ ] Traces visible end-to-end

## Test Suite
- Total: [N] | Pass: [N] | Fail: [N] | Skip: [N]

## Verdict
[PASS / FAIL with explanation]
```

---

## Phase 4 — Deployment (DevOps/PM)

### Steps

1. Deploy to staging with all feature flags OFF:
   `agentic-agent deploy --environment staging --feature-flags-all-off`
2. Canary for 2 hours — monitor error rates and latency
3. Progressive rollout:
   - 10% → monitor 1h
   - 25% → monitor 2h
   - 50% → monitor 4h
   - 100% → monitor 24h
4. At Day 30: measure success metrics against initiative targets

### Rollback Triggers

- Error rate increases >1% over baseline
- p95 latency increases >20% over baseline
- Any 5xx errors directly attributable to the feature
- PII exposure or security incident

### Rollback Command

```bash
agentic-agent flags set FeatureFlag=off
agentic-agent deploy rollback --environment production
```

---

## Troubleshooting

### Gate check fails

See `../../gate-check/SKILL.md` for diagnostic guidance and remediation steps.

### Task stuck in "in-progress"

```bash
agentic-agent task list --status in-progress
agentic-agent task complete [TASK-ID]  # if work is done
```

### Spec drift detected

Re-run gate checks after updating specs:
```bash
agentic-agent specify gate-check SPEC-[ID]
```

### Feature flag not taking effect

1. Verify flag name matches exactly
2. Check flag service connectivity
3. Verify deployment includes flag integration code
