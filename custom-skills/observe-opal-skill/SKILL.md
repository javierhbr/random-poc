# Observe OPAL Authoring Skill

Layer: 1 (Router)

## Purpose

Use this skill when the task involves writing, fixing, explaining, or reviewing OPAL for Observe.

OPAL is pipeline-based: each step builds on previous steps; functions compute values for individual columns; verbs process sets of rows; and stages/subqueries help shape data in logical chunks and reduce the need for intermediate datasets.

## Use this skill for

- Writing new OPAL queries from natural-language requirements
- Explaining an existing OPAL query line by line
- Refactoring OPAL for readability or performance
- Building dataset shaping flows with stages or subqueries
- Choosing the correct verb, operator, cast, or function
- Translating examples into reusable OPAL patterns

## Do not use this skill for

- General SQL generation unless the user explicitly wants OPAL-like translation
- Observe UI administration steps that do not require OPAL authoring
- Blindly inventing unsupported functions or verbs

## 3-layer context model

### Layer 1 — Router (this file)
Decides when OPAL guidance is needed and routes to the smallest relevant reference.

### Layer 2 — Skill logic
Read `references/opal-authoring-playbook.md` for how to think, plan, and answer.

### Layer 3 — Resources
Use only the references relevant to the task:

- `references/opal-syntax-reference.md`
- `references/opal-types-and-operators-reference.md`
- `references/opal-functions-reference.md`
- `references/opal-verbs-reference.md`
- `references/opal-stages-and-subqueries-reference.md`
- `references/opal-patterns-and-recipes.md`
- `examples/opal-prompt-examples.md`

## Routing guide

- Need grammar, literals, comments, or subqueries → `opal-syntax-reference.md`
- Need casts, types, null handling, field access, operators → `opal-types-and-operators-reference.md`
- Need scalar, aggregate, or utility computations → `opal-functions-reference.md`
- Need row-set transformations, aggregation, joins, union, filtering → `opal-verbs-reference.md`
- Need worksheet/stage design or branch/merge flows → `opal-stages-and-subqueries-reference.md`
- Need real query shapes → `opal-patterns-and-recipes.md`

## Default workflow

1. Restate the user goal as an OPAL data-shaping intent.
2. Identify the minimum relevant inputs, fields, filters, and output columns.
3. Prefer early filtering and explicit casts when source types are uncertain.
4. Choose the smallest set of verbs/functions needed.
5. For complex branching, use stages or named subqueries.
6. Return:
   - the OPAL query
   - a concise explanation
   - assumptions / placeholders
   - optional follow-up improvements

## Output rules

- Prefer valid OPAL over pseudo-code.
- Keep queries readable with comments when logic is non-obvious.
- Do not invent syntax not present in the references.
- When field names are unknown, use obvious placeholders like `timestamp`, `message`, `service`, `severity`, `FIELDS.*`.
- When a cast is likely required, cast explicitly.
- When working with JSON, prefer explicit extraction and normalization.

## Quick mental model

- Functions compute values for columns.
- Verbs transform sets of rows.
- Stages split a shaping workflow into logical chunks.
- Subqueries let each input be shaped independently before combining.
