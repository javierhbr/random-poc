Executive Summary

A platform-level change often requires coordinated changes across several components, services, or repositories.

The purpose of a Platform Spec is to define that change as one shared platform initiative. It explains:

* Why the change is needed.
* What outcome the platform must achieve.
* Which components are involved.
* What responsibility each component has.
* How those components collaborate conceptually.
* What platform capabilities and deliverables are required.

The Platform Spec does not define how each component must implement its internal solution.

Instead, it creates the shared direction from which every affected component can develop its own Component Spec, based on its architecture, technology, codebase, constraints, and local standards.

Platform Spec
     │
     │ Defines the shared outcome
     │ and component responsibilities
     ▼
Platform Tasks
     │
     ├─────────────┬─────────────┐
     ▼             ▼             ▼
Component A     Component B     Component C
Spec            Spec            Spec
     │             │             │
     ▼             ▼             ▼
Local design    Local design    Local design
and delivery    and delivery    and delivery
     │             │             │
     └─────────────┴─────────────┘
                   │
                   ▼
        Integrated platform outcome

The platform owns the coordinated outcome.

Each component owns its internal technical solution.

⸻

The Problem

A platform capability rarely belongs to only one component.

A single user experience may require:

* A user interface.
* One or more APIs.
* Business logic.
* Data provided by different systems.
* Authorization.
* Observability.
* Integration across multiple components.

For example:

User
  │
  ▼
Component A
User Interface
  │
  ├── Requests balance ─────────► Component B
  │                               Balance capability
  │
  └── Requests transactions ────► Component C
                                  Transaction capability

Without a shared platform definition, each component may understand the initiative differently.

This can produce a situation where every component believes its work is correct, but the platform capability does not work as a whole.

Component A: Completed
Component B: Completed
Component C: Completed
                But...
Platform experience: Incomplete or inconsistent

The Platform Spec exists to prevent that fragmentation.

⸻

Why a Platform Spec Is Needed

The Platform Spec creates a shared understanding across all components involved in a change.

It aligns teams around:

* The problem being solved.
* The expected platform outcome.
* The user or business value.
* The responsibilities of each component.
* The interactions between components.
* The relevant business rules.
* The applicable constraints and decisions.
* The expected platform behavior.
* The conditions that define completion.

Its purpose is not to centralize every technical decision.

Its purpose is to ensure that every component contributes to the same result.

                      Shared platform objective
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
         Component A        Component B        Component C
         understands        understands        understands
         its role            its role            its role
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 ▼
                     Coordinated platform change

⸻

What a Platform Spec Defines

A Platform Spec defines the change from the perspective of the platform as a whole.

It contains three important conceptual areas:

WHY
Why does the platform need this change?
WHAT
What must the platform be able to do?
PLATFORM DESIGN
How should the components collaborate conceptually
to produce the expected outcome?

⸻

Why

The Why explains the reason for the initiative.

It may describe:

* A user problem.
* A business opportunity.
* An operational limitation.
* A regulatory requirement.
* A platform inconsistency.
* A risk.
* A missing capability.
* A need to improve an existing experience.

The Why creates a shared understanding of the problem before teams begin deciding what must change.

Current problem
      │
      ▼
Business or user impact
      │
      ▼
Reason for the platform initiative

Without a clear Why, components may optimize their own local solutions without understanding the larger purpose.

⸻

What

The What defines what must become true when the platform initiative is completed.

It describes:

* The expected platform capability.
* The user or business outcome.
* The required behaviors.
* The components involved.
* The responsibility of each component.
* The important business rules.
* The information that must move between components.
* The expected success and failure scenarios.

The What should be specific enough to create alignment, but it should not prescribe the internal implementation of each component.

For example:

Customers must be able to see the current balance and recent transactions for an eligible account.

From that platform outcome, responsibilities can be identified:

Platform outcome:
Display account balance and recent transactions
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
Component A          Component B       Component C
Presents the         Provides the      Provides the
experience           balance           transactions

⸻

Platform Solution Design

The Platform Spec also needs a conceptual design of the proposed platform change.

A useful name for this section is:

Platform Solution Design

The Platform Solution Design explains how the platform should behave across its components.

It identifies:

* Where the flow begins.
* Which components participate.
* What role each component has.
* Which component needs information from another.
* What capabilities or APIs must exist.
* What information is exchanged conceptually.
* How the complete platform result is produced.

For example:

1. The user opens the account experience.
2. Component A presents the user interface.
3. Component A obtains the current balance from Component B.
4. Component A obtains recent transactions from Component C.
5. Component A presents the combined information to the user.

