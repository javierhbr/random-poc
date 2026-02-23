# OPERATING MODEL
## Spec-Driven Development + MCP (Enterprise Model)

> **Version:** 2.0 — February 2026
>
> **Core Principle:** *"Nothing is implemented without a validated spec backed by governed context."*

---

# 1) FORMAL OPERATING MODEL

## 1.1 Purpose

Define a **repeatable, auditable, and scalable system** to build software where:

- Knowledge is explicit (specs, ADRs, contracts)
- Context is governed (MCP)
- Execution is traceable (Spec Graph)
- Humans and AI agents can collaborate safely
- Platform teams and component teams work without stepping on each other

---

## 1.2 Core Principle

> **"Nothing is implemented without a validated spec backed by governed context."**

---

## 1.3 System Model

Think of your organization as **a knowledge system, not a code system**.

```
Knowledge Layer (MCP)
  ├── Platform Policies
  ├── Domain Models
  ├── Integration Contracts
  └── Component Context

        ↓ (Context Pack — versioned)

Spec Layer
  ├── Platform Specs         [Platform Repo — SpecKit]
  ├── Component Specs        [Component Repos — OpenSpec]
  ├── Contract Specs         [Platform Repo]
  └── ADRs                   [Platform Repo (global) / Component Repo (local)]

        ↓ (execution)

Code Layer
  ├── Services
  ├── APIs
  └── Infrastructure

        ↓

Runtime Observability
  ├── Logs
  ├── Metrics
  └── Traces
```

---

## 1.4 Two-Tier Repo Architecture

The system operates across two distinct repo tiers. Each tier has clear ownership boundaries.

### Platform Repo (SpecKit)

Owned by Platform Architects and Product Managers. One per organization.

```
platform-repo/
├── constitution/        ← Platform principles (versioned)
├── initiatives/         ← Roadmap items, one per epic/initiative
├── platform-specs/      ← SpecKit feature specs (what + why + UX)
├── contracts/           ← Canonical contract registry + specs
└── adr/                 ← Global ADRs (block any dependent component)
```

### Component Repos (OpenSpec)

Owned by Domain Leads and Engineering teams. One per bounded context.

```
cart-repo/
├── context/             ← Component MCP knowledge pack references
├── specs/               ← OpenSpec implementation specs (how)
├── adr/                 ← Local ADRs (scoped to this component only)
└── contracts/           ← Only if this component owns a contract
```

**Rule:** Component teams consume Platform Specs as input. They do not modify the Platform Repo.

---

## 1.5 Roles and Responsibilities

### 1) Product Manager (Initiative Owner)

Repo: Platform

Owns:
- Initiative definition
- Business goals
- UX intent

Produces:
- Initiative (Epic)
- Success criteria

---

### 2) Platform Architect (Spec Owner)

Repo: Platform

Owns:
- Platform Spec
- Platform Constitution
- Cross-domain consistency
- NFRs (security, observability, performance)

Accountable for:
- "What the system must do" across all domains

---

### 3) Domain Owner

Repo: Platform + Component

Owns:
- Domain MCP
- Domain invariants
- Domain boundaries

Validates:
- Domain correctness of all specs touching their domain

---

### 4) Integration Owner

Repo: Platform

Owns:
- Contract Registry
- Versioning rules
- Compatibility

Approves:
- All contract changes before implementation proceeds

---

### 5) Component Owner (Team)

Repo: Component

Owns:
- Component Specs (OpenSpec)
- Implementation
- Local ADRs

Responsible for:
- "How the system works locally"

---

### 6) ADR Owner

Repo: Platform (global) or Component (local)

Owns:
- Technical decisions

Responsible for:
- Resolving ambiguity before implementation
- **Global ADR** — blocks any component that depends on the decision
- **Local ADR** — blocks only this component's implementation

---

### 7) AI Agents (or Devs acting as agents)

Repo: Both

Execute:
- Spec generation
- Validation
- Implementation
- Verification

MUST:
- Use MCP context (never invent context)
- Respect gates (never skip)
- Produce traceable outputs (implements, dependsOn, affects, status)

---

## 1.6 Artifacts (Single Source of Truth)

| Artifact | Repo | Tool | Purpose |
|---|---|---|---|
| **Initiative** | Platform | JIRA / Roadmap | Why — business goal |
| **Platform Spec** | Platform | SpecKit | What — UX, responsibilities, contracts |
| **Component Spec** | Component | OpenSpec | How — local implementation |
| **Contract Spec** | Platform | SpecKit | Integration — versioning, consumers, compat |
| **ADR (Global)** | Platform | SpecKit | Decision — blocks any dependent component |
| **ADR (Local)** | Component | OpenSpec | Decision — blocks only this component |
| **Spec Graph** | Platform | spec-graph.json | Traceability — links all artifacts cross-repo |
| **Context Pack** | MCP Router | MCP | Context — governed, versioned knowledge |
| **Constitution** | Platform | SpecKit | Governance — non-negotiable platform rules |

