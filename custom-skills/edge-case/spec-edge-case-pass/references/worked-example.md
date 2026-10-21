# Worked example: Shopify → QuickBooks payout connector

A calibration example in the exact output format. EC-01, EC-03 and EC-05 to EC-08 are the six money-path scenarios from the original review of this PRD; EC-04 is the fee question the emoji line hides. The excerpt was chosen for the money path, which is why it's mostly Critical; the full 27 are not. The rest are illustrative of what the pass surfaces in the categories people usually skip — they show the expected specificity, not the original PRD's exact contents.

---

# Edge-case pass: Shopify → QuickBooks connector

## Summary

**Not safe to hand to a coding agent as-is.** 27 gaps across 8 features (12 shown in this excerpt: 7 Critical, 4 High, 1 Medium). The PRD has no section on reconciliation failure at all, and its only acceptance test is a clean $2,000 payout, so an agent will pick log-and-continue behavior in exactly the places that corrupt the books. Build is blocked on D1 (reconciliation formula) and D2 (exchange rates).

**Top risks**
1. EC-03 — a payout that doesn't reconcile gets booked anyway
2. EC-08 — re-running a payout creates duplicate invoices
3. EC-06 — a token expiry mid-run leaves a half-booked payout
4. EC-07 — a manual "Booked" tag means an order is never invoiced
5. EC-01 — NZD amounts written into a USD company as dollars

## Spec map

- **Features**: F1 Connect stores · F2 Fetch payouts · F3 Match orders to payout · F4 Create invoices · F5 Record payments · F6 Order status sync · F7 Scheduled sync · F8 Admin dashboard *(labels illustrative)*
- **Actors**: store admin, bookkeeper/accountant, Shopify API, QuickBooks API, scheduler
- **External writes**: invoices, payments, credit memos in QuickBooks — all **irreversible in practice** (removing them after a period is closed is an accounting problem, not a code problem)
- **Unit of work**: one payout. It is booked completely or not at all.
- **Source of truth**: *not stated* for "has this order been booked?" → EC-07
- **Existing acceptance tests**: one, the happy path ($2,000 payout, orders sum exactly). No failure tests.
- **Assumptions**: one QuickBooks company per store; the connector keeps its own database.

## Named-but-unhandled

| Quote | What's missing |
|---|---|
| "there could be 2 or more orders, whose aggregate sum should equal the payout amount. (if it doesn't then something is wrong 😁)" | What the system does when the sum doesn't equal the payout; what "aggregate sum" includes (fees, refunds, adjustments); who is told. → EC-03, EC-04, EC-05 |

## Themes

- **"What happens when the money doesn't match the happy path?"** — EC-01, EC-03 to EC-08. The PRD needs a whole "Reconciliation and failure handling" section.
- **Who owns booking state** — EC-07, EC-08, EC-09. The PRD needs to name the connector's ledger as the source of truth and define the idempotency key.

## Findings (excerpt)

### 1. User types

| ID | Feature | Scenario | Spec today | Likely agent default | Recommended behavior | Sev. |
|---|---|---|---|---|---|---|
| EC-01 | F1/F4 | NZ merchant: store currency NZD, QuickBooks home currency USD | Silent | Writes NZD amounts into the USD company as if they were dollars | Compare currencies at connect time. With QuickBooks multicurrency on, write in NZD at a stated rate (**D2**); otherwise block setup with an explanation. | Critical |

### 2. Contexts of use

| ID | Feature | Scenario | Spec today | Likely agent default | Recommended behavior | Sev. |
|---|---|---|---|---|---|---|
| EC-02 | F2/F7 | Merchant connects a store with two years of payout history | Silent | Backfills everything, possibly into a closed accounting period — or silently starts from today | Ask for a start date at connect time; never write into a closed period. **Decision needed D3.** | High |

### 3. Unexpected inputs and system failures

| ID | Feature | Scenario | Spec today | Likely agent default | Recommended behavior | Sev. |
|---|---|---|---|---|---|---|
| EC-03 | F3/F4 | Payout of $2,000; matched orders sum to $1,985 | "something is wrong 😁" | Log a warning and book everything anyway | Book nothing for the payout. Status "Reconciliation failed" with payout amount, matched sum and delta; notify the admin. No partial bookings. | Critical |
| EC-04 | F3 | Payout is net of processing fees and an adjustment, so gross orders never equal it | "aggregate sum should equal the payout" | Compares gross totals → every real payout fails, or a tolerance is invented to make it pass | Define the reconciliation formula (fees, refunds, adjustments, chargebacks, reserves) and the accounts each posts to. **Decision needed D1.** | Critical |
| EC-05 | F3/F4 | Payout includes a $120 refund on an earlier order | Silent | Creates a negative "invoice", or silently skips the refund | Record the refund as a credit memo against the original customer/invoice; the payout must still fully reconcile before anything is written. | Critical |
| EC-06 | F4/F5 | QuickBooks token expires after 14 of 40 invoices are written | Silent | Leaves a half-booked payout; the next run starts over or skips it | Checkpoint each write. On auth failure, stop, mark "Interrupted — reconnect to resume", and resume idempotently after reconnect. | Critical |

