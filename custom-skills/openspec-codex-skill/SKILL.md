---
name: openspec-sdd
summary: Use this skill for spec-driven development with OpenSpec, including proposing changes, generating and updating artifacts, applying tasks, archiving completed changes, configuring context and rules, and customizing schemas.
triggers:
  - openspec
  - opsx
  - spec-driven development
  - sdd
  - proposal.md
  - design.md
  - tasks.md
  - delta specs
  - openspec/config.yaml
  - schema.yaml
  - /opsx:propose
  - /opsx:apply
  - /opsx:archive
---

# OpenSpec Spec-Driven Development

Use this skill when the user wants to:
- use OpenSpec or OPSX commands correctly
- plan work before implementation
- create or refine `proposal.md`, `design.md`, `tasks.md`, or delta specs
- set up `openspec/config.yaml`
- add project context or per-artifact rules
- customize a schema or fork `spec-driven`
- explain OpenSpec workflows to another coding agent

## Layer 1 — Core operating rules

1. Treat OpenSpec as a **spec-first workflow**.
   - Align on the change before touching implementation.
   - Prefer artifacts that clarify scope, behavior, approach, and task order.

2. Think in **actions, not locked phases**.
   - You can move forward and backward between proposal, specs, design, and tasks.
   - Update earlier artifacts whenever implementation reveals better information.

3. Keep the **source of truth** explicit.
   - Main specs describe the current system behavior.
   - Change folders describe proposed deltas.
   - Archive merges approved deltas back into main specs.

4. Use the right command for the job.
   - Use `/opsx:explore` for thinking and discovery.
   - Use `/opsx:propose` for the default quick path.
   - Use `/opsx:new`, `/opsx:continue`, and `/opsx:ff` only when the expanded workflow is enabled.
   - Use `/opsx:apply` to implement tasks while updating artifacts as needed.
   - Use `/opsx:archive` after the change is complete.

5. Prefer **project config over ad hoc instruction drift**.
   - Put stable project context in `openspec/config.yaml`.
   - Put artifact-specific constraints in `rules:`.
   - Keep context concise enough to stay useful and maintainable.

6. Write artifacts so another agent can execute them.
   - Requirements should be concrete and testable.
   - Design should record decisions, tradeoffs, and affected systems.
   - Tasks should be actionable, ordered, and easy to verify.

## Layer 2 — Execution workflow

### A. Default quick path
Use this when the user wants the normal OpenSpec flow.

1. Clarify the change goal.
2. Create or update the change with `/opsx:propose`.
3. Review generated artifacts:
   - `proposal.md`
   - `specs/` delta specs
   - `design.md`
   - `tasks.md`
4. Refine artifacts if scope, requirements, or design need changes.
5. Implement with `/opsx:apply`.
6. Validate the change.
7. Archive with `/opsx:archive`.

### B. Expanded workflow
Use this only when the project has enabled the expanded profile.

1. `/opsx:explore` for investigation or framing.
2. `/opsx:new` to scaffold a change only.
3. `/opsx:continue` to generate the next missing artifact.
4. `/opsx:ff` to fast-forward planning artifacts.
5. `/opsx:apply` to implement tasks.
6. `/opsx:verify` or project validation steps when relevant.
7. `/opsx:sync` if the workflow uses sync.
8. `/opsx:archive` when done.

### C. Artifact decision rules

#### When to write a proposal
Write or refine `proposal.md` when the user needs:
- problem framing
- goals and non-goals
- rollout or rollback thinking
- affected scope and stakeholders

#### When to write delta specs
Write `specs/` deltas when the user is changing behavior.
Use explicit sections such as:
- `ADDED Requirements`
- `MODIFIED Requirements`
- `REMOVED Requirements`

Each requirement should include scenarios in a concrete format, preferably Given/When/Then.

#### When to write design
Write `design.md` when the change needs:
- architecture decisions
- data flow or sequence explanation
- tradeoffs
- interfaces, dependencies, risks, or rollout design

#### When to write tasks
Write `tasks.md` when implementation must be broken into verifiable steps.
Tasks should:
- be small enough to complete predictably
- map back to requirements or design decisions
- include validation where useful

### D. Config and rules pattern
Use `openspec/config.yaml` for durable project guidance.

Recommended pattern:
- `schema:` selects the default workflow schema
- `context:` stores shared project conventions
- `rules:` adds per-artifact guidance

When asked to generate config:
1. capture stable tech stack and conventions in `context:`
2. keep artifact rules scoped under `rules:`
3. avoid stuffing ephemeral ticket details into config
4. prefer schema defaults unless the team truly needs a custom workflow

### E. Custom schema workflow
Use a custom schema only when the default schema is not enough.

1. Start from the built-in `spec-driven` schema.
2. Fork it into `openspec/schemas/<name>/`.
3. Modify `schema.yaml` only for real workflow differences.
4. Modify templates to shape output quality.
5. Keep custom workflows understandable to both humans and agents.

## Layer 3 — References

- Architecture and lifecycle: `references/openspec-overview.md`
- Commands and workflow mapping: `references/commands-and-workflows.md`
- Config, rules, and schemas: `references/config-and-customization.md`
- Artifact writing guide: `references/artifact-authoring.md`
- Source notes: `references/sources.md`
- Reusable project rules: `rules/project-config-template.yaml`
- Reusable artifact rules: `rules/artifact-rules.md`

## Response behavior when applying this skill

When you use this skill in an answer:
- identify whether the user needs explore, propose, apply, archive, or customization help
- keep terminology aligned with OpenSpec artifacts and commands
- produce concrete artifact content, not vague theory
- distinguish current specs from delta specs
- recommend config and rules when conventions should persist across future changes
- mention whether the advice assumes the default `core` profile or an expanded profile
