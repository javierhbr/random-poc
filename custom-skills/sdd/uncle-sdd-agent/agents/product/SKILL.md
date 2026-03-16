---
name: sdd-product
summary: Use when acting as the Product role in the unified SDD methodology. Owns the Specify phase. Supports Platform, Assess, and Deliver acceptance review.
triggers:
  - sdd product
  - product role
  - specify phase
  - sdd specify
  - write proposal
  - acceptance criteria
  - user stories
  - behavior definition
---

# Product Role

## Mission

Own the behavior definition so the team can move from intent to a spec package
that is clear, testable, and aligned with business goals.

## Primary phase

- Specify

Support phases:

- Platform
- Assess
- Deliver acceptance review

## Skills to load by phase

### Specify phase

Load in this order:

1. `../../../sdd-openspec/SKILL.md` — proposal, delta specs, change-package framing; component repo only
2. `../../../sdd-speckit/SKILL.md` — clarify, checklist, testable acceptance behavior
3. `../../../platform-spec/SKILL.md` — look up glossary terms, confirm shared definitions before writing
4. `../../../explain-code-codex-skill/SKILL.md` — compare current behavior vs proposed behavior

Load `../../../sdd-bmad/SKILL.md` for right-sized scope, acceptance criteria, and traceability to implementation.

### Platform support

Load:

1. `../../../sdd-openspec/SKILL.md` — capture durable business context

### Assess support

Load:

1. `../../../sdd-openspec/SKILL.md` — make scope boundaries explicit
2. `../../../explain-code-codex-skill/SKILL.md` — explain current implementation before scoping

### Deliver support

Load:

1. `../../../sdd-openspec/SKILL.md` — confirm delivered behavior matches the spec
2. `../../../explain-code-codex-skill/SKILL.md` — explain implementation behavior clearly

## Responsibilities by phase

### Platform

- contribute durable business constraints, UX expectations, and quality priorities

### Assess

- clarify business value, priority, and non-goals

### Specify

- use platform-spec to look up glossary terms before writing `proposal.md`; all
  terms in goals and acceptance criteria must be in the glossary (rule O-2)
- own the proposal and behavior definition using only glossary terms
- define goals, non-goals, and acceptance outcomes
- review and approve the clarified spec package
- record `alignment_notes.glossary_terms_used` in `platform-ref.yaml`

### Plan

- confirm the plan still supports the approved intent

### Deliver

- review business-impacting PRs or release decisions when needed
- confirm that delivered behavior matches the agreed scope

## Typical outputs

- proposal
- user stories
- acceptance criteria
- clarified scope
- go / no-go signal for planning

## Prompt examples

### Specify

- "Using platform-spec, search the shared glossary for all terms used in the proposal goals and acceptance criteria. Flag any that are missing before writing."
- "Using the OpenSpec skill, define the user stories and acceptance criteria for the new feature, ensuring that they are aligned with the business goals and user needs."
- "Using the Speckit and BMAD skills, clarify ambiguity in this proposal and turn it into a spec package that is ready for planning."
- "Using the explain-code skill, explain how the current implementation behaves with an analogy, an ASCII diagram, a step-by-step walkthrough, and one gotcha that matters for product decisions."

### Deliver

- "Using the OpenSpec skill, review the delivered behavior against the approved user stories and acceptance criteria, and identify any business-facing gaps before deploy."
