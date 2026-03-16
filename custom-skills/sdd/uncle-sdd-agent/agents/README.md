# Role Agents

> This file is human-facing documentation only. Skill loading happens via the
> role SKILL.md files in `architect/`, `team-lead/`, `product/`, `developer/`.

These role agents sit on top of the unified SDD skill package.

They all have access to the same three core SDD skills:

- BMAD
- OpenSpec
- Speckit

They also share one support skill:

- Explain Code

They do not use these skills the same way. Each role uses the core skills
according to phase ownership, decision rights, and expected outputs, and uses
`Explain Code` when the team needs a clear explanation of existing code,
planned behavior, or pull request impact.

Important boundary:

- platform-level work may use the combined skill set
- once the work enters a component repository, the local change package uses
  `OpenSpec` only
- when teams need local access to platform truth, use the local read-only
  platform MCP gateway instead of copying platform artifacts into the component repo

Use this file as the phase-by-phase instruction guide and prompt catalog for the
role agents.

## Role map

| Role | Primary phases | Default skill emphasis | Typical outputs |
| --- | --- | --- | --- |
| Architect | Platform, Plan | platform: BMAD -> OpenSpec -> Speckit; component: OpenSpec (+ Explain Code) | platform baseline, architecture plan, ADRs, design review |
| Team Lead | Assess, Deliver | platform: BMAD -> OpenSpec -> Speckit; component: OpenSpec (+ Explain Code) | assessed change package, delivery slices, PR/review coordination, archive closure |
| Product | Specify | platform: OpenSpec -> Speckit -> BMAD; component: OpenSpec (+ Explain Code) | proposal, user stories, acceptance criteria, clarified scope |
| Developer | Deliver, future Build | component: OpenSpec (+ Explain Code) | executable tasks, code, tests, PRs, review fixes |

## Shared rules for all role agents

- use one change package per approved change
- respect the current phase owner
- keep artifacts aligned with delivered reality
- use the smallest sufficient workflow
- keep PRs reviewable and traceable to the spec
- escalate ambiguity before implementation, not after
- use `Explain Code` when a role needs to teach, onboard, or explain code flow
- platform phases may use the combined skill set
- once the work enters a component repository, use `OpenSpec` only for the
  local change package, local planning, and local delivery updates

## How to use this guide

1. identify the current workflow phase
2. start with the primary owner for that phase
3. use the default skill emphasis for that role
4. involve support roles only where they add real signal
5. produce the phase output before moving forward

For existing platforms, start the Platform phase with
`../../platform-contextualizer-skill/SKILL.md`.

For explanation-heavy work, use
`../../explain-code-skill/SKILL.md`.

For detailed worked examples by phase, role, and entry point, use
`../../unified-sdd-methodology/example/README.md`.

For local platform query and alignment validation, use
`../../platform-truth-mcp-skill/SKILL.md`.

## Phase ownership

| Phase | Primary owner | Core support | Main outcome |
| --- | --- | --- | --- |
| Platform | Architect | Team Lead, Product | shared context and durable rules |
| Assess | Team Lead | Product, Architect | routed change package and next artifact |
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

## Shared support skill

Use `Explain Code` when a role needs to explain:

- current platform structure during `Platform`
- existing code paths or blast radius during `Assess`
- current vs expected behavior during `Specify`
- architecture and interfaces during `Plan`
- PR changes and implementation details during `Deliver`

Role-specific prompt examples:

- `Architect`
  - prompt: "Using the explain-code skill, explain this platform or service architecture with an analogy, an ASCII diagram, a step-by-step walkthrough, and one architecture gotcha."

- `Team Lead`
  - prompt: "Using the explain-code skill, explain how this change package maps to the current code path and PR review flow so the team can execute it consistently."

- `Product`
  - prompt: "Using the explain-code skill, explain how the current implementation behaves today, compare it to the proposed behavior, and highlight one gap the team must address."

