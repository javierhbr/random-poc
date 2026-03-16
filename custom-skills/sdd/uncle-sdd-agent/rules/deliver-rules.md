# Deliver Rules

Use these rules in the Deliver phase.

## Goal

Execute the plan in controlled slices through code, review, verification,
deploy, and archive.

## Apply these skills throughout delivery

- `sdd-bmad` for implementation and review support
- `sdd-openspec` for apply and archive
- `sdd-speckit` for task discipline and phased delivery

## Default slice flow

1. Build
2. Create PR
3. Review PR
4. Verify
5. Deploy
6. Archive

## Must do

- deliver in slices, not one large batch
- keep task status and artifacts current during execution
- create a PR for each reviewable slice or tightly related slice set
- include in the PR description which tier 1 (`must_change_together`) dependencies
  were verified as part of this slice
- include in the PR description which tier 2 (`watch_for_breakage`) consumers
  were checked after deploy
- keep story, epic, and platform issue links current
- collect validation evidence before closure
- coordinate deploy timing: confirm all tier 1 dependent components are ready
  before merging
- capture deploy and rollback notes when relevant
- archive the change package after delivery is complete
- at archive time, note whether any ownership boundary or dependency tier changed
  during delivery; if yes, flag `component-ownership-<name>.md` or
  `dependency-map.md` in the platform repo for update

## Avoid

- stale tasks or stale specs during execution
- delaying review until everything is finished
- deploying without resolved or tracked review feedback
- treating archive as optional cleanup
- merging tier 1 dependent changes without coordinating with the owning team

## Required outputs

- implemented slice
- PR and review results with tier 1/2 verification notes
- validation evidence
- deploy notes when needed
- archived change package
- final traceability from platform issue to story to PR
- archive note if ownership boundaries or dependency tiers changed

## Exit gate

Close the change only when:

- slices are complete or intentionally deferred
- review is complete
- validation evidence exists
- artifacts reflect delivered reality
- tier 1 dependency verification is recorded in the archive
- tier 2 consumer checks are noted when they were performed
- if an ownership boundary or dependency tier changed, the platform repo
  artifacts are flagged for update or already updated
- archive is done