### 4. User error

| ID | Feature | Scenario | Spec today | Likely agent default | Recommended behavior | Sev. |
|---|---|---|---|---|---|---|
| EC-07 | F6 | Admin manually tags an order "Booked" in Shopify before the connector runs | Silent | Treats the tag as authoritative → the order is never invoiced | Ignore the tag. The connector's ledger (Shopify order ID ↔ QuickBooks record ID) is the source of truth; optionally flag the mismatch. | Critical |
| EC-08 | F4/F5 | The same payout is processed twice (manual re-run, or retry after a crash) | Silent | Creates duplicate invoices and payments | Idempotent on payout ID + Shopify transaction ID; a re-run skips what's in the ledger and reports "already booked". | Critical |

### 5. Feature interactions

| ID | Feature | Scenario | Spec today | Likely agent default | Recommended behavior | Sev. |
|---|---|---|---|---|---|---|
| EC-09 | F7/F8 | A scheduled sync and a manual "sync now" pick up the same payout at once | Silent | Both runs book it | Per-payout lock; the second run exits with "already in progress". EC-08's key is the backstop. | High |

### 6. Load

| ID | Feature | Scenario | Spec today | Likely agent default | Recommended behavior | Sev. |
|---|---|---|---|---|---|---|
| EC-10 | F2/F4 | Holiday payout with 3,000 orders | Silent | Fetches and writes everything in one request; hits rate limits or a timeout halfway | Paginate fetches, batch writes within API limits, run as a background job with progress on the dashboard; checkpoint per EC-06. | High |

### 7. Security and privacy

| ID | Feature | Scenario | Spec today | Likely agent default | Recommended behavior | Sev. |
|---|---|---|---|---|---|---|
| EC-11 | F3/F8 | Reconciliation-failure alert email | Silent | Includes full order payloads with customer names, emails and addresses | Alerts and logs carry order IDs and amounts only. Tokens encrypted, narrowest scopes, revoked on disconnect. | High |

### 8. Accessibility

| ID | Feature | Scenario | Spec today | Likely agent default | Recommended behavior | Sev. |
|---|---|---|---|---|---|---|
| EC-12 | F8 | Payout status on the dashboard | Silent | A red/green dot, and a raw API error string on failure | Status as text plus icon; failures in plain language with the next action (see EC-03 test). Dashboard keyboard- and screen-reader-accessible. | Medium |

*(EC-13 to EC-27 omitted from this excerpt.)*

## Decisions needed

1. **D1 — What does a payout reconcile against?** Proposed default: orders − refunds − fees ± adjustments, chargebacks and reserves, to the cent; fees post to a named expense account. Blocks EC-03, EC-04, EC-05.
2. **D2 — Which exchange rate, from when?** Proposed default: the rate on the payout date from QuickBooks' own rate table. Blocks EC-01.
3. **D3 — Backfill policy.** Proposed default: admin picks a start date at connect time; nothing is written into a closed period. Blocks EC-02.

## Agent-ready addendum (excerpt)

> Paste this into the coding agent's context with the PRD. Where they conflict, this addendum wins. It assumes one QuickBooks company per store and a connector-owned database; if either is wrong, stop and ask.

**Blocking**
- Do not implement F3 reconciliation until D1 is resolved, or F2 backfill until D3 is resolved. Do not write any non-home-currency amount until D2 is resolved.

**F3 Match orders to payout**
- Compute the expected payout per D1 and compare to the payout amount exactly, to the cent.
- When they differ, write nothing to QuickBooks for that payout. Set status "Reconciliation failed" and store payout amount, expected amount and delta. Notify the store admin. Do not book a subset of orders.
- A transaction type not listed in D1 is a reconciliation failure, not a skip.

**F4/F5 Invoices and payments**
- Idempotency key: payout ID + Shopify transaction ID, recorded in the connector ledger. If the key exists, skip and report "already booked".
- Ignore Shopify order tags when deciding whether an order is booked. The connector ledger is the only source of truth.
- Checkpoint after each successful write. On auth failure or timeout, stop, set status "Interrupted", and resume from the checkpoint after reconnect.

**Acceptance tests**
- **EC-03** Given a $2,000.00 payout whose matched orders sum to $1,985.00, when the connector processes it, then no invoices, payments or credit memos exist in QuickBooks for that payout, its status is "Reconciliation failed" showing $2,000.00 / $1,985.00 / −$15.00, and the admin has been notified.
- **EC-06** Given the QuickBooks token expires after 14 of 40 writes, when the admin reconnects and the run resumes, then exactly 40 invoices exist and none is duplicated.
- **EC-07** Given an order tagged "Booked" in Shopify with no ledger entry, when its payout is processed and reconciles, then an invoice is created for it.
- **EC-08** Given a payout already fully booked, when it is processed again, then QuickBooks has the same invoices and payments as before and the run reports "already booked".

> If you encounter a case this spec and addendum don't cover — especially partial failure, mismatched totals, duplicate runs, unknown transaction types, or conflicting state between Shopify and QuickBooks — do not choose a behavior yourself. Write nothing for that payout, surface it with the figures, and ask.
