---
name: spec-edge-case-pass
description: Run a fixed 8-category edge-case pass (user types, contexts of use, unexpected inputs and system failures, user error, feature interactions, load, security and privacy, accessibility) on a PRD, spec, user story or ticket to find missing failure and recovery behaviors before an AI coding agent or engineer builds it. Use whenever someone shares a spec and asks whether it is ready, what is missing, what could go wrong, to find edge cases or gaps, to harden acceptance criteria, or to prep a ticket for Claude Code, Cursor or Copilot, even if they never say "edge cases". Not for reviewing code that is already written.
---

# Spec Edge-Case Pass

## Why this exists

Incomplete specs used to be "safe enough" because a human engineer would hit the gap and ask about it in refinement. A coding agent does not ask. It fills the gap with a plausible default, writes the code with full confidence, the happy-path tests pass, and the failure shows up later in production.

- Human + incomplete spec → a question in refinement (recoverable)
- Agent + incomplete spec → wrong code that ships silently

The hidden safety net was someone else's confusion. When the reader of the spec is an agent, that net is gone.

The canonical example is a line from a real Shopify → QuickBooks connector PRD:

> "there could be 2 or more orders, whose aggregate sum should equal the payout amount. (if it doesn't then something is wrong 😁)"

The spec names the failure (the money doesn't add up) and then specifies nothing. A human laughs and asks "so what do we actually do when the sums don't match?" An agent picks "log a warning and book everything anyway," and unreconciled money lands in someone's accounting system.

Your job is to be the senior engineer in refinement that the agent will never have: make every failure mode and recovery behavior explicit before anything is built. Expect a lot. That "complete-looking" PRD — 8 features, API links, one clean $2,000 acceptance test — had 27 missing scenarios. Don't stop at the first handful.

## Inputs

- **The spec**: PRD, user story, ticket, design doc, or a pasted feature description. If none is provided, ask for it. If it's only a rough idea, run the pass anyway and label your assumptions.
- **Helpful context** (infer and state assumptions rather than blocking on these): who will build it (agent or human), the system of record, external systems it touches, what's explicitly out of scope.

## Workflow

### 1. Map the spec before hunting for gaps

Build a short inventory and keep it in the report:

- **Features** — number them F1…Fn using the spec's own wording.
- **Actors** — every human and system that reads or writes.
- **Writes** — every place the system changes external state (creates invoices, sends email, charges cards, deletes rows). Mark the irreversible ones; that's where silent defaults do the most damage.
- **Unit of work** — the thing that should succeed or fail as a whole: a payout, a file, a row, an order. Name it, because "fail closed" means nothing until you know what is being closed. If different steps have different units (validate the whole file, then write row by row), say so.
- **Source of truth** — for each piece of state, which system owns it. If the spec doesn't say, that's already a finding.
- **Happy path and existing acceptance tests** — note how many there are and whether any cover a failure.
- **Assumptions** — anything you're assuming about the surrounding system (multi-tenant, has automations, has roles). Findings that depend on an assumption say so.

Gaps cluster around writes, money/quantities, and ownership of state. You can't see the holes until you know what the system touches.

### 2. Sweep for named-but-unhandled failures

Before the categories, scan for places where the spec acknowledges a problem without saying what to do. These are the cheapest, highest-yield finds:

- Emoji, jokes, or exclamation marks doing the work of a requirement
- "something is wrong", "shouldn't happen", "edge case", "handle appropriately / gracefully", "as needed", "etc.", "TBD", "TODO", "we'll figure it out"
- "should equal / should match / should be" with no consequence stated for when it doesn't
- Conditionals with no else branch ("if the customer is verified, …")
- Passive voice that hides the actor ("the order is marked booked" — by whom, and does it matter?)
- Vague quantifiers: "large", "quickly", "a few", "recent", "regularly"

Every hit becomes a finding. Quote it verbatim so the author recognizes their own words.

### 3. Run the 8 categories — same order, every time

Run all eight, in this order, on every spec:

1. User types
2. Contexts of use
3. Unexpected inputs and system failures
4. User error
5. Feature interactions
6. Load
7. Security and privacy
8. Accessibility

The fixed order is the point. A vague intention to "think about edge cases" drifts toward whatever you happen to think of first, and the same categories get skipped every time (load, security and accessibility most often). A fixed sequence drags you through the ones you'd personally forget. If a category genuinely yields nothing, write one line saying why ("no end-user UI; admin-facing errors covered under 8") rather than silently dropping it — an explicit "checked, nothing material" is information; a missing heading is not.

Ask each category's probes against every feature in the inventory, especially the writes. The "silent default" under each category is what an agent typically builds when the spec says nothing; use it to fill the "likely agent default" column in your findings.

The probes are prompts, not a quota. Raise a finding about something the spec never mentions (plan tiers, automations, webhooks) only when it very likely exists in the surrounding system, and mark it "(Assumes …)". Speculative findings dilute the real ones.

**1. User types** — who uses this, and do they need different behavior?
- Roles and permissions: admin, standard, read-only, guest, support staff acting on a user's behalf, API/service accounts
- New vs existing or migrating users (data already in the target system before the first run)
- Single vs multiple accounts, tenants, stores, workspaces
- High-volume power users vs first-timers with no data
- Locale, region, currency, plan tier, feature flags
- *Silent default:* one user type, full permissions, no prior data, the builder's own locale and currency.

**2. Contexts of use** — when, where, and in what state is it used?
- First run, backfill of historical data, steady state, after a long gap, after reconnecting an integration
- Scheduled vs manually triggered vs event-driven (webhooks); what happens if two fire at once
- Environments and editions of external systems (sandbox vs production, regional or plan differences in third-party APIs)
- Time: timezones, period boundaries (month-end, fiscal close, DST), timestamps near midnight
- Device and network: mobile, offline, slow connections, expired sessions
- *Silent default:* steady state, a single trigger, the server's timezone, always online.

**3. Unexpected inputs and system failures** — what arrives that the happy path didn't picture, and what breaks mid-flight?
- Inputs: empty, zero, negative, null, huge, duplicated, malformed, out of order, wrong type, wrong units or currency, new variants the spec never listed (a new transaction type, a new status)
- Totals that don't reconcile, partial matches, rounding differences
- Dependencies: API down, timeouts, rate limits, auth or token expiry mid-process, schema changes, pagination that ends early, webhooks delivered twice or never
- Partial failure: if step 3 of 5 fails, what has already been written? Can the run resume? Is it idempotent?
- For every failure, the spec needs: halt, skip-and-flag, retry (how many times, with what backoff), or compensate/roll back — plus who is told, and what they see.
- *Silent default:* log a warning and continue; best-effort partial writes; naive retries or none; unknown variants silently skipped.

**4. User error** — what will real people do wrong?
- Wrong configuration (account mappings, settings), typos, duplicate submissions, double-clicks
- Manual edits in another system that conflict with this one (tagging, editing or deleting records the system created)
- Cancelling mid-way, re-running the same job, disconnecting and reconnecting, undo
- Misreading a status and acting on it
- Decide: is manually-entered state authoritative or ignored? How does the user recover? Does the error message say what to do next?
- *Silent default:* whichever field is most convenient — often a human-editable tag or note — is treated as authoritative state; no recovery path exists.

**5. Feature interactions** — where do features in this spec, or existing ones, touch the same data?
- Two features writing the same record, or one consuming another's output
- Ordering dependencies (F3 assumes F2 already ran)
- Concurrency: the same job triggered twice; a scheduled run overlapping a manual run
- Existing product behavior the new feature must respect: refunds, cancellations, edits, deletions, permissions, notifications
- Turning a feature off and on again: what happens to work in flight
- *Silent default:* each feature built in isolation, as if the others didn't exist.

**6. Load** — what happens at volume and at the extremes?
- Largest realistic input, and 10× that: batch sizes, pagination, memory, request time limits
- External rate limits and quotas; long jobs that outlive a request or a token
- Bursts (month-end, sales events), backlogs after an outage, backfills of years of history
- What users will feel: latency, and how long before a status is visible
- *Silent default:* everything loaded into memory in one request; no batching, pagination or timeout handling.

**7. Security and privacy**
- Who can trigger, view and configure; tenant isolation (can one customer ever see another's data?)
- Credentials and tokens: storage, scope (least privilege), rotation, revocation on disconnect
- Untrusted input: webhook signature verification, replay, injection
- Personal and financial data: what's stored, what's logged (error logs and alert emails are a common leak), retention, deletion requests
- Audit trail: who did what and when, especially for writes to financial or legal records
- *Silent default:* full payloads (with personal data) logged for debugging; broad token scopes; webhooks accepted unverified.

**8. Accessibility** — applies to "backend" features too: someone reads the statuses, errors, emails, reports and config screens.
- Status conveyed by more than color; error messages that say what happened and what to do
- Keyboard and screen-reader access to every UI, including admin and configuration screens and dialogs
- Notifications and emails readable as plain text; timeouts users can extend
- Plain language for non-specialists (a raw error code or stack trace is never the only message)
- *Silent default:* color-only status chips, raw error strings, no focus management in dialogs.

### 4. Write each gap as a scenario

Findings sit under their category heading, so each table has these columns (findings from step 2 go under whichever category fits best):

| Column | What to write |
|---|---|
| ID | EC-01, EC-02, … numbered in the order they appear, so IDs stay stable while you edit |
| Feature | F-number |
| Scenario | A concrete trigger: "payout of $2,000 where matched orders sum to $1,985", not "amount mismatch" |
| Spec today | Verbatim quote, or "Silent" |
| Likely agent default | What an agent would plausibly build if nothing changes. Be specific — this column is what makes the risk tangible to the reader. |
| Recommended behavior | One or two concrete, testable sentences. If it's a business call, propose a default and mark it **Decision needed (Dn)**. |
| Sev. | Critical / High / Medium / Low |

Keep cells short. The addendum carries the full detail and the acceptance tests: a Given/When/Then for every Critical and High finding, keyed by ID; Medium and Low get one when it's cheap.

Severity:
- **Critical** — the trigger is realistic in normal use *and* the harm is irreversible or external: wrong money movements or financial/legal records, records silently missing from a system of record, messages sent to the wrong people, data deleted or overwritten without recovery, security or privacy breach, cross-tenant exposure
- **High** — wrong persistent state a user will notice and must fix by hand; duplicates; stuck or half-finished states; irreversible harm from a rare trigger
- **Medium** — degraded experience with a workaround; recoverable errors with poor messaging
- **Low** — polish and rare cosmetic issues

If more than about a quarter of findings come out Critical, recheck them. An inflated Critical count hides the ones that matter.

### 5. Recommend behavior that's the opposite of the silent default

When proposing what *should* happen, these defaults are usually right — and they're usually the opposite of what an agent picks when the spec is silent:

- **Fail closed on irreversible writes.** If a precondition fails (totals don't reconcile, a reference is missing), write nothing for that unit of work (as named in the spec map) rather than a partial result.
- **Make failure visible, with evidence.** Set an explicit status (e.g. "Reconciliation failed"), include the figures that disagree and the delta, and notify a named role. A log line nobody reads isn't handling.
- **Idempotent by design.** Re-running the same input must not create duplicates. Name the idempotency key.
- **Checkpoint multi-step work.** After a mid-process failure (token expiry, timeout), resume from a known point or roll back. Never leave half-done state.
- **One source of truth per piece of state, named.** Human-editable fields in other systems are hints, not state, unless the spec explicitly says otherwise.
- **Explicit units.** Currency, timezone and precision are stated and converted deliberately, or the input is rejected — never assumed.
- **Unknown means stop and flag, not skip.** New or unrecognized input variants get surfaced, not silently dropped.
- **Don't invent business policy.** When the right answer depends on the business (how refunds are booked, tolerance thresholds, which exchange rate), propose a default and mark it Decision needed. An unresolved decision blocks the related build.
- **Cutting scope is a valid recommendation.** When one feature's edge cases need a spec of their own (an automatic email send, a backfill), recommend deferring it rather than patching it with ten rows.

### 6. Prioritize and cut

- Merge duplicates; every finding should be distinct.
- Within each category, order by severity. Then pick the 3–5 most important findings across all categories for **Top risks** in the summary, so a reader sees priority without scanning eight tables.
- Don't pad. A finding needs a concrete trigger and a consequence — "consider performance" isn't one. The count follows the spec: an 8-feature PRD can honestly yield 27; a one-story ticket might yield 5.
- Name the themes. When several findings share a root ("what happens when the money doesn't match the happy path?"), say so in the Themes section — a theme usually points to a whole missing section of the spec, which is more useful to the author than five separate rows.

## Output

Use this structure:

```markdown
# Edge-case pass: [spec name]

## Summary
[Verdict first: is this safe to hand to a coding agent as-is? Then the count
(N gaps, how many Critical / High) and the decisions that block the build.]

**Top risks**
1. EC-xx — [one line]
… (3–5 in total)

## Spec map
Features (F1…Fn) · Actors · External writes (irreversible marked) · Unit of work ·
Source of truth per piece of state · Existing acceptance tests · Assumptions

## Named-but-unhandled
| Quote | What's missing |   ← end each row with the EC IDs it led to

## Themes
[One line per theme: the root question, the IDs it covers, and the spec section it shows is missing]

## Findings
### 1. User types
| ID | Feature | Scenario | Spec today | Likely agent default | Recommended behavior | Sev. |
### 2. Contexts of use
… through …
### 8. Accessibility
Checked — nothing material: [reason, e.g. "no end-user UI; alert email wording covered by EC-xx"]

## Decisions needed
1. **D1 — [the question]** Proposed default: … Blocks: EC-…

## Agent-ready addendum
[See below]
```

### The agent-ready addendum

This section is what actually closes the gap. Write it so it can be pasted straight into a coding agent's context or appended to the spec:

- Open with one line saying the addendum wins where it conflicts with the spec, and list the assumptions it relies on ("If any of these is wrong, stop and ask").
- **Blocking** items first: "Do not implement [area] until D2 is resolved," with what to build in the meantime if anything.
- Imperative, testable statements grouped by feature: "When X, do Y. Do not Z."
- Given/When/Then acceptance tests keyed by EC ID: every Critical and High finding, plus Medium/Low where cheap.
- End with this standing instruction, adapted to the domain:

  > If you encounter a case this spec and addendum don't cover — especially partial failure, mismatched totals, duplicate runs, unknown input types, or conflicting state between systems — do not choose a behavior yourself. Fail closed for that unit of work, surface it with the evidence, and ask.

## Scaling

- **Single story or small ticket**: a one-line map, all eight categories (one line each for the empty ones), a short findings table, and the addendum. Still run all eight — the categories that feel irrelevant are where misses hide.
- **Full PRD**: the full structure. For calibration, the original pass on an 8-feature PRD took a careful human about 20 minutes and found 27 gaps — match that depth of thinking, but don't mistake length for thoroughness. Terse table cells, detail in the addendum.
- **Several related specs**: one report per spec, plus a cross-spec feature-interactions section.
- If the user asked a yes/no question ("is it ready?"), the first sentence of the Summary answers it.
- If the user wants only the list or only the addendum, give them that, but still run the full pass underneath.

## Worked example

`references/worked-example.md` is an excerpt of a full pass on the Shopify → QuickBooks connector, in this exact output format, including the six money-path findings from the emoji line and examples for the categories people usually skip. Read it the first time you use this skill, or whenever you need to calibrate how specific a finding should be.
