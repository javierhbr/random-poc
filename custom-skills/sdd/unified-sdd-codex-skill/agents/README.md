# Role Agents

These role agents sit on top of the unified SDD skill package.

They all have access to the same three source skills:

- BMAD
- OpenSpec
- Speckit

They do not use them the same way. Each role uses the three skills according to
phase ownership, decision rights, and expected outputs.

Use this file as the phase-by-phase instruction guide and prompt catalog for the
role agents.

## Role map

| Role | Primary phases | Default skill emphasis | Typical outputs |
| --- | --- | --- | --- |
| Architect | Platform, Plan | BMAD -> OpenSpec -> Speckit | platform baseline, architecture plan, ADRs, design review |
| Team Lead | Route, Deliver | BMAD -> OpenSpec -> Speckit | routed change package, delivery slices, PR/review coordination, archive closure |
| Product | Specify | OpenSpec -> Speckit -> BMAD | proposal, user stories, acceptance criteria, clarified scope |
| Developer | Deliver, future Build | Speckit -> OpenSpec -> BMAD | executable tasks, code, tests, PRs, review fixes |

## Shared rules for all role agents

- use one change package per approved change
- respect the current phase owner
- keep artifacts aligned with delivered reality
- use the smallest sufficient workflow
- keep PRs reviewable and traceable to the spec
- escalate ambiguity before implementation, not after

## How to use this guide

1. identify the current workflow phase
2. start with the primary owner for that phase
3. use the default skill emphasis for that role
4. involve support roles only where they add real signal
5. produce the phase output before moving forward

For existing platforms, start the Platform phase with
`../../platform-contextualizer-codex-skill/SKILL.md`.

## Phase ownership

| Phase | Primary owner | Core support | Main outcome |
| --- | --- | --- | --- |
| Platform | Architect | Team Lead, Product | shared context and durable rules |
| Route | Team Lead | Product, Architect | routed change package and next artifact |
| Specify | Product | Team Lead, Architect, Developer | clear and testable spec package |
| Plan | Architect | Team Lead, Product, Developer | implementation-ready design and tasks |
| Deliver | Team Lead | Developer, Architect, Product | reviewable PRs, verified change, deploy, archive |

## Interaction model

```text
[Unified SDD skill]
        |
        +--> [Architect agent]
        +--> [Team Lead agent]
        +--> [Product agent]
        +--> [Developer agent]
        |
        v
[Shared method, role-specific behavior]
```

## Phase guide and prompt catalog

### Platform

Primary owner: `Architect`

Goal:
- create shared context and durable rules for the platform

Use this phase to:
- document current constraints and conventions
- define platform principles and guardrails
- establish role boundaries for later phases

#### Role instructions and prompt examples:

##### `Architect`
- use `BMAD` first for brownfield context and role framing
- use `OpenSpec` to encode durable context
- use `Speckit` to turn principles into explicit rules

###### Prompt examples:
- prompt: "Using the BMAD skill, review the current platform, identify its architectural constraints, and draft a shared platform baseline that teams can use during Platform, Route, and Specify."
- prompt: "Using the BMAD skill, create a high-level architecture plan for the platform baseline, ensuring it aligns with our platform's principles and constraints."

##### `Team Lead`
- provide current team conventions, delivery constraints, and adoption risks
- use `BMAD` to surface operating realities from active teams
- use `OpenSpec` to capture durable team-level context that should become shared

###### Prompt examples:
- prompt: "Using the BMAD and OpenSpec skills, document the current team conventions, handoff points, and delivery constraints that the shared platform baseline must respect."

##### `Product`
- provide business constraints, customer-impact rules, and quality priorities
- use `OpenSpec` to capture durable business context
- use `Speckit` to make acceptance language explicit where needed

###### Prompt examples:
- prompt: "Using the OpenSpec and Speckit skills, document the durable business constraints, customer expectations, and quality priorities that must guide the platform baseline."

