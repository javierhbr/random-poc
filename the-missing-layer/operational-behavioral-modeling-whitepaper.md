# Operational Behavioral Modeling for AI-Native Enterprises

## Resolving Temporal Drift in Spec-Driven Development

> Introducing the Current-State Behavioral Source of Truth

**Whitepaper — May 2026**
*A Framework Proposal*

---

## Executive Summary

Modern systems engineering is undergoing a fundamental transition driven by the scale of distributed software architectures and the integration of autonomous artificial intelligence agents into the development lifecycle. Traditional Spec-Driven Development methodologies — including the Easy Approach to Requirements Syntax (EARS), Linked-Intent Development (LID), and various structured specification frameworks such as BIMA, OpenSpec, and SpecKit — have successfully introduced syntactic discipline to early-stage requirements engineering. Yet they exhibit a systemic design flaw over long-term software lifecycles.

Over time, these specification databases naturally degrade, commingling completed implementations, future roadmaps, deprecated legacy logic, and temporary experiments into a single, undifferentiated historical archive of change. Answering the critical operational question of what a system is expected to execute at any given runtime becomes an expensive process of manual reconstruction, leading to misinterpretation, costly rework, verification challenges, and elevated project risk.

This paper proposes the introduction of a repository-native, version-controlled **Current-State Behavioral Source of Truth**. By partitioning specification documentation into a decoupled "Four Houses of Knowledge" model, enterprises can isolate active runtime expectations from chronological change histories. When combined with a bottom-up composable hierarchy (L01 to L04) and a lightweight, repository-native knowledge graph, this architecture eliminates documentation debt and establishes a highly optimized operational interface for artificial intelligence agents. Rather than forcing agents to act as archaeologists parsing conflicting and obsolete requirements, this framework provides direct access to runtime truth — reducing context token overhead, eliminating hallucination risks, and facilitating rapid, targeted impact analyses across multi-platform ecosystems.

---

## 1. Introduction

Spec-Driven Development (SDD) has matured into a credible discipline. Frameworks such as BIMA, OpenSpec, SpecKit, EARS, and LID provide enterprises with powerful instruments for documenting requirements, functional logic, business rules, architectural decisions, governance constraints, and the historical evolution of systems. These approaches have collectively raised the bar of requirements quality and engineering discipline.

However, a structural limitation persists across all of them. Most specification systems naturally evolve into historical archives of change. Repositories begin to accumulate, side by side, implemented functionality, future ideas, pending work, deprecated behaviors, rejected proposals, architectural discussions, partial implementations, experimental concepts, and historical decisions. This accumulation makes one critical question increasingly difficult to answer:

> **What is the system expected to do today?**

This paper argues that the missing layer in modern Spec-Driven Development is a continuously maintained **Current-State Behavioral Source of Truth**: a repository-native operational layer that describes only what the system is actively doing at runtime. It is not a replacement for existing specification frameworks. It is a complement that resolves their temporal drift, restores documentation freshness, and provides the structured operational interface that AI-native engineering organizations now require.

---

## 2. The Current Landscape of Spec-Driven Development

The role of natural language in requirements engineering has been a subject of study since the earliest stages of software engineering. Early researchers posited that natural language was the most accessible medium for expressing requirements. However, unconstrained natural language is inherently imprecise, ambiguous, and highly dependent on the subjective background of individual authors. Requirements authors frequently fail to document assumptions that seem obvious to them, creating implicit requirements and logical gaps that propagate defects downstream. These linguistic defects eventually drive system volatility, schedule slippage, and substantial cost overruns during verification and validation.

To manage this imprecision, traditional requirements engineering established structured processes that move from stakeholder needs to baselined requirements through seven distinct operational steps:

| Step | Operational Phase | Core Activities & Deliverables |
|------|-------------------|---------------------------------|
| 1 | Identify Stakeholders | Map all internal and external parties with a vested interest in the system. |
| 2 | Elicit Stakeholder Needs | Capture raw desires, constraints, and operational goals. |
| 3 | Model Needs & Requirements | Abstract requirements using flowcharts and data flow diagrams. |
| 4 | Retrospective | Review modeling assumptions to resolve conflicts and logical gaps. |
| 5 | Define Integrated Needs | Consolidate conflicting stakeholder requirements into a cohesive baseline. |
| 6 | Define Product Requirements | Translate integrated needs into explicit system and component requirements. |
| 7 | Sign-off and Baseline | Formalize the requirements specification for downstream architectural design. |

Historically, systems engineers relied on modeling tools such as Data Flow Diagrams (DFDs) to define a project's scope. While DFDs remain accessible to both technical and non-technical audiences, they present significant structural limitations. Representing complex systems requires a separate diagram for nearly every distinct workflow, causing the overall model to become unwieldy and preventing a unified view of the ecosystem. DFDs also fail to capture how objects and components behave or collaborate dynamically at runtime.