---

## 1.7 Development Lifecycle

### Standard Flow

```
Initiative (Product Manager)
  ↓
MCP Router → Context Pack (versioned)
  ↓
Platform Spec (SpecKit — Platform Repo)
  ↓
/speckit.clarify → ADR Drafts (resolve before planning)
  ↓
Platform Plan + Fan-out Tasks (SpecKit)
  ↓
Gate Validation — Platform level (all 5 gates must PASS)
  ↓
Component Specs (OpenSpec — per Component Repo)
  [Each task carries: Platform Spec ID, Context Pack version, contract change flag]
  ↓
Implementation (per Component Repo)
  ↓
Verification + Gate Validation — Component level
  ↓
Release
  ↓
Spec Graph Update
```

### Fan-Out: The Bridge from Platform to Component

`/speckit.plan` + `/speckit.tasks` produce handoff tasks for component teams. Each task must include:

| Field | Description |
|---|---|
| `component_repo` | Target component repository |
| `platform_spec_id` | Parent Platform Spec ID + version (e.g., `PLAT-124 v1`) |
| `context_pack_version` | Required MCP Context Pack version (e.g., `cp-v2`) |
| `contract_change` | `yes / no` — flags whether a Contract Spec is required first |
| `blocked_by` | ADR IDs that must be resolved before this task proceeds |

---

## 1.8 Gates (Non-Negotiable)

Gates apply at both levels: Platform (before fan-out) and Component (before implementation).

### Gate 1: Context Completeness
- All MCP sources referenced with explicit versions
- Context Pack version pinned in the spec
- `constitution.md` exists and is non-empty

### Gate 2: Domain Validity
- No invariant violations (checked against Domain MCP)
- Domain ownership respected — no component accesses another domain's database directly
- All cross-domain communication via versioned events or REST contracts only

### Gate 3: Integration Safety
- All contract consumers identified (from Integration MCP)
- Compatibility plan present for any breaking changes
- Dual-publish strategy defined if a contract version is bumped

### Gate 4: NFR Compliance
- Logging, metrics, tracing declared per observability standards
- PII handling specified and compliant with Platform MCP security policy
- Performance targets set (p95 latency, throughput)

### Gate 5: Ready-to-Implement
- No open `BlockedBy` ADRs
- Spec is unambiguous
- All acceptance criteria are testable and executable

> **The system MUST block progress if gates are not met.**

---

## 1.9 Spec Graph (Traceability)

Every artifact must link forward and backward.

### Every Component Spec must include

```
implements:            Platform Spec ID + version
context_pack:          ID + version (from MCP Router)
contracts_referenced:  event/API versions used
blocked_by:            ADR IDs (empty list if none)
status:                Draft / Approved / Implementing / Done / Paused / Blocked
outcome:               shipped version + rollout notes (on completion)
```

### Every Platform Spec must include

```
children:         list of component specs (OpenSpec references)
contract_specs:   version bumps + consumer impact notes
adrs:             decisions that govern this feature
context_pack:     version used when this spec was authored
```

### Spec Graph Update Rule (add to constitution.md)

```
After every implementation run, update spec-graph.json with:
- implements: parent spec this component implements
- dependsOn: contracts, ADRs, policies referenced
- affects: domains, APIs, events changed
- status: current state
Specs are NEVER deleted — only versioned or set to Paused.
```

---

## 1.10 Change Management

### Platform Change

Used when UX flows, shared event contracts, or platform policies change.

1. Create new Platform Spec version (or Platform Change Spec)
2. Regenerate Context Pack via MCP Router (new version)
3. Generate component impact list: which specs become stale, which components must rebaseline
4. Each affected component creates a Component Change Spec referencing the new Context Pack version

### Component Change

Used for local optimizations, refactors without contract impact, local features.

1. Create or update Component Change Spec in the component repo
2. Consult Component MCP + Platform MCP (NFR/quality compliance)
3. Validate integration gate: confirm no contract impact
4. Implement and register in Spec Graph

---

## 1.11 Priority Management

### States

```
Planned → Discovery → Draft → Approved → Implementing → Done
                                 ↓
                               Paused (priority shift)
                                 ↓
                       [Rebase with new Context Pack]
                                 ↓
                              Approved (resume)

Blocked path:
Approved → Blocked (ADR pending) → Approved (ADR resolved) → Implementing
```

### Rules

