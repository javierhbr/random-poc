# The Missing Layer in Spec-Driven Development

> A working paper on behavioral truth — from historical specs to a living source of truth for what the system *currently* does, for humans and for the agents that will read it.

| | |
|---|---|
| **Subject** | Behavioral truth |
| **Audience** | Engineers & AI agents |
| **Status** | Proposal · v0.1 |
| **Position** | Layer above EARS / LID |
| **Domain example** | Bank Customer Servicing — Credit Cards |

---

## Table of Contents

1. [The Vision](#chapter-01--the-vision)
2. [The Current Problem](#chapter-02--the-current-problem)
3. [Where Existing Methods Reach Their Edge](#chapter-03--where-existing-methods-reach-their-edge)
4. [Behavior is Composable](#chapter-04--behavior-is-composable)
5. [The Documentation Imbalance](#chapter-05--the-documentation-imbalance)
6. [The AI Agent Perspective](#chapter-06--the-ai-agent-perspective)
7. [The Proposal](#chapter-07--the-proposal)
8. [Where Traceability Belongs](#chapter-08--where-traceability-belongs)
9. [The Knowledge Graph](#chapter-09--the-knowledge-graph)
10. [How a New Change Works](#chapter-10--how-a-new-change-works)
11. [Closing — The Final Vision](#closing--the-final-vision)

---

## The First Principle

> *Before changing the system, we must understand what the system currently does.*

---

## Chapter 01 · The Vision

Create a repository-native **source of truth** that describes the current active behavior of every component, platform, and ecosystem.

### Four kinds of knowledge

**1. Current Behavior**
What the system does today — not last year, not next quarter. The operational truth.

**2. Change History**
How the system evolved. Decisions, proposals, deprecations — preserved but separated from current truth.

**3. Traceability**
How behavior connects to specs, code, tests, and architectural decisions.

**4. Knowledge Graph**
Relationships made navigable — for humans reading docs and agents reasoning about change.

---

## Chapter 02 · The Current Problem

**Most spec systems become historical archives.**

They contain useful information, but over time they mix too many temporal states together. When everything lives in the same bucket, it becomes hard to know what is actually true *today*.

### The mixed bucket

A typical spec repository today contains all of these, side by side:

- ✓ implemented behaviors
- ⌛ future ideas
- ✗ deprecated specs
- ⏸ pending proposals
- 🧪 experimental notes
- ✗ rejected approaches
- ◐ partial implementations
- 📜 historical decisions
- 📜 old ADRs

### The pain this creates

- Engineers must read many specs to reconstruct truth
- AI agents must infer behavior from fragments
- Deprecated ideas may still look active
- Future proposals get confused with shipped reality
- Impact analysis becomes slow and uncertain
- Context retrieval becomes expensive and noisy

---

## Chapter 03 · Where Existing Methods Reach Their Edge

### EARS is clear, but not current

EARS is excellent for writing unambiguous behavioral requirements. It reduces ambiguity, standardizes language, and helps both humans and AI understand intent.

```ears
WHEN a card's fraud risk score
   exceeds the auto-lock threshold
THEN the servicing platform
   SHALL lock the card and notify
   the cardholder within 30 seconds.

// Clear requirement.
// But — is it active today?
// Or replaced by ADR-014?
// Or still pending?
```

But EARS describes *required* behavior. It does not tell us whether that behavior is active today, was replaced, is future work, or is partially implemented.

#### EARS · what it does well

- Reduces ambiguity
- Standardizes requirement language
- Improves readability
- Helps validation
- Helps humans and AI understand intent

#### EARS · what it leaves open

- Is this behavior active today?
- Was it replaced?
- Is it future work?
- Is it deprecated?
- Is it still the operational truth?

---

### LID draws the arrow — at the project level

[Linked-Intent Development](https://github.com/jszmajda/lid) goes further than EARS. It treats design as the source of truth, with an explicit **Arrow of Intent**:

```
HLD → LLDs → EARS → Tests → Code
```

Changes flow downstream and the docs stay current.

Inside a project, this is excellent. `@spec` annotations in code link back to requirements:

```typescript
@spec CARD-LOCK-001
export function lockCardOnFraud() { ... }
```

What LID intentionally scopes *to the project* — not by oversight, but by design — is the ecosystem layer: how dozens of LID-managed projects compose into a platform, how their current behaviors interact, how a change in one system ripples through the others.

#### LID · what it does well

- Treats design docs as the source of truth
- Cascades changes downstream through the arrow
- Links code to specs via `@spec` annotations
- Tracks coherence across a single project
- Optimizes for the project over time, not just the next change

#### What's still open at scale

- How do *multiple* LID projects compose into a platform?
- Where is the ecosystem-wide behavioral view?
- How do agents reason about cross-project impact?
- How is current behavior separated from change history?
- What is the navigable graph between systems?

> The missing layer this paper proposes **complements LID** — not replaces it. LID gives you the arrow inside a project. The behavioral source of truth and graph extend that thinking across many projects, the platform, and the broader ecosystem.

---

## Chapter 04 · Behavior is Composable

**A component does not exist alone. It composes upward.**

If each component has a clear current-state behavior, the platform can be understood as a composition of component behaviors. Without that, platforms rely on tribal knowledge.

### The four layers — top-down

| Layer | Scope | Example |
|---|---|---|
| **L01** ◈ | Enterprise-Wide Behavior | Global Retail Bank |
| **L02** | Multi-Platform Ecosystem | Customer Servicing |
| **L03** | Platform Behavior | Cardholder Self-Service / Servicing Operations |
| **L04** | Component Behavior | card-controls, dispute-engine, statement-viewer, payment-poster |

A change at L04 propagates upward; a strategic shift at L01 propagates downward. The composition is navigable in both directions.

---

## Chapter 05 · The Documentation Imbalance

> **We document the architecture in detail. We document the product almost not at all.**

Architectures are not supposed to change business behavior — and yet most of our written record is about *how* the system is built, not *what* the product is supposed to do.

### The repository shelf

#### What we write a lot of (≈ 82% of pages)

- ADR-001 · PCI tokenization strategy
- ADR-002 · event contracts (card events)
- ADR-014 · cache invalidation strategy
- HLA · servicing platform overview v3
- LLA · dispute-engine internals
- Non-functional requirements
- Scalability strategy · 2025
- Deployment topology · multi-region
- Resiliency & failover patterns
- Observability stack design
- Saga orchestration playbook
- CQRS read-model conventions
- Infrastructure migration plan
- Redis caching guidelines
- Service mesh configuration

#### What we barely write (≈ 18% of pages)

- What cardholder servicing is supposed to do
- How a locked card behaves, today
- Why disputes have a 90-day window
- *— everything else is missing —*

### The question that cuts

> If a new engineer joins on Monday — or an AI agent opens the repo for the first time — **where do they read about what the product actually does?**

---

### Why this imbalance exists

**Methodologies drifted toward implementation.**

Over time, our writing optimized around *how* the system is built — components, infrastructure, patterns, resiliency. The *why* and the *what* of the product stopped being written down. Behavior moved into tribal memory.

#### What ends up documented

```
Architecture & patterns
         ↓
Technical decomposition
         ↓
Component & infra decisions
         ↓
Behavior — assumed, not written
```

ADRs proliferate. Sagas, CQRS, Redis, microservices are described in depth. Meanwhile the product's *actual behavior* lives in people's heads — and disappears when they leave.

#### What should be documented first

```
Business & product behavior
         ↓
Operational expectations
         ↓
Functional contracts
         ↓
Architecture & implementation choices
```

Write behavior first — explicitly, in the repo, as a first-class artifact. Architecture documentation then explains *how* we chose to deliver that behavior. Both matter; only one is currently written.

---

### The proof — Architecture can change. Behavior should not.

Cloud migrations, database swaps, adopting Redis, moving to events — these are architectural moves. If our docs are mostly about architecture, every one of these rewrites the documentation. If behavior were documented separately, it would stay stable through all of it.

| Architecture · changes often *(written)* | Behavior · should be stable *(rarely written)* |
|---|---|
| High-level & low-level architecture | Business workflows |
| Deployment topology | User expectations & experience |
| Latency & throughput characteristics | Operational contracts |
| Resiliency & observability patterns | Functional guarantees |
| Storage, caching, messaging choices | Platform semantics |
| Vendor & infrastructure footprint | Product capabilities |

> The current-state behavioral source of truth gives the **product side of the shelf** a real home — so architecture can evolve underneath, and the product's intent stays explicitly written, not assumed.

---

## Chapter 06 · The AI Agent Perspective

> **Without a source of truth, agents become archaeologists.**

### Today — reconstruction from fragments

```
01  User asks for a change
02  AI reads specs
03  AI reads code
04  AI reads tests
05  AI reads ADRs
06  AI guesses current behavior
07  AI attempts impact analysis
```

→ Slow. Token-hungry. Conflicting context. Hallucination risk.

### Proposed — truth-first

```
01  User asks for a change
02  AI loads Current Behavior Spec
03  AI loads Graph
04  AI identifies impacted components
05  AI analyzes related specs, code, tests
06  AI proposes safer implementation
```

→ Faster · safer · more accurate · scalable.

---

## Chapter 07 · The Proposal

> **A repository-native behavioral knowledge layer.**

Not a replacement for existing methodologies — a missing layer on top of them. Versioned alongside your code, navigable by humans and agents alike.

### Repository structure

```
/spec
  /current-behavior        ◈ source of truth
    platform.md
    /components
      card-controls.md
      dispute-engine.md
      payment-poster.md
  /changes
    /2026-001-fraud-auto-lock
      proposal.md
      design.md
      tasks.md
      impact.md
  /decisions
    adr-001-pci-tokenization.md
    adr-002-card-event-contracts.md
  /traceability
    features.yaml
    rules.yaml
    flows.yaml
  /graph
    graph.json
```

### Four kinds of knowledge, four homes

| Directory | Purpose |
|---|---|
| **`/current-behavior`** | The operational truth. What is true *today*. The file you open first. |
| **`/changes`** | Proposals and historical evolution — not mixed in with what's live. |
| **`/decisions`** | The why behind constraints. |
| **`/traceability` & `/graph`** | What makes everything navigable — by humans and by agents. |

> A change is not complete until the current-behavior layer is updated.

---

## Chapter 08 · Where Traceability Belongs

> **Tags are powerful. Where you put them matters more.**

Tags like `@future`, `@rule`, `@adr` are useful for categorizing intent, decisions, and constraints — but they belong at the *specification layer*, not buried throughout the code.

### ⊗ Annotations everywhere — the code becomes a governance document

`card-controls.ts`

```typescript
@feature(card-lock-on-fraud)
@rule(fraud-threshold-lock)
@rule(notify-cardholder-on-lock)
@flow(dispute-90-day-window)
@flow(auto-lock-flow)
@adr(pci-tokenization-strategy)
@adr(card-event-contracts)
@future(biometric-unlock)
@governance(pci-dss-compliant)
@owner(team-card-servicing)
@sla(30s-lock-latency)
export async function lockCardOnFraud() {
  // ... actual logic buried below ...
}
```

The code becomes a governance document. Business, architectural, and operational metadata all compete with the logic. Hard to read, harder to maintain.

### ◈ Spec ID as the anchor — implementation stays implementation

`card-controls.ts`

```typescript
@spec(SPEC-card-lock-fraud-v2)

export async function lockCardOnFraud() {
  // implementation here.
  // everything else — rules, ADRs,
  // future capabilities, governance —
  // lives in the spec, not the code.
}
```

One link. **The code traces to the spec; the spec traces to everything else.**

### The separation of concerns

#### Inside the codebase — Code traces to spec

A single, stable anchor inside the source. Nothing else.

```
@spec(SPEC-card-lock-fraud-v2)
  ↳ Component implementation
  ↳ Tests reference the same spec ID
  ↳ Commits / PRs reference the spec ID
```

#### At the specification layer — Spec traces to everything

Where business, architectural, and governance context naturally lives.

```
SPEC-card-lock-fraud-v2.md
  @rule(fraud-threshold-lock)
  @flow(dispute-90-day-window)
  @adr(pci-tokenization-strategy)
  @future(biometric-unlock)
  @governance(pci-dss-compliant)
  @owner(team-card-servicing)
  @change-history(2026-001, 2025-014)
```

> The codebase stays clean. The spec becomes the **central traceability anchor** — the meeting point between implementation and the broader business, architectural, and governance context.

---

## Chapter 09 · The Knowledge Graph

> **Behavior, specs, components, tests, APIs, decisions — connected.**

A simple, version-controlled JSON graph. No heavy database. AI-friendly. Easy to regenerate.

The graph supports **two complementary views**: a *hierarchical* drill-down from enterprise to component, and a *flat* network of cross-cutting relationships.

### Hierarchical view — top-down composition

```
[L01] Enterprise-Wide Behavior
 └── [L02] Multi-Platform Ecosystem · customer-servicing
      ├── [L03 · A] Platform · cardholder-self-service
      │    ├── [L04] component · card-controls
      │    └── [L04] component · statement-viewer
      └── [L03 · B] Platform · servicing-operations
           ├── [L04] component · dispute-engine
           └── [L04] component · payment-poster
```

Each tier in the graph owns a **current-behavior** document. The enterprise composes ecosystems, ecosystems compose platforms, platforms compose components — and any change can be traced upward to ask *"who is affected?"* or downward to ask *"what does this mean to deliver?"*

### Enterprise composition graph

The same hierarchy, rendered as a graph. Edges read top-down — `composes`, `contains`, `realized_by` — making the composition structure navigable as data.

```
                       [L01]
              Enterprise-Wide Behavior
                          │
                       composes
                          ▼
                       [L02]
        Multi-Platform Ecosystem · customer-servicing
                     /         \
                  contains   contains
                   /              \
                  ▼                ▼
        [L03 · A]              [L03 · B]
   cardholder-self-service   servicing-operations
        /        \              /        \
   realized_by realized_by  realized_by realized_by
       /           \          /            \
      ▼             ▼        ▼              ▼
  [L04]          [L04]    [L04]           [L04]
card-controls statement-  dispute-     payment-
              viewer       engine        poster
                  └ ─ ─ ─ ─ ─ ─ ┘
              cross-platform integration
        (statement-viewer ↔ dispute-engine:
         user views a charge, then disputes it)
```

The dashed edge between `statement-viewer` and `dispute-engine` is a real cross-platform interaction: a cardholder sees a charge on their statement, then initiates a dispute — which crosses from the self-service platform to the servicing operations platform.

### Cross-cutting relationships

Beneath the hierarchy, the same graph models the lateral connections — features to events, rules to tests, ADRs to flows. The structure that humans navigate top-down is the same structure agents traverse sideways.

```
                  implemented_by
  FEATURE ──────────────────────────► RULE
  card-lock-on-fraud              fraud-threshold-lock
        │                                │
        │                                │ publishes
        │                                ▼
        │                          EVENT
        │                          card.locked
        │                                │
        ▼                                │ constrains
   COMPONENT                             ▼
   card-controls                    ADR
        │                          pci-tokenization
        │
        │             validated_by  (dashed crimson edge)
        │           ┌──────────────► TEST
        │           │                fraud-lock.test.ts
        ▼           │
   SPEC ────────────┘
   change-001
```

Example node relationships:

- `FEATURE · card-lock-on-fraud` **implemented_by** `RULE · fraud-threshold-lock`
- `RULE · fraud-threshold-lock` **publishes** `EVENT · card.locked`
- `EVENT · card.locked` **constrained_by** `ADR · pci-tokenization`
- `RULE · fraud-threshold-lock` **validated_by** `TEST · fraud-lock.test.ts`
- `COMPONENT · card-controls` **realizes** `FEATURE · card-lock-on-fraud`
- `SPEC · change-001` **modifies** `FEATURE · card-lock-on-fraud`

### Example node types

| Node type | Example |
|---|---|
| Feature | `card-lock-on-fraud` |
| Rule | `fraud-threshold-lock` |
| Flow | `dispute-90-day-window` |
| Component | `card-controls`, `dispute-engine` |
| Event | `card.locked`, `dispute.opened` |
| Test | `fraud-lock.test.ts` |
| ADR | `pci-tokenization-strategy` |
| Spec | `SPEC-card-lock-fraud-v2` |

### Example relationships

| Edge | Direction | Meaning |
|---|---|---|
| `composes` | L01 → L02 | Enterprise composes ecosystems |
| `contains` | L02 → L03 | Ecosystem contains platforms |
| `realized_by` | L03 → L04 | Platform realized by components |
| `implemented_by` | Feature → Component | Feature implemented by code |
| `publishes` | Component → Event | Component publishes events |
| `consumed_by` | Event → Component | Events consumed by components |
| `validated_by` | Rule → Test | Rules validated by tests |
| `modifies` | Spec → Feature | Specs modify features |
| `constrains` | ADR → Flow | ADRs constrain flows |
| `cross-platform integration` | Component ↔ Component | Lateral cross-platform interactions |

---

## Chapter 10 · How a New Change Works

> **Every change starts by comparing proposed behavior against current behavior.**

| Step | Action |
|---|---|
| **01** | Change request |
| **02** | Read current behavior |
| **03** | Identify affected rules & flows |
| **04** | Walk the graph for impact |
| **05** | Write proposal |
| **06** | Implement change |
| **07** | Update current-behavior |
| **08** ◈ | Update graph |

### The key rule

> A change is not complete until the current-state Source of Truth and the graph are updated.

---

## Closing — The Final Vision

> **From managing specifications to managing operational knowledge.**

Humans and AI agents should be able to quickly understand:

- What the system currently does
- Why it behaves that way
- How it evolved
- What depends on it
- How a new change should impact it

— without reverse-engineering the entire organization from code.

### The combined future

The future is a combination of:

- **Historical governance** — preserved decisions and change records
- **Current functional behavior** — the operational source of truth
- **Traceability** — code-to-spec links, spec-to-context links
- **Behavioral composition** — enterprise → ecosystem → platform → component
- **AI-ready context** — the navigable graph

---

## Appendix · Worked Example Domain — Bank Customer Servicing — Credit Cards

The examples throughout this paper draw from a single coherent domain so they reinforce each other.

### Scenario

A cardholder's transaction triggers a fraud risk score that exceeds the auto-lock threshold. The servicing platform locks the card automatically and notifies the cardholder within 30 seconds. If the cardholder later disputes a charge, they have 90 days to do so (Reg Z compliance).

### Hierarchy

| Layer | Element |
|---|---|
| **L01** Enterprise | Global Retail Bank |
| **L02** Ecosystem | Customer Servicing |
| **L03 · A** Platform | Cardholder Self-Service (mobile / web) |
| **L03 · B** Platform | Servicing Operations |
| **L04** Components (A) | `card-controls`, `statement-viewer` |
| **L04** Components (B) | `dispute-engine`, `payment-poster` |

### Sample artifacts

| Artifact type | Example |
|---|---|
| **Feature** | `card-lock-on-fraud` |
| **Rule** | `fraud-threshold-lock` (auto-lock above risk score N) |
| **Rule** | `notify-cardholder-on-lock` |
| **Flow** | `dispute-90-day-window` (Reg Z compliance) |
| **Flow** | `auto-lock-flow` |
| **ADR** | `pci-tokenization-strategy` |
| **ADR** | `card-event-contracts` |
| **Event** | `card.locked` |
| **Governance** | `pci-dss-compliant` |
| **Owner** | `team-card-servicing` |
| **SLA** | `30s-lock-latency` |
| **Test** | `fraud-lock.test.ts` |
| **Spec ID** | `SPEC-card-lock-fraud-v2`, `CARD-LOCK-001` |
| **Change folder** | `2026-001-fraud-auto-lock` |

### Cross-platform interaction

The dashed edge in the enterprise composition graph captures a real interaction: a cardholder views a charge in `statement-viewer` (Platform A · self-service), recognizes it as suspicious, and initiates a dispute that hands off to `dispute-engine` (Platform B · servicing-operations). The behavioral source of truth makes this cross-platform handoff explicit and navigable.

---

*A working paper · The Missing Layer · 2026*