This gap prompted the discipline to explore controlled natural languages. The development of EARS in 2009, by Alistair Mavin and his colleagues at Rolls-Royce, addressed the challenges of analyzing airworthiness regulations for Full Authority Digital Engine Controllers (FADECs). These controllers operate in safety-critical environments, with thousands of physical components, over 100,000 lines of code, and as many as twenty independent suppliers. Mavin observed that high-quality requirements consistently followed a small set of repeating logical structures, and codified those structures into a lightweight rule set. EARS has since been adopted by organizations including Airbus, Bosch, Dyson, Honeywell, Intel, NASA, and Siemens, and is taught at leading universities across multiple continents.

In parallel, the integration of artificial intelligence has reshaped requirements processing. Early computational linguistics used rule-based and shallow statistical techniques. The introduction of deep learning, particularly transformer architectures such as BERT, brought bidirectional context understanding and improved automated traceability mapping. The field has since transitioned to generative Large Language Models, redirecting research from defect detection toward proactive requirements elicitation, automated validation, and test generation — creating a direct link between structured specifications and executable code.

### 2.1 Syntactic Mechanics and Limitations of EARS

The architectural value of EARS lies in its ability to constrain natural language using a small set of standardized keywords. These keywords establish a consistent logical sequence, ensuring environmental preconditions and triggers are fully defined before declaring the system's identity and its expected response.

The generic structure of an EARS requirement follows the form:

> *While `<pre-condition>`, when `<trigger>`, the `<system name>` shall `<system response>`*

A valid EARS requirement must have zero or many preconditions, zero or one trigger, exactly one system name, and one or many system responses. This syntax produces five fundamental patterns and one combined complex pattern:

| Pattern | Keyword | Example |
|---------|---------|---------|
| Ubiquitous | *(none)* | The engine control system shall maintain active telemetry streaming under all operating conditions. |
| State-Driven | `While` | While the aircraft is in flight, the cabin pressure controller shall maintain cabin altitude below 8,000 feet. |
| Event-Driven | `When` | When "mute" is selected, the laptop shall suppress all audio output. |
| Optional Feature | `Where` | Where the car has a sunroof, the car shall have a sunroof control panel on the driver door. |
| Unwanted Behavior | `If / Then` | If an invalid credit card number is entered, then the website shall display "please re-enter credit card details". |
| Complex | Multiple | While the aircraft is on ground, when reverse thrust is commanded, the engine control system shall enable reverse thrust. |

While EARS enforces syntactic clarity, it is not a universal solution. It was primarily designed to structure high-level stakeholder requirements and is not equally applicable to every level of system decomposition. It is strictly concerned with requirement syntax rather than semantic correctness — a syntactically valid EARS requirement is not guaranteed to be logically valid or technically feasible. EARS templates also excel at capturing functional behavior and state-based triggers but lack a structured mechanism for specifying non-functional dimensions such as latency, throughput, and resource limits.

Most importantly for the argument of this paper, EARS patterns are static. They describe intended behaviors but do not verify whether those behaviors are actively implemented in the running codebase, nor do they distinguish active behaviors from deprecated or planned ones.

---

## 3. The Missing Layer

Spec-Driven Development frameworks track requirements and structural changes over time. That is, by design, what they do. But as software systems scale and undergo continuous evolution, this strength becomes the source of a systemic design flaw. Specifications naturally accumulate historical baggage and transform from authoritative reference documents of current behavior into chronological archives of change.

Within a mature repository, completed and active implementations are stored alongside future product roadmaps, deprecated legacy specifications, rejected design proposals, and experimental feature configurations. Over time, it becomes difficult — and often impossible — to answer the single most critical question of software maintenance: what is the system expected to do today?

The proposal is to introduce a continuously maintained **Current-State Behavioral Source of Truth**. This is a repository-native operational layer describing only the current active behavior, active contracts, supported operational flows, current business rules, ecosystem interactions, and expected runtime semantics. It becomes the operational truth of the system: the canonical answer to what the system does today, decoupled from how it got there.

---

## 4. Behavioral Architecture vs. Implementation Architecture

A platform or system should ultimately reflect what the business product defines. Architectural artifacts — ADRs, non-functional requirements, high-level and low-level architecture, design patterns, infrastructure decisions, scalability strategies, and implementation constraints — are important from an engineering perspective. But they are not the primary concern. The primary concern is what the product is supposed to do, how the ecosystem behaves, how systems integrate, and why the behavior exists.

Architecture should support business behavior. Business behavior should not be constrained by architecture patterns. Patterns such as Saga orchestration, Event-Driven Architecture, CQRS, distributed caching, messaging systems, Redis, microservices, and streaming platforms should not dictate product behavior. The flow of decision-making should be top-down:

```
Business Behavior
       ↓
Operational Expectations
       ↓
Functional Contracts
       ↓
Architecture & Implementation
```

Traditional software development frequently suffers from a documentation imbalance. Systems engineering studies indicate that organizations often focus up to 82% of their documentation on technical implementation details — database schemas, API routing, cache invalidation, deployment topologies — while core product and business behaviors account for only 18% of documented information, frequently existing as tribal knowledge.

This imbalance creates substantial operational risk during technical migrations. Infrastructure and frameworks change frequently to improve performance or reduce operational cost, but the underlying business rules and user expectations remain stable. When product behavior is poorly documented, technical updates — migrating from a relational database to NoSQL, moving between cloud providers, or introducing distributed caching — require developers to reverse-engineer business logic from legacy code, frequently leading to regressions and delays.

