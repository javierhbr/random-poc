# Iteration 2 Playbook

## Purpose

This playbook turns Iteration 2 of the unified SDD methodology into a simple,
practical guide for teams.

Iteration 2 covers the remaining two phases:

1. Plan
2. Deliver

The purpose of Iteration 2 is to turn a strong spec package into safe,
phased execution through implementation, pull request review, verification,
deploy, and archive.

## How to use this playbook

Use this document after Iteration 1 is working consistently.

- start `Plan` only when `Specify` is ready
- run `Deliver` only when the plan is strong enough to execute without guesswork
- keep delivery incremental, reviewable, and traceable back to the spec
- keep platform version, JIRA chain, and local OpenSpec artifacts aligned through delivery

The rule is simple:

- do not deliver from a weak plan
- do not close a change until verification and archive are complete

## Iteration 2 at a glance

```text
[PLAN]
  turn the approved spec into technical execution
        |
        v
[DELIVER]
  build + create PR + review PR + verify + deploy + archive
        |
        v
Change complete
```

## Phase 4: Plan

### Phase flow

```text
[Approved spec package]
  proposal + delta specs + clarification notes + checklist result
            |
            v
[Architect owns planning]
  Support: Team Lead + Developers + Product
            |
            +--> BMAD: architect role, planning depth, implementation framing
            +--> OpenSpec: draft design.md and tasks.md
            +--> Speckit: apply plan and task discipline
            |
            v
[Implementation-ready plan]
  design + ADRs when needed + tasks + delivery slices
            |
            v
Ready for Deliver
```

### 1. Main objectives and outcomes

Objectives:

- convert the approved spec into a technical execution plan
- make dependencies, architecture choices, and testing strategy explicit
- break implementation into safe, reviewable delivery slices

Outcomes:

- a technical design that maps back to the spec
- tasks that are executable and verifiable
- ADRs when the change introduces a meaningful technical decision
- a delivery plan that is ready for execution and review

### 2. Concepts and activities to learn and apply

Core concepts:

- technical planning after spec approval
- traceability from spec to design to tasks
- required work vs optional improvement
- phased implementation instead of one large release
- design decisions documented only when they matter

Main activities:

- review the approved spec and confirm planning boundaries
- design the architecture, data flow, interfaces, and testing strategy
- identify integrations, dependencies, failure modes, and rollout concerns
- document ADRs when a new pattern or major tradeoff is introduced
- break the work into ordered tasks and delivery slices that can be reviewed safely
- map tasks to stories and keep platform refs visible in the plan

### 3. Agent roles and responsibilities

Human roles:

- Architect owns the phase and approves the technical plan
- Team Lead checks execution readiness, sequencing, and slice boundaries
- Developers validate feasibility, hidden complexity, and task quality
- Product confirms the plan still matches the approved intent

Agent roles:

- BMAD Architect agent helps choose planning depth and structure the design
- OpenSpec design agent drafts `design.md` and `tasks.md`
- Speckit plan and task agents check completeness, traceability, and execution quality

### 4. Skills used and how they are applied

- `bmad-codex-skill`
  - use first to select the right planning depth and apply architect-style reasoning
  - use it to keep the plan progressive and scoped to the approved change
- `openspec-codex-skill`
  - use second to create or refine `design.md` and `tasks.md`
  - use it to keep artifacts aligned with the change package
- `speckit-codex-skill`
  - use third to enforce plan and task quality
  - use it to ensure the plan is executable and the tasks are traceable

### 5. Rules that govern interactions and outputs

Apply these rules:

- `speckit-codex-skill/rules/plan-rules.md`
  - include architecture, modules, data flow, integration points, operational concerns, and testing strategy
  - map major technical choices back to the spec
- `speckit-codex-skill/rules/task-rules.md`
  - tasks must be specific, sequential when needed, easy to validate, and traceable
- `openspec-codex-skill/rules/artifact-rules.md`
  - design must explain why the chosen solution is preferred
  - tasks must be narrow, testable, and dependency-aware
