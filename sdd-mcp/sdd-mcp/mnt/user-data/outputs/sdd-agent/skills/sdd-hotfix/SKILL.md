---
name: sdd-hotfix
description: >
  Guides humans through the SDD hotfix and bug path — routing the incident to the right
  repo, creating the minimal spec required by the Operating Model, and ensuring a follow-up
  hardening spec is created. Trigger this skill when there is a production incident, an
  urgent bug, or any situation where someone says "production is down", "we have a critical
  bug", "we need to fix this now", "payments are failing", "this is a hotfix", or "we broke
  something in prod". Also trigger for non-urgent bugs when someone asks "how do I handle
  a bug in SDD" or "do I need a spec for a bug fix". Speed is supported — but traceability
  is never skipped.
---

# Hotfix and Bug Skill

You guide humans through the SDD hotfix and bug paths. The key principle: speed is
supported on the hotfix path, but governance is never skipped. Every fix produces a
traceable artifact, even under production pressure.

---

## Step 1 — Triage: Routing Decision

Before anything else, answer this question:

```
Is this hotfix:

A) Component-only?
   → It affects only one service's internals, no events/APIs change,
     no platform policies are violated.
   → Route: Component Repo (create Hotfix Spec locally)

B) Contract-changing?
   → It requires modifying an event schema, API contract, or consumer behavior.
   → Route: Platform Repo FIRST — create Contract Change Spec, update Integration MCP,
     THEN component can implement.

C) Policy-violating?
   → The fix requires an exception to a platform policy (security, observability, NFR).
   → Route: Platform Repo FIRST — create policy exception ADR,
     THEN component can implement.
```

Ask the human: "Does this fix change any event schema, API contract, or require breaking
a platform policy?" If no → Component Repo. If yes → Platform Repo first.

---

## Step 2a — Normal Bug (non-urgent)

For non-urgent bugs, use a lightweight Component Spec:

```markdown
# Bug Spec: BUG-<number> — <Short Description>

## Metadata
- ID: BUG-<number>
- Component: <service name>
- Implements: [link to original spec that introduced this behavior, if known]
- Status: Draft

## Reproduction
- Steps to reproduce:
  1.
  2.
- Expected: <what should happen>
- Actual: <what happens instead>
- Impact: <users affected, revenue impact, error rate>

## Root Cause Hypothesis
<Most likely cause based on logs, metrics, or code review>

## Fix Plan
<Minimal change to correct the behavior without introducing new risk>

## Tests
- Unit tests:
- Integration tests:
- Regression test: <how to verify this doesn't recur>

## Gate Check (quick)
- Fix is scoped to this component only: yes / no
- No contract changes required: yes / no
- Logging/observability preserved: yes / no
```

After the fix: update `spec-graph.json` with the Bug Spec ID and link to the incident.

---

## Step 2b — Hotfix (production, urgent)

For production incidents, use the minimal Hotfix Spec. Get this created FAST — it is short
by design. Do not let perfection block speed.

```markdown
# Hotfix Spec: HOTFIX-<number> — <Short Description>

## Metadata
- ID: HOTFIX-<number>
- Component: <service name>
- Status: In Progress
- Follow-up Spec: [to be created post-incident]

## Issue
- What is failing: <specific behavior or error>
- Impact: <users affected | revenue | SLA breach | error rate>
- Started: <approximate time>

## Root Cause Hypothesis
<Based on logs/metrics — what do you think caused this?>

## Fix
<Minimal change to restore service. Be specific: file, function, config key, etc.>

## Rollback
<Exact steps to revert if this fix makes things worse:
- git revert <commit>
- feature flag: disable X
- redeploy: version N-1>

## Validation
<Which specific metric or log confirms the fix is working:
- e.g., "error rate on /api/checkout drops below 0.1%"
- e.g., "log event 'payment.authorized' appears in Datadog">

## Follow-up Spec
[Required. Create this after incident is resolved.]
Link: [to be filled in]
```

---

## Step 3 — Implement the Fix

For Component-only hotfix:
- Run `/speckit.implement` with the Hotfix Spec as context
- Or implement directly if the fix is a one-liner config/flag change
- Verify using the `Validation` criterion from the Hotfix Spec

For Contract-changing hotfix:
- Wait for the Contract Change Spec to be approved in Platform Repo first
- Then implement the component-side change

---

## Step 4 — Verify and Close

After the fix is deployed and validated:
1. Confirm the `Validation` metric/log shows recovery
2. Update Hotfix Spec status to `Done`
3. Update `spec-graph.json` with the Hotfix ID and link to incident
4. Notify affected teams if a contract changed

---

## Step 5 — Follow-up Spec (required)

Every hotfix MUST produce a Follow-up Spec within the next sprint. This is not optional.

The Follow-up Spec covers:
- Full test suite for the fixed behavior
- Refactor if the fix introduced tech debt
- ADR if a decision was made under pressure
- Contract Spec if a contract was touched (even informally)
- Post-mortem notes: what invariant was violated, what gate would have caught this

```markdown
# Follow-up Spec: FOLLOWUP-<hotfix-number> — Hardening

## Metadata
- ID: FOLLOWUP-<n>
- Related Hotfix: HOTFIX-<n>
- Status: Draft

## What the Hotfix Did
<Summary of the emergency fix>

## What Still Needs to Be Done
- [ ] Full test coverage for the fixed behavior
- [ ] Refactor: <describe if applicable>
- [ ] ADR: <describe decision made under pressure, if any>
- [ ] Contract Spec: <describe if a contract was touched>
- [ ] Domain MCP update: <describe if an invariant was missing>
- [ ] Platform MCP update: <describe if a policy was insufficient>

## Gate Check
[Run full gate validation on this follow-up spec before closing]
```

---

## Hotfix Governance Reminders

If someone tries to skip the Hotfix Spec:

> "The Operating Model allows fast implementation on the hotfix path. The minimal spec
> takes 10 minutes to write and preserves traceability permanently. We write it first,
> then fix. The alternative is an incident with no record of what was wrong, what was
> changed, or how to roll it back."

If someone tries to skip the Follow-up Spec:

> "The Follow-up Spec is where the system learns from incidents. Without it, the same
> class of bug will recur, the decision made under pressure will never be documented,
> and the gap that caused the incident (missing invariant, missing gate check, missing
> test) stays open. It goes in the next sprint, not someday."
