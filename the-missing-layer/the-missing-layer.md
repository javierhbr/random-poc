# The Missing Layer in Spec-Driven Development

> A working paper on behavioral truth — from historical specs to a living source of truth for what the system *currently* does, for humans and for the agents that will read it.

| | |
|---|---|
| **Subject** | Behavioral truth |
| **Audience** | Engineers, product managers & AI agents |
| **Status** | Proposal · v0.2 |
| **Position** | Layer above EARS / LID / OpenSpec / Spec Kit / BMAD |
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
10. [The Semantic Behavioral Tag Layer](#chapter-10--the-semantic-behavioral-tag-layer)
11. [How a New Change Works](#chapter-11--how-a-new-change-works)
12. [Product and Technology Collaboration](#chapter-12--product-and-technology-collaboration)
13. [Closing — The Final Vision](#closing--the-final-vision)

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

### Side-by-side — where the current state lives

EARS and LID are not the only methodologies in the conversation. OpenSpec, Spec Kit, and BMAD each take a different position on where the *current state* of the system should live, and how it gets updated. Some treat it as a first-class artifact. Most treat it as a convention you have to introduce yourself.

| Methodology | Best current-state location | Native or custom? | How it gets updated |
|---|---|---|---|
| **OpenSpec** | `openspec/specs/card-balance/spec.md` | Native | Archive / merge accepted change deltas |
| **LID + EARS** | `docs/specs/card-balance.ears.md` plus trace graph | Native-ish | Update requirement IDs, tests, and `@spec` links |
| **Spec Kit** | `product-state/card-balance.md` or `specs/current/card-balance.md` | Custom recommended | Generate from accepted feature specs |
| **BMAD** | `docs/current-state/card-balance.md` | Custom recommended | Reconcile PRD, architecture, stories, QA |

Two patterns emerge.

**Only OpenSpec treats the current state as a first-class native artifact.** Everywhere else, the location is either implicit — reconstructed from requirement IDs and trace graphs (LID + EARS) — or bolted on as a convention you have to introduce yourself (Spec Kit, BMAD). The current state doesn't have a home unless you build one.

**Update mechanisms vary in how mechanically reliable they are.** Archiving accepted change deltas (OpenSpec) is the most deterministic — a change is either merged or it isn't, and the current state moves with it. Reconciling PRDs, architecture docs, stories, and QA artifacts after the fact (BMAD) is the most prone to drift, because there's no single moment when the current state is declared up-to-date.

> The proposal in this paper generalizes the OpenSpec pattern. Any of the methodologies above can adopt the `/current-behavior` house: OpenSpec already implies it, LID + EARS can promote requirement files into it, Spec Kit and BMAD can formalize the convention they already recommend. The current state stops being an artifact-of-convention and becomes the central house of knowledge that all other artifacts feed into.

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

Architecture documentation then explains *how* we chose to deliver that behavior. Both matter; only one is currently written.

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
    tags.yaml
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

## Chapter 10 · The Semantic Behavioral Tag Layer

> **The graph tells you how things connect. The tag layer tells you how to find them.**

The knowledge graph is excellent at saying *how* nodes relate. But once a card platform has hundreds of features, services, rules, and flows, a second question appears: *how do you address them?*

After a year of development, the same fraud-blocking capability has been named `fraudBlockHighRisk`, `risk-fraud-block`, `block-fraud-cvv-mismatch`, and `fraud.block.txn.highrisk` by four different squads — fraud, auth, disputes, compliance. The graph connects them once you know they exist. It doesn't help you *find* them in the first place.

### One feature, many addresses

Every node carries a small set of semantic tags following a fixed format:

```
{intent}:{role}:{sub-intent}
```

Each segment is **≤ 10 characters, lowercase, alphanumeric plus hyphens**. The 10-char ceiling is deliberate — it fits in code comments and CLI flags, it forces vocabulary discipline, and it keeps the entire tag set scannable by humans and machines alike.

The key property: **every prefix of a tag is itself a valid search key.**

Take the rule *"decline a transaction when the authorization amount exceeds the cardholder's daily spend limit."* The node carries three tags:

```
auth
auth:decline
auth:decline:limit
```

These are not three different features. They are three different *addresses* for the same node.

| Query | Returns |
|---|---|
| `auth` | Every authorization concern on the platform |
| `auth:decline` | Every decline reason across all triggers |
| `auth:decline:limit` | The specific spend-limit decline rule |

A compliance officer auditing the auth surface queries `auth`. An auth engineer queries `auth:decline`. An AI agent investigating one transaction queries `auth:decline:limit`. Same node. Three audiences. Zero renaming.

### Why multiple tags per node

A single-hierarchy taxonomy would force a choice — *is this primarily fraud, auth, or risk?* — and lose every other view. The tag layer refuses the choice.

The CVV-mismatch fraud rule is simultaneously:

- a **fraud** concern (loss prevention, model inputs, false-positive rates)
- an **auth** concern (it fires during the authorization decision)
- a **risk** concern (capital, reserves, regulatory reporting)
- a **dispute** input (when the cardholder later disputes, this signal feeds the investigation)

So the same node carries:

```
fraud:block:cvv
auth:decline:cvv
risk:signal:cvv
```

Each tag is a valid lens. The fraud team, the auth team, and the risk team each search from their own vocabulary and arrive at the same node.

### The four faces of a chargeback feature

Consider the feature *"automatically credit the cardholder provisionally within 10 business days when a dispute is filed under Reg E."* In a single-hierarchy world, this lives under "disputes" and disappears from every other team's view. With the tag layer, the node carries:

```
dispute:credit:prov
ledger:credit:prov
compli:rege:timeline
cardhold:notify:credit
```

The dispute team finds it under `dispute:*`. The ledger team finds it under `ledger:*`. The compliance team finds it under `compli:rege:*` during audit prep. The notifications team finds it under `cardhold:notify:*` when reviewing customer messaging. Same node. Four legitimate addresses.

### How it plugs in

The tag layer is not a parallel system. It plugs into the layers already proposed:

- In **`/current-behavior`**, each component declares its tags in frontmatter
- In **`/graph/graph.json`**, each node carries a `tags: []` array — the graph becomes prefix-searchable
- The **`@spec`** anchor in code still points to the spec ID — tags are for *discovery*, the anchor is for *traceability*
- For **AI agents**, prefix queries dramatically reduce context: `auth:3ds` retrieves a focused subset instead of every spec
- For **regulators and auditors**, `compli:rege:*` collapses a multi-week discovery exercise into a single query

### The one risk worth naming — governance

The tag layer degrades if vocabulary isn't governed. Without a registry, the fraud team will invent `fraud`, the risk team will invent `risk`, the compliance team will invent `compli` — and the prefix-search benefit collapses.

A small `tags.yaml` lives under `/traceability/`. For a credit card platform, the initial vocabulary might look like this:

```yaml
intents:
  - auth        # authorization decisions
  - fraud       # fraud detection and prevention
  - risk        # capital, reserves, regulatory risk
  - dispute     # chargebacks and dispute resolution
  - reward      # rewards, points, cashback
  - ledger      # double-entry accounting
  - compli      # compliance and regulatory reporting
  - cardhold    # cardholder-facing surfaces
  - network     # Visa / MC / Amex integration
  - notify      # notifications and messaging

roles:
  - block       # prevent the action
  - approve     # allow the action
  - decline     # reject with reason
  - credit      # post a credit
  - debit       # post a debit
  - signal      # input for downstream decisions
  - report      # regulatory or audit artifact
  - notify      # send a message
  - reverse     # undo a prior action
```

CI validates every new tag against the registry. New intents and roles need a lightweight quarterly review — one meeting, not a process. The discipline is cheap; the discipline *is* the value.

---

## Chapter 11 · How a New Change Works

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

## Chapter 12 · Product and Technology Collaboration

> **A source of truth survives only if both sides operate against it.**

The current-behavior layer cannot be sustained by product alone, or engineering alone. Product knows *what the business is supposed to do*. Engineering knows *what the system actually does at runtime*. The framework stays consistent only when both sides operate against the same artifact, in the same repository, under a shared contract.

### The three principles

**1. One artifact, two readers.**
The specification layer is a single source of truth that must be readable by a product manager during discovery *and* by an engineer (or AI agent) during implementation. Neither side maintains a private fork.

**2. Product owns intent. Engineering owns implementation. Both own the truth.**
Product defines what the system *should* do. Engineering decides *how* it is built and ensures the code reflects what was agreed. The specification layer — the description of what the system actually does today — is co-owned: neither side alone can declare it correct. Product confirms the behavior is the right behavior; engineering confirms the behavior matches the deployed code.

**3. Behavior outlives implementation.**
When product behavior is stable, engineering is free to refactor, migrate, and re-platform without renegotiating with the business. This is the contract product and engineering exchange for the discipline of maintaining the layer.

### Who owns what

Each house of knowledge has a primary owner, a secondary contributor, and an approval gate. Ownership is shared but not symmetrical — the framework fails when no single role is accountable for a given house.

| House | Primary owner | Secondary | Approval gate |
|---|---|---|---|
| **`/current-behavior`** | Engineering Lead | Product Manager | Both sign before promotion |
| **`/changes`** | Product Manager | Engineering Lead, Architect | Product signs proposal; Engineering signs design |
| **`/decisions`** | Architect / Staff Engineer | Engineering Lead, Product (for business-impacting ADRs) | Architect approves; Product reviews when business behavior is touched |
| **`/traceability` & `/graph`** | Platform / DevEx Team | All contributors | Automated regeneration; human review on contract breaks |

The `/current-behavior` house is the clearest expression of joint ownership. Engineers do the writing — only they can guarantee the spec matches deployed code. Product reads and validates continuously — only they can confirm the behavior is the right behavior. Neither role alone can declare the spec true. Promotion requires both signatures: engineering attesting *"this is what the system does,"* product attesting *"this is what the system should do."*

### Mapped to the change workflow

The eight-step flow from Chapter 11 becomes a coordination protocol when mapped to roles.

| Step | Product Manager | Engineering Lead | Architect | QA |
|---|---|---|---|---|
| **01–02** Discover & read current | Authors `proposal.md`; defines business value | Reviews feasibility; flags affected components | Identifies cross-platform impact | Drafts acceptance criteria |
| **03–04** Identify & walk the graph | Validates EARS clauses match intent | Validates technical accuracy of triggers | Reviews L02/L01 propagation | Verifies requirements are testable |
| **05–06** Propose & implement | Available for clarification; does not approve code | Writes logic; links `@spec` anchor | Reviews architectural conformance | Builds tests against EARS clauses |
| **07–08** Update current-behavior & graph | Confirms behavior matches intent; **co-signs promotion** | Confirms code matches spec; **co-signs promotion** | Records any new ADRs | Confirms regression suite passes |

> Promotion requires both signatures. Engineering attests the spec matches deployed code. Product attests the behavior is what the business wants. Either signature alone is insufficient — and the framework treats their absence as a deployment blocker, not a paperwork delay.

### Three rituals, one artifact

The framework introduces three lightweight rituals that replace what is usually a sprawling ecosystem of stand-ups, PRDs, design reviews, and tribal-knowledge transfers. The artifact *is* the meeting agenda.

- **Spec triage** — weekly, 30 minutes. Product and engineering review `/changes/` together. What advances to validation, what needs rework, what is deferred. Replaces unstructured backlog grooming with a behavior-first conversation.
- **Promotion review** — per release, 15 minutes. Before any change is promoted to `/current-behavior`, product and engineering jointly confirm the spec matches deployed behavior. Tied to deployment, not to a calendar.
- **Behavioral retrospective** — quarterly. Product, engineering, and architecture review the current-behavior layer at the L03 / L02 levels. Goal: surface drift, deprecated behaviors still documented as active, gaps where tribal knowledge has not been captured.

### The anti-pattern — documentation as engineering tax

A common failure: product treats the spec layer as engineering's responsibility, and engineering treats it as a tax. The layer then becomes the same historical archive the framework was designed to prevent — only with a cleaner directory structure.

Three signals the collaboration is breaking down:

- Product managers ask engineers *"what does the system do?"* instead of reading `/current-behavior`
- Engineers update code without updating the spec, and CI doesn't catch it
- Architecture decisions are made in chat messages or meetings without producing an ADR

The remedy is not more process. It is enforcing the contract that **a change is not deployed until the spec is updated and both sides have signed.** This must be a build-pipeline gate, not a guideline.

### Where the AI agent fits

When the collaboration is healthy, the AI agent becomes a productive third participant in the loop:

- During discovery, it translates informal product narratives into EARS-compliant draft specs that product and engineering then refine
- During implementation, it verifies that proposed code changes do not break contracts declared in `/current-behavior`
- During promotion, it compares the draft spec against the diff being merged and flags mismatches before product is asked to sign off

The agent is not a replacement for either role. It is a tool that lowers the cost of maintaining the layer — which is the single biggest objection product and engineering will raise when the framework is first introduced.

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
- **Semantic addressing** — every node findable from multiple angles, at multiple levels of specificity
- **Shared ownership** — product owns intent, engineering owns implementation, both own the truth
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
| **Tags** | `fraud:block:cvv`, `auth:decline:limit`, `compli:rege:timeline` |

### Cross-platform interaction

The dashed edge in the enterprise composition graph captures a real interaction: a cardholder views a charge in `statement-viewer` (Platform A · self-service), recognizes it as suspicious, and initiates a dispute that hands off to `dispute-engine` (Platform B · servicing-operations). The behavioral source of truth makes this cross-platform handoff explicit and navigable.

---

*A working paper · The Missing Layer · 2026*
