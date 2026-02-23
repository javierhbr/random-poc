---
name: sdd-platform-spec
description: >
  Guides Platform Architects and Product Managers through creating a complete Platform Spec
  using SpecKit + MCP. Trigger this skill when someone needs to create a new Platform Feature
  Spec, write or update a Platform Constitution, run /speckit.specify or /speckit.plan,
  or is starting a new initiative from scratch. Also trigger when someone says "I need to
  spec a new feature", "how do I define what we're building", "I need to run speckit.specify",
  or "the Platform Spec needs to cover X domains". Do NOT trigger for component-level
  implementation specs — those use the sdd-component-spec skill.
---

# Platform Spec Skill

You help Platform Architects and Product Managers produce a complete, MCP-grounded Platform
Spec using SpecKit. You enforce the correct order of steps and refuse to skip any.

The Platform Spec is the "what + why + UX" for a cross-domain initiative. It is owned by
the Platform Architect and Product Manager working together. It is written in the Platform Repo.
It is NOT the implementation spec — that is the Component Spec.

---

## Before You Start — Run the Prerequisite Check

Ask the human to confirm each item:

```
□ You are working in the Platform Repo (not a component repo)
□ specify init has been run: specify init platform-repo --ai claude
□ specify check passes
□ You have an Initiative ID (e.g., ECO-124)
□ The MCP Router has generated a Context Pack for this initiative
  → file should exist at: .specify/memory/context-<initiative-id>.md
□ constitution.md exists at .specify/memory/constitution.md
```

If `constitution.md` is missing or empty → stop. Run `Step 0: Constitution` first.
If Context Pack is missing → stop. Run MCP Router first (see `references/mcp-router.md`).

---

## Step 0 — Constitution (run once per repo, or when policies change)

**Command:** `/speckit.constitution`

**Goal:** Encode all platform non-negotiables as a file that every subsequent command references.

**Prompt the human to provide:**
- UX consistency rules (design system, accessibility standards)
- Security/PII handling rules
- Observability standards (log format, metrics, tracing)
- Performance baselines (p95 latency, throughput)
- Domain governance rules (ownership, cross-domain communication rules)
- Contract versioning rules (semantic versioning, dual-publish window)
- Definition of Done

**Example prompt to run:**
```
/speckit.constitution Create governing principles covering:

PLATFORM STANDARDS:
- UX: [fill in your standards]
- Observability: [fill in your standards]
- Security: [fill in your standards]
- Performance: [fill in your standards]

DOMAIN GOVERNANCE:
- [list which domain owns what]
- No domain may directly access another domain's database
- All cross-domain communication via versioned events or REST contracts

CONTRACT RULES:
- Semantic versioning for all APIs/events
- Breaking changes require dual-publish for [X] days
- All consumers identified before contract change approved

DEFINITION OF DONE:
- No implementation without an approved spec
- All 5 gates must PASS before /speckit.implement
- Every artifact linked in spec-graph.json
- Context Pack version pinned in every spec
```

**Output:** `.specify/memory/constitution.md`

The constitution IS your Platform MCP materialized as a file. Every subsequent SpecKit
command reads it. Invest the most time here — it is the highest-leverage step.

---

## Step 1 — Platform Spec: What and Why

**Command:** `/speckit.specify`

**Goal:** Define what is being built and why — NOT how. Scope, UX, domain responsibilities,
contracts to define. No implementation details.

**Before running:** Tell the human to include in their prompt:
- Scope and goals (what the user can do, what the system must do)
- Domain responsibilities (which domain owns which part)
- Contracts that need to be defined or changed
- Non-goals (what is explicitly out of scope)
- MCP sources to reference (from the Context Pack)

**After running:** SpecKit creates a branch (e.g., `001-guest-checkout`) and a `specs/` directory.
The Platform Spec (spec.md) should cover:

```
- End-to-end UX flow (Source: Platform MCP)
- Domain responsibilities and boundaries (Source: Domain MCP)
- Cross-domain sequences: events/APIs (Source: Integration MCP)
- NFR pack: security, observability, performance (Source: Platform MCP)
- Contracts to define or change
- Acceptance criteria
```

**Check:** Every section must have a `Source:` declaration. If any are missing → fill them in
before moving to Step 2.

---

## Step 2 — Surface Gaps and ADR Triggers

**Command:** `/speckit.clarify`

**Goal:** Find ambiguities that would block implementation. Any unresolved answer becomes an ADR.

**Run this BEFORE /speckit.plan.** Never skip it for a non-trivial feature.

**Common ADR triggers this will surface:**
- Idempotency strategy for operations that can be retried
- Session ownership when multiple domains are involved
- Event ordering guarantees
- Versioning strategy for a specific contract change
- Who owns the generation of a shared ID

**After running:** For each unresolved item:
1. Create a named ADR file in `adr/`
2. Assign an owner
3. Set state to `In Review`
4. Add `BlockedBy: ADR-###` to the Platform Spec

Do not proceed to Step 3 until all blocking ADRs are at least `In Review` with an owner.

---

## Step 3 — Platform Plan and Fan-Out Tasks

**Commands:** `/speckit.plan` then `/speckit.tasks`

**Goal:** Turn the Platform Spec into a technical plan and produce handoff tasks for component teams.

**For /speckit.plan**, the human should provide:
- Tech stack per domain
- Event bus / API style
- Reference to domain context files: `.specify/memory/domains/<name>.md`
- Required contract outputs (api-spec.json, events-spec.md)

**Output of /speckit.plan:** plan.md, data-model.md, contracts/ directory

**Output of /speckit.tasks:** tasks.md with dependency-ordered tasks

**Each fan-out task MUST include:**
```
component_repo:        <target repo name>
platform_spec_id:      <PLAT-XXX vN>
context_pack_version:  <cp-vN>
contract_change:       yes / no
blocked_by:            [ADR IDs] or []
```

---

## Step 4 — Gate Validation

**Command:** `/speckit.analyze`

**Goal:** Validate all 5 gates before any component team receives their tasks.

| Gate | What it checks |
|---|---|
| 1 Context Completeness | All MCP sources cited; constitution.md exists; Context Pack version pinned |
| 2 Domain Validity | No invariant violations; no cross-domain DB access; correct ownership |
| 3 Integration Safety | All consumers identified; compatibility plan for breaking changes |
| 4 NFR Compliance | Logging/metrics/tracing declared; PII specified; performance targets set |
| 5 Ready-to-Implement | No open BlockedBy ADRs; no vague sections; testable acceptance criteria |

**If any gate FAILS:** Do not fan out. Resolve the failure first, then re-run /speckit.analyze.

Use the `sdd-gate-check` skill if the human needs help identifying what a gate failure means
and how to fix it.

---

## Step 5 — Fan Out

Once all gates PASS: send the fan-out tasks to component teams.

Each component team will run the `sdd-component-spec` skill in their Component Repo.

---

## Reference files

- `references/mcp-router.md` — How to run the MCP Router to generate a Context Pack
- `references/spec-template.md` — The full Platform Spec template with Source declarations
