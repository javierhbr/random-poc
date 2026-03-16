# Specify Rules

Use these rules in the Specify phase.

## Goal

Define the required behavior before planning starts.

## Apply these skills in this order

1. `openspec-codex-skill`
2. `speckit-codex-skill`
3. `bmad-codex-skill`

## Must do

- read `ownership/glossary.md` before writing `proposal.md` — all terms in goals
  and acceptance criteria must appear in the glossary; add missing terms before
  the proposal is approved (rule O-2)
- confirm the owning component from `ownership/component-ownership-<name>.md`
  before writing delta specs — scope must stay within the component's boundary
- write the problem in plain language using only glossary terms
- separate goals from non-goals
- express behavior changes in explicit delta specs
- keep platform version and platform refs visible in the component spec context
- decide whether the change updates only component truth or also shared platform truth
- record `alignment_notes.glossary_terms_used` in `platform-ref.yaml`
- run clarify before planning
- use scenarios and acceptance outcomes that another team can test
- keep implementation detail out unless it is a hard requirement

## Avoid

- turning the spec into a design doc
- vague requirements
- requirements with no acceptance behavior
- scope creep hidden inside "nice to have" detail
- using terms in the proposal that are not in the shared glossary

## Required outputs

- `proposal.md`
- delta specs with `ADDED`, `MODIFIED`, and `REMOVED`
- clarification notes
- checklist or readiness result
- confirmed `platform-ref.yaml` including `alignment_notes.glossary_terms_used`
- updated `jira-traceability.yaml`
- linked platform delta when shared truth changes

## Exit gate

Move to Plan only when:

- major behavior changes are testable
- important ambiguity is resolved or tracked
- Product and engineering both understand the spec
- the team agrees planning can start without guessing
- all terms in the proposal and delta specs are in the shared glossary
- `platform-ref.yaml` includes `alignment_notes.glossary_terms_used`
