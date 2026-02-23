# Target Operating Model
## Spec-Driven Development + MCP (Enterprise Model)

> **Version:** 2.0 — February 2026
>
> **Core Principle:** *"Nothing is implemented without a validated spec backed by governed context."*

---

## 1. Tool Responsibilities

The system is built on three tools, each owning a distinct, non-overlapping layer.

### What SpecKit Owns — Platform Layer

Operated by Platform Architects and Product Managers in the **Platform Repo**.

- **Platform Constitution** — global policies, non-negotiables, and Definition of Done
- **Platform Feature Specs** — end-to-end UX, domain boundaries, cross-domain responsibilities
- **Platform Plan + Fan-out Tasks** — cross-domain rollout, dependencies, and component handoff instructions with explicit target repo, Platform Spec ID, Context Pack version, and contract change flag

### What OpenSpec Owns — Component Layer

Operated by Domain Leads and Engineering teams in each **Component Repo**.

- **Component Implementation Specs** ("how") — design details, data model, service constraints
- **Change proposals + tracking** — spec history, implementation status, follow-ups
- **Local ADRs + local context evolution**

### What MCPs Own — Context Layer

Owned by Platform Architects and Integration Engineers. Serves both layers.

- **Platform MCP** — UX guidelines, security/PII policies, observability standards, NFR baselines, Definition of Done
- **Domain MCP** — entities, invariants, bounded context boundaries, owned events
- **Integration MCP** — versioned APIs/events, consumer lists, compatibility and deprecation rules
- **Component MCP** — local architecture patterns, approved libraries, constraints, runbooks

MCPs provide **versioned Context Packs** to prevent "invented context." Agents consume governed truth instead of inferring from the codebase.

---

## 2. Source of Truth Structure

### Platform Repo (SpecKit)

The product and platform spec hub. One per organization.

```
platform-repo/
├── constitution/        ← Platform principles (versioned)
├── initiatives/         ← Roadmap items, one per epic/initiative
├── platform-specs/      ← SpecKit feature specs (what + why + UX)
├── contracts/           ← Canonical contract registry + specs
└── adr/                 ← Global ADRs (block any dependent component)
```

### Component Repos (OpenSpec)

Each service or bounded context maintains its own repo.

```
cart-repo/
├── context/             ← Component MCP knowledge pack references
├── specs/               ← OpenSpec implementation specs (how)
├── adr/                 ← Local ADRs (scoped to this component only)
└── contracts/           ← Only if this component owns a contract
```

### MCP Server Repos

```
mcp-servers/
├── platform-mcp/        ← Exposes platform policies
├── domain-mcp/          ← Exposes domain invariants per bounded context
├── integration-mcp/     ← Exposes versioned API/event contracts
├── component-mcp/       ← Exposes local component context
└── router/              ← Aggregates all into versioned Context Packs
```

---

## 3. System Model

Think of your organization as **a knowledge system, not a code system**.

```
Knowledge Layer (MCP)
  ├── Platform Policies
  ├── Domain Models
  ├── Integration Contracts
  └── Component Context

        ↓ (Context Pack — versioned)

Spec Layer
  ├── Platform Specs        [Platform Repo — SpecKit]
  ├── Component Specs       [Component Repos — OpenSpec]
  ├── Contract Specs        [Platform Repo]
  └── ADRs                  [Platform Repo (global) / Component Repo (local)]

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

## 4. Roles and Responsibilities

| Role | Repo | Owns | Accountable For |
|---|---|---|---|
| **Product Manager** | Platform | Initiative definition, business goals, UX intent | Initiative (Epic), success criteria |
| **Platform Architect** | Platform | Platform Spec, constitution, cross-domain consistency, NFRs | "What the system must do" |
| **Domain Owner** | Platform + Component | Domain MCP, domain invariants, domain boundaries | Domain correctness of all specs touching their domain |
| **Integration Owner** | Platform | Contract Registry, versioning rules, compatibility | Approves all contract changes |
| **Component Owner / Team** | Component | Component Specs, OpenSpec execution, local ADRs | "How the system works locally" |
| **ADR Owner** | Platform or Component | Technical decisions | Resolving ambiguity before implementation |
| **AI Agents** | Both | Spec generation, validation, implementation, verification | Must use MCP context, respect gates, produce traceable outputs |

---

## 5. Artifacts (Single Source of Truth)

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

## 6. Development Lifecycle

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
/speckit.analyze → Gate Validation (all 5 gates — Platform level)
  ↓
Component Specs (OpenSpec — per Component Repo)
  [Each task carries: Platform Spec ID, Context Pack version, contract change flag]
  ↓
Implementation (per Component Repo)
  ↓
Verification + Gate Validation (Component level)
  ↓
Release
  ↓
Spec Graph Update
```