- `bmad-codex-skill/rules/artifact-rules.md`
  - planning artifacts must include assumptions, constraints, risks, success criteria, and implementation implications

### 6. Expected artifacts and deliverables

Expected outputs:

- `design.md`
- `tasks.md`
- ADRs when the change introduces a significant technical decision
- dependency and rollout notes
- delivery slices with clear sequencing
- pull request strategy or review grouping notes when the change is non-trivial
- finalized `platform-ref.yaml`
- finalized `jira-traceability.yaml`
- task-to-story mapping

### 7. Criteria for moving to the next phase

Move to `Deliver` when:

- the design is understandable by the delivery team
- every major technical choice maps back to the spec
- tasks are executable without large hidden gaps
- dependencies, risks, and validation needs are visible
- the team agrees the work can be delivered in controlled slices
- stories or story groups are clear enough to support reviewable PRs

### 8. Potential challenges and mitigation strategies

- Challenge: the plan drifts away from the approved spec
  - Mitigation: trace every major decision back to a requirement or clarification
- Challenge: tasks are too large or vague
  - Mitigation: rewrite tasks so each one has a target, action, and validation step
- Challenge: planning becomes architecture theater
  - Mitigation: document only the design depth justified by the change size and impact
- Challenge: the team forgets rollout and failure modes
  - Mitigation: treat operational concerns and testing strategy as required sections

### 9. Feedback and iteration process

- compare planned slices with actual delivery behavior
- track where missing design details caused delivery slowdowns
- collect examples of strong and weak tasks from the first executions
- refine task granularity and design templates after each retro

## Phase 5: Deliver

### Phase flow

```text
[Implementation-ready plan]
  design + tasks + delivery slices
            |
            v
[Team Lead owns delivery]
  Support: Developers + QA / Validation + Architect + Product
            |
            +--> BMAD: dev-style execution support and implementation notes
            +--> OpenSpec: apply tasks, update artifacts, archive the change
            +--> Speckit: keep tasks explicit, phased, and verifiable
            |
            v
[Controlled delivery]
  Build -> Create PR -> Review PR -> Verify -> Deploy -> Archive
            |
            v
Completed and archived change package
```

### 1. Main objectives and outcomes

Objectives:

- execute the approved tasks in controlled slices
- make each slice reviewable through an explicit pull request
- verify behavior, quality, and release readiness
- deploy safely and close the change package cleanly

Outcomes:

- implemented tasks with verification evidence
- reviewed pull requests with resolved feedback
- updated artifacts that still match the delivered reality
- a deployed change with rollback awareness
- an archived change package that becomes delivery history

### 2. Concepts and activities to learn and apply

Core concepts:

- phased execution over big-bang delivery
- reviewable pull requests as a delivery gate
- artifact updates during execution
- verification before closure
- deploy as part of delivery, not an afterthought
- archive as the final promotion of the new truth

Main activities:

- implement tasks in the agreed slice order
- create a pull request for each delivery slice or tightly related slice set
- run review with the right reviewers before deploy
- update artifacts when execution reveals better information
- collect validation evidence continuously
- coordinate deploy timing, dependencies, and rollback readiness
- archive the change when it is truly complete
- keep story, PR, and platform alignment links current as work moves

### 3. Agent roles and responsibilities

Human roles:

- Team Lead owns the phase and coordinates the full delivery flow
- Developers implement the scoped tasks and update task status
- Developers create pull requests and address review feedback
- Team Lead ensures the right reviewers are assigned and review happens on time
- QA / Validation collects evidence and checks release readiness
- Architect supports design integrity and technical decisions during execution
- Product supports business decisions, acceptance, and release tradeoffs

Agent roles:

- BMAD Dev agent supports implementation framing, tests, and story-level execution notes
- BMAD QA / review agent supports code-review checklists and review findings
- OpenSpec apply/archive agent keeps the change package current through execution and closure
- Speckit task/implement discipline keeps slices explicit, reviewable, and validated

### 4. Skills used and how they are applied

