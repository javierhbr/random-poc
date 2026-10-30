# Platform Architecture Contract v2

## Platform-Level Architecture & Domain Governance

**Purpose:** Define the architectural boundaries, responsibilities, ownership, principles, and cross-component expectations of the platform while preserving implementation autonomy for individual component teams.

---

# 1. Purpose

The Platform Architecture Contract establishes a shared architectural model that developers, architects, Product teams, and AI coding agents can use when understanding, changing, or extending the platform.

The contract exists to answer four fundamental questions:

1. **Where does a responsibility belong?**
2. **Who owns the behavior, capability, or data involved?**
3. **What platform-level boundaries and expectations must a change respect?**
4. **Which decisions belong to the component team and should remain outside platform governance?**

The contract intentionally does **not** prescribe how individual components must be internally designed or implemented.

> **Govern the boundaries, responsibilities, contracts, and expected outcomes. Delegate the implementation.**

---

# 2. Architectural Governance Boundary

Every architectural concern should first be classified into one of two categories.

## 🏛️ PLATFORM GOVERNED

A concern is Platform Governed when it affects how the platform operates beyond the internal implementation of a single component.

Platform Governance defines:

- Platform purpose and scope.
- Domains and major domain boundaries.
- Bounded contexts when relevant to platform ownership.
- Business and platform capabilities.
- Platform responsibilities and non-responsibilities.
- Component responsibilities.
- Domain and capability ownership.
- Systems of Record and data authority.
- Cross-component contracts.
- Platform-wide invariants.
- Cross-component behavioral expectations.
- Security and trust boundaries.
- Platform-level quality expectations.
- Cross-channel expectations.
- Architectural principles.
- Significant architectural decisions.
- Change impact expectations.

Platform Governance defines **what must remain true** across the platform.

## 🔧 COMPONENT AUTONOMY

A concern belongs to Component Autonomy when it can change without altering the component's platform responsibilities, externally observable contracts, or platform-level expectations.

Component teams decide:

- Internal architecture, code organization, modules, classes, and packages.
- Design patterns, algorithms, and internal data structures.
- Frameworks and internal libraries.
- Internal state management and persistence design.
- Internal error handling and retry mechanisms.
- Testing and observability implementation.
- Refactoring strategies and internal performance optimizations.

Component teams determine **how they satisfy their platform contract**.

---

# 3. The Architecture Boundary Test

Ask:

> **If this changes, could another component, domain, channel, consumer, or platform-level behavior be affected?**

If **yes**, it is likely Platform Governed.

If **no**, and the component can change it while continuing to satisfy all existing responsibilities and contracts, it is likely Component Autonomy.

Also ask:

> **Does another team need to know this in order to safely interact with this component?**

If yes, it probably belongs in the component's platform contract. If only the component team needs to know it, it probably belongs in internal design documentation.

---

# 4. Platform Identity & Boundaries

### 🏛️ PLATFORM GOVERNED

Define the platform purpose, scope, responsibilities, and explicit non-responsibilities.

Example:

| Area | Platform Position |
|---|---|
| Conversation lifecycle | Own |
| Customer interaction | Own |
| Conversation context | Own or coordinate |
| Account status | Consume |
| Card eligibility | Does Not Own |
| Customer identity | Consume / Coordinate |
| Business transactions | Coordinate |
| Product business rules | Does Not Own |

The purpose is to prevent responsibilities from gradually migrating into inappropriate components.

### 🔧 COMPONENT AUTONOMY

Components determine how they internally implement the responsibilities assigned to them.

---

# 5. Domain Architecture

### 🏛️ PLATFORM GOVERNED

Maintain enough domain architecture to establish ownership and prevent responsibility ambiguity.

Identify:

- **Business Domains:** Major business problem spaces.
- **Platform Domain:** The problem space the platform itself owns.
- **Subdomains:** Distinct areas of responsibility.
- **Bounded Contexts:** Boundaries where models, terminology, ownership, or business behavior differ.
- **Capabilities:** What the platform and participating domains can do.