Migrating from AWS to another provider, from Oracle to NoSQL, or introducing Redis caching may significantly change infrastructure, deployment topology, scalability, latency, operational complexity, and implementation details. But ideally, these changes should not alter user expectations, business workflows, operational contracts, or functional behavior. The behavior should remain stable while the implementation evolves. The Current-State Behavioral Source of Truth makes this stability explicit and auditable.

---

## 5. Behavioral Snapshot vs. Historical Evolution

The Current-State Behavioral Source of Truth is, by design, a snapshot. It answers a single question — what does the system do today — and refuses to answer any other question within its boundaries. This is not a deficiency. It is the entire point. Historical context, design rationale, in-flight proposals, and rejected ideas are valuable, but they belong to different houses of knowledge.

To enforce this separation, the repository is organized around what this paper calls the **Four Houses of Knowledge**. Each house is responsible for a distinct, non-overlapping concern, and each has its own operational lifecycle.

| House | Directory | Content | Lifecycle |
|-------|-----------|---------|-----------|
| **Current Behavior** | `/spec/current-behavior` | Active, live runtime behaviors, contracts, and business rules. | Updated atomically on deployment; primary entry point for system behavior. |
| **Change History** | `/spec/changes` | In-flight proposals, active feature designs, upcoming tasks, impact analyses. | Segregated by change initiative; archived once deployed. |
| **Decisions** | `/spec/decisions` | Architecture Decision Records and the "why" behind constraints. | Chronological and immutable; provides historical context. |
| **Traceability & Graph** | `/spec/traceability`, `/spec/graph` | YAML indexes and JSON files mapping entities and relationships. | Programmatically regenerated via automated hooks. |

This structure ensures that `/spec/current-behavior` remains a clean, machine-readable representation of the live system. Future plans, abandoned proposals, and historical decisions are still preserved — they simply do not contaminate the operational source of truth.

---

## 6. Why EARS and LID Do Not Fully Solve the Problem

### 6.1 EARS

EARS is exceptionally effective at writing structured requirements, reducing ambiguity, standardizing behavioral expressions, improving readability, and making requirements interpretable by both humans and AI systems. A typical EARS clause reads naturally:

```
WHEN a marketplace account is frozen
THEN the poller SHALL stop processing synchronization jobs.
```

However, EARS is fundamentally requirement-centric. It describes intended, desired, or required behavior. It does not inherently define what behavior is currently active, what requirements are deprecated, what functionality is partially implemented, or what subset of requirements represents operational reality today. Repositories accumulate active, obsolete, future, experimental, and superseded requirements indistinguishably. EARS does not provide a native mechanism to separate current operational truth from historical requirement history.

### 6.2 Linked-Intent Development (LID)

LID moves significantly closer to the vision proposed here. It introduces intent preservation, linked specifications, traceability, annotation-based relationships, and structured evolution tracking, creating continuity between business intent, implementation, and evolution. Any code modification is accompanied by a corresponding update to its underlying specification, preserving the historical context of the system's design.

Yet LID still allows multiple temporal states to coexist: current functionality, future proposals, deprecated behavior, historical evolution, and experimental concepts all live in the same repository. Developers, architects, and AI agents are still forced to reconstruct the actual current operational behavior of the system. LID's scope is also intentionally project-centric. It maps code-to-intent relationships within a specific repository or module but lacks a native mechanism to define how separate projects compose into an enterprise-wide platform, or how changes in one service propagate across multi-platform ecosystems.

### 6.3 The Core Difference

The architectural difference introduced by this proposal is the explicit separation between **historical evolution** and **current operational state**. Specifications continue to track evolution. A dedicated, machine-readable Source of Truth describes current behavior. The two are linked, but they are not commingled.

### 6.4 Side-by-Side: Where the Current State Lives

Different Spec-Driven methodologies place the current operational state in different parts of the repository, and they update it through different mechanisms. The table below summarizes where the current state lives across four representative frameworks — and whether that location is native to the methodology or has to be introduced as a custom convention.

| Methodology | Best Current-State Location | Native or Custom? | How It Gets Updated |
|-------------|------------------------------|-------------------|----------------------|
| **OpenSpec** | `openspec/specs/card-balance/spec.md` | Native | Archive / merge accepted change deltas |
| **LID + EARS** | `docs/specs/card-balance.ears.md` plus trace graph | Native-ish | Update requirement IDs, tests, and `@spec` links |
| **Spec Kit** | `product-state/card-balance.md` or `specs/current/card-balance.md` | Custom recommended | Generate from accepted feature specs |
| **BMAD** | `docs/current-state/card-balance.md` | Custom recommended | Reconcile PRD, architecture, stories, QA |

Two patterns emerge from this comparison. First, **only OpenSpec treats the current state as a first-class native artifact**; everywhere else, the location is either implicit (LID + EARS, where the current state is reconstructed from requirement IDs and trace graphs) or explicitly bolted on as a convention (Spec Kit, BMAD). Second, the update mechanisms vary in how mechanically reliable they are: archiving accepted change deltas (OpenSpec) is the most deterministic; reconciling PRDs, architecture, stories, and QA artifacts after the fact (BMAD) is the most prone to drift.

