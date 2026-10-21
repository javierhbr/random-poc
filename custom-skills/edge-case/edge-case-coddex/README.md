# Edge Case Skill Package

Files:
- `SKILL.md` — core skill and workflow
- `references/edge-case-reference.md` — eight-category checklist, failure/recovery, idempotency, reconciliation, SDD handoff
- `templates/review-template.md` — reusable review output
- `examples/shopify-quickbooks-connector.md` — worked example covering mismatch, refunds, manual Booked tag, replay, auth interruption, and currencies

Suggested invocation:

`Use $edge-case to review this PRD before implementation. Run all eight categories in order. Identify missing behaviors, separate confirmed requirements from proposals, and produce decision questions, spec changes, and acceptance scenarios.`

Principle:
Human + incomplete spec -> recoverable question.
Agent + incomplete spec -> risk of silently shipping invented behavior.

The skill makes failure modes, recovery, and unresolved product decisions explicit before implementation.