Example platform capabilities:

- Start Conversation
- Resume Conversation
- Exchange Messages
- Maintain Conversation Context
- Transfer to Human Agent
- Complete Conversation

Other domains may expose capabilities consumed by Chat, such as Authenticate Customer, Retrieve Account, Block Card, Process Payment, and Update Customer Information.

### 🔧 COMPONENT AUTONOMY

Do not prescribe how domain concepts map to classes, aggregates, repositories, internal layers, frameworks, or object models.

Strategic domain boundaries are governed. Tactical implementation is not.

---

# 6. Ubiquitous Language

### 🏛️ PLATFORM GOVERNED

Concepts crossing component or domain boundaries must have shared definitions.

Examples include Conversation, Session, Interaction, Message, Customer, Participant, Context, Handoff, and Channel.

For each important term define:

- Meaning.
- Owning domain.
- Boundary where the definition applies.
- Related concepts and distinctions.

### 🔧 COMPONENT AUTONOMY

Components may use internal terminology as long as it does not conflict with shared domain terminology.

---

# 7. Domain & Capability Ownership

### 🏛️ PLATFORM GOVERNED

Every significant business or platform capability should have a clearly identified owner.

Ask:

> **Who has the authority to define the behavior of this capability?**

| Capability | Owner |
|---|---|
| Manage Conversation | Conversational Platform |
| Resume Conversation | Conversational Platform |
| Authenticate Customer | Identity Domain |
| Determine Card Eligibility | Card Domain |
| Block Card | Card Domain |
| Transfer Conversation | Defined Conversational / Contact Center boundary |

Ownership follows domain responsibility rather than implementation convenience.

### 🔧 COMPONENT AUTONOMY

The owning component determines how the capability is internally implemented.

---

# 8. Business Rules

### 🏛️ PLATFORM GOVERNED — Ownership

Platform Architecture establishes **where business rules belong**, not necessarily every rule itself.

Ask:

> **Would this rule still exist if Chat did not exist?**

and:

> **Who has the business authority to change this rule?**

Establish:

- Which domain owns the rule.
- Which capability exposes the result.
- Which components may consume it.
- Which platform invariants must be preserved.

### 🔧 COMPONENT AUTONOMY — Execution

The owning domain decides how rules are represented and executed. Platform Governance does not prescribe rule engines, if/else structures, strategy patterns, decision tables, or internal validation frameworks.

---

# 9. Platform Invariants

### 🏛️ PLATFORM GOVERNED

An invariant describes something that must remain true regardless of implementation.

Examples:

- Product eligibility must be determined by the owning product domain.
- Chat must not become an authoritative source for customer account state.
- Operations requiring authentication must not bypass the enterprise authentication authority.
- Cross-channel behavior must preserve the same business-domain rules.

### 🔧 COMPONENT AUTONOMY

Each component determines how it ensures compliance.

---

# 10. Platform Responsibilities

### 🏛️ PLATFORM GOVERNED

Classify each major capability relationship as:

- **OWNS** — Platform is authoritative.
- **COORDINATES** — Platform orchestrates but another domain owns the business behavior.
- **CONSUMES** — Platform consumes another domain's capability.
- **DOES NOT OWN** — Explicitly outside platform responsibility.

| Capability | Relationship |
|---|---|
| Conversation Lifecycle | OWNS |
| Message Exchange | OWNS |
| Customer Authentication | CONSUMES / COORDINATES |
| Account Information | CONSUMES |
| Block Card | COORDINATES |
| Card Eligibility | DOES NOT OWN |
| Customer Master Data | DOES NOT OWN |

---

# 11. System of Record & Data Authority

### 🏛️ PLATFORM GOVERNED

Ask:

> **Which system has the authority to declare this information correct?**

