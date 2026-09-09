# Blind spots in specs (spec-driven development)

Read this when the artifact is a spec, requirements document, design
document, implementation plan, or task list produced in a spec-driven
development (SDD) workflow — Spec Kit's `spec.md` / `plan.md` / `tasks.md`,
Kiro's `requirements.md` / `design.md` / `tasks.md`, or any equivalent.

## Why specs need their own treatment

In SDD the spec is the source of truth and the implementer is often an AI
agent that will not stop to ask. Anything the spec leaves unsaid will be
**decided silently** during implementation, and the decision will look
deliberate. So the core question shifts from "what is missing?" to:

> What will the implementer decide on the author's behalf because the spec
> did not, and would the author have chosen the same?

A second shift: specs are usually part of a chain (spec → plan → tasks →
code → tests). Blind spots hide in the **gaps between links**, not only inside
one document. When more than one link is available, analyse the joints.

## Step 0 additions for specs

Ask or extract:
- Which SDD flavour and stage is this? (spec only / spec + plan / tasks generated / already partly implemented)
- Is there a constitution, coding standard, or project-level constraints file the implementer will also read? If yes, treat it as part of the frame.
- Which existing code, APIs, or data does the spec assume the implementer knows about?
- Has any spec item already been marked "clarify later"? Those are declared unknowns, not blind spots.

## Lenses specific to specs

**Silent decisions.** For every requirement, ask what an implementer must
choose to satisfy it that the spec does not fix: defaults, ordering, limits,
naming, error text, formats, timezone, locale, rounding, pagination, retry.
Report only those where the wrong choice would be visible to a user or costly
to reverse.

**Testability of acceptance criteria.** Each criterion should be checkable
without asking the author. Flag criteria that use "appropriately", "fast",
"secure", "user-friendly", "handles errors gracefully" without a measure.

**Unhappy paths.** Specs describe the happy path richly. Ask what happens on
missing, duplicated, delayed, malformed, oversized, unauthorised, concurrent,
or partial input, and on downstream failure. Report the ones the domain makes
likely, not all of them.

**Data and contracts.** What is created, changed, deleted, retained, migrated?
Who else reads or writes it? What breaks if the shape changes?

**Non-functional requirements.** Performance, scale, availability,
observability, security, privacy, accessibility, cost. Absent NFRs become
implementer defaults.

**Existing-system assumptions.** The spec assumes things about the current
codebase, infra, or team conventions. Which of those are ASSUMED rather than
KNOWN?

**Scope edges.** Is "out of scope" stated, or merely not mentioned? An AI
implementer may helpfully build the unmentioned thing.

**Chain consistency (when plan/tasks exist).**
- Requirements with no task that implements them.
- Tasks with no requirement that justifies them (scope creep already happened).
- Design decisions that contradict a requirement.
- Task ordering that violates a dependency in the design.
- Acceptance criteria with no test task.

**Definition of done for the feature, not the tasks.** All tasks complete ≠
outcome achieved. State what would prove the feature did its job.

## Spec-specific premortem prompts (use in `agents/premortem.md`)

- "It was implemented exactly as written. The stakeholder said 'that's not what I meant'. What did they mean that the spec never said?"
- "All tasks passed review and all tests are green. The feature is unusable in production. Why?"
- "A second engineer implemented the same spec independently. Where do the two implementations differ?" — every difference is a silent decision.

## Spec-specific outsider personas

Choose from: the on-call engineer at 3 a.m., the QA engineer writing test
cases from the spec alone, the security reviewer, the person who owns the
downstream system, the product owner reading the shipped result, the
engineer who inherits this in a year.

## Additional output sections for specs

Insert after "Top Blind Spots":

```markdown
## Silent Decisions the Implementer Will Make
| Requirement | Decision left open | Likely default | Acceptable? | Disposition |
|---|---|---|---|---|

## Untestable Acceptance Criteria
| Criterion (as written) | Why it can't be checked | Proposed measurable version |
|---|---|---|

## Chain Gaps (only when plan/tasks are present)
- Requirement without task: ...
- Task without requirement: ...
- Criterion without test: ...
```

## Disposition guidance for specs

- RESOLVE means: edit the spec (or add a clarification item) **before** tasks are generated. In SDD, resolving after implementation is the expensive path.
- ASSUME means: write the assumption into the spec's assumptions section so the implementer reads it — an assumption that lives only in the analysis is worthless.
- OUT OF SCOPE means: add it to the spec's non-goals so the implementer does not build it.
- ACCEPT RISK is rarely right for silent decisions with user-visible impact.

## Verdict for specs

Use the standard verdict, plus one line:
"Ready for task generation: yes / after resolving #… / no."
