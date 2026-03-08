# Unified Spec-Driven Development Methodology

## Purpose

This document proposes a unified spec-driven development methodology for a
platform with multiple teams, repositories, contracts, and delivery artifacts.

The goal is simple: give teams one way to move from idea to implementation
without losing speed, clarity, or traceability.

We are combining the strongest parts of three methods:

- BMAD for progressive planning and explicit agent roles
- OpenSpec for spec-first change management and artifact structure
- Speckit for executable specifications and quality checks before implementation

This is a working draft. We will refine it through decision records and review.

## Problem

Today, multi-team platform work tends to break down in predictable ways:

- teams start from different artifacts
- planning depth varies by team and by change size
- business intent, technical design, and implementation tasks drift apart
- contracts and cross-team dependencies are discovered too late
- implementation begins before requirements are clear enough to test

We do not need more documents. We need a better operating model.

## Proposal

We propose a unified workflow with three principles:

1. Work may enter from more than one starting point
2. Every approved change is normalized into one canonical change package
3. No implementation starts until the change package is clear enough to execute

This gives the platform one delivery language without forcing all teams to
start the same way.

## Flow overview

In this platform, about 60 customer flows define 20 customer experiences.
Those experiences are delivered across 5 teams. The methodology must preserve
that platform view while still giving each team a practical path from change
request to implementation.

```text
PLATFORM LANDSCAPE

  [Platform]
      |
      v
  [60 customer flows]
      |
      v
  [20 customer experiences]
      |
      v
  [5 teams]


ALLOWED ENTRY POINTS

  [Platform initiative] -----------\
  [Product requirement] ------------+----> [Intake and routing]
  [Component or team proposal] ----/          Owner: Team Lead
                                              Support: Product, Architect, Manager
                                                    |
                                                    v
                                        [Assess size]
                                          Small  -> compact path
                                          Medium -> standard path
                                          Large  -> phased path
                                                    |
                                                    v
                                        [Assess impact]
                                          Low    -> normal controls
                                          Medium -> elevated controls
                                          High   -> strict controls
                                                    |
                                                    v
                                         [Canonical change package]
                                                    |
                                                    v
                            [Proposal and delta specs]
                              Owner: Product
                              Support: Team Lead, Architect, Developers
                                                    |
                                                    v
                            [Clarify and checklist]
                              Owner: Team Lead
                              Support: Product, Architect, Developers, QA
                                                    |
                                                    v
                            [Design, ADRs, dependencies]
                              Owner: Architect
                              Support: Team Lead, Developers, Product
                                                    |
                                                    v
                            [Tasks, ownership, validation]
                              Owner: Team Lead
                              Support: Developers, Architect, Manager
                                                    |
                                                    v
                            [Implement by 5 teams]
                              Owner: Developers
                              Support: Team Lead, Architect
                                                    |
                                                    v
                            [Verify, roll out, archive]
                              Owner: QA / Validation
                              Support: Developers, Team Lead, Product
                                                    |
                                                    v
                            [Update platform specs and history]
                              Owner: Team Lead
                              Support: Product, Architect, Manager
```

## Why combine these three methods

### BMAD

BMAD gives us progressive planning and role clarity. It helps us decide
whether a change needs a lightweight path or a deeper planning path, and it
makes the handoff between product, architecture, development, and review more
explicit.

### OpenSpec

OpenSpec gives us the strongest artifact model for change management. A change
package can hold the proposal, delta specs, design, tasks, and archive trail
in one place. That makes it a strong backbone for multi-team delivery.

### Speckit

Speckit adds discipline before implementation. It forces us to clarify
ambiguity, check completeness, analyze coverage, and turn specs into concrete,
verifiable tasks.

## Initial decisions

- ADR-001 proposes federated intake with a single canonical workflow
- ADR-002 proposes the change package as the canonical execution unit
- ADR-003 proposes stage-based role accountability for each change package
- ADR-004 proposes separating change size from change impact in routing

## Initial routing model

The methodology uses one core workflow for every approved change. It does not
create a different process for each change class. Instead, it varies two
things:

- size changes workflow depth
- impact changes governance and validation depth

### Size

Size measures delivery effort and coordination load.

| Size | Typical signals | Workflow effect |
| --- | --- | --- |
| Small | 1 team, limited artifacts, about 1 to 5 stories or tasks | compact proposal, compact delta spec, light design, short task list |
| Medium | 2 or more artifacts, shared dependencies, about 5 to 15 stories or tasks | standard proposal, explicit design, dependency map, sequenced tasks |
| Large | cross-team delivery, major architecture impact, more than 15 stories or phased rollout | phased change package, ADRs, cross-team plan, milestone-based rollout |