| Information | Authority |
|---|---|
| Customer identity | Identity / Customer authority |
| Account status | Account domain |
| Card status | Card domain |
| Conversation status | Conversation domain |
| Conversation metadata | Conversation domain |
| Product eligibility | Product domain |

Caching, replication, projections, transformation, or temporary storage do not create authority.

### 🔧 COMPONENT AUTONOMY

Components may choose how to store, cache, index, or optimize data as long as they do not create competing authority or violate platform constraints.

---

# 12. Component Architectural Contracts

### 🏛️ PLATFORM GOVERNED

Each component should have a lightweight contract defining:

- Identity and purpose.
- Domain alignment.
- Capabilities.
- Responsibilities and non-responsibilities.
- Data authority.
- Dependencies and consumers.
- External contracts.
- Applicable platform rules.

### 🔧 COMPONENT AUTONOMY

Do not describe internal layers, classes, modules, frameworks, patterns, repository structure, database schema, algorithms, or internal implementation diagrams.

---

# 13. Interaction Contracts

### 🏛️ PLATFORM GOVERNED

Define:

- Provider and consumer.
- Capability crossing the boundary.
- Responsibility and information crossing the boundary.
- What consumers may safely assume.
- Compatibility expectations.
- Contract ownership.
- High-level failure semantics that affect consumers.

Example:

> Chat cannot assume that a missing response from a Block Card request means the card was not blocked.

### 🔧 COMPONENT AUTONOMY

Do not dictate internal retry libraries, queues, state machines, transactions, circuit breakers, or workflow engines.

---

# 14. Behavioral Expectations

### 🏛️ PLATFORM GOVERNED

Define behavior when it affects another component, customer experience, or platform correctness.

Examples:

- Duplicate requests must not cause unintended duplicate business operations.
- Temporary connectivity loss must not automatically terminate an eligible persistent conversation.
- Failure to retrieve authoritative information must not make cached information authoritative.
- Authentication expiration must prevent operations requiring valid authentication.

### 🔧 COMPONENT AUTONOMY

Components choose the mechanisms used to achieve these outcomes.

---

# 15. Non-Functional Requirements & Quality Attributes

### 🏛️ PLATFORM GOVERNED

Define platform-level or externally observable outcomes for availability, performance, capacity, resilience, security, privacy, recoverability, accessibility, retention, and regulatory obligations.

Prefer:

> Conversation recovery must remain available during failure of a single platform instance.

over prescribing a specific implementation technology.

### 🔧 COMPONENT AUTONOMY

Components determine how to satisfy the NFR.

---

# 16. Security & Trust Boundaries

### 🏛️ PLATFORM GOVERNED

Identify trust boundaries, identity authorities, authorization responsibilities, sensitive information boundaries, data classification requirements, and cross-domain security expectations.

### 🔧 COMPONENT AUTONOMY

Components determine compliant internal security implementation unless enterprise policy mandates a mechanism.

---

# 17. Cross-Channel Architecture

### 🏛️ PLATFORM GOVERNED

Ask:

> **Would allowing Chat to implement this differently change the underlying business behavior?**

If yes, the behavior likely belongs outside the channel.

Channels may provide different experiences but should not independently redefine shared business rules.

### 🔧 COMPONENT AUTONOMY

Channels remain free to implement their UX, interaction model, presentation, internal orchestration, and client-side architecture.

---

# 18. Architectural Principles

### 🏛️ PLATFORM GOVERNED

Core principles include:

- **Domain Ownership:** Business behavior belongs to the domain with authority over it.
- **No Shadow Authority:** Copies must not silently become alternative Systems of Record.
- **Explicit Boundaries:** Cross-domain interactions occur through known contracts.
- **Channel Independence:** Business-domain rules should not be owned by individual channels.
- **Contract-Based Evolution:** Externally observable behavior evolves intentionally.
- **Platform Observability:** Cross-component interactions support sufficient end-to-end correlation.
- **Component Autonomy:** Components retain implementation freedom while satisfying platform contracts.

