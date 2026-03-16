# Assess Rules

Use these rules in the Assess phase.

## Goal

Turn an incoming request into a scoped change package with the right next step.

## Apply these skills in this order

1. `bmad-codex-skill`
2. `openspec-codex-skill`
3. `speckit-codex-skill` only if routing is blocked by ambiguity

## Must do

- classify greenfield or brownfield
- classify size and impact separately
- classify the change as component-only, shared, or platform-rule adoption
- choose the lightest workflow that is still safe
- create or frame one change package
- read `ownership/component-ownership-<name>.md` to confirm the primary owning
  component before opening any JIRA epic (rule O-1)
- read `ownership/dependency-map.md` to determine impact tier for each affected
  relationship; record in `platform-ref.yaml` as `impact.must_change_together`,
  `impact.watch_for_breakage`, and `impact.adapts_independently`
- apply JIRA structure based on tiers:
  - tier 1 → open coordinated component epics immediately
  - tier 2 → add watch note in `alignment_notes`
  - tier 3 → no additional action
- identify affected platform refs and component repositories
- create the initial JIRA issue chain when the work is material enough to track
- identify the next artifact and owner
- call out unknowns explicitly

## Avoid

- jumping directly into plan or implementation
- mixing size and impact into one score
- hiding integration or architecture risks
- opening JIRA epics before confirming the correct owning component
- classifying impact without reading the dependency map

## Required outputs

- routed change package
- size and impact classification
- selected path depth
- next artifact
- known unknowns
- initial `platform-ref.yaml` with `ownership.primary_component` and `impact`
  tiers populated from the dependency map
- initial `jira-traceability.yaml` with JIRA issue chain derived from impact tiers

## Exit gate

Move to Specify only when:

- the change package exists
- the owner is clear
- the scope is bounded enough to specify
- the next artifact is obvious
- `platform-ref.yaml` impact tiers are populated from the dependency map
- JIRA epics for tier 1 dependencies are open or confirmed unnecessary
