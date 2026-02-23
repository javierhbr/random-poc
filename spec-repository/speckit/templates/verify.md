# Verify: {{FEATURE_NAME}}

> **Phase**: Verify | **Status**: Pending | **Author**: {{AUTHOR}} | **Date**: {{DATE}}
> **Initiative**: {{INITIATIVE_ID}}

---

## Functional Acceptance Criteria
<!-- Each AC from the spec must be verified here -->

- [ ] AC-001: ...
- [ ] AC-002: ...
- [ ] AC-003: ...

## Non-Functional

- [ ] Load test completed — p99 within budget ([X]ms target, [Y]ms actual)
- [ ] Error rate < [X]% under load
- [ ] Availability SLA met in staging

## Contract Verification

- [ ] All declared events emitted correctly (schema matches)
- [ ] All consuming services tested against new version
- [ ] No breaking changes introduced (or CCH-XXX approved and parallel version running)

## Observability

- [ ] All metrics defined in spec are being emitted
- [ ] Alerts configured and tested (trigger verified in staging)
- [ ] Dashboard updated / created
- [ ] Runbook written

## Security (if applicable)

- [ ] Threat model reviewed
- [ ] Security scan clean (no critical/high findings)
- [ ] PCI/GDPR checklist passed (if applicable)

## Rollout Readiness

- [ ] Feature flag working and tested
- [ ] Rollback tested in staging
- [ ] On-call team briefed

## Sign-off

| Role | Name | Date |
|------|------|------|
| Tech Lead | | |
| Product | | |
| Platform (if critical) | | |

---
## Verify Gate
- [ ] VERIF-001: All ACs verified
- [ ] VERIF-002: NFRs met (load test evidence)
- [ ] VERIF-003: Observability in place
- [ ] VERIF-004: Rollback tested
- [ ] VERIF-005: Sign-offs obtained