The framework proposed in this paper — the Four Houses of Knowledge with `/spec/current-behavior` as a dedicated, native house — generalizes the OpenSpec pattern and makes it methodology-agnostic. Any of the frameworks above can adopt this structure: OpenSpec already implies it, LID + EARS can promote requirement files into it, Spec Kit and BMAD can formalize the convention they already recommend. The current state stops being an artifact-of-convention and becomes the central house of knowledge that all other artifacts feed into.

---

## 7. Why This Matters at Enterprise Scale

A component does not exist alone. Every component belongs to a platform composed of interconnected components. Most business capabilities emerge from APIs, services, workflows, queues, integrations, databases, and external systems working together. Behavior is distributed.

As organizations scale, systems evolve into multiple layers. To build a composable understanding of these ecosystems, the current-state behavioral model organizes system knowledge across a four-layer hierarchy:

| Level | Scope | Modeling Focus |
|-------|-------|----------------|
| **L01** | Enterprise Ecosystem | High-level, global business flows across the entire corporate network. |
| **L02** | Multi-Platform Network | Complex integrations and handoffs between distinct platforms. |
| **L03** | Platform Behavior | Business processes and service coordination within a specific domain. |
| **L04** | Component Behavior | Local business logic and active contracts within individual services. |

This hierarchy enables bottom-up behavioral composition. When every component (L04) defines its active behavior, interfaces, and operational expectations, parent platforms (L03) automatically ingest those specifications. The behavior of the multi-platform ecosystem (L02) and the enterprise ecosystem (L01) is then composed programmatically rather than reverse-engineered:

```
Component (L04) → Platform (L03) → Multi-Platform (L02) → Enterprise (L01)
```

Developers and architects can trace the impact of a local component change upward across the entire enterprise. Enterprise understanding transitions from reverse-engineering systems into composing behavioral knowledge.

---

## 8. AI Agents and Operational Understanding

The integration of generative AI and Large Language Models has shifted the paradigm of automated software development. But the effectiveness of these agents depends heavily on how repository information is structured.

### 8.1 The AI Agent as Archaeologist

In repositories lacking a unified current-state source of truth, an AI agent must behave as an archaeologist. It reconstructs reality from source code, historical specs, ADRs, tests, tickets, comments, diagrams, and tribal knowledge — inferring what the system should do today from fragmented and conflicting sources. This produces several operational problems:

- **Context pollution and token inflation:** ingesting volumes of historical and redundant documentation consumes significant context-window capacity and drives up LLM API costs.
- **Ambiguity and hallucination:** when an active implementation contradicts an un-updated 2024 specification, the agent must guess the intended behavior, increasing regression risk.
- **Weak impact awareness:** without an explicit dependency map, the agent cannot easily identify how local changes break downstream platforms or external APIs.

### 8.2 The AI Agent as Safer Implementer

Integrating a Current-State Behavioral Source of Truth changes the agent's working model. The agent loads the active specification and dependency graph directly and immediately understands current rules, active contracts, and operational expectations. The result is dramatically improved targeted impact analysis, lower token consumption, and substantially reduced hallucination risk. The agent no longer reconstructs reality; it consumes operational truth, relationship intelligence, and structured context.

---

## 9. Traceability Philosophy

A common anti-pattern in systems engineering is **governance clutter**, where teams attempt to enforce traceability by embedding verbose metadata annotations directly into source code. Overloading files with annotations for ownership, business rules, compliance standards, and SLAs turns the codebase into a governance document and obscures the executable logic:

```typescript
// Governance clutter: metadata obscures executable logic
@owner("dispute-billing-team")
@flow("cardholder-dispute-saga")
@rule("REG-E-DISPUTE-TIMELINE-RULE-04")
@adr("ADR-204-EVENT-DRIVEN-ROUTING")
@sla("10-business-day-resolution")
public class DisputeProcessor { ... }
```

The current-state behavioral model enforces a strict separation of concerns by treating the **specification — not the source code — as the central traceability anchor**. Source code carries only a single, stable comment that references an ID in the specification layer. Metadata, compliance rules, ownership, and architectural constraints all live in the specification files.

```typescript
// @spec marketplace-sync.freeze-account-behavior
```

This produces a clean traceability chain:

```
Code → Spec → Feature / Rule / ADR / Capability → Graph
```

The codebase remains optimized for execution and readability. The specification layer becomes the primary index for governance, auditing, and programmatic querying.

---

## 10. The Knowledge Graph Layer

To enable programmatic navigation by both humans and AI agents, the current-state behavioral layer is supplemented by a repository-native **knowledge graph**. The graph models the system as a mathematical network of vertices and typed edges, where vertices represent technical and behavioral concepts and edges represent semantic connections:

```
Feature    → implemented_by → Component
Component  → publishes      → Event
Event      → consumed_by    → Component
Rule       → validated_by   → Test
ADR        → constrains     → Flow
```

Rather than relying on resource-intensive external graph databases, this layer is built using lightweight, text-based JSON files stored directly in the repository. It is version-controlled, instantly readable, and friendly to both humans and AI agents.