- **Never delete specs** — only version or set to Paused
- **Always version** — every change creates a new version, not an overwrite
- **Rebase after pause** — always regenerate Context Pack before resuming; never resume against a stale Context Pack
- **Blocked ≠ Paused** — Blocked means waiting on an ADR; Paused means waiting on business priority

---

## 1.12 ADR Governance

### States

```
Proposed → In Review → Approved
                    → Rejected
```

### Scope

- **Global ADR** (Platform Repo `/adr/`) — impacts multiple components or platform policy; blocks any component that depends on it
- **Local ADR** (Component Repo `/adr/`) — impacts only this component; does not block other components

### Blocking Rule

```
Spec → BlockedBy: ADR-###
```

No spec passes Gate 5 while its `BlockedBy` list contains any unresolved ADR.

### Flow

1. Ambiguity detected in spec → ADR Draft created, owner assigned
2. ADR goes through review
3. On Approved → unblock dependent specs, resume planning
4. On Rejected → spec updated to reflect the rejected path

---

## 1.13 Bugs and Hotfixes

### Routing Decision (make this first)

| Situation | Route |
|---|---|
| Component-only bug | Component Repo — lightweight OpenSpec bug spec |
| Hotfix that changes a contract | Platform Repo first — Contract Change Spec + Integration MCP update required |
| Hotfix that violates a platform policy | Platform Repo — policy exception ADR required |

### Normal Bug (non-urgent)

```
Detect Bug
  → Create Bug Spec (Component Repo, OpenSpec)
     - Reproduction steps
     - Root cause hypothesis
     - Fix plan + tests
  → Quick gate validation
  → Implement + verify
  → Update Spec Graph
  → Close
```

### Hotfix (production, urgent)

```
Production Incident
  → Routing decision: component-only or contract/policy impact?
  → Create Hotfix Spec (minimal):
     - Issue + impact
     - Fix (minimal change to restore service)
     - Rollback plan
     - Observability validation (metric/log that confirms resolution)
  → Implement (fast path)
  → Verify
  → Done
  → Create Follow-up Spec (hardening):
     - Full tests
     - Refactor if needed
     - ADR if a decision was made under pressure
     - Contract Spec if contract was touched
```

---

## 1.14 Enforcement Model

> **The system MUST block progress if gates are not met.**

Enforcement layers:

| Layer | Mechanism |
|---|---|
| **CLI** | `specify check` validates prerequisites; `/speckit.analyze` gates block fan-out |
| **CI Validation** | PR checks validate every spec includes `implements`, `context_pack`, and gate status |
| **PR Checks** | Spec Graph link validation — no PR merged without updated `spec-graph.json` |
| **AI Agent Guardrails** | Agent system prompt enforces: no code without spec, no spec without sources, stop on missing context |

---

## 1.15 Success Metrics

| Metric | What It Measures |
|---|---|
| % of features with Platform Spec before fan-out | Spec discipline adoption |
| % of component specs with `implements` + `context_pack` declared | Cross-repo alignment |
| % of impactful changes with an ADR | Decision traceability |
| Contract break incidents in production | Integration Safety gate effectiveness |
| Hotfix frequency | Preventive gate quality |
| Rework rate | Spec clarity and gate completeness |
| Time from Platform Spec to first Component Spec | Fan-out efficiency |

---

# 2) CUSTOM GPT / AI AGENT SKILL

## "Spec-Oriented Agent" (Production-Ready)

Deploy this in any AI coding agent (Claude Code, Copilot, Cursor, etc.) operating in this system.

---

## SYSTEM PROMPT

```
You are a Spec-Oriented Engineering Agent.

Your job is NOT to write code first.
Your job is to produce correct, traceable, and validated specifications before implementation.

You MUST follow Spec-Driven Development (SDD) with MCP context.

You operate in two mandatory phases:
1) QUESTION IDENTIFICATION
2) SPEC OR ANSWER GENERATION
You MUST NOT skip phases.
```

---

## CORE RULES

```
1. NEVER implement without a spec (unless explicitly told "hotfix minimal spec").
2. ALWAYS identify the real question or intent first.
3. ALWAYS state assumptions explicitly.
4. ALWAYS reference context sources with versions:
   - Platform MCP (policies, NFRs, UX, DoD)
   - Domain MCP (invariants, entities, boundaries)
   - Integration MCP (contracts, consumers, versioning)
   - Component MCP (constraints, patterns, runbooks)
5. ALWAYS validate all 5 gates before moving forward.
6. If context is missing → STOP and ask. Do not invent context.
7. If a decision is unclear → create an ADR. Do not make implicit decisions.
8. If integration changes are needed → create a Contract Spec first.
9. If urgent → use Hotfix Path (minimal spec + rollback + observability).
10. Every output must be traceable: implements, dependsOn, affects, status.
```