### Fan-Out: The Bridge from SpecKit to OpenSpec

`/speckit.plan` + `/speckit.tasks` produce handoff tasks for component teams. Each task must include:

| Field | Example |
|---|---|
| `component_repo` | `cart-repo` |
| `platform_spec_id` | `PLAT-124 v1` |
| `context_pack_version` | `cp-v2` |
| `contract_change` | `yes / no` |
| `blocked_by` | `ADR-219` (empty if none) |

Component teams pick up these tasks and run OpenSpec locally in their repo. They do not modify the Platform Repo.

---

## 7. Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                   KNOWLEDGE LAYER (MCP)                        │
│  Platform MCP   │  Domain MCP     │  Integration MCP           │
│  (policies, NFR,│  (invariants,   │  (contracts, consumers,    │
│   UX, DoD)      │   entities,     │   versioning, compat.)     │
│                 │   boundaries)   │                            │
└─────────────────────────────┬─────────────────────────────────┘
                              │  Context Pack (versioned)
                              ▼
┌───────────────────────────────────────────────────────────────┐
│              PLATFORM REPO — SpecKit                           │
│                                                               │
│  /speckit.constitution  →  constitution.md                    │
│  /speckit.specify       →  Platform Spec (what + why + UX)    │
│  /speckit.clarify       →  ADR drafts (before planning)       │
│  /speckit.plan          →  Platform Plan                      │
│  /speckit.analyze       →  Gate validation (all 5 gates)      │
│  /speckit.tasks         →  Fan-out tasks per component        │
└──────────┬─────────────────┬──────────────────┬──────────────┘
           │                 │                  │
    [Cart task]       [Checkout task]     [Payments task]
    PLAT-124 v1       PLAT-124 v1         BLOCKED: ADR-219
    cp-v2             cp-v2
           │                 │
           ▼                 ▼
┌──────────────────┐  ┌──────────────────┐  ┌────────────────────┐
│  CART REPO       │  │  CHECKOUT REPO   │  │  PAYMENTS REPO     │
│  (OpenSpec)      │  │  (OpenSpec)      │  │  (OpenSpec)        │
│                  │  │                  │  │                    │
│  spec.md         │  │  spec.md         │  │  spec.md           │
│  implements:     │  │  implements:     │  │  blocked_by:       │
│    PLAT-124 v1   │  │    PLAT-124 v1   │  │    ADR-219         │
│  context_pack:   │  │  context_pack:   │  │  status: Blocked   │
│    cp-v2         │  │    cp-v2         │  │                    │
│  tasks.md        │  │  tasks.md        │  │                    │
│  adr/ (local)    │  │  adr/ (local)    │  │  adr/ (local)      │
└──────────────────┘  └──────────────────┘  └────────────────────┘
           │                 │
           └────────┬────────┘
                    ▼