### Impact

Impact measures risk and blast radius.

| Impact | Typical signals | Workflow effect |
| --- | --- | --- |
| Low | limited customer effect, no shared contract risk, easy rollback | normal review and validation |
| Medium | multiple experiences affected, dependency risk, contract or rollout sensitivity | elevated review, explicit validation plan, stronger release checks |
| High | payment, security, compliance, shared contracts, large customer blast radius | strict review, ADRs, rollout and rollback plan, stronger QA and release controls |

This separation matters because a change can be small and still have high
impact, or large and still have low impact.

## Role model

The methodology needs role clarity at the same level as artifact clarity. We
do not want a heavy approval matrix for every document. We want one primary
owner for each stage, plus clear supporting roles.

Default roles in the workflow:

- Product owns business intent, value, scope, and acceptance criteria
- Team Lead owns routing, sequencing, and day-to-day delivery coordination
- Architect owns design integrity, ADRs, contracts, and cross-team technical alignment
- Engineering Manager owns staffing, priority support, escalation, and capacity tradeoffs
- Developers own implementation, tests, technical feedback, and artifact updates during execution
- QA / Validation owns test evidence, quality gates, and release-readiness checks

The BMAD role model fits this structure well:

- PM maps to Product
- Architect maps to Architect
- Dev maps to Developers
- Scrum / planning maps to Team Lead and Engineering Manager
- QA / review maps to QA / Validation

## Role and task flow

```text
[Intake and prioritization]
  Owner: Product
  Support: Team Lead, Engineering Manager
            |
            v
[Routing and sizing]
  Owner: Team Lead
  Support: Product, Architect, Engineering Manager
            |
            v
[Proposal and delta specs]
  Owner: Product
  Support: Team Lead, Architect, Developers
            |
            v
[Clarify and checklist]
  Owner: Team Lead
  Support: Product, Architect, Developers, QA
            |
            v
[Design, ADRs, dependencies]
  Owner: Architect
  Support: Team Lead, Developers, Product
            |
            v
[Tasks and ownership plan]
  Owner: Team Lead
  Support: Developers, Architect, Engineering Manager
            |
            v
[Implementation and tests]
  Owner: Developers
  Support: Team Lead, Architect
            |
            v
[Validation and release readiness]
  Owner: QA / Validation
  Support: Developers, Team Lead, Product
            |
            v
[Rollout, archive, platform update]
  Owner: Team Lead
  Support: Product, Architect, Engineering Manager
```

## Stage ownership matrix

| Stage | Primary owner | Supporting roles | Main output |
| --- | --- | --- | --- |
| Intake and prioritization | Product | Team Lead, Engineering Manager | accepted request, target outcome, business priority |
| Routing and sizing | Team Lead | Product, Architect, Engineering Manager | size, impact, scope, affected teams, selected path depth |
| Proposal and delta specs | Product | Team Lead, Architect, Developers | proposal, behavior changes, non-goals |
| Clarify and checklist | Team Lead | Product, Architect, Developers, QA | resolved ambiguity, checklist, ready-for-design signal |
| Design, ADRs, dependencies | Architect | Team Lead, Developers, Product | design, ADRs, contract impact, rollout approach |
| Tasks and ownership plan | Team Lead | Developers, Architect, Engineering Manager | sequenced tasks, owners, milestones, validation plan |
| Implementation and tests | Developers | Team Lead, Architect | code, tests, task updates, implementation notes |
| Validation and release readiness | QA / Validation | Developers, Team Lead, Product | evidence, defects, release decision input |
| Rollout, archive, platform update | Team Lead | Product, Architect, Engineering Manager | archived change package, updated specs, delivery history |

## What this means in practice

In the proposed model, a request may begin as a platform initiative, a product
requirement, or a component proposal. That entry artifact is not discarded.
Instead, it is routed into a change package that becomes the execution
container for all downstream work.

The change package is where teams align on:

- the problem and scope
- the changed behaviors
- the technical design
- the task sequence
- the dependencies and contracts
- the validation and rollout plan

This lets us keep strategic context at the initiative level, durable platform
truth at the capability level, and delivery control at the change-package
level.

## Expected benefits

- faster alignment across teams
- fewer ambiguous handoffs
- better traceability from business intent to code
- earlier visibility into contract and architecture impact
- clearer inputs for coding agents and human implementers

## Open design areas

We still need to define:

- the exact artifact stack inside a change package
- how executable checks and archive rules work

Those decisions will be captured as additional records in this folder.