Visually:

                        User
                          │
                          ▼
                ┌──────────────────┐
                │   Component A    │
                │ Account UI       │
                └────────┬─────────┘
                         │
               ┌─────────┴─────────┐
               │                   │
               ▼                   ▼
     ┌──────────────────┐  ┌──────────────────┐
     │   Component B    │  │   Component C    │
     │ Balance Service  │  │ Transaction      │
     │                  │  │ Service          │
     └──────────────────┘  └──────────────────┘
               │                   │
               ▼                   ▼
        Current balance      Recent transactions
               │                   │
               └─────────┬─────────┘
                         ▼
              Complete account experience

This design is more detailed than a business requirement, but less detailed than a component-level technical design.

⸻

Platform-Level APIs and Capabilities

At the platform level, it is appropriate to identify the APIs or capabilities that must exist.

For example:

* Component B must provide a capability to retrieve the current balance.
* Component C must provide a capability to retrieve recent transactions.
* Component A must consume those capabilities and present the results.

The Platform Spec may describe:

* The purpose of the interaction.
* The provider.
* The consumer.
* The conceptual input.
* The conceptual output.
* The expected behavior.

Component A
Consumer
    │
    │ Needs current account balance
    ▼
Component B
Provider

The platform may also describe conceptually that the balance request needs an account identifier and that the response must provide the balance, currency, and time of calculation.

However, the Platform Spec does not normally need to define:

* Exact endpoint paths.
* Final field names.
* Serialization formats.
* Internal data models.
* Code structures.
* Classes or functions.

Those details belong to the relevant Component Spec unless a shared contract must be centrally agreed upon.

⸻

Platform Responsibilities vs. Component Responsibilities

The distinction between the two levels is fundamental.

┌───────────────────────────────────────────────┐
│ PLATFORM LEVEL                                │
│                                               │
│ Defines:                                      │
│ - Shared objective                            │
│ - Platform behavior                           │
│ - Component responsibilities                  │
│ - Cross-component interactions                │
│ - Business rules                              │
│ - Global constraints and decisions            │
│ - Platform acceptance scenarios               │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│ COMPONENT LEVEL                               │
│                                               │
│ Defines:                                      │
│ - Local technical interpretation              │
│ - Internal design                             │
│ - Code and data changes                       │
│ - Local testing                               │
│ - Implementation approach                     │
│ - Component delivery plan                     │
└───────────────────────────────────────────────┘

The Platform Spec defines what contribution is needed.

The Component Spec defines how that contribution will be implemented within a specific repository.

⸻

Platform Tasks

The Platform Spec identifies the responsibilities that each component must fulfill.

These responsibilities become Platform Tasks.

A Platform Task is not a coding task.

It describes the contribution that a component must make to the platform outcome.

Platform initiative
        │
        ▼
Display account information
        │
        ├── Component A:
        │   Present balance and transactions
        │
        ├── Component B:
        │   Provide current balance
        │
        └── Component C:
            Provide recent transactions

Each Platform Task should communicate:

* The responsibility of the component.
* The outcome it must produce.
* Its place within the platform flow.
* The information it receives.
* The information it provides.
* The rules and constraints it must respect.
* The platform scenarios it must help satisfy.

The task remains focused on the contribution, not on the internal implementation.

⸻

Component Specs

Each component receives its Platform Task and uses it as an input for its own Spec-Driven Development process.

Platform Task
     +
Platform context
     +
Platform rules and scenarios
     │
     ▼
Component Spec

The Component Spec translates the platform responsibility into the context of one particular component.

It considers:

* The component’s current architecture.
* Its language and framework.
* Its existing code.
* Its data model.
* Its local constraints.
* Its dependencies.
* Its testing approach.
* Its operational environment.

This creates a clear boundary:

Platform says:
“We need this capability and this component
is responsible for this part of it.”
Component says:
“This is what that responsibility means here
and this is how our component will satisfy it.”

⸻

Vertical Slices

The platform initiative should be planned using vertical slices.

A vertical slice is a small but meaningful portion of the platform capability that crosses all the components needed to produce a verifiable outcome.

It is called vertical because it crosses component or system boundaries instead of completing one technical layer at a time.

Horizontal planning

Phase 1: Build all UI work
Phase 2: Build all APIs
Phase 3: Build all data changes
Phase 4: Integrate everything

This delays integrated validation until the end.

Vertical-slice planning

Slice 1:
User can view the current balance
Slice 2:
User can view recent transactions
Slice 3:
User can filter transactions
Slice 4:
User receives appropriate empty and error states

Each slice may include work across multiple components:

Vertical Slice: View current balance
User
  │
  ▼
UI contribution
  │
  ▼
Balance capability
  │
  ▼
Authorization and data
  │
  ▼
Integrated platform result

⸻

Why Vertical Slices Matter

Vertical slices allow the platform to organize delivery around working outcomes rather than isolated technical progress.

They help:

