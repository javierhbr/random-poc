# Collaboration by Design

## A Guardrailed Collaboration Model for Human Developers and AI Agents

## 1. Context

Software development is changing as AI coding agents become part of everyday engineering workflows. At the same time, large enterprises and platform organizations increasingly depend on cross-team collaboration to deliver initiatives faster.

A team that does not own a particular component may still need to modify it to complete an initiative. Requiring every change to wait for the owning team creates delivery bottlenecks and prevents organizations from taking advantage of their broader engineering capacity.

However, the owning team remains accountable for its component, domain, business rules, architectural integrity, reliability, and long-term maintainability.

This creates a tension:

> We want to make contribution easy without making ownership weak.

The traditional solution relies heavily on human code review. External contributors implement changes, and the owning team carefully reviews the pull request to determine whether the contributor understood the architecture, conventions, business rules, patterns, domain boundaries, and intended implementation approach.

As contribution volume increases—and AI agents dramatically increase the capacity to generate code—this model stops scaling. The owning team can spend more time reviewing other teams' work than delivering its own work.

The solution is not to remove ownership or review. It is to change what ownership and review are responsible for.

---

## 2. Core Thesis

> **Ownership should move from reviewing every implementation detail to defining and enforcing the boundaries within which collaboration can safely happen.**

The component owner remains responsible for the domain, but instead of repeatedly teaching contributors how the component works, the team creates a **paved road for contribution**.

The repository itself should explicitly communicate and, wherever practical, enforce:

- what the component owns;
- what it does not own;
- its bounded-context boundaries;
- its business invariants;
- allowed and forbidden dependencies;
- inputs and outputs;
- supported extension points;
- architectural patterns;
- coding conventions;
- technology-specific practices;
- testing expectations;
- and the correct workflows for making common types of changes.

The goal is:

> **Design software components so that humans and AI agents can contribute safely without requiring constant intervention from the owning team.**

This model can be described as **Collaboration by Design**.

---

## 3. From Tribal Knowledge to Explicit Knowledge

Traditional contribution often works like this:

```text
Source code
    ↓
Contributor / AI reads it
    ↓
Infers patterns and intent
    ↓
Implements a solution
    ↓
Pull Request
    ↓
Owner discovers misunderstandings
```

This is fragile because source code shows what exists, but does not necessarily explain **why it exists**.

A contributor cannot reliably determine whether an existing implementation is:

- an intentional architectural pattern;
- a temporary workaround;
- legacy code;
- technical debt;
- an exception;
- or the preferred way of solving the problem.

AI agents have the same problem. Reading source code allows an agent to infer patterns, but inference is not equivalent to architectural intent.

The proposed model changes this:

```text
Source code
    +
Repository rules
    +
Local AGENTS.md instructions
    +
Component skills
    +
Automated enforcement
    ↓
Explicit implementation context
    ↓
Human contributor / AI agent
    ↓
Implementation
```

A fundamental principle is therefore:

> **Prefer explicit architectural and domain knowledge over inferred conventions.**

---

## 4. The Repository as a Self-Explaining Contribution Environment

The repository should not contain only the implementation. It should teach contributors how the component is intended to evolve.

> **The repository should explicitly teach contributors how this component is designed to be changed.**

This knowledge should be understandable by both humans and AI agents.

The repository becomes a **self-explaining contribution environment** containing:

1. code;
2. architectural boundaries;
3. domain boundaries;
4. agent rules;
5. localized context;
6. implementation skills;
7. automated validation;
8. AI-assisted pull-request review.

The purpose is not to create more documentation. The purpose is to move knowledge that currently exists in reviewers' heads into the engineering system itself.

---

## 5. Different Types of Knowledge

Not everything should be represented as a generic "rule." Three categories are particularly useful.

### Rules — What must or must not happen?

Examples:

```text
Domain code must not import infrastructure implementations.

Settled transactions cannot be modified.

Cross-domain implementation dependencies are prohibited.
```

Rules define constraints.

### Context — What should the contributor understand here?

Examples:

```text
This directory owns settlement business rules.

Refunds create new transactions rather than modifying settled transactions.

Inventory is a separate bounded context.
```