- `bmad-codex-skill`
  - use first for implementation framing, testing expectations, and dev-story style support
  - use it when delivery teams need role-based execution guidance and review framing
- `openspec-codex-skill`
  - use second for `/opsx:apply` during execution and `/opsx:archive` at closure
  - use it to keep artifacts and implementation state aligned
- `speckit-codex-skill`
  - use throughout delivery to keep tasks narrow, phased, and verifiable
  - use it to resist large vague implementation jumps

### 5. Rules that govern interactions and outputs

Apply these rules:

- `speckit-codex-skill/rules/task-rules.md`
  - each task must remain specific, reviewable, and easy to validate
  - avoid vague or mixed-concern execution steps
- `openspec-codex-skill/rules/artifact-rules.md`
  - keep artifacts consistent with the current reality
  - prefer incremental, reviewable change sets
- `bmad-codex-skill/rules/artifact-rules.md`
  - execution outputs should preserve scope, tests, acceptance criteria, and implementation implications

Apply these additional review expectations:

- each delivery slice should produce one reviewable pull request unless there is a clear reason to batch more work
- PR descriptions should reference the change package, affected tasks, story keys, and validation performed
- review feedback must be resolved or explicitly deferred before deploy

### 6. Expected artifacts and deliverables

Expected outputs:

- completed task list with status
- pull request links or references for delivered slices
- review feedback and resolution notes when needed
- implementation notes where needed
- validation evidence and test updates
- rollout or rollback notes when relevant
- archived change package
- updated story and epic links
- final traceability from platform issue to component epic to story to PR

### 7. Criteria for moving to the next phase

Deliver is the final phase in v1.

Close the change only when:

- the planned slices are complete or intentionally deferred
- pull requests have been reviewed and review feedback is resolved or tracked
- validation evidence is recorded
- key artifacts reflect what was actually delivered
- deploy decisions and rollback notes are captured when relevant
- the change package is archived
- the JIRA and platform alignment chain reflects the delivered reality

### 8. Potential challenges and mitigation strategies

- Challenge: delivery becomes one big implementation batch
  - Mitigation: enforce slice-based execution and review after each slice
- Challenge: pull requests are too large to review safely
  - Mitigation: reduce slice size and align PRs to task boundaries
- Challenge: artifacts go stale during execution
  - Mitigation: update the change package as part of normal task completion
- Challenge: verification happens too late
  - Mitigation: collect evidence during delivery, not only at the end
- Challenge: review feedback is ignored or delayed
  - Mitigation: treat review resolution as a required step before deploy
- Challenge: archive is skipped
  - Mitigation: treat archive as a required closure step, not optional cleanup

### 9. Feedback and iteration process

- compare planned slices with actual delivery sequence
- review pull request size, review turnaround, and repeated review findings
- review where deployment issues came from weak planning or weak execution discipline
- collect evidence on which tasks were too large or hard to validate
- refine slice size, validation steps, and archive habits after each retro

## Future option: split Deliver into Build and Deploy

Keep `Deliver` as one phase in v1. Split it later only if release complexity
demands it.

Split `Deliver` into `Build` and `Deploy` when:

- release coordination becomes a major activity of its own
- multiple teams must align on rollout timing
- deploy and rollback decisions require formal review
- implementation can finish well before release readiness

```text
Current v1

  [PLAN] -> [DELIVER]
              |
              +--> Build
              +--> Create PR
              +--> Review PR
              +--> Verify
              +--> Deploy
              +--> Archive


Future option

  [PLAN] -> [BUILD] -> [DEPLOY]
                |          |
                |          +--> release coordination
                |          +--> rollout / rollback control
                |          +--> archive
                |
                +--> implementation
                +--> verification
```

## What success looks like after Iteration 2

Iteration 2 is successful when teams can do the following consistently:

- create plans that are clear enough to execute without major guessing
- deliver work in slices instead of large uncontrolled batches
- use pull requests as a normal review and coordination gate for each slice
- keep artifacts, execution, verification, and archive aligned

At that point, the full 5-phase methodology is working in practice.
