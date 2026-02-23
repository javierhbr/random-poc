# Core Engineering Principles

> Version: 1.0.0 | Always applies to all components and changes

---

## MUST — Non-Negotiable Rules

### Architecture
- **MUST** follow bounded context boundaries — no service accesses another service's database directly
- **MUST** communicate cross-domain via events or APIs, never via shared tables
- **MUST** be backwards compatible when changing any public API or event schema
- **MUST** document every architectural decision in an ADR when deviating from established patterns
- **MUST** declare all dependencies (APIs consumed, events consumed/emitted) in component.yaml

### Code Quality
- **MUST** have unit test coverage ≥ 80% for all new code
- **MUST** have integration tests for any new API endpoint or event emitter
- **MUST** not introduce cyclic dependencies between services
- **MUST** handle all error cases explicitly — no silent failures

### Deployability
- **MUST** be deployable independently without coordinated deploys across services
- **MUST** support feature flags for any user-facing change
- **MUST** define a rollback strategy before implementation starts
- **MUST** pass all gates before merging to main

### Data
- **MUST** never expose raw database IDs in public APIs — use UUIDs
- **MUST** version all public API endpoints (v1, v2...)
- **MUST** treat any field containing user identity as PII

---

## SHOULD — Strong Recommendations

- **SHOULD** prefer additive changes over breaking changes
- **SHOULD** document non-obvious business logic inline
- **SHOULD** emit domain events for any significant state change
- **SHOULD** use idempotency keys for all mutation operations
- **SHOULD** implement circuit breakers for calls to external services

---

## MAY — Optional Best Practices

- **MAY** use caching for read-heavy operations (document TTL and invalidation strategy)
- **MAY** implement optimistic locking for high-contention resources
- **MAY** use CQRS for components with significantly different read/write patterns