┌───────────────────────────────────────────────────────────────┐
│                SPEC GRAPH (Traceability)                       │
│                                                               │
│  ECO-124                                                      │
│    └── PLAT-124 v1 (Platform Spec, cp-v2)                     │
│          ├── SPEC-CART-01    (implements PLAT-124 v1)         │
│          ├── SPEC-CHECKOUT-01 (implements PLAT-124 v1)        │
│          ├── SPEC-PAY-01     (blocked_by ADR-219)             │
│          ├── CONTRACT-CartUpdated-v2                          │
│          ├── CONTRACT-OrderPlaced-v3                          │
│          └── ADR-219 (global — blocks Payments impl)          │
└───────────────────────────────────────────────────────────────┘
```

---

## 8. Gates (Non-Negotiable)

Gates apply at **both levels**: Platform (before fan-out) and Component (before implementation). If any gate FAILS, the system must block progress.

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
- No open `BlockedBy` ADRs — all must be resolved or in approved state with owner assigned
- Spec is unambiguous — no section left vague
- All acceptance criteria are testable and executable

> **The system MUST block progress if gates are not met.**

---

## 9. Spec Graph Contract Between SpecKit and OpenSpec

Every artifact must link forward and backward. This is what makes the system navigable months later.

### Every Component Spec (OpenSpec) must include

```
implements:            Platform Spec ID + version
context_pack:          ID + version (from MCP Router)
contracts_referenced:  event/API versions used
blocked_by:            ADR IDs (empty list if none)
status:                Draft / Approved / Implementing / Done / Paused / Blocked
outcome:               shipped version + rollout notes (on completion)
```

### Every Platform Spec (SpecKit) must include

```
children:         list of component specs (OpenSpec references)
contract_specs:   version bumps + consumer impact notes
adrs:             decisions that govern this feature
context_pack:     version used when this spec was authored
```

### Spec Graph Update Rule

Add to `constitution.md` so every agent maintains it automatically:

```
## Spec Graph Rule
After every implementation run, update spec-graph.json with:
- implements: parent spec this component implements
- dependsOn: contracts, ADRs, policies referenced
- affects: domains, APIs, events changed
- status: current state
Specs are NEVER deleted — only versioned or set to Paused.
```

---

## 10. Change Management

### Platform-Level Change Request

Used when UX flows, shared event contracts, or platform policies change (cross-domain impact).

1. Create new Platform Spec version (or Platform Change Spec)
2. Regenerate Context Pack (new version via MCP Router)
3. Generate component impact list: which specs become stale, which components must rebaseline
4. Each affected component creates a Component Change Spec referencing the new Context Pack version

### Component-Level Change Request

Used for local optimizations, refactors without contract impact, local features.

1. Create or update Component Change Spec in the component repo
2. Consult Component MCP + Platform MCP (for NFR/quality compliance)
3. Validate integration gate: confirm no contract impact
4. Implement and register in Spec Graph

---

## 11. Priority Management

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

## 12. ADR Governance

ADRs are first-class artifacts that gate implementation. They are not optional documentation.

### States
```
Proposed → In Review → Approved
                    → Rejected
```

### Scope
- **Global ADR** (Platform Repo `/adr/`) — impacts multiple components or platform policy; blocks any component that depends on the decision
- **Local ADR** (Component Repo `/adr/`) — impacts only this component's implementation; does not block other components

### Blocking Rule
```
Spec → BlockedBy: ADR-###
```
No spec passes Gate 5 while its `BlockedBy` list contains any unresolved ADR entry.

### Flow
1. Ambiguity detected in spec → ADR Draft created, owner assigned
2. ADR goes through review
3. On Approved → unblock dependent specs, resume planning
4. On Rejected → spec updated to reflect the rejected path

---

## 13. Bugs and Hotfixes

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
     - Observability validation (which metric/log confirms resolution)
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

## 14. Enforcement Model

> **The system MUST block progress if gates are not met.**

| Layer | Mechanism |
|---|---|
| **CLI** | `specify check` validates prerequisites; `/speckit.analyze` gates block fan-out |
| **CI Validation** | PR checks validate every spec includes `implements`, `context_pack`, and gate status |
| **PR Checks** | Spec Graph link validation — no PR merged without updated `spec-graph.json` |
| **AI Agent Guardrails** | Agent system prompt enforces: no code without spec, no spec without sources, stop on missing context |

---

## 15. JIRA Tracking Model

| Issue Type | ID Pattern | Owner | Links To |
|---|---|---|---|
| **Epic (Initiative)** | ECO-124 | Product Manager | All platform specs for this initiative |
| **Platform Spec** | SPEC-PLAT-124 | Platform Architect | Initiative, context pack version, child component specs |
| **Component Spec** | SPEC-CART-01, SPEC-PAY-02 | Component Team | Parent platform spec, context pack version, contracts, ADRs |
| **Contract Change** | SPEC-CONTRACT-10 | Integration Owner | Affected consumers, parent platform spec |
| **ADR** | ADR-100 | ADR Owner | Blocking specs (global or local) |
| **Bug** | BUG-200 | Component Team | Component spec, incident link |
| **Hotfix** | HOTFIX-01 | On-call / Component Team | Follow-up spec, ADR (if policy exception was made) |

Each issue must link to: parent platform spec, Context Pack version, contracts and ADRs involved.

---

## 16. Success Metrics

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

## 17. AI Agent System Prompt

Deploy this in any AI coding agent (Claude Code, Copilot, Cursor, etc.) operating in this system.

```
You are a Spec-Oriented Engineering Agent.

Your job is NOT to write code first.
Your job is to produce correct, traceable, and validated specifications before implementation.

You MUST follow Spec-Driven Development (SDD) with MCP context.

You operate in two mandatory phases:
1) QUESTION IDENTIFICATION
2) SPEC OR ANSWER GENERATION
You MUST NOT skip phases.

CORE RULES:
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