Context explains the local reality necessary to make correct decisions.

### Skills — How is a particular type of work performed here?

Examples:

```text
How to add a payment provider.

How to introduce a new validation rule.

How to consume an event from another bounded context.
```

Skills provide repeatable implementation workflows.

A useful mental model is:

```text
Rules   → What must/must not happen?
Context → What do I need to understand?
Skills  → How do I perform this work correctly?
```

---

## 6. Rules for AI Agents

Repositories can contain agent-specific rule directories and configuration such as Claude rules, Codex rules, or equivalent mechanisms supported by other agentic development tools.

These rules should establish the high-level constraints under which an agent operates.

They can define things such as:

- allowed architectural patterns;
- prohibited dependencies;
- testing requirements;
- security requirements;
- code-generation expectations;
- how to discover local instructions;
- when a specialized skill must be used;
- what requires explicit human approval.

The objective is not to create a giant global instruction file.

Rules should be layered and scoped so the agent receives the context relevant to the code it is modifying.

---

## 7. Local `AGENTS.md` Files

A central part of the model is the use of small `AGENTS.md` files located close to the source code they govern.

For example:

```text
src/
├── AGENTS.md
├── domain/
│   ├── AGENTS.md
│   ├── payments/
│   │   ├── AGENTS.md
│   │   └── ...
│   └── settlement/
│       ├── AGENTS.md
│       └── ...
├── infrastructure/
│   ├── AGENTS.md
│   └── ...
└── api/
    ├── AGENTS.md
    └── ...
```

The effective context for a change can conceptually become:

```text
Repository rules
      +
src/AGENTS.md
      +
src/domain/AGENTS.md
      +
src/domain/settlement/AGENTS.md
      =
Effective local context
```

This creates **context inheritance**.

An agent modifying settlement logic does not need hundreds of lines explaining deployment, unrelated APIs, or every other bounded context.

### Keep Local Instructions Small

As a working guideline, local `AGENTS.md` files should generally remain around 50 lines or less.

Their purpose is not to replace architecture documentation or a wiki. They should contain information that directly changes implementation decisions in that area.

> **Context should live as close as practical to the code it governs.**

And:

> **If an AGENTS.md needs hundreds of lines, much of that knowledge probably belongs somewhere else.**

---

## 8. Rules Should Teach, Not Only Restrict

The instructions are not only enforcement mechanisms for AI agents. They are also a mechanism for transferring knowledge to collaborating teams.

For example, instead of:

```text
Do not depend on Payments.
```

prefer:

```text
Do not import Payment domain implementations.

If Orders needs payment status:
- consume PaymentStatusChanged; or
- use PaymentStatusPort.

Do not access Payment repositories directly.
```

The second version explains both the restriction and the supported alternative.

A useful standard is:

> **Every contribution rule should be machine-actionable and human-understandable.**

Rules should be explicit and objective enough that different agents—or different humans—reach approximately the same interpretation.

Avoid vague instructions such as:

```text
Follow good architecture practices.
```

Prefer explicit statements such as:

```text
Application services may depend on domain interfaces.
Domain objects must not depend on infrastructure implementations.
External SDKs must be wrapped by adapters under /infrastructure.
```

---

## 9. Explicit Domain and Bounded-Context Boundaries

The primary component instructions should describe more than coding conventions. They should establish the operational contract of the bounded context.

A contributor should quickly be able to answer:

```text
What does this component own?

What does it explicitly NOT own?

What can enter the component?

What can leave it?

Who produces its inputs?

Who consumes its outputs?

Which domains can it interact with?

Through which contracts?

Which dependencies are forbidden?

Where should new business logic go?

Where should integrations go?

Which extension points are supported?
```

### Example

