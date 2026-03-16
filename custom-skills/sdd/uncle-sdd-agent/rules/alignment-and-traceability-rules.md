# Alignment and Traceability Rules

Use these rules across all phases when the platform has a master repository and
components have their own repositories.

## Goal

Keep shared platform truth canonical, keep component work aligned by version,
and keep JIRA traceability linked to the same change chain.

## Must do

- treat the platform master repository as the source of shared platform truth
- treat component repositories as the source of local implementation truth
- record platform version and platform refs in each affected component repository
- keep JIRA as the coordination layer, not the detailed spec store
- create linked platform and component changes when shared truth changes
- map tasks to stories and PRs to stories during planning and delivery
- keep the three durable ownership artifacts current in the platform repo:
  - `ownership/component-ownership-<name>.md` — ownership boundaries per component
  - `ownership/dependency-map.md` — impact tiers for all cross-component relationships
  - `ownership/glossary.md` — shared terms with "what it is NOT" clauses
- record impact tier fields in `platform-ref.yaml` at Assess time:
  - `ownership.primary_component`
  - `impact.must_change_together`
  - `impact.watch_for_breakage`
  - `impact.adapts_independently`
- record used glossary terms in `platform-ref.yaml` at Specify time:
  - `alignment_notes.glossary_terms_used`

## Avoid

- copying editable platform truth into component repositories
- updating shared truth only in a component repository
- putting the full requirements or design into JIRA descriptions
- opening delivery work with no platform version or issue chain
- letting ownership boundaries, dependency tiers, or glossary terms drift without
  flagging the platform repo artifacts for update at archive time

## Required outputs

- `platform-ref.yaml` with ownership and impact fields
- `jira-traceability.yaml`
- linked platform issue and component epic
- linked tasks, stories, and PRs
- archive note when ownership or tier changes occurred during delivery