### 10.1 Tooling and Graphify Integration

Graphify is one representative tool for this layer. It is a Python CLI and AI agent skill that parses repositories locally using tree-sitter AST parsers, avoiding the privacy risks of transmitting source code to external services. It compiles the codebase and specifications into a queryable JSON graph and offers several operational advantages:

- **Context reduction:** benchmarks demonstrate up to a 75% reduction in context-token consumption during agentic sessions, since agents query a pre-compiled graph instead of scanning raw files.
- **Conflict-free Git merges:** a Git merge driver union-merges conflicting `graph.json` files automatically during Git operations.
- **Deterministic clustering:** seeded Leiden community detection produces stable, reproducible community IDs across minor code modifications.
- **Mixed-commit processing:** AST code relationships are rebuilt locally while changed markdown specifications are queued for LLM-based semantic extraction.
- **Freshness verification:** `graph.json` records the Git commit hash it was built from, so agents can compare against `HEAD` to verify staleness.

Deploying tools of this kind at enterprise scale requires honest acknowledgement of their limitations: single-maintainer projects carry long-term maintenance risk; packaging friction (e.g., a CLI named `graphify` with PyPI package `graphifyy`) can complicate setup; LLM-based semantic extraction lacks published precision/recall benchmarks and requires human review; parsing very large legacy monoliths can degrade in performance; and first-run ingest of thousands of legacy PDFs and documents can generate substantial API costs that must be budgeted in advance.

---

## 11. The Semantic Behavioral Tag Layer

The knowledge graph from §10 captures *how* nodes relate — features are implemented by components, components publish events, ADRs constrain flows. But once a repository contains hundreds of features, services, and flows, a second problem appears: *how do you address them?*

A credit card platform makes this concrete. After a year of development, the same fraud-blocking capability has been named `fraudBlockHighRisk`, `risk-fraud-block`, `block-fraud-cvv-mismatch`, and `fraud.block.txn.highrisk` by four different squads — fraud, auth, disputes, compliance. The knowledge graph connects nodes structurally, but it does not solve the addressing problem. When a regulator asks *"show me every fraud control on the card platform,"* the team needs to *find* the nodes before they can traverse them.

This paper proposes a **Semantic Behavioral Tag Layer**: a controlled vocabulary of colon-separated tags, with multiple tags attached to every node in the knowledge graph. Each tag encodes intent, role, and sub-intent in a fixed format, and each tag is automatically searchable at every prefix level. The layer is semantic because the vocabulary is governed rather than free-form, behavioral because it sits on top of the behavioral graph from §10, and a layer rather than a tool because it is a structural addition to the spec repository, not a piece of software.

### 11.1 Tag Format

Every tag follows one of two equivalent formats:

```
{intent}:{role}:{sub-intent}
{intent}:{sub-intent}:{role}
```

Each colon-separated segment must satisfy three constraints:

- **Maximum 10 characters** per segment
- **Lowercase only**
- **Alphanumeric plus hyphens** — matching the regex `^[a-z0-9-]{1,10}(:[a-z0-9-]{1,10}){0,2}$`

The 10-character ceiling is deliberate. It fits in code comments and CLI flags (`// @tag fraud:block:cvv` reads at a glance; `fraudulent-transaction:authorization-block:cvv-mismatch-detection` does not). It forces abstraction — if a segment does not fit in 10 characters, it is describing an implementation detail rather than a category. And it bounds the search space so squads converge on a shared dialect instead of each team inventing its own.

### 11.2 Hierarchical Search via Prefixes

The key property of the format is that **every prefix of a tag is itself a valid search key**. Applying the layer to a single feature — *"decline a transaction when the authorization amount exceeds the cardholder's daily spend limit"* — produces three tags attached to the same node:

```
auth
auth:decline
auth:decline:limit
```

These are not three different features. They are three different *addresses* for the same feature, each at a different level of specificity:

| Query | Returns |
|-------|---------|
| `auth` | Every authorization concern on the platform |
| `auth:decline` | Every decline reason across all triggers |
| `auth:decline:limit` | The specific spend-limit decline rule |

A compliance officer auditing the auth surface queries `auth` and sees the whole landscape. An auth engineer reviewing decline policies queries `auth:decline` and sees only what is relevant. An AI agent investigating why a specific transaction was declined queries `auth:decline:limit` and gets the precise node — with no need to scan unrelated features.

### 11.3 Why Multiple Tags Per Node

The reason every node carries *multiple* tags rather than a single canonical one is that real card-platform features do not live in a single domain. Consider the CVV-mismatch fraud rule. It is simultaneously:

- a **fraud** concern (loss prevention, model inputs, false-positive rates)
- an **auth** concern (it fires during the authorization decision)
- a **risk** concern (capital, reserves, regulatory reporting)
- a **dispute** input (when a cardholder later disputes a transaction, this signal feeds the investigation)

A single-hierarchy taxonomy would force a choice — is this *primarily* fraud, auth, or risk? — and the other three views would lose access to the node. The tag layer refuses the choice. The same node carries:

```
fraud:block:cvv
auth:decline:cvv
risk:signal:cvv
```

