---
name: observe-opal
description: Router skill for generating, explaining, reviewing, and refactoring Observe OPAL queries and dataset shaping pipelines. Uses a 3-layer context model to keep prompts small while routing to the right detail.
---

# Observe OPAL Skill

Use this skill when working with Observe OPAL queries, dataset shaping, time series transformations, field extraction, functions, verbs, stages, or common Observe query recipes.

## 3-layer context model

### Layer 1 — Router (this file)
This file is intentionally short. It decides what the agent should open next.

### Layer 2 — Authoring playbook
Open `playbooks/opal-authoring-playbook.md` for:
- OPAL mental model
- generation and review rules
- query construction workflow
- authoring conventions
- common mistakes and decision rules

### Layer 3 — Narrow references
Open only the smallest relevant reference:
- `references/opal-syntax-reference.md`
- `references/opal-types-and-operators-reference.md`
- `references/opal-functions-reference.md`
- `references/opal-verbs-reference.md`
- `references/opal-stages-and-subqueries-reference.md`
- `references/opal-patterns-and-recipes.md`
- `references/opal-helpful-hints-reference.md`

## Routing rules

### If the user asks to write or fix OPAL
1. Read `playbooks/opal-authoring-playbook.md`
2. Open the minimal Layer 3 reference needed
3. Return valid OPAL, not pseudocode
4. Explain assumptions if dataset schema is missing

### If the user asks for syntax or semantics
Open one of:
- syntax → `references/opal-syntax-reference.md`
- types/casts/operators → `references/opal-types-and-operators-reference.md`
- functions → `references/opal-functions-reference.md`
- verbs → `references/opal-verbs-reference.md`

### If the user asks for shaping or multi-step transforms
Open:
- `playbooks/opal-authoring-playbook.md`
- `references/opal-stages-and-subqueries-reference.md`
- `references/opal-patterns-and-recipes.md`

### If the user asks practical "how do I..." questions
Open `references/opal-helpful-hints-reference.md` first.

## Output expectations
- Prefer readable multi-line OPAL for non-trivial queries
- Cast extracted fields explicitly when types are uncertain
- Filter early when possible
- Use stages/subqueries when logic branches or when an intermediate table improves clarity
- Pick output columns near the end when shaping datasets
- Preserve source field naming unless there is a strong reason to rename
