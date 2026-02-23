# Plan: {{FEATURE_NAME}}

> **Phase**: Plan | **Status**: Draft | **Author**: {{AUTHOR}} | **Date**: {{DATE}}
> **Initiative**: {{INITIATIVE_ID}} | **Estimated effort**: {{POINTS}} points

---

## Context
Implements spec: {{SPEC_DOC_LINK}}

## Task Breakdown

### Phase 1 — Data / Schema
| ID | Task | Points | Owner | Status |
|----|------|--------|-------|--------|
| T-01 | | | | todo |

### Phase 2 — Backend / API
| ID | Task | Points | Owner | Status |
|----|------|--------|-------|--------|
| T-02 | | | | todo |

### Phase 3 — Events / Integration
| ID | Task | Points | Owner | Status |
|----|------|--------|-------|--------|
| T-03 | | | | todo |

### Phase 4 — Frontend
| ID | Task | Points | Owner | Status |
|----|------|--------|-------|--------|
| T-04 | | | | todo |

### Phase 5 — Observability & Ops
| ID | Task | Points | Owner | Status |
|----|------|--------|-------|--------|
| T-05 | | | | todo |

## Dependencies & Sequencing
<!-- What must be done before what? -->

```
T-01 (DB migration) → T-02 (API) → T-03 (Events) → T-05 (Obs)
                                  → T-04 (Frontend)
```

## Rollout Plan

| Phase | Traffic | Duration | Success Criteria |
|-------|---------|----------|-----------------|
| Internal | 0% → 5% | 2 days | No errors |
| Canary | 5% → 25% | 3 days | p99 within budget |
| Full | 25% → 100% | 1 day | Metrics stable |

## Rollback Triggers
- Error rate > [X]%
- p99 > [X]ms sustained for > 5 min
- Any data integrity issue

---
## Plan Gate
- [ ] PLAN-001: All tasks have owner and estimate
- [ ] PLAN-002: Dependencies and sequencing defined
- [ ] PLAN-003: Rollout plan with success criteria defined
- [ ] PLAN-004: Rollback triggers specified