```md
# Orders Domain

## Purpose

Owns the lifecycle and business invariants of customer orders.

## Boundaries

This domain owns:
- Order creation
- Order state transitions
- Order validation
- Order cancellation rules

This domain does NOT own:
- Payment processing
- Customer profile management
- Inventory persistence
- Shipping orchestration

## Dependency Rules

- Orders must not import Payment domain implementations.
- Domain code must not call external APIs directly.
- Cross-domain communication uses defined contracts or events.
- Infrastructure concerns remain outside the domain layer.

## Inputs

Inputs may arrive through:
- REST adapters
- Events
- Application services

Translate external representations into domain commands or value objects.

## Outputs

The domain may produce:
- Domain results
- Domain events
- Defined domain errors

Do not expose infrastructure-specific objects.

## Extension Rules

- New order validations implement `OrderRule`.
- New behavior must not bypass `OrderStateMachine`.
- Do not place cross-domain business logic inside Order entities.
```

This information makes domain boundaries explicit rather than requiring contributors to reconstruct them from the codebase.

---

## 10. A Simple Placement Decision Model

Localized instructions can include small decision trees that help contributors determine where behavior belongs.

```text
Does this behavior protect a domain invariant?
    → It probably belongs in the domain.

Does it coordinate multiple domains?
    → It probably belongs in application/orchestration.

Does it call a database, API, queue, filesystem, or SDK?
    → It belongs in infrastructure/adapters.

Does it represent another bounded context's business rule?
    → It does not belong in this domain.
```

These small instructions can prevent significant architectural drift.

---

## 11. Component-Level Technology Practices

Enterprise standards should not attempt to prescribe every implementation decision globally.

For example, saying:

```text
We use TypeScript.
```

is insufficient.

Two TypeScript components can intentionally use very different programming models.

### Component A

```text
TypeScript
Functional programming
Pure functions
Composition
Immutable data
Result types
Minimal/no classes
```

### Component B

```text
TypeScript
Object-oriented programming
DDD aggregates
Dependency injection
Repositories
Value objects
Strategy implementations
```

Both can be valid.

The hierarchy should therefore look approximately like:

```text
Enterprise standards
        ↓
Platform standards
        ↓
Component standards
        ↓
Domain/directory-local rules
```

Higher levels should focus mainly on organizational constraints such as:

- security;
- compliance;
- secrets;
- observability;
- dependency policies;
- supported technology;
- mandatory quality controls.

Lower levels can define implementation philosophy and local conventions.

This protects consistency where consistency matters without forcing every component into the same architecture.

---

## 12. Architecture That Supports Safe Extension

Rules alone are not enough. The component itself should be designed to support contribution safely.

The Open/Closed Principle becomes especially valuable in this model:

> **Open for extension, closed for modification.**

Critical business logic should be protected behind explicit contracts and extension points.

For example:

```text
                 CORE DOMAIN
                     │
          owns critical invariants
                     │
       ┌─────────────┼─────────────┐
       │             │             │
   Contract A    Contract B    Extension C
       ↑             ↑             ↑
       └────── contributors ───────┘
```

Instead of allowing contributors to modify arbitrary core behavior, provide supported extension mechanisms using appropriate constructs such as:

- interfaces;
- abstract classes;
- ports;
- adapters;
- strategies;
- factories;
- registries;
- domain events;
- plugins;
- policy objects.

For example:

```text
Need a new validation?
    → Implement ValidationRule.

Need a new provider?
    → Implement ProviderAdapter.

Need a new transformation?
    → Implement Transformer.

Need a new transport?
    → Implement TransportAdapter.
```

The architecture itself therefore reduces the number of invalid ways to collaborate.

---

## 13. Skills as the Implementation Playbook

Agent skills encode **how a particular component expects recurring work to be performed**.

For example, an `add-provider` skill could understand:

```text
existing extension point
required interface
registration mechanism
configuration conventions
error handling
observability requirements
testing strategy
reference implementations
```

A contributor can ask an AI agent to add a provider without first becoming an expert in every architectural decision behind the component.

However, the agent is not free to invent a new architecture each time.

A useful distinction is:

> **AI agents provide implementation capacity. Component skills provide implementation knowledge.**

This allows the owning team to scale its knowledge without having to participate synchronously in every contribution.

---

## 14. Multiple Levels of Enforcement

Not every rule deserves the same enforcement mechanism.

A useful progression is:

