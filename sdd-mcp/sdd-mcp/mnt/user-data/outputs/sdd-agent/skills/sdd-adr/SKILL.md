---
name: sdd-adr
description: >
  Guides humans through creating, tracking, and resolving Architecture Decision Records (ADRs)
  within the SDD Operating Model. Trigger this skill when someone needs to create an ADR,
  when /speckit.clarify surfaces an unresolved question, when a spec is BlockedBy an ADR,
  when someone asks "how do I resolve this ADR", "what should go in an ADR", "my spec is
  blocked", "we can't agree on the idempotency approach", or "I need to make a technical
  decision before we can proceed". Also trigger when someone needs to know whether an ADR
  should be Global (Platform Repo) or Local (Component Repo).
---

# ADR Skill

You help humans create, track, and resolve Architecture Decision Records that gate
implementation in the SDD Operating Model. An ADR is not optional documentation — it is
a first-class artifact that blocks implementation until resolved.

---

## Step 1 — Determine ADR Scope

Before creating the ADR, answer:

**Is this decision cross-cutting or component-local?**

| Question | If Yes → |
|---|---|
| Does it affect more than one component/domain? | Global ADR → Platform Repo `/adr/` |
| Does it affect a platform policy (security, NFR, versioning)? | Global ADR → Platform Repo `/adr/` |
| Does it affect a contract or shared event schema? | Global ADR → Platform Repo `/adr/` |
| Does it only affect one component's internal implementation? | Local ADR → Component Repo `/adr/` |

**Rule:**
- **Global ADR**: blocks any component that depends on the decision. Owned by Platform Architect or designated ADR Owner.
- **Local ADR**: blocks only this component's implementation. Does not block other components.

---

## Step 2 — Draft the ADR

Use this template. File name: `ADR-<number>-<short-kebab-title>.md`

```markdown
# ADR-<number>: <Title>

## Status
Proposed

## Date
<YYYY-MM-DD>

## Context
<What is the situation? Why is a decision needed now? What constraints exist?>

## Decision Drivers
- <Driver 1: e.g., consistency with Platform MCP security policy>
- <Driver 2: e.g., performance target of p95 < 300ms>
- <Driver 3: e.g., existing contract consumers who cannot be broken>

## Options Considered

### Option A: <Name>
<Description>

Pros:
- <pro 1>

Cons:
- <con 1>

### Option B: <Name>
<Description>

Pros:
- <pro 1>

Cons:
- <con 1>

## Decision
[Leave as PENDING until approved — do not fill in prematurely]

## Consequences
[Fill in after decision is made]

## Owner
<Name / team responsible for resolving this ADR>

## Blocks
- <SPEC-ID or PLAT-ID that is waiting on this ADR>

## References
- <Link to relevant Platform MCP section, if applicable>
- <Link to relevant contract, if applicable>
```

---

## Step 3 — Link the ADR to Blocked Specs

For every spec that cannot proceed without this ADR being resolved:

1. In the spec's Metadata block:
   ```
   Blocked By: ADR-<number>
   ```

2. In `spec-graph.json`:
   ```json
   "SPEC-PAY-01": {
     "blocked_by": ["ADR-219"],
     "status": "Blocked"
   }
   ```

3. In the ADR's `Blocks` section, list the spec IDs.

---

## Step 4 — Move Through Review

ADR states:
```
Proposed → In Review → Approved
                    → Rejected
```

**Proposed:** ADR is drafted, needs review.

**In Review:** Owner has been assigned. Stakeholders (PM, Platform Architect, Domain Owner) are reviewing. This state is required before any fan-out task proceeds — it signals the decision is being actively worked.

**Approved:** Decision is made. Unblock all dependent specs.

**Rejected:** Decision went another way. Affected specs must be updated to reflect the rejected path.

---

## Step 5 — Resolving the ADR

When the ADR reaches Approved:

1. Fill in the `Decision` and `Consequences` sections of the ADR file.
2. Set ADR status to `Approved`.
3. In every blocked spec: remove `BlockedBy: ADR-<number>` or set it to `[]`.
4. In `spec-graph.json`: update `blocked_by` to `[]` and `status` to the prior state (usually `Approved` or `Draft`).
5. Notify the component team: "ADR-219 is resolved. Your spec is unblocked. Recheck Gate 5."

When the ADR is Rejected:
1. Update each blocked spec to reflect the rejected path.
2. If the rejection means a fundamental redesign, the spec may need to go back to Draft.

---

## Common ADR Triggers from /speckit.clarify

These are the most frequent ambiguities that become ADRs:

| Ambiguity | ADR topic |
|---|---|
| How are retried operations made safe? | Idempotency strategy |
| When does a guest session expire? | Session lifecycle / TTL policy |
| Which service generates a shared ID? | ID ownership |
| How does Service B handle duplicate events? | Event deduplication strategy |
| Which version of the contract is the canonical one? | Contract versioning decision |
| Can Service A read Service B's data directly? | Domain boundary decision |
| What happens when the external payment provider is down? | Failure mode / circuit breaker strategy |

---

## ADR Anti-Patterns to Avoid

- **Don't fill in the Decision before review.** Premature decisions bypass the review process.
- **Don't create a Global ADR for a local concern.** It blocks unrelated components.
- **Don't leave ADRs in Proposed indefinitely.** If no owner is assigned, assign one now.
- **Don't skip the ADR because "we'll figure it out in code."** That is exactly the tribal knowledge this system prevents.
- **Don't close an ADR as Approved without updating all blocked specs.** Orphaned `BlockedBy` entries stall implementations silently.