- `Developer`
  - prompt: "Using the explain-code skill, explain this code path or PR change with an analogy, an ASCII diagram, a step-by-step walkthrough, and one gotcha reviewers should watch."

## Phase guide and prompt catalog

### Platform

Primary owner: `Architect`

Goal:
- create shared context and durable rules for the platform
- write the three ownership artifacts that make all future Assess steps deterministic

Use this phase to:
- document current constraints and conventions
- define platform principles and guardrails (including rules O-1, O-2, O-3)
- establish role boundaries for later phases
- write `ownership/component-ownership-<name>.md` for each component
- write `ownership/dependency-map.md` with all cross-component relationships
  classified as tier 1 / tier 2 / tier 3
- seed `ownership/glossary.md` with shared terms and "what it is NOT" clauses

#### Role instructions and prompt examples:

##### `Architect`
- use `BMAD` first for brownfield context and role framing
- use `OpenSpec` to encode durable context
- use `Speckit` to turn principles into explicit rules
- write the three ownership artifacts as the final Platform output
- use `Explain Code` to explain existing architecture and constraints to teams

###### Prompt examples:
- prompt: "Using the BMAD skill, review the current platform, identify its architectural constraints, and draft a shared platform baseline that teams can use during Platform, Assess, and Specify."
- prompt: "Using the BMAD skill, create a high-level architecture plan for the platform baseline, ensuring it aligns with our platform's principles and constraints."
- prompt: "Write the ownership boundary file for [component name]. List what it owns, what it does NOT own, which contracts it publishes, and which contracts it consumes."
- prompt: "Write the platform dependency map. For each cross-component relationship, classify it as tier 1 (must_change_together), tier 2 (watch_for_breakage), or tier 3 (adapts_independently)."
- prompt: "Seed the shared glossary with terms from the platform baseline and brownfield review. For each term, add a plain definition and a 'what it is NOT' clause."
- prompt: "Using the explain-code skill, explain the current platform architecture with an analogy, an ASCII diagram, a step-by-step walkthrough, and one constraint teams often miss."

##### `Team Lead`
- provide current team conventions, delivery constraints, and adoption risks
- use `BMAD` to surface operating realities from active teams
- use `OpenSpec` to capture durable team-level context that should become shared
- use `Explain Code` when team handoffs depend on understanding existing flow

###### Prompt examples:
- prompt: "Using the BMAD and OpenSpec skills, document the current team conventions, handoff points, and delivery constraints that the shared platform baseline must respect."
- prompt: "Using the explain-code skill, explain the current delivery flow and handoff points with an analogy, an ASCII diagram, a step-by-step walkthrough, and one coordination gotcha."

##### `Product`
- provide business constraints, customer-impact rules, and quality priorities
- use `OpenSpec` to capture durable business context
- use `Speckit` to make acceptance language explicit where needed
- use `Explain Code` when business stakeholders need the current behavior explained

###### Prompt examples:
- prompt: "Using the OpenSpec and Speckit skills, document the durable business constraints, customer expectations, and quality priorities that must guide the platform baseline."
- prompt: "Using the explain-code skill, explain how the current platform behavior affects the user experience, using an analogy, an ASCII diagram, a walkthrough, and one business-facing gotcha."

##### `Developer`
- support only when implementation reality exposes hidden constraints
- use `Speckit` to surface quality and testability issues in current practice
- use `Explain Code` to describe hard-to-see code paths in the current platform

###### Prompt examples:
- prompt: "Using the Speckit skill, identify hidden implementation constraints or testing gaps in the current platform that should be reflected in the platform baseline."
- prompt: "Using the explain-code skill, explain the current code path with an analogy, an ASCII diagram, a walkthrough, and one implementation gotcha that should inform the platform baseline."

Exit output:
- current-state snapshot
- gap register
- draft platform baseline
- `ownership/component-ownership-<name>.md` for each component
- `ownership/dependency-map.md` with tier classification
- `ownership/glossary.md` seeded with shared terms

