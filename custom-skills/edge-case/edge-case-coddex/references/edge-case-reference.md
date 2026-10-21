# Edge-Case Reference

## Fixed 8-category pass

### 1. User types
Check new/returning users, admins, operators, approvers, auditors, support, service identities, partial permissions, removed users, role changes, owners/collaborators, and multiple tenants.
Questions: Who can start/observe/cancel/retry/override/resolve? What if permissions change mid-flow? What is authoritative when human-visible state conflicts with system evidence?

### 2. Contexts of use
Check device/context where relevant, intermittent network, reconnect, background execution, session expiry, restart, locale/language, date/time zone/DST, currency, different organizations/configurations, and version skew.
Questions: Can work resume? Which time zone/currency is authoritative? Can context change stored-data meaning?

### 3. Unexpected inputs and system failures
Check missing/null/malformed/duplicate/stale/contradictory data; zero/negative/extreme values; precision; mismatched totals; unknown states; API errors; rate limits; timeouts; outages; partial pagination; persistence failure; remote success with lost acknowledgement; crashes; duplicate/out-of-order events.
Questions: Which invariant fails? Halt/skip/quarantine/reconcile/compensate/retry/manual? What effects are prohibited? Is outcome known? How is recovery proven?

### 4. User error
Check double submit, wrong selection/account/range, accidental cancellation, manual tags/status changes, repeated actions after delayed feedback, edits during processing, wrong config, and undo after irreversible effects.
Questions: Can it be prevented/reversed? What is source of truth? Is retry safe?

### 5. Feature interactions
Check refunds, credits, voids, edits, scheduled + manual runs, import + sync + webhooks, approvals, notifications, caches, existing/manual records, feature flags, migrations, currencies, taxes, discounts, and fees.
Questions: Does one feature invalidate another’s assumptions? Can two paths create the same effect? Who owns authoritative state?

### 6. Load
Check empty/one/huge batch, huge payload, pagination, concurrency, bursts, queue backlog, rate limits, resource exhaustion, long operations, and partial retrieval.
Questions: Is chunked behavior correct? Can concurrency duplicate/reorder? What happens at limits? Is progress durable?

### 7. Security and privacy
Check auth expiry/revocation, per-action authorization, tenant isolation, secrets, sensitive logs/errors, replay/tampering, privilege escalation, audit trail, retention/deletion, least privilege.
Questions: Can actors cross tenant boundaries? What if authorization changes mid-process? Does recovery bypass protections?

### 8. Accessibility
For user-facing flows check keyboard operation, screen readers, focus after errors, non-color-only errors, async status, timeout recovery, labels, destructive confirmations, zoom/reflow/touch targets.
Questions: Can users perceive failure/completion and execute recovery?

## Failure and recovery contract

For each material failure define:
1. Detection
2. Invariant
3. Effects already possible
4. Prohibited effects
5. Durable state/checkpoint
6. User/operator visibility
7. Recovery
8. Recovery authority
9. Completion evidence

## Outcome taxonomy

External writes can be:
- `NOT_ATTEMPTED`
- `CONFIRMED_SUCCEEDED`
- `CONFIRMED_FAILED`
- `OUTCOME_UNKNOWN`

For `OUTCOME_UNKNOWN`, require a safe resolution mechanism such as verified provider idempotency, query by stable identifier, provider operation ID, reconciliation/search before retry, or manual verification. Do not assume provider capabilities.

## Idempotency contract

Define business operation identity, uniqueness scope, idempotency key, exact replay result, changed-payload behavior, dedupe retention, concurrent requests, and remote-success-before-local-checkpoint recovery.

## Partial progress contract

For `A -> B -> C -> D`, inspect failure after A, B, and C. Determine durable steps, external effects, safe repeats, discovery-before-retry, resume point, compensation, compensation failure, and audit needs.

## Reconciliation contract

Define formula, included/excluded records, currency/accounting basis, precision/rounding, tolerance, cutoff/timing, duplicates/missing records, mismatch behavior, prohibited writes, diagnostic figures, resolution/retry, and evidence that reconciliation passed.

## SDD handoff

Use:
`Source/version -> Finding ID -> Decision -> Requirement ID -> Component contract -> Acceptance scenario -> End-to-end test`

Place business policy/invariants/user-visible behavior in PRD; cross-component ownership/invariants/end-to-end states in Platform Spec; inputs/outputs/state/error/idempotency/recovery contracts in Component Specs; consequential technical architecture choices in ADRs.

Handoff states:
- `READY`
- `READY_WITH_DEPENDENCY`
- `BLOCKED_DECISION`
- `BLOCKED_CONFLICT`
- `BLOCKED_EVIDENCE`
- `NON_BLOCKING`
