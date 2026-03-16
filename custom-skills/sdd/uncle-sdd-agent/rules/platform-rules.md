# Platform Rules

Use these rules in the Platform phase.

## Goal

Define durable context that later changes can reuse.

## Apply these skills in this order

1. `speckit-codex-skill`
2. `openspec-codex-skill`
3. `bmad-codex-skill`

## Must do

- define explicit and testable platform principles (including rules O-1, O-2, O-3)
- keep stable context separate from change-specific detail
- encode durable context in reusable project config
- define the default role model for later phases
- define where canonical platform truth lives
- define the platform versioning and durable ref model for component repos
- define the JIRA hierarchy or issue-link conventions for platform and component work
- keep the baseline small enough that teams can follow it
- write one `ownership/component-ownership-<name>.md` per component — records
  what each component owns and does NOT own, plus published and consumed contracts
- write `ownership/dependency-map.md` — records tier 1 / tier 2 / tier 3
  relationships with JIRA implications for each tier
- seed `ownership/glossary.md` — defines shared terms with "what it is NOT"
  clauses using language from the constitution and brownfield review

## Avoid

- stuffing temporary ticket details into platform rules
- writing vague principles that nobody can enforce
- over-designing the platform baseline before teams use it
- leaving ownership, dependencies, or shared terms undefined before Assess begins

## Required outputs

- constitution or principles document (including rules O-1, O-2, O-3)
- reusable OpenSpec config
- shared role map
- common language for quality and documentation
- platform versioning and ref conventions
- alignment-ready templates and issue-link conventions
- `ownership/component-ownership-<name>.md` for each component
- `ownership/dependency-map.md` with all relationships and their impact tier
- `ownership/glossary.md` seeded with shared terms

## Exit gate

Move to Assess only when:

- durable rules are explicit
- role ownership is clear
- reusable context exists for future changes
- component ownership boundary files exist for each component
- dependency map is written with tiers assigned
- shared glossary is seeded
