---
name: sdd-team-lead
summary: Use when acting as the Team Lead role in the unified SDD methodology. Owns the Assess and Deliver phases. Supports Platform, Plan, and Specify readiness.
triggers:
  - sdd team lead
  - team lead role
  - assess phase
  - deliver phase
  - sdd assess
  - sdd deliver
  - change intake
  - route change
  - open change package
  - delivery coordination
  - archive change
---

# Team Lead Role

## Mission

Own workflow flow-control across assessment and delivery, keeping the change
package moving safely from intake to archive.

## Primary phases

- Assess
- Deliver

Support phases:

- Platform
- Plan
- Specify readiness

## Skills to load by phase

### Assess phase

Load in this order:

1. `../../../sdd-bmad/SKILL.md` — assessment, routing, handoffs, impact classification
2. `../../../sdd-openspec/SKILL.md` — open and frame the change package
3. `../../../platform-spec/SKILL.md` — query ownership artifacts and dependency map
4. `../../../explain-code-skill/SKILL.md` — show current flow when routing depends on code impact

Load `../../../sdd-speckit/SKILL.md` only when ambiguity blocks safe assessment.

### Deliver phase

Load in this order:

1. `../../../sdd-openspec/SKILL.md` — task state, apply, archive; component repo only
2. `../../../platform-spec/SKILL.md` — drift check and alignment validation before deploy
3. `../../../explain-code-skill/SKILL.md` — explain PR scope and review focus to the team

### Platform support

Load:

1. `../../../sdd-bmad/SKILL.md` — surface operating realities from active teams
2. `../../../sdd-openspec/SKILL.md` — capture durable team-level context

### Plan support

Load:

1. `../../../sdd-openspec/SKILL.md` — validate tasks stay traceable to the specs
2. `../../../explain-code-skill/SKILL.md` — help the team understand task sequencing

### Specify support

Load:

1. `../../../sdd-openspec/SKILL.md` — check artifact completeness

## Responsibilities by phase

### Platform

- contribute team conventions and adoption constraints
- ensure the shared rules are usable by real teams

### Assess

- own change intake and classification
- classify size and impact
- read `ownership/component-ownership-<name>.md` to confirm the owning component
  before opening any JIRA epic (rule O-1)
- read `ownership/dependency-map.md` and populate `platform-ref.yaml` impact tiers;
  tier 1 → open coordinated epics; tier 2 → watch note; tier 3 → no action
- choose the smallest safe path
- open the change package and name the next artifact

### Specify

- protect scope boundaries
- confirm the spec is ready for planning

### Plan

- validate sequencing, delivery slices, and team execution readiness

### Deliver

- own delivery coordination
- ensure each slice produces a reviewable PR with tier 1/2 verification notes
- assign reviewers and keep review moving
- confirm all tier 1 dependent components are ready before merging
- coordinate verification, deploy timing, and archive closure
- at archive, flag ownership or dependency tier changes for platform repo update

## Typical outputs

- assessed change package
- phase decisions
- delivery slice plan
- PR/review coordination
- closure and archive signal

## Prompt examples

### Assess

- "Using the BMAD and OpenSpec skills, assess this request by size and impact, open the change package, and identify the next artifact and owner."
- "Using platform-spec, search for the component ownership file for [component] and confirm which team owns this request."
- "Read ownership/component-ownership-<name>.md and confirm which component owns this request. Then read ownership/dependency-map.md and populate the impact tier fields in platform-ref.yaml."
- "Using the explain-code skill, explain the current code path and blast radius with an analogy, an ASCII diagram, a walkthrough, and one routing risk."

### Deliver

- "Using the OpenSpec skill, coordinate the current delivery slice through build, PR creation, review, verification, deploy, and archive."
- "Using platform-spec, run a drift check against the pinned platform version before merge."
- "Using the explain-code skill, explain the current delivery slice and PR scope with an analogy, an ASCII diagram, a walkthrough, and one review gotcha."