---

## PHASE 1: QUESTION IDENTIFICATION (MANDATORY)

Extract and output:

```
## Identified Request

### Type
[Feature / Change / Bug / Hotfix / Unknown]

### Core Question
[What is really being asked]

### Domains Involved
-

### Dependencies
- Contracts:
- ADRs:
- Components:

### Missing Context
-

### Risk Level
[Low / Medium / High]
```

IF missing context → STOP and ask. Do not proceed.

---

## PHASE 2: RESPONSE / SPEC

### Case A: Feature

Produce full SpecKit spec (see Spec Template in section 3).

### Case B: Change

Produce:
- Change Spec
- Impact Analysis

### Case C: Bug

Produce:
- Reproduction steps
- Root Cause Hypothesis
- Fix Plan
- Tests

### Case D: Hotfix

Use minimal spec:

```
## Hotfix Spec

### Issue
### Impact
### Fix
### Rollback
### Validation
### Follow-up Spec Link
```

---

## GATES VALIDATION (MANDATORY)

Before finishing, always include:

```
## Gate Check

- Context completeness: PASS/FAIL
- Domain validity:      PASS/FAIL
- Integration safety:   PASS/FAIL
- NFR compliance:       PASS/FAIL
- Ready to implement:   PASS/FAIL
```

If any FAIL → do not proceed. State what is missing and what is needed to resolve it.

---

## OPTIONAL: STRICT MODE (recommended)

```
If asked for code without a spec:
→ Refuse and propose spec first

If asked to skip context:
→ Block and ask what MCP sources are available

If context_pack version is not declared:
→ Stop and request it
```

---

# 3) SPEC TEMPLATE (MCP-AWARE)

Every section must declare its source. This is what makes the process anti-invention.

```markdown
# Spec

## Metadata
- ID:
- Implements: [Platform Spec ID + version]
- Context Pack: [version]
- Status: [Draft / Approved / Implementing / Done / Paused / Blocked]
- Blocked By: [ADR IDs or empty]

## Problem Statement
Source: [Platform MCP / Initiative]

## Goals / Non-Goals
Source: [Platform MCP / Initiative]

## User Experience
Source: [Platform MCP — UX guidelines]

## Domain Understanding
Source: [Domain MCP — invariants, entities]

## Cross-Domain Interactions
Source: [Domain MCP + Integration MCP]

## Contracts
Source: [Integration MCP — contract versions, consumers]

## Component Responsibilities
Source: [Domain MCP — ownership boundaries]

## Technical Approach
Source: [Component MCP — approved patterns]

## NFRs
Source: [Platform MCP — observability, security, performance]

## Observability
Source: [Platform MCP — logging, metrics, tracing standards]

## Risks
## Rollout
## Testing
## Acceptance Criteria

## Gates
- Context completeness: PASS/FAIL
- Domain validity:      PASS/FAIL
- Integration safety:   PASS/FAIL
- NFR compliance:       PASS/FAIL
- Ready to implement:   PASS/FAIL

## ADRs
## References (MCP Sources + versions)
## Spec Graph Links
```

---

# 4) SCALING GUIDE

### Small Team / Early Stage (1–2 teams)

Use SpecKit for everything in one repo. The platform/component split is conceptual, not physical.

```
single-repo/
├── .specify/memory/constitution.md
├── .specify/memory/domains/
├── specs/001-platform-spec/
├── specs/002-cart-component/
└── adrs/
```

Run SpecKit commands for both platform and component work. The fan-out is a mental model at this stage.

### Growing Team (3–5 teams)

Introduce the physical split when teams start stepping on each other's specs. Separate Platform Repo (SpecKit) from Component Repos (OpenSpec). MCP Router becomes a shared service.

### Enterprise (5+ teams)

Full model as described in this document. Add:
- Queryable Spec Graph database (not just JSON)
- Live Integration MCP with consumer impact APIs
- Contract Registry as a dedicated service
- CI enforcement on all repos

---

# 5) NEXT STEPS

To operate this fully in production:

1. **Bootstrap Platform Repo** — `specify init platform-repo --ai claude`
2. **Write `constitution.md`** — encode all platform principles (2 hours, highest-leverage action)
3. **Write `domains/*.md`** — domain invariants per bounded context (these are your Domain MCPs)
4. **Build MCP Router** — generates versioned Context Packs before each initiative
5. **Run pilot initiative end-to-end** — validate the full flow before scaling
6. **Add Spec Graph tracking** — `spec-graph.json` once you have 2+ linked specs
7. **Add CI enforcement** — PR checks for `implements` + `context_pack` on every component spec

---

*v2.0 — February 2026*
