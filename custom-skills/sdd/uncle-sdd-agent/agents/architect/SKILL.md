---
name: sdd-architect
summary: Use when acting as the Architect role in the unified SDD methodology. Owns the Platform and Plan phases. Supports Assess, Specify, and Deliver review.
triggers:
  - sdd architect
  - architect role
  - platform phase
  - plan phase
  - architecture plan
  - sdd platform
  - sdd plan
  - write ownership artifacts
  - write dependency map
  - write glossary
---

# Architect Role

## Mission

Guide platform teams through architecture-heavy parts of the workflow while
keeping the platform aligned with shared principles, context, and constraints.

## Primary phases

- Platform
- Plan

Support phases:

- Assess
- Specify
- Deliver review

## Skills to load by phase

### Platform phase

Load in this order:

1. `../../../platform-contextualizer-skill/SKILL.md` — use first on any existing platform
2. `../../../sdd-bmad/SKILL.md` — brownfield framing, role framing, architecture depth
3. `../../../sdd-openspec/SKILL.md` — encode durable context, write ownership artifacts
4. `../../../sdd-speckit/SKILL.md` — turn principles into explicit rules
5. `../../../explain-code-skill/SKILL.md` — explain existing architecture to teams

### Plan phase

Load in this order:

1. `../../../sdd-bmad/SKILL.md` — progressive planning, architecture decisions
2. `../../../sdd-openspec/SKILL.md` — design.md, tasks.md, change package alignment
3. `../../../platform-spec/SKILL.md` — query platform truth, validate impact tiers before designing
4. `../../../explain-code-skill/SKILL.md` — teach planned architecture and affected code paths

### Assess support

Load:

1. `../../../sdd-bmad/SKILL.md` — signal when work must escalate to architecture-heavy planning
2. `../../../explain-code-skill/SKILL.md` — make system impact visible to non-architects

### Specify support

Load:

1. `../../../sdd-openspec/SKILL.md` — capture local constraints and alignment to platform refs
2. `../../../explain-code-skill/SKILL.md` — explain current architecture behavior behind the spec

### Deliver review support

Load:

1. `../../../sdd-openspec/SKILL.md` — design integrity review inside the component repo
2. `../../../explain-code-skill/SKILL.md` — make architecture impact explicit for reviewers

## Responsibilities by phase

### Platform

- help define durable platform context
- frame role boundaries and planning expectations
- identify long-lived constraints and architecture guardrails
- write `ownership/component-ownership-<name>.md` for each component
- write `ownership/dependency-map.md` with tier 1 / tier 2 / tier 3 relationships
- seed `ownership/glossary.md` with shared terms and "what it is NOT" clauses

### Assess

- assess architecture, integration, and multi-team impact
- signal when work must escalate to architecture-heavy planning

### Specify

- identify hard technical constraints without turning the spec into a design doc

### Plan

- read `platform-ref.yaml` impact tiers before designing
  - tier 1 `must_change_together` → hard constraints in `design.md` with named coordination requirements
  - tier 2 `watch_for_breakage` → rollout risks in `design.md`
- own the technical execution plan
- define architecture, interfaces, data flow, testing strategy, and ADRs
- ensure the plan maps back to the approved spec

### Deliver

- review PRs that touch architecture integrity, interfaces, or ADR-relevant choices
- support technical tradeoff decisions during execution

## Typical outputs

- platform context framing
- `ownership/component-ownership-<name>.md` per component
- `ownership/dependency-map.md`
- `ownership/glossary.md`
- architecture plan
- ADRs
- design review notes
- risk and dependency callouts with tier labels

## Prompt examples

### Platform

- "Using the platform-contextualizer skill, review the current platform, document its current state, and produce a baseline the team can use during Platform, Assess, and Specify."
- "Write the ownership boundary file for [component name]. List what it owns, what it does NOT own, which contracts it publishes, and which contracts it consumes."
- "Write the platform dependency map. For each cross-component relationship, classify it as tier 1 (must_change_together), tier 2 (watch_for_breakage), or tier 3 (adapts_independently)."
- "Seed the shared glossary with terms from the platform baseline. For each term, add a plain definition and a 'what it is NOT' clause."
- "Using the explain-code skill, explain the current platform architecture with an analogy, an ASCII diagram, a step-by-step walkthrough, and one constraint teams often miss."

### Plan

- "Using platform-spec, search for the platform refs that apply to this component and list any tier 1 impact entries."
- "Read platform-ref.yaml impact tiers. For each tier 1 entry, add a named coordination requirement to design.md. For each tier 2 entry, add a rollout risk note."
- "Using the OpenSpec skill, create the component design.md, ensuring it aligns with the approved platform refs, shared contracts, and local repository boundaries."
- "Using the explain-code skill, explain the planned architecture path with an analogy, an ASCII diagram, a walkthrough, and one implementation gotcha."

### Deliver review

- "Using the OpenSpec skill, review this PR for architecture integrity, interface compatibility, and design drift against the approved component plan."
- "Using the explain-code skill, explain how this PR changes the architecture path, using an analogy, an ASCII diagram, a walkthrough, and one risk."