##### `Developer`
- support only when implementation reality exposes hidden constraints
- use `Speckit` to surface quality and testability issues in current practice

###### Prompt examples:
- prompt: "Using the Speckit skill, identify hidden implementation constraints or testing gaps in the current platform that should be reflected in the platform baseline."

Exit output:
- current-state snapshot
- gap register
- draft platform baseline

### Route

Primary owner: `Team Lead`

Goal:
- normalize intake into one routed change package

Use this phase to:
- assess size and impact
- choose the smallest safe path
- identify the next artifact and owner

#### Role instructions and prompt examples:

##### `Team Lead`
- use `BMAD` first for routing and handoff discipline
- use `OpenSpec` to open and frame the change package
- use `Speckit` only when ambiguity blocks safe routing

###### Prompt examples:
- prompt: "Using the BMAD and OpenSpec skills, route this request by size and impact, open the change package, and identify the next artifact and owner."
- prompt: "Using the OpenSpec skill, break down the feature into specific tasks and create a roadmap for the development team, ensuring that all tasks are clearly defined and traceable to the specifications."

##### `Product`
- clarify business value, urgency, and non-goals
- use `OpenSpec` to make scope boundaries explicit

###### Prompt examples:
- prompt: "Using the OpenSpec skill, clarify the business goal, non-goals, and acceptance boundary for this request so it can be routed safely."

##### `Architect`
- assess architecture risk, system impact, and cross-team dependencies
- use `BMAD` to signal when a deeper planning path is required

###### Prompt examples:
- prompt: "Using the BMAD skill, assess whether this change requires architecture-heavy planning, cross-team coordination, or additional design control."

##### `Developer`
- support feasibility checks only when complexity is unclear
- use `Speckit` to expose hidden technical unknowns early

###### Prompt examples:
- prompt: "Using the Speckit skill, identify technical unknowns or edge cases that could change the routing decision for this request."

Exit output:
- classified change package
- named next artifact
- confirmed next phase owner

### Specify

Primary owner: `Product`

Goal:
- produce a clear, testable, and reviewable spec package

Use this phase to:
- define behavior, scope, and acceptance outcomes
- clarify ambiguity before planning
- confirm readiness for architecture and task planning

#### Role instructions and prompt examples:

##### `Product`
- use `OpenSpec` first for proposal and delta specs
- use `Speckit` for clarify and checklist discipline
- use `BMAD` to keep scope right-sized

###### Prompt examples:
- prompt: "Using the OpenSpec skill, define the user stories and acceptance criteria for the new feature, ensuring that they are aligned with the business goals and user needs."
- prompt: "Using the OpenSpec skill, review the user stories and acceptance criteria with the development team, providing feedback and ensuring that they are being met throughout the development process."

##### `Team Lead`
- protect scope boundaries and confirm readiness for planning
- use `BMAD` to prevent over-expansion
- use `OpenSpec` to check artifact completeness

###### Prompt examples:
- prompt: "Using the BMAD and OpenSpec skills, review this spec package for scope control, traceability, and readiness to move into planning."

##### `Architect`
- identify hard technical constraints without over-designing the spec
- use `BMAD` for system-level constraints
- use `Speckit` to make non-functional expectations explicit

###### Prompt examples:
- prompt: "Using the BMAD skill, review the proposed behavior and identify any architectural constraints, major dependencies, or platform rules that must be reflected before planning."
- prompt: "Using the BMAD skill, review the architecture plan and provide feedback on any potential risks or improvements, ensuring that it remains aligned with our platform's principles and constraints."

##### `Developer`
- surface failure behavior, operational edges, and testability concerns
- use `Speckit` for executable acceptance behavior

###### Prompt examples:
- prompt: "Using the Speckit skill, write executable specifications for the assigned tasks, ensuring that they are clear, testable, and aligned with the overall architecture and roadmap."

