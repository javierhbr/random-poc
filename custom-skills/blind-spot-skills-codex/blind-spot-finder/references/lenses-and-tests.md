# Blind Spot Lenses and Adaptive Tests

Load this reference when deeper discovery is needed.

## Principle

Do not mechanically apply every lens. Select only those capable of materially changing the outcome.

## Framing

Ask:

- What does the artifact believe the problem is?
- What if the problem is framed incorrectly?
- Is the artifact optimizing the real constraint or a proxy?
- What alternative framing would materially change the decision?

## Assumptions

Look for things that must be true but are not established.

Ask:

- What must remain true for the plan to work?
- Which claims are treated as facts without evidence?
- Which assumptions concern adoption, timing, scale, data quality, availability, behavior, authority, or compatibility?

## Missing Actors and Perspectives

Consider only actors with meaningful consequences or influence:

- customer or user
- operator
- maintainer
- contributor
- downstream consumer
- upstream producer
- support
- security
- product
- finance
- legal/compliance
- future owner
- newcomer
- adversarial actor

Ask:

- Who experiences the consequences but is absent from the artifact?
- Who does more work if this succeeds?
- Who can block, bypass, or undermine the intended behavior?

## Dependencies

Look for dependencies outside the author's direct control:

- people
- approvals
- data
- infrastructure
- vendors
- APIs
- timing
- adoption
- policy
- governance

Ask what happens when a dependency is late, unavailable, changed, or only partially reliable.

## Inputs, Outputs, Producers, Consumers

For important inputs:

- Who produces them?
- What guarantees exist?
- What if those guarantees are violated?

For important outputs:

- Who consumes them?
- What semantics do consumers rely on?
- What happens if shape, timing, ordering, availability, or meaning changes?

## Failure and Edge Conditions

Use only relevant conditions:

- missing
- malformed
- duplicate
- stale
- delayed
- reordered
- partial
- conflicting
- malicious
- unexpectedly large
- dependency unavailable
- retry
- timeout
- rollback

## Evidence

Separate:

- supported fact
- plausible inference
- explicit assumption
- unknown

Ask:

- What conclusion depends on weak evidence?
- What alternative explanation fits the same evidence?

## Ambiguity

Ask:

- Could two competent readers interpret this differently?
- Which terms lack observable meaning?
- Which words hide a decision: scalable, fast, reliable, secure, simple, soon, seamless, supported?

## Incentives and Human Behavior

Ask:

- Who benefits?
- Who loses?
- Who must change behavior?
- Why would they adopt this?
- How can they bypass it?
- What local incentive conflicts with the intended outcome?

## Ownership and Governance

Ask:

- Who owns the decision?
- Who can change the contract?
- Who approves exceptions?
- Who handles escalation?
- Who owns lifecycle and maintenance?

## Second-Order Effects

Ask:

- If this works, what happens next?
- What new dependency or burden appears?
- Does success create governance, cost, support, scale, or maintenance problems?

## Reversibility

Ask:

- What becomes expensive to undo?
- Which decisions are one-way doors?
- Which assumption deserves stronger evidence because reversal is costly?

## Scope

Distinguish accidental omission from deliberate exclusion.

A concern is not a blind spot simply because it is out of scope. It becomes important when the scope boundary is unstated, contradictory, or creates hidden dependencies.

# Adaptive Premortems

Do not use the same premortem everywhere.

## Idea

> Imagine the idea was pursued and did not solve the real problem. What did we misunderstand?

## Plan

> Imagine the plan was executed as written but the desired outcome was not achieved. What was missing?

## Task

> Imagine the task was marked complete, but the desired outcome wasn't achieved. What was missing?

## Article / Post

> Imagine knowledgeable readers strongly reject, misunderstand, or challenge the article. What did the author overlook?

## Research / Paper

> Imagine credible reviewers challenge the conclusions. Which assumption, methodology choice, evidence gap, alternative explanation, or limitation was overlooked?

## Technical Design

> Imagine the implementation matches the design but creates operational, security, scalability, organizational, or maintenance problems. What did the design fail to consider?

## Decision

> Imagine the decision looked reasonable today but later produced the wrong outcome. Which assumption turned out to be false?

# Success Stress Test

Ask:

> What happens if this succeeds much more than expected?

Inspect scale, adoption, cost, governance, maintenance, support, ownership, downstream effects, and incentive changes.

# Outsider Test

Ask:

> What would a smart outsider ask that the author would be surprised they had not considered?

Then:

> What would make someone say, “This looks great, but what about ___?”

Prefer one to three questions that could actually change the decision.