---

# 19. Architecture Decision Records

### 🏛️ PLATFORM GOVERNED

Use an ADR when a decision significantly changes domain boundaries, capability ownership, component responsibilities, System of Record, cross-component contracts, platform principles, major NFRs, security/trust boundaries, or significant platform topology.

Use:

**Context → Decision → Rationale → Consequences → Alternatives**

### 🔧 COMPONENT AUTONOMY

Internal component decisions do not automatically require platform ADRs if nothing externally changes.

---

# 20. Capability Map

### 🏛️ PLATFORM GOVERNED

Maintain a technology-independent map answering:

> **What can the platform do, and who owns each capability?**

Example:

- Manage Conversation
- Maintain Conversation Context
- Exchange Messages
- Resume Conversation
- Transfer Conversation
- Integrate Business Capabilities
  - Authenticate Customer → Identity
  - Retrieve Accounts → Accounts
  - Block Card → Cards
  - Make Payment → Payments

### 🔧 COMPONENT AUTONOMY

Do not describe internal implementation.

---

# 21. Dependency & Interaction Map

### 🏛️ PLATFORM GOVERNED

Maintain enough information to answer:

- Who depends on whom?
- For what capability?
- Through which contract?
- Who owns the contract?
- What happens to platform behavior when the dependency is unavailable?

The purpose is change impact analysis.

### 🔧 COMPONENT AUTONOMY

Internal module dependencies remain outside the Platform Architecture Contract.

---

# 22. What We Intentionally Do NOT Govern

Unless required by enterprise policy or a cross-platform constraint, this contract does not define:

- Programming patterns.
- Class/package structures.
- Internal APIs or modules.
- Internal database schemas.
- Internal algorithms.
- Internal state-management patterns.
- Dependency-injection frameworks.
- Internal testing frameworks.
- Internal caching/retry/concurrency mechanisms.
- Repository organization.
- Code conventions handled elsewhere.
- Tactical DDD implementation.
- Internal refactoring decisions.

> **The platform contract establishes obligations, not implementation recipes.**

---
# 23. Architecture Discovery

When analyzing an existing platform, do not assume the current implementation represents the correct architecture.

Understand both:

- **Current Reality** — how the platform actually works today.
- **Intended Architecture** — how responsibilities, ownership, and boundaries should be defined.

For every significant behavior, ask:

### 1. What is this?

Classify it as one or more of:

- Capability
- Business rule
- Platform responsibility
- Domain responsibility
- Data
- Contract
- NFR
- Platform invariant
- Cross-component behavior
- Dependency
- Security/trust boundary
- Architectural decision
- Implementation detail

The first goal is **classification, not solution design**.

### 2. Who should own it?

Ask:

> **Who has the authority to define this behavior or information?**

Do not infer ownership from current implementation location.

### 3. Is it Platform Governed or Component Autonomy?

Apply the Architecture Boundary Test.

### 4. Is ownership clear?

Identify the domain, capability, responsible component, and authority to change the behavior.

### 5. Is the authoritative source clear?

For information or state, classify copies as appropriate: Authoritative, Replica, Projection, Cache, Derived Data, Historical Record, or Unknown.

### 6. Does the behavior cross a boundary?

Identify external dependencies, consumers, channels, and contracts.

### 7. Is current implementation consistent with the Architecture Spine?

Classify findings as:

- Aligned
- Legacy
- Exception
- Technical Debt
- Potential Violation
- Unknown
- Candidate Architecture Change

---

# 24. Architecture Discovery Record

### 🏛️ PLATFORM GOVERNED

Use a lightweight record for significant discoveries.