Each tag is a valid lens on the same capability. The fraud team, the auth team, and the risk team each search from their own vocabulary and arrive at the same node. An AI agent investigating a chargeback joins from a fourth angle and finds it too.

This matters most for **cross-domain features**, which dominate card platforms. A reward promotion touches `reward`, `auth`, and `ledger`. A dispute touches `dispute`, `network`, `compli`, and `notify`. A 3DS challenge touches `auth`, `fraud`, and `cardhold`. A single-hierarchy taxonomy would lose every cross-cutting search.

### 11.4 Worked Example: The Four Faces of a Chargeback Feature

Consider the feature *"automatically credit the cardholder provisionally within 10 business days when a dispute is filed under Reg E."* In a single-hierarchy world, this lives under "disputes" and disappears from every other team's view. With the tag layer, the node carries:

```
dispute:credit:prov
ledger:credit:prov
compli:rege:timeline
cardhold:notify:credit
```

Now the dispute team finds it under `dispute:*`. The ledger team finds it under `ledger:*`. The compliance team finds it under `compli:rege:*` when preparing an audit. The notifications team finds it under `cardhold:notify:*` when reviewing customer messaging. Same node. Four legitimate addresses. No renaming, no duplication, no team losing visibility.

### 11.5 Composition with the Existing Layers

The tag layer is not a parallel system. It plugs directly into the layers already defined in this paper:

- In **`/spec/current-behavior`**, each component file declares its tag set in frontmatter. `payment-service.md` might carry `auth:decline:limit`, `auth:approve:std`, `fraud:signal:velocity`.
- In **`/spec/graph/graph.json`**, each node carries a `tags: []` array, and the graph becomes prefix-searchable. A query for `dispute:*` returns every dispute-related node and its edges.
- In **code**, the `@spec` anchor still points to the spec ID — tag-based lookup is for *discovery* (finding the spec in the first place), not *traceability* (which the anchor already handles). The two are complementary.
- For **AI agents**, prefix queries dramatically reduce context. An agent asked to fix a 3DS issue queries `auth:3ds` and pulls in a focused subset of nodes, instead of scanning every spec file in the platform. This is where the §10 promise of token-efficient agent operation actually lands for large platforms.
- For **regulators and auditors**, prefix queries collapse what is normally a multi-week discovery exercise into a single command: `compli:rege:*` returns every Reg E–implicated node on the platform. This is the kind of search that justifies the discipline on its own.

### 11.6 Governance: The One Risk Worth Naming

The tag layer degrades if vocabulary is not governed. Without a central registry of approved intents and roles, the fraud team will invent `fraud`, the risk team will invent `risk`, and the compliance team will invent `compli` to mean overlapping things — and the prefix-search benefit collapses.

The framework requires a small `tags.yaml` registry under `/spec/traceability/` that lists approved intents and roles. For a credit card platform, the initial registry might look like this:

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
  - network     # network (Visa, MC, Amex) integration
  - notify      # notifications and messaging

roles:
  - block       # prevent the action
  - approve     # allow the action
  - decline     # reject with reason
  - credit      # post a credit
  - debit       # post a debit
  - signal      # produce an input for downstream decisions
  - report      # produce a regulatory or audit artifact
  - notify      # send a message to a party
  - reverse     # undo a prior action
```

CI validates every new tag against this registry. New intents or roles require a lightweight review — exactly one meeting per quarter, not a process. The discipline is cheap to maintain but non-negotiable: the registry *is* the value.

---

## 12. Proposed Repository Structure

The `/spec` directory is structured to enforce a strict separation of concerns. The following blueprint details the layout:

```
/spec
├── current-behavior/                # Active operational truth
│   ├── platform.md                  # Global platform capabilities, L03 flows
│   └── components/                  # Local component specifications
│       ├── order-service.md
│       ├── payment-service.md
│       └── marketplace-sync.md
├── changes/                         # Segregated active modifications
│   └── 2026-001-freeze-marketplace/
│       ├── proposal.md              # Business value and requirements
│       ├── design.md                # Technical design, sequence diagrams
│       ├── tasks.md                 # Implementation milestones
│       └── impact.md                # Multi-platform impact analysis
├── decisions/                       # Permanent ADRs
│   ├── adr-001-region-routing.md
│   └── adr-002-event-contracts.md
├── traceability/                    # YAML index files
│   ├── features.yaml
│   ├── rules.yaml
│   └── flows.yaml
└── graph/                           # Compact JSON knowledge graph
    └── graph.json
```

### 12.1 Example: A Current-Behavior Specification

A component-level specification under `/spec/current-behavior/components/` describes only what is true today:

```markdown
# Component: Marketplace Sync

## Current Responsibility
Describes what this component is responsible for today.

## Active Behaviors
- Pull marketplace orders
- Respect frozen account status
- Publish order digest events
- Skip disabled customers

## Business Rules
- Frozen accounts must not sync
- First-time setup can trigger 90-day sync
- Regional pullers must call marketplace APIs

## Supported Flows
- Scheduled sync
- Manual first sync
- Freeze/unfreeze lifecycle
- Tracking update event flow

