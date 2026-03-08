# Unified Spec-Driven Development Methodology

## Purpose

This document proposes a simplified, phased workflow that combines BMAD,
OpenSpec, and Speckit into one operating model. The goal is to explain the
methodology from the beginning of platform interaction down to development,
deploy, and archive.

The workflow is phase-first, not artifact-first. The artifacts still matter,
but teams should understand the delivery model through a small number of
phases.

## Why simplify the workflow

The earlier draft was accurate, but it exposed too many internal steps at the
top level. That makes the method harder to teach across teams and harder to
use for phased implementation.

The simplified model keeps the strengths of each source skill:

- BMAD gives progressive context, track selection, and role-based handoffs
- OpenSpec gives the change package, proposal/spec/design/tasks flow, and archive
- Speckit gives constitution, clarify, checklist, analyze, and executable delivery discipline

## Proposed v1 model: 5 phases

The v1 methodology uses 5 phases:

1. Platform
2. Route
3. Specify
4. Plan
5. Deliver

In v1, Deliver is owned by the Team Lead. Build, verify, deploy, and archive
remain inside Deliver as delivery slices, with explicit pull request creation
and review between build and verification. If release complexity grows later,
Deliver can split into separate Build and Deploy phases.

## Adoption plan: 2 iterations

We should adopt the 5-phase model in two iterations.

Iteration 1 focuses on the front half of the workflow:

- Platform
- Route
- Specify

Iteration 2 focuses on the back half of the workflow:

- Plan
- Deliver

This rollout sequence makes adoption safer. Teams first learn how to define
shared context, route work, and produce better specifications. Then they apply
those stronger inputs to planning and delivery.

```text
TARGET MODEL

  [Platform] -> [Route] -> [Specify] -> [Plan] -> [Deliver]


ADOPTION ITERATIONS

  Iteration 1
  [Platform] -> [Route] -> [Specify]

  Iteration 2
                                   [Plan] -> [Deliver]

  Future option
                                   [Plan] -> [Build] -> [Deploy]
```

Detailed operational guide:

- Iteration 1 playbook: [iteration-1-playbook.md](iteration-1-playbook.md)
- Iteration 2 playbook: [iteration-2-playbook.md](iteration-2-playbook.md)
- Unified agent/skill package: [../unified-sdd-codex-skill/SKILL.md](../unified-sdd-codex-skill/SKILL.md)
- Role agents: [../unified-sdd-codex-skill/agents/README.md](../unified-sdd-codex-skill/agents/README.md)
- Existing-platform starter skill: [../platform-contextualizer-codex-skill/SKILL.md](../platform-contextualizer-codex-skill/SKILL.md)

## End-to-end flow

```text
[PLATFORM]
  durable context, platform guardrails, shared roles, project rules
  Owner: Architect
  Support: Product, Team Lead
        |
        v
[ROUTE]
  open the change package, assess size and impact, select track
  Owner: Team Lead
  Support: Product, Architect, Engineering Manager
        |
        v
[SPECIFY]
  define the required behavior and remove ambiguity
  Owner: Product
  Support: Team Lead, Architect, Developers
        |
        v
[PLAN]
  convert the approved spec into a technical plan and delivery slices
  Owner: Architect
  Support: Team Lead, Developers, Product
        |
        v
[DELIVER]
  build, create PR, review PR, verify, deploy, archive
  Owner: Team Lead
  Support: Developers, QA / Validation, Architect, Product
```

## How agents interact with the platform and teams

The methodology uses agents as role-aligned helpers, not as isolated actors.
Agents do not replace platform governance or team ownership. They help draft,
route, refine, and verify the work inside each phase.

```text
[Platform stakeholders and team leads]
        |
        v
[Phase owner]
        |
        +--> [BMAD agent role]
        +--> [OpenSpec artifact agent]
        +--> [Speckit quality/check agent]
        |
        v
[Drafted artifacts and recommendations]
        |
        v
[Team review, correction, approval]
        |
        v
[Next phase]
```

The basic interaction pattern is the same in every phase:

- humans own intent, tradeoffs, and approval
- agents produce structured drafts, comparisons, and checks
- the phase owner decides when the work is ready to move on

## Phase-by-phase operating model