* Validate component collaboration early.
* Discover integration problems sooner.
* Reduce uncertainty.
* Demonstrate meaningful progress.
* Create clearer milestones.
* Obtain feedback before the entire initiative is complete.
* Avoid leaving platform integration until the end.

The basic difference is:

Horizontal progress:
UI done        API done        Data done
   │              │               │
   └──────────────┴───────────────┘
                  │
          Integration happens later
Vertical progress:
Small UI + small API + required data
                  │
                  ▼
      Working platform capability

⸻

Platform Roadmap

The platform roadmap should be organized around vertical slices and platform deliverables.

Its purpose is to communicate:

* Which platform capabilities will be delivered.
* In what sequence.
* Which components are involved.
* What major dependencies exist.
* What deliverables are expected.
* When integrated outcomes are expected to become available.

Platform Initiative
        │
        ▼
┌────────────────────────────┐
│ Slice 1                    │
│ Basic balance visibility   │
└─────────────┬──────────────┘
              ▼
┌────────────────────────────┐
│ Slice 2                    │
│ Recent transactions        │
└─────────────┬──────────────┘
              ▼
┌────────────────────────────┐
│ Slice 3                    │
│ Filters and pagination     │
└─────────────┬──────────────┘
              ▼
┌────────────────────────────┐
│ Slice 4                    │
│ Resilience and readiness   │
└────────────────────────────┘

The roadmap represents coordinated platform delivery.

It does not replace the detailed plans maintained by individual components.

⸻

Information Components Need

For a component to create its own spec and provide a high-level estimate, it needs enough information to understand its role within the larger initiative.

The essential input includes:

The reason for the change

The component should understand the user, business, or platform problem being solved.

The expected platform outcome

It should understand what the platform must be capable of doing when the initiative is complete.

The relevant platform design

It should know where it participates in the overall flow and how it relates to other components.

Its assigned responsibility

It should clearly understand what contribution it owns.

The relevant vertical slice

It should understand which incremental platform outcome its work supports.

Dependencies

It should know:

* What it needs from other components.
* What other components need from it.
* Which decisions or external conditions affect its work.

Conceptual inputs and outputs

It should understand the information it receives and the result it must provide.

Business rules and constraints

It should know which rules, standards, ADRs, security requirements, or platform decisions are mandatory.

Platform scenarios

It should understand the behaviors that the complete platform must demonstrate.

Expected deliverables

It should know what contribution and evidence the platform expects from it.

These inputs should answer:

Why are we doing this?
What platform outcome are we creating?
What part does this component own?
How does it interact with the other components?
What rules and constraints must it respect?
What platform result must its contribution enable?

They should not tell the component how to organize or write its internal solution.

⸻

High-Level Estimation

With this context, each component can provide an initial high-level estimate for its contribution.

The purpose of that estimate is to help platform planning understand:

* The approximate size of the work.
* Significant risks.
* Important unknowns.
* Dependencies.
* Required coordination.
* Whether additional research is needed.
* The likely delivery sequence.

Platform Task
     │
     ▼
Component understanding
     │
     ▼
Initial impact and estimation
     │
     ▼
Platform roadmap

At this point, the estimate supports roadmap planning.

It is not yet a precise implementation commitment.

The estimate can become more reliable after the component performs its own research and develops its Component Spec.

⸻

Complete Conceptual Model

                     PLATFORM INITIATIVE
                              │
                              ▼
                       Why is it needed?
                              │
                              ▼
                  What must the platform achieve?
                              │
                              ▼
                   Platform Solution Design
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         Component A     Component B     Component C
         responsibility responsibility responsibility
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                       Vertical Slices
                              │
                              ▼
                       Platform Roadmap
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         Component A     Component B     Component C
             Spec            Spec            Spec
              │               │               │
              ▼               ▼               ▼
         Local solution  Local solution  Local solution
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                  Integrated platform delivery

⸻

Core Principles

The Platform Spec defines shared intent

It describes the platform change, the coordinated design, and the expected outcome.

The Platform Solution Design defines collaboration

It explains how the components participate and interact conceptually.

Platform Tasks define contributions

They identify what each component must provide without prescribing its internal implementation.

Component Specs define local solutions

Each component decides how to satisfy its responsibility within its own technical context.

Vertical slices define incremental delivery

They organize the roadmap around meaningful, integrated platform outcomes.

The roadmap represents platform progress

It communicates when capabilities and deliverables are expected, not every internal coding task.

⸻

Final Summary

Platform Spec
Defines the shared change.
Platform Solution Design
Defines how components collaborate conceptually.
Platform Tasks
Define what each component must contribute.
Component Specs
Define how each component fulfills its contribution.
Vertical Slices
Define how the platform delivers value incrementally.
Platform Roadmap
Defines the sequence of integrated outcomes and deliverables.

The central principle is:

The platform defines the shared destination and the responsibilities required to reach it. Each component determines the most appropriate technical path for delivering its part.