# Worked Example — Shopify → QuickBooks Connector

## Original gap

> “There could be 2 or more orders, whose aggregate sum should equal the payout amount. (if it doesn’t then something is wrong 😁)”

This names a failure but does not specify behavior. An agent must not invent the missing policy.

## Scenario 1 — Transaction sum != payout

Missing decisions:
- Exact reconciliation formula
- Currency/accounting basis
- Precision/rounding/tolerance
- Whether any booking is allowed before reconciliation passes
- Failure status
- Diagnostic figures
- Notification
- Resolution/retry

Recommended behavior **only if approved**:
- Halt booking for that payout.
- Mark `Reconciliation failed`.
- Preserve payout total, transaction total, and delta.
- Notify/queue for the responsible operator.
- Do not book partial matches.
- Require reconciliation to pass before continuing.

Acceptance candidate:
**Given** payout total = 2000 and eligible transactions total = 1985  
**When** reconciliation runs  
**Then** the payout is not marked booked  
**And** no new accounting writes for the payout are initiated  
**And** the mismatch records 2000, 1985, and delta 15.

## Scenario 2 — Payout contains refund

Do not invent whether a refund maps to a credit memo, negative invoice, skipped transaction, or another accounting construct.

Decide:
- Approved accounting mapping
- Link to original sale
- Full/partial refund behavior
- Refund larger than original
- Reconciliation treatment
- Unsupported/missing original behavior

If product/accounting approves “credit memo”, add it as a confirmed requirement; before approval it remains a proposal.

## Scenario 3 — Admin manually tags order “Booked”

A display/manual tag may not prove an accounting record exists.

Decide:
- Authoritative source of truth
- Meaning of the manual tag
- Conflict behavior when tag and connector ledger/provider evidence disagree
- Override permissions/audit

Recommended default for discussion: use connector/provider evidence as authoritative and treat the tag as non-authoritative unless product explicitly defines otherwise.

## Scenario 4 — Same payout re-runs

Invariant: one business payout must not create duplicate accounting effects.

Define:
- Stable payout/business-operation identity
- Exact replay behavior
- Concurrent replay behavior
- Same identity with changed contents
- Dedupe evidence retention
- Recovery if QuickBooks write succeeded but local checkpoint did not

## Scenario 5 — Authentication failure mid-process

A generic “retry after login” is insufficient.

For each write track:
- Not attempted
- Confirmed succeeded
- Confirmed failed
- Outcome unknown

If auth/network failure happens after request transmission, determine whether the remote effect exists before retrying. Persist progress, restore authorization, then resume/reconcile safely. Do not leave the payout falsely marked complete.

## Scenario 6 — Non-USD currency

Decide:
- Supported payout/company currencies
- Currency source of truth
- Whether conversion is allowed
- Exchange-rate source/time if conversion exists
- Precision/rounding
- Unsupported currency behavior
- Mixed-currency payout behavior

Never write an amount denominated in one currency as if it were another.

## Cross-cutting acceptance tests

At minimum test:
1. Clean reconciled payout.
2. Mismatch.
3. Refund.
4. Exact replay.
5. Concurrent replay.
6. Auth failure before any write.
7. Auth/network loss after request transmission with outcome unknown.
8. Crash after remote success before local checkpoint.
9. Unsupported currency.
10. Manual tag conflicts with connector/provider evidence.
11. Large paginated payout.
12. Permission revoked during processing.

## Readiness example

“Happy-path implementation can proceed. Production booking remains blocked until reconciliation-failure policy, refund accounting mapping, replay/idempotency behavior, and currency rules are approved. External provider capabilities needed for uncertain-write discovery must also be verified.”
