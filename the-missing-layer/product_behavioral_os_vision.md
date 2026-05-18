# Uncle Domain / Uncle Expert / Product Mode Vision

## Executive Summary

Uncle Dev should evolve from a code-generation assistant into a **Product Behavioral Operating System**.

The system should not only generate implementation guidance, but also:

- Understand product intent
- Analyze current platform behavior
- Detect behavioral drift
- Validate business/domain rules
- Enforce frameworks and methodologies
- Maintain traceability from product to code
- Compare requested behavior vs current behavior
- Guide implementation using Spec-Driven Development principles

The vision introduces three major companion concepts:

1. Uncle Domain
2. Uncle Expert
3. Product Mode

Together, they create a continuous behavioral alignment system between:

- Product
- Domain
- Platform
- Specs
- Code
- APIs
- Tests
- User experience

---

# Core Vision

Traditional AI coding assistants focus on:

```text
Prompt -> Code
```

The Uncle Dev vision focuses on:

```text
Behavior
→ Product Intent
→ Domain Rules
→ Behavioral Traceability
→ Platform Alignment
→ Specification
→ Architecture
→ Code
→ Tests
```

This changes the role of AI from:

```text
"generate implementation"
```

to:

```text
"guide product-to-code delivery"
```

---

# Problem Statement

Most modern AI-assisted development tools are good at:

- generating code
- generating tests
- scaffolding applications
- implementing APIs

But they are poor at understanding:

- current product behavior
- domain rules
- operational business logic
- platform consistency
- behavioral regressions
- user experience continuity
- historical product expectations

This causes:

- regressions
- inconsistent UX
- broken platform behavior
- architecture drift
- test drift
- specs disconnected from reality
- tribal knowledge dependency

---

# The Missing Layer

The missing layer is:

# Continuous Behavioral Alignment

The system must constantly compare:

```text
Requested Change
VS
Current Product Behavior
VS
Current Platform Behavior
VS
Expected Product Intent
```

---

# Uncle Domain

## Purpose

Uncle Domain acts as:

```text
The behavioral source-of-truth companion.
```

Its job is NOT to generate code first.

Its job is to:

- understand the product behavior
- analyze requested changes
- analyze bugs and regressions
- compare current vs expected behavior
- load domain-specific operational knowledge
- validate product consistency
- build behavioral deltas
- guide the spec process

---

## Uncle Domain Responsibilities

### Product Behavioral Analysis

Analyze:

- what the product should do
- what the platform currently does
- what users expect
- what business rules govern the capability

---

### Behavioral Delta Analysis

Example:

```text
Current Behavior:
Card balance excludes pending transactions.

Requested Change:
Pending transactions should reduce available balance.
```

Uncle Domain identifies:

- impacted user journeys
- APIs affected
- IVR impact
- mobile/web impact
- notification impact
- analytics impact
- test impact
- edge cases

---

### Current State Awareness

One of the key concepts:

```text
Current state matters.
```

Most methodologies model future intent.

Uncle Domain models:

- current behavior
- current implementation
- current UX
- current specs
- current tests

before generating changes.

---

### Drift Detection

Detect:

- platform drift
- UX drift
- behavioral drift
- implementation drift
- spec drift
- rule inconsistencies

---

# Uncle Expert

## Purpose

Uncle Expert acts as a configurable domain specialist.

It is NOT hardcoded with a single business domain.

Instead, teams configure:

- domain packs
- behavior packs
- operational skills
- framework packs
- policies
- business rules

This creates:

```text
Composable Product Intelligence
```

---

# Product Mode

## Purpose

Product Mode changes Uncle Dev from:

```text
developer-first
```

to:

```text
product-first
```

Instead of asking:

```text
How do we implement this?
```

Product Mode asks:

```text
What problem are we solving?
Who is the user?
What business behavior is expected?
What metrics define success?
What experience should exist?
```

---

# Product Mode Responsibilities

## Product Discovery

Analyze:

- problem statement
- user pain
- business objective
- expected outcomes
- platform constraints
- domain rules

---

## Behavioral Thinking

The system thinks in:

- capabilities
- user journeys
- business behaviors
- platform behaviors
- operational rules
- behavioral contracts

instead of only:

- classes
- APIs
- functions
- services

---

# Behavioral Contracts

Example:

```yaml
behavior-contract:
  capability: card-balance

expected-behavior:
  - available_balance excludes pending holds
  - stale data must display freshness timestamp
  - ivr and mobile must match within tolerance

platform-rules:
  - cache_ttl <= 30s
  - fallback_to_cached_allowed

user-experience:
  - primary number must be available balance
  - pending holds visible inline

tests:
  - stale_balance
  - delayed_settlement
  - pending_hold_release
```

