# Spec: {{FEATURE_NAME}}

> **Phase**: Spec | **Status**: Draft | **Author**: {{AUTHOR}} | **Date**: {{DATE}}
> **Initiative**: {{INITIATIVE_ID}} | **Risk Level**: {{RISK_LEVEL}} | **Change Type**: {{CHANGE_TYPE}}

---

## Context
<!-- Link to Discovery doc. One paragraph summary of the problem being solved. -->

Implements discovery: {{DISCOVERY_DOC_LINK}}

## Goals & Success Metrics

| Goal | Metric | Current | Target | How to Measure |
|------|--------|---------|--------|----------------|
| | | | | |

## Functional Requirements
<!-- MANDATORY: Use Given/When/Then or AC-NNN format. Minimum 3. -->

**AC-001**: Given [context], When [action], Then [outcome].
**AC-002**: ...
**AC-003**: ...

## Non-Functional Requirements
<!-- MANDATORY -->

- **Latency**: p99 < Xms for [operation] under [Y] RPS
- **Availability**: [X]% SLA
- **Error rate**: < [X]% errors
- **Data retention**: [X] days

## Design Decisions
<!-- Key technical choices. Reference ADRs if applicable. -->

| Decision | Options Considered | Chosen | Rationale |
|----------|--------------------|--------|-----------|
| | | | |

## Domain Responsibilities
<!-- For cross-domain features: what does each domain own? -->

| Domain | Responsibility |
|--------|---------------|
| | |

## Contract Changes
<!-- Any new or modified events/APIs? Reference CCH-XXX if applicable. -->

- [ ] No contract changes
- [ ] New event: ...
- [ ] Modified event: ... (see {{CCH_ID}})
- [ ] New API endpoint: ...

## Out of Scope
<!-- MANDATORY -->

- ...

## Risk & Rollback
<!-- MANDATORY -->

**Risks**:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| | | | |

**Feature flag**: `{{FLAG_NAME}}`
**Rollback strategy**: ...

## Dependencies
<!-- Other services, teams, or external systems this requires -->

- ...

## Open Questions
<!-- Must be resolved before implementation starts -->

- [ ] ...

---
## Spec Gate
- [ ] SPEC-001: Functional requirements defined (≥ 3 AC)
- [ ] SPEC-002: NFRs defined (latency, availability, error rate)
- [ ] SPEC-003: Out of scope explicitly listed
- [ ] SPEC-004: Rollback strategy defined
- [ ] SPEC-005: Contract changes identified (or explicitly none)
- [ ] SPEC-006: Design decisions documented