Exit output:
- approved proposal
- clarified delta specs
- acceptance-ready spec package

### Plan

Primary owner: `Architect`

Goal:
- turn the approved spec into an implementation-ready design and task plan

Use this phase to:
- define architecture and technical decisions
- create ordered tasks and delivery slices
- prepare verification and PR strategy

#### Role instructions and prompt examples:

##### `Architect`
- use `BMAD` first for architecture and tradeoffs
- use `OpenSpec` for `design.md` and `tasks.md`
- use `Speckit` to keep tasks executable and phased

###### Prompt examples:
- prompt: "Using the BMAD skill, create a high-level architecture plan for the new feature, ensuring it aligns with our platform's principles and constraints."
- prompt: "Using the BMAD skill, review the architecture plan and provide feedback on any potential risks or improvements, ensuring that it remains aligned with our platform's principles and constraints."

##### `Team Lead`
- validate delivery slices, sequencing, and ownership
- use `OpenSpec` to ensure tasks stay traceable to the specs

###### Prompt examples:
- prompt: "Using the OpenSpec skill, break down the feature into specific tasks and create a roadmap for the development team, ensuring that all tasks are clearly defined and traceable to the specifications."

##### `Product`
- confirm the plan still matches intent and acceptance behavior
- use `OpenSpec` to review traceability from spec to plan

###### Prompt examples:
- prompt: "Using the OpenSpec skill, review the planned tasks and design approach against the user stories and acceptance criteria, and flag any gaps in expected behavior."

##### `Developer`
- validate task feasibility and testing practicality
- use `Speckit` to keep tasks implementable and verifiable

###### Prompt examples:
- prompt: "Using the Speckit skill, review the proposed task breakdown and identify whether the work is executable in small, testable slices."

Exit output:
- approved design
- ADRs if needed
- ordered tasks and delivery slices

### Deliver

Primary owner: `Team Lead`

Goal:
- move from approved plan to verified, reviewable, and deployed change

Use this phase to:
- implement slices
- create PRs
- run review and verification
- deploy and archive the change

Internal flow:
- Build
- Create PR
- Review PR
- Verify
- Deploy
- Archive

#### Role instructions and prompt examples:

##### `Team Lead`
- use `OpenSpec` to keep task and change state current
- use `BMAD` for review routing and role handoff control
- use `Speckit` to protect slice quality

###### Prompt examples:
- prompt: "Using the OpenSpec skill, monitor the progress of the development team and ensure that all tasks are being completed according to the specifications, providing support and guidance as needed."
- prompt: "Using the BMAD and OpenSpec skills, coordinate the current delivery slice through build, PR creation, review, verification, deploy, and archive."

##### `Developer`
- use `Speckit` first for executable task execution
- use `OpenSpec` to update task status and PR traceability
- use `BMAD` when story execution or review support is needed

###### Prompt examples:
- prompt: "Using the Speckit skill, implement the assigned tasks according to the executable specifications, ensuring that all code is well-documented and tested."
- prompt: "Using the OpenSpec and BMAD skills, update the task state, create a reviewable PR for this slice, and summarize the validation performed."

##### `Architect`
- review architecture-sensitive PRs and late technical tradeoffs
- use `BMAD` for design integrity review

###### Prompt examples:
- prompt: "Using the BMAD skill, review this PR for architecture integrity, interface compatibility, and design drift against the approved plan."

##### `Product`
- review behavior-critical changes and release readiness when needed
- use `OpenSpec` to confirm delivered behavior matches the spec

###### Prompt examples:
- prompt: "Using the OpenSpec skill, review the delivered behavior against the approved user stories and acceptance criteria, and identify any business-facing gaps before deploy."

Exit output:
- implemented slices
- reviewable PRs
- resolved review feedback
- verification evidence
- deploy decision
- archive-ready change package

## Agent files

- `architect-agent.md`
- `team-lead-agent.md`
- `product-agent.md`
- `developer-agent.md`