### Assess

Primary owner: `Team Lead`

Goal:
- normalize intake into one routed change package

Use this phase to:
- assess size and impact
- choose the smallest safe path
- confirm component ownership from `ownership/component-ownership-<name>.md`
  before opening any JIRA epic (rule O-1)
- read `ownership/dependency-map.md` and record impact tiers in `platform-ref.yaml`
- identify the next artifact and owner

#### Role instructions and prompt examples:

##### `Team Lead`
- use `BMAD` first for routing and handoff discipline
- read `ownership/component-ownership-<name>.md` to confirm the correct owner
- read `ownership/dependency-map.md` to classify impact tiers before opening JIRA epics
- use `OpenSpec` to open and frame the change package with ownership and impact fields
- use `Speckit` only when ambiguity blocks safe routing
- use `Explain Code` to show the current flow when routing depends on code impact

###### Prompt examples:
- prompt: "Using the BMAD and OpenSpec skills, route this request by size and impact, open the change package, and identify the next artifact and owner."
- prompt: "Read ownership/component-ownership-<name>.md and confirm which component owns this request. Then read ownership/dependency-map.md and populate the impact tier fields in platform-ref.yaml."
- prompt: "Using the explain-code skill, explain the current code path and blast radius with an analogy, an ASCII diagram, a walkthrough, and one routing risk."

##### `Product`
- clarify business value, urgency, and non-goals
- use `OpenSpec` to make scope boundaries explicit
- use `Explain Code` when current implementation must be explained before scoping

###### Prompt examples:
- prompt: "Using the OpenSpec skill, clarify the business goal, non-goals, and acceptance boundary for this request so it can be routed safely."
- prompt: "Using the explain-code skill, explain how the current implementation behaves today, and highlight the one behavior that matters most for scoping this request."

##### `Architect`
- assess architecture risk, system impact, and cross-team dependencies
- use `BMAD` to signal when a deeper planning path is required
- use `Explain Code` to make system impact visible to non-architects

###### Prompt examples:
- prompt: "Using the BMAD skill, assess whether this change requires architecture-heavy planning, cross-team coordination, or additional design control."
- prompt: "Using the explain-code skill, explain the affected system path with an analogy, an ASCII diagram, a walkthrough, and one dependency gotcha."

##### `Developer`
- support feasibility checks only when complexity is unclear
- use `Speckit` to expose hidden technical unknowns early
- use `Explain Code` to show where the code path is more coupled than expected

###### Prompt examples:
- prompt: "Using the Speckit skill, identify technical unknowns or edge cases that could change the routing decision for this request."
- prompt: "Using the explain-code skill, explain the current implementation path and call out one hidden dependency that may change the routing decision."

Exit output:
- classified change package
- named next artifact
- confirmed next phase owner

### Specify

Primary owner: `Product`

Goal:
- produce a clear, testable, and reviewable spec package

Use this phase to:
- read `ownership/glossary.md` before writing `proposal.md` (rule O-2)
- define behavior, scope, and acceptance outcomes using only glossary terms
- clarify ambiguity before planning
- confirm readiness for architecture and task planning
- record `alignment_notes.glossary_terms_used` in `platform-ref.yaml`

#### Role instructions and prompt examples:

##### `Product`
- read `ownership/glossary.md` first; add any missing terms before writing
- use `OpenSpec` for proposal and delta specs
- use `OpenSpec` only inside the component repo
- use `Explain Code` to compare current behavior vs proposed behavior

###### Prompt examples:
- prompt: "Read ownership/glossary.md and confirm all terms in the proposal goals and acceptance criteria are defined. Add any missing terms before writing."
- prompt: "Using the OpenSpec skill, define the user stories and acceptance criteria for the new feature, ensuring that they are aligned with the business goals and user needs."
- prompt: "Using the explain-code skill, explain the current behavior with an analogy, an ASCII diagram, a walkthrough, and one mismatch the new specification must correct."