```text
Knowledge
   ↓
Documentation / guideline
   ↓
AGENTS.md instruction
   ↓
Agent skill
   ↓
AI validation
   ↓
Lint / static analysis
   ↓
Architecture test
   ↓
Contract / automated test
   ↓
Compiler / type system
```

The principle is:

> **Encode each rule at the strongest practical enforcement level.**

For example:

```text
"Prefer factories for provider creation"
→ AGENTS.md / skill
```

while:

```text
"Payment domain must never depend on HTTP"
→ architecture test
```

and potentially:

```text
"Money must not be represented as an arbitrary number"
→ domain type / compiler
```

Critical invariants should not depend solely on an AI agent remembering an instruction.

---

## 15. Linting and Static Conventions

Simple and deterministic rules should be removed from human review entirely wherever possible.

Examples include:

- formatting;
- naming conventions;
- imports;
- prohibited APIs;
- dependency direction;
- file structure;
- basic coding standards;
- type-safety requirements.

Linting, static analysis, architecture tests, and the compiler should enforce these concerns before a pull request reaches a human reviewer.

---

## 16. AI Pull-Request Review

AI PR review provides another enforcement layer.

The reviewer should not be a generic AI reviewer applying generic software-development preferences. It should consume the same repository knowledge used by the implementation agent.

```text
                COMPONENT KNOWLEDGE
                       │
           ┌───────────┴───────────┐
           ↓                       ↓
   Implementation Agent       Review Agent
           │                       │
   "How should this be      "Did this change
    implemented here?"       follow our rules?"
           │                       │
           └──────── PR ───────────┘
```

Both sides operate against the component owner's definition of correctness.

The AI reviewer can check things such as:

- architectural patterns;
- dependency rules;
- bounded-context violations;
- local conventions;
- required extension mechanisms;
- missing tests;
- misuse of frameworks;
- divergence from documented component practices.

This creates a feedback loop before human review.

---

## 17. Human Review Becomes Judgment-Oriented

Today a reviewer may simultaneously evaluate:

```text
syntax
style
patterns
architecture
framework usage
tests
security
business rules
edge cases
intent
```

That creates unnecessary cognitive load.

Under Collaboration by Design, responsibility can progressively move to the appropriate mechanism:

| Question | Primary enforcement/reviewer |
|---|---|
| Is the code formatted correctly? | Tooling |
| Does it follow coding conventions? | Linter/static analysis |
| Does it violate dependency rules? | Architecture tests |
| Is the framework used according to component conventions? | Skills + AI validation |
| Does it violate documented component rules? | AI reviewer |
| Does it break contracts? | Automated tests |
| Is the business logic correct? | Human reviewer |
| Does the solution satisfy the intended outcome? | Human reviewer |
| Is an important domain edge case missing? | Human/domain expert |

The desired outcome is:

> **Human review becomes judgment-oriented instead of compliance-oriented.**

Humans spend their limited attention on things that actually require domain knowledge, business judgment, risk evaluation, or design reasoning.

---

## 18. Review Feedback Becomes New System Knowledge

Code review can also become a mechanism for continuously improving the contribution environment.

If reviewers repeatedly leave comments such as:

```text
Don't instantiate this directly; use the factory.
```

that knowledge should eventually stop existing only as repeated human feedback.

It can evolve through progressively stronger forms:

```text
Repeated review comment
        ↓
Explicit AGENTS.md rule
        ↓
Component skill guidance
        ↓
AI PR validation
        ↓
Static/architecture rule where practical
```

This leads to an important principle:

> **Every review comment that can reliably become a rule should eventually stop being a human review comment.**

The organization continuously converts tribal knowledge into executable or agent-consumable knowledge.

This can be viewed as the **progressive compilation of team knowledge**.

---

## 19. The Role of the Component Owner

The component owner does not lose authority under this model.

The owner's role becomes more scalable.

Instead of primarily acting as a gatekeeper for every implementation, the team owns the **contribution system**.

The owning team defines and maintains:

- domain boundaries;
- business invariants;
- architectural boundaries;
- supported extension points;
- component conventions;
- agent instructions;
- reusable skills;
- automated tests;
- enforcement mechanisms;
- PR review criteria.

In other words:

