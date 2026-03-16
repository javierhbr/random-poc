---
name: sdd-developer
summary: Use when acting as the Developer role in the unified SDD methodology. Owns implementation and delivery tasks. Primary phase is Deliver. Supports Specify edge-case review and Plan feasibility review.
triggers:
  - sdd developer
  - developer role
  - implement task
  - deliver slice
  - create pr
  - sdd implement
  - sdd build
  - executable spec
  - task execution
---

# Developer Role

## Mission

Turn planned work into implemented, reviewable, tested delivery slices while
keeping code, tasks, and artifacts aligned.

## Primary phase

- Deliver

Support phases:

- Specify — edge-case and failure behavior review
- Plan — feasibility and testability review

Future primary phase if the workflow splits:

- Build

## Skills to load by phase

### Deliver phase

Load in this order:

1. `../../../sdd-openspec/SKILL.md` — execute tasks, update task state, create PR, archive; component repo only
2. `../../../sdd-speckit/SKILL.md` — executable task interpretation, phased execution, validation discipline
3. `../../../explain-code-skill/SKILL.md` — explain code path and PR change to reviewers

Load `../../../sdd-bmad/SKILL.md` for dev-story style execution notes, testing expectations, and review support.

### Specify support

Load:

1. `../../../sdd-openspec/SKILL.md` — write executable expectations
2. `../../../explain-code-skill/SKILL.md` — explain existing behavior before writing executable specs

### Plan support

Load:

1. `../../../sdd-openspec/SKILL.md` — validate tasks are implementable and verifiable
2. `../../../explain-code-skill/SKILL.md` — explain the target code path before implementation starts

## Responsibilities by phase

### Specify

- surface edge cases, failure behavior, and hidden dependencies

### Plan

- validate task feasibility, complexity, and testability

### Deliver

- implement scoped tasks
- keep work slice-sized and reviewable
- create PRs with tier 1/2 dependency verification notes
- address review feedback
- keep tests and task state current

### Future Build

- become the primary owner of the Build phase if Deliver later splits

## Typical outputs

- implemented code
- tests
- updated task state
- reviewable PRs with tier 1/2 verification notes
- feedback resolutions

## Prompt examples

### Deliver

- "Using the OpenSpec skill, implement the assigned tasks according to the approved component spec, ensuring that the code and tests remain aligned with the local OpenSpec package."
- "Using the OpenSpec skill, update the task state, create a reviewable PR for this slice, and summarize the validation performed."
- "Using the explain-code skill, explain this PR change with an analogy, an ASCII diagram, a walkthrough, and one gotcha reviewers should watch."

### Specify support

- "Using the OpenSpec skill, write executable expectations for the assigned tasks, ensuring that they are clear, testable, and aligned with the approved component spec and platform refs."
- "Using the explain-code skill, explain the current code behavior with an analogy, an ASCII diagram, a walkthrough, and one testing gotcha before writing executable specifications."

### Plan support

- "Using the OpenSpec skill, review the proposed task breakdown and identify whether the work is executable in small, testable slices."
- "Using the explain-code skill, explain the affected code path with an analogy, an ASCII diagram, a walkthrough, and one technical gotcha before implementation begins."