##### `Team Lead`
- protect scope boundaries and confirm readiness for planning
- use `OpenSpec` to check artifact completeness
- use `OpenSpec` only inside the component repo
- use `Explain Code` when the team needs the current flow explained before approving readiness

###### Prompt examples:
- prompt: "Using the OpenSpec skill, review this spec package for scope control, traceability, and readiness to move into planning."
- prompt: "Using the explain-code skill, explain the current implementation flow behind this spec so the team can judge whether the proposed scope is realistic."

##### `Architect`
- identify hard technical constraints without over-designing the spec
- use `OpenSpec` to capture local constraints and alignment to platform refs
- use `Explain Code` to explain current architecture behavior behind the spec

###### Prompt examples:
- prompt: "Using the OpenSpec skill, review the proposed behavior and identify any architectural constraints, major dependencies, or platform rules that must be reflected before planning."
- prompt: "Using the OpenSpec skill, review the local component package and confirm that it stays aligned with the approved platform refs and shared contracts."
- prompt: "Using the explain-code skill, explain the current architecture path affected by this spec with an analogy, an ASCII diagram, a walkthrough, and one design gotcha."

##### `Developer`
- surface failure behavior, operational edges, and testability concerns
- use `OpenSpec` for executable acceptance behavior
- use `Explain Code` to explain existing behavior before writing executable expectations

###### Prompt examples:
- prompt: "Using the OpenSpec skill, write executable expectations for the assigned tasks, ensuring that they are clear, testable, and aligned with the approved component spec and platform refs."
- prompt: "Using the explain-code skill, explain the current code behavior with an analogy, an ASCII diagram, a walkthrough, and one testing gotcha before writing executable specifications."

Exit output:
- approved proposal
- clarified delta specs
- acceptance-ready spec package

### Plan

Primary owner: `Architect`

Goal:
- turn the approved spec into an implementation-ready design and task plan

Use this phase to:
- read `platform-ref.yaml` impact tiers before designing
- tier 1 `must_change_together` → hard constraints in `design.md`
- tier 2 `watch_for_breakage` → rollout risks in `design.md`
- define architecture and technical decisions
- create ordered tasks and delivery slices
- prepare verification and PR strategy

#### Role instructions and prompt examples:

##### `Architect`
- read `platform-ref.yaml` impact tiers first; tier 1 entries become named
  coordination requirements in `design.md`; tier 2 entries become rollout risks
- use `OpenSpec` for `design.md` and `tasks.md`
- use `OpenSpec` only inside the component repo
- use `Explain Code` to teach the planned architecture and affected code paths

###### Prompt examples:
- prompt: "Read platform-ref.yaml impact tiers. For each tier 1 entry, add a named coordination requirement to design.md. For each tier 2 entry, add a rollout risk note."
- prompt: "Using the OpenSpec skill, create the component `design.md` for the new feature, ensuring it aligns with the approved platform refs, shared contracts, and local repository boundaries."
- prompt: "Using the OpenSpec skill, review the component plan and confirm that the design and tasks stay aligned with the approved platform handoff."
- prompt: "Using the explain-code skill, explain the planned architecture path with an analogy, an ASCII diagram, a walkthrough, and one implementation gotcha."

##### `Team Lead`
- validate delivery slices, sequencing, and ownership
- use `OpenSpec` to ensure tasks stay traceable to the specs
- use `Explain Code` to help the team understand task sequencing and code impact

###### Prompt examples:
- prompt: "Using the OpenSpec skill, break down the feature into specific tasks and create a roadmap for the development team, ensuring that all tasks are clearly defined and traceable to the specifications."
- prompt: "Using the explain-code skill, explain how the planned slices map to the current code flow and where the main coordination risk sits."

##### `Product`
- confirm the plan still matches intent and acceptance behavior
- use `OpenSpec` to review traceability from spec to plan
- use `Explain Code` when implementation tradeoffs need to be explained in product terms