## Active Contracts
- Input events
- Output events
- APIs consumed
- APIs exposed
```

---

## 13. Operational Workflow

Maintaining the Current-State Behavioral Source of Truth requires a continuous-delivery workflow that synchronizes documentation with code deployment. The lifecycle of a change moves through five well-defined stages:

1. **Discovery.** When a new business capability is proposed, a subdirectory is created under `/spec/changes/`. Requirements are drafted there using EARS syntax to ensure structural clarity and eliminate ambiguity.
2. **Validation.** Draft requirements are validated using automated tools — such as requirement linters or LLM-based validation scripts — to verify EARS compliance and identify logical gaps.
3. **Implementation.** Developers write the execution logic and link source code to its specification using a single comment anchor referencing a unique ID in the spec layer.
4. **Graph regeneration.** Graphify (or an equivalent tool) runs locally via Git hooks, reading the codebase's AST and the draft specifications, regenerating the graph and highlighting new dependencies or contract breaks before the branch is merged.
5. **Promotion.** When code is merged and deployed, the associated specifications are moved from `/spec/changes/` into `/spec/current-behavior/`. The original change directory is archived, keeping `current-behavior` a clean representation of the live system.

Schematically, the workflow looks like this:

```
Create /spec/changes/<initiative> ──► Draft EARS specs
                                            │
                                            ▼
                       Validate │ Implement │ Regenerate graph
                                            │
                                            ▼
        Promote to /spec/current-behavior ──► Archive change directory