| Phase | Goal | Primary owner | Human interaction | Agent interaction | Skills used | Rules applied | Exit output |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Platform | Define durable context for all future changes | Architect | Platform stakeholders, Product, and Team Leads agree on guardrails, quality standards, and common context | Speckit creates or refreshes the constitution, OpenSpec encodes durable project config, BMAD frames context for later routing and roles | `speckit-codex-skill`, `openspec-codex-skill`, `bmad-codex-skill` | `speckit-codex-skill/rules/constitution-rules.md`, `openspec-codex-skill/rules/project-config-template.yaml` | constitution, project config, common context |
| Route | Turn a request into a routed change package | Team Lead | Product, Architect, and Manager classify the request and affected scope | BMAD selects the right track, OpenSpec frames the change package, agents call out size, impact, unknowns, and the next artifact | `bmad-codex-skill`, `openspec-codex-skill` | `bmad-codex-skill/rules/track-selection-rules.md`, `openspec-codex-skill/rules/artifact-rules.md` | scoped change package, selected path, known unknowns |
| Specify | Define the required behavior before implementation | Product | Product works with impacted teams to define goals, non-goals, and acceptance behavior | OpenSpec drafts `proposal.md` and delta specs, Speckit runs clarify and checklist passes, BMAD keeps the scope implementation-friendly | `openspec-codex-skill`, `speckit-codex-skill`, `bmad-codex-skill` | `openspec-codex-skill/rules/artifact-rules.md`, `speckit-codex-skill/rules/spec-rules.md`, `bmad-codex-skill/rules/artifact-rules.md` | approved proposal, delta specs, resolved ambiguity |
| Plan | Convert the approved spec into a technical execution plan | Architect | Architect, Team Lead, and Developers agree on design, dependencies, and rollout approach | BMAD uses the architect role and progressive planning, OpenSpec drafts `design.md` and `tasks.md`, Speckit checks coverage through plan and task discipline | `bmad-codex-skill`, `openspec-codex-skill`, `speckit-codex-skill` | `bmad-codex-skill/rules/artifact-rules.md`, `openspec-codex-skill/rules/artifact-rules.md`, `speckit-codex-skill/rules/plan-rules.md`, `speckit-codex-skill/rules/task-rules.md` | design, ADRs when needed, tasks, delivery slices |
| Deliver | Execute the plan in controlled slices through review, deploy, and archive | Team Lead | Team Lead coordinates Developers, QA, Architect, and Product across execution and release | BMAD Dev-role and QA/review support implementation and code review, OpenSpec applies tasks and keeps artifacts current, Speckit enforces task quality and phased execution | `bmad-codex-skill`, `openspec-codex-skill`, `speckit-codex-skill` | `speckit-codex-skill/rules/task-rules.md`, `openspec-codex-skill/rules/artifact-rules.md`, `bmad-codex-skill/rules/artifact-rules.md` | implemented slices, reviewed PRs, verification evidence, deployed change, archived package |

## What each phase contains

### 1. Platform

Platform is the shared starting point. It captures the rules that should not
be reinvented for every change.

Typical outputs:

- constitution or equivalent platform principles
- durable project config
- common quality and documentation rules
- role expectations for later phases

This phase is where Speckit's constitution mindset is strongest.

### 2. Route

Route is the intake gateway. It does not fully specify the work. It decides
how much workflow is needed and opens the change package.

Route applies BMAD routing rules:

- greenfield or brownfield
- small, medium, or large
- quick flow, PRD-first, or architecture-heavy path

Route also applies the size and impact split already adopted in ADR-004.

### 3. Specify

Specify defines the "what" before the "how."

This phase combines:

- OpenSpec proposal and delta specs
- Speckit clarify and checklist
- BMAD artifact quality expectations

The result is a change package that is clear enough for planning.

### 4. Plan

Plan defines the technical execution model.

This phase combines:

- BMAD architect and planning roles
- OpenSpec design and tasks artifacts
- Speckit plan and task quality rules

The plan should end with implementation slices, not one large execution block.

### 5. Deliver

Deliver is the execution phase in v1, and it is owned by the Team Lead.

Deliver contains six internal slices:

1. Build
2. Create PR
3. Review PR
4. Verify
5. Deploy
6. Archive

This keeps release activity inside the main delivery phase while the teams are
still adopting the methodology.

## Deliver phase: internal slices

```text
[DELIVER]
  Owner: Team Lead
        |
        +--> [Build]
        |      Developers implement the scoped tasks
        |      OpenSpec apply keeps tasks and artifacts current
        |
        +--> [Create PR]
        |      Developers open a reviewable pull request for the current slice
        |      The PR links back to the change package and completed tasks
        |
        +--> [Review PR]
        |      Team Lead assigns reviewers
        |      BMAD review support helps structure code-review feedback
        |
        +--> [Verify]
        |      QA / Validation and Developers collect evidence
        |      Speckit task discipline keeps validation explicit
        |
        +--> [Deploy]
        |      Team Lead coordinates release timing, dependencies, and rollback readiness
        |      Product and Architect support business and technical decisions
        |
        +--> [Archive]
               OpenSpec archive closes the change package and promotes the new truth
```

## Why this phased model fits the three skills

### BMAD contribution

BMAD is strongest in Route and Plan. It gives the methodology:

- progressive context
- track selection
- role-based handoffs
- planning depth that scales with complexity

### OpenSpec contribution

OpenSpec is the backbone from Route through Deliver. It gives the methodology:

- one change package as the canonical execution unit
- a stable artifact chain
- artifact revision during implementation
- archive as the end of the workflow

### Speckit contribution

Speckit strengthens Platform, Specify, and Plan. It gives the methodology:

- constitution and guardrails
- clarify before plan
- checklist and analysis before execution
- phased implementation discipline

## Initial decisions

- ADR-001 proposes federated intake with a single canonical workflow
- ADR-002 proposes the change package as the canonical execution unit
- ADR-003 proposes stage-based role accountability for each change package
- ADR-004 proposes separating change size from change impact in routing
- ADR-005 proposes the 5-phase v1 model with Team Lead owning Deliver
- ADR-006 proposes rolling out the 5-phase model in two iterations
- ADR-007 proposes making pull request creation and review explicit in Deliver

## Evolution path

The next evolution is clear:

- adoption iteration 1 = Platform -> Route -> Specify
- adoption iteration 2 = Plan -> Deliver

- v1 = Platform -> Route -> Specify -> Plan -> Deliver
- v2 = Platform -> Route -> Specify -> Plan -> Build -> Deploy

We should only split Deliver when release coordination becomes complex enough
to justify a separate top-level phase.