| Field | Description |
|---|---|
| Finding | What was discovered |
| Classification | Capability, rule, data, contract, NFR, etc. |
| Current Location | Where it exists today |
| Current Owner | Who currently controls it |
| Intended Owner | Who should have architectural authority |
| Capability | Capability associated with the finding |
| Platform Impact | What other domains/components depend on it |
| Authority | Authoritative source if applicable |
| Evidence | Documentation, implementation, contract, or validated knowledge |
| Status | Aligned, Legacy, Exception, Debt, Potential Violation, Unknown |
| Action | Keep, clarify, document, investigate, migrate, or reconsider |
| Confidence | Confirmed, probable, or unresolved |

### 🔧 COMPONENT AUTONOMY

Do not create platform discovery records for implementation details that have no Architecture Spine impact.

---

# 25. Architecture Classification Checklist

Use these questions when discovering existing behavior or evaluating a new requirement.

## Domain
- What business problem does this address?
- Would this problem exist without Chat?
- Which domain has authority to define the behavior?
- Is it specific to Conversational Interaction or another business domain?

## Capability
- What must the platform or business be able to do?
- Does the capability already exist?
- Who owns it?
- Is Chat providing, coordinating, or consuming it?

## Business Rule
- Does it determine what is allowed, required, eligible, or calculated?
- Would the same rule apply through Web or Mobile?
- Who has authority to change it?
- Is it duplicated elsewhere?

## Bounded Context
- Does the area have its own consistent business language?
- Do concepts have different meanings across boundaries?
- Is there independent ownership of the model?
- Is explicit translation required across the boundary?

Do not create a bounded context simply because a separate service exists.

## Platform Responsibility
- Is this essential to the platform's purpose?
- Is the platform accountable for the outcome?
- Does another domain own the underlying behavior?
- Is the platform owning, coordinating, consuming, or presenting it?

## Data Authority
- Who defines the information?
- Who can legitimately modify it?
- Which source wins if systems disagree?
- Are local copies being mistaken for authority?

## Component Responsibility
- Which component currently provides the capability?
- Does that align with its platform purpose?
- Would placing the behavior there duplicate another responsibility?
- Would another component need to know about it?

## Contract
- Does another component depend on the behavior?
- What may the consumer safely assume?
- Who owns the contract?
- What happens when the interaction cannot complete normally?

## NFR
- Is this describing what the system does or how well it must do it?
- Is the expectation externally observable?
- Does it apply to one component or the platform?
- Can the expected outcome be measured?

## Platform Invariant
- Must this remain true regardless of implementation?
- Would violating it compromise platform correctness?
- Does it apply across components or channels?

## Implementation Detail
- Can the component change it without affecting anyone else?
- Does another team need to know about it?
- Does changing it alter an external contract, ownership, or authority?

If not, it is probably **🔧 Component Autonomy**.

---

# 26. Architecture Spine

### 🏛️ PLATFORM GOVERNED

The Platform Architecture Contract represents the **Architecture Spine**:

> **The minimum set of shared architectural truths that must remain consistent across the platform while allowing individual components to evolve independently.**

It connects:

**Platform Purpose → Domains & Boundaries → Capabilities & Ownership → Components & Responsibilities → Data Authority → Contracts & Interactions → Principles & Invariants → Quality Expectations → Change Impact → Specifications**

The Spine captures only the information required for teams to make safe, independent decisions.

---

# 27. Why the Architecture Spine Is Needed

The platform consists of independently evolving components, domains, integrations, and teams. Each component may be well designed while the platform as a whole becomes inconsistent.

Without a Spine, architectural knowledge becomes distributed across code, repositories, PRDs, specifications, API documentation, diagrams, team knowledge, historical decisions, conversations, individual architects, AI sessions, and undocumented assumptions.

The organization may know many individual facts while lacking a reliable answer to:

> **What is the current architectural truth of the platform?**

The Architecture Spine provides that common reference.

---

# 28. Prevent Local Optimization from Becoming Platform Architecture

### 🏛️ PLATFORM GOVERNED

A locally reasonable decision can be globally incorrect.

If Chat needs card eligibility, the simplest local implementation may be to reproduce the rule inside Chat. The Architecture Spine instead establishes that card eligibility belongs to the Card domain and Chat consumes that capability.