```

---

## 14. Product and Technology Collaboration

A Current-State Behavioral Source of Truth cannot be sustained by either product or engineering alone. Product organizations understand *what the business is supposed to do*; engineering organizations understand *what the system actually does at runtime*. The framework only stays consistent when both sides operate against the same artifact, in the same repository, under a shared contract.

This section defines how product and technology roles co-own the four houses of knowledge, what each role contributes at every stage of the workflow, and what governance mechanisms keep the layer trustworthy over time.

### 14.1 Shared Operating Principles

Before describing role-specific responsibilities, three principles must be agreed upon across product and engineering:

- **One artifact, two readers.** The specification layer is a single source of truth that must be readable by a product manager during discovery *and* by an engineer (or AI agent) during implementation. Neither side maintains a private fork.
- **Product owns intent. Engineering owns implementation. Both own the truth.** Product defines what the system *should* do. Engineering decides *how* it is built and ensures the code reflects what was agreed. The specification layer — the description of what the system actually does today — is co-owned: neither side alone can declare it correct. Product confirms the behavior is the right behavior; engineering confirms the behavior matches the deployed code. The framework is designed to surface drift between intent, implementation, and truth as soon as it appears.
- **Behavior outlives implementation.** When product behavior is stable, engineering is free to refactor, migrate, and re-platform without renegotiating with the business. This is the contract product and engineering exchange for the discipline of maintaining the layer.

### 14.2 Role Ownership Across the Four Houses

Each of the Four Houses of Knowledge has a primary owner, a secondary contributor, and an approval gate. Ownership is shared but not symmetrical — the framework fails when no single role is accountable for a given house.

| House | Primary Owner | Secondary Contributor | Approval Gate |
|-------|---------------|----------------------|---------------|
| **Current Behavior** (`/spec/current-behavior`) | Engineering Lead / Tech Lead | Product Manager | Both required before promotion |
| **Change History** (`/spec/changes`) | Product Manager | Engineering Lead, Architect | Product signs off on proposal; Engineering signs off on design |
| **Decisions** (`/spec/decisions`) | Architect / Staff Engineer | Engineering Lead, Product (for business-impacting ADRs) | Architect approves; Product reviews when business behavior is affected |
| **Traceability & Graph** (`/spec/traceability`, `/spec/graph`) | Platform / DevEx Team | All contributors | Automated regeneration; human review on contract breaks |

The `current-behavior` house is the clearest expression of joint ownership. Engineers do the writing — only they can guarantee the specification matches deployed code. Product reads and validates continuously — only they can confirm the behavior is the right behavior. Neither role alone can declare the specification true. Promotion to `current-behavior` therefore requires both signatures: engineering attesting *this is what the system does*, product attesting *this is what the system should do*.

### 14.3 Role Responsibilities Across the Workflow

The five-stage operational workflow defined in §13 becomes a coordination protocol when mapped to roles. The following table makes the handoffs explicit:

| Stage | Product Manager | Engineering Lead | Architect | QA / Verification |
|-------|----------------|------------------|-----------|-------------------|
| **Discovery** | Authors `proposal.md`: business value, target users, success criteria | Reviews feasibility; flags affected components | Identifies cross-platform impact | Drafts acceptance criteria from proposal |
| **Validation** | Validates EARS clauses match business intent | Validates technical accuracy of preconditions and triggers | Validates impact on L02/L01 flows | Validates that requirements are testable |
| **Implementation** | Available for clarification; does not approve code | Writes execution logic, links `@spec` anchors | Reviews architectural conformance | Builds test suites against EARS clauses |
| **Graph Regeneration** | Reviews surfaced dependency changes for business impact | Resolves contract breaks before merge | Reviews structural changes to the graph | Verifies test coverage against new graph nodes |
| **Promotion** | Confirms behavior matches intent; co-signs promotion | Confirms code matches specification; co-signs promotion | Records any new ADRs | Confirms regression suite passes against new current-behavior |

The most important handoff is the final one: **promotion requires both signatures**. Engineering attests that the specification matches the deployed code. Product attests that the behavior is the behavior the business wants. Either signature alone is insufficient — and the framework treats their absence as a deployment blocker, not a paperwork delay. If product does not recognize the specification as describing the live system, the specification is wrong even if the code works. If engineering cannot confirm the code matches the specification, the specification is wrong even if the business is happy. Both signatures together are what makes `current-behavior` trustworthy.

### 14.4 Communication and Cadence

The framework introduces three lightweight collaboration rituals that are sufficient to keep product and engineering aligned without imposing process overhead:

- **Spec triage (weekly, 30 minutes).** Product and engineering leads review `/spec/changes/` together. Goal: agree on which proposals advance to validation, which need rework, and which are deferred. This replaces unstructured backlog grooming with a behavior-first conversation.
- **Promotion review (per release).** Before any change is promoted to `current-behavior`, product and engineering jointly confirm the specification matches deployed behavior. This is typically a 15-minute walkthrough tied to deployment.
- **Behavioral retrospective (quarterly).** Product, engineering, and architecture review the current-behavior layer at the L03 / L02 levels. Goal: identify drift, deprecated behaviors still documented as active, and gaps where tribal knowledge has not been captured.

These three rituals replace what is typically a sprawling ecosystem of stand-ups, PRDs, design reviews, and tribal-knowledge transfers. The artifact is the meeting agenda.

### 14.5 The Anti-Pattern: Documentation as Engineering Tax

A common failure mode is for product to treat the specification layer as engineering's responsibility and for engineering to treat it as a documentation tax. When this happens, the layer becomes the same kind of historical archive the framework was designed to prevent — only with a cleaner directory structure.

Three signals indicate the collaboration is breaking down:

- Product managers ask engineers "what does the system do?" instead of reading `/spec/current-behavior`.
- Engineers update code without updating the specification, and CI/CD does not catch it.
- Architecture decisions are made in chat messages or meetings without producing an ADR.

The remedy is not more process. It is enforcing the contract that **a change is not deployed until the specification is updated and approved by both sides**. This must be a build-pipeline gate, not a guideline.

### 14.6 The Role of AI Agents in the Collaboration

When the framework is healthy, AI agents become a productive third participant in the product-engineering loop:

- During discovery, agents can translate informal product narratives into EARS-compliant draft specifications, which product and engineering then refine.
- During implementation, agents can verify that proposed code changes do not break contracts declared in `current-behavior`.
- During promotion, agents can compare the draft specification against the diff being merged and flag mismatches before product is asked to sign off.

The agent is not a replacement for either role. It is a tool that lowers the cost of maintaining the layer, which is the single biggest objection product and engineering will raise when the framework is first introduced.

---

## 15. Long-Term Vision

The long-term goal of this framework is not better documentation, better specs, or better governance in isolation. It is **operational behavioral modeling for AI-native enterprises**. Five trajectories follow from this foundation.

- **Composable enterprise behavior.** When every component publishes its active behavior, enterprise-wide operations can be assembled programmatically rather than reverse-engineered.
- **Stable behavior under shifting infrastructure.** Cloud migrations, database changes, and architectural refactors become low-risk because business behavior is documented independently of implementation choices.
- **AI agents as first-class consumers.** Agents read a clean, current, machine-readable behavioral graph instead of triangulating from contradictory sources, dramatically improving safety and economy of automated changes.
- **Auditable governance.** Compliance, ownership, and architectural constraints live in the specification layer, where they can be programmatically queried and audited without polluting source code.
- **Cross-platform impact analysis.** The L01–L04 hierarchy and the knowledge graph make it tractable to answer the question *"if I change this, what breaks?"* across an entire multi-platform ecosystem.

---

## 16. Conclusion

Implementing a Current-State Behavioral Source of Truth is a critical architectural step for enterprises scaling software operations in the era of AI-assisted engineering. Syntactic frameworks like EARS successfully address natural-language ambiguity. Methodologies like LID align code with business intent. Neither natively prevents the temporal drift that occurs as codebases mature. Unmanaged specifications inevitably degrade into historical archives, increasing maintenance cost and driving up hallucination risk for autonomous development agents.

Decoupling active operational behavior from historical change records resolves this structural challenge. By partitioning the repository's specifications into the **Four Houses of Knowledge**, engineers maintain a clean, active snapshot of runtime expectations. By organizing that layer using a composable, four-level hierarchy, enterprise-wide operations become a direct reflection of underlying components rather than a collection of fragmented tribal knowledge. By treating the specification as the central traceability anchor and exposing it through a lightweight, repository-native knowledge graph, organizations create an operational interface that humans and AI agents can consume with equal fluency.

For the AI-native enterprise, this model transitions agents from archaeologists searching through legacy documentation into safe, efficient implementers guided by a machine-readable map of current truth. They can perform reliable, token-efficient impact analyses and deploy code modifications with high precision. Separating chronological change from current operational truth is not merely a documentation best practice. It is a technical requirement for managing software engineering at scale.