> **The owner builds and maintains the paved road.**

Contributors gain autonomy inside that road without gaining unrestricted authority over the component.

---

## 20. Defense in Depth for Collaboration

The model can be visualized as multiple layers protecting the component:

```text
                    HUMAN DOMAIN REVIEW
                           ↑
                     AI PR REVIEW
                           ↑
                 CONTRACT / DOMAIN TESTS
                           ↑
                  ARCHITECTURE TESTS
                           ↑
                LINT / STATIC ANALYSIS
                           ↑
                    AGENT SKILLS
                           ↑
               LOCAL AGENTS.md CONTEXT
                           ↑
                   REPOSITORY RULES
                           ↑
             ARCHITECTURAL EXTENSION POINTS
                           ↑
                       CONTRIBUTOR
                  Human or AI Agent
```

Each layer should remove problems that would otherwise reach the layer above it.

This is not one giant governance mechanism. It is **defense in depth for software collaboration**.

---

## 21. Collaboration-Ready Components

A useful maturity concept is the **collaboration-ready component**.

> **A component is collaboration-ready when a contributor can understand its boundaries and supported extension paths, implement a normal change safely, and receive automated feedback without requiring the owning team to explain the component first.**

A collaboration-ready component should make it possible to discover:

```text
WHY does this component exist?

WHAT does it own?

WHAT does it not own?

WHAT are its critical invariants?

WHAT enters and leaves the component?

WHO produces its inputs?

WHO consumes its outputs?

WHERE should new logic live?

HOW may another domain interact with it?

WHAT dependencies are prohibited?

HOW should common extensions be implemented?

HOW will violations be detected?
```

If those answers exist only in the heads of senior members of the owning team, the component is not yet truly collaboration-ready.

---

## 22. Guiding Principles

### 1. Ownership remains explicit

Collaboration does not remove accountability. Every component still has a team responsible for its domain and evolution.

### 2. Make intent explicit

Do not force contributors or AI agents to reverse-engineer architectural intent from source code.

### 3. Context belongs close to the code

Use small, localized instructions rather than giant universal rule files.

### 4. Rules should teach

Explain both the restriction and the supported path whenever practical.

### 5. Humans and agents should consume the same truth

The same component knowledge should guide implementation and review.

### 6. Protect critical logic structurally

Use contracts, interfaces, extension points, types, and architecture boundaries rather than relying solely on documentation.

### 7. Automate deterministic review

Humans should not repeatedly review rules that machines can reliably enforce.

### 8. Keep domain boundaries explicit

Define what belongs, what does not belong, allowed inputs/outputs, and legal cross-domain interaction.

### 9. Allow local implementation philosophies

Enterprise consistency should not unnecessarily eliminate legitimate component-level architectural choices.

### 10. Turn recurring review feedback into guardrails

Repeated human corrections are signals that the contribution system can be improved.

---

## 23. Desired End State

The goal is not autonomous AI development with no human ownership.

The goal is a system where ownership, collaboration, and AI-assisted development reinforce one another.

```text
Component Owner
      │
      ├── defines domain boundaries
      ├── defines architecture
      ├── creates extension points
      ├── writes explicit rules
      ├── provides local context
      ├── provides implementation skills
      └── defines automated enforcement
                     │
                     ↓
             CONTRIBUTION SYSTEM
                     │
        ┌────────────┴────────────┐
        ↓                         ↓
 Human Contributor           AI Agent
        │                         │
        └────────────┬────────────┘
                     ↓
               Implementation
                     ↓
       Automated Guardrails & Tests
                     ↓
                AI PR Review
                     ↓
               Human Review
                     ↓
       Business Logic / Intent / Risk
```

The result should be:

- faster cross-team delivery;
- less dependency on the owning team's availability;
- lower review burden;
- safer AI-generated changes;
- fewer architectural inconsistencies;
- faster onboarding into unfamiliar components;
- explicit domain knowledge;
- better knowledge transfer between teams;
- and stronger ownership without creating a delivery bottleneck.

The fundamental shift is:

> **Do not scale collaboration by asking owners to review more. Scale collaboration by making the component itself safer and easier to contribute to.**