###### Prompt examples:
- prompt: "Using the OpenSpec skill, review the planned tasks and design approach against the user stories and acceptance criteria, and flag any gaps in expected behavior."
- prompt: "Using the explain-code skill, explain how the planned implementation will satisfy the approved behavior, and point out one tradeoff product should understand."

##### `Developer`
- validate task feasibility and testing practicality
- use `OpenSpec` to keep tasks implementable and verifiable
- use `Explain Code` to explain the target code path before implementation starts

###### Prompt examples:
- prompt: "Using the OpenSpec skill, review the proposed task breakdown and identify whether the work is executable in small, testable slices."
- prompt: "Using the explain-code skill, explain the affected code path with an analogy, an ASCII diagram, a walkthrough, and one technical gotcha before implementation begins."

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
- create PRs that note tier 1/2 dependency verification
- run review and verification
- coordinate deploy timing for tier 1 dependent components
- archive and flag any ownership or tier changes for platform repo update

Internal flow:
- Build
- Create PR (with tier 1/2 verification notes)
- Review PR
- Verify
- Deploy (all tier 1 components ready)
- Archive (flag ownership/tier changes if any)

#### Role instructions and prompt examples:

##### `Team Lead`
- use `OpenSpec` to keep task and change state current
- use `OpenSpec` only inside the component repo
- use `Explain Code` to explain PR scope and review focus to the team

###### Prompt examples:
- prompt: "Using the OpenSpec skill, monitor the progress of the development team and ensure that all tasks are being completed according to the specifications, providing support and guidance as needed."
- prompt: "Using the OpenSpec skill, coordinate the current delivery slice through build, PR creation, review, verification, deploy, and archive."
- prompt: "Using the explain-code skill, explain the current delivery slice and PR scope with an analogy, an ASCII diagram, a walkthrough, and one review gotcha."

##### `Developer`
- use `OpenSpec` for executable task execution
- use `OpenSpec` to update task status and PR traceability
- use `Explain Code` to explain the code path and PR change to reviewers

###### Prompt examples:
- prompt: "Using the OpenSpec skill, implement the assigned tasks according to the approved component spec, ensuring that the code and tests remain aligned with the local OpenSpec package."
- prompt: "Using the OpenSpec skill, update the task state, create a reviewable PR for this slice, and summarize the validation performed."
- prompt: "Using the explain-code skill, explain this PR change with an analogy, an ASCII diagram, a walkthrough, and one gotcha reviewers should watch."

##### `Architect`
- review architecture-sensitive PRs and late technical tradeoffs
- use `OpenSpec` for design integrity review inside the component repo
- use `Explain Code` when reviewers need the architecture impact made explicit

###### Prompt examples:
- prompt: "Using the OpenSpec skill, review this PR for architecture integrity, interface compatibility, and design drift against the approved component plan."
- prompt: "Using the explain-code skill, explain how this PR changes the architecture path, using an analogy, an ASCII diagram, a walkthrough, and one risk."

##### `Product`
- review behavior-critical changes and release readiness when needed
- use `OpenSpec` to confirm delivered behavior matches the spec
- use `Explain Code` when product needs implementation behavior explained clearly

###### Prompt examples:
- prompt: "Using the OpenSpec skill, review the delivered behavior against the approved user stories and acceptance criteria, and identify any business-facing gaps before deploy."
- prompt: "Using the explain-code skill, explain how the delivered code behaves now, using an analogy, an ASCII diagram, a walkthrough, and one behavior gotcha to verify before deploy."

Exit output:
- implemented slices
- reviewable PRs with tier 1/2 verification notes
- resolved review feedback
- verification evidence
- deploy decision with tier 1 coordination confirmed
- archive-ready change package
- archive note if ownership boundaries or dependency tiers changed

## Agent files

- `architect/SKILL.md`
- `team-lead/SKILL.md`
- `product/SKILL.md`
- `developer/SKILL.md`
