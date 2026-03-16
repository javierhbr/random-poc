---
name: unified-sdd-skill
description: Use for platform-scale spec-driven development that combines Sdd-Bmad's progressive planning and roles, Sdd-OpenSpec's change package and artifact flow, and Sdd-Speckit's executable specification discipline. Uses a Route phase (instead of Assess) for lightweight request classification. Trigger when working with unified SDD orchestration, platform SDD routing, change packages, or iteration planning.
triggers:
  - unified sdd
  - platform sdd
  - change package
  - platform route
  - platform specify
  - platform plan
  - platform deliver
  - pull request review
  - iteration 1
  - iteration 2
---

# Unified SDD Orchestrator

Use this skill when the team wants one practical workflow across multiple
teams, artifacts, and delivery phases without losing the strengths of Sdd-Bmad,
Sdd-OpenSpec, and Sdd-Speckit. Use `../explain-code-skill/SKILL.md` as a support
skill when roles need to explain existing code, planned behavior, or PR impact.

This skill is phase-first, not artifact-first. It uses "Route" (lightweight
classification) instead of "Assess" (deep analysis with ownership artifacts).

It uses a 3-layer context model:

- Layer 1 - operating model and routing
- Layer 2 - phase playbooks and rules
- Layer 3 - references and source skills

## Layer 1 - Operating model

### 1. Use one 5-phase workflow

Platform → Route → Specify → Plan → Deliver

Deliver includes: Build, Create PR, Review PR, Verify, Deploy, Archive.

### 2. Roll out in two iterations

- Iteration 1: Platform, Route, Specify
- Iteration 2: Plan, Deliver

### 3. Use one change package per approved change

Every approved request normalizes into one change package containing:
proposal, delta specs, design, tasks, delivery state, verification evidence, archive history.

### 4–9. Operating model principles

See `resources/operating-model.md` for full detail on:
- canonical platform truth + versioned component alignment (4)
- human accountability and agent support boundaries (5)
- size vs impact routing (6)
- smallest sufficient workflow (7)
- reviewable delivery slices (8)
- artifact drift prevention (9)
- default skill mix by phase

## Layer 2 - Phase router

### Platform

- Owner: Architect
- Goal: define durable context, constitution, config, and role expectations
- Use first in Iteration 1
- Primary rules: `rules/platform-rules.md`

### Route

- Owner: Team Lead
- Goal: classify the request, open the change package, select the next artifact
- Classify whether the change is component-only or shared with platform truth
- Use for every new change
- Primary rules: `rules/route-rules.md`

### Specify

- Owner: Product
- Goal: define behavior, remove ambiguity, produce a ready-for-plan spec package
- Confirm platform refs and whether a linked platform delta is needed
- Finish Iteration 1 here
- Primary rules: `rules/specify-rules.md`

### Plan

- Owner: Architect
- Goal: convert approved spec into design, tasks, and delivery slices
- Map tasks to stories and keep platform alignment visible in planning
- Start Iteration 2 here
- Primary rules: `rules/plan-rules.md`

### Deliver

- Owner: Team Lead
- Goal: execute slices through PR, review, verification, deploy, and archive
- Keep PR, story, epic, and platform alignment traceability current
- Primary rules: `rules/deliver-rules.md`
- PR-specific rules: `rules/pr-review-rules.md`

## Output structure when applying this skill

1. Current phase → 2. Goal → 3. Owner and support roles → 4. Skills to use →
5. Rules to apply → 6. Artifact to produce → 7. Exit gate → 8. Risks → 9. Next step

## Layer 3 - Reference map

### Methodology docs

- `../unified-sdd-methodology/team-proposal.md`
- `../unified-sdd-methodology/iteration-1-playbook.md`
- `../unified-sdd-methodology/iteration-2-playbook.md`
- `../unified-sdd-methodology/canonical-platform-truth-and-component-alignment.md`
- `../unified-sdd-methodology/local-platform-mcp-model.md`
- `../unified-sdd-methodology/example/README.md`

### Rules

- `rules/platform-rules.md`
- `rules/alignment-and-traceability-rules.md`
- `rules/route-rules.md`
- `rules/specify-rules.md`
- `rules/plan-rules.md`
- `rules/deliver-rules.md`
- `rules/pr-review-rules.md`

### References

- `references/overview-and-philosophy.md`
- `references/phase-model.md`
- `references/platform-component-alignment.md`
- `references/agent-interaction-model.md`
- `references/sources.md`
- `resources/operating-model.md`
- `../platform-contextualizer-skill/SKILL.md`
- `../explain-code-skill/SKILL.md`

### Role agents

- `agents/README.md`
- `agents/architect-agent.md`
- `agents/team-lead-agent.md`
- `agents/product-agent.md`
- `agents/developer-agent.md`

### Source skills

- `../sdd-bmad/SKILL.md`
- `../sdd-openspec/SKILL.md`
- `../sdd-speckit/SKILL.md`