> **Platform Architecture determines ownership. Component Architecture determines implementation.**

---

# 29. Prevent Architecture by Accident

Temporary implementation decisions can become dependencies, then contracts, then responsibilities.

Use the checkpoint:

> **Does this change alter platform architecture, or only component implementation?**

If it changes ownership, responsibilities, authority, boundaries, contracts, or platform behavior, treat it as an architectural change.

---

# 30. Prevent Responsibility Drift

Before adding behavior to a component, ask:

> **Does this behavior belong to the component's established platform responsibility?**

If not:

> **Which capability and domain actually own it?**

This prevents components from accumulating unrelated responsibilities simply because they are convenient implementation locations.

---

# 31. Prevent Duplicate Business Logic

### 🏛️ PLATFORM GOVERNED

Shared business behavior should not be independently redefined by Web, Mobile, Chat, Voice, or other channels.

Channels may provide different experiences. The underlying business decision remains owned by the relevant domain.

---

# 32. Make Data Authority Explicit

> **Storage does not imply authority.**

The Architecture Spine distinguishes where information exists from who has authority over it.

This prevents caches, projections, replicas, and historical copies from becoming accidental Systems of Record.

---

# 33. Enable Reliable Change Impact Analysis

### 🏛️ PLATFORM GOVERNED

The Architecture Spine supports traceability:

**Requirement → Capability → Domain → Owner → Component → Contract → Consumers → Specifications**

This allows teams to identify likely impact before implementation begins.

---

# 34. Architecture Spine + Spec-Driven Development

The Architecture Spine should be a required input to SDD.

**Product Requirement / PRD**

↓

**Architecture Spine**

↓

**Architecture Impact Analysis**

↓

**Affected Component Specifications**

↓

**Independent Component Implementation**

↓

**Cross-Component Validation**

A specification asks:

> **What behavior must this component provide?**

The Architecture Spine asks:

> **Should this component own that behavior in the first place?**

A specification can be behaviorally correct while being architecturally incorrect.

---

# 35. Architecture Impact Analysis

### 🏛️ PLATFORM GOVERNED

Before creating or modifying component specifications for a significant change, determine:

- **Capability:** What capability is changing?
- **Ownership:** Which domain owns it?
- **Responsibility:** Which component provides or coordinates it?
- **Data Authority:** What authoritative information is involved?
- **Contracts:** Which boundaries are crossed?
- **Consumers:** Who could be affected?
- **Invariants:** Which platform rules must remain true?
- **NFRs:** Which platform-level quality expectations apply?
- **Security:** Are trust or authorization boundaries affected?
- **Architecture Change:** Does the proposal alter the Architecture Spine?

Keep the result concise. The goal is to identify impact before implementation decisions are made.

---

# 36. Architecture Impact Matrix

| Area | Impact | Change Required? | Notes |
|---|---|---:|---|
| Capability | Resume Conversation | Yes | Behavior expanded |
| Domain Ownership | Conversation Domain | No | Existing owner |
| Component Responsibility | Conversation Service | No | Existing responsibility |
| Data Authority | Conversation Domain | No | No authority change |
| Contract | Resume Conversation API | Yes | New observable behavior |
| Consumers | Chat Client | Yes | Consumer change |
| Platform Invariant | Authentication required | No | Must remain true |
| NFR | Recovery time | Yes | New expectation |
| Security Boundary | Identity integration | Review | Cross-device identity |
| ADR | — | TBD | Only if architectural choice changes Spine |

---

# 37. When Does a Change Affect the Architecture Spine?

Ask whether the change:

- Moves responsibility between domains.
- Introduces a new platform capability.
- Changes capability ownership.
- Changes a component's platform responsibility.
- Changes a System of Record or data authority.
- Creates a competing source of authority.
- Changes a cross-component contract.
- Introduces a significant new cross-component dependency.
- Changes externally observable platform behavior.
- Changes a platform invariant.
- Changes a security or trust boundary.
- Changes a platform-level NFR.
- Introduces or changes a bounded context.
- Requires an exception to an architectural principle.