PHASE 1 — QUESTION IDENTIFICATION (MANDATORY):
Extract and output:
  Type: [Feature / Change / Bug / Hotfix / Unknown]
  Core Question: [what is really being asked]
  Domains Involved: [list]
  Dependencies: [contracts, ADRs, components]
  Missing Context: [list — if non-empty, STOP and ask]
  Risk Level: [Low / Medium / High]

PHASE 2 — SPEC GENERATION:
  Feature → Full SpecKit spec (see template)
  Change  → Change Spec + Impact Analysis
  Bug     → Reproduction + Root Cause + Fix Plan + Tests
  Hotfix  → Minimal Hotfix Spec (issue, fix, rollback, validation)

GATE CHECK (include before finishing every spec):
  - Context completeness: PASS/FAIL
  - Domain validity:      PASS/FAIL
  - Integration safety:   PASS/FAIL
  - NFR compliance:       PASS/FAIL
  - Ready to implement:   PASS/FAIL
If any FAIL → do not proceed. State what is missing.

STRICT MODE (recommended):
  If asked for code without a spec → refuse and propose spec first
  If asked to skip context → block and ask what MCP sources are available
  If context_pack version is not declared → stop and request it
```

---

## 18. Spec Template (MCP-Aware)

Every section must declare its source. This is what makes the process anti-invention.

```markdown
# Spec

## Metadata
- ID:
- Implements: [Platform Spec ID + version]
- Context Pack: [version]
- Status:
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
- Domain validity: PASS/FAIL
- Integration safety: PASS/FAIL
- NFR compliance: PASS/FAIL
- Ready to implement: PASS/FAIL

## ADRs
## References (MCP Sources + versions)
## Spec Graph Links
```

---

## 19. Day 1 Implementation Checklist

### Phase 1: Foundation

- [ ] Stand up Platform Repo with SpecKit (`specify init platform-repo --ai claude`)
- [ ] Run `/speckit.constitution` — encode all platform principles as `constitution.md`
- [ ] Write `domains/*.md` files for each bounded context (Domain MCP content)
- [ ] Define Integration MCP: contract registry, versioning rules, consumer lists
- [ ] Create `spec-graph.json` structure in `.specify/memory/`

### Phase 2: First Initiative

- [ ] Select one pilot initiative
- [ ] Run MCP Router to generate Context Pack
- [ ] Run `/speckit.specify` — create Platform Spec
- [ ] Run `/speckit.clarify` — surface ADR drafts before planning
- [ ] Resolve or assign owners to all blocking ADRs
- [ ] Run `/speckit.plan` + `/speckit.tasks` — generate fan-out tasks
- [ ] Run `/speckit.analyze` — all 5 gates must pass before fan-out

### Phase 3: Component Fan-Out

- [ ] Fan out tasks to 2–3 component repos
- [ ] Each team creates Component Spec in their repo using OpenSpec
- [ ] Enforce: `implements`, `context_pack`, `contracts_referenced` required in every spec
- [ ] First component passes Gate 5 and proceeds to implementation

### Phase 4: Hardening

- [ ] Add CI validation: spec link checks on every PR
- [ ] Add AI agent guardrails: deploy system prompt to all coding agents
- [ ] Map JIRA issue types to artifact types
- [ ] Begin tracking success metrics

---

## 20. Scaling Guide

### Small Team / Early Stage (1–2 teams)

Use SpecKit for everything in one repo. The platform/component split is conceptual, not physical. Skip OpenSpec until you have multiple teams stepping on each other's specs.

```
single-repo/
├── .specify/memory/constitution.md
├── .specify/memory/domains/
├── specs/001-platform-spec/
├── specs/002-cart-component/
└── adrs/
```

### Growing Team (3–5 teams)

Introduce the physical split. Separate Platform Repo (SpecKit) from Component Repos (OpenSpec). MCP Router becomes a shared service.

### Enterprise (5+ teams)

Full model as described in this document. Add a queryable Spec Graph database, live Integration MCP with consumer impact APIs, and contract registry as a dedicated service.

---

## The Point of This Split

**SpecKit** gives you a consistent platform-level "what/why + rollout" workflow, driven by standardized commands.

**OpenSpec** gives component teams autonomy to execute "how" and keep local spec history — without losing alignment.

**MCP Context Packs** ensure everyone implements against the same ecosystem truth — preserving single source of truth beyond code.

> *"Software is no longer just built — it is specified, validated, and executed as a system of knowledge."*

---

*v2.0 — February 2026*
