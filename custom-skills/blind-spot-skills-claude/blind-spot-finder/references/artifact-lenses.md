# Lenses by artifact type

Same engine, different emphasis. Read the section that matches, skim the
others only if the artifact is hybrid (e.g., a proposal that contains a design).

## Plan / strategy
Emphasise: dependencies outside the author's control, sequencing and critical
path, ownership per workstream, incentives of the people who must act, success
metrics and how they will be measured, reversibility, what "done" means,
what happens if adoption is partial.
Typical blind spot: the plan describes actions but not who is accountable
when two workstreams conflict.

## Task
Emphasise: definition of done, inputs and where they come from, outputs and
who consumes them, hidden prerequisites, owner, failure states, what to do if
blocked, whether completing the task actually achieves the outcome it was
created for.
Typical blind spot: the task is completable without the goal being met.

## Decision
Emphasise: options not on the table, reversibility and cost of being wrong,
who bears the consequences, what evidence would change the decision, timing
("why now?"), what is being traded away, who is not in the room.

## Idea
Emphasise: problem validation (is the problem real and felt?), alternatives
including "do nothing", feasibility, incentives to adopt, unintended
consequences, why now, what would kill it early.

## Technical design / architecture
Emphasise: boundaries and contracts, producers and consumers, failure modes
and partial failure, scalability, operability (observability, on-call,
runbooks), security and trust boundaries, migration and backward
compatibility, data lifecycle, ownership of shared components, evolution of
contracts over time.
Typical blind spot: the target state is described; the path from the current
state is not.

## PRD / product proposal
Emphasise: whose problem, evidence for the problem, non-goals, edge users,
support and operations burden, metrics that could be gamed, rollout and
rollback, dependencies on other teams, what changes for existing users.

## Spec (spec-driven development)
Read `spec-blind-spots.md`. Emphasis shifts to what an implementer — often an
AI agent — will silently decide because the spec did not.

## Article / post
Emphasise: unsupported claims, the strongest counterargument, audience
assumptions, ambiguity a hostile reader would exploit, misleading
simplifications, missing perspectives, what an expert in the field would
object to first, what the author would be embarrassed not to have addressed.

## Paper / research
Emphasise: methodology, evidence quality, alternative explanations, selection
and survivorship bias, unstated assumptions, reproducibility, limitations,
generalisation beyond the sample, conflicts of interest.

## Proposal / business case
Emphasise: assumptions in the numbers, what happens if the key assumption is
off by 2×, who loses and will resist, hidden costs (maintenance, support,
training), opportunity cost, what the approver will ask that isn't answered.