---

# Framework Integration

The system should support:

- OpenSpec
- SpecKit
- EARS
- Linked-Intent Development (LID)
- BMAD
- company standards
- testing strategies
- NFR policies

---

# Framework Governance Companion

A framework companion validates:

- required artifacts
- traceability
- EARS compliance
- spec completeness
- implementation readiness
- testing coverage
- behavioral coverage

Example:

```text
OpenSpec
✅ proposal.md exists
⚠ missing acceptance mapping

EARS
⚠ requirement not in EARS format

LID
⚠ missing business-to-test traceability
```

---

# Domain Configurability

Anchor/Uncle Domain should be domain-configurable.

---

# Domain Configuration Example

```yaml
version: 1

domain:
  name: banking-platform
  description: Banking self-service ecosystem

product_mode:
  enabled: true

behavioral_analysis:
  current_state_required: true
  drift_detection: true
  platform_alignment: true
  ux_alignment: true

frameworks:
  - openspec
  - speckit
  - ears
  - linked-intent-development

skills:
  - ./skills/banking
  - ./skills/customer-experience
  - ./skills/fraud
  - ./skills/ivr

policies:
  - ./policies/security.md
  - ./policies/compliance.md
  - ./policies/nfr.md

behavior_maps:
  - ./behavior-maps/card-balance.yaml
  - ./behavior-maps/payments.yaml
```

---

# Skills are NOT Prompts

Skills represent:

```text
Operational Product Knowledge
```

Examples:

```text
skills/
├── banking/
├── customer-experience/
├── fraud/
├── ivr/
├── reconciliation/
└── notifications/
```

---

# Graphify Integration

Graphify acts as:

```text
The navigable relationship graph of the product ecosystem.
```

It allows Uncle Domain to connect:

```text
Specs ↔ Tags ↔ Code ↔ Tests ↔ APIs ↔ Behaviors
```

---

# Graphify Configuration Example

```yaml
graphify:
  enabled: true

  graphs:
    - name: product-spec-graph
      type: spec-feature-graph
      path: ./graphify/output/product-spec-graph.json

    - name: current-platform-behavior-graph
      type: platform-behavior-graph
      path: ./graphify/output/platform-behavior-graph.json

    - name: spec-code-cross-reference-graph
      type: spec-code-cross-reference-graph
      path: ./graphify/output/spec-code-xref-graph.json

  annotations:
    enabled: true

    supported_tags:
      - "@spec"
      - "@feature"
      - "@rule"
      - "@adr"
      - "@test"
      - "@api"
      - "@event"
      - "@behavior"
      - "@future"
```

---

# Annotation-Based Traceability

## Example Code Annotation

```ts
/**
 * @spec card-balance.available-balance
 * @feature card-balance
 * @rule pending-transactions-affect-available-balance
 * @api GET /accounts/:accountId/balance
 * @test balance.pending-transactions.spec.ts
 */
export async function getAvailableBalance(accountId: string) {
  // implementation
}
```

---

## Example Spec Annotation

```md
---
id: card-balance.available-balance
feature: card-balance
tags:
  - "@behavior"
  - "@rule"
  - "@api"
  - "@test"
---

# Available Balance Behavior
```

---

# Key Concept

The annotations DO NOT replace the specification.

The annotations connect:

```text
Spec ↔ Code ↔ Tests ↔ APIs ↔ Events
```

This enables:

- cross references
- dependency tracing
- impact analysis
- behavioral mapping
- spec-to-code navigation
- code-to-spec validation

---

# Behavior Maps

Behavior maps describe:

```text
Capability
→ User Journey
→ Business Rules
→ Platform Rules
→ APIs
→ Events
→ UI States
→ Metrics
→ Tests
```

Example:

```text
Capability: Card Balance

User Journeys:
- Check balance
- Receive low balance alert
- Ask IVR for balance

Business Rules:
- Available balance excludes pending holds

Platform Rules:
- Balance API cached 30 seconds

Tests:
- stale_balance
- delayed_settlement
```

---

# Final Vision

The long-term vision is NOT:

```text
another AI coding assistant
```

The vision is:

# A Product Behavioral Operating System

A system capable of:

- understanding product intent
- maintaining behavioral consistency
- analyzing current platform behavior
- enforcing frameworks
- maintaining traceability
- guiding implementation
- validating business rules
- detecting behavioral drift
- continuously aligning product and implementation

---

# Final Principle

```text
Product behavior defines the platform.

Architecture, ADRs, design patterns, and implementation exist to support the product behavior — not the other way around.
```