If **NO**, the change is likely **🔧 Component Autonomy**.

If **YES**, it potentially affects the **🏛️ Architecture Spine** and should receive Architecture Impact Analysis.

---

# 38. Governance Is Triggered by Impact, Not Change Size

A large refactor can remain Component Autonomy if responsibilities, contracts, authority, and observable behavior remain unchanged.

A five-line change can affect the Architecture Spine if it changes authority, ownership, or a shared contract.

> **Architecture governance is triggered by architectural impact, not implementation size.**

---

# 39. Architecture Review

Architecture review is required only when a change potentially modifies the Architecture Spine.

Focus on:

- Ownership.
- Boundaries.
- Responsibility.
- Data authority.
- Contracts and consumers.
- Platform invariants.
- Platform-level NFRs.
- Need for an ADR.

Do not turn platform architecture review into an internal implementation review.

---

# 40. Architecture Decision Criteria

Evaluate platform-level alternatives using:

- Domain alignment.
- Ownership clarity.
- Responsibility cohesion.
- Data authority.
- Cross-component coupling.
- Consumer impact.
- Platform consistency.
- Security boundaries.
- Quality attributes.
- Evolution and compatibility.
- Operational impact.
- Reversibility.

The objective is the option that best preserves platform coherence while allowing component autonomy.

---

# 41. Architecture Exceptions

When a component cannot immediately comply with the Architecture Spine, document:

- **Rule:** What expectation is being violated?
- **Reason:** Why is the exception necessary?
- **Scope:** What is affected?
- **Risk:** What architectural risk is introduced?
- **Owner:** Who is accountable?
- **Duration:** Temporary or intentionally long-lived?
- **Resolution:** If temporary, how will it be removed?

> A hidden exception becomes architecture drift.

---

# 42. Architecture Drift

Architecture drift occurs when implementation no longer matches the intended Spine.

Classify drift as:

- Intentional evolution.
- Approved exception.
- Legacy architecture.
- Technical debt.
- Undocumented architecture.
- Potential violation.

Before correcting it, ask:

> **Is the implementation wrong, or has the Architecture Spine become outdated?**

---

# 43. Keeping the Architecture Spine Current

### 🏛️ PLATFORM GOVERNED

Update the Spine when changes affect:

- Platform scope.
- Domains or bounded contexts.
- Capabilities or ownership.
- Component responsibilities.
- Data authority.
- Cross-component contracts.
- Platform invariants.
- Platform-level NFRs.
- Security boundaries.
- Significant architectural decisions.

> **Architecture changes and Architecture Spine updates should travel together.**

---

# 44. Source of Truth

The Architecture Spine is the authoritative source for **platform architectural intent**.

It should reference, rather than duplicate, detailed API contracts, component specifications, operational documentation, and implementation.

Example:

> The Spine defines that Conversation Service owns Conversation Lifecycle.

The detailed API contract and component implementation may live elsewhere.

---

# 45. Facts, Rules, Decisions, Guidelines, and Specifications

Not every piece of architectural knowledge has the same authority.

### FACT
Describes verified current architecture.

### RULE
Defines something that must remain true.

### DECISION
Records a significant architectural choice and rationale.

### GUIDELINE
Provides recommended direction without creating a mandatory constraint.

### SPECIFICATION
Defines expected behavior for a capability, feature, interaction, or component.

Explicit classification prevents recommendations and temporary implementation choices from becoming accidental permanent rules.

---

# 46. Using the Contract for New Product Requirements

For each new requirement:

1. Identify the requested business or platform outcome.
2. Map it to an existing or new capability.
3. Identify the owning domain.
4. Determine whether the platform owns, coordinates, consumes, or does not own it.
5. Identify affected components and contracts.
6. Identify authoritative data involved.
7. Check applicable principles and invariants.
8. Check platform-level NFR and security implications.
9. Determine whether the Architecture Spine changes.
10. Create or update only the affected component specifications.
11. Delegate implementation decisions to the component teams.

Do not start by asking:

> Which service should we modify?

Start with:

> **What capability and responsibility are changing, and who owns them?**

---

# 47. Using the Contract for Existing Platform Analysis

When reconstructing architecture from an existing platform:

1. Inventory externally meaningful capabilities and behaviors.
2. Identify domains and ownership.
3. Identify component responsibilities.
4. Identify authoritative information sources.
5. Identify cross-component contracts and consumers.
6. Identify platform-level NFRs and invariants.
7. Compare current reality with intended architecture.
8. Record uncertainty instead of guessing.
9. Classify drift and exceptions.
10. Build or update the Architecture Spine from validated findings.

Do not reverse-engineer every internal implementation detail unless it is needed to establish a platform-level fact.

---

# 48. Using the Contract with AI Coding Agents

AI agents should receive the Architecture Spine as context before making significant design or implementation decisions.

They should be instructed to:

- Identify the affected capability and owning domain.
- Respect component responsibilities and non-responsibilities.
- Respect data authority.
- Respect cross-component contracts and platform invariants.
- Avoid duplicating business rules owned elsewhere.
- Identify Architecture Spine impact before changing responsibilities or contracts.
- Surface missing or contradictory architectural information instead of inventing ownership.
- Preserve Component Autonomy for internal implementation choices.

The Architecture Spine constrains **where and what**, not **how**.

---

# 49. Definition of Architecture-Ready

A change is architecture-ready when the team can answer:

- What capability is changing?
- Which domain owns it?
- Which component is responsible?
- Is the platform owning, coordinating, or consuming it?
- What authoritative data is involved?
- Which cross-component contracts are affected?
- Which platform invariants apply?
- Which platform-level NFRs or security boundaries apply?
- Does the Architecture Spine change?
- Which component specifications need to change?
- Which decisions remain within Component Autonomy?

If these cannot be answered, the architecture is not yet sufficiently understood for reliable component specification.

---

# 50. Governance Operating Model

The governance model should be lightweight:

### No Spine Impact
**Component team proceeds autonomously.**

### Possible Spine Impact
**Perform Architecture Impact Analysis.**

### Confirmed Spine Change
**Update the relevant Spine artifacts and create an ADR when the decision is significant.**

### Exception
**Document the exception, risk, owner, and resolution.**

Architecture governance should be an **exception path for shared architectural impact**, not a mandatory approval path for every engineering change.

---

# 51. Success Criteria

The Architecture Spine is successful when developers, architects, Product teams, and AI agents can reliably answer:

- What does the platform own?
- What does it not own?
- What capability is involved?
- Which domain owns it?
- Which component provides or coordinates it?
- What data is authoritative?
- Which contracts and consumers are affected?
- What platform rules must remain true?
- Does the proposed change affect the Architecture Spine?
- Which decisions can the component team make independently?

Success is not measured by the number of architecture documents created.

Success is measured by **clarity, consistency, autonomy, and safer change**.

---

# 52. Core Philosophy

The Architecture Spine should be **small, stable, discoverable, actionable, and current**.

It should contain only the shared architectural truths needed to make safe platform-level decisions.

> **Centralize architectural truth, not technical decision-making.**

> **Govern ownership, not implementation.**

> **Govern boundaries, not internal structures.**

> **Govern contracts, not code patterns.**

> **Govern expected outcomes, not implementation mechanisms.**

> **Govern by architectural impact, not change size.**

> **Make architecture explicit enough that teams can operate independently.**

The Platform Architecture Contract is therefore not intended to centralize control.

Its purpose is the opposite:

> **Create enough shared architectural clarity that teams and AI agents can make more decisions independently without causing the platform to lose coherence.**
