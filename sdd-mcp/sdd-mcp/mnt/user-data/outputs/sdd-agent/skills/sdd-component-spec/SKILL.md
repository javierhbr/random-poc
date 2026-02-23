---
name: sdd-component-spec
description: >
  Guides component team engineers and tech leads through creating an OpenSpec Component
  Implementation Spec in their Component Repo. Trigger this skill when someone has received
  a fan-out task from the Platform Repo and needs to write the "how" for their service,
  when they say "I need to write my component spec", "how do I implement the platform spec
  in my service", "I got a task from the platform team and need to start", "what goes in
  my component spec", or "how do I declare my MCP sources". Also trigger when they need
  to create a local ADR in their component repo. Do NOT trigger for Platform Specs or
  Platform Constitution — those use the sdd-platform-spec skill.
---

# Component Spec Skill

You help component team engineers and tech leads write a correct, MCP-grounded Component
Implementation Spec (OpenSpec). The Component Spec defines HOW a service implements the
platform's intentions. It is owned by the Component Team. It lives in the Component Repo.

It is NOT a copy of the Platform Spec — it is the local "how" derived from the Platform Spec.

---

## Before You Start — Required Inputs

The human must have all of these before writing a single line of their component spec.
If any are missing, stop and tell them to get them first.

```
□ Fan-out task from the Platform Repo containing:
    - platform_spec_id (e.g., PLAT-124 v1)
    - context_pack_version (e.g., cp-v2)
    - contract_change: yes / no
    - blocked_by: [] (must be empty — if not, use sdd-adr skill first)

□ Access to the Platform Spec file in the Platform Repo

□ Context Pack file: .specify/memory/context-<initiative-id>.md
   (or the equivalent domain MCP files in your component repo's context/ directory)

□ Your component's domain MCP file: .specify/memory/domains/<your-domain>.md
```

If `blocked_by` in the fan-out task is non-empty → stop. The ADR must be resolved first.
Use the `sdd-adr` skill to check the ADR status.

If `contract_change: yes` → before writing the component spec, confirm the Contract Change
Spec has been created in the Platform Repo and approved by the Integration Owner.

---

## The Component Spec Structure

Every Component Spec must open with this metadata block — no exceptions:

```markdown
## Metadata
- ID: SPEC-<DOMAIN>-<NUMBER>
- Implements: <Platform Spec ID + version>     ← REQUIRED
- Context Pack: <cp-version>                   ← REQUIRED
- Contracts Referenced: [list of event/API versions used]
- Blocked By: []                               ← Must be empty to implement
- Status: Draft
```

Then for each section below, the human must declare a `Source:` line before writing content.
This is what makes the spec anti-invention — no section can be written from memory or assumption.

---

## Walking Through Each Section

### Problem Statement
```
Source: Platform MCP / Initiative ECO-124
```
Summarize the user-facing problem this component is solving. Copy the relevant part from
the Platform Spec — do not rewrite it from scratch.

### Goals / Non-Goals
```
Source: Platform Spec PLAT-124 v1 — Component Responsibilities section
```
What this component specifically does and does not do. Keep it tight to this service.

### Domain Understanding
```
Source: Domain MCP — <your domain> invariants v<version>
```
List the invariants from your domain MCP that are relevant to this spec. For example:
- "Cart owns session state — not Checkout"
- "Guest session TTL ≥ 30 minutes after last activity"

If an invariant is not in your domain MCP file — STOP. Ask the Domain Owner to add it first.
Do not invent invariants.

### Cross-Domain Interactions
```
Source: Domain MCP + Integration MCP — <contract names + versions>
```
Describe how this component interacts with other domains. Reference the exact event or API
versions from the Integration MCP. For example:
- "Emits: CartUpdated v2 (schema: Integration MCP — CartUpdated v2)"
- "Consumes: OrderPlaced v3 (schema: Integration MCP — OrderPlaced v3)"

### Contracts
```
Source: Integration MCP — <contract names> v<version>
```
List every event and API this component publishes or consumes. Include versions. If a new
version is needed, flag it here and confirm the Contract Change Spec exists in Platform Repo.

### Technical Approach
```
Source: Component MCP — <your service> patterns v<version>
```
How this component implements the feature. This is the section unique to the Component Spec.
Follow approved patterns from your Component MCP. Reference your service's tech stack,
data model, and local constraints.

### NFRs
```
Source: Platform MCP — observability, security, performance v<version>
```
Copy the relevant NFR requirements from the Platform MCP. Do not reduce or soften them.
- Logging: confirm log format
- Metrics: confirm metric names and dimensions
- Tracing: confirm span names and attributes
- PII: confirm masking rules at API boundary
- Performance: confirm p95 target for this flow

### Observability
```
Source: Platform MCP — logging/metrics/tracing standards v<version>
```
Specify exact log events, metric names, and trace spans this implementation will produce.

---

## Gate Check (run before submitting for review)

Run `/speckit.analyze` in your Component Repo before marking the spec as Approved.

Walk through each gate with the human:

**Gate 1 — Context Completeness**
- Does every section have a `Source:` line? → Yes/No
- Is the Context Pack version declared in the Metadata? → Yes/No
- Does constitution.md exist? → Yes/No

**Gate 2 — Domain Validity**
- Does this spec reference any data that belongs to another domain's database? → No/Yes (fail)
- Does this spec access another domain directly (not via event/API)? → No/Yes (fail)
- Are all invariants from the Domain MCP respected? → Yes/No

**Gate 3 — Integration Safety**
- Are all events/APIs this component consumes identified? → Yes/No
- If a contract version changed, is a compatibility plan present? → Yes/N/A
- Are all consumers of events/APIs this component emits identified? → Yes/No

**Gate 4 — NFR Compliance**
- Is logging declared? → Yes/No
- Are metrics declared? → Yes/No
- Is tracing declared? → Yes/No
- Is PII handling specified? → Yes/No
- Are performance targets set? → Yes/No

**Gate 5 — Ready-to-Implement**
- Is `Blocked By` empty? → Yes/No
- Are there any vague or ambiguous sections? → No/Yes (fail)
- Are acceptance criteria testable and executable? → Yes/No

If any gate fails → do not mark as Approved. Fix the failure first. Use `sdd-gate-check`
skill for detailed remediation guidance.

---

## After Spec is Approved — Update the Spec Graph

Before any implementation begins, update `spec-graph.json`:

```json
{
  "SPEC-CART-01": {
    "implements": "PLAT-124 v1",
    "context_pack": "cp-v2",
    "contracts_referenced": ["CartUpdated-v2", "OrderPlaced-v3"],
    "blocked_by": [],
    "status": "Approved",
    "affects": ["cart-service", "CartUpdated event"]
  }
}
```

---

## Local ADRs

If during spec writing you encounter an ambiguity that is scoped only to your component
(does not affect other components or platform policy), create a Local ADR:

```
component-repo/adr/ADR-LOCAL-001-<short-title>.md
```

Add to your spec:
```
Blocked By: ADR-LOCAL-001
```

Use the `sdd-adr` skill to draft and track it.

If the ambiguity affects multiple components or platform policy → escalate to the Platform
Repo. Do not create a local ADR for a cross-cutting concern.
