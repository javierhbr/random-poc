# Specify Rules

Use these rules in the Specify phase.

## Goal

Define the required behavior before planning starts.

## Apply these skills in this order

1. `openspec-codex-skill`
2. `speckit-codex-skill`
3. `bmad-codex-skill`

## Must do

- write the problem in plain language
- separate goals from non-goals
- express behavior changes in explicit delta specs
- run clarify before planning
- use scenarios and acceptance outcomes that another team can test
- keep implementation detail out unless it is a hard requirement

## Avoid

- turning the spec into a design doc
- vague requirements
- requirements with no acceptance behavior
- scope creep hidden inside "nice to have" detail

## Required outputs

- `proposal.md`
- delta specs with `ADDED`, `MODIFIED`, and `REMOVED`
- clarification notes
- checklist or readiness result

## Exit gate

Move to Plan only when:

- major behavior changes are testable
- important ambiguity is resolved or tracked
- Product and engineering both understand the spec
- the team agrees planning can start without guessing
