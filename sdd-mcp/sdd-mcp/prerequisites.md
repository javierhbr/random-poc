# Prerequisites by Role and Phase

## Before running /speckit.constitution

- [ ] `specify init` has been run in the Platform Repo
- [ ] `specify check` passes
- [ ] You have the Platform MCP policy document (or you are creating it now)
- [ ] Domain boundaries have been discussed (even informally)

---

## Before running /speckit.specify (Platform Spec)

- [ ] Constitution exists at `.specify/memory/constitution.md` and is non-empty
- [ ] MCP Router has generated a Context Pack for this initiative
  - Context Pack file exists at `.specify/memory/context-<initiative-id>.md`
- [ ] Initiative ID is defined (e.g., ECO-124)
- [ ] Product Manager has written the Initiative (Epic) with business goals + success criteria

---

## Before running /speckit.clarify

- [ ] Platform Spec (spec.md) exists for this initiative
- [ ] You have NOT yet run /speckit.plan

---

## Before running /speckit.plan (Component Plan)

- [ ] All ADRs surfaced by /speckit.clarify are either:
  - Approved, OR
  - In Review with an owner assigned (not just "open")
- [ ] Platform Spec has passed a review (PM + Platform Architect sign-off)

---

## Before running /speckit.analyze (Gate Validation)

- [ ] plan.md and contracts/ exist (output of /speckit.plan)
- [ ] Every spec section has a `Source:` declaration

---

## Before fan-out to Component Repos

- [ ] /speckit.analyze PASS on all 5 gates
- [ ] Fan-out tasks include: component_repo, platform_spec_id, context_pack_version, contract_change, blocked_by

---

## Before writing a Component Spec (OpenSpec)

- [ ] You have received a fan-out task from the Platform Repo
- [ ] The task includes the Platform Spec ID + version
- [ ] The task includes the Context Pack version
- [ ] Any `blocked_by` ADRs in your task are resolved (Approved)

---

## Before running /speckit.implement in a Component Repo

- [ ] Component Spec exists with all required metadata fields:
  - `implements`, `context_pack`, `contracts_referenced`, `blocked_by`, `status`
- [ ] /speckit.analyze has passed Gate 5 (Ready-to-Implement) at the component level
- [ ] `spec-graph.json` has been updated with this component's links

---

## Before merging a PR

- [ ] `spec-graph.json` updated
- [ ] All gate statuses are PASS in the spec
- [ ] No open `BlockedBy` ADRs